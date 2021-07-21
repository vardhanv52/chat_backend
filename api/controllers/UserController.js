const mongoose = require('mongoose')
const Constants = require('../utils/Constants')

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
    }
}