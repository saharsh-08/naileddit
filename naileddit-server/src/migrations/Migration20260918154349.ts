import { Migration } from '@mikro-orm/migrations';

export class Migration20260918154349 extends Migration {

  override up(): void | Promise<void> {
    this.addSql(`alter table "users" add "email" text not null;`);
    this.addSql(`alter table "users" add constraint "users_email_unique" unique ("email");`);
  }

  override down(): void | Promise<void> {
    this.addSql(`alter table "users" drop constraint "users_email_unique";`);
    this.addSql(`alter table "users" drop column "email";`);
  }

}
