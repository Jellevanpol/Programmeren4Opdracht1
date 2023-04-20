const express = require('express')
const app = express()
const port = 3000

//UC-201
let userIdCounter = 0;

app.use(express.json())
app.use('*', (req, res, next) => {
    const method = req.method
    console.log(`Methode ${method} is aangeroepen`)
    next()
})

app.get('/api/info', (req, res) => {
    // let path = req.request.path
    // console.log(`op route ${path}`)
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
    console.log(`Example app listening on port ${port}`)
})

//UC-201
app.post('/api/register', (req, res) => {
    const { name, email } = req.body;


    if (!name || typeof (name) !== 'string' || name.trim().length === 0) {
        res.status(400).send({ message: 'Invalid name provided' });
        return;
    }
    if (!email || typeof (email) !== 'string' || !email.includes('@')) {
        res.status(400).send({ message: 'Invalid email provided' });
        return;
    }

    const id = ++userIdCounter;
    const newUser = { id, name, email };
    res.send({ user: newUser });
    console.log('registered ' + name)
});

//UC-202
let database = {
    users: [
        {
            firstname: 'Jelle',
            lastname: 'van Pol',
            email: 'Jellevanpol@ziggo.nl'
        }
    ]
};

app.get('/api/user', (req, res) => {
    res.status(200).json({
        status: 201,
        message: 'User info endpoint',
        data: database.users
    })
    console.log("Lijst ontvangen")
});


//UC-203
app.get('/api/user/profile', (req, res) => {
    const user = { id: 1, name: 'John Doe', email: 'john.doe@example.com' };
    res.send(user)
    console.log(user + ' has been send')
});

//UC-204
app.get('/api/user/:userId', (req, res) => {
    const userId = parseInt(req.params.userId);

    const user = { id: 1, name: 'John doe', email: 'john.doe@example.com', password: 'Password' }
    res.send(user)
    console.log(user)
});

//UC-205

app.put('/api/user/:userId', (req, res) => {
    const { name, email } = req.body
    const userId = parseInt(req.params.userId)

    console.log(name + ' ' + email + ' updated')
});

//UC-206
app.delete('/api/user/:userId', (req, res) => {
    const userId = parseInt(req.params.userId)
    const user = { id: 1, name: 'John doe', email: 'john.doe@example.com', password: 'Password' }


    res.send(user.id + ' ' + user.name + ' deleted')
    console.log(user + ' deleted')
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