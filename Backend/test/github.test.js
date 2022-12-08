/* eslint-disable no-invalid-this */
/* eslint-disable no-undef */
import chai from 'chai';
import sinon from 'sinon';
import assert from 'assert';
import { gitFactory } from '../github.js';
import { githubResponses } from './responses/github-responses.js';

const expect = chai.expect;


const sandbox = sinon.createSandbox();

describe('GitHub calls', function() {    
    afterEach(() => {
        sandbox.restore();
    });

	it('should return all template data', async function() {
        const stub = sandbox.stub(gitFactory, 'getBranches').returns(githubResponses.OkBranchesResponse);
        const stub2 = sandbox.stub(gitFactory, 'getBranchDesc')
            .onFirstCall().returns(githubResponses.OkBranchDesc1)
            .onSecondCall().returns(githubResponses.OkBranchDesc2);

		const response = await gitFactory.templateData();
        
        assert(stub.calledOnce);
        assert(stub2.calledTwice);
        expect(response.status).equal(200);
        expect(response).to.have.all.keys('body', 'status', 'statusText', 'templates');
        expect(response.templates.length).is.greaterThan(0);
        for (const t of response.templates) {
            expect(t).keys('name', 'description', 'parameters');
            expect(t.name).to.not.equal('');
            expect(t.description).to.not.equal('');
        }
	});
    it('should return proper response data when GET branches call fails', async function(){
        const stub = sandbox.stub(gitFactory, 'getBranches').returns(githubResponses.notOkBranchesResponse);
        const response = await gitFactory.templateData();

        assert(stub.calledOnce);
        expect(response).keys('body', 'status', 'statusText', 'templates');
        expect(response.status).equal(404);
        expect(response.statusText).equal('Not Found');
        expect(response.templates.length).equal(0);
    });
    it('should return proper response data when GET branch description call fails', async function(){
        const stub = sandbox.stub(gitFactory, 'getBranches').returns(githubResponses.OkBranchesResponse);
        const stub2 = sandbox.stub(gitFactory, 'getBranchDesc')
            .onFirstCall().returns(githubResponses.NotOkBranchDesc)
            .onSecondCall().returns(githubResponses.OkBranchDesc1);

        const response = await gitFactory.templateData();

        assert(stub.calledOnce);
        assert(stub2.calledOnce);

        expect(response).keys('body', 'status', 'statusText', 'templates');
        expect(response.status).equal(404);
        expect(response.statusText).equal('Not Found');
        expect(response.templates.length).equal(0);

        // 2nd test for when second description fetch fails
        sandbox.restore();
        const stub3 = sandbox.stub(gitFactory, 'getBranches').returns(githubResponses.OkBranchesResponse);
        const stub4 = sandbox.stub(gitFactory, 'getBranchDesc')
            .onFirstCall().returns(githubResponses.OkBranchDesc1)
            .onSecondCall().returns(githubResponses.NotOkBranchDesc);

        const response2 = await gitFactory.templateData();

        assert(stub3.calledOnce);
        assert(stub4.calledTwice);

        expect(response2).keys('body', 'status', 'statusText', 'templates');
        expect(response2.status).equal(404);
        expect(response2.statusText).equal('Not Found');
        expect(response2.templates.length).equal(1);
    });
    it('should return only branches that are templates', function() {
        const templates = gitFactory.parseTemplates([{'name':'TEMPLATE-Test1'}, {'name': '34-fix-something'}, {'name': 'TEMPLATE-Test2'}]);

        expect(templates, ['TEMPLATE-Test1', 'TEMPLATE-Test2']);
    });
});

describe('GitHub integration part', function() {
    this.timeout(5000);
    it('should return all branches', async function() {
        const response = await gitFactory.getBranches();
        expect(response.json.length).greaterThan(0);
        for (const branch of response.json) {
            expect(branch.name).to.exist;
            expect(branch.commit).to.exist;
            expect(branch.protected).to.exist;
        }
        expect(response.status).equal(200);
        expect(response.statusText).equal('OK');
    });
    it('should return a branch description', async function() {
        const response = await gitFactory.getBranchDesc('TEMPLATE-EC2');
        expect(response.json.name).equal('desc.json');
        expect(response.json.path).equal('desc.json');
        expect(response.json.type).equal('file');
        expect(response.status).equal(200);
        expect(response.statusText).equal('OK');

        const description = JSON.parse(atob(response.json.content)).description;
        expect(description).equal('This template builds an EC2 instance.');
        const parameters = JSON.parse(atob(response.json.content)).parameters;
        expect(parameters[0].displayName).equal('Instance name');
        expect(parameters[0].internalName).equal('RESOURCE_NAME');
    });
});