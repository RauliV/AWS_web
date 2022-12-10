/* eslint-disable no-mixed-spaces-and-tabs */
/* eslint-disable no-invalid-this */
/* eslint-disable no-undef */
import chai from 'chai';
import request from 'supertest';
import sinon from 'sinon';
import assert from 'assert';
import app from '../index.js';
import { indexFactory } from '../index.js';
import { gitFactory } from '../github.js';
import { workflowResponses } from './responses/workflows.js';
import { noDbResponses } from './responses/noDbResponse.js';
//import mysql from 'mysql';

function sleep(ms) {
    // eslint-disable-next-line no-promise-executor-return
    return new Promise(resolve => setTimeout(resolve, ms));
}

const expect = chai.expect;

const sandbox = sinon.createSandbox();

describe('GET /', function() {
	it('Receive "Good day, Sir!"', function(done) {
		request(app).get('/')
		.expect('Good day, Sir!')
		.expect(200, done);
	});
});

describe('GET /api/list', function() {
	this.timeout(5000);
	beforeEach(() => {
        sandbox.restore();
    });
	it('List all packages', async function() {
		const templatesStub = sandbox.stub(gitFactory, 'templateData').returns({'status': 200, 'statusText': 'OK', 'templates': ['TEMPLATE-1', 'TEMPLATE-2'], 'body': {}});
		const response = await request(app).get('/api/list');
		assert(templatesStub.calledOnce);
		expect(response.type).equal('application/json');
		expect(response.body.templates).deep.equal(['TEMPLATE-1', 'TEMPLATE-2']);
		expect(response.status).equal(200);
	});
});

describe('POST /api/build', async function() {
	this.timeout(5000);
	beforeEach(() => {
        sandbox.restore();
    });

	const buildParameters = {
		AWS_ACCESS_KEY_ID: 'These',
		AWS_SECRET_ACCESS_KEY: 'don\'t',
		AWS_REGION: 'matter for now (if these are not empty)'
	};

	it('Trigger package build action successfully', async function() {
		const fetchStub = sandbox.stub(indexFactory, 'triggerBuild').resolves({status: 204});
		const packageName = 'TEMPLATE-EC2';
		const buildOptions = {
			package: packageName,
			parameters: buildParameters,
		};

		const response = await request(app).post('/api/build').send(buildOptions);
		
		assert(fetchStub.calledOnce);
		expect(response.status).equal(200);
		expect(response.headers).to.include.keys(['content-type']);
		expect(response.headers['content-type']).to.include('application/json');
		expect(response.body).equal(`Triggered build action successfully - ${packageName}`);
	});
	// 422 = invalid/missing input, 404 = Not Found, 401 = Unauthorized
	const statuses = [422, 404, 401];
	for (const s of statuses) {
		it(`Fail when has invalid inputs, ${ s}`, async function() {
			
				const fetchStub = sandbox.stub(indexFactory, 'triggerBuild').resolves({status: s});
				const packageName = 'invalid-template';
				const buildOptions = {
					package: packageName,
					parameters: buildParameters,
				};
				
				const response = await request(app).post('/api/build').send(buildOptions);

				assert(fetchStub.calledOnce);
				expect(response.status).equal(s);
				expect(response.headers).to.include.keys(['content-type', 'connection', 'content-length', 'date', 'etag', 'x-powered-by']);
				expect(response.headers['content-type']).to.include('application/json');
				expect(response.body).equal(`Triggered build action failed - ${packageName}`);
		});
	}
});

