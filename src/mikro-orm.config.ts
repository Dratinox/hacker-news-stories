import { Options } from "@mikro-orm/core";
import { Story } from "./entities/Story";
import { User } from "./entities/User";
import { StoryComment } from "./entities/StoryComment";
import { StoryCollection } from "./entities/StoryCollection";

const options: Options = {
    entities: [Story, User, StoryCollection, StoryComment],
    dbName: process.env.DATABASE,
    type: "postgresql",
    clientUrl: process.env.CLIENT_URL,
};

export default options;
