import bodyParser from "body-parser";
import express from "express";
import { MikroORM, EntityManager } from "@mikro-orm/core";
import HackerNewsService from "./services/hackerNewsService";

import * as dotenv from "dotenv";
import auth from "./routes/api/auth";
import user from "./routes/api/user";
import collection from "./routes/api/collection";
import { handleError, ErrorHandler } from "./middleware/error";

const app = express();
const port = process.env.PORT || 3000;

export const DI = {} as {
    orm: MikroORM;
    em: EntityManager;
    hackerNewsService: HackerNewsService;
};

(async () => {
    dotenv.config();

    DI.orm = await MikroORM.init();
    DI.em = DI.orm.em;
    DI.hackerNewsService = new HackerNewsService();

    // Express configuration
    app.set("port", process.env.PORT || 5000);
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: false }));

    // @route   GET /
    // @desc    Hello world route
    // @access  Public
    app.get("/", (_req, res) => {
        res.send("I love memes");
    });

    app.use("/api/auth", auth);
    app.use("/api/user", user);
    app.use("/api/collection", collection);

    app.use((err: ErrorHandler, req: express.Request, res: express.Response, next: express.NextFunction) => {
        handleError(err, res);
    });

    app.listen(port, () => console.log(`Server started on port ${port}`));
})();
