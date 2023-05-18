const logger = require('../utils/util').logger;
const assert = require('assert');
const pool = require('../utils/mysql-db');

const mealController = {
  getAllMeals: (req, res, next) => {
    logger.info('Get all meals');

    let sqlStatement = 'SELECT * FROM `meal`';
    // Hier wil je misschien iets doen met mogelijke filterwaarden waarop je zoekt.

    pool.getConnection(function (err, conn) {
      // Do something with the connection
      if (err) {
        logger.error(err.code, err.syscall, err.address, err.port);
        next({
          code: 500,
          message: err.code
        });
      }
      if (conn) {
        conn.query(sqlStatement, function (err, results, fields) {
          if (err) {
            logger.err(err.message);
            next({
              code: 409,
              message: err.message
            });
          }
          if (results) {
            logger.info('Found', results.length, 'results');
            res.status(200).json({
              code: 200,
              message: 'Meal getAll endpoint',
              data: results
            });
          }
        });
        pool.releaseConnection(conn);
      }
    });
  },

  getMeal: (req, res, next) => {
    logger.info('Get  meal');

    const mealId = parseInt(req.params.mealId);

    let sqlStatement = 'SELECT * FROM `meal` WHERE id = ? ';
    // Hier wil je misschien iets doen met mogelijke filterwaarden waarop je zoekt.

    pool.getConnection(function (err, conn) {
      // Do something with the connection
      if (err) {
        logger.error(err.code, err.syscall, err.address, err.port);
        next({
          code: 500,
          message: err.code
        });
      }
      if (conn) {
        conn.query(sqlStatement, [mealId], function (err, results, fields) {
          if (err) {
            logger.err(err.message);
            next({
              code: 409,
              message: err.message
            });
          }
          if (results) {
            logger.info('Found', results.length, 'results');
            res.status(200).json({
              code: 200,
              message: 'Meal get by id endpoint',
              data: results
            });
          }
        });
        pool.releaseConnection(conn);
      }
    });
  },

  getMealProfile: (req, res, next) => {
    logger.trace('Get meal profile for meal', req.mealId);

    let sqlStatement = 'SELECT * FROM `meal` WHERE id=?';

    pool.getConnection(function (err, conn) {
      // Do something with the connection
      if (err) {
        logger.error(err.code, err.syscall, err.address, err.port);
        next({
          code: 500,
          message: err.code
        });
      }
      if (conn) {
        conn.query(sqlStatement, [req.mealId], (err, results, fields) => {
          if (err) {
            logger.error(err.message);
            next({
              code: 409,
              message: err.message
            });
          }
          if (results) {
            logger.trace('Found', results.length, 'results');
            res.status(200).json({
              code: 200,
              message: 'Get meal profile',
              data: results[0]
            });
          }
        });
        pool.releaseConnection(conn);
      }
    });
  },

  createMeal: (req, res, next) => {
    const userId = req.userId
    logger.info('Create new meal, cookId = ' + userId);

    // De mealgegevens zijn meegestuurd in de request body.
    const meal = req.body;
    logger.trace('meal = ', meal);

    // Hier zie je hoe je binnenkomende meal info kunt valideren.
    try {
      // assert(meal === {}, 'mealinfo is missing');
      assert(typeof meal.firstName === 'string', 'firstName must be a string');
      assert(
        typeof meal.emailAdress === 'string',
        'emailAdress must be a string'
      );
    } catch (err) {
      logger.warn(err.message.toString());
      // Als één van de asserts failt sturen we een error response.
      next({
        code: 400,
        message: err.message.toString(),
        data: undefined
      });

      // Nodejs is asynchroon. We willen niet dat de applicatie verder gaat
      // wanneer er al een response is teruggestuurd.
      return;
    }

    /**
     * De rest van deze functie maak je zelf af!
     * Voor tips, zie de PDF van de les over authenticatie.
     */
    let sqlStatement = 'INSERT INTO `meal` ( `name`, `description`, `imageUrl`, `dateTime`, `maxAmountOfParticipants`, `price`, `cookId`) VALUES' +
      "(?, ?, ?, ?, ?, ?, ?);" +
      'SELECT * from `user` WHERE id =? '

    pool.getConnection(function (err, conn) {
      // Do something with the connection
      if (err) {
        logger.error(err.code, err.syscall, err.address, err.port);
        next({
          code: 500,
          message: err.code
        });
      }
      if (conn) {
        conn.query(sqlStatement, [meal.name, meal.description, meal.imageUrl, meal.dateTime, meal.maxAmountOfParticipants, meal.price, userId, userId], function (err, results, fields) {
          if (err) {
            logger.err(err.message);
            next({
              code: 409,
              message: err.message
            });
          }
          if (results) {
            logger.trace('Meal successfully added, id =', results.insertId);
            results[0].insertId
          }
        });
        pool.releaseConnection(conn);
      }
    });
  },

  deleteMeal: (req, res, next) => {
    const mealId = req.params.mealId
    const userId = req.userId

    logger.trace('Deleting meal id' + mealId + 'by user' + userId)
    let sqlStatement = 'DELETE FROM `meal` WHERE id=? AND cookId=? '


    pool.getConnection(function (err, conn) {
      // Do something with the connection
      if (err) {
        logger.error(err.code, err.syscall, err.address, err.port);
        next({
          code: 500,
          message: err.code
        });
      }
      if (conn) {
        conn.query(sqlStatement, [mealId, userId], function (err, results, fields) {
          if (err) {
            logger.err(err.message);
            next({
              code: 409,
              message: err.message
            });
          }
          if (results && results.affectedRows === 1) {
            logger.trace('results: ', results);
            res.status(200).json({
              code: 200,
              message: 'Meal deleted with id' + mealId,
              data: {}
            })
          } else {
            next({
              code: 401,
              message: 'Not authorized',
              data: {}
            })
          }
        });
        pool.releaseConnection(conn);
      }
    });
  }
};

module.exports = mealController;
