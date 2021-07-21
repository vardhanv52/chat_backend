const express = require("express");
const router = express.Router();

const UserController = require("../controllers/UserController");
const Helper = require('../utils/Helper')
const asyncErrorHandler = Helper.asyncErrorHandler

router.get("/", asyncErrorHandler(UserController.ping))

module.exports = router