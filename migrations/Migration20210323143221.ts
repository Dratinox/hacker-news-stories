import { Migration } from '@mikro-orm/migrations';

export class Migration20210323143221 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table "user" ("id" serial primary key, "created_at" timestamptz(0) not null, "updated_at" timestamptz(0) not null, "username" varchar(255) not null, "password" varchar(255) not null);');

    this.addSql('create table "story_collection" ("id" serial primary key, "created_at" timestamptz(0) not null, "updated_at" timestamptz(0) not null, "title" varchar(255) not null, "name" varchar(255) not null, "owner_id" int4 not null, "user_id" int4 not null);');

    this.addSql('create table "story" ("id" serial primary key, "created_at" timestamptz(0) not null, "updated_at" timestamptz(0) not null, "title" varchar(255) not null, "author" varchar(255) not null, "time" timestamptz(0) not null, "url" varchar(255) not null, "descendants" int4 not null, "collection_id" int4 not null);');

    this.addSql('create table "story_comment" ("id" serial primary key, "created_at" timestamptz(0) not null, "updated_at" timestamptz(0) not null, "text" varchar(255) not null, "author" varchar(255) not null, "time" timestamptz(0) not null, "comment_story_id" int4 not null, "parent_id" int4 null, "story_id" int4 not null);');

    this.addSql('alter table "story_collection" add constraint "story_collection_user_id_foreign" foreign key ("user_id") references "user" ("id") on update cascade;');

    this.addSql('alter table "story" add constraint "story_collection_id_foreign" foreign key ("collection_id") references "story_collection" ("id") on update cascade;');

    this.addSql('alter table "story_comment" add constraint "story_comment_story_id_foreign" foreign key ("story_id") references "story" ("id") on update cascade;');
  }

}
