import { Router, Response, NextFunction } from "express";
import { check, validationResult } from "express-validator/check";
import HttpStatusCodes from "http-status-codes";

import auth from "../../middleware/auth";
import Request from "../../types/Request";
import { DI } from "../../server";
import { ErrorHandler } from "../../middleware/error";

const router: Router = Router();

// @route   GET api/auth
// @desc    Get authenticated user given the token
// @access  Private
router.get("/", auth, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { userService } = DI;
        const { userId } = req;

        const { id, username } = await userService.findOne(userId);
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

        const { userService } = DI;
        const { username, password } = req.body;

        try {
            const token = await userService.login(username, password);
            res.json({ token });
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
