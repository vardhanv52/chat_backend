const Constants = require('../utils/Constants')
const Helper = require('../utils/Helper')
const JWTHandler = require('../handlers/JWTHandler')
const User = require('../models/User')

module.exports = {
    login: async (req, res) => {
        const data = req.body
        if (!data.email || !data.password) {
            return res.status(400).json({
                status: false,
                message: res.__("missing_fields")
            })
        }
        data.email = data.email.toLowerCase()
        const user = await User.findOne({ email: data.email }).lean()
        if (!user) {
            return res.status(400).json({
                status: false,
                message: res.__('unregistered_user')
            })
        }
        if (!Helper.comparePasswords(data.password, user.password)) {
            return res.status(400).json({
                status: false,
                message: res.__('incorrect_pwd')
            })
        }
        if (user.is_active == false) {
            return res.status(400).json({
                status: false,
                message: res.__('deactivated_account')
            })
        }
        if (data.firebase_token) {
            const tokens = user.firebase_tokens
            if (!tokens.includes(data.firebase_token)) {
                tokens.push(data.firebase_token)
                await User.findOneAndUpdate({ email: user.email }, { firebase_tokens: tokens })
            }
        }
        delete user.password
        delete user.fcm_tokens
        delete user.is_active
        res.setHeader('token', JWTHandler.signToken(user._id, user.name, user.email, user.role));
        return res.json({
            status: true,
            message: res.__('success'),
            data: user
        })
    },

    logout: async (req, res) => {
        const data = req.body
        const user = await User.findById(req.decoded_data.user_id).lean()
        if (!user || !data.fcm_token) {
            return res.status(400).json({
                status: false,
                message: res.__("invalid_request")
            })
        }
        const tokens = user.fcm_tokens
        const ind = tokens.indexOf(data.fcm_token)
        if (ind >= 0) {
            tokens.splice(ind, 1)
            await User.findByIdAndUpdate(user._id, { fcm_tokens: tokens })
        }
        return res.json({
            status: true,
            message: res.__('logged_out')
        })
    },

    getNewToken: async (req, res) => {
        const user = await User.findById(req.decoded_data.user_id).lean()
        if (!user) {
            return res.status(400).json({
                status: false,
                message: res.__("invalid_request")
            })
        }
        res.setHeader("token", JWTHandler.signToken(user._id, user.name, user.email, user.role))
        return res.json({
            status: true,
            message: res.__('success'),
        })
    },

    updateFirebaseToken: async (req, res) => {
        const user = await User.findById(req.decoded_data.user_id).lean()
        if (!req.body.fcm_token || !user) {
            return res.status(400).json({
                status: false,
                message: res.__("invalid_request")
            })
        }
        const tokens = user.fcm_tokens
        tokens.push(req.body.fcm_token)
        await User.findByIdAndUpdate(user._id, { fcm_tokens: tokens })
        return res.json({
            status: true,
            message: res.__('success')
        })
    }
}