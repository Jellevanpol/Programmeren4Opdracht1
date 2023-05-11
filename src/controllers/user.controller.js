const pool = require('../utils/mysql-db')
const logger = require('../utils/util').logger

const userController = {
    //UC-201
     createUser: (req, res, next) => {
        pool.getConnection(function (err, conn) {
          if (err) {
            console.log('error');
            next('error: ' + err.message);
          } else {
            conn.query(
              'SELECT COUNT(*) AS count FROM `user`',
              function (err, results) {
                if (err) {
                  res.status(500).json({
                    status: 500,
                    message: err.sqlMessage,
                    data: {},
                  });
                } else {
                  const count = results[0].count;
                  const userId = count + 1;
      
                  const user = {
                    id: userId,
                    firstName: req.body.firstName,
                    lastName: req.body.lastName,
                    isActive: 1, // Updated property name to 'active'
                    emailAdress: req.body.emailAdress,
                    password: req.body.password,
                    phoneNumber: req.body.phoneNumber,
                    roles: req.body.roles,
                    street: req.body.street,
                    city: req.body.city,
                  };
      

                            // Check for missing fields
                            function validateField(fieldName, fieldType, fieldValue) {
                                if (!fieldValue || typeof fieldValue !== fieldType) {
                                    res.status(400).json({
                                        status: 400,
                                        message: `${fieldName} (${fieldType}) is invalid!`,
                                        data: {},
                                    });
                                    return false;
                                }
                                return true;
                            }

                            if (
                                !validateField('firstName', 'string', user.firstName) ||
                                !validateField('lastName', 'string', user.lastName) ||
                                !validateField('emailAdress', 'string', user.emailAdress) ||
                                !validateField('password', 'string', user.password) ||
                                !validateField('phoneNumber', 'string', user.phoneNumber)
                            ) {
                                return;
                            }

                            conn.query(
                                'INSERT INTO `user` (`id`, `firstName`, `lastName`, `emailAdress`, `password`, `phoneNumber`, `roles`, `street`, `city`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
                                [
                                    user.id,
                                    user.firstName,
                                    user.lastName,
                                    user.emailAdress,
                                    user.password,
                                    user.phoneNumber,
                                    user.roles,
                                    user.street,
                                    user.city,
                                ],
                                function (err, results) {
                                    if (err) {
                                        res.status(500).json({
                                            status: 500,
                                            message: err.sqlMessage,
                                            data: {},
                                        });
                                    } else {
                                        logger.info('results: ', results); // results contains rows returned by server
                                        res.status(200).json({
                                            status: 200,
                                            message: 'User added with id ' + user.id,
                                            data: user,
                                        });
                                    }
                                }
                            );
                        }
                        pool.releaseConnection(conn);
                    }
                );
            }
        });
    },

    //UC-202
    getAllUsers: (req, res, next) => {
        const active = req.query.isActive;
        const name = req.query.name;
        const method = req.body
        logger.info(`Method ${method} is called`)

        pool.getConnection(function (err, conn) {
            if (err) {
                console.log('error')
                next('error: ' + err.message)
            }
            if (conn) {
                conn.query(
                    'SELECT * FROM `user`',
                    function (err, results) {
                        if (err) {
                            res.status(500).json({
                                status: 500,
                                message: err.sqlMessage,
                                data: {}
                            })
                        }
                        logger.info('results: ', results); // results contains rows returned by server
                        res.status(200).json({
                            status: 200,
                            message: 'User getAll endpoint',
                            data: results
                        })
                    }
                );
                pool.releaseConnection(conn)
            }
        })
    },

    //UC-203
    getProfile: (req, res) => {
        const testProfile = {
            id: 0,
            firstName: 'Test',
            lastName: 'test',
            emailAdress: 'Test@ziggo.nl',
            phoneNumber: '0624994423',
            password: 'Password1!',
            isActive: 1
        }

        const method = req.body
        logger.info(`Method ${method} is called`)

        res.status(200).json({
            status: 200,
            message: 'User profile endpoint, nog niet geïmplementeerd',
            data: testProfile

        })
    },

    //UC-204
    getUser: (req, res, next) => {
        const userId = parseInt(req.params.userId)
        pool.getConnection(function (err, conn) {
            // Do something with the connection
            if (err) {
                console.log('error')
                next('error: ' + err.message)
            }
            if (conn) {
                conn.query(
                    'SELECT * FROM `user` WHERE `id` = ?', [userId],
                    function (err, results) {
                        if (err) {
                            res.status(500).json({
                                status: 500,
                                message: err.sqlMessage,
                                data: {}
                            })
                        } if (results.length !== 0) { // check if results is an empty array
                            res.status(200).json({
                                status: 200,
                                message: 'Requested user info endpoint',
                                data: results
                            })
                        } else if (results.length === 0) { // check if results is an empty array
                            res.status(404).json({
                                status: 404,
                                message: 'User not found',
                                data: {}
                            });
                            return;
                        }
                        logger.info('results: ', results); // results contains rows returned by server
                    }
                );
                pool.releaseConnection(conn)
            }
        })
    },

    //UC-205
    updateUser: (req, res, next) => {
        pool.getConnection(function (err, conn) {
            if (err) {
                console.log('error')
                next('error: ' + err.message)
            }
            if (conn) {
                const userId = parseInt(req.params.userId)
                const user = {
                    id: userId,
                    firstName: req.body.firstName,
                    lastName: req.body.lastName,
                    isActive: req.body.isActive,
                    emailAdress: req.body.emailAdress,
                    password: req.body.password,
                    phoneNumber: req.body.phoneNumber,
                    roles: req.body.roles,
                    street: req.body.street,
                    city: req.body.city
                };

                // Check for missing fields
                function validateField(fieldName, fieldType, fieldValue) {
                    if (fieldValue === undefined || fieldValue === null || fieldValue === '') {
                        res.status(400).json({
                            status: 400,
                            message: `${fieldName} is required`,
                            data: {}
                        });
                        return false;
                    }
                
                    if (typeof fieldValue !== fieldType) {
                        res.status(400).json({
                            status: 400,
                            message: `${fieldName} (${fieldType}) is invalid!`,
                            data: {}
                        });
                        return false;
                    }
                
                    return true;
                }

                if (
                    !validateField('firstName', 'string', user.firstName) ||
                    !validateField('lastName', 'string', user.lastName) ||
                    !validateField('emailAdress', 'string', user.emailAdress) ||
                    !validateField('password', 'string', user.password) ||
                    !validateField('phoneNumber', 'string', user.phoneNumber) ||
                    !validateField('isActive', 'boolean', user.isActive) // Updated validation for isActive field
                  ) {
                    return;
                  }

                conn.query(
                    'UPDATE `user` SET `firstName` = ?, `lastName` = ?, `isActive` = ?, `emailAdress` = ?, `password` = ?, `phoneNumber` = ?, `roles` = ?, `street` = ?, `city` = ? WHERE `id` = ?',
                    [user.firstName, user.lastName, user.isActive, user.emailAdress, user.password, user.phoneNumber, user.roles, user.street, user.city, user.id],
                    function (err, results) {
                        if (err) {
                            res.status(500).json({
                                status: 500,
                                message: err.sqlMessage,
                                data: {}
                            });
                            return;
                        }

                        logger.info('results: ', results); // results contains rows affected by server
                        res.status(200).json({
                            status: 200,
                            message: 'User updated with id ' + user.id,
                            data: user
                        });
                        pool.releaseConnection(conn);
                    }
                );
            }
        })
    },

    //UC-206
    deleteUser: (req, res, next) => {
        const userId = parseInt(req.params.userId);
        pool.getConnection(function (err, conn) {
          if (err) {
            console.log('error getting connection:', err);
            next('error: ' + err.message);
            return;
          }
          if (conn) {
            // Delete associated meals first
            conn.query(
              'DELETE FROM `meal` WHERE `cookId` = ?',
              [userId],
              function (err, results) {
                if (err) {
                  console.log('error deleting meals:', err);
                  res.status(500).json({
                    status: 500,
                    message: err.sqlMessage,
                    data: {}
                  });
                  return;
                }
                // Proceed with deleting the user
                conn.query(
                  'DELETE FROM `user` WHERE `id` = ?',
                  [userId],
                  function (err, results) {
                    if (err) {
                      console.log('error deleting user:', err);
                      res.status(500).json({
                        status: 500,
                        message: err.sqlMessage,
                        data: {}
                      });
                      return;
                    }
                    res.status(200).json({
                      status: 200,
                      message: 'User deleted with id ' + userId,
                      data: results
                    });
                  }
                );
              }
            );
            pool.releaseConnection(conn);
          }
        });
      },
}

module.exports = userController