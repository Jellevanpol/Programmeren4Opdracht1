const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../../index');
const assert = require('assert');
chai.use(chaiHttp);
chai.should();
const expect = chai.expect;


describe('Get users', function () {
    it('TC-202-1- Should return all users from the database', (done) => {
        chai
            .request(server)
            .get('/api/user')
            .end((err, res) => {
                assert(err === null)
                let{status, message, data} = res.body
                expect(status).to.equal(200)
                expect(message).to.contain('User lijst')
                expect(data).to.be.an('array')
                expect(data.length).to.be.at.least(2)
                done()
            })
    })
})