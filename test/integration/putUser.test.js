process.env["DB_DATABASE"] = process.env.DB_DATABASE || "test";

const chai = require("chai");
const chaiHttp = require("chai-http");
const server = require("../../index");
const assert = require("assert");
const pool = require("../../src/utils/mysql-db");
const jwt = require("jsonwebtoken");
const { jwtSecretKey, logger } = require("../../src/utils/util");
const exp = require("constants");
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


describe('UC-205 Update user by ID', function () {
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
    it('TC-205-1- Should return an error if the email field is empty', (done) => {
        const token = jwt.sign({ userId: 6 }, jwtSecretKey);
        const userId = 6;
        const updatedUser = {
            firstName: 'John',
            lastName: 'Doe',
            isActive: true,
            emailAdress: '',
            password: 'password123',
            phoneNumber: '0612345678',
            roles: 'guest',
            street: '123Straat',
            city: 'Breda'
        };
        chai
            .request(server)
            .put(`/api/user/${userId}`)
            .set('Authorization', 'Bearer ' + token)
            .send(updatedUser)
            .end((err, res) => {
                assert(err === null);
                const { data, message, status } = res.body;
                expect(status).to.equal(400);
                expect(message).to.equal('emailAdress is required');
                expect(data).to.be.an("object").that.is.empty
                done();
            });
    });

    it('TC-205-2- Should return an error if the updated user isnt the logged in user ', (done) => {
        const token = jwt.sign({ userId: 6 }, jwtSecretKey);
        const userId = 7;
        const updatedUser = {
            firstName: 'John',
            lastName: 'Doe',
            isActive: 1,
            emailAdress: 'John@Deere.com',
            password: 'Password123',
            phoneNumber: '0612345678',
            roles: 'user',
            street: '123Straat',
            city: 'Breda'
        };
        chai
            .request(server)
            .put(`/api/user/${userId}`)
            .set('Authorization', 'Bearer ' + token)
            .send(updatedUser)
            .end((err, res) => {
                assert(err === null);
                const { data, message, status } = res.body;
                expect(status).to.equal(403);
                expect(message).to.equal('Access denied. You can only update your own profile.');
                expect(data).to.be.an("object").that.is.empty
                done();
            });
    });

    it('TC-205-3- Should return an error if the phoneNumber is invalid', (done) => {
        const token = jwt.sign({ userId: 6 }, jwtSecretKey);
        const userId = 6;
        const updatedUser = {
            firstName: 'John',
            lastName: 'Doe',
            isActive: true,
            emailAdress: 'john@test.com',
            password: 'Password123',
            phoneNumber: '',
            roles: 'user',
            street: '123Straat',
            city: 'Breda'
        };
        chai
            .request(server)
            .put(`/api/user/${userId}`)
            .set('Authorization', 'Bearer ' + token)
            .send(updatedUser)
            .end((err, res) => {
                assert(err === null);
                const { data, message, status } = res.body;
                expect(status).to.equal(400);
                expect(message).to.equal('Invalid phoneNumber');
                expect(data).to.be.an("object").that.is.empty
                done();
            });
    });

    it('TC-205-4- Should return an error on non-existant user', (done) => {
        const token = jwt.sign({ userId: 6 }, jwtSecretKey);
        const userId = -1;
        const updatedUser = {
            firstName: 'John',
            lastName: 'Doe',
            isActive: 1,
            emailAdress: 'john@test.com',
            password: 'Password123',
            phoneNumber: '06 38681055',
            roles: 'user',
            street: '123Straat',
            city: 'Breda'
        };
        chai
            .request(server)
            .put(`/api/user/${userId}`)
            .set('Authorization', 'Bearer ' + token)
            .send(updatedUser)
            .end((err, res) => {
                assert(err === null);
                const { data, message, status } = res.body;
                expect(status).to.equal(404);
                expect(message).to.equal('User not found');
                expect(data).to.be.an("object").that.is.empty
                done();
            });
    });

    it("TC-205-5 Niet ingelogd", (done) => {
        const token = "";
        const userId = 0;
        const updatedUser = {
            firstName: 'John',
            lastName: 'Doe',
            isActive: 1,
            emailAdress: 'john@test.com',
            password: 'Password123',
            phoneNumber: '06 38681055',
            roles: 'user',
            street: '123Straat',
            city: 'Breda'
        };

        chai
            .request(server)
            .put(`/api/user/${userId}`)
            .set('Authorization', 'Bearer ' + token)
            .send(updatedUser)
            .end((err, res) => {
                assert(err === null);
                const { body } = res;
                expect(res).to.have.status(401);
                expect(body).to.have.property("status").to.be.equal(401);
                expect(body).to.have.property("message").to.be.equal("Invalid token!");
                expect(body).to.have.property("data");
                const { data } = body;
                expect(data).to.be.an("object").and.to.be.empty;
                done();
            });
    });

    it('TC-205-6- Should update the user with the specified ID', (done) => {
        const token = jwt.sign({ userId: 6 }, jwtSecretKey);
        const userId = 6;
        const updatedUser = {
            firstName: 'John',
            lastName: 'Doe',
            isActive: 1,
            emailAdress: 'john.deere@server.com',
            password: 'Password123',
            phoneNumber: '0612345678',
            roles: 'guest',
            street: '123Straat',
            city: 'Breda'
        };
        
        chai
            .request(server)
            .put(`/api/user/${userId}`)
            .set("Authorization", "Bearer " + token)
            .send(updatedUser)
            .end((err, res) => {
                assert(err === null);
                const { data, message, status } = res.body;
                expect(status).to.equal(200);
                expect(message).to.equal('User updated with id ' + userId);
                expect(data.firstName).to.equal(updatedUser.firstName);
                expect(data.lastName).to.equal(updatedUser.lastName);
                expect(data.isActive).to.equal(updatedUser.isActive);
                expect(data.emailAdress).to.equal(updatedUser.emailAdress);
                expect(data.password).to.equal(updatedUser.password);
                expect(data.phoneNumber).to.equal(updatedUser.phoneNumber);
                expect(data.roles).to.equal(updatedUser.roles);
                expect(data.street).to.equal(updatedUser.street);
                expect(data.city).to.equal(updatedUser.city);
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