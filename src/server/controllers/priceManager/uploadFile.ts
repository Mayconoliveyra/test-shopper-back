import { RequestHandler, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
interface IRowDataFile {
  [key: string]: number | string | {};
}
interface IBodyProps {
  fileData: IRowDataFile;
}

export const uploadFileValidation: RequestHandler = async (req, res, next) => {
  if (!req.file) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      errors: { default: "O Arquivo CSV não foi encontrado." },
    });
  } else if (!req.file.buffer) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      errors: { default: "O Arquivo CSV não foi encontrado." },
    });
  } else if (!req.file.mimetype.startsWith("text/csv")) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      errors: { default: "O arquivo não possui a extensão esperada '.csv'." },
    });
  }

  return next();
};

export const extractCSVDataFromBuffer: RequestHandler = async (
  req,
  res,
  next
) => {
  const fileBufferCSV = req.file?.buffer as Buffer; // Já foi feita a validação no middleware 'uploadFileValidation'.
  const lines = fileBufferCSV
    .toString() // Converter o buff para texto
    .trim() // Remove espaços em branco extras no início e no final do arquivo.
    .split("\n") // Divide o arquivo em linhas
    .map((line) => line.trim()) // Remove os espaços em branco extras no início e no final de cada linha.
    .filter((line) => line !== ""); // Filtra linhas vazias

  // Se o arquivo tiver vazio retornar erro.
  if (lines.length > 0) {
    const headers = lines[0].split(",");
    const rows: IRowDataFile[] = [];

    // Percorrer todas as linhas para extrair seus valores.
    for (let l = 0; l < lines.length; l++) {
      const currentLine = lines[l].split(",");
      const row: IRowDataFile = {};

      // Verifico se a quantidade de colunas da linha é igual a do cabeçalho, se for diferente retornar erro.
      // Pela lógica todas as linhas, inclusive o cabeçalho, tem que ter a mesma quantidade de colunas.
      if (currentLine.length === headers.length) {
        // Aqui vou percorrer o cabeçalho e utilizar seus valores como chaves.
        for (let h = 0; h < headers.length; h++) {
          const valueNumber = Number(currentLine[h]) || "";
          if (typeof valueNumber === "number") {
            row[headers[h]] = valueNumber;
          } else {
            row.error = {
              msgError: `Aguardava-se um valor numérico para '${headers[h]}', porém foi recebido: '${currentLine[h]}'`,
              line: lines[l],
            };
          }
        }
      } else {
        row.error = {
          msgError:
            "O número de colunas não está alinhado com os demais registros.",
          line: lines[l],
        };
      }

      rows.push(row);
    }

    // Depois de transformar o arquivo CSV em um array de objetos...
    // Vou armazenar o array no req.body.fileData
    req.body.fileData = rows;

    return next();
  } else {
    return res.status(StatusCodes.BAD_REQUEST).json({
      errors: { default: "O arquivo CSV está vazio." },
    });
  }
};

export const uploadFile = async (
  req: Request<{}, IBodyProps>,
  res: Response
) => {
  console.log(req.body.fileData);

  return res.status(StatusCodes.NO_CONTENT).send();
};
