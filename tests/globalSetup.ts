import { ETableNames } from "../src/server/database/eTableNames";
import { Knex } from "../src/server/database/knex";

export default async () => {
  // Verificando se ta conectada na base de teste.
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [databaseName]: any = await Knex.select(
      Knex.raw("DATABASE() as databaseName")
    );
    if (
      !databaseName ||
      !databaseName.databaseName ||
      databaseName.databaseName !== "test-shopper"
    ) {
      console.error("  ");
      console.error("!!!!!!!!!!!!!   ATENÇÃO   !!!!!!!!!!!!!");
      console.error(
        'Para realizar os testes, é necessário possuir uma base de dados vazia com o nome "test-shopper".'
      );
      console.error("Certifique-se de que a base de dados já foi criada.");
      console.error("BASE CONFIGURADA: " + JSON.stringify(databaseName));
      process.exit();
    }
  } catch (error) {
    console.error("  ");
    console.error("!!!!!!!!!!!!!   ATENÇÃO   !!!!!!!!!!!!!");
    console.error(
      'Para realizar os testes, é necessário possuir uma base de dados vazia com o nome "test-shopper".'
    );
    console.error("Certifique-se de que a base de dados já foi criada.");
    console.error(error);
    process.exit();
  }

  console.error(" ");
  // Limpando nase
  const tables = [
    ETableNames.packs,
    ETableNames.products,
    "knex_migrations",
    "knex_migrations_lock",
  ];

  for (const table of tables) {
    await Knex.raw(`DROP TABLE IF EXISTS ${table}`);
    console.error(`- Excluído tabela ${table}`);
  }

  // Recriando base
  await Knex.migrate.latest();

  await Knex.destroy();
};
