import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";

import { PriceManagerProvider } from "../../database/providers/priceManager";

import {
  brokenRule,
  validateExistenceProducts,
  validateNewPrice,
  validateProductIsComponent,
  validateProductIsPack,
} from "./validatorsRules";

export interface IRowExtract {
  code: number;
  new_sales_price: number;
}
interface IRowError {
  msgError: string;
  line?: string;
}
interface IBodyProps {
  fileData: IRowExtract[];
}
interface IQueryProps {
  fileHasHeader?: string;
  nameColumnCode?: string;
  nameColumnNewPrice?: string;
}

export const uploadFileValidation = async (
  req: Request<{}, {}, {}, IQueryProps>,
  res: Response,
  next: NextFunction
) => {
  const queryFileHasHeader = req.query.fileHasHeader;
  const queryNameCode = req.query.nameColumnCode;
  const queryNamePrice = req.query.nameColumnNewPrice;

  // Valida se a requisição inclui a query 'fileHasHeader'.
  if (!(queryFileHasHeader === "true" || queryFileHasHeader === "false")) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      errors: {
        default:
          "A requisição deve incluir uma query chamada 'queryFileHasHeader' com um valor associado.",
      },
    });
  }
  // Valida se a requisição inclui a query 'nameColumnCode'.
  else if (queryNameCode === undefined || queryNameCode === null) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      errors: {
        default:
          "A requisição deve incluir uma query chamada 'nameColumnCode' com um valor associado.",
      },
    });
  }
  // Valida se a requisição inclui a query 'nameColumnNewPrice'.
  else if (queryNamePrice === undefined || queryNamePrice === null) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      errors: {
        default:
          "A requisição deve incluir uma query chamada 'nameColumnNewPrice' com um valor associado.",
      },
    });
  }
  // Valida se tem um file no req
  else if (!req.file) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      errors: { default: "O Arquivo CSV não foi encontrado." },
    });
  }
  // Valida se o file tem um buffer
  else if (!req.file.buffer) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      errors: { default: "O Arquivo CSV não foi encontrado." },
    });
  }
  // Valida se a extensão do arquivo é 'csv'
  else if (!req.file.mimetype.startsWith("text/csv")) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      errors: { default: "O arquivo não possui a extensão esperada '.csv'." },
    });
  }

  return next();
};

