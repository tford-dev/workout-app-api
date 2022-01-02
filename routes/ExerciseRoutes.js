"use strict";

const express = require("express");
const {asyncHandler} = require("../middleware/asyncHandler.js");
const { User, Workout, Exercise, SetsReps } = require('../models');
const {authenticateUser} = require("../middleware/authUser");
const bcrypt = require("bcrypt");
const router = express.Router();

//GET route to display exercise data from database
router.get("/workouts/:workoutId/exercises", authenticateUser, asyncHandler(async(req, res) => {
    //Equals Workout Object
    //const workout = await Workout.findByPk(parseInt(req.params.workoutId));
    try {
        //Empty exercise Array
        let exercisesMapped = [];
        //Finds all exercises within workout
        const exercises = await Exercise.findAll({
            //Only if id equals workoutId
            where: {
                workoutId: parseInt(req.params.workoutId)
            },
            order: [['createdAt', 'DESC']],
        });
    
        //Creates array of exercises
        exercises.map(exercise =>{
            let exerciseArr = { 
                id: exercise.id,
                title: exercise.title,
                createdAt: exercise.createdAt,
                workoutId: exercise.workoutId,
            };
            exercisesMapped.push(exerciseArr)
        });

        if(exercisesMapped.length){
            //sends object to client
            res.json(exercisesMapped);

            res.status(200).end();
        } else {
            res.status(404).json({errors: "No exercises found"}).end();   

        }
    } catch(error){
        throw error;
    }
}));

//POST route to create a new exercise
router.post("/workouts/:workoutId/exercises", authenticateUser, asyncHandler(async(req, res) => {
    try{
        //Title CAN'T be null
        if(req.body.title.length > 0){
            await Exercise.create(
                req.body,
                req.body.workoutId = parseInt(req.params.workoutId)
            );
            res.status(201)
                .json({message: "New exercise successfully created!"})
                .end(console.log("New exercise successfully created!"));
        //Title for exercise cannot be null
        } else if(req.body.title.length === 0){
            res.status(400).json({errors: "You must enter a value for title."});
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

//GET route to display a specific exercise
router.get("/workouts/:workoutId/exercises/:id", authenticateUser, asyncHandler(async(req, res) => {
    //Current workout
    const workout = await Workout.findByPk(parseInt(req.params.workoutId));
    try {
        //Find specific exercise by Id
        const exercise = await Exercise.findByPk(req.params.id);
        if(exercise){
            //If :workoutId in path matches exercise workoutId
            if(parseInt(req.params.workoutId) === exercise.workoutId){
                //Sends object to client
                res.json({ 
                    id: exercise.id,
                    title: exercise.title,
                    description: exercise.sets,
                    time: exercise.repetitions,
                    workoutId: workout.workoutId,
                    createdAt: exercise.createdAt,
            });
            } else {
                res.status(403).json({message: "Access Denied"}).end();
            }
        } else {
            res.status(404).json({message: "Exercise not found."}).end();
        }
    } catch(error){
        throw error;
    }
}));

//PUT route to edit an exercise
router.put("/workouts/:workoutId/exercises/:id", authenticateUser, asyncHandler(async(req, res) => {
    const exercise = await Exercise.findByPk(req.params.id);
    try{
        if(req.body.title.length > 0){
            console.log("Retrieved exercise from put request");
            //Checks to see if current user possesses the workout
            if(parseInt(req.params.workoutId) === exercise.workoutId){
                if(exercise){
                    await exercise.update(req.body);
                    res.status(204).end();
                } else {
                    res.status(404).json({message: "Exercise Not Found"});
                }
            } else {
                res.status(403).json({message: "Access Denied"}).end();
            }
        } else if(req.body.title.length === 0){
            res.status(400).json({errors: "You must enter a value for title"})
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

//Delete route to destroy a specific exercise and it's children(sets)
router.delete("/workouts/:workoutId/exercises/:id", authenticateUser, async(req, res)=>{
    try{
        //Finds exercise based off of :id in path
        const exercise = await Exercise.findByPk(req.params.id);
        //Finds all sets that are a child of the parent
        const sets = await SetsReps.findAll({
            //Where parent's id equals child's exerciseId
            where: {
                exerciseId: exercise.id
            },
            order: [['createdAt', 'DESC']],
        });
        //Checks to see if exercise is a child of workout
        if(parseInt(req.params.workoutId) === exercise.workoutId){
            //If sets array has data
            if(sets.length){
                //Loops through children of exercise
                await sets.forEach(async(set) => {
                    //Deletes set first
                    await set.destroy();
                })
                console.log(`Sets of ${exercise.title} successfully deleted.`)
            }
            //Deletes exercise last
            await exercise.destroy();
            res.status(204)
                .json({message: "Exercise Successfully Deleted"})
                .end(console.log("Exercise Successfully Deleted"));
        } else {
            res.status(403).json({message: "Access Denied"}).end();
        }
    } catch(error){
        throw(error)
    } 
});

module.exports = router;