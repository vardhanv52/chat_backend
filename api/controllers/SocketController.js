let io = undefined
const Helper = require('../utils/Helper')
const Constants = require("../utils/Constants")
const Group = require('../models/Group')
const User = require('../models/User')
const Message = require('../models/Message')

const sendMessage = (room, data) => {
    io.emit(room, data)
}

module.exports = {
    sendMessage,
    initialise: (server) => {
        io = require('socket.io')(server)
        io.on('connection', (socket) => {
            console.log("a client connected - " + socket.id)
            socket.on('message', async (data) => {
                await postMessage(data)
            })

            socket.on('disconnect', (reason) => {
                console.log("Client disconnected - " + socket.id)
            })
        })
    }
}

async function postMessage(data) {
    let { group_id, message, user_id } = data
    if (!group_id || !message || !user_id)
        return
    let group = await Group.findById(group_id).lean()
    if (!group || group.members.indexOf(user_id) < 0)
        return
    let msg = await new Message({ message: message, group_id: group_id, author_id: user_id }).save()
    let record = msg.toObject()
    delete record.liked_by
    record.is_liked = false
    let otherUser = await User.findById(user_id, 'name email').lean()
    record.user = otherUser
    sendMessage(group_id, record)
}