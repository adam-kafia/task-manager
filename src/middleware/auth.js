/* This code is checking if the user is authenticated. If they are, it will allow them to continue. If
they are not, it will send a message back to the user. */
const jwt = require("jsonwebtoken");
const User = require("../models/user");

secret = process.env.JWT_SECRET;
const auth = async (req, res, next) => {
    try {
        const token = req.header("Authorization").replace("Bearer ", "");
        const decode = jwt.verify(token, secret);
        const user = await User.findOne({ _id: decode._id, "tokens.token": token });
        if (!user) throw new Error("Invalid Token");
        req.user = user;
        req.token = token;
        next();
    } catch (error) {
        res.status(400).send("Error: please authenticate first.");
        //console.log(error);
    }
};
module.exports = auth;
