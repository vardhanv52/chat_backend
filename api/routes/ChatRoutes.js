const express = require("express");
const router = express.Router();

const ChatController = require("../controllers/ChatController");

const Helper = require('../utils/Helper')
const asyncErrorHandler = Helper.asyncErrorHandler
const { validateToken, validateAdminToken } = require('../handlers/JWTHandler')

router.get("/", asyncErrorHandler(ChatController.ping))

router.post("/group", validateToken, asyncErrorHandler(ChatController.createGroup))
router.patch("/group", validateToken, asyncErrorHandler(ChatController.updateGroup))
router.get("/group/:page_no/:page_size", validateToken, asyncErrorHandler(ChatController.getGroups))
router.post("/group-members", validateToken, asyncErrorHandler(ChatController.addMembers))
router.delete("/group-members", validateToken, asyncErrorHandler(ChatController.removeMembers))
router.get("/group-members", validateToken, asyncErrorHandler(ChatController.getMembers))

router.post("/messages", validateToken, asyncErrorHandler(ChatController.postMessage))
router.patch("/messages/like", validateToken, asyncErrorHandler(ChatController.likeMessage))
router.get("/messages", validateToken, asyncErrorHandler(ChatController.getMessages))

module.exports = router