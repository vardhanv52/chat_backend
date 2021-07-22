var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    country_code: { type: String, required: false },
    mobile: { type: String, required: false },
    role: { type: String, required: true },
    password: { type: String, required: true },
    profile_pic: String,
    fcm_tokens: [],
    is_active: { type: Boolean, default: true },
    inserted_at: { type: Number, default: Date.now },
    updated_at: { type: Number, default: Date.now }
}, { versionKey: false, timestamps: false });

var model = mongoose.model('users', schema);
module.exports = model;