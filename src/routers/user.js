const express = require("express");
const User = require("../models/user");
const router = new express.Router();
const bcrypt = require("bcryptjs");
const auth = require("../middleware/auth");
const sharp = require("sharp");
const { sendWelcomeEmail, sendGoodbyeMail } = require("../emails/account");

//multer configuration
const multer = require("multer");
const upload = multer({
    limits: {
        fileSize: 1000000,
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpeg|jpg|png)$/)) {
            cb(new Error("Please provide an image of type jpg/jpeg/png."));
        }
        cb(undefined, true);
    },
});

//Add user
// router.post("/users", async (req, res) => {
//     const user = new User(req.body);
//     try {
//         await user.save();
//         res.status(201).send(user);
//     } catch (err) {
//         res.status(400).send(err.message);
//     }
// });

//Get profile
router.get("/users/me", auth, async (req, res) => {
    res.send(req.user);
});

//Update user
router.patch("/users/me", auth, async (req, res) => {
    const requiredFields = ["name", "email", "age", "password"];
    const updatedFields = Object.keys(req.body);
    const isValid = updatedFields.every((field) => requiredFields.includes(field));

    if (!isValid) return res.status(400).send("Invalid field(s).");

    try {
        // const user = await User.findOneAndUpdate(req.params.id, req.body, {
        //     new: true,
        //     runValidators: true,
        // });

        updatedFields.forEach((update) => (user[update] = req.body[update]));
        await req.user.save();
        res.send(req.user);
    } catch (err) {
        res.status(400).send(err.message);
    }
});

//Delete user
router.delete("/users/me", auth, async (req, res) => {
    try {
        // const user = await User.findByIdAndDelete(req.user._id);
        // if (!user) return res.status(404).send("User not found");
        await req.user.delete();
        sendGoodbyeMail(req.user.email, req.user.name);
        //console.log(req.user);
        res.send(req.user);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

//login
router.post("/users/login", async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password);
        const token = await user.generateAuthToken();
        res.send({ user, token });
    } catch (err) {
        res.status(400).send(err.message);
    }
});

//signup
router.post("/users/signin", async (req, res) => {
    const user = new User(req.body);
    try {
        await user.save();
        sendWelcomeEmail(user.email, user.name);
        const token = await user.generateAuthToken();
        res.status(201).send({ user, token });
    } catch (err) {
        res.status(400).send(err.message);
    }
});

//logout
router.post("/users/logout", auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token;
        });
        await req.user.save();
        res.send(req.user);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

//logout all
router.post("/users/logoutAll", auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token === req.token;
        });
        await req.user.save();
        res.send(req.user);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

//Upload image
router.post(
    "/users/me/avatar",
    auth,
    upload.single("avatar"),
    async (req, res) => {
        const buffer = await sharp(req.file.buffer)
            .resize({ width: 250, height: 250 })
            .png()
            .toBuffer();
        req.user.avatar = buffer;
        await req.user.save();
        res.send("Avatar uploaded");
    },
    (err, req, res, next) => {
        res.send({ Error: err.message });
    }
);

//delete an avatar
router.delete("/users/me/avatar", auth, async (req, res) => {
    try {
        req.user.avatar = undefined;
        await req.user.save();
        res.send("Avatar deleted");
    } catch (err) {
        res.status(500).send(err.message);
    }
});

//Getting avatar by user id
router.get("/users/:id/avatar", async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user.avatar || !user) {
            throw new Error("invalid");
        }
        res.set("content-type", "image/png");
        res.send(user.avatar);
    } catch (err) {}
});

module.exports = router;
