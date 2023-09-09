import { IProductValidation } from "../../../controllers/priceManager/uploadFile";
import { ETableNames } from "../../eTableNames";
import { Knex } from "../../knex";

export const updatePrices = async (
  dataProducts: IProductValidation[]
): Promise<void | Error> => {
  const transaction = await Knex.transaction(); // Inicia uma transação
};
