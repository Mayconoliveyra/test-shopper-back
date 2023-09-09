import * as getProductsInCodes from "./getProductsInCodes";
import * as getProductPack from "./getProductPack";
import * as updatePrices from "./updatePrices";
import * as getProductPackComponent from "./getProductPackComponent";

export const PriceManagerProvider = {
  ...getProductsInCodes,
  ...getProductPack,
  ...updatePrices,
  ...getProductPackComponent,
};
