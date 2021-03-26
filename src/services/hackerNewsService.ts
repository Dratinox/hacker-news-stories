import { IStory, IStoryComment } from "../interfaces";
import HttpStatusCodes from "http-status-codes";
import axios from "axios";
import { ErrorHandler } from "../middleware/error";
import { DI } from "../server";

export default class HackerNewsService {
    public readonly apiUrl: string;
    constructor() {
        this.apiUrl = process.env.HACKER_NEWS_API_URL;
    }

    public async getStory(id: number): Promise<IStory> {
        try {
            const response = await axios.get<IStory>(`${this.apiUrl}${id}.json`);
            if (response.data.type !== "story") {
                throw new ErrorHandler(HttpStatusCodes.BAD_REQUEST, "This hacker news object is not a story");
            }
            return response.data;
        } catch (err) {
            if ("statusCode" in err) {
                throw err;
            }
            throw new ErrorHandler(HttpStatusCodes.INTERNAL_SERVER_ERROR, "Failed to fetch story");
        }
    }

    public async fetchCommentsRecursively(commentId: number, storyId: number): Promise<void> {
        const comment = await this.fetchComment(commentId);

        // TODO: In case of error poll job to fetch this comment again ---> optional parameter to not go into infinite loop?
        try {
            const { storyService } = DI;
            await storyService.createComment(comment, storyId);
        } catch (err) {
            return;
        }

        if (!comment || !comment.kids) {
            return;
        }

        const promises = comment.kids.map((kid) => this.fetchCommentsRecursively(kid, storyId));
        await Promise.all(promises);
    }

    private async fetchComment(id: number): Promise<IStoryComment> {
        try {
            const response = await axios.get<IStoryComment>(`${this.apiUrl}${id}.json`);
            if (response.data.type !== "comment") {
                throw new Error();
            }
            return response.data;
        } catch (err) {
            return null;
        }
    }
}
