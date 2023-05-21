process.env["DB_DATABASE"] = process.env.DB_DATABASE || "test";

const chai = require("chai");
const chaiHttp = require("chai-http");
const server = require("../../index");
const assert = require("assert");
const pool = require("../../src/utils/mysql-db");
const jwt = require("jsonwebtoken");
const { jwtSecretKey, logger } = require("../../src/utils/util");
require("tracer").setLevel("trace");

chai.should();
const expect = chai.expect;
chai.use(chaiHttp);

const CLEAR_MEAL_TABLE = "DELETE IGNORE FROM meal;";
const CLEAR_PARTICIPANTS_TABLE = "DELETE IGNORE FROM meal_participants_user;";
const CLEAR_USERS_TABLE = "DELETE IGNORE FROM user;";
const CLEAR_DB =
    CLEAR_MEAL_TABLE + CLEAR_PARTICIPANTS_TABLE + CLEAR_USERS_TABLE;

    const INSERT_USER =
    "INSERT INTO user (id, firstName, lastName, isActive, emailAdress, password, phoneNumber, roles, street, city)" +
    "VALUES (6, 'John', 'deere', 1, 'john.deere@example.com', 'Password12', 0634567890, 'admin', 'dorpsstraat', 'Breda'), (7, 'john', 'doe', 1, 'john.doe@example.com', 'Password12', 0612345678, 'guest', 'Straat 12', 'Nur Sultan')";

describe("UC 201 - create user", () => {
    before((done) => {
        // Clear the database and insert a user for testing
        pool.query(CLEAR_DB, (err, result) => {
            assert(err === null);
            pool.query(INSERT_USER, (err, result) => {
                assert(err === null);
                done();
            });
        });
    });


    it('TC-201-1- Server should return valid error on empty necessary inputfield', (done) => {
        chai
            .request(server)
            .post('/api/user')
            .send({ lastName: 'van Pol', emailAdress: "jellevanpol@gmail.com", password: 'Password1' })
            .end((err, res) => {
                assert(err === null)
                expect(res).to.have.status(400);
                expect(res.body.data).to.be.an('object').that.is.empty;
                expect(res.body.message).to.contain('is invalid!');
                done();
            });
    });

    it('TC-201-2- Server should return error on invalid email adress', (done) => {
        const invalidEmail = 'invalid-email';
        chai
            .request(server)
            .post('/api/user')
            .send({ firstName: 'Jelle', lastName: 'van Pol', emailAdress: invalidEmail, password: 'Password' })
            .end((err, res) => {
                assert(err === null)
                expect(res).to.have.status(400);
                expect(res.body.data).to.be.an('object').that.is.empty;
                expect(res.body.message).to.contain('is not a valid email');
                done();
            });
    });

    it('TC-201-3- Server should return valid error on invalid password', (done) => {
        const invalidPassword = 'invalid-password';
        chai
            .request(server)
            .post('/api/user')
            .send({ firstName: 'Jelle', lastName: 'van Pol', emailAdress: 'Test@ziggo.nl', password: invalidPassword, phoneNumber: '06 12345678' })
            .end((err, res) => {
                assert(err === null)
                expect(res).to.have.status(400);
                expect(res.body.data).to.be.an('object');
                expect(res.body.data).to.be.empty;
                expect(res.body.message).to.contain('is not a valid password!');
                done();
            });
    });

    it('TC-201-4- Server should return valid error on existing user', (done) => {
        const newUser = {
            firstName: 'John',
            lastName: 'Deere',
            emailAdress: 'john.deere@example.com',
            password: 'Password12!',
            phoneNumber: '0634567890',
            isActive: 1
        }

        chai
            .request(server)
            .post('/api/user')
            .send(newUser)
            .end((err, res) => {
                assert(err === null)
                let { data, message, status } = res.body

                expect(status).to.equal(403);
                expect(message).to.contain('is already registered!');
                expect(data).to.be.empty

                done();
            });
    });

    it('TC-201-5- Server should return succes on user registered', (done) => {
        const newUser = {
            firstName: 'Jelle',
            lastName: 'van Pol',
            emailAdress: 'Jellevanpol@gmail.com',
            password: 'Password1!',
            phoneNumber: '0638681066',
            isActive: 1,
            roles: "editor,guest",
            street: "",
            city: ""
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

                const { firstName, lastName, isActive, emailAdress, password, phoneNumber, roles, street, city } = data
                expect(data).to.have.property('id')
                expect(firstName).to.equal('Jelle')
                expect(lastName).to.equal('van Pol')
                expect(isActive).to.equal(1)
                expect(emailAdress).to.equal("Jellevanpol@gmail.com")
                expect(password).to.equal("Password1!")
                expect(phoneNumber).to.equal("0638681066")
                expect(roles).to.equal("editor,guest")
                expect(street).to.equal("")
                expect(city).to.equal("")

                done();
            });
    });

    after((done) => {
        // Clear the database after testing
        pool.query(CLEAR_DB, (err, result) => {
            assert(err === null);
            done();
        });
    });
});
