"use strict";

const express = require("express");
const {asyncHandler} = require("../middleware/asyncHandler.js");
const { User, Workout, Exercise, SetsReps } = require('../models');
const {authenticateUser} = require("../middleware/authUser");
const bcrypt = require("bcrypt");
const router = express.Router();

//GET route to display workouts data from database
router.get("/workouts", authenticateUser, asyncHandler(async(req, res) => {
    try {
        //Current authenticated user
        const user = req.currentUser;
        //Empty array to for arrays in database
        let workoutsMapped = [];
        //Find all workouts in database
        const workouts = await Workout.findAll({
        //Find all workouts that were made by user
            where: {
                userId: user.id
            },
            //Descending order
            order: [['createdAt', 'DESC']],
            include: [
                {
                    model: User,
                    //User that created workout
                    as: "workout-creator",
                }
            ]
        });
  
    //Loops through workout data and maps title, description, time, createdAt for UI
    workouts.map(workout =>{
        let workoutArr = { 
            id: workout.id,
            title: workout.title,
            time: workout.time,
            description: workout.description,
            createdAt: workout.createdAt,
            userId: workout.userId,
        };
        workoutsMapped.push(workoutArr)
        });
        //send workoutsMapped to client
        res.json(workoutsMapped);

        res.status(200).end();
    } catch(error){
        throw error;
    }
}));

//Route to create a new workout
router.post("/workouts", authenticateUser, asyncHandler(async(req, res) => {
    try{
        //Hard code for validation errors
        if(req.body.title.length > 0 && req.body.description.length > 0){
            await Workout.create(req.body);
            //Sets location header to specific workout id
            res.location(`/workout/${Workout.id}`);
            res.status(201).end(console.log("New workout successfully created")).end();
        } else if(req.body.title.length === 0 && req.body.description.length === 0){
            res.status(400).json({errors: "You must enter a value for title and description."})
        } else if (req.body.title.length === 0) {
            res.status(400).json({errors: "You must enter a value for title."}).end();
        } else if (req.body.description.length === 0) {
            res.status(400).json({errors: "You must enter a value for description."}).end();
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

//GET route to display a specific workout
router.get("/workouts/:id", authenticateUser, asyncHandler(async(req, res) => {
    //Current authenticated user
    const user = req.currentUser;
    try {
        //Find specific workout by Id
        const workout = await Workout.findByPk(req.params.id, 
            {include: [
                {
                    model: User,
                    as: "workout-creator",
                }
            ]}
    );
        if(workout){
            if(user.id === workout.userId){
                //Sends object to client
                res.json({ 
                    id: workout.id,
                    title: workout.title,
                    description: workout.description,
                    time: workout.time,
                    userId: workout.userId,
                    createdAt: workout.createdAt,
            });
            } else {
                res.status(403).json({message: "Access Denied"}).end();
            }
        }
    } catch(error){
        throw error;
    }
}));

//PUT route to edit a workout
router.put("/workouts/:id", authenticateUser, asyncHandler(async(req, res) => {
    //Current authenticated user
    const user = req.currentUser;
    try{
        //If title and description are not blank
        if(req.body.title.length > 0 && req.body.description.length > 0){
            //Find workout by id from request
            const workout = await Workout.findByPk(req.params.id);
            console.log("Retrieved workout from put request");
            //Checks to see if current user possesses the workout
            if(user.id === workout.userId){
                if(workout){
                    //Updates workout's body
                    await workout.update(req.body);
                    res.status(204).end();
                } else {
                    res.status(404).json({message: "Exercise Not Found"});
                }
            } else {
                //Executes if user Id does not match userId in workout 
                res.status(403).json({message: "Access Denied"}).end();
            }
        //Hard code for validation errors
        } else if(req.body.title.length === 0 && req.body.description.length === 0){
            res.status(400).json({errors: "You must enter a value for title and description."})
        } else if (req.body.title.length === 0) {
            res.status(400).json({errors: "You must enter a value for title."}).end();
        } else if (req.body.description.length === 0) {
            res.status(400).json({errors: "You must enter a value for description."}).end();
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

//Delete route to destroy a specific workout and it's children
router.delete("/workouts/:id", authenticateUser, async(req, res)=>{
    //Current authenticated user
    const user = req.currentUser;
    try{
        //Finds current workout based off of :id in path
        const workout = await Workout.findByPk(req.params.id);
        //Find all Exercise-model children of workout
        const exercises = Exercise.findAll({
            //Where exercise workoutId === workout.id
            where: {
                workoutId: workout.id
            },
            order: [['createdAt', 'DESC']],
        }); 
        //Conditional only works if user id is equal to workout userId
        if(user.id === workout.userId){
            //Loops through exercise children of workout
            await exercises.forEach(exercise => {
                //If exercise child's workoutId === workout.id
                if(exercise.workoutId === workout.id){
                    //Finds all setsReps within exercise child
                    const sets = SetsReps.findAll({
                        //Where parent's id equals child's exerciseId
                        where: {
                            exerciseId: exercise.id
                        },
                        order: [['createdAt', 'DESC']],
                    });
                    //Loops through children of exercise
                    sets.forEach(set => {
                        //Conditional for if set's exerciseId equals parent's id in loop
                        if(set.exerciseId === exercise.id){
                            //Deletes set first
                            set.destroy();
                        }
                    })
                    //Deletes exercise second
                    exercise.destroy();
                }
                //Deletes workout last
                workout.destroy();
            })
            console.log("Workout Successfully Deleted");
            res.status(204).end();
        } else {
            res.status(403).json({message: "Access Denied"}).end();
        }
    } catch(error){
        throw(error)
    } 
});

module.exports = router;