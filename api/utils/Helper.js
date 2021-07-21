const bcrypt = require('bcryptjs')
const Constants = require('./Constants');
const UUID = require('uuid/v4')

module.exports = {
    getHashedPassword: (pwd) => {
        var salt = bcrypt.genSaltSync(10);
        return bcrypt.hashSync(pwd, salt);
    },

    comparePasswords: (plainPwd, hashedPwd) => {
        return bcrypt.compareSync(plainPwd, hashedPwd)
    },

    asyncErrorHandler: fn => (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(err => {
            const error = {
                status: 500,
                message: err.stack
            }
            next(error);
        });
    },

    isValidEmail: (email) => {
        if (email.length != 0 && email.indexOf(".") >= 0 && email.indexOf("@") >= 0)
            return true
        else
            return false
    },

    isValidMobile: (mobile) => {
        if (mobile.length != 10)
            return false
        else
            return true
    },

    getUserDPKey: (user_id) => {
        return "user_dp_" + UUID() + ".png"
    }
}