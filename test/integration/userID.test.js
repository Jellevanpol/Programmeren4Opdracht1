const chai = require('chai')
const chaiHttp = require('chai-http')
const server = require('../../index')
const assert = require('assert')
chai.use(chaiHttp)
chai.should()
const expect = chai.expect


describe('Get user by ID', function () {
  it('TC-204-2- Should return error on non-existant user with the specified ID', (done) => {
    const userId = -1
    chai
      .request(server)
      .get(`/api/user/${userId}`)
      .end((err, res) => {
        assert(err === null)
        let { status, message, data } = res.body
        expect(status).to.equal(404)
        expect(message).to.equal('User not found')
        expect(data).to.be.an('object')
        done()
      })
  })

  it('TC-204-3- Should return the user with the specified ID', (done) => {
    const userId = 1
    chai
      .request(server)
      .get(`/api/user/${userId}`)
      .end((err, res) => {
        assert(err === null)
        let { status, message, data } = res.body
        expect(status).to.equal(200)
        expect(message).to.equal('Requested user info endpoint')
        expect(data).to.be.an('array')
        expect(data[0].id).to.equal(userId)
        expect(data[0]).to.have.property('firstName')
        expect(data[0]).to.have.property('lastName')
        expect(data[0]).to.have.property('isActive')
        expect(data[0]).to.have.property('emailAdress')
        expect(data[0]).to.have.property('password')
        expect(data[0]).to.have.property('phoneNumber')
        expect(data[0]).to.have.property('roles')
        expect(data[0]).to.have.property('street')
        expect(data[0]).to.have.property('city')
        done()
      })
  })

})