const express = require("express");
const router = express.Router();

const GeneralController = require("../controllers/GeneralController");
const SessionController = require("../controllers/SessionController")
const Helper = require('../utils/Helper')
const asyncErrorHandler = Helper.asyncErrorHandler
const validate = require('../handlers/JWTHandler').validateToken

router.get("/", asyncErrorHandler(GeneralController.ping))

router.post("/login", asyncErrorHandler(SessionController.login))
router.patch("/logout", validate, asyncErrorHandler(SessionController.logout))
router.get("/token", validate, asyncErrorHandler(SessionController.getNewToken))
router.patch("/fcm-token", validate, asyncErrorHandler(SessionController.updateFirebaseToken))

module.exports = router