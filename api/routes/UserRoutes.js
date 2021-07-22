const express = require("express");
const router = express.Router();

const UserController = require("../controllers/UserController");
const Helper = require('../utils/Helper')
const asyncErrorHandler = Helper.asyncErrorHandler
const { validateToken, validateAdminToken } = require('../handlers/JWTHandler')

router.get("/", asyncErrorHandler(UserController.ping))
router.post("/", validateAdminToken, asyncErrorHandler(UserController.createUser))
router.patch("/", validateAdminToken, asyncErrorHandler(UserController.updateUser))

module.exports = router