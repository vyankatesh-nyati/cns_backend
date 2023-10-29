const { validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const sha1 = require("sha1");

const User = require("../models/user");

exports.signupHandler = async (req, res, next) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const error = new Error("Validation failed.");
      error.statusCode = 422;
      error.data = errors.array();
      throw error;
    }

    const email = req.body.email;
    const password = req.body.password;

    const hashedPassword = sha1(password);
    console.log(hashedPassword);

    const user = new User({
      email: email,
      password: hashedPassword,
    });
    const response = await user.save();

    res.status(200).json({
      message: "User signup successfully",
      id: response._id.toString(),
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.loginHandler = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  let loadedUser;

  User.findOne({ email: email })
    .then((user) => {
      if (!user) {
        const err = new Error("User with given email id not exists.");
        err.statusCode = 401;
        throw err;
      }
      loadedUser = user;
      return user.password === sha1(password);
    })
    .then((isEqual) => {
      if (!isEqual) {
        const err = new Error("Wrong password. Please try again");
        err.statusCode = 401;
        throw err;
      }

      const token = jwt.sign(
        { email: loadedUser.email, userId: loadedUser._id.toString() },
        process.env.USER_SECRET
        // { expiresIn: "1h" }
      );
      res.status(200).json({
        token: token,
        userId: loadedUser._id.toString(),
        data: loadedUser,
      });
    })
    .catch((error) => {
      if (!error.statusCode) {
        error.statusCode = 500;
      }
      next(error);
    });
};

exports.deleteHandler = async (req, res, next) => {
  const userId = req.params.userId;

  try {
    const foundUser = await User.findById(userId);
    if (!foundUser) {
      const err = new Error("No user Exists!!");
      err.statusCode = 404;
      throw err;
    }
    const removedUser = await User.findByIdAndRemove(userId);
    res
      .status(200)
      .json({ message: "User deleted Successfully...", data: removedUser });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

exports.updateHandler = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const err = new Error("Validation failed!!!");
    err.statusCode = 422;
    err.data = errors.array();
    next(err);
  }

  const userId = req.params.userId;
  const email = req.body.email;
  const password = req.body.password;

  try {
    const userFound = await User.findById(userId);
    if (!userFound) {
      const error = new Error("User not found!!!");
      error.statusCode = 404;
      throw error;
    }
    userFound.email = email;
    const hashPw = sha1(password);
    userFound.password = hashPw;
    const result = await userFound.save();
    res.status(200).json({
      message: "User data updated successfully...",
      result: result,
    });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

exports.getDataHandler = async (req, res, next) => {
  try {
    const users = await User.find();
    res.status(200).json({
      data: users,
    });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};
