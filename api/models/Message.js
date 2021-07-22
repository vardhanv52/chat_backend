var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schema = new Schema({
    author_id: { type: String, required: true },
    message: { type: String, required: true },
    liked_by: [],
    group_id: { type: String, required: true },
    inserted_at: { type: Number, default: Date.now }
}, { versionKey: false, timestamps: false });

var model = mongoose.model('messages', schema);
module.exports = model;