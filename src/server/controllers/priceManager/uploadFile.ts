import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";

type IRowExtract = {
  code: number;
  sales_price: number;
};
type IRowError = {
  msgError: string;
  line?: string;
};

interface IBodyProps {
  fileData: IRowExtract[];
}
interface IQueryProps {
  fileHasHeader?: string;
  nameColumnCode?: string;
  nameColumnNewPrice?: string;
}

const rules = (
  rule:
    | "rule1"
    | "rule2"
    | "rule3"
    | "rule4"
    | "rule5"
    | "rule6"
    | "rule7"
    | "rule8",
  column1?: string,
  column2?: string
) => {
  // prettier-ignore
  const rules = {
    rule1: "O arquivo deve conter o código do produto e o novo preço que será carregado.",
    rule2: "O preço de venda não pode ser inferior ao preço de custo.",
    rule3: "O ajuste de preço não pode exceder 10% a mais nem 10% a menos do preço atual do produto.",
    rule4: "Ao atualizar o preço de um pacote, é necessário incluir os ajustes nos preços dos componentes do pacote, de modo que a soma dos preços dos componentes corresponda ao preço do pacote.",
    rule5: "Cada registro deve incluir as colunas 'código do produto' e 'novo preço de venda'.",
    rule6: "O código de produto fornecido não corresponde a nenhum registro existente.",
    rule7: `Aguardava-se um valor numérico para '${column1}', porém foi recebido: '${column2}'`,
    rule8: "O número de colunas não está alinhado com os demais registros.",
  };

  return rules[rule];
};

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
        msgError: rules("rule8"),
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
          const columnName = iHeader === indexCode ? "code" : "sales_price";
          const valueNumber = Number(currentLine[iHeader]) || "";

          if (typeof valueNumber === "number") {
            row[columnName] = valueNumber;
          } else {
            const error = {
              msgError: rules(
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

  // Se o arquivo foi extraído sem erros iniciais de validação, prosseguirei com o processo de atualização dos preços.
  req.body.fileData = rows;

  return next();
};

export const uploadFile = async (
  req: Request<{}, IBodyProps>,
  res: Response
) => {
  /*  console.log(req.query);
  console.log(req.body.fileData); */

  return res.status(StatusCodes.NO_CONTENT).send();
};
