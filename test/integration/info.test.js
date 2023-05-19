// const chai = require('chai')
// const chaihttp = require('chai-http')
// const server = require('../../index')
// const assert = require('assert')

// chai.should()
// chai.use(chaihttp)
// const expect = chai.expect;

// describe('Server-info', function () {
//     it('TC-102- Server info should return succesful information', (done) => {
//         chai
//             .request(server)
//             .get('/api/info')
//             .end((err, res) => {
//                 assert(err === null)
//                 expect(res.body).to.be.an('object')
//                 let { data, message, status } = res.body
//                 expect(status).to.equal(201)
//                 expect(message).to.be.a('string').that.is.equal('Server info-endpoint')
//                 expect(data).to.be.an('object')
//                 expect(data).to.have.property('studentName').to.be.equal('Jelle')
//                 expect(data).to.have.property('studentNumber').to.be.equal(2203205)
//                 expect(data).to.have.property('description').to.be.equal('Welkom bij de server API van de share-a-meal')
//                 done()

//             });
//     });
//     it('TC-103 Server should return valid error on non-existent endpoint', (done) => {
//         chai
//             .request(server)
//             .get('/api/doesnotexist')
//             .end((err, res) => {
//                 assert(err === null)

//                 res.body.should.be.an('object')
//                 let { data, message, status } = res.body

//                 expect(status).to.equal(404)
//                 expect(message).to.be.a('string').that.is.equal('Endpoint not found')
//                 expect(data).to.be.an('object')
//                 done()
//             });
//     });
// })