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
    logger.info('Get meal');
    const mealId = parseInt(req.params.mealId);
    let sqlStatement = 'SELECT * FROM `meal` WHERE id = ? ';

    pool.getConnection(function (err, conn) {
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
            logger.error(err.message);
            next({
              code: 409,
              message: err.message
            });
          } else if (results.length === 0) {
            logger.info('Meal not found');
            next({
              code: 404,
              message: 'Meal not found'
            });
          } else {
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
    var currentDate = new Date();
    var dateTime = currentDate.toISOString().slice(0, 19).replace("T", " ");

    logger.info('Create new meal, cookId = ' + userId);

    // De mealgegevens zijn meegestuurd in de request body.
    const meal = req.body;
    logger.trace('meal = ', meal);
    const isActive = 1
    // Hier zie je hoe je binnenkomende meal info kunt valideren.
    try {
      assert(typeof meal.isVega === 'number', 'isVega must be a number');
      assert(typeof meal.isVegan === 'number', 'isVegan must be a number');
      assert(typeof meal.isToTakeHome === 'number', 'isToTakeHome must be a number');
      assert(typeof meal.maxAmountOfParticipants === 'number', 'maxAmountOfParticipants must be a number');
      assert(typeof meal.price === 'string', 'price must be a string');
      assert(typeof meal.imageUrl === 'string', 'imageUrl must be a string');
      assert(typeof meal.name === 'string', 'name must be a string');
      assert(typeof meal.description === 'string', 'description must be a string');
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

    //Goeie
    // let sqlStatement = 'INSERT INTO `meal` (`isActive`, `isVega`, `isVegan`, `isToTakeHome`, `dateTime`, `maxAmountOfParticipants`, `price`, `imageUrl`, `name`, `description`, `allergenes`, `cookId`) VALUES' +
    //   "(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?); " +
    //   'Select * FROM user WHERE id=? '
    let sqlStatement = 'INSERT INTO `meal` (`isActive`, `isVega`, `isVegan`, `isToTakeHome`, `dateTime`, `maxAmountOfParticipants`, `price`, `imageUrl`, `name`, `description`, `allergenes`, `cookId`) VALUES' +
      "(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?); " +
      'Select * FROM user WHERE id=? '
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
        conn.query(sqlStatement, [isActive, meal.isVega, meal.isVegan, meal.isToTakeHome, dateTime, meal.maxAmountOfParticipants, meal.price, meal.imageUrl,
          meal.name, meal.description, meal.allergenes, userId, userId],
          function (err, results, fields) {
            if (err) {
              logger.error(err.message);
              next({
                code: 409,
                message: err.message
              });
            }
            if (results) {
              const mealId = results.insertId
              logger.trace('Meal successfully added, id =', results[0].insertId);
              res.status(201).json({
                code: 201,
                message: "meal created with id " + results[0].insertId,
                data: { mealId, ...meal }
              })
            }
          });
        pool.releaseConnection(conn);
      }
    });
  },

  updateMeal: (req, res, next) => {
    const meal = req.body;
    const mealId = req.params.mealId;
    const userId = req.userId;
    logger.info("Update meal by id =", mealId, "by user", userId);

    try {
      assert(typeof req.body.isActive === "number", "isActive must be a number");
      assert(typeof req.body.isVega === "number", "isVega must be a number");
      assert(typeof req.body.isVegan === "number", "Description must be a number");
      assert(
        typeof req.body.isToTakeHome === "number",
        "isToTakeHome must be a number"
      );
      assert(
        typeof req.body.maxAmountOfParticipants === "number",
        "maxAmountOfParticipants must be a number"
      );
      assert(typeof req.body.price === "string", "Price must be a string");
      assert(typeof req.body.imageUrl === "string", "imageUrl must be a string");
      assert(typeof req.body.name === "string", "name must be a string");
      assert(
        typeof req.body.description === "string",
        "Description must be a string"
      );
      assert(
        typeof req.body.allergenes === "string",
        "Allergenes must be a string"
      );
    } catch (err) {
      logger.warn(err.message.toString());
      // If any of the assertions fail, send an error response.
      next({
        code: 400,
        message: "Invalid input for one or more fields",
        data: {},
      });

      return;
    }

    let sqlStatement =
      'UPDATE `meal` SET `isActive`=?, `isVega`=?, `isVegan`=?, `isToTakeHome`=?, `maxAmountOfParticipants`=?, `price`=?, `imageUrl`=?, `name`=?, `description`=?, `allergenes`=? WHERE `id`=? AND `cookId`=?';

    pool.getConnection(function (err, conn) {
      if (err) {
        logger.error(err.code, err.syscall, err.address, err.port);
        next({
          code: 500,
          message: err.code,
        });
      }
      if (conn) {
        conn.query(
          sqlStatement,
          [
            req.body.isActive,
            req.body.isVega,
            req.body.isVegan,
            req.body.isToTakeHome,
            req.body.maxAmountOfParticipants,
            req.body.price,
            req.body.imageUrl,
            req.body.name,
            req.body.description,
            req.body.allergenes,
            mealId,
            userId,
          ],
          (err, results, fields) => {
            if (err) {
              logger.error(err.message);
              next({
                code: 409,
                message: err.message,
              });
            }
            if (results && results.affectedRows > 0) {
              logger.trace(results);
              logger.info("Found", results.length, "results");
              res.status(200).json({
                statusCode: 200,
                message: "Meal updated with id: " + mealId,
                data: meal,
              });
            } else {
              logger.info("Not authorized to update meal with id: " + mealId);
              res.status(403).json({ // Change the status code to 403
                statusCode: 403,
                message: "Not authorized",
                data: {}
              });
            }
          }
        );
        pool.releaseConnection(conn);
      }
    });
  },

  deleteMeal: (req, res, next) => {
    const mealId = req.params.mealId;
    const userId = req.userId;

    logger.trace("Deleting meal id", mealId, "by user", userId);
    let sqlStatement = "DELETE FROM `meal` WHERE id=? AND cookId=? ";

    pool.getConnection(function (err, conn) {
      if (err) {
        logger.error(err.code, err.syscall, err.address, err.port);
        next({
          code: 500,
          message: err.code,
        });
      }
      if (conn) {
        // Check if the meal exists
        const checkMealSql = "SELECT * FROM `meal` WHERE `id` = ?";
        conn.query(checkMealSql, [mealId], function (err, mealResults) {
          if (err) {
            logger.error(err.message);
            next({
              code: 409,
              message: err.message,
            });
          }
          if (mealResults && mealResults.length === 0) {
            logger.info("Meal not found with id:", mealId);
            res.status(404).json({
              statusCode: 404,
              message: "Meal not found",
              data: {},
            });
          } else if (mealResults[0].cookId !== userId) {
            logger.info("You are not the owner of this data!");
            res.status(403).json({
              statusCode: 403,
              message: "Not authorized",
              data: {},
            });
          } else {
            conn.query(
              sqlStatement,
              [mealId, userId],
              function (err, results, fields) {
                if (err) {
                  logger.err(err.message);
                  next({
                    code: 409,
                    message: err.message,
                  });
                }
                if (results && results.affectedRows === 1) {
                  logger.trace("results:", results);
                  res.status(200).json({
                    code: 200,
                    message: "Meal deleted with id " + mealId,
                    data: {},
                  });
                } else {
                  next({
                    code: 401,
                    message: "Not authorized",
                    data: {},
                  });
                }
              }
            );
          }
        });
        pool.releaseConnection(conn);
      }
    });
  }
};

module.exports = mealController;