//Troubles resolving db -url. Error: Port 8080 already open. (db in port 3306 though)
/*describe('POST /api/history', async function(){

	this.timeout(5000);
	beforeEach(() => {
        sandbox.restore();
    });
	console.log('okokokok');

	const db = mysql.createConnection(
		{
		  user: 'root',
		  host: 'db', // NAME OF DATABASE DOCKER CONTAINER DEFINED IN docker-compose.yml AS container_name
		  password: 'example',
		  database : 'build_history',
		  port: 3306
		}
	  );
	db.query('CREATE TABLE IF NOT EXISTS BUILDS (build_id BIGINT NOT NULL, timestamp TIMESTAMP, template_name VARCHAR(50), instance_name VARCHAR(50), build_success BOOL, error_message VARCHAR(50), PRIMARY KEY(build_id))');
	const values = `("1234567890", CURRENT_TIMESTAMP, "Test_package1", "Instance_name1, "1", "Error_message1")`;
    db.query(`INSERT INTO BUILDS(build_id, timestamp, template_name, instance_name, build_success, error_message) VALUES ${values}`);
	const values2 = `("0987654321", CURRENT_TIMESTAMP, "Test_package2", "Instance_name2", "1", "Error_message2")`;
    db.query(`INSERT INTO BUILDS(build_id, timestamp, template_name, instance_name, build_success, error_message) VALUES ${values2}`);

	it('Database table row query performed successfully', async function() {
		const response = await request(app).post('/api/history').send({buildId: "0987654321"});
		expect(response.body.packageName.equal("Test_package1"));
	});

	it('Wrong build it replied accordingly', async function() {
		
		db.query('DELETE FROM BUILD WHERE build_id = 0987654321');
		const response = await request(app).post('/api/history').send({buildId: "0987654321"});
		expect(response.body).equal('Data: no-data');

});

});

describe ('GET /api/history', function(){

});
*/
describe ('getStatus function', async function(){
	this.timeout(10000);
	beforeEach(() => {
        sandbox.restore();
    });


	it('getStatus has a valid response', async function() {
		// Do a new mock build
		const buildOptions = {
			package: 'TEMPLATE-EC2',
			parameters: {
				RESOURCE_NAME: 'BUILD TRIGGERED BY TEST',
				AWS_REGION: 'eu-west-1',
				AWS_ACCESS_KEY_ID: '123456789012345678901234567890',
				AWS_SECRET_ACCESS_KEY: '123456789012345678901234567890'
			},
			mock: true,
		};
		const buildResponse = await request(app).post('/api/build').send(buildOptions);
		expect(buildResponse.status).equal(200);

		//Wait fo it to initialize
		console.log('Initializing: sleeping for 4s..');
		await sleep(4000);

		const response = await indexFactory.getStatus();
		expect(response.status).to.be.oneOf(['completed', 'queued', 'in_progress']);
		expect(response.stepNumber).to.be.a('number');
		expect(response.stepCount).to.be.a('number');
		expect(response.buildId).to.be.a('number');
		if (response.conclusion === 'failure'){
			expect(response.errorMessage).not.equal('');
		} else {
			expect(response.errorMessage).equal('');
		}
	});
	it('getStatus has a valid response for successful run', async function() {
		const fetchStub = sandbox.stub(indexFactory, 'fetchFunc').onCall(0).resolves(new Response(JSON.stringify(workflowResponses.dailyWorkflows)));
		fetchStub.onCall(1).resolves(new Response(JSON.stringify(workflowResponses.jobsRunSuccess)));

		const response = await indexFactory.getStatus();
		expect(response.status).equal('completed');
		expect(response.stepNumber).equal(0);
		expect(response.stepCount).equal(11);
		expect(response.errorMessage).equal('');
		expect(response.buildId).equal(3630001795);
		expect(response.conclusion).equal('success');
	});
	it('getStatus has a valid response for failed run', async function() {
		const fetchStub = sandbox.stub(indexFactory, 'fetchFunc').onCall(0).resolves(new Response(JSON.stringify(workflowResponses.dailyWorkflows)));
		fetchStub.onCall(1).resolves(new Response(JSON.stringify(workflowResponses.jobsRunFail)));

		const response = await indexFactory.getStatus();
		expect(response.status).equal('completed');
		expect(response.stepNumber).equal(4);
		expect(response.stepCount).equal(11);
		expect(response.errorMessage).equal('Process completed with exit code 1. / line: 13');
		expect(response.buildId).equal(3630321948);
		expect(response.conclusion).equal('failure');
	});
});


describe('POST /api/status', async function() {
	this.timeout(5000);
	beforeEach(() => {
        sandbox.restore();
    });

	it('Status query performed successfully without db', async function() {
		const buildOptions = {localrun: true};
		const buildResponse = await request(app).post('/api/status').send(buildOptions);
		expect(buildResponse.status).equal(200);
		const json = buildResponse.body;
		expect(json.status).to.be.oneOf(['completed', 'queued', 'in_progress']);
		expect(json.stepNumber).to.be.a('number');
		expect(json.stepCount).to.be.a('number');
		expect(json.buildId).to.be.a('number');
		if (json.conclusion === 'failure'){
			expect(json.errorMessage).not.equal('');
		} else {
			expect(json.errorMessage).equal('');
		}
	});
});

describe('POST /api/auth', function(){
	const users = ['Kosti', 'Onni', 'Miikka', 'Rauli', 'Veera', 'Hermanni', 'Linnea'];

	it('Should authenticate successfully', async function() {
		for(const user of users){
			const buildOptions = {username : user};
			const response = await request(app).post('/api/auth').send(buildOptions);
			expect(response.status).equal(200);
			expect(response.headers).to.include.keys(['content-type']);
			expect(response.headers['content-type']).to.include('application/json');
			expect(response.headers).to.include.keys(['access-control-allow-origin']);
			expect(response.headers['access-control-allow-origin']).to.include('*');
			expect(response.body).equal('Data: no-data');
		}	
		});

	it('Should respond with 404', async function(){
		const buildOptions = {username : 'Userwhoisnotauthenticated'};
		const response = await request(app).post('/api/auth').send(buildOptions);
		expect(response.status).equal(404);
		expect(response.headers).to.include.keys(['content-type']);
		expect(response.headers['content-type']).to.include('application/json');
		expect(response.headers).to.include.keys(['access-control-allow-origin']);
		expect(response.headers['access-control-allow-origin']).to.include('*');
		expect(response.body).equal('Data: no-data');
	});
});

describe('POST /api/history', function(){
	
	it('Should give set response when db is not in use', async function() {
		const buildOptions = {localrun : true, buildId: 1};
		const response = await request(app).post('/api/history').send(buildOptions);
		expect(response.status).equal(200);
		const json = response.body;
		expect(json).to.eql(noDbResponses.noDbResponse[0]);
	});
});

describe('GET /api/history', function(){
	
	it('Should give set response when db is not in use', async function() {
		const buildOptions = {localrun : true};
		const response = await request(app).get('/api/history').send(buildOptions);
		expect(response.status).equal(200);
		const json = response.body;
		expect(json).to.eql(noDbResponses.noDbResponse);
	});
});

