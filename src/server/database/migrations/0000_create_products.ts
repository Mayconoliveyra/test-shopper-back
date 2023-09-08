import { Knex } from "knex";

import { ETableNames } from "../eTableNames";

export async function up(knex: Knex) {
  return knex.schema
    .createTable(ETableNames.products, (table) => {
      table.bigint("code").primary().comment("CODIGO DO PRODUTO");
      table.string("name", 100).notNullable().comment("NOME DO PRODUTO");
      table
        .decimal("cost_price", 9, 2)
        .notNullable()
        .comment("CUSTO DO PRODUTO");
      table
        .decimal("sales_price", 9, 2)
        .notNullable()
        .comment("PREÇO DE VENDA DO PRODUTO");

      table.comment("Tabela usada para armazenar os cadastro dos produtos.");
    })
    .then(() => {
      console.log(`# Criado tabela ${ETableNames.products}`);
    });
}

export async function down(knex: Knex) {
  return knex.schema.dropTable(ETableNames.products).then(() => {
    console.log(`# Excluído table ${ETableNames.products}`);
  });
}
