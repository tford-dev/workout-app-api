Routes

USER ROUTES
GET /users = route for user authentication
POST /users = route for registering a new user
--New user needs to have a first name, last name, email address, and password

WORKOUT ROUTES -Only displays data if authorized user has made workout data
GET /workouts = Displays all workouts made by authenticated user
GET /workouts/:id = Displays a specific workout
POST /workouts = Creates a new workout
--New workout must have a title and description
PUT /workouts/:id = Updates title and/or description of a workout
DELETE /workouts/:id = Deletes specific workout TERRANCE ADD LOGIC TO DELETE ASSOCCIATIONS OF A WORKOUT

EXERCISE ROUTES
GET /workouts/:workoutId/exercises = Displays exercise data if exercises workoutId matches :workoutId in path
GET workouts/:workoutId/exercises/:id = Displays a specific exercise if exercise's workoutId matches :workoutId in path
POST /workouts/:workoutId/exercises = Creates a new exercise
--New exercise must have a title
PUT workouts/:workoutId/exercises/:id = Updates an exercise if it's workoutId matches :workoutId
DELETE /workouts/:workoutId/exercises/:id = Deletes a specific exercise
 
SETS ROUTES 
GET /workouts/:workoutId/exercises/:exerciseId/sets = Displays sets and reps data if exerciseId matches :exerciseId in path
GET workouts/:workoutId/exercises/:exerciseId/sets/:id = Displays specific sets/reps, mainly for editing sets and reps
POST /workouts/:workoutId/exercises/:exerciseId/sets = Creates sets/reps for the corresponding exerciseId in path
PUT workouts/:workoutId/exercises/:exerciseId/sets/:id = Edits specific sets/reps
DELETE workouts/:workoutId/exercises/:exerciseId/sets/:id = Delete specific sets/reps within exercise
