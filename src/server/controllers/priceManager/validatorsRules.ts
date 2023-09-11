import { IProduct } from "../../database/models/product";
import { PriceManagerProvider } from "../../database/providers/priceManager";
import { IRowExtract } from "./uploadFile";

interface INewPrice {
  new_sales_price: number;
  new_cost_price_pack?: number;
}
interface IProductInvalid {
  code: number;
  msgError: string;
}
export type IProductValidation = (IProduct & INewPrice) | IProductInvalid;

// Retorna a mensagem da regra que foi quebrada.
const brokenRule = (
  rule:
    | "rule1"
    | "rule2"
    | "rule3"
    | "rule4"
    | "rule5"
    | "rule6"
    | "rule7"
    | "rule8"
    | "rule9"
    | "rule10"
    | "rule11",
  column1?: string,
  column2?: string
) => {
  // prettier-ignore
  const rules = {
      rule1: "O arquivo deve conter o código do produto e o novo preço que será carregado.",
      rule2: "O preço de venda não pode ser inferior ao preço de custo.",
      rule3: "O ajuste de preço não pode exceder 10% a mais do preço atual do produto.",
      rule4: "Ao atualizar o preço de um pacote, é necessário incluir os ajustes nos preços dos componentes do pacote, de modo que a soma dos preços dos componentes corresponda ao preço do pacote.",
      rule5: "Cada registro deve incluir as colunas 'código do produto' e 'novo preço de venda'.",
      rule6: "O código de produto fornecido não corresponde a nenhum registro existente.",
      rule7: `Aguardava-se um valor numérico para '${column1}', porém foi recebido: '${column2}'`,
      rule8: "O número de colunas não está alinhado com os demais registros.",
      rule9: "O ajuste de preço não pode exceder 10% a menos do preço atual do produto.",
      rule10: "Para atualizar um pacote, o componente do produto não deve violar nenhuma regra.",
      rule11: "Ao atualizar o preço de um produto que outros produtos dependem como componente, é necessário incluir o ajuste no preço do pacote como parte do processo.",
    };

  return rules[rule];
};

// Essa função retorna um novo array dos produtos com validação se o produto existe na base(rules6)
const validateExistenceProducts = (
  fileData: IRowExtract[],
  resultProductsInDB: IProduct[]
): IProductValidation[] => {
  // Crio um novo array, contendo todos os 'code' dos produtos que foram encontrado na base.
  const codesProductsInBase = resultProductsInDB.map((row) => row.code);

  // Percorre todos os item do arquivo 'fileData' e verifica se o produto existe na base.
  // Se o item existir, retorno o produto: { ...produto, new_sales_price }
  // Se não existir, retorno error: { code, msgError }
  const newResultProducts = fileData.map((item) => {
    if (codesProductsInBase.indexOf(item.code) !== -1) {
      return {
        ...resultProductsInDB[codesProductsInBase.indexOf(item.code)],
        new_sales_price: item.new_sales_price,
      };
    } else {
      return { code: item.code, msgError: brokenRule("rule6") };
    }
  });

  return newResultProducts;
};

// Verifica se o produto é pacote; caso seja, realize uma série de validações.
const validateProductIsPack = async (
  resultValidateProductInDB: IProductValidation[]
): Promise<IProductValidation[]> => {
  const newResultProducts = await Promise.all(
    resultValidateProductInDB.map(async (product) => {
      // Se o produto já teve uma das regras quebradas, não é necessário realizar outras validações.
      if ("msgError" in product) {
        return product;
      }
      // prettier-ignore
      // Se o produto for um pack, vai ser retornado um array de objeto, onde a coluna 'product_id' é...
      // product_id= id do produto componente. Ou seja, se o pacote tiver 2 complementos, será retornado um array com 2 posições, onde cada item é um produto componente.
      const componentsProductPack = await PriceManagerProvider.getProductPack(product.code);
      if (componentsProductPack instanceof Error) {
        return {
          code: product.code,
          msgError:
            "Ocorreu um erro inesperado durante a validação se o item é um pacote.",
        };
      }

      // Se o produto tiver componentes, vou seguir com as validações para produto pacote.
      if (componentsProductPack.length > 0) {
        let totalPriceSaleComponents = 0;
        let totalPriceCostComponent = 0;

        // Percorre cada um dos produtos componente.
        // product_id= id do produto complemento.
        // Isso será necessário para calcular o total dos preço de custo dos componentes e o preço de venda.
        for (const codeComponent of componentsProductPack) {
          // prettier-ignore
          // Aqui vou verificar se o produto componente ta incluso na lista
          // Pela regra para atualizar o preço de um pacote os produtos que incluem o pacote também dever ser atualizados(rule4).
          const componentInResultProducts = resultValidateProductInDB.find(prodComponent=>prodComponent.code === codeComponent.product_id)
          // Se o componente tiver incluso sigo com as validações.
          if (componentInResultProducts) {
            // Se o produto componente tiver alguma regra quebrada, retorno error.
            // rule10 = "Para atualizar um pacote, o componente do produto não deve violar nenhuma regra."
            if ("msgError" in componentInResultProducts) {
              return { code: product.code, msgError: brokenRule("rule10") };
            }

            // prettier-ignore
            // Restaura as informações da tabela 'packs', nele vai ter 'qty', que quantidade do produto componente
            const componentQuantity = componentsProductPack.find((packs) => packs.product_id === codeComponent.product_id);
            if (componentQuantity === undefined) {
              return {
                code: product.code,
                msgError: "A quantidade do pacote não pode ser 'undefined'.",
              };
            }

            // Soma o preço de venda dos componente.
            totalPriceSaleComponents =
              totalPriceSaleComponents +
              componentInResultProducts.new_sales_price * componentQuantity.qty;

            // Soma o preço de custo dos componentes.
            totalPriceCostComponent =
              totalPriceCostComponent +
              componentInResultProducts.cost_price * componentQuantity.qty;
          } else {
            // Se o componente não tiver inclusos, retorna o error
            return { code: product.code, msgError: brokenRule("rule4") };
          }
        }

        // Valida se o novo preço de venda do pacote é igual a soma dos componentes(rule4)
        // Se for diferente retorna error.
        if (product.new_sales_price === totalPriceSaleComponents) {
          // retorno o produto e adiciono 'new_cost_price_pack'
          // new_cost_price_pack, vai ser utilizando no momento de salvar na base para atualizar o preço de custo do pacote.
          return { ...product, new_cost_price_pack: totalPriceCostComponent };
        } else {
          return { code: product.code, msgError: brokenRule("rule4") };
        }
      } else {
        // Se não tiver complemento, apenas retorno o produto.
        return product;
      }
    })
  );

  return newResultProducts;
};

