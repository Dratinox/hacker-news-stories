import { Entity, Property, OneToMany } from "@mikro-orm/core";
import { BaseEntity, StoryCollection } from ".";

@Entity()
export class User extends BaseEntity {
    @Property()
    username: string;

    @Property({ hidden: true })
    password: string;

    @OneToMany(() => StoryCollection, (collection) => collection.user)
    collections: StoryCollection[];
}
