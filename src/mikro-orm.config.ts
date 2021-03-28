import { Options } from "@mikro-orm/core";
import { Story } from "./entities/Story";
import { User } from "./entities/User";
import { StoryComment } from "./entities/StoryComment";
import { StoryCollection } from "./entities/StoryCollection";
import path from "path";

const options: Options = {
    entities: [Story, User, StoryCollection, StoryComment],
    dbName: process.env.DATABASE,
    type: "postgresql",
    clientUrl: process.env.CLIENT_URL,
};

// Bullshit errors appeared and I didn't really wanna deal with them
export const getConfig = (): Options => {
    return {
        entities: [Story, User, StoryCollection, StoryComment],
        migrations: {
            path: path.join(__dirname, "./migrations"),
            pattern: /^[\w-]+\d+\.[tj]s$/,
        },
        dbName: process.env.DATABASE,
        type: "postgresql",
        clientUrl: process.env.CLIENT_URL,
    };
};

export default options;
