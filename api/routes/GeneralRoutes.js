const express = require("express");
const router = express.Router();

const GeneralController = require("../controllers/GeneralController");
const Helper = require('../utils/Helper')
const asyncErrorHandler = Helper.asyncErrorHandler

router.get("/", asyncErrorHandler(GeneralController.ping))

module.exports = router