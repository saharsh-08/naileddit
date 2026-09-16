import { Migration } from '@mikro-orm/migrations';

export class Migration20260915164119 extends Migration {

  override up(): void | Promise<void> {
    this.addSql(`create table "users" ("id" serial primary key, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "username" text not null, "password" text not null);`);
    this.addSql(`alter table "users" add constraint "users_username_unique" unique ("username");`);
  }

  override down(): void | Promise<void> {
    this.addSql(`drop table if exists "users" cascade;`);
  }

}
