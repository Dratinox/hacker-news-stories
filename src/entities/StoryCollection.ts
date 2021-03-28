import { Entity, Property, ManyToOne, ManyToMany, Collection } from "@mikro-orm/core";
import { BaseEntity } from "./BaseEntity";
import { User } from "./User";
import { Story } from "./Story";

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
