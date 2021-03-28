import { Router, Response, NextFunction } from "express";
import HttpStatusCodes from "http-status-codes";

import Request from "../../types/Request";
import { DI } from "../../server";
import auth from "../../middleware/auth";
import { ErrorHandler } from "../../middleware/error";

const router: Router = Router();

// @route   POST api/search
// @desc    Performs a full-text search on ElasticSearch index
// @access  Private
router.post("/", auth, async (req: Request, res: Response, next: NextFunction) => {
    const { collectionId, term } = req.body;
    const { userId } = req;

    try {
        const { elasticSearchService } = DI;

        const response = await elasticSearchService.fulltextSearch(term, userId, collectionId ?? undefined);
        return res.json(response);
    } catch (err) {
        if ("statusCode" in err) {
            next(err);
        } else {
            throw new ErrorHandler(HttpStatusCodes.INTERNAL_SERVER_ERROR, err.message);
        }
    }
});
export default router;
