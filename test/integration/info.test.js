const chai = require('chai')
const chaihttp = require('chai-http')
const server = require('../../index')
const assert = require('assert')

chai.should()
chai.use(chaihttp)

describe('Server-info', function () {
    it('TC-102- Server info should return succesful information', (done) => {
        chai
            .request(server)
            .get('/api/info')
            .end((err, res) => {
                res.body.should.be.an('object')
                let { data, message, status } = res.body
                status.should.equal(201)
                message.should.be.a('string').that.is.equal('Server info-endpoint')
                data.should.be.an('object')
                data.should.has.property('studentName').to.be.equal('Jelle')
                data.should.has.property('studentNumber').to.be.equal(2203205)
                data.should.has.property('description').to.be.equal('Welkom bij de server API van de share-a-meal')
                done()

            });
    });
    it('TC-103 Server should return valid error on non-existent endpoint', (done) => {
        chai
            .request(server)
            .get('/api/doesnotexist')
            .end((err, res) => {
                assert(err !== undefined)

                res.body.should.be.an('object')
                let { data, message, status } = res.body

                status.should.equal(404)
                message.should.be.a('string').that.is.equal('Endpoint not found')
                data.should.be.an('object')
                done()
            });
    });
})