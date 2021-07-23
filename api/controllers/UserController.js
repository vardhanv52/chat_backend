const mongoose = require('mongoose')
const Constants = require('../utils/Constants')
const Helper = require('../utils/Helper')
const User = require('../models/User')

module.exports = {
    ping: async (req, res) => {
        if (mongoose.connection.readyState === Constants.DB_CONNECTED) {
            return res.json({
                status: true,
                message: res.__("user_service_ok")
            })
        } else {
            return res.json({
                status: true,
                message: res.__("user_service_db_err")
            })
        }
    },

    createUser: async (req, res) => {
        let { name, email, mobile, role, password } = req.body
        if (!name || !email || !mobile || !role || !password) {
            return res.status(400).json({
                status: false,
                message: res.__('missing_fields')
            })
        }
        if (role != Constants.ROLE_ADMIN && role != Constants.ROLE_USER) {
            return res.status(400).json({
                status: false,
                message: res.__('invalid_request')
            })
        }
        let dup = await User.findOne({ email: email }).lean()
        if (dup) {
            return res.status(409).json({
                status: false,
                message: res.__("duplicate_email")
            })
        }
        let record = {
            name: name,
            email: email,
            country_code: "91",
            mobile: mobile,
            role: role,
            password: Helper.getHashedPassword(password)
        }
        let user = await new User(record).save()
        let result = user.toObject()
        delete result.fcm_tokens
        delete result.password
        return res.json({
            status: true,
            message: res.__('added'),
            data: result
        })
    },

    updateUser: async (req, res) => {
        let { user_id, name, email, mobile, role, is_active, password } = req.body
        if (!user_id) {
            return res.status(400).json({
                status: false,
                message: res.__('missing_fields')
            })
        }
        let data = {}
        data.updated_at = Date.now()
        if (name)
            data.name = name
        if (email) {
            let dup = await User.findOne({ email: email }).lean()
            if (dup && dup._id != user_id) {
                return res.status(409).json({
                    status: false,
                    message: res.__("duplicate_email")
                })
            }
            data.email = email
        }
        if (mobile)
            data.mobile = mobile
        if (role) {
            if (role != Constants.ROLE_ADMIN && role != Constants.ROLE_USER) {
                return res.status(400).json({
                    status: false,
                    message: res.__('invalid_request')
                })
            }
            data.role = role
        }
        if (password)
            data.password = Helper.getHashedPassword(password)
        if (is_active != undefined)
            data.is_active = is_active
        let user = await User.findByIdAndUpdate(user_id, data, { new: true })
        let record = user.toObject()
        delete record.fcm_tokens
        delete record.password
        return res.json({
            status: true,
            message: res.__('success'),
            data: record
        })
    },

    getUsers: async (req, res) => {
        let token_data = req.body
        let search = req.query.search
        if (search == undefined)
            search = ""
        let query = { name: { $regex: search, $options: "i" } }
        if (token_data.role == Constants.ROLE_USER)
            query.is_active = true
        const page = parseInt(req.params.page_no)
        const limit = parseInt(req.params.page_size)
        const start_index = (page - 1) * limit
        let users = await User.find(query, '-fcm_tokens -password').sort('name').skip(start_index).limit(limit).lean()
        return res.json({
            status: true,
            message: res.__('success'),
            data: users
        })
    }
}