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
    const workout = Workout.findByPk(req.params.workoutId);
    try {
        //Empty exercise Array
        let exercisesMapped = [];
        //Finds all exercises within workout
        const exercises = await Exercise.findAll({
            //Only if id equals workoutId
            where: {
                workoutId: workout.id
            },
            order: [['createdAt', 'DESC']],
            include: [
                {
                    model: Workout,
                    as: "workout-exercise",
                }
            ]
        });
    
    //Creates array of exercises
    exercises.map(exercise =>{
        let exerciseArr = { 
            id: exercise.id,
            title: exercise.title,
            sets: exercise.sets,
            repetitions: exercise.repetitions,
            createdAt: exercise.createdAt,
            workoutId: exercise.workoutId,
        };
        exercisesMapped.push(exerciseArr)
        });

        //sends object to client
        res.json(exercisesMapped);

        res.status(200).end();
    } catch(error){
        throw error;
    }
}));

//POST route to create a new exercise
router.post("/workouts/:workoutId/exercises", authenticateUser, asyncHandler(async(req, res) => {
    try{
        //Title is the parameter that CAN'T be null
        if(req.body.title.length > 0){
            await Exercise.create(req.body);
            res.status(201).end(console.log("New exercise successfully created!")).end();
        //Title for exercise cannot be null
        } else if(req.body.title.length === 0){
            res.status(400).json({errors: "You must enter a value for title."})
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
router.get("workouts/:workoutId/exercises/:id", authenticateUser, asyncHandler(async(req, res) => {
    //Current workout
    const workout = Workout.findByPk(req.params.workoutId);
    try {
        //Find specific exercise by Id
        const exercise = await Exercise.findByPk(req.params.id, 
            {include: [
                {
                    model: Workout,
                    as: "workout-exercise",
                },
                {
                    model: SetsReps,
                    as: "exercise-sets-reps"
                }
            ]}
    );
        if(exercise){
            if(workout.id === exercise.workoutId){
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
        }
    } catch(error){
        throw error;
    }
}));

//PUT route to edit an exercise
router.put("workouts/:workoutId/exercises/:id", authenticateUser, asyncHandler(async(req, res) => {
    const exercise = await Exercise.findByPk(req.params.id);
    const workout = await Workout.findByPk(req.params.workoutId);
    try{
        if(req.body.title.length > 0){
            console.log("Retrieved exercise from put request");
            //Checks to see if current user possesses the workout
            if(workout.id === exercise.workoutId){
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

//Delete route to destroy a specific exercise
router.delete("/workouts/:workoutId/exercises/:id", authenticateUser, async(req, res)=>{
    try{
        //Finds workout based off of :workoutId in path
        const workout = await Workout.findByPk(req.params.workoutId);
        //Finds exercise based off of :id in path
        const exercise = await Exercise.findByPk(req.params.id);
        //Checks to see if exercise is a child of workout
        if(workout.id === exercise.workoutId){
            //Finds all sets that are a child of the parent
            const sets = await SetsReps.findAll({
                //Where parent's id equals child's exerciseId
                where: {
                    exerciseId: exercise.id
                },
                order: [['createdAt', 'DESC']],
            });
            //Loops through children of exercise
            await sets.forEach(set => {
                //Conditional for if set's exerciseId equals parent's id in loop
                if(set.exerciseId === exercise.id){
                    //Deletes set first
                    set.destroy();
                }
            })
            //Deletes exercise last
            await exercise.destroy();
            console.log("Exercise Successfully Deleted");
            res.status(204).end();
        } else {
            res.status(403).json({message: "Access Denied"}).end();
        }
    } catch(error){
        throw(error)
    } 
});

module.exports = router;