import { IStory, IStoryComment } from "../interfaces";
import HttpStatusCodes from "http-status-codes";
import axios from "axios";
import { ErrorHandler } from "../middleware/error";
import { DI } from "../server";
import { StoryComment } from "../entities/StoryComment";

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
            if (err.message === "This hacker news object is not a story") {
                throw err;
            }
            return null;
        }
    }

    public async fetchCommentsRecursively(commentId: number, storyId: number): Promise<void> {
        const comment = await this.fetchComment(commentId);

        try {
            const createdComment = DI.em.create(StoryComment, {
                id: comment.id,
                text: comment.text,
                author: comment.by,
                time: comment.time * 1000,
                story: storyId,
                parentId: comment.parent,
                commentStoryId: storyId,
            });
            await DI.em.nativeInsert(createdComment);
        // TODO: In case of error poll job to fetch this comment again ---> optional parameter to not go into infinite loop?
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
