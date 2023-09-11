import { StatusCodes } from "http-status-codes";
import { testServer } from "./../jest.setup";
import { Knex } from "../../src/server/database/knex";
import { ETableNames } from "../../src/server/database/eTableNames";
import { brokenRule } from "../../src/server/controllers/priceManager/validatorsRules";

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
  // A consulta ‘fileHasHeader’ deve ser informada
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
  // A consulta ‘nameColumnCode’ deve ser informada
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
  // A consulta ‘nameColumnNewPrice’ deve ser informada
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
  // Arquivo não encontrado
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
  // Formato de arquivo diferente de .csv
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
  // Arquivo vazio
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
  // O cabeçalho do arquivo contém as colunas relatadas na consulta nameColumnCode e nameColumnNewPrice
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
  // Número de colunas diferente do total no cabeçalho
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
  // 'product_code' ou 'new_price' diferente do número
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
  // Produto não existe na base(regra 6)
  it("Product does not exist in the base", async () => {
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
      msgError: brokenRule("rule6"),
    });
  });
  // Produto é pacote, mas não foi fornecido o produto componente(regra 4)
  it("Product is a package, but the component product was not provided", async () => {
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
    `);

    const res = await testServer
      .post(url)
      .attach("csv-file-products", fileCSV, "arquivo.csv");
    expect(res.statusCode).toEqual(StatusCodes.OK);

    expect(res.body[0]).toEqual({
      code: newProducts1[0].code,
      msgError: brokenRule("rule4"),
    });
  });
  // Produto é pacote, soma dos componentes diferente do novo preço do pacote(rule4)
  it("Product is a package, sum of components different from the new package price", async () => {
    const url = `${prefix}fileHasHeader=true&nameColumnCode=code&nameColumnNewPrice=price`;
    const newProducts1 = [
      {
        code: 3,
        name: "Produto pack 2",
        cost_price: 2,
        sales_price: 4,
      },
      {
        code: 4,
        name: "Produto component 2",
        cost_price: 1,
        sales_price: 2,
      },
    ];
    const newPack1 = {
      pack_id: 3,
      product_id: 4,
      qty: 2,
    };
    await Knex.insert(newProducts1).table(ETableNames.products);
    await Knex.insert(newPack1).table(ETableNames.packs);

    const fileCSV = fileCSVCreate(`
      code, price
      3, 4
      4, 3
    `);

    const res = await testServer
      .post(url)
      .attach("csv-file-products", fileCSV, "arquivo.csv");
    expect(res.statusCode).toEqual(StatusCodes.OK);

    expect(res.body[0]).toEqual({
      code: newProducts1[0].code,
      msgError: brokenRule("rule4"),
    });
  });
  // Produto é componente, mas não foi informado o ajuste no pacote(rule11)
  it("Product is a component, but the adjustment was not stated in the package.", async () => {
    const url = `${prefix}fileHasHeader=true&nameColumnCode=code&nameColumnNewPrice=price`;
    const newProducts1 = [
      {
        code: 5,
        name: "Produto pack 2",
        cost_price: 2,
        sales_price: 4,
      },
      {
        code: 6,
        name: "Produto component 2",
        cost_price: 1,
        sales_price: 2,
      },
    ];
    const newPack1 = {
      pack_id: 5,
      product_id: 6,
      qty: 2,
    };
    await Knex.insert(newProducts1).table(ETableNames.products);
    await Knex.insert(newPack1).table(ETableNames.packs);

    const fileCSV = fileCSVCreate(`
      code, price
      6, 4
    `);

    const res = await testServer
      .post(url)
      .attach("csv-file-products", fileCSV, "arquivo.csv");
    expect(res.statusCode).toEqual(StatusCodes.OK);

    expect(res.body[0]).toEqual({
      code: newProducts1[1].code,
      msgError: brokenRule("rule11"),
    });
  });
  // Novo preço de venda do pacote menor que a soma dos componentes(rule2)
  it("New package sales price lower than the sum of the components.", async () => {
    const url = `${prefix}fileHasHeader=true&nameColumnCode=code&nameColumnNewPrice=price`;
    const newProducts1 = [
      {
        code: 7,
        name: "Produto pack",
        cost_price: 4,
        sales_price: 8,
      },
      {
        code: 8,
        name: "Produto component",
        cost_price: 2,
        sales_price: 4,
      },
    ];
    const newPack1 = {
      pack_id: 7,
      product_id: 8,
      qty: 2,
    };

    await Knex.insert(newProducts1).table(ETableNames.products);
    await Knex.insert(newPack1).table(ETableNames.packs);

    const fileCSV = fileCSVCreate(`
      code, price
      7, 2
      8, 1
    `);
    // O preço de custo do componente é 2.0 (newProducts1[1].cost_price)
    // O produto pacote utiliza  2 unidades, logo, o preço de custo é 2*2= 4;
    // O menor valor de venda do pacote, seria 4.00, mas ta sendo passado 2.0.
    const res = await testServer
      .post(url)
      .attach("csv-file-products", fileCSV, "arquivo.csv");
    expect(res.statusCode).toEqual(StatusCodes.OK);

    expect(res.body[0]).toEqual({
      code: newProducts1[0].code,
      msgError: brokenRule("rule2"),
    });
  });
  // Produto normal, novo preço de venda menor que o preço de custo(rule2)
  it("Normal product, new sales price lower than cost price", async () => {
    const url = `${prefix}fileHasHeader=true&nameColumnCode=code&nameColumnNewPrice=price`;
    const newProduct = {
      code: 9,
      name: "Produto normal",
      cost_price: 4,
      sales_price: 8,
    };
    await Knex.insert(newProduct).table(ETableNames.products);

    // O preço de custo da mercadoria é 4, portanto, o mínimo esperado para o preço de venda seria 4.
    // No entanto, foi fornecido um valor de 3.9, o que está abaixo do custo..
    const fileCSV = fileCSVCreate(`
      code, price
      9, 3.9
    `);

    const res = await testServer
      .post(url)
      .attach("csv-file-products", fileCSV, "arquivo.csv");
    expect(res.statusCode).toEqual(StatusCodes.OK);

    expect(res.body[0]).toEqual({
      code: newProduct.code,
      msgError: brokenRule("rule2"),
    });
  });
  // Novo preço de venda maior que 10% do preço atual(rule3)
  it("New sales price greater than 10% of current price", async () => {
    const url = `${prefix}fileHasHeader=true&nameColumnCode=code&nameColumnNewPrice=price`;
    const newProduct = {
      code: 10,
      name: "Produto normal",
      cost_price: 4,
      sales_price: 8,
    };
    await Knex.insert(newProduct).table(ETableNames.products);

    // Calculando 10% de 8, obtemos 0,8, o que significa que o valor máximo permitido é 8.8.
    // Entretanto, no caso, está sendo passado 8.9
    const fileCSV = fileCSVCreate(`
      code, price
      10, 8.9
    `);

    const res = await testServer
      .post(url)
      .attach("csv-file-products", fileCSV, "arquivo.csv");
    expect(res.statusCode).toEqual(StatusCodes.OK);

    expect(res.body[0]).toEqual({
      code: newProduct.code,
      msgError: brokenRule("rule3"),
    });
  });
  // Novo preço de venda menor que 10% do preço atual(rule9)
  it("New sales price less than 10% of the current price", async () => {
    const url = `${prefix}fileHasHeader=true&nameColumnCode=code&nameColumnNewPrice=price`;
    const newProduct = {
      code: 11,
      name: "Produto normal",
      cost_price: 4,
      sales_price: 8,
    };
    await Knex.insert(newProduct).table(ETableNames.products);

    // Calculando 10% de 8, obtemos 0.8, o que significa que o valor mínimo permitido é 7.2.
    // Entretanto, no caso, está sendo passado 7.1.
    const fileCSV = fileCSVCreate(`
      code, price
      11, 7.1
    `);

    const res = await testServer
      .post(url)
      .attach("csv-file-products", fileCSV, "arquivo.csv");
    expect(res.statusCode).toEqual(StatusCodes.OK);

    expect(res.body[0]).toEqual({
      code: newProduct.code,
      msgError: brokenRule("rule9"),
    });
  });
  // Sucesso produto normal
  it("Normal product success", async () => {
    const url = `${prefix}fileHasHeader=true&nameColumnCode=code&nameColumnNewPrice=price`;
    const newProduct = {
      code: 12,
      name: "Produto normal",
      cost_price: 1,
      sales_price: 2,
    };
    await Knex.insert(newProduct).table(ETableNames.products);

    // 2 valor mínimo
    // 2.2 valor máximo
    const fileCSV = fileCSVCreate(`
      code, price
      12, 2
      12, 2.1
      12, 2.2
    `);

    const res = await testServer
      .post(url)
      .attach("csv-file-products", fileCSV, "arquivo.csv");
    expect(res.statusCode).toEqual(StatusCodes.OK);
    expect(res.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: expect.any(Number),
          name: expect.any(String),
          cost_price: expect.any(Number),
          sales_price: expect.any(Number),
          new_sales_price: expect.any(Number),
        }),
      ])
    );
    expect(Object.keys(res.body[0]).length).toBe(5);

    // Arquivo sem 'fileHasHeader'.
    const urlNoHeader = `${prefix}fileHasHeader=false&nameColumnCode=12&nameColumnNewPrice=2`;

    // 2 valor mínimo
    // 2.2 valor máximo
    const fileCSVNoHeader = fileCSVCreate(`
      12, 2
      12, 2.1
      12, 2.2
    `);

    const res1 = await testServer
      .post(urlNoHeader)
      .attach("csv-file-products", fileCSVNoHeader, "arquivo.csv");
    expect(res1.statusCode).toEqual(StatusCodes.OK);
    expect(res1.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: expect.any(Number),
          name: expect.any(String),
          cost_price: expect.any(Number),
          sales_price: expect.any(Number),
          new_sales_price: expect.any(Number),
        }),
      ])
    );
    expect(Object.keys(res1.body[0]).length).toBe(5);
  });
  // Sucesso produto pacote
  it("Normal product pack success", async () => {
    const url = `${prefix}fileHasHeader=true&nameColumnCode=code&nameColumnNewPrice=price`;

    const newProducts1 = [
      {
        code: 13,
        name: "Produto pack",
        cost_price: 2,
        sales_price: 4,
      },
      {
        code: 14,
        name: "Produto component",
        cost_price: 1,
        sales_price: 2,
      },
    ];
    const newPack1 = {
      pack_id: 13,
      product_id: 14,
      qty: 2,
    };
    await Knex.insert(newProducts1).table(ETableNames.products);
    await Knex.insert(newPack1).table(ETableNames.packs);

    // Atualizando o preço do pacote para 4.00 e o preço do componente para 2;
    const fileCSV = fileCSVCreate(`
      code, price
      13, 4
      14, 2
    `);

    const res = await testServer
      .post(url)
      .attach("csv-file-products", fileCSV, "arquivo.csv");
    expect(res.statusCode).toEqual(StatusCodes.OK);

    expect(res.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: expect.any(Number),
          name: expect.any(String),
          cost_price: expect.any(Number),
          sales_price: expect.any(Number),
          new_sales_price: expect.any(Number),
          new_cost_price_pack: expect.any(Number),
        }),
      ])
    );
    expect(Object.keys(res.body[0]).length).toBe(6);
    expect(Object.keys(res.body[1]).length).toBe(5);

    // Arquivo sem 'fileHasHeader'.
    const urlNoHeader = `${prefix}fileHasHeader=false&nameColumnCode=13&nameColumnNewPrice=4`;

    // Atualizando o preço do pacote para 4.00 e o preço do componente para 2;
    const fileCSVNoHeader = fileCSVCreate(`
     13, 4
     14, 2
   `);
    const res2 = await testServer
      .post(urlNoHeader)
      .attach("csv-file-products", fileCSVNoHeader, "arquivo.csv");
    expect(res2.statusCode).toEqual(StatusCodes.OK);

    expect(res2.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: expect.any(Number),
          name: expect.any(String),
          cost_price: expect.any(Number),
          sales_price: expect.any(Number),
          new_sales_price: expect.any(Number),
          new_cost_price_pack: expect.any(Number),
        }),
      ])
    );
    expect(Object.keys(res.body[0]).length).toBe(6);
    expect(Object.keys(res.body[1]).length).toBe(5);
  });
});
