const express = require('express');
const router = express.Router();
const mealController = require('../controllers/meal.controller');
const authController = require('../controllers/authentication.controller');

// Hier werk je de routes uit.

// UC-301 Registreren als nieuwe meal
router.post('', authController.validateToken ,mealController.createMeal);

// UC-302 Opvragen van overzicht van meals
router.get('', authController.validateToken, mealController.getAllMeals);

//Delete
router.delete('/:mealId', authController.validateToken, mealController.deleteMeal);

// router.get('', mealController.getAllMeals);

// UC-303 Haal het mealprofile op van de meal die ingelogd is
router.get(
  '/profile',
  authController.validateToken,
  // authController.validateLogin,
  mealController.getMealProfile
);

module.exports = router;
