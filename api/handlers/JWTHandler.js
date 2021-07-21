const JSONWebToken = require('jsonwebtoken');

module.exports = {
    signToken: (user_id, name, email, role) => {
        var token = JSONWebToken.sign({
            user_id: user_id,
            name: name,
            email: email,
            role: role
        }, process.env.JWT_SECRET_KEY,
            { expiresIn: process.env.TOKEN_LIFETIME });
        return token;
    },

    decodeToken: (req, res, next) => {
        try {
            var token = req.headers.authorization;
            if (token != null && token.indexOf(" ") >= 0)
                token = token.split(" ")[1];
            var decoded = JSONWebToken.verify(token, process.env.JWT_SECRET_KEY);
            req.decoded_data = decoded;
            next();
        } catch (err) {
            req.decoded_data = {
                userId: "Unauthorized API"
            };
            next();
        }
    },

    validateToken: (req, res, next) => {
        try {
            var token = req.headers.authorization.split(" ")[1];
            var result = JSONWebToken.verify(token, process.env.JWT_SECRET_KEY);
            next();
        } catch (err) {
            return res.status(401).send({
                "status": false,
                "message": res.__("not_authorized")
            });
        }
    }
}