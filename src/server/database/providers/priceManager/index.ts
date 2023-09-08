import { ETableNames } from "../../eTableNames";
import { Knex } from "../../knex";
import { IProduct } from "../../models/product";

export const getProductsInCodes = async (
  codes: number[]
): Promise<IProduct[] | Error> => {
  try {
    const products = await Knex(ETableNames.products).whereIn("code", codes);

    return products;
  } catch (error) {
    console.error(error);
    return new Error("Erro ao consultar registros");
  }
};
