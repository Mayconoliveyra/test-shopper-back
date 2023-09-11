import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { PriceManagerProvider } from "../../database/providers/priceManager";
import { IProductValidation } from "./validatorsRules";

interface IBodyProps {
  dataProducts: IProductValidation[];
}

export const updatePricesValidation = async (
  req: Request<{}, {}, IBodyProps>,
  res: Response,
  next: NextFunction
) => {
  const dataProducts = req.body.dataProducts;

  // Faz uma validação básica, só para garantir que ta recebendo um array valido.
  if (dataProducts && dataProducts.length > 0) {
    for (const product of dataProducts) {
      //  Não pode ter itens com erro
      if ("msgError" in product) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          errors: {
            default: "Não pode existir produto com regra quebrada.",
          },
        });
      }
      // 'code' e 'new_sales_price' deve ser numérico
      else if (
        typeof product.code !== "number" ||
        typeof product.new_sales_price !== "number"
      ) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          errors: {
            default: "'code' é 'new_sales_price' deve ser numérico",
          },
        });
      }
      // Se o produto é pacote  'new_cost_price_pack' deve ta preenchido com valor numérico
      else if ("new_cost_price_pack" in product) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          errors: {
            default: "'new_cost_price_pack' deve ser numérico",
          },
        });
      }
    }
  } else {
    return res.status(StatusCodes.BAD_REQUEST).json({
      errors: {
        default: "Deve ser informando o array de produtos.",
      },
    });
  }

  return next();
};

export const updatePrices = async (
  req: Request<{}, {}, IBodyProps>,
  res: Response
) => {
  const dataProducts = req.body.dataProducts;
  await PriceManagerProvider.updatePrices(dataProducts);

  return res.status(StatusCodes.NO_CONTENT).send();
};
