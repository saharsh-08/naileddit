import { Migration } from '@mikro-orm/migrations';

export class Migration20260725132614 extends Migration {

  override up(): void | Promise<void> {
    this.addSql(`create table "post" ("id" serial primary key, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "title" text not null);`);
  }

  override down(): void | Promise<void> {
    this.addSql(`drop table if exists "post" cascade;`);
  }

}
