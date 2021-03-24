import { Entity, Property, OneToMany } from "@mikro-orm/core";
import { BaseEntity } from "./BaseEntity";
import { StoryCollection } from "./StoryCollection";

@Entity()
export class User extends BaseEntity {
    @Property()
    username: string;

    @Property({ hidden: true })
    password: string;

    @OneToMany(() => StoryCollection, (collection) => collection.user)
    collections: StoryCollection[];
}
