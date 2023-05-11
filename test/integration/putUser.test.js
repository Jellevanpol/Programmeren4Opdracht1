const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../../index');
const assert = require('assert');
chai.use(chaiHttp);
chai.should();
const expect = chai.expect;

describe('Update user by ID', function () {
  it('TC-205-6- Should update the user with the specified ID', (done) => {
    const userId = 3;
    const updatedUser = {
      firstName: 'John',
      lastName: 'Doe',
      isActive: true,
      emailAdress: 'john.doe@example.com',
      password: 'password123',
      phoneNumber: '1234567890',
      roles: 'user',
      street: '123Straat',
      city: 'Breda'
    };

    chai
      .request(server)
      .put(`/api/user/${userId}`)
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
});