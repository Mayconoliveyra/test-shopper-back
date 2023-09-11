import { Knex } from "knex";

import { ETableNames } from "../eTableNames";

export async function up(knex: Knex) {
  return knex.schema
    .createTable(ETableNames.packs, (table) => {
      table.bigIncrements("id").primary().comment("id primário da tabela");
      table
        .bigint("pack_id")
        .notNullable()
        .references("code")
        .inTable(ETableNames.products)
        .comment("id do produto pack");
      table
        .bigint("product_id")
        .notNullable()
        .references("code")
        .inTable(ETableNames.products)
        .comment("id do produto componente");
      table
        .bigint("qty")
        .notNullable()
        .comment("quantidade do produto componente no pack");

      table.comment("Tabela usada para armazenar os pacotes");
    })
    .then(() => {
      console.log(`# Criado tabela ${ETableNames.packs}`);
    });
}

export async function down(knex: Knex) {
  return knex.schema.dropTable(ETableNames.packs).then(() => {
    console.log(`# Excluído table ${ETableNames.packs}`);
  });
}
