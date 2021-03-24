import { Router, Response, NextFunction } from "express";
import HttpStatusCodes from "http-status-codes";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

import Payload from "../../types/Payload";
import Request from "../../types/Request";
import { validationResult, check } from "express-validator/check";
import { DI } from "../../server";
import { User } from "../../entities/User";
import { ErrorHandler } from "../../middleware/error";

const router: Router = Router();

// @route   POST api/user
// @desc    Register user and store faceId if picture is provided
// @access  Public
router.post(
    "/",
    [
        check("username", "Please include a valid email").isLength({ min: 3 }),
        check("password", "Please enter a password with 6 or more characters").isLength({ min: 6 }),
    ],
    async (req: Request, res: Response, next: NextFunction) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(HttpStatusCodes.BAD_REQUEST).json({ errors: errors.array() });
        }

        const { username, password } = req.body;

        try {
            const { em } = DI;

            const user = await em.findOne(User, { username });
            if (user) {
                throw new ErrorHandler(HttpStatusCodes.BAD_REQUEST, "User already exists");
            }

            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            const createdUser = em.getRepository(User).create({ username, password: hashedPassword });
            await em.persistAndFlush(createdUser);

            const payload: Payload = {
                userId: createdUser.id,
            };

            jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRATION }, (err, token) => {
                if (err) {
                    throw err;
                }
                res.json({ token });
            });
        } catch (err) {
            if ("statusCode" in err) {
                next(err);
            } else {
                throw new ErrorHandler(HttpStatusCodes.INTERNAL_SERVER_ERROR, "Failed to register user");
            }
        }
    },
);

export default router;
