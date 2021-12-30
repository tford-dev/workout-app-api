Routes

USER ROUTES
GET /users = route for user authentication
POST /users = route for registering a new user
--New user needs to have a first name, last name, email address, and password

WORKOUT ROUTES -Only displays data if authorized user has made workout data
GET /workouts = Displays all workouts made by authenticated user
GET /workout/:id = Displays a specific workout
POST /workouts = Creates a new workout
--New workout must have a title and description
PUT /workout/:id = Updates title and/or description of a workout
DELETE /workout/:id = Deletes specific workout TERRANCE ADD LOGIC TO DELETE ASSOCCIATIONS OF A WORKOUT

EXERCISE ROUTES
GET /workout/:workoutId/exercises = Displays exercise data if exercises workoutId matches :workoutId in path
GET workout/:workoutId/exercise/:id = Displays a specific exercise if exercise's workoutId matches :workoutId in path
POST /workout/:workoutId/exercise = Creates a new exercise
--New exercise must have a title
PUT workout/:workoutId/exercise/:id = Updates an exercise if it's workoutId matches :workoutId
DELETE /workout/:workoutId/exercise/:id = Deletes a specific exercise
 

