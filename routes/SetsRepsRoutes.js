"use strict";

import { Router } from "express";
import { asyncHandler } from "./middleware/asyncHandler";
import { User, Workout, Exercise, SetsReps } from './models';
import { authenticateUser } from "./middleware/authUser";
import { genSalt, hash } from "bcrypt";
const router = Router();

//GET route to display setsReps data from database
router.get("/workout/:workoutId/exercise/:exerciseId/sets", authenticateUser, asyncHandler(async(req, res) => {
    //Equals Exercise Object
    const exercise = Exercise.findByPk(req.params.exerciseId);
    try {
        //Empty setsReps Array
        let setsMapped = [];
        //Finds all setsReps within exercise
        const sets = await SetsReps.findAll({
            //Only if id equals exerciseId
            where: {
                exerciseId: exercise.id
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

//GET route to display a specific set
router.get("workout/:workoutId/exercise/:exerciseId/set/:id", authenticateUser, asyncHandler(async(req, res) => {
    //Current exercise
    const exercise = Exercise.findByPk(req.params.exerciseId);
    try {
        //Find specific set by Id
        const set = await SetsReps.findByPk(req.params.id, 
            {include: [
                {
                    model: Exercise,
                    as: "exercise-sets-reps",
                }
            ]}
        );
        if(set){
            if(exercise.id === set.exerciseId){
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

//POST route to create a new set
router.post("/workout/:workoutId/exercise/:exerciseId/set", authenticateUser, asyncHandler(async(req, res) => {
    try{
        //set number and rep number can't be null
        if(req.body.setNumber > 0 && req.body.repetitions > 0){
            await SetsReps.create(req.body);
            res.status(201).end(console.log("New set successfully logged!")).end();
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

//PUT route to edit a set
router.put("workout/:workoutId/exercise/:exerciseId/set/:id", authenticateUser, asyncHandler(async(req, res) => {
    const set = await SetsReps.findByPk(req.params.id);
    const exercise = await Exercise.findByPk(req.params.exerciseId);
    try{
        if(req.body.setNumber > 0 && req.body.repetitions > 0){
            console.log("Retrieved set from put request");
            //Checks to see if current set is of exercise
            if(exercise.id === set.exerciseId){
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
router.delete("/workout/:workoutId/exercise/:exerciseId/set/:id", authenticateUser, async(req, res)=>{
    try{
        const exercise = await Exercise.findByPk(req.params.exerciseId);
        const set = await SetsReps.findByPk(req.params.id);
        //Checks to see if current user possesses the course
        if(exercise.id === set.exerciseId){
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

export default router;