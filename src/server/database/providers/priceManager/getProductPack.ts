import { ETableNames } from "../../eTableNames";
import { Knex } from "../../knex";
import { IPack } from "../../models/pack";

export const getProductPack = async (
  productCode: number
): Promise<IPack[] | Error> => {
  try {
    // Se o produto for um pack, vai ser retornado um array de objeto, nele te coluna 'product_id', que referente a o code do  produto componente
    // Se o item tiver 2 componente, sera retornado um array com 2 posições...
    const productsPack = await Knex.select("*")
      .table(ETableNames.packs)
      .where("pack_id", "=", productCode);
    return productsPack;
  } catch (error) {
    console.error(error);
    return new Error("Erro ao consultar os registros");
  }
};
