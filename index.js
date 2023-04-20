const express = require('express')
const app = express()
const port = 3000
const logger = require('tracer').console()

let userIdCounter = 0;

app.use(express.json())
app.use('*', (req, res, next) => {
    const method = req.method
    logger.log(`Method ${method} is called with parameters ${JSON.stringify(req.params)} and body ${JSON.stringify(req.body)}`)
    next()
})

app.get('/api/info', (req, res) => {
    res.status(201).json({
        status: 201,
        message: 'Server info-endpoint',
        data: {
            studentName: 'Jelle',
            studentNumber: 2203205,
            description: 'Welkom bij de server API van de share-a-meal'
        },
    })
});

app.listen(port, () => {
    logger.log(`Example app listening on port ${port}`)
})

//UC-201
app.post('/api/register', (req, res) => {
    const { firstName, lastName, email } = req.body;
    if (!firstName || typeof (firstName) !== 'string' || firstName.trim().length === 0) {
        res.status(400).send({ message: 'Invalid name provided' });
        return;
    }
    if (!email || typeof (email) !== 'string' || !email.includes('@')) {
        res.status(400).send({ message: 'Invalid email provided' });
        return;
    }
    const id = ++userIdCounter;
    const newUser = { id, firstName, lastName, email };
    res.status(200).json({
        status: 201,
        message: 'User register endpoint',
        data: {
            newUser
        }
    })
});

//UC-202
let database = {
    users: [
        {
            id: 1,
            firstname: 'Jelle',
            lastname: 'van Pol',
            email: 'Jellevanpol@ziggo.nl'
        },
        {
            id: 2,
            firstName: 'John',
            lastName: 'Doe',
            email: 'Johndoe@gmail.com'
        }
    ]
};

app.get('/api/user', (req, res) => {
    res.status(200).json({
        status: 200,
        message: 'User info endpoint',
        data: database.users
    })
});


//UC-203
app.get('/api/user/profile', (req, res) => {
    const user = { id: 1, name: 'John Doe', email: 'john.doe@example.com' };
    res.status(200).json({
        status: 200,
        message: 'User info endpoint',
        data: user
    })
});

//UC-204
app.get('/api/user/:userId', (req, res) => {
    const userId = parseInt(req.params.userId);

    const user = database.users.find(user => user.id === userId)
    if (!user) {
        res.status(404).json({
          status: 404,
          message: 'User not found',    
          data: user
        });
        return;
      }
    res.status(200).json({
        status: 200,
        message: 'User info endpoint',
        data: user
    })
});

//UC-205

app.put('/api/user/:userId', (req, res) => {
    const userId = parseInt(req.params.userId); // convert userId to an integer
    const user = database.users.find(user => user.id === userId);

    if (!user) {
      res.status(404).json({
        status: 404,
        message: 'User not found',
        data: {}
      });
      return;
    }

    const { firstName, lastName, email } = req.body;

    // update user information
    user.firstName = firstName;
    user.lastName = lastName;
    user.email = email;

    res.status(200).json({
      status: 200,
      message: 'User updated successfully',
      data: {
        user
      }
    });

  });

//UC-206
app.delete('/api/user/:userId', (req, res) => {
    const userId = parseInt(req.params.userId);
    const userIndex = database.users.findIndex(user => user.id === userId);

    if (!userIndex) {
        res.status(404).json({
            status: 404,
            message: 'User not found',
            data: {}
        });
        return;
    }

    const deletedUser = database.users.splice(userIndex, 1)[0];

    res.status(200).json({
        status: 200,
        message: 'User deleted successfully',
    });

});

app.use('*', (req, res) => {
    res.status(404).json({
        status: 404,
        message: 'Endpoint not found',
        data: {

        }
    })
})

module.exports = app