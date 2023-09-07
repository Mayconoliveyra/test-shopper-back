import express from "express";

import "dotenv/config";
import { StatusCodes } from "http-status-codes";

const server = express();

server.use(express.json());

server.get("/test", (req, res) => {
  console.log("Testado com sucesso!");

  return res.status(StatusCodes.OK).send("Testado com sucesso!");
});

export { server };
