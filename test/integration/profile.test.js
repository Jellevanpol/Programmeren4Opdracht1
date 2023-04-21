const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../../index');
const assert = require('assert');
chai.use(chaiHttp);
chai.should();
const expect = chai.expect;


describe('Get users', function () {
    it('TC-203-2- Should return correct profile', (done) => {
        chai
            .request(server)
            .get('/api/user/profile')
            .end((err, res) => {
                assert(err === null)
                let{status, message, data} = res.body
                expect(status).to.equal(200)
                expect(message).to.equal('User profile endpoint')
                expect(data).to.be.an('object')
                expect(data).to.have.property('id')
                expect(data).to.have.property('firstName')
                expect(data).to.have.property('lastName')
                expect(data).to.have.property('email')
                done()
            })
    })
})