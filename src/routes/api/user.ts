import { Router, Response, NextFunction } from "express";
import HttpStatusCodes from "http-status-codes";

import Request from "../../types/Request";
import { validationResult, check } from "express-validator/check";
import { DI } from "../../server";
import { ErrorHandler } from "../../middleware/error";

const router: Router = Router();

// @route   POST api/user
// @desc    Register user
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
            const { userService } = DI;

            const token = userService.register(username, password);
            res.json({ token });
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
