import { Entity, Property, ManyToOne, ManyToMany, Collection } from "@mikro-orm/core";
import { BaseEntity, Story, User } from "."

@Entity()
export class StoryCollection extends BaseEntity {
    @Property()
    name: string;

    @Property({ hidden: true })
    ownerId: number;

    @ManyToOne(() => User)
    user: User;

    @ManyToMany(() => Story, (story) => story.collections, { owner: true })
    stories = new Collection<Story>(this);
}
