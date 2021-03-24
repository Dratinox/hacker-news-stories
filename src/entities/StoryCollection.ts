import { Entity, Property, ManyToOne, OneToMany, LoadStrategy } from "@mikro-orm/core";
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

    @OneToMany(() => Story, (story) => story.collection)
    stories: Story[];
}
