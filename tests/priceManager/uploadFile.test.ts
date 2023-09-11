import { StatusCodes } from "http-status-codes";
import { testServer } from "./../jest.setup";
import { Knex } from "../../src/server/database/knex";
import { ETableNames } from "../../src/server/database/eTableNames";

const prefix = "/price-manager/upload-file-csv?";

// Simula um arquivo
// prettier-ignore
const fileCSVFix = 
`
  code, price
  18, 2
`;
const fileBuffer = Buffer.from(fileCSVFix, "utf-8");

const fileCSVCreate = (fileDataString: string) => {
  return Buffer.from(fileDataString, "utf-8");
};

describe("PriceManager - uploadFile", () => {
  it("Query 'fileHasHeader' must be informed", async () => {
    const url = `${prefix}fileHasHeader=aaa&nameColumnCode=code&nameColumnNewPrice=price`;

    const res = await testServer
      .post(url)
      .attach("csv-file-products", fileBuffer, "arquivo.csv");

    expect(res.statusCode).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.body).toHaveProperty(
      "errors.default",
      `A requisição deve incluir uma query chamada 'queryFileHasHeader' com um valor associado.`
    );
  });
  it("Query 'nameColumnCode' must be informed", async () => {
    const url = `${prefix}fileHasHeader=true&nameColumnNewPrice=price`;

    const res = await testServer
      .post(url)
      .attach("csv-file-products", fileBuffer, "arquivo.csv");

    expect(res.statusCode).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.body).toHaveProperty(
      "errors.default",
      `A requisição deve incluir uma query chamada 'nameColumnCode' com um valor associado.`
    );
  });
  it("Query 'nameColumnNewPrice' must be informed", async () => {
    const url = `${prefix}fileHasHeader=true&nameColumnCode=price`;

    const res = await testServer
      .post(url)
      .attach("csv-file-products", fileBuffer, "arquivo.csv");

    expect(res.statusCode).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.body).toHaveProperty(
      "errors.default",
      `A requisição deve incluir uma query chamada 'nameColumnNewPrice' com um valor associado.`
    );
  });
  it("File not found", async () => {
    const url = `${prefix}fileHasHeader=true&nameColumnCode=code&nameColumnNewPrice=price`;

    const res = await testServer
      .post(url)
      .attach("csv-file-products", "", "arquivo.csv");

    expect(res.statusCode).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.body).toHaveProperty(
      "errors.default",
      `O Arquivo CSV não foi encontrado.`
    );
  });
  it("File format other than .csv", async () => {
    const url = `${prefix}fileHasHeader=true&nameColumnCode=code&nameColumnNewPrice=price`;

    const res = await testServer
      .post(url)
      .attach("csv-file-products", fileBuffer, "arquivo.text");

    expect(res.statusCode).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.body).toHaveProperty(
      "errors.default",
      `O arquivo não possui a extensão esperada '.csv'.`
    );
  });
  it("Empty file", async () => {
    const url = `${prefix}fileHasHeader=true&nameColumnCode=code&nameColumnNewPrice=price`;

    const fileCSVInvalid = fileCSVCreate(` `);

    const res = await testServer
      .post(url)
      .attach("csv-file-products", fileCSVInvalid, "arquivo.csv");

    expect(res.statusCode).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.body).toHaveProperty(
      "errors.default",
      `O arquivo CSV está vazio.`
    );
  });
  it("File header contains the columns reported in the query nameColumnCode and nameColumnNewPrice", async () => {
    const nameColumnCode = "code";
    const nameColumnNewPrice = "price";

    const url = `${prefix}fileHasHeader=true&nameColumnCode=${nameColumnCode}&nameColumnNewPrice=${nameColumnNewPrice}`;

    const fileCSVCodeInvalid = fileCSVCreate(`
      codeT, price
      18, 2
    `);

    const fileCSVPriceInvalid = fileCSVCreate(`
      code, priceT
        18, 2
    `);

    const res1 = await testServer
      .post(url)
      .attach("csv-file-products", fileCSVCodeInvalid, "arquivo.csv");
    expect(res1.statusCode).toEqual(StatusCodes.BAD_REQUEST);
    expect(res1.body).toHaveProperty(
      "errors.default",
      `Era esperado as colunas '${nameColumnCode}' e '${nameColumnNewPrice}' na primeira linha do seu arquivo.`
    );

    const res2 = await testServer
      .post(url)
      .attach("csv-file-products", fileCSVPriceInvalid, "arquivo.csv");
    expect(res2.statusCode).toEqual(StatusCodes.BAD_REQUEST);
    expect(res2.body).toHaveProperty(
      "errors.default",
      `Era esperado as colunas '${nameColumnCode}' e '${nameColumnNewPrice}' na primeira linha do seu arquivo.`
    );
  });
  it("Number of columns different from the total in the header", async () => {
    const url = `${prefix}fileHasHeader=true&nameColumnCode=code&nameColumnNewPrice=price`;

    const fileCSVInvalid = fileCSVCreate(`
      code, price
      18, 2
      18, 2, columnAdicional
    `);

    const res = await testServer
      .post(url)
      .attach("csv-file-products", fileCSVInvalid, "arquivo.csv");
    expect(res.statusCode).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.body).toHaveProperty("errors.default");
  });
  it("'product_code' or 'new_price' different from number", async () => {
    const url = `${prefix}fileHasHeader=true&nameColumnCode=code&nameColumnNewPrice=price`;

    const fileCSVCodeInvalid = fileCSVCreate(`
      code, price
      a, 2
    `);
    const fileCSVPriceInvalid = fileCSVCreate(`
      code, price
      18, a
    `);

    const res1 = await testServer
      .post(url)
      .attach("csv-file-products", fileCSVCodeInvalid, "arquivo.csv");
    expect(res1.statusCode).toEqual(StatusCodes.BAD_REQUEST);
    expect(res1.body).toHaveProperty("errors.default");

    const res2 = await testServer
      .post(url)
      .attach("csv-file-products", fileCSVPriceInvalid, "arquivo.csv");
    expect(res2.statusCode).toEqual(StatusCodes.BAD_REQUEST);
    expect(res2.body).toHaveProperty("errors.default");
  });
  it("'product_code' or 'new_price' different from number", async () => {
    const url = `${prefix}fileHasHeader=true&nameColumnCode=code&nameColumnNewPrice=price`;

    const fileCSVCodeInvalid = fileCSVCreate(`
      code, price
      a, 2
    `);
    const fileCSVPriceInvalid = fileCSVCreate(`
      code, price
      18, a
    `);

    const res1 = await testServer
      .post(url)
      .attach("csv-file-products", fileCSVCodeInvalid, "arquivo.csv");
    expect(res1.statusCode).toEqual(StatusCodes.BAD_REQUEST);
    expect(res1.body).toHaveProperty("errors.default");

    const res2 = await testServer
      .post(url)
      .attach("csv-file-products", fileCSVPriceInvalid, "arquivo.csv");
    expect(res2.statusCode).toEqual(StatusCodes.BAD_REQUEST);
    expect(res2.body).toHaveProperty("errors.default");
  });
  it("Product does not exist in the base(rule6)", async () => {
    const url = `${prefix}fileHasHeader=true&nameColumnCode=code&nameColumnNewPrice=price`;

    const fileCSV = fileCSVCreate(`
      code, price
      999, 2
    `);

    const res = await testServer
      .post(url)
      .attach("csv-file-products", fileCSV, "arquivo.csv");
    expect(res.statusCode).toEqual(StatusCodes.OK);

    expect(res.body[0]).toEqual({
      code: 999,
      msgError:
        "O código de produto fornecido não corresponde a nenhum registro existente.",
    });
  });
  it("Product is a package, but it already broke a rule", async () => {
    const url = `${prefix}fileHasHeader=true&nameColumnCode=code&nameColumnNewPrice=price`;
    const newProducts1 = [
      {
        code: 1,
        name: "Produto pack 1",
        cost_price: 1,
        sales_price: 2,
      },
      {
        code: 2,
        name: "Produto component 1",
        cost_price: 1,
        sales_price: 2,
      },
    ];
    const newPack1 = {
      pack_id: 1,
      product_id: 2,
      qty: 1,
    };
    await Knex.insert(newProducts1).table(ETableNames.products);
    await Knex.insert(newPack1).table(ETableNames.packs);

    const fileCSV = fileCSVCreate(`
      code, price
      1, 2
      2, 2
    `);

    const res = await testServer
      .post(url)
      .attach("csv-file-products", fileCSV, "arquivo.csv");
    expect(res.statusCode).toEqual(StatusCodes.OK);

    expect(res.body[0]).toEqual({
      code: 999,
      msgError:
        "O código de produto fornecido não corresponde a nenhum registro existente.",
    });
  });
});
