import pg from "pg";
import { TEST_DATABASE_URL } from "./env";

/** Recria a base de dados de teste do zero antes da suite. */
export default async function setup() {
  const url = new URL(TEST_DATABASE_URL);
  const database = url.pathname.slice(1);
  if (!/^[a-z0-9_]+_test$/.test(database)) {
    throw new Error(`Recuso-me a apagar "${database}": o nome da base de dados de teste deve terminar em _test.`);
  }
  url.pathname = "/postgres";
  const client = new pg.Client({ connectionString: url.toString() });
  await client.connect();
  await client.query(`DROP DATABASE IF EXISTS ${database} WITH (FORCE)`);
  await client.query(`CREATE DATABASE ${database}`);
  await client.end();
}
