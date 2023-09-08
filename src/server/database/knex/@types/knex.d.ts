import { IProduct } from "../../models/product";
import { IPack } from "../../models/pack";
declare module "knex/types/tables" {
  interface Tables {
    products: IProduct;
    packs: IPack;
  }
}
