import type { Product } from "../../data/invoiceStore";
import { formatCurrency } from "../../utils/formatCurrency";
import "./SearchForm.css";

type Props = {
  products: Product[];
  search: string;
  selectedQuantities: Record<string, number>;
  onSearchChange: (value: string) => void;
  onAddProduct: (product: Product) => void;
};

export default function SearchForm({ products, search, selectedQuantities, onSearchChange, onAddProduct }: Props) {
  return (
    <section className="pos-panel product-panel" aria-labelledby="products-title">
      <div className="panel-heading">
        <div>
          <h2 id="products-title">المنتجات</h2>
          <p>ابحث بالاسم أو كود المنتج</p>
        </div>
        <span className="panel-count">{products.length} منتج</span>
      </div>
      <label className="product-search">
        <span aria-hidden="true">⌕</span>
        <input value={search} onChange={(event) => onSearchChange(event.target.value)} placeholder="ابحث عن منتج..." autoFocus />
        {search && <button type="button" aria-label="مسح البحث" onClick={() => onSearchChange("")}>×</button>}
      </label>

      <div className="product-results">
        {products.length ? products.map((product) => {
          const selectedQuantity = selectedQuantities[product.id] ?? 0;
          return (
            <article className="product-card" key={product.id}>
              <div className="product-card-info">
                <h3>{product.name}</h3>
                <span>{product.code}</span>
              </div>
              <div className="product-meta">
                  <strong>{formatCurrency(product.unitPrice)}</strong>
                  <span>المتاح: {product.stock}</span>
                </div>
              <button className="add-product-button" type="button" onClick={() => onAddProduct(product)} disabled={selectedQuantity >= product.stock}>
                {selectedQuantity ? `مضاف (${selectedQuantity})` : "إضافة +"}
              </button>
            </article>
          );
        }) : (
          <div className="empty-products">
            <span aria-hidden="true">⌕</span>
            <strong>{search ? "لا توجد منتجات مطابقة" : "لا توجد منتجات متاحة"}</strong>
            <p>{search ? "جرّب كلمة بحث أو كودًا مختلفًا." : "المنتجات غير المتاحة في المخزون لا تظهر هنا."}</p>
          </div>
        )}
      </div>
    </section>
  );
}
