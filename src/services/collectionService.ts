import HttpStatusCodes from "http-status-codes";
import { DI } from "../server";
import { StoryCollection } from "../entities/StoryCollection";
import { ErrorHandler } from "../middleware/error";

export default class CollectionService {
    public async findOneByNameOrCreate(name: string, ownerId: number): Promise<StoryCollection> {
        const { em } = DI;

        let collection = await em.findOne(StoryCollection, { name, ownerId }, ["stories"]);
        if (!collection) {
            collection = em.create(StoryCollection, { name, ownerId, user: ownerId });
            await em.persistAndFlush(collection);
        }
        return collection;
    }

    public async find(ownerId: number): Promise<StoryCollection[]> {
        const { em } = DI;

        const collections = await em.find(StoryCollection, { ownerId });
        return collections;
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

        await em.nativeUpdate(StoryCollection, id, data);
        return await this.findOne(id, ownerId);
    }
}
