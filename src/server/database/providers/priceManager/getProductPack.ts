import { ETableNames } from "../../eTableNames";
import { Knex } from "../../knex";
import { IPack } from "../../models/pack";

export const getProductPack = async (
  productCode: number
): Promise<IPack[] | Error> => {
  try {
    const productsPack = await Knex.select("*")
      .table(ETableNames.packs)
      .where("pack_id", "=", productCode);
    return productsPack;
  } catch (error) {
    console.error(error);
    return new Error("Erro ao consultar os registros");
  }
};
