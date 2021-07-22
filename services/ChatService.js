const bodyParser = require("body-parser");
const express = require("express");
const http = require('http')
const app = express();
const cookieParser = require("cookie-parser");
const methodOverride = require("method-override");
const Constants = require('../api/utils/Constants')
const mongoose = require("mongoose");
const upload = require("express-fileupload");
const JWTHandler = require('../api/handlers/JWTHandler')
app.use(upload());
require('dotenv').config();
const i18n = require("i18n");
i18n.configure({
    locales: ["en"],
    directory: __dirname + "/../api/locales",
    defaultLocale: process.env.DEFAULT_LOCALE,
    updateFiles: false,
});
app.use(i18n.init);
app.use(JWTHandler.decodeToken)

mongoose.connect(process.env.MONGODB_URL, Constants.MONGOOSE_OPTIONS)

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE");
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept, Authorization, Accept-Language"
    );
    next();
});

app.use(
    bodyParser.json({
        parameterLimit: 100000,
        limit: "10mb",
        extended: true,
    })
);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.text());
app.use(methodOverride());
app.use(cookieParser());

const routes = require('../api/routes/ChatRoutes')
app.use('/api/chat', routes);

app.use(function (req, res, next) {
    const err = {
        status: 404,
        message: res.__('api_not_found')
    }
    next(err);
});

app.use((err, req, res, next) => {
    return res.status(err.status ? err.status : 500).json({
        status: false,
        message: err.message,
    });
});

const server = http.createServer(app)
server.listen(process.env.PORT_CHAT)
server.on('listening', function () {
    console.log("Chat service started")
})