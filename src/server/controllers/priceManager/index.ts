import * as uploadFile from "./uploadFile";
import * as updatePrices from "./updatePrices";

export const PriceManagerController = {
  ...uploadFile,
  ...updatePrices,
};
