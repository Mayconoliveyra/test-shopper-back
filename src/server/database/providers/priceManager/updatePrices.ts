import { IProductValidation } from "../../../controllers/priceManager/uploadFile";
import { ETableNames } from "../../eTableNames";
import { Knex } from "../../knex";

export const updatePrices = async (
  dataProducts: IProductValidation[]
): Promise<void | Error> => {
  const transaction = await Knex.transaction();

  try {
    for (const produto of dataProducts) {
      if (produto.new_cost_price >= 0) {
        await transaction(ETableNames.products)
          .where({ code: produto.code })
          .update({
            sales_price: produto.new_sales_price,
            cost_price: produto.new_cost_price,
          });
      } else {
        await transaction(ETableNames.products)
          .where({ code: produto.code })
          .update({ sales_price: produto.new_sales_price });
      }
    }
    await transaction.commit(); // Confirma a transação
  } catch (error) {
    await transaction.rollback();

    console.error(error);
    return new Error("Erro ao atualizar os registros.");
  }
};
