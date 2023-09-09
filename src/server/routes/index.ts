import { Router } from "express";
import multer from "multer";

import { PriceManagerController } from "../controllers/priceManager";

const router = Router();

const storage = multer.memoryStorage();
const uploadFile = multer({
  storage: storage,
});

router.post(
  `/price-manager/upload-file-csv`,
  uploadFile.single("csv-file-products"),
  PriceManagerController.uploadFileValidation,
  PriceManagerController.extractCSVDataFromBuffer,
  PriceManagerController.uploadFile
);

router.put(
  `/price-manager/update-prices`,
  PriceManagerController.updatePricesValidation,
  PriceManagerController.updatePrices
);

export { router };
