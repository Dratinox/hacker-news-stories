import { Entity, Property, ManyToOne, OneToMany } from "@mikro-orm/core";
import { BaseEntity } from "./BaseEntity";
import { StoryCollection } from "./StoryCollection";
import { StoryComment } from "./StoryComment";

@Entity()
export class Story extends BaseEntity {
    @Property({ nullable: true })
    title: string;

    @Property({ nullable: true })
    author: string;

    @Property({ nullable: true })
    time: Date;

    @Property({ nullable: true })
    url: string;

    @Property({ nullable: true })
    descendants: number;

    @ManyToOne(() => StoryCollection)
    collection: StoryCollection;

    @OneToMany(() => StoryComment, (comment) => comment.story)
    comments: StoryComment[];
}
