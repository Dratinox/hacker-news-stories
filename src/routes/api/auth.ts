import bcrypt from "bcryptjs";
import { Router, Response, NextFunction } from "express";
import { check, validationResult } from "express-validator/check";
import HttpStatusCodes from "http-status-codes";
import jwt from "jsonwebtoken";

import auth from "../../middleware/auth";
import Payload from "../../types/Payload";
import Request from "../../types/Request";
import { DI } from "../../server";
import { User } from "../../entities/User";
import { ErrorHandler } from "../../middleware/error";

const router: Router = Router();

// @route   GET api/auth
// @desc    Get authenticated user given the token
// @access  Private
router.get("/", auth, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { em } = DI;
        const { id, username } = await em.getRepository(User).findOne(req.userId);
        res.json({ id, username });
    } catch (err) {
        throw new ErrorHandler(HttpStatusCodes.INTERNAL_SERVER_ERROR, "Failed to retrieve user");
    }
});

// @route   POST api/auth
// @desc    Login user and get token
// @access  Public
router.post(
    "/",
    [
        check("username", "Minimum length of username is 3 characters").isLength({ min: 3 }),
        check("password", "Minimum length of password is 6 characters").isLength({ min: 6 }),
    ],
    async (req: Request, res: Response, next: NextFunction) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(HttpStatusCodes.BAD_REQUEST).json({ errors: errors.array() });
        }

        const { em } = DI;

        const { username, password } = req.body;

        try {
            const user = await em.getRepository(User).findOne({ username });
            if (!user) {
                throw new ErrorHandler(HttpStatusCodes.NOT_FOUND, "User doesn't exist");
            }

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                throw new ErrorHandler(HttpStatusCodes.UNAUTHORIZED, "Wrong password");
            }

            const payload: Payload = {
                userId: user.id,
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
                throw new ErrorHandler(HttpStatusCodes.INTERNAL_SERVER_ERROR, "Failed to login");
            }
        }
    },
);

export default router;
