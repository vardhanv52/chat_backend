const mongoose = require('mongoose')
const Constants = require('../utils/Constants')
const Group = require('../models/Group')
const Message = require('../models/Message')
const User = require('../models/User')

module.exports = {
    ping: async (req, res) => {
        if (mongoose.connection.readyState === Constants.DB_CONNECTED) {
            return res.json({
                status: true,
                message: res.__("chat_service_ok")
            })
        } else {
            return res.json({
                status: true,
                message: res.__("chat_service_db_err")
            })
        }
    },

    createGroup: async (req, res) => {
        let name = req.body.name
        if (!name) {
            return res.status(400).json({
                status: true,
                json: res.__('missing_fields')
            })
        }
        let members = []
        if (req.body.members) {
            members = req.body.members
        }
        let data = {
            name: name,
            owner_id: req.decoded_data.user_id,
            members: members
        }

        let group = await new Group(data).save()
        let record = group.toObject()
        record.members_count = record.members.length
        delete record.members
        return res.json({
            status: true,
            message: res.__('added'),
            data: record
        })
    },

    // Update Group Details, deactivate Group
    updateGroup: async (req, res) => {
        let { group_id, name, is_active } = req.body
        if (!group_id) {
            return res.status(400).json({
                status: true,
                json: res.__('missing_fields')
            })
        }
        let data = {}
        if (name)
            data.name = name
        if (is_active != undefined)
            data.is_active = is_active
        let group = await Group.findByIdAndUpdate(group_id, data, { new: true })
        let record = group.toObject()
        record.members_count = record.members.length
        delete record.members
        return res.json({
            status: true,
            message: res.__('updated'),
            data: record
        })
    },

    getGroups: async (req, res) => {
        let search = req.query.search
        if (search === undefined)
            search = ""
        const page = parseInt(req.params.page_no)
        const limit = parseInt(req.params.page_size)
        const startIndex = (page - 1) * limit
        let query = { name: { $regex: search, $options: "i" }, members: { $in: [req.decoded_data.user_id] } }
        let groups = await Group.find(query).sort('name').skip(startIndex).limit(limit).lean()
        groups.forEach(grp => {
            grp.members_count = grp.members.length
            delete grp.members
        })
        return res.json({
            status: true,
            message: res.__('success'),
            data: groups
        })
    },

    addMembers: async (req, res) => {
        let { group_id, members } = req.body
        if (!group_id || !members) {
            return res.status(400).json({
                status: false,
                message: res.__('missing_fields')
            })
        }
        let group = await Group.findById(group_id).lean()
        if (!group) {
            return res.status(400).json({
                status: false,
                message: res.__('invalid_request')
            })
        }
        members.forEach(member => {
            if (group.members.indexOf(member) < 0)
                group.members.push(member)
        })
        await Group.findByIdAndUpdate(group_id, { members: group.members })
        return res.json({
            status: true,
            message: res.__('added')
        })
    },

    removeMembers: async (req, res) => {
        let { group_id, members } = req.body
        if (!group_id || !members) {
            return res.status(400).json({
                status: false,
                message: res.__('missing_fields')
            })
        }
        let group = await Group.findById(group_id).lean()
        if (!group) {
            return res.status(400).json({
                status: false,
                message: res.__('invalid_request')
            })
        }
        await Group.findByIdAndUpdate(group_id, { $pull: { members: { $in: members } } })
        return res.json({
            status: true,
            message: res.__('updated')
        })
    },

    getMembers: async (req, res) => {
        let group_id = req.query.group_id
        if (!group_id) {
            return res.status(400).json({
                status: false,
                message: res.__('missing_fields')
            })
        }
        let group = await Group.findById(group_id).lean()
        if (!group) {
            return res.status(400).json({
                status: false,
                message: res.__('invalid_request')
            })
        }
        let members = await User.find({ _id: { $in: group.members } }, '-fcm_tokens -password')
        return res.json({
            status: true,
            message: res.__('success'),
            data: members
        })
    },

    getMessages: async (req, res) => {
        let group_id = req.query.group_id
        if (!group_id) {
            return res.status(400).json({
                status: false,
                message: res.__('missing_fields')
            })
        }
        let group = await Group.findById(group_id).lean()
        if (!group) {
            return res.status(400).json({
                status: false,
                message: res.__('invalid_request')
            })
        }
        let messages = await Message.find({ group_id: group_id }).sort('inserted_at').lean()
        let user_id = req.decoded_data.user_id
        let others = []
        messages.forEach(message => {
            if (message.liked_by.indexOf(user_id) < 0)
                message.is_liked = false
            else
                message.is_liked = true
            if (others.indexOf(message.author_id) < 0)
                others.push(message.author_id)
            delete message.liked_by
        })
        let otherUsers = await User.find({ _id: { $in: others } }, 'name email').lean()
        messages.forEach(msg => {
            msg.user = getUserRecord(otherUsers, msg.author_id)
        })
        return res.json({
            status: true,
            message: res.__('success'),
            data: messages
        })
    },

    postMessage: async (req, res) => {
        let { group_id, message } = req.body
        if (!group_id || !message) {
            return res.status(400).json({
                status: false,
                message: res.__('missing_fields')
            })
        }
        let group = await Group.findById(group_id).lean()
        if (!group || group.members.indexOf(req.decoded_data.user_id) < 0) {
            return res.status(400).json({
                status: false,
                message: res.__('invalid_request')
            })
        }
        let msg = await new Message({ message: message, group_id: group_id, author_id: req.decoded_data.user_id }).save()
        let record = msg.toObject()
        delete record.liked_by
        record.is_liked = false
        return res.json({
            status: true,
            message: res.__('success'),
            data: record
        })
    },

    likeMessage: async (req, res) => {
        let message_id = req.body.message_id
        let status = req.body.status
        if (!message_id || status == undefined) {
            return res.status(400).json({
                status: false,
                message: res.__('missing_fields')
            })
        }
        if (status)
            await Message.findByIdAndUpdate(message_id, { $push: { liked_by: req.decoded_data.user_id } })
        else
            await Message.findByIdAndUpdate(message_id, { $pull: { liked_by: req.decoded_data.user_id } })
        return res.json({
            status: true,
            message: res.__('updated'),
        })
    }
}

function getUserRecord(users, user_id) {
    let userRecord = undefined
    users.forEach(user => {
        if (user._id == user_id) {
            userRecord = user
        }
    })
    return userRecord
}