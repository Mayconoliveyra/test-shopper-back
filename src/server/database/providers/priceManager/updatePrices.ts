import { IProductValidation } from "../../../controllers/priceManager/validatorsRules";
import { ETableNames } from "../../eTableNames";
import { Knex } from "../../knex";

export const updatePrices = async (
  dataProducts: IProductValidation[]
): Promise<void | Error> => {
  const transaction = await Knex.transaction();

  try {
    for (const product of dataProducts) {
      // Se o produto tiver com regra quebrada não permite atualizar.
      // Isso é improvável que aconteça, pois ja foi validado anteriormente.
      if ("msgError" in product) {
        await transaction.rollback();
        return new Error("Erro ao atualizar os registros");
      }
      // Se o item for pacote, atualiza o preço de custo.
      else if ("new_cost_price_pack" in product) {
        await transaction(ETableNames.products)
          .where({ code: product.code })
          .update({
            sales_price: product.new_sales_price,
            cost_price: product.new_cost_price_pack,
          });
      } else {
        await transaction(ETableNames.products)
          .where({ code: product.code })
          .update({ sales_price: product.new_sales_price });
      }
    }
    await transaction.commit(); // Confirma a transação
    return;
  } catch (error) {
    await transaction.rollback();

    console.error(error);
    return new Error("Erro ao atualizar os registros.");
  }
};