// Verifica se o produto é um componente de um pacote; caso seja, realize uma série de validações.
const validateProductIsComponent = async (
  resultValidateProductIsPack: IProductValidation[]
): Promise<IProductValidation[]> => {
  const newResultProducts = await Promise.all(
    resultValidateProductIsPack.map(async (product) => {
      // Se o produto já teve uma das regras quebradas, não é necessário realizar outras validações.
      if ("msgError" in product) {
        return product;
      }
      // prettier-ignore
      // Se o produto for um componente de um pacote, vai ser retornado um array de objeto, onde a coluna 'pack_id' é...
      // pack_id= id do produto pack. Ou seja, se o produto for componente de 2 pacotes, será retornado um array com 2 posições, onde cada um dos item é um produto que tem ele como componente.
      const componentsProductPack = await PriceManagerProvider.getProductPackComponent(product.code);
      if (componentsProductPack instanceof Error) {
        return {
          code: product.code,
          msgError:
            "Ocorreu um erro inesperado durante a validação se o item é um componente de um pacote.",
        };
      }

      // Se o produto for um componente de um pacote, vou seguir com as validações.
      if (componentsProductPack.length > 0) {
        // Produto não está na lista, isso é apenas para garantir que vai ser retornado um objeto.
        let productPackIsList = true;

        // Percorre cada um dos 'pack_id' dos produtos pack.
        // Isso será necessário para validar se o produto pack está contido na lista dos produtos que serão atualizados.
        // Pela regra se for atualizar o preço de venda de um produto que pertence a um pacote, também precisa atualizar o preço de venda do pacote.
        for (const productPack of componentsProductPack) {
          // prettier-ignore
          // Aqui vou verificar se o produto pacote está incluso na lista
          const productPackInResultProducts = resultValidateProductIsPack.find(prod=> prod.code === productPack.pack_id)
          // Se o tiver incluso retorno o produto, sem alterações.
          if (productPackInResultProducts) {
            return product;
          } else {
            productPackIsList = false;
            // Se o produto pacote não tiver inclusos, retorna o error
            return { code: product.code, msgError: brokenRule("rule11") };
          }
        }

        if (productPackIsList) {
          return product;
        } else {
          return { code: product.code, msgError: brokenRule("rule11") };
        }
      } else {
        // Se não for um componente de um pacote vou retornar, sem fazer alterações.
        return product;
      }
    })
  );

  return newResultProducts;
};

// Faz as validações referente ao novo preço
const validateNewPrice = async (
  resultValidateProductIsComponent: IProductValidation[]
): Promise<IProductValidation[]> => {
  const newResultProducts = await Promise.all(
    resultValidateProductIsComponent.map(async (product) => {
      // Se o produto já teve uma das regras quebradas, não é necessário realizar outras validações.
      if ("msgError" in product) {
        return product;
      }

      // Se o produto for um pacote vou validar pelo 'new_cost_price_pack', a soma dos custos dos componentes.
      if ("new_cost_price_pack" in product) {
        // Se existe é porque ta preenchido.
        const newCostPricePack = product.new_cost_price_pack as number;
        // Se o novo preço de venda for menor que a soma dos custos dos componentes, retorna erro.
        if (product.new_sales_price < newCostPricePack) {
          return { code: product.code, msgError: brokenRule("rule2") };
        }
      } else {
        // Se o novo preço de venda for menor que o custo, retorna erro.
        if (product.new_sales_price < product.cost_price) {
          return { code: product.code, msgError: brokenRule("rule2") };
        }
      }

      // Se o novo preço de venda for maior que 10% que o preço atual, retorna erro.
      if (product.new_sales_price > product.sales_price * 1.1) {
        return { code: product.code, msgError: brokenRule("rule3") };
      }
      // Se o novo preço de venda for menor que 10% que o preço atual, retorna erro.
      else if (product.new_sales_price < product.sales_price * 0.9) {
        return { code: product.code, msgError: brokenRule("rule9") };
      }

      // Se não houve nenhuma quebra de regra, retorna o produto sem alteração.
      return product;
    })
  );

  return newResultProducts;
};

export {
  brokenRule,
  validateExistenceProducts,
  validateProductIsPack,
  validateProductIsComponent,
  validateNewPrice,
};
