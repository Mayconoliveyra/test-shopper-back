import { Router } from "express";
import { StatusCodes } from "http-status-codes";

const router = Router();

router.get("/test", (req, res) => {
  console.log("Testado com sucesso!");

  return res.status(StatusCodes.OK).json("Testado com sucesso!");
});

export { router };
