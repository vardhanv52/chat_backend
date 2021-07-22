const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Path = require('path')
dotenv.config({ path: Path.join(__dirname, '../.env') });
const Constants = require('../api/utils/Constants');
mongoose.connect(process.env.MONGODB_URL, Constants.MONGOOSE_OPTIONS);