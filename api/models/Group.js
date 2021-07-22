var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schema = new Schema({
    name: { type: String, required: true },
    members: [],
    owner_id: { type: String, required: true },
    is_active: { type: Boolean, default: true },
    inserted_at: { type: Number, default: Date.now },
    updated_at: { type: Number, default: Date.now }
}, { versionKey: false, timestamps: false });

var model = mongoose.model('groups', schema);
module.exports = model;