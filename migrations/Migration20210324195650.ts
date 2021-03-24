import { Migration } from '@mikro-orm/migrations';

export class Migration20210324195650 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table "story" drop constraint if exists "story_descendants_check";');
    this.addSql('alter table "story" alter column "descendants" type int4 using ("descendants"::int4);');
    this.addSql('alter table "story" alter column "descendants" drop not null;');
  }

}
