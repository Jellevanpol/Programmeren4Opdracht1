const pool = require('../utils/mysql-db')
const logger = require('../utils/util').logger

const userController = {
    //UC-201
    createUser: (req, res, next) => {
        // // Check for invalid email format
        // const emailRegex = /\S+@\S+\.\S+/;
        // if (!emailRegex.test(user.email)) {
        //     res.status(400).json({
        //         status: 400,
        //         message: 'Invalid email format!',
        //         data: {}
        //     });
        //     return;
        // }

        // // Check for invalid password format
        // const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        // if (!passwordRegex.test(user.password)) {
        //     res.status(400).json({
        //         status: 400,
        //         message: 'Invalid password format!',
        //         data: {}
        //     });
        //     return;
        // }

        // const phoneNumberRegex = /^(06)[0-9]{8}$/
        // if (!phoneNumberRegex.test(user.phoneNumber)) {
        //     res.status(400).json({
        //         status: 400,
        //         message: 'Invalid phonenumber format!',
        //         data: {}
        //     });
        //     return;
        // }


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

        // // Add the new user
        // user.active = true
        // user.id = database.index++
        // database.users.push(user);

        // res.status(201).json({
        //     status: 201,
        //     message: `User added with id ${user.id}`,
        //     data: user
        // });

        pool.getConnection(function (err, conn) {
            if (err) {
                console.log('error')
                next('error: ' + err.message)
            }
            if (conn) {
                conn.query(
                    'SELECT COUNT(*) AS count FROM `user`',
                    function (err, results) {
                        if (err) {
                            res.status(500).json({
                                status: 500,
                                message: err.sqlMessage,
                                data: {}
                            });
                            return;
                        }

                        const count = results[0].count;
                        const userId = count + 1;

                        const user = {
                            id: userId,
                            firstName: req.body.firstName,
                            lastName: req.body.lastName,
                            isActive: 1,
                            emailAdress: req.body.emailAdress,
                            password: req.body.password,
                            phoneNumber: req.body.phoneNumber,
                            roles: req.body.roles,
                            street: req.body.street,
                            city: req.body.city
                        };

                        // Check for missing fields
                        function validateField(fieldName, fieldType, fieldValue) {
                            if (!fieldValue || typeof fieldValue !== fieldType) {
                                res.status(400).json({
                                    status: 400,
                                    message: `${fieldName} (${fieldType}) is invalid!`,
                                    data: {}
                                });
                                return false;
                            }
                            return true;
                        }

                        if (!validateField('firstName', 'string', user.firstName) ||
                            !validateField('lastName', 'string', user.lastName) ||
                            !validateField('email', 'string', user.emailAdress) ||
                            !validateField('password', 'string', user.password) ||
                            !validateField('phoneNumber', 'string', user.phoneNumber)
                        ) {
                            return;
                        }
                        conn.query(
                            'INSERT INTO `user` (`id`, `firstName`, `lastName`, `emailAdress`, `password`, `phoneNumber`, `roles`, `street`, `city`) VALUES ( ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                            [user.id, user.firstName, user.lastName, user.emailAdress, user.password, user.phoneNumber, user.roles, user.street, user.city],
                            function (err, results) {
                                if (err) {
                                    res.status(500).json({
                                        status: 500,
                                        message: err.sqlMessage,
                                        data: {}
                                    });
                                    return;
                                }

                                logger.info('results: ', results); // results contains rows returned by server
                                res.status(200).json({
                                    status: 200,
                                    message: 'User added with id ' + user.id,
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

    //UC-202
    getAllUsers: (req, res, next) => {
        const active = req.query.active;
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
            email: 'Test@ziggo.nl',
            phoneNumber: '0624994423',
            password: 'Password1!',
            active: true
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
    getUser: (req, res) => {
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
        const userId = parseInt(req.params.userId)
        // const userId = parseInt(req.params.userId); // convert userId to an integer
        // const user = database.users.find(user => user.id === userId);


        // if (!user) {
        //     res.status(404).json({
        //         status: 404,
        //         message: 'User not found',
        //         data: {}
        //     });
        //     return;
        // }
        // const { firstName, lastName, email, password, phoneNumber } = req.body;
        // if (!firstName || typeof firstName !== 'string') {
        //     res.status(400).json({
        //         status: 400,
        //         message: 'firstName (string) is invalid!',
        //         data: {}
        //     });
        //     return;
        // }

        // if (!lastName || typeof lastName !== 'string') {
        //     res.status(400).json({
        //         status: 400,
        //         message: 'lastName (string) is invalid!',
        //         data: {}
        //     });
        //     return;
        // }

        // if (!email || typeof email !== 'string') {
        //     res.status(400).json({
        //         status: 400,
        //         message: 'email (string) is invalid!',
        //         data: {}
        //     });
        //     return;
        // }

        // if (!password || typeof password !== 'string') {
        //     res.status(400).json({
        //         status: 400,
        //         message: 'password (string) is invalid!',
        //         data: {}
        //     });
        //     return;
        // }

        // // Check for invalid email format
        // const emailRegex = /\S+@\S+\.\S+/;
        // if (!emailRegex.test(email)) {
        //     res.status(400).json({
        //         status: 400,
        //         message: 'Invalid email format!',
        //         data: {}
        //     });
        //     return;
        // }

        // const phoneNumberRegex = /^(06)[0-9]{8}$/
        // if (!phoneNumberRegex.test(phoneNumber)) {
        //     res.status(400).json({
        //         status: 400,
        //         message: 'Invalid phonenumber format! (i.e. 0612345678)',
        //         data: {}
        //     });
        //     return;
        // }

        // // Check for invalid password format
        // const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        // if (!passwordRegex.test(password)) {
        //     res.status(400).json({
        //         status: 400,
        //         message: 'Invalid password format!',
        //         data: {}
        //     });
        //     return;
        // }



        // // update user information
        // user.firstName = firstName;
        // user.lastName = lastName;
        // user.email = email;
        // user.password = password
        // user.phoneNumber = phoneNumber

        // res.status(200).json({
        //     status: 200,
        //     message: 'User updated successfully',
        //     data: {
        //         user
        //     }
        // });
        pool.getConnection(function (err, conn) {
            if (err) {
                console.log('error')
                next('error: ' + err.message)
            }
            if (conn) {
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
                    if (!fieldValue || typeof fieldValue !== fieldType) {
                        res.status(400).json({
                            status: 400,
                            message: `${fieldName} (${fieldType}) is invalid!`,
                            data: {}
                        });
                        return false;
                    }
                    return true;
                }

                if (!validateField('firstName', 'string', user.firstName) ||
                    !validateField('lastName', 'string', user.lastName) ||
                    !validateField('email', 'string', user.emailAdress) ||
                    !validateField('password', 'string', user.password) ||
                    !validateField('phoneNumber', 'string', user.phoneNumber) ||
                    !validateField('isActive', 'number', user.isActive)
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
    deleteUser: (req, res) => {
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

        database.users.splice(userIndex, 1);

        res.status(200).json({
            status: 200,
            message: 'User met ID ' + userId + ' deleted',
            data: {}
        });
    }
}

module.exports = userController