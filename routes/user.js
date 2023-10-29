const express = require("express");
const { body } = require("express-validator");

const User = require("../models/user");

const userController = require("../controller/user");

const isAuth = require("../middleware/is-auth");

const router = express.Router();

router.post(
  "/signup",
  [
    body("email")
      .isEmail()
      .withMessage("Please enter valid email id")
      .custom((value, { req }) => {
        return User.findOne({ email: value }).then((userDoc) => {
          if (userDoc) {
            return Promise.reject("Email already exists.");
          }
        });
      }),
    body("password")
      .trim()
      .isLength({ min: 5 })
      .withMessage("Please enter valid password (password size > 5)."),
    body("confirmPassword")
      .trim()
      .custom((value, { req }) => {
        if (value !== req.body.password) {
          throw new Error("Password and confirm password are not matching.");
        }
        return true;
      }),
  ],
  userController.signupHandler
);

router.post("/login", userController.loginHandler);

router.delete("/delete/:userId", isAuth, userController.deleteHandler);

router.post(
  "/update/:userId",
  isAuth,
  [
    body("email")
      .isEmail()
      .withMessage("Please enter valid email id")
      .custom((value, { req }) => {
        return User.findOne({ email: value }).then((userFound) => {
          if (userFound && userFound._id.toString() !== req.params.userId) {
            return Promise.reject("Email id already exist!!");
          }
        });
      }),
    body("password")
      .trim()
      .isLength({ min: 5 })
      .withMessage("Please enter valid password (password size > 5)."),
    body("confirmPassword")
      .trim()
      .custom((value, { req }) => {
        if (value !== req.body.password) {
          throw new Error("Password and confirm password are not matching.");
        }
        return true;
      }),
  ],
  userController.updateHandler
);

router.get("/get-data", isAuth, userController.getDataHandler);

module.exports = router;
