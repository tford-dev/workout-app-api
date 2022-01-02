"use strict";

const express = require("express");
const {asyncHandler} = require("../middleware/asyncHandler.js");
const { User, Workout, Exercise, SetsReps } = require('../models');
const {authenticateUser} = require("../middleware/authUser");
const bcrypt = require("bcrypt");
const router = express.Router();

//GET route to display setsReps data from database
router.get("/workouts/:workoutId/exercises/:exerciseId/sets", authenticateUser, asyncHandler(async(req, res) => {
    //Equals Exercise Object
    const exerciseModelId = parseInt(req.params.exerciseId);
    try {
        //Empty setsReps Array
        let setsMapped = [];
        //Finds all setsReps within exercise
        const sets = await SetsReps.findAll({
            //Only if id equals exerciseId
            where: {
                exerciseId: exerciseModelId
            },
            order: [['createdAt', 'DESC']],
            include: [
                {
                    model: Exercise,
                    as: "exercise-sets-reps",
                }
            ]
        });
    
    //Creates array of sets
    sets.map(set =>{
        let setsRepArr = { 
            id: set.id,
            setNumber: set.setNumber,
            repetitions: set.repetitions,
            exerciseId: set.exerciseId,
        };
        setsRepsMapped.push(setsRepArr)
        });

        //sends object to client
        res.json(setsMapped);

        res.status(200).end();
    } catch(error){
        throw error;
    }
}));

//POST route to create a new set
router.post("/workouts/:workoutId/exercises/:exerciseId/sets", authenticateUser, asyncHandler(async(req, res) => {
    try{
        //rep number can't be null
        if(req.body.repetitions > 0){
            await SetsReps.create(
                req.body, 
                req.body.exerciseId = parseInt(req.params.exerciseId)
            );
            res.status(201).end(console.log("New set successfully logged!")).end();
        //Repetitions must be 1 or more
        } else {
            res.status(400).json({errors: "You must enter a value for repetitions"});
        }
    } catch(error){
        if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
            const errors = error.errors.map(err => err.message);
            res.status(400).json({ errors: errors });   
        } else {
            throw error;
        }
    }
}));

//GET route to display a specific set
router.get("workouts/:workoutId/exercises/:exerciseId/sets/:id", authenticateUser, asyncHandler(async(req, res) => {
    //Current exercise
    const exerciseModelId = parseInt(req.params.exerciseId);
    try {
        //Find specific set by Id
        const set = await SetsReps.findByPk(req.params.id);
        if(set){
            if(exerciseModelId === set.exerciseId){
                //Sends object to client
                res.json({ 
                    id: set.id,
                    setNumber: set.setNumber,
                    repetitions: set.repetitions,
                    exerciseId: set.exerciseId,
                });
            } else {
                res.status(403).json({message: "Access Denied"}).end();
            }
        }
    } catch(error){
        throw error;
    }
}));

//PUT route to edit a set
router.put("workouts/:workoutId/exercises/:exerciseId/sets/:id", authenticateUser, asyncHandler(async(req, res) => {
    const set = await SetsReps.findByPk(req.params.id);
    const exerciseModelId = parseInt(req.params.exerciseId);
    try{
        if(req.body.setNumber > 0 && req.body.repetitions > 0){
            console.log("Retrieved set from put request");
            //Checks to see if current set is of exercise
            if(exerciseModelId === set.exerciseId){
                if(set){
                    await set.update(req.body);
                    res.status(204).end();
                } else {
                    res.status(404).json({message: "Set Not Found"});
                }
            } else {
                res.status(403).json({message: "Access Denied"}).end();
            }
        //Set number must be 1 or more
        } else if(req.body.setNumber < 1){
            res.status(400).json({errors: "You must enter a value for set."});
        //Repetitions must be 1 or more
        } else if(req.body.repetitions < 1){
            res.status(400).json({errors: "You must enter a value for repetitions"});
        }
    } catch(error){
        if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
            const errors = error.errors.map(err => err.message);
            res.status(400).json({ errors: errors });   
        } else {
            throw error;
        }
    }
}));

//Delete route to destroy a specific set
router.delete("/workouts/:workoutId/exercises/:exerciseId/sets/:id", authenticateUser, async(req, res)=>{
    try{
        const exerciseModelId = parseInt(req.params.exerciseId);
        const set = await SetsReps.findByPk(req.params.id);
        //Checks to see if current user possesses the course
        if(exerciseModelId === set.exerciseId){
            await set.destroy();
            console.log("Set Successfully Deleted");
            res.status(204).end();
        } else {
            res.status(403).json({message: "Access Denied"}).end();
        }
    } catch(error){
        throw(error)
    } 
});

module.exports = router;