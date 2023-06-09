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

describe('UC-202 Get all users', function () {
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

    it('TC-202-1- Should return all users from the database', (done) => {
        chai
            .request(server)
            .get('/api/user')
            .end((err, res) => {
                assert(err === null)
                let { status, message, data } = res.body
                expect(status).to.equal(200)
                expect(message).to.equal('User getAll endpoint')
                expect(data).to.be.an('array')
                expect(data.length).to.be.at.least(2)
                done()
            })
    })

    it('TC-202-2- Should return an empty array when searching with non-existing fields', (done) => {
        chai
            .request(server)
            .get('/api/user')
            .query({ nonExistingField: 'someValue' })
            .end((err, res) => {
                assert(err === null)
                let { status, message, data } = res.body
                expect(status).to.equal(200)
                expect(message).to.equal('Invalid filter(s) used')
                expect(data).to.be.an('object')
                done()
            })
    })

    it('TC-202-3- Should return users with isActive=false when searching with isActive=false', (done) => {
        chai
            .request(server)
            .get('/api/user')
            .query({ isActive: 'false' })
            .end((err, res) => {
                assert(err === null)
                let { status, message, data } = res.body
                expect(status).to.equal(200)
                expect(message).to.equal('User getAll endpoint')
                expect(data).to.be.an('array')
                // Add assertions to check if the users have isActive=false
                // Example: expect(data[0].isActive).to.be.false
                done()
            })
    })

    it('TC-202-4- Should return users with isActive=true when searching with isActive=true', (done) => {
        chai
            .request(server)
            .get('/api/user')
            .query({ isActive: 'true' })
            .end((err, res) => {
                assert(err === null)
                let { status, message, data } = res.body
                expect(status).to.equal(200)
                expect(message).to.equal('User getAll endpoint')
                expect(data).to.be.an('array')
                done()
            })
    })

    it('TC-202-5- Should return users matching search terms on existing fields (max 2 fields)', (done) => {
        chai
            .request(server)
            .get('/api/user')
            .query({ isActive: 'true', roles: 'user' })
            .end((err, res) => {
                assert(err === null)
                let { status, message, data } = res.body
                expect(status).to.equal(200)
                expect(message).to.equal('User getAll endpoint')
                expect(data).to.be.an('array')
                done()
            })
    })

    after((done) => {
        pool.query(CLEAR_DB, (err, result) => {
            assert(err === null);
            done();
        });
    });
});