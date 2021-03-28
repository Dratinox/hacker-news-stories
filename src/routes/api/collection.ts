import { Router, Response, NextFunction } from "express";
import HttpStatusCodes from "http-status-codes";

import Request from "../../types/Request";
import { validationResult, check } from "express-validator/check";
import { DI } from "../../server";
import auth from "../../middleware/auth";
import { ErrorHandler } from "../../middleware/error";

const router: Router = Router();

// @route   POST api/collection
// @desc    Adds story to collection and creates it if it doesn't exist
// @access  Private
router.post(
    "/",
    auth,
    [check("name", "Please enter a collection name with 3 or more characters").isLength({ min: 3 })],
    async (req: Request, res: Response, next: NextFunction) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(HttpStatusCodes.BAD_REQUEST).json({ errors: errors.array() });
        }

        const { id, name } = req.body;
        const { userId } = req;

        try {
            const { collectionService, storyService } = DI;

            const collection = await collectionService.findOneByNameOrCreate(name, userId);

            const story = await storyService.findOneOrCreate(id, collection.id);

            const collectionWithStories = await collectionService.addStoryToCollection(collection, story);

            return res.json(collectionWithStories);
        } catch (err) {
            if ("statusCode" in err) {
                next(err);
            } else {
                throw new ErrorHandler(HttpStatusCodes.INTERNAL_SERVER_ERROR, err.message);
            }
        }
    },
);

// @route   GET api/collection
// @desc    Returns all collections of given user
// @access  Private
router.get("/", auth, async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = req;

    try {
        const { collectionService } = DI;

        const collections = await collectionService.find(userId);

        return res.json(collections);
    } catch (err) {
        if ("statusCode" in err) {
            next(err);
        } else {
            throw new ErrorHandler(HttpStatusCodes.INTERNAL_SERVER_ERROR, "Failed to fetch collections");
        }
    }
});

// @route   GET api/collection:id
// @desc    Returns collection by given id
// @access  Private
router.get("/:id", auth, async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { userId } = req;

    try {
        const { collectionService } = DI;

        const collection = await collectionService.findOne(+id, userId);

        return res.json(collection);
    } catch (err) {
        if ("statusCode" in err) {
            next(err);
        } else {
            throw new ErrorHandler(HttpStatusCodes.INTERNAL_SERVER_ERROR, "Failed to fetch collection");
        }
    }
});

// @route   PUT api/collection:id
// @desc    Updates collection with given id
// @access  Private
router.put(
    "/:id",
    auth,
    [check("name", "Collection name needs to have at least 3 characters").isLength({ min: 3 })],
    async (req: Request, res: Response, next: NextFunction) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(HttpStatusCodes.BAD_REQUEST).json({ errors: errors.array() });
        }

        const { id } = req.params;
        const { userId } = req;

        try {
            const { collectionService } = DI;
            const collection = await collectionService.update(+id, userId, req.body);

            return res.json(collection);
        } catch (err) {
            if ("statusCode" in err) {
                next(err);
            } else {
                throw new ErrorHandler(HttpStatusCodes.INTERNAL_SERVER_ERROR, "Failed to update collection");
            }
        }
    },
);

// @route   DELETE api/collection:id
// @desc    Deletes collection with given id
// @access  Private
router.delete("/:id", auth, async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    try {
        const { collectionService } = DI;
        const deleteResponse = await collectionService.delete(+id);

        return res.json(deleteResponse);
    } catch (err) {
        if ("statusCode" in err) {
            next(err);
        } else {
            throw new ErrorHandler(HttpStatusCodes.INTERNAL_SERVER_ERROR, "Failed to delete collection");
        }
    }
});

export default router;