export const extractCSVDataFromBuffer = async (
  req: Request<{}, {}, IBodyProps, IQueryProps>,
  res: Response,
  next: NextFunction
) => {
  const fileHasHeader = req.query.fileHasHeader === "true" ? true : false; // Já foi validado anteriormente 'uploadFileValidation'.
  const queryNameCode = req.query.nameColumnCode as string; // Já foi validado anteriormente 'uploadFileValidation'.
  const queryNamePrice = req.query.nameColumnNewPrice as string; // Já foi validado anteriormente 'uploadFileValidation'.
  const fileBufferCSV = req.file?.buffer as Buffer; // Já foi validado anteriormente 'uploadFileValidation'.

  const rows: IRowExtract[] = [];
  const rowsErrors: IRowError[] = [];

  const lines = fileBufferCSV
    .toString()
    .trim()
    .split("\n")
    .map((line) => line.trim()) // Remove os espaços em branco extras no início e no final de cada linha.
    .filter((line) => line !== ""); // Filtra linhas vazias

  // Se o arquivo estiver vazio retorno erro.
  if (!(lines.length > 0)) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      errors: { default: "O arquivo CSV está vazio." },
    });
  }

  // Vou pegar a primeira linha do arquivo, ela é o 'header' do arquivo, mesmo que 'fileHasHeader=false'...
  // ela contem as colunas com o mesmo nome que veio nas query 'queryNameCode' e 'queryNamePrice'.
  const headers = lines[0].split(",").map((line) => line.trim());

  // Vou seleciona em qual index está 'Código do produto' e 'Novo preço de venda'.
  // Isso é essencial, uma vez que o arquivo do cliente pode conter outras colunas, porém, eu vou apenas extrair as duas colunas necessárias.
  const indexCode = headers.indexOf(queryNameCode);
  const indexNewPrice = headers.indexOf(queryNamePrice);

  // Verifica se as colunas foram encontradas no header do arquivo.
  if (indexCode === -1 || indexNewPrice === -1) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      errors: {
        default: `Era esperado as colunas '${queryNameCode}' e '${queryNamePrice}' na primeira linha do seu arquivo.`,
      },
    });
  }

  // Vou percorrer todas as linhas do arquivo, exceto a primeira, se 'fileHasHeader' for true.
  // fileHasHeader =true, significa que o usuario deixou a check 'Meu arquivo possui cabeçalhos' selecionada.
  for (let iLinha = fileHasHeader ? 1 : 0; iLinha < lines.length; iLinha++) {
    const currentLine = lines[iLinha].split(",").map((line) => line.trim());
    const row: IRowExtract = {} as IRowExtract;

    // Se a quantidade de colunas da linha for diferente do cabeçalho retorna error.
    // Pela lógica todas as linhas devem ter a mesma quantidades de colunas.
    if (currentLine.length !== headers.length) {
      const error = {
        msgError: brokenRule("rule8"),
        line: lines[iLinha],
      };
      rowsErrors.push(error);
      continue;
    } else {
      // Vou percorrer cada uma das colunas da linhas
      for (let iHeader = 0; iHeader < headers.length; iHeader++) {
        // So vou pegar as colunas referente ao 'indexCode' e 'indexNewPrice'
        // Se o arquivo tiver outras colunas, será ignoradas.
        if (iHeader === indexCode || iHeader === indexNewPrice) {
          const columnName = iHeader === indexCode ? "code" : "new_sales_price";
          const valueNumber = Number(currentLine[iHeader]) || "";

          if (typeof valueNumber === "number") {
            row[columnName] = valueNumber;
          } else {
            const error = {
              msgError: brokenRule(
                "rule7",
                iHeader === indexCode ? queryNameCode : queryNamePrice,
                currentLine[iHeader]
              ),
              line: lines[iLinha],
            };
            rowsErrors.push(error);
          }
        }
      }
    }

    row && rows.push(row);
  }

  // Se o arquivo apresentar erros básicos, como, por exemplo, quando 'Novo preço de venda' ou 'Código do produto' é fornecido como uma string em vez de um número...
  // Todas as validações básicas, que podem ser realizadas apenas com base no arquivo, serão retornadas em uma única string, onde será listado todos erros
  const errorString = rowsErrors.reduce((accumulator, currentError) => {
    return (
      accumulator +
      `Erro: ${currentError.msgError}
      Linha: ${currentError.line}\n
      `
    );
  }, "");
  if (errorString) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      errors: { default: errorString },
    });
  }

  // Se o arquivo foi extraído sem erros iniciais de validação, prosseguirei com o processo de validação das regras.
  req.body.fileData = rows;

  return next();
};

export const uploadFile = async (
  req: Request<{}, {}, IBodyProps>,
  res: Response
) => {
  const fileData = req.body.fileData;

  // Cria um novo array, contendo apenas os 'code' dos produtos que serão atualizados.
  const codesToFind = fileData.map((item) => item.code);
  // Consulto na base todos os produtos que serão atualizados, passando o array de 'codes' gerado anteriormente.
  // Vai ser retornando apenas os registros que existem na base.
  // prettier-ignore
  const resultProductsInDB = await PriceManagerProvider.getProductsInCodes(codesToFind);
  if (resultProductsInDB instanceof Error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      errors: {
        default: resultProductsInDB.message,
      },
    });
  }

  // prettier-ignore
  const resultValidateProductInDB = validateExistenceProducts(fileData, resultProductsInDB);

  // prettier-ignore
  const resultValidateProductIsPack = await validateProductIsPack(resultValidateProductInDB);

  // prettier-ignore
  const resultValidateProductIsComponent = await validateProductIsComponent(resultValidateProductIsPack);

  // prettier-ignore
  const resultValidateNewPrice = await validateNewPrice(resultValidateProductIsComponent);

  return res.status(StatusCodes.OK).json(resultValidateNewPrice);
};
