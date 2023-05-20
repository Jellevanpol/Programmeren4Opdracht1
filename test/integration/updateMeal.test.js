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
const INSERT_USER =
    "INSERT INTO user (id, firstName, lastName, isActive, emailAdress, password, phoneNumber, roles, street, city) VALUES (1, 'john', 'deere', 1, 'john.deere@example.com', 'Password1', '0638681066', 'admin', '123Straat', 'Breda'), (2, 'John', 'Doe', 0, 'john.doe@example.com', 'Password1', '0643659870', 'guest', 'Schoollaan', 'Paramaribo');";
const INSERT_MEAL =
    "INSERT INTO meal (id, isActive, isVega, isVegan, isToTakeHome, dateTime, maxAmountOfParticipants, price, imageUrl, cookId, createDate, updateDate, name, description, allergenes)" +
    "VALUES (1, 1, 1, 1, 1, '2023-05-19 12:00:00', 4, 4.99, 'https://example.com/image1.jpg', 1, '2023-05-19', '2023-05-19', 'Testmeal', 'Test description for meal 1', 'lactose'), (2, 0, 0, 0, 0, '2023-05-19 13:00:00', 6, 2.99, 'https://example.com/image2.jpg', 2, '2023-05-18', '2023-05-18', 'TestMeal2', 'Test description for meal 2', 'noten');";
const INSERT = INSERT_USER + INSERT_MEAL;

describe("UC-302 Updaten van maaltijd", () => {
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

    it('TC-302-1 - Should return error on one or more necessary fields missing', (done) => {
        const token = jwt.sign({ userId: 1 }, jwtSecretKey);
        const mealId = 1;

        const requestBody = {
            isActive: 1,
            isVega: 0,
            isVegan: 0,
            isToTakeHome: 1,
            imageUrl: "example.jpg",
            description: "Example description",
            allergenes: "Example allergenes",
        };

        chai
            .request(server)
            .put(`/api/meal/${mealId}`)
            .set("Authorization", "Bearer " + token)
            .send(requestBody)
            .end((err, res) => {
                assert(err === null);
                const { message } = res.body;
                expect(res.status).to.equal(400);
                expect(message).to.equal('Invalid input for one or more fields');
                done();
            });
    });

    it('TC-302-2- Should return error on not logged in user', (done) => {
        const token = 1;
        const mealId = 1;
        const requestBody = {
            name: "Meal",
            price: "4.99",
            maxAmountOfParticipant: "4",
            isActive: 1,
            isVega: 0,
            isVegan: 0,
            isToTakeHome: 1,
            imageUrl: "example.jpg",
            description: "Example description",
            allergenes: "Example allergenes",
        };
        chai
            .request(server)
            .put(`/api/meal/${mealId}`)
            .set("Authorization", "Bearer " + token)
            .send(requestBody)
            .end((err, res) => {
                assert(err === null)
                const { message } = res.body
                expect(res.status).to.equal(401)
                expect(message).to.equal('Invalid token!')
                done()
            })
    })

    it('TC-302-3 - Should return error on not authorized user', (done) => {
        const token = jwt.sign({ userId: 1 }, jwtSecretKey);
        const mealId = 2;
        const requestBody = {
            name: "meal",
            price: "4.99",
            maxAmountOfParticipants: 4,
            isActive: 1,
            isVega: 0,
            isVegan: 0,
            isToTakeHome: 1,
            imageUrl: "example.jpg",
            description: "Example description",
            allergenes: "Example allergenes",
        };

        chai
            .request(server)
            .put(`/api/meal/${mealId}`)
            .set("Authorization", "Bearer " + token)
            .send(requestBody)
            .end((err, res) => {
                assert(err === null);
                const { message, data } = res.body;
                expect(message).to.equal('Not authorized'); // Verify the error message
                expect(res.status).to.equal(403); // Verify that the status code is 403
                expect(data).to.be.an("object").that.is.empty;
                done();
            });
    });

    it('TC-302-4- Should return error on non-existant mealId', (done) => {
        const token = jwt.sign({ userId: 1 }, jwtSecretKey);
        const mealId = 3
        chai
            .request(server)
            .delete(`/api/meal/${mealId}`)
            .set("Authorization", "Bearer " + token)
            .end((err, res) => {
                assert(err === null)
                const { message, data } = res.body
                expect(res.status).to.equal(404)
                expect(message).to.equal('Meal not found')
                expect(data).to.be.an("object").that.is.empty
                done()
            })
    })

    it('TC-302-5- Should update meal', (done) => {
        const token = jwt.sign({ userId: 1 }, jwtSecretKey);
        const mealId = 1

        const requestBody = {
            name: "meal",
            price: "4.99",
            maxAmountOfParticipants: 4,
            isActive: 1,
            isVega: 0,
            isVegan: 0,
            isToTakeHome: 1,
            imageUrl: "example.jpg",
            description: "Example description",
            allergenes: "Example allergenes",
        };

        chai
            .request(server)
            .put(`/api/meal/${mealId}`)
            .set("Authorization", "Bearer " + token)
            .send(requestBody)
            .end((err, res) => {
                assert(err === null)
                const { message } = res.body
                expect(message).to.contain('Meal updated with id: ')
                expect(res.status).to.equal(200)
                expect(res.body.data)
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