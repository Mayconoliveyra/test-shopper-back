import { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";

export const uploadFileValidation: RequestHandler = async (req, res, next) => {
  // Tamanho máximo permitido por padrão é 5MB, mas cada chamada pode ter sua limitação.
  // Ex: logo e capa = 2MB.

  return next();
};

export const uploadFile: RequestHandler = async (req, res) => {
  console.log("chamou");

  return res.status(StatusCodes.NO_CONTENT).send();
};
