import { Router } from "express";
import { StatusCodes } from "http-status-codes";

import { PriceManagerController } from "../controllers/priceManager";

const router = Router();

router.get("/test", (req, res) => {
  console.log("Testado com sucesso!");

  return res.status(StatusCodes.OK).json("Testado com sucesso!");
});

router.post(
  `/upload-file-csv`,
  PriceManagerController.uploadFileValidation,
  PriceManagerController.uploadFile
);

export { router };
