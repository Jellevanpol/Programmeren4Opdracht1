const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../../index');
const assert = require('assert');
chai.use(chaiHttp);
chai.should();
const expect = chai.expect;


describe('Get user by ID', function () {
    it('TC-204-3- Should return the user with the specified ID', (done) => {
      const userId = 1;
      chai
        .request(server)
        .get(`/api/user/${userId}`)
        .end((err, res) => {
          assert(err === null)
          let { status, message, data } = res.body;
          expect(status).to.equal(200);
          expect(message).to.equal('Requested user info endpoint');
          expect(data).to.be.an('object');
          expect(data.id).to.equal(userId); 
          done();
        });
    });
})