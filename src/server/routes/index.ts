import { Router } from "express";
import { StatusCodes } from "http-status-codes";
import multer from "multer";

import { PriceManagerController } from "../controllers/priceManager";

const router = Router();

const storage = multer.memoryStorage();
const uploadFile = multer({
  storage: storage,
});

router.get("/test", (req, res) => {
  console.log("Testado com sucesso!");

  return res.status(StatusCodes.OK).json("Testado com sucesso!");
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
