const express = require('express')
const app = express()
const port = process.env.PORT || 3000
const logger = require('./src/utils/util').logger;
const userRoutes = require('./src/routes/user.routes')

app.use(express.json())

app.use('*', (req, res, next) => {
    const method = req.method
    logger.info(`Method ${method} is called`)
    next()
})

app.listen(port, () => {
    logger.log(`Example app listening on port ${port}`)
})

//Api info
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


app.use('/api/user', userRoutes)


app.use('*', (req, res) => {
    res.status(404).json({
        status: 404,
        message: 'Endpoint not found',
        data: {

        }
    })
})

module.exports = app