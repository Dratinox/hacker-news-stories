import { Migration } from '@mikro-orm/migrations';

export class Migration20210326215050 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table "story" drop constraint "story_collection_id_foreign";');
    this.addSql('alter table "story" drop column "collection_id";');

    this.addSql('create table "story_collection_stories" ("story_collection_id" int4 not null, "story_id" int4 not null);');
    this.addSql('alter table "story_collection_stories" add constraint "story_collection_stories_pkey" primary key ("story_collection_id", "story_id");');

    this.addSql('alter table "story_collection_stories" add constraint "story_collection_stories_story_collection_id_foreign" foreign key ("story_collection_id") references "story_collection" ("id") on update cascade on delete cascade;');
    this.addSql('alter table "story_collection_stories" add constraint "story_collection_stories_story_id_foreign" foreign key ("story_id") references "story" ("id") on update cascade on delete cascade;');
  }

}
