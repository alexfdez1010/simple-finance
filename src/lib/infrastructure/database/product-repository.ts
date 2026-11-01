/** Public financial repository boundary; reads use Prisma and multi-row writes use atomic D1 batches. */
export {
  createCustomProduct,
  createYahooFinanceProduct,
} from './product-create-repository';
export {
  updateCustomProduct,
  updateYahooFinanceProduct,
} from './product-update-repository';
export {
  deleteProduct,
  findAllProducts,
  findProductById,
  updateProductQuantity,
} from './product-query-repository';
