const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../../index');
const assert = require('assert');
chai.use(chaiHttp);
chai.should();
const expect = chai.expect;

describe('Update user by ID', function () {
    it('TC-205-6- Should update the user with the specified ID', (done) => {
        const userId = 1;
        chai
            .request(server)
            .put(`/api/user/${userId}`)
            .end((err, res) => {
                assert(err === null);
                let { data, message, status } = res.body;
                expect(status).to.equal(200);
                expect(message).to.equal('User updated with id ' + userId)
                expect(data).to.be.an('object')
                done();
            });
    });
})