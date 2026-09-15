import { EntityManager, Connection, IDatabaseDriver } from "@mikro-orm/core";

export interface MyContext {
  em: EntityManager<IDatabaseDriver<Connection>>;
}
