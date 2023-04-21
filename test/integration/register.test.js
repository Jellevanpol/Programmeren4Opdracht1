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
            .post('/api/register')
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body.data).to.be.an('object');
                expect(res.body.data).to.be.empty;
                expect(res.body.message).to.equal('All fields are required!');
                done();
            });
    });
    it('TC-201-2- Server should return valid error on invalid email address', (done) => {
        const invalidEmail = 'invalid-email';
        chai
            .request(server)
            .post('/api/register')
            .send({ firstName: 'Jelle', lastName: 'van Pol', email: invalidEmail, password: 'Password' })
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body.message).to.equal('Invalid email format!');
                done();
            });
    });
    it('TC-201-3- Server should return valid error on invalid password', (done) => {
        const invalidPassword = 'invalid-password';
        chai
            .request(server)
            .post('/api/register')
            .send({ firstName: 'Jelle', lastName: 'van Pol', email: 'Jellevanpol@ziggo.nl', password: invalidPassword })
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body.message).to.equal('Invalid password format!');
                done();
            });
    });
    // it('TC-201-4- Server should return valid error on existing user', (done) => {
    //     users.push({
    //         firstName: 'Jelle',
    //         lastName: 'van Pol',
    //         email: 'jellevanpol@ziggo.nl',
    //         password: 'Password1!'
    //     });

    //     const newUser = {
    //         firstName: 'John',
    //         lastName: 'Doe',
    //         email: 'Johndoe@example.com',
    //         password: 'Password1!'
    //     };

    //     chai
    //         .request(server)
    //         .post('/api/register')
    //         .send(newUser)
    //         .end((err, res) => {
    //             expect(res).to.have.status(403);
    //             expect(res.body.message).to.equal('User already registered');
    //             done();
    //         });
    // });
    
    it('TC-201-5- Server should return succes on user registered', (done) => {
        // const newUser = {
        //     firstName: 'John',
        //     lastName: 'Doe',
        //     email: 'Johndoe@example.com',
        //     password: 'Password123!',
        // };

        // chai.request(server)
        //     .post('/api/register')
        //     .send(newUser)
        //     .end((err, res) => {
        //         assert(err === null)
                
        //         let { data, message, status } = res.body
        //         expect(err).to.be.null;
        //         expect(res).to.have.status(201);
        //         expect(body.message).to.equal('User register-endpoint');
        //         expect(data.newUser).to.have.property('id');
        //         expect(data.newUser.firstName).to.equal(newUser.firstName);
        //         expect(data.newUser.lastName).to.equal(newUser.lastName);
        //         expect(data.newUser.email).to.equal(newUser.email);
        //         expect(data.newUser.password).to.be.undefined;
        //         done();

        //     });
        const newUser = {
            firstName: 'Jelle',
            lastName: 'van Pol',
            email: 'Jellevanpol@ziggo.nl',
            password: 'Password1!'
          };
      
          // Voer de test uit
          chai
            .request(server)
            .post('/api/register')
            .send(newUser)
            .end((err, res) => {
              assert(err === null)
      
              res.body.should.be.an('object')
              let { data, message, status } = res.body
      
              status.should.equal(201)
              message.should.be.a('string').that.contains('User added with id ')
              data.should.be.an('object')
      

              data.should.have.property( 'id' )
              data.firstName.should.equal('Jelle')
              data.lastName.should.equal('van Pol')
      
              done();
            });
    });
})