const express = require('express')
const app = express()
const port = 3000
const logger = require('./src/utils/util').logger;

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
    ]
};

let index = database.users.length;
app.use(express.json())

app.use('*', (req, res, next) => {
    const method = req.method
    logger.log(`Method ${method} is called with parameters ${JSON.stringify(req.params)} and body ${JSON.stringify(req.body)}`)
    next()
})

app.listen(port, () => {
    logger.log(`Example app listening on port ${port}`)
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

//UC-201
app.post('/api/register', (req, res) => {
    const user = req.body;

    // Check for missing fields
    if (!user.firstName || typeof user.firstName !== 'string') {
        res.status(400).json({
            status: 400,
            message: 'firstName (string) is invalid!',
            data: {}
        });
        return;
    }
    
    if (!user.lastName || typeof user.lastName !== 'string') {
        res.status(400).json({
            status: 400,
            message: 'lastName (string) is invalid!',
            data: {}
        });
        return;
    }
    
    if (!user.email || typeof user.email !== 'string') {
        res.status(400).json({
            status: 400,
            message: 'email (string) is invalid!',
            data: {}
        });
        return;
    }
    
    if (!user.password || typeof user.password !== 'string' ) {
        res.status(400).json({
            status: 400,
            message: 'password (string) is invalid!',
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

    const phoneNumberRegex = /^(06)[0-9]{8}$/
    if (!phoneNumberRegex.test(user.phoneNumber)) {
        res.status(400).json({
            status: 400,
            message: 'Invalid phonenumber format!',
            data: {}
        });
        return;
    }


    // Check for existing user with the same email
    const existingUser = database.users.find(u => u.email === user.email);
    if (existingUser) {
        res.status(403).json({
            status: 403,
            message: 'User already registered',
            data: {}
        });
        return;
    }

    // Add the new user
    user.Active = true
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
    const active = req.query.active;
    const name = req.query.name;
    let filteredUsers = database.users;

    const allowedFilters = ['active', 'name'];
    const invalidFilters = Object.keys(req.query).filter(key => !allowedFilters.includes(key));
    if (invalidFilters.length) {
        res.status(400).json({
            status: 400,
            message: 'No valid filter(s) found',
            data: []
        });
        return;
    }

    if (name) {
        const pattern = new RegExp(name, 'i');
        filteredUsers = filteredUsers.filter(user => pattern.test(user.firstName));
    }

    if (active === 'true') {
        filteredUsers = filteredUsers.filter(user => user.Active === true);
    } else if (active === 'false') {
        filteredUsers = filteredUsers.filter(user => user.Active === false);
    }

    // Return all users if no query has been used
    if (!active && !name) {
        res.status(200).json({
            status: 200,
            message: 'All users',
            data: filteredUsers
        });
    } else if (Object.keys(req.query).some(key => key !== 'name' && key !== 'active')) {
        // Return empty list if query other than name or active is used
        res.status(200).json({
            status: 200,
            message: 'Invalid query',
            data: []
        });
    } else {
        // Filter users based on the provided query parameters
        res.status(200).json({
            status: 200,
            message: 'Filtered users',
            data: filteredUsers
        });
    }
});

//UC-203
app.get('/api/user/profile', (req, res) => {
    res.status(200).json({
        status: 200,
        message: 'User profile endpoint, nog niet geïmplementeerd',
        data: {}
    })
});

//UC-204
app.get('/api/user/:userId', (req, res) => {
    const userId = parseInt(req.params.userId)
    const user = database.users.find(user => user.id === userId)
    if (!user) {
        res.status(404).json({
            status: 404,
            message: 'User not found',
            data: {}
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
    const { firstName, lastName, email, password, phoneNumber } = req.body;
    if (email === undefined) {
        res.status(400).json({
            status: 400,
            message: 'Email is undefined',
            data: {}
        });
    }

    if(phoneNumber === undefined){
        res.status(400).json({
            status: 400,
            message: 'Phonenumber is undefined',
            data: {}
        })
    }
    // Check for invalid email format
    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(email)) {
        res.status(400).json({
            status: 400,
            message: 'Invalid email format!',
            data: {}
        });
        return;
    }

    const phoneNumberRegex = /^(06)[0-9]{8}$/
    if (!phoneNumberRegex.test(phoneNumber)) {
        res.status(400).json({
            status: 400,
            message: 'Invalid phonenumber format! (i.e. 0612345678)',
            data: {}
        });
        return;
    }

    // Check for invalid password format
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
        res.status(400).json({
            status: 400,
            message: 'Invalid password format!',
            data: {}
        });
        return;
    }


    
    // update user information
    user.firstName = firstName;
    user.lastName = lastName;
    user.email = email;
    user.password = password

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
    const userIndex = database.users.find(user => user.id === userId);
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