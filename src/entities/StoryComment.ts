import { Entity, Property, ManyToOne } from "@mikro-orm/core";
import { Story } from "./Story";
import { BaseEntity } from "./BaseEntity";

@Entity()
export class StoryComment extends BaseEntity {
    @Property()
    text: string;

    @Property()
    author: string;

    @Property()
    time: Date;

    @Property()
    commentStoryId: number;

    @Property({ nullable: true })
    parentId: number;

    @ManyToOne(() => Story)
    story: Story;
}
