import { Router, Response, NextFunction } from "express";
import HttpStatusCodes from "http-status-codes";

import Request from "../../types/Request";
import { validationResult, check } from "express-validator/check";
import { DI } from "../../server";
import auth from "../../middleware/auth";
import { StoryCollection } from "../../entities/StoryCollection";
import { Story } from "../../entities/Story";
import { ErrorHandler } from "../../middleware/error";
import { commentQueue } from "../../queues/commentQueue";

const router: Router = Router();

// @route   POST api/collection
// @desc    Register user and store faceId if picture is provided
// @access  Public
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
            const { em } = DI;

            let collection = await em.findOne(StoryCollection, { name, ownerId: userId }, ["stories"]);
            if (!collection) {
                collection = em.create(StoryCollection, { name, ownerId: userId, user: userId });
                await em.persistAndFlush(collection);
            }

            const existingStory = await em.findOne(Story, { id });
            if (existingStory) {
                collection.stories = [...collection.stories, existingStory];
            } else {
                const story = await DI.hackerNewsService.getStory(id);

                const createdStory = em.create(Story, {
                    id: story.id,
                    title: story.title,
                    author: story.by,
                    time: story.time * 1000,
                    url: story.url,
                    descendants: story.descendants,
                    collection: collection.id,
                });
                await em.persistAndFlush(createdStory);
                collection.stories = [...collection.stories, createdStory];
                await commentQueue.add({ id: id, kids: story.kids });
            }

            await em.persistAndFlush(collection);

            return res.json(collection);
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
        const { em } = DI;

        const collections = await em.find(StoryCollection, { ownerId: userId });

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
        const { em } = DI;

        const collection = await em.findOne(StoryCollection, { id: +id, ownerId: userId }, ["stories"]);

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
router.get(
    "/:id",
    auth,
    [check("name", "Collection name needs to have at least 3 characters").isLength({ min: 3 })],
    async (req: Request, res: Response, next: NextFunction) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(HttpStatusCodes.BAD_REQUEST).json({ errors: errors.array() });
        }

        const { id } = req.params;
        const { name } = req.body;
        const { userId } = req;

        try {
            const { em } = DI;

            const collectionNameExists = await em.findOne(StoryCollection, { ownerId: userId, name });
            if (collectionNameExists) {
                throw new ErrorHandler(HttpStatusCodes.BAD_REQUEST, "You already have collection with given name");
            }

            const collection = await em.findOne(StoryCollection, { id: +id, ownerId: userId }, ["stories"]);

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

export default router;
