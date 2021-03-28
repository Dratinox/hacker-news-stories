import { Migration } from '@mikro-orm/migrations';

export class Migration20210324195354 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table "story_collection" drop column "title";');
  }

}
