import { IProductValidation } from "../../../controllers/priceManager/uploadFile";
import { ETableNames } from "../../eTableNames";
import { Knex } from "../../knex";

export const getProductsInCodes = async (
  codes: number[]
): Promise<Omit<IProductValidation, "new_sales_price">[] | Error> => {
  try {
    const products = await Knex.select(["*", Knex.raw("null as msgError")])
      .table(ETableNames.products)
      .leftJoin(
        ETableNames.packs,
        `${ETableNames.products}.code`,
        `${ETableNames.packs}.pack_id`
      )
      .whereIn("code", codes);
    return products as any;
  } catch (error) {
    console.error(error);
    return new Error("Erro ao consultar os registros");
  }
};
