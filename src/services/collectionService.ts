import HttpStatusCodes from "http-status-codes";
import { DI } from "../server";
import { StoryCollection } from "../entities/StoryCollection";
import { ErrorHandler } from "../middleware/error";
import { Story } from "../entities/Story";

export default class CollectionService {
    public async findOneByNameOrCreate(name: string, ownerId: number): Promise<StoryCollection> {
        const { em } = DI;

        const collection = await em.findOne(StoryCollection, { name, ownerId }, ["stories"]);
        if (collection) {
            return collection;
        }

        const createdCollection = em.create(StoryCollection, { name, ownerId, user: ownerId });
        await em.persistAndFlush(createdCollection);
        em.clear();

        return createdCollection;
    }

    public async find(ownerId: number): Promise<StoryCollection[]> {
        const { em } = DI;

        const collections = await em.find(StoryCollection, { ownerId }, ["stories"]);
        return collections;
    }

    public async findAllStoriesForUser(ownerId: number, collectionId?: number): Promise<number[]> {
        const { em } = DI;

        const collections = await em.find(StoryCollection, { ...(collectionId && { id: collectionId }), ownerId }, ["stories"]);
        const stories = collections.flatMap((collection: StoryCollection) => collection.stories.getItems().map((story: Story) => story.id));
        return stories;
    }

    public async addStoryToCollection(collection: StoryCollection, story: Story): Promise<StoryCollection> {
        const { em } = DI;
        collection.stories.add(story);
        await em.persistAndFlush(collection);
        return await this.findOne(collection.id, collection.ownerId);
    }

    public async findOne(id: number, ownerId: number): Promise<StoryCollection> {
        const { em } = DI;

        const collection = await em.findOne(StoryCollection, { id, ownerId }, ["stories"]);
        return collection;
    }

    public async update(id: number, ownerId: number, data: Partial<StoryCollection>): Promise<StoryCollection> {
        const { em } = DI;
        const { name } = data;

        const collectionNameExists = await em.findOne(StoryCollection, { ownerId, name });
        if (collectionNameExists) {
            throw new ErrorHandler(HttpStatusCodes.BAD_REQUEST, "You already have collection with given name");
        }

        await em.nativeUpdate(StoryCollection, id, { name });
        em.clear();
        return await this.findOne(id, ownerId);
    }

    public async delete(id: number): Promise<{ msg: string }> {
        const { em } = DI;

        await em.nativeDelete(StoryCollection, { id });
        return { msg: "Entity successfully deleted" };
    }
}
