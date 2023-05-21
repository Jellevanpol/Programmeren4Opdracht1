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

describe("UC 101 - Inloggen", () => {
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

    it("TC-101-1 - Verplicht veld ontbreekt", (done) => {
        chai
            .request(server)
            .post("/api/login")
            .send({ emailAdress: "johan.doe@example.com" })
            .end((err, res) => {
                assert(err === null);
                const { body } = res;

                expect(res).to.have.status(400);
                expect(body).to.be.an("object");
                expect(body).to.have.property("error", "AssertionError [ERR_ASSERTION]: password must be a string.");
                expect(body).to.have.property("datetime");

                done();
            });
    });

    it("TC-101-2 - Niet valide wachtwoord", (done) => {
        chai
            .request(server)
            .post("/api/login")
            .send({ emailAdress: "john.deere@example.com", password: "Welkom12" })
            .end((err, res) => {
                assert(err === null);
                const { body } = res;

                expect(res).to.have.status(400);
                expect(body).to.be.an("object");
                expect(body).to.have.property("status").to.be.equal(400);
                expect(body).to.have.property("message").to.be.equal("Not authorized");
                expect(body).to.have.property("data");
                const { data } = body;
                expect(data).to.be.an("object").that.is.empty;

                done();
            });
    });

    it("TC-101-3 - Gebruiker bestaat niet", (done) => {
        chai
            .request(server)
            .post("/api/login")
            .send({ emailAdress: "j.doe@example.com", password: "Welkom123" })
            .end((err, res) => {
                assert(err === null);
                const { body } = res;

                expect(res).to.have.status(404);
                expect(body).to.be.an("object");
                expect(body).to.have.property("status").to.be.equal(404);
                expect(body).to.have.property("message").to.be.equal("User not found");
                expect(body).to.have.property("data");
                const { data } = body;
                expect(data).to.be.an("object").that.is.empty;

                done();
            });
    });

    it("TC-101-4 - Gebruiker succesvol ingelogd", (done) => {
        chai
            .request(server)
            .post("/api/login")
            .send({
                emailAdress: "john.deere@example.com",
                password: "Password12",
            })
            .end((err, res) => {
                assert(err === null);

                expect(res).to.have.status(200);
                expect(res.body).to.be.an("object");
                expect(res.body).to.have.property("status").to.be.equal(200);
                expect(res.body).to.have.property("message").to.be.equal("Login endpoint");
                expect(res.body).to.have.property("data");
                const { data } = res.body;
                expect(data).to.be.an("object");
                expect(data).to.have.property("token");
                expect(data).to.have.property("id");
                expect(data).to.have.property("firstName");
                expect(data).to.have.property("lastName");
                expect(data).to.have.property("emailAdress");
                expect(data).to.have.property("phoneNumber");
                expect(data).to.have.property("street");
                expect(data).to.have.property("city");
                expect(data).to.have.property("roles");
                expect(data).to.have.property("isActive");

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