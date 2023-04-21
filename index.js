const express = require('express')
const app = express()
const port = 3000
const logger = require('tracer').console()

let userIdCounter = 0;

//UC-202
let database = {
    users: [
        {
            id: 0,
            firstname: 'Jelle',
            lastname: 'van Pol',
            email: 'Jellevanpol@ziggo.nl',
            password: 'Password1!'
        },
        {
            id: 1,
            firstName: 'John',
            lastName: 'Doe',
            email: 'Johndoe@gmail.com',
            password: 'Password1!'
        },
        {
            id: 2,
            firstName: 'John',
            lastName: 'Doe',
            email: 'Johndoe@gmail.com',
            password: 'Password1!'
        }
    ]
};
let index = database.users.length;
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
    const user = req.body;

    // Check for missing fields
    if (!user.firstName || !user.lastName || !user.email || !user.password) {
        res.status(400).json({
            status: 400,
            message: 'All fields are required!',
            data: {}
        });
        return;
    }

    // Check for invalid email format
    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(user.email)) {
        res.status(400).json({
            status: 400,
            message: 'Invalid email format!',
            data: {}
        });
        return;
    }

    // Check for invalid password format
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(user.password)) {
        res.status(400).json({
            status: 400,
            message: 'Invalid password format!',
            data: {}
        });
        return;
    }

    // // Check for existing user with the same email
    // const existingUser = database.users.find(u => u.email === user.email);
    // if (existingUser) {
    //     res.status(403).json({
    //         status: 403,
    //         message: 'User already registered',
    //         data: {}
    //     });
    //     return;
    // }

    // Add the new user
    user.id = index++;
    database.users.push(user);

    res.status(201).json({
        status: 201,
        message: `User added with id ${user.id}`,
        data: user
    });
});

//UC-202
app.get('/api/user', (req, res) => {
    res.status(200).json({
        status: 200,
        message: 'User lijst endpoint',
        data: database.users
    })
});

//UC-203
app.get('/api/user/profile', (req, res) => {
    const user = { id: 1, firstName: 'John', lastName: 'Doe', email: 'john.doe@example.com' };
    res.status(200).json({
        status: 200,
        message: 'User profile endpoint',
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
        message: 'Requested user info endpoint',
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

    res.status(200).json({
        status: 200,
        message: 'User met ID ' + userId + ' deleted',
        data: {}
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