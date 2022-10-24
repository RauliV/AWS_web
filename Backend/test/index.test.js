import chai from "chai";
import request from "supertest"
import sinon from "sinon"
import assert from "assert"
import app from "../index.js"
import { indexFactory } from "../index.js"
import { gitFactory } from "../github.js"

const expect = chai.expect

let sandbox = sinon.createSandbox()

describe('GET /', function() {
	it('Receive "Good day, Sir!"', function(done) {
		request(app).get('/')
		.expect('Good day, Sir!')
		.expect(200, done);
	});
});

describe('GET /api/list', function() {
	this.timeout(5000)
	beforeEach(() => {
        sandbox.restore()
    })
	it('List all packages', async function() {
		let templatesStub = sandbox.stub(gitFactory, "templateData").returns({"status": 200, "statusText": "OK", "templates": ["TEMPLATE-1", "TEMPLATE-2"], "body": {}})
		let response = await request(app).get('/api/list')
		assert(templatesStub.calledOnce)
		expect(response.type).equal("application/json")
		console.log(response.body.templates)
		expect(response.body.templates).deep.equal(["TEMPLATE-1", "TEMPLATE-2"])
		expect(response.status).equal(200);
	});
});

describe('POST /api/build', async function() {
	this.timeout(5000)
	beforeEach(() => {
        sandbox.restore()
    })

	let buildParameters = {
		AWS_ACCESS_KEY_ID: "These",
		AWS_SECRET_ACCESS_KEY: "don't",
		AWS_REGION: "matter for now (if these are not empty)"
	};

	it('Trigger package build action successfully', async function() {
		let fetchStub = sandbox.stub(indexFactory, "triggerBuild").resolves({status: 204})
		let packageName = "TEMPLATE-EC2"
		let buildOptions = {
		  package: packageName,
		  parameters: buildParameters,
		};

		let response = await request(app).post("/api/build").send(buildOptions)
		
		assert(fetchStub.calledOnce)
		expect(response.status).equal(200)
		expect(response.headers).to.include.keys(["content-type", "access-control-allow-origin"])
		expect(response.headers["content-type"]).to.include("application/json")
		expect(response.headers["access-control-allow-origin"]).equal("*")
		expect(response.body).equal("(PLACEHOLDER) Building " + packageName + " - Status: 204")
	});
	// 422 = invalid/missing input, 404 = Not Found, 401 = Unauthorized
	let statuses = [422, 404, 401]
	for (const s of statuses) {
		it('Fail when has invalid inputs, ' + s, async function() {
			
				let fetchStub = sandbox.stub(indexFactory, "triggerBuild").resolves({status: s})
				let packageName = "invalid-template"
				let buildOptions = {
					package: packageName,
					parameters: buildParameters,
				};
				
				let response = await request(app).post("/api/build").send(buildOptions)

				assert(fetchStub.calledOnce)
				expect(response.status).equal(s)
				expect(response.headers).to.include.keys(["content-type", "access-control-allow-origin"])
				expect(response.headers["content-type"]).to.include("application/json")
				expect(response.headers["access-control-allow-origin"]).equal("*")
				expect(response.body).equal("(PLACEHOLDER) Building " + packageName + " - Status: " + response.status)
			
		})
	}
});