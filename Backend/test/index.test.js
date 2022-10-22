/* eslint-disable no-undef */
import app from "../index.js"
import request from "supertest"

describe('GET /', function() {
	it('Receive "Good day, Sir!"', function(done) {
		request(app).get('/')
		.expect('Good day, Sir!')
		.expect(200, done);
	});
});

describe('GET /api/list', function() {
	it('List all packages', function(done) {
		this.timeout(5000)
		request(app).get('/api/list')
		.expect('Content-Type', /json/)
		.expect(200, done);
	});
});