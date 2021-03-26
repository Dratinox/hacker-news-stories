import { Story } from "../entities/Story";
import { DI } from "../server";
import { commentQueue } from "../queues/commentQueue";
import { IStoryComment } from "../interfaces";
import { StoryComment } from "../entities/StoryComment";

export default class StoryService {
    public async findOneOrCreate(id: number, collectionId: number): Promise<Story> {
        const { em, elasticSearchService, hackerNewsService } = DI;
        const existingStory = await em.findOne(Story, { id });
        if (existingStory) {
            return existingStory;
        }

        const story = await hackerNewsService.getStory(id);

        const createdStory = em.create(Story, {
            id: story.id,
            title: story.title,
            author: story.by,
            time: story.time * 1000,
            url: story.url,
            descendants: story.descendants,
            collection: collectionId,
        });
        await em.persistAndFlush(createdStory);

        await commentQueue.add({ id: id, kids: story.kids });
        await elasticSearchService.indexStory(story);

        return createdStory;
    }

    public async createComment(comment: IStoryComment, storyId: number) {
        const { em, elasticSearchService } = DI;
        const createdComment = em.create(StoryComment, {
            id: comment.id,
            text: comment.text,
            author: comment.by,
            time: comment.time * 1000,
            story: storyId,
            parentId: comment.parent,
            commentStoryId: storyId,
        });
        await em.nativeInsert(createdComment);
        await elasticSearchService.indexComment(comment, storyId);
    }
}
