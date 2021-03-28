import elastic from "elasticsearch";
import { IStory, IElasticItem, IStoryComment, SearchResponse } from "../interfaces";
import { DI } from "../server";

// Default elastic index
const index = "hacker-news";

export default class ElasticSearchService {
    private readonly client: elastic.Client;
    constructor() {
        this.client = new elastic.Client({
            host: process.env.ELASTIC_HOST,
            log: "debug",
        });
        this.initIndex();
    }

    private async initIndex(): Promise<void> {
        //await this.client.indices.delete({ index });
        const exists = await this.client.indices.exists({ index });
        if (!exists) {
            await this.client.indices.create({ index: "hacker-news" });
            await this.client.indices.putMapping({
                index,
                type: "hacker-news-item",
                includeTypeName: true,
                body: {
                    properties: {
                        author: { type: "text" },
                        time: { type: "date" },
                        url: { type: "text" },
                        content: { type: "text" },
                        storyId: { type: "text" },
                        relation_type: {
                            type: "join",
                            relations: {
                                post: "comment",
                            },
                        },
                    },
                },
            });
        }
    }

    public async indexStory(story: IStory): Promise<void> {
        const doc: elastic.IndexDocumentParams<IElasticItem> = {
            index,
            type: "hacker-news-item",
            refresh: true,
            id: story.id.toString(),
            body: {
                storyId: story.id.toString(),
                content: story.title,
                author: story.by,
                time: story.time * 1000,
                url: story.url,
                relation_type: {
                    name: "post",
                },
            },
        };

        await this.client.index(doc);
    }

    public async indexComment(comment: IStoryComment, storyId: number): Promise<void> {
        const doc: elastic.IndexDocumentParams<IElasticItem> = {
            index,
            type: "hacker-news-item",
            refresh: true,
            id: comment.id.toString(),
            routing: storyId.toString(),
            body: {
                author: comment.by,
                content: comment.text,
                time: comment.time * 1000,
                url: "",
                storyId: storyId.toString(),
                relation_type: {
                    name: "comment",
                    parent: storyId.toString(),
                },
            },
        };

        await this.client.index(doc);
    }

    public async fulltextSearch(term: string, ownerId: number, collectionId?: number): Promise<SearchResponse<IElasticItem>> {
        const { collectionService } = DI;
        const storyIds = await collectionService.findAllStoriesForUser(ownerId, collectionId);

        const response = await this.client.search<IElasticItem>({
            index,
            body: {
                query: {
                    bool: {
                        must: [{ match: { content: { query: term, fuzziness: "AUTO" } } }, { terms: { storyId: storyIds } }],
                    },
                },
            },
        });
        return response;
    }
}
