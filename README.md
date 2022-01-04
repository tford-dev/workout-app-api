Routes

USER ROUTES
GET api/users = route for user authentication
--EXAMPLE: {
    "emailAddress": "example@example.com",
    "password": "examplePass"
}
POST api/users = route for registering a new user
--New user needs to have a first name, last name, email address, and password
--EXAMPLE: {
    "firstName" : "example1",
    "lastName" : "example2",
    "emailAddress": "example@example.com",
    "password": "examplePass"
}

WORKOUT ROUTES -Only displays data if authorized user has made workout data
GET api/workouts = Displays all workouts made by authenticated user
GET api/workouts/:id = Displays a specific workout
POST api/workouts = Creates a new workout
--New workout must have a title and description
--EXAMPLE: {
    "title": "Leg workout",
    "description": "Goal is to do a 5x5",
    "time": "INSERT DATE HERE"
}
PUT api/workouts/:id = Updates title and/or description of a workout
DELETE api/workouts/:id = Deletes specific workout and it's children

EXERCISE ROUTES
GET api/workouts/:workoutId/exercises = Displays exercise data if exercises workoutId matches :workoutId in path
GET api/workouts/:workoutId/exercises/:id = Displays a specific exercise if exercise's workoutId matches :workoutId in path
POST api/workouts/:workoutId/exercises = Creates a new exercise
--New exercise must have a title
--EXAMPLE: {
    "title": "pull-ups"
}
PUT api/workouts/:workoutId/exercises/:id = Updates an exercise if it's workoutId matches :workoutId
DELETE api/workouts/:workoutId/exercises/:id = Deletes a specific exercise and it's children
 
SETS ROUTES 
GET api/workouts/:workoutId/exercises/:exerciseId/sets = Displays sets and reps data if exerciseId matches :exerciseId in path
GET api/workouts/:workoutId/exercises/:exerciseId/sets/:id = Displays specific sets/reps, mainly for editing sets and reps
POST api/workouts/:workoutId/exercises/:exerciseId/sets = Creates sets/reps for the corresponding exerciseId in path
--New set must have repetitions
--When displaying data, the index or id can be the set number
--EXAMPLE: {
    "repetitions" : 15
}
PUT api/workouts/:workoutId/exercises/:exerciseId/sets/:id = Edits specific sets/reps
DELETE api/workouts/:workoutId/exercises/:exerciseId/sets/:id = Delete specific sets/reps within exercise
