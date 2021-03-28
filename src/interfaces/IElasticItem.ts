export interface IElasticItem {
    title?: string;
    author: string;
    time: number;
    storyId: string;
    url?: string;
    content?: string;
    relation_type: {
        name: string;
        parent?: string;
    };
}
