import { Entity, Property, ManyToOne, OneToMany, Collection, ManyToMany } from "@mikro-orm/core";
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

    @ManyToMany(() => StoryCollection, (collection) => collection.stories)
    collections = new Collection<StoryCollection>(this);

    @OneToMany(() => StoryComment, (comment) => comment.story)
    comments: StoryComment[];
}
