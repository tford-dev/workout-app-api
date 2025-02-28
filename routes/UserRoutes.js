"use strict";

const express = require("express");
const { asyncHandler } = require("../middleware/asyncHandler.js");
const { User } = require("../models");
const { authenticateUser } = require("../middleware/authUser");
const bcrypt = require("bcrypt");
const router = express.Router();

// GET route for user authentication
router.get('/users', authenticateUser, asyncHandler(async (req, res) => {
    const user = req.currentUser;
    res.status(200).json({
        userId: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        emailAddress: user.emailAddress
    });
}));

// POST route to create a new user
router.post('/users', asyncHandler(async (req, res) => {
    try {
        console.log("Incoming Request Body:", req.body);

        const { firstName, lastName, emailAddress, password } = req.body;

        if (!firstName || !lastName || !emailAddress || !password) {
            return res.status(400).json({ message: "All fields (firstName, lastName, emailAddress, password) are required." });
        }

        if (password.length < 8 || password.length > 20) {
            return res.status(400).json({ message: "Password must be between 8 and 20 characters." });
        }

        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await User.create({
            firstName,
            lastName,
            emailAddress,
            password: hashedPassword
        });

        res.status(201).location('/').json({ message: `New user '${emailAddress}' successfully created.` });

    } catch (error) {
        if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
            const errors = error.errors.map(err => err.message);
            return res.status(400).json({ message: errors });
        }

        console.error("Error creating user:", error);
        res.status(500).json({ message: "An unexpected error occurred." });
    }
}));

module.exports = router;
