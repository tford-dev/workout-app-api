"use strict";

import { Router } from "express";
import { asyncHandler } from "./middleware/asyncHandler";
import { User, Workout, Exercise } from './models';
import { authenticateUser } from "./middleware/authUser";
import { genSalt, hash } from "bcrypt";
const router = Router();



export default router;