/* eslint-disable no-undef */
import chai from "chai"
import sinon from "sinon"
import assert from "assert"
import { factory } from "../github.js"
import { githubResponses } from "./responses/github-responses.js"

var expect = chai.expect


var sandbox = sinon.createSandbox()

describe("GitHub calls", function() {    
    afterEach(() => {
        sandbox.restore()
    })

	it("should return all template data", async function() {
        let stub = sandbox.stub(factory, 'getBranches').returns(githubResponses.OkBranchesResponse)
        let stub2 = sandbox.stub(factory, 'getBranchDesc')
            .onFirstCall().returns(githubResponses.OkBranchDesc1)
            .onSecondCall().returns(githubResponses.OkBranchDesc2)

		const response = await factory.templateData()
        
        assert(stub.calledOnce)
        assert(stub2.calledTwice)
        expect(response.status).equal(200)
        expect(response).to.have.all.keys("body", "status", "statusText", "templates")
        expect(response.templates.length).is.greaterThan(0)
        for (var t of response.templates) {
            expect(t).keys("name", "description")
            expect(t.name).to.not.equal("")
            expect(t.description).to.not.equal("")
        }
	})
    it("should return proper response data when GET branches call fails", async function(){
        let stub = sandbox.stub(factory, 'getBranches').returns(githubResponses.notOkBranchesResponse)
        const response = await factory.templateData()

        assert(stub.calledOnce)
        expect(response).keys("body", "status", "statusText", "templates")
        expect(response.status).equal(404)
        expect(response.statusText).equal('Not Found')
        expect(response.templates.length).equal(0)
    })
    it("should return proper response data when GET branch description call fails", async function(){
        let stub = sandbox.stub(factory, 'getBranches').returns(githubResponses.OkBranchesResponse)
        let stub2 = sandbox.stub(factory, 'getBranchDesc')
            .onFirstCall().returns(githubResponses.NotOkBranchDesc)
            .onSecondCall().returns(githubResponses.OkBranchDesc1)

        const response = await factory.templateData()

        assert(stub.calledOnce)
        assert(stub2.calledOnce)

        expect(response).keys("body", "status", "statusText", "templates")
        expect(response.status).equal(404)
        expect(response.statusText).equal('Not Found')
        expect(response.templates.length).equal(0)

        // 2nd test for when second description fetch fails
        sandbox.restore()
        let stub3 = sandbox.stub(factory, 'getBranches').returns(githubResponses.OkBranchesResponse)
        let stub4 = sandbox.stub(factory, 'getBranchDesc')
            .onFirstCall().returns(githubResponses.OkBranchDesc1)
            .onSecondCall().returns(githubResponses.NotOkBranchDesc)

        const response2 = await factory.templateData()

        assert(stub3.calledOnce)
        assert(stub4.calledTwice)

        expect(response2).keys("body", "status", "statusText", "templates")
        expect(response2.status).equal(404)
        expect(response2.statusText).equal('Not Found')
        expect(response2.templates.length).equal(1)
    })
    it("should return only branches that are templates", function() {
        const templates = factory.parseTemplates([{"name":"TEMPLATE-Test1"}, {"name": "34-fix-something"}, {"name": "TEMPLATE-Test2"}])

        expect(templates, ["TEMPLATE-Test1", "TEMPLATE-Test2"])
    })
})