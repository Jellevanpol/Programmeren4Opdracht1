process.env["DB_DATABASE"] = process.env.DB_DATABASE || "test";

const chai = require("chai");
const chaiHttp = require("chai-http");
const server = require("../../index");
const assert = require("assert");
const pool = require("../../src/utils/mysql-db");
const jwt = require("jsonwebtoken");
const { jwtSecretKey, logger } = require("../../src/utils/util");
require("tracer").setLevel("trace");

const expect = chai.expect;
chai.should();
chai.use(chaiHttp);

const CLEAR_MEAL_TABLE = "DELETE IGNORE FROM `meal`;";
const CLEAR_PARTICIPANTS_TABLE = "DELETE IGNORE FROM `meal_participants_user`;";
const CLEAR_USERS_TABLE = "DELETE IGNORE FROM `user`;";
const CLEAR_DB =
    CLEAR_MEAL_TABLE + CLEAR_PARTICIPANTS_TABLE + CLEAR_USERS_TABLE;

//   insert 2 meals
// id	isActive	isVega	isVegan	isToTakeHome	dateTime	maxAmountOfParticipants	price	imageUrl	cookId	createDate	updateDate	name	description	allergenes
const INSERT_USER =
    "INSERT INTO user (id, firstName, lastName, isActive, emailAdress, password, phoneNumber, roles, street, city) VALUES (1, 'john', 'deere', 1, 'john.deere@example.com', 'Password1', '0638681066', 'admin', '123Straat', 'Breda'), (2, 'John', 'Doe', 0, 'john.doe@example.com', 'Password1', '0643659870', 'guest', 'Schoollaan', 'Paramaribo');";
const INSERT_MEAL =
    "INSERT INTO meal (id, isActive, isVega, isVegan, isToTakeHome, dateTime, maxAmountOfParticipants, price, imageUrl, cookId, createDate, updateDate, name, description, allergenes)" +
    "VALUES (1, 1, 1, 1, 1, '2023-05-19 12:00:00', 4, 4.99, 'https://example.com/image1.jpg', 1, '2023-05-19', '2023-05-19', 'Testmeal', 'Test description for meal 1', 'lactose'), (2, 0, 0, 0, 0, '2023-05-19 13:00:00', 6, 2.99, 'https://example.com/image2.jpg', 2, '2023-05-18', '2023-05-18', 'TestMeal2', 'Test description for meal 2', 'noten');";
const INSERT = INSERT_USER + INSERT_MEAL;

describe("UC-304 Ophalen van maaltijd", () => {
    before((done) => {
        // Clear the database and insert a user for testing
        pool.query(CLEAR_DB, (err, result) => {
            console.log("clear_db: " + err);
            assert(err === null);
            pool.query(INSERT, (err, result) => {
                console.log("insert_meal: " + err);
                assert(err === null);
                done();
            });
        });
    });

    it('TC-304-1- Should return error on non-existant meal with the specified ID', (done) => {
        const mealId = -1
        chai
            .request(server)
            .get(`/api/meal/${mealId}`)
            .end((err, res) => {
                assert(err === null)
                let { message, data } = res.body
                expect(res.status).to.equal(404)
                expect(message).to.equal('Meal not found')
                expect(data).to.be.an('object').that.is.empty
                done()
            })
    })

    it('TC-304-2- Should return details of meal with the specified ID', (done) => {
        const mealId = 1
        chai
            .request(server)
            .get(`/api/meal/${mealId}`)
            .end((err, res) => {
                assert(err === null)
                let { message, data } = res.body
                expect(res.status).to.equal(200)
                expect(message).to.equal('Meal get by id endpoint')
                expect(data[0]).to.be.an('object')
                expect(data[0]).to.have.property("id")
                expect(data[0]).to.have.property("isActive", 1)
                expect(data[0]).to.have.property("isVega", 1)
                expect(data[0]).to.have.property("isVegan", 1)
                expect(data[0]).to.have.property("isToTakeHome", 1)
                expect(data[0]).to.have.property("dateTime", '2023-05-19T10:00:00.000Z')
                expect(data[0]).to.have.property("maxAmountOfParticipants", 4)
                expect(data[0]).to.have.property("price", '4.99')
                expect(data[0]).to.have.property("imageUrl",'https://example.com/image1.jpg')
                expect(data[0]).to.have.property("cookId", 1)
                expect(data[0]).to.have.property("createDate")
                expect(data[0]).to.have.property("updateDate")
                expect(data[0]).to.have.property("name", "Testmeal")
                expect(data[0]).to.have.property("description", "Test description for meal 1")
                expect(data[0]).to.have.property("allergenes", "lactose")

                done()
            })
    })

    after((done) => {
        // Clear the database after testing
        pool.query(CLEAR_DB, (err, result) => {
            assert(err === null);
            done();
        });
    });
});