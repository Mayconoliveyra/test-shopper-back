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

  if (!(dataProducts.length > 0)) {
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
