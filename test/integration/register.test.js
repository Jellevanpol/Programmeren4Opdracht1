const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../../index');
const assert = require('assert');
chai.use(chaiHttp);
chai.should();
const expect = chai.expect;


describe('Register', function () {
    it('TC-201-1- Server should return valid error on empty necessary inputfield', (done) => {
        chai
            .request(server)
            .post('/api/user')
            .end((err, res) => {
                assert(err === null)
                expect(res).to.have.status(400);
                expect(res.body.data).to.be.an('object');
                expect(res.body.data).to.be.empty;
                expect(res.body.message).to.contain('is invalid!');
                done();
            });
    });
    it('TC-201-2- Server should return valid error on invalid email address', (done) => {
        const invalidEmail = 'invalid-email';
        chai
            .request(server)
            .post('/api/user')
            .send({ firstName: 'Jelle', lastName: 'van Pol', email: invalidEmail, password: 'Password' })
            .end((err, res) => {
                assert (err === null)
                expect(res).to.have.status(400);
                expect(res.body.message).to.equal('email (string) is invalid!');
                done();
            });
    });
    it('TC-201-3- Server should return valid error on invalid password', (done) => {
        const invalidPassword = 'invalid-password';
        chai
            .request(server)
            .post('/api/user')
            .send({ firstName: 'Jelle', lastName: 'van Pol', emailAdress: 'Test@ziggo.nl', password: invalidPassword })
            .end((err, res) => {
                assert (err === null)
                expect(res).to.have.status(400);
                expect(res.body.message).to.equal('Invalid password format!');
                done();
            });
    });
    // it('TC-201-4- Server should return valid error on existing user', (done) => {
    //     const newUser = {
    //         firstName: 'Jelle',
    //         lastName: 'van Pol',
    //         email: 'Jellevanpol@ziggo.nl',
    //         password: 'Password1!',
    //         phoneNumber: '0638681055',
    //         active: true
    //     }

    //     chai
    //         .request(server)
    //         .post('/api/user')
    //         .send(newUser)
    //         .end((err, res) => {
    //             assert(err===null)
    //             expect(res).to.have.status(403);
    //             expect(res.body.message).to.equal('User already registered');
    //             done();
    //         });
    // });
    it('TC-201-5- Server should return succes on user registered', (done) => {
        const newUser = {
            firstName: 'Jelle',
            lastName: 'van Pol',
            email: 'Testemail@gmail.nl',
            password: 'Password1!',
            phoneNumber: '0638681055',
            active: true
          };
      
          chai
            .request(server)
            .post('/api/user')
            .send(newUser)
            .end((err, res) => {
              assert(err === null)
      
              res.body.should.be.an('object')
              let { data, message, status } = res.body
      
              expect(status).to.equal(201)
              expect(message).to.be.a('string').that.contains('User added with id ')
              expect(data).to.be.an('object')
      
              expect(data).to.have.property( 'id' )
              expect(data.firstName).to.equal('Jelle')
              data.lastName.should.equal('van Pol')
      
              done();
            });
    });
})