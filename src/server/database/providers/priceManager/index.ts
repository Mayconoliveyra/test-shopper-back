import * as getProductsInCodes from "./getProductsInCodes";
import * as getProductPack from "./getProductPack";
import * as updatePrices from "./updatePrices";

export const PriceManagerProvider = {
  ...getProductsInCodes,
  ...getProductPack,
  ...updatePrices,
};
