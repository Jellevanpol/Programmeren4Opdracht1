//In memory database
let database = {
    users: [
        {
            id: 0,
            firstName: 'Jelle',
            lastName: 'van Pol',
            email: 'Jellevanpol@ziggo.nl',
            phoneNumber: '0627849603',
            password: 'Password1!',
            active: true
        },
        {
            id: 1,
            firstName: 'John',
            lastName: 'Doe',
            email: 'Johndoe@gmail.com',
            phoneNumber: '0683917300',
            password: 'Password1!',
            active: true
        },
        {
            id: 2,
            firstName: 'John',
            lastName: 'Doe',
            email: 'Johndoe2@gmail.com',
            password: 'Password1!',
            phoneNumber: '0696547823',
            active: false
        }
    ],

    index: 3
};

module.exports = database
//module.exports = database.index