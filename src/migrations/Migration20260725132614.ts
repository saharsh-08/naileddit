import { Migration } from '@mikro-orm/migrations';

export class Migration20260725132614 extends Migration {

  override up(): void | Promise<void> {
    this.addSql(`create table "post" ("id" serial primary key, "created_at" varchar(255) not null default 'Sat Jul 25 2026', "updated_at" varchar(255) not null, "title" text not null);`);
  }

  override down(): void | Promise<void> {
    this.addSql(`drop table if exists "post" cascade;`);
  }

}
