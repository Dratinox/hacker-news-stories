import { Migration } from '@mikro-orm/migrations';

export class Migration20210324195615 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table "story" drop constraint if exists "story_title_check";');
    this.addSql('alter table "story" alter column "title" type varchar(255) using ("title"::varchar(255));');
    this.addSql('alter table "story" alter column "title" drop not null;');
    this.addSql('alter table "story" drop constraint if exists "story_author_check";');
    this.addSql('alter table "story" alter column "author" type varchar(255) using ("author"::varchar(255));');
    this.addSql('alter table "story" alter column "author" drop not null;');
    this.addSql('alter table "story" drop constraint if exists "story_time_check";');
    this.addSql('alter table "story" alter column "time" type timestamptz(0) using ("time"::timestamptz(0));');
    this.addSql('alter table "story" alter column "time" drop not null;');
    this.addSql('alter table "story" drop constraint if exists "story_url_check";');
    this.addSql('alter table "story" alter column "url" type varchar(255) using ("url"::varchar(255));');
    this.addSql('alter table "story" alter column "url" drop not null;');
  }

}
