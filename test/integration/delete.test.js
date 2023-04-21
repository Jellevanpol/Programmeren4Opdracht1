const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../../index');
const assert = require('assert');
chai.use(chaiHttp);
chai.should();
const expect = chai.expect;

describe('Delete user by ID', function () {
    it('TC-206-4- Should delete the user with the specified ID', (done) => {
        const userId = 2;
        chai
            .request(server)
            .delete(`/api/user/${userId}`)
            .end((err, res) => {
                assert(err === null);
                let { data, message, status } = res.body;

                expect(status).to.equal(200);
                expect(message).to.equal('User met ID ' + userId + ' deleted')

                done();
            });
    });
})