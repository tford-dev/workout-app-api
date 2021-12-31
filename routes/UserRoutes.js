"use strict";

const express = require("express");
const {asyncHandler} = require("../middleware/asyncHandler.js");
const { User, Workout, Exercise, SetsReps } = require('../models');
const {authenticateUser} = require("../middleware/authUser");
const bcrypt = require("bcrypt");
const router = express.Router();

//GET route for user authentication
router.get('/users', authenticateUser, asyncHandler(async (req, res) => {
    const user = req.currentUser;
    res.status(200);
    //json data to display current user's firstname and lastname in UI
    res.json({
        userId: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        emailAddress: user.emailAddress,
        password: user.password
    });
}));

//POST route to create a new user
router.post('/users', asyncHandler(async (req, res) => {
    try {
        const salt =  await genSalt()
        const hashedPassword = await hash(req.body.password, salt);

        //swapped password for hashedPassword so user-password isn't saved as plain text in database
        if(
        ((req.body.firstName.length > 0) && (req.body.lastName.length > 0)) &&
            (((req.body.password.length >= 8) && (req.body.password.length <= 20)) && (req.body.emailAddress.length > 0))
        ){
        const user = {firstName: req.body.firstName, lastName: req.body.lastName, emailAddress: req.body.emailAddress, password: hashedPassword};
        await User.create(user);

        //sets location header to "/"
        res.location('/');
        //.json({ "message": "Account successfully created." });
        res.status(201).end(console.log(`New user '${req.body.emailAddress}' successfully created.`));
        } else if (
        ((req.body.firstName.length === 0) && (req.body.lastName.length === 0)) &&
            ((req.body.password.length === 0) && (req.body.emailAddress.length === 0))
        ){
            res.status(400).json({message: "Please make sure valid data is provided to create user."}).end();
        } else if ((req.body.firstName.length === 0) && (req.body.emailAddress.length === 0) &&
        ((req.body.password.length < 8) || (req.body.password.length > 20))){
            res.status(400).json({message: "Please enter a valid first name, email address, and password that is 8-20 characters."}).end();
        } else if ((req.body.lastName.length === 0) && (req.body.emailAddress.length === 0) &&
        ((req.body.password.length < 8) || (req.body.password.length > 20))){
            res.status(400).json({message: "Please enter a valid last name, email address, and password that is 8-20 characters."}).end();
        } else if (((req.body.firstName.length === 0) && (req.body.lastName.length === 0)) && 
        (req.body.emailAddress.length === 0)){
            res.status(400).json({message: "Please enter a valid first name, last name, and email address."}).end();
        } else if (((req.body.firstName.length === 0) && (req.body.lastName.length === 0)) && 
        ((req.body.password.length < 8) || (req.body.password.length > 20))){
            res.status(400).json({message: "Please enter a valid first name, last name, and password that is 8-20 characters."}).end();
        } else if ((req.body.firstName.length === 0) && (req.body.lastName.length === 0)){
            res.status(400).json({message: "Please enter a first and last name."}).end();
        } else if ((req.body.lastName.length === 0) && 
        ((req.body.password.length < 8) || (req.body.password.length > 20))){
            res.status(400).json({message: "Please enter a valid first name and a password that is 8-20 characters."}).end();
        } else if ((req.body.lastName.length === 0) && (req.body.emailAddress.length === 0)){
            res.status(400).json({message: "Please enter a valid last name and email address."}).end();
        } else if((req.body.emailAddress.length === 0) && ((req.body.password.length < 8) || (req.body.password.length > 20))){
            res.status(400).json({message: "Please enter a valid email address and password that is 8-20 characters"}).end();
        } else if ((req.body.firstName.length === 0) && ((req.body.password.length < 8) || (req.body.password.length > 20))){
            res.status(400).json({message: "Please enter a valid first name and a password that is 8-20 characters."}).end();
        } else if ((req.body.firstName.length === 0) && (req.body.emailAddress.length === 0)){
            res.status(400).json({message: "Please enter a valid first name and email address."}).end();
        } else if (req.body.firstName.length === 0) {
            res.status(400).json({message: "Please enter a first name."}).end();
        } else if (req.body.lastName.length === 0) {
            res.status(400).json({message: "Please enter a last name."}).end();
        } else if (req.body.emailAddress.length === 0) {
            res.status(400).json({message: "Please enter a valid email address."}).end();
        } else if ((req.body.password.length < 8) || (req.body.password.length > 20)){
            res.status(400).json({message: "Please enter a password that is 8-20 characters."}).end();
        }
    } catch (error) {
        if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
            const errors = error.errors.map(err => err.message);
            res.status(400).json({message: errors });   
        } else {
            //Generic "error" message for any issues that might come from creating user
            res.status(400).json({message : "Please make sure valid data is provided to create user."})  
        }
    }
}));

module.exports = router;