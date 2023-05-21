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


describe('UC-206 Delete user by ID', function () {
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

    it("TC-206-1- Should return an error if the user to be deleted doesn't exist", (done) => {
        const token = jwt.sign({ userId: 6 }, jwtSecretKey);
        const nonExistingUserId = 999

        chai
            .request(server)
            .delete(`/api/user/${nonExistingUserId}`)
            .set('Authorization', 'Bearer ' + token)
            .end((err, res) => {
                assert(err === null);
                const { body } = res;
                res.should.have.status(404);
                body.should.have.property("status").to.be.equal(404);
                body.should.have.property("message").to.be.equal("User not found");
                body.should.have.property("data");
                const { data } = body;
                data.should.be.an("object").and.to.be.empty;
                done();
            });
    });

    it("TC-206-2- Should return an error if there is no logged-in user", (done) => {
        const userId = 6; // Assuming the user to be deleted has an ID of 1

        chai
            .request(server)
            .delete(`/api/user/${userId}`)
            .set('Authorization', 'Bearer ') // Empty token to simulate no logged-in user
            .end((err, res) => {
                assert(err === null);
                const { body } = res;
                res.should.have.status(401);
                body.should.have.property("status").to.be.equal(401);
                body.should.have.property("message").to.be.equal("Invalid token!");
                body.should.have.property("data");
                const { data } = body;
                data.should.be.an("object").and.to.be.empty;
                done();
            });
    });

    it("TC-206-3- Should return an error if the user is not authorized to delete the given user", (done) => {
        const token = jwt.sign({ userId: 6 }, jwtSecretKey);
        const otherUserId = 7

        chai
            .request(server)
            .delete(`/api/user/${otherUserId}`)
            .set('Authorization', 'Bearer ' + token)
            .end((err, res) => {
                assert(err === null);
                const { body } = res;
                res.should.have.status(403);
                body.should.have.property("status").to.be.equal(403);
                body.should.have.property("message").to.be.equal("Access denied. You can only delete your own profile.");
                body.should.have.property("data");
                const { data } = body;
                data.should.be.an("object").and.to.be.empty;
                done();
            });
    });

    it('TC-206-4- Should delete the user with the specified ID', (done) => {
        const token = jwt.sign({ userId: 6 }, jwtSecretKey);
        const userId = 6;
        chai
            .request(server)
            .delete(`/api/user/${userId}`)
            .set("Authorization", "Bearer " + token)
            .end((err, res) => {
                assert(err === null);
                let { data, message, status } = res.body;
                status.should.equal(200);
                message.should.equal('User deleted with id ' + userId);
                expect(data).to.be.an('object');
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