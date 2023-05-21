const express = require('express')
const logger = require('./src/utils/util').logger;
const userRoutes = require('./src/routes/user.routes')
const mealRoutes = require('./src/routes/meal.routes')
const authRoutes = require('./src/routes/auth.routes')

const app = express()
const port = process.env.PORT || 3000

app.use(express.json())

app.use('*', (req, res, next) => {
    const method = req.method
    logger.info(`Method ${method} is called`)
    next()
})

//Api info
app.get('/api/info', (req, res) => {
    logger.info('Get server information');
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

app.use('/api/user', userRoutes);
app.use('/api/meal', mealRoutes);
app.use('/api', authRoutes)

app.use('*', (req, res) => {
  res.status(404).json({
    status: 404,
    message: 'Endpoint not found',
    data: {}
  });
});

// Express error handler
app.use((err, req, res, next) => {
    logger.error(err.code, err.message);
    res.status(err.code).json({
      status: err.code,
      message: err.message,
      data: {}
    });
  });

app.listen(port, () => {
  logger.info(`Share-a-Meal server listening on port ${port}`);
})

module.exports = app