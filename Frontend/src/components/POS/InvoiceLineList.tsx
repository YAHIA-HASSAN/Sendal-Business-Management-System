import type { InvoiceLine, Product } from "../../data/invoiceStore";
import { formatCurrency } from "../../utils/formatCurrency";

type Props = {
  items: InvoiceLine[];
  products: Product[];
  onQuantityChange: (productId: string, delta: number) => void;
  onRemove: (productId: string) => void;
};

export default function InvoiceLineList({ items, products, onQuantityChange, onRemove }: Props) {
  if (!items.length) {
    return (
      <div className="empty-invoice">
        <span aria-hidden="true">＋</span>
        <strong>الفاتورة فارغة</strong>
        <p>اختر منتجًا من القائمة لإضافته هنا.</p>
      </div>
    );
  }

  return (
    <div className="invoice-lines">
      {items.map((item) => {
        const available = products.find((product) => product.id === item.productId)?.stock ?? item.quantity;
        return (
          <article className="invoice-line" key={item.productId}>
            <div className="invoice-line-main">
              <div className="invoice-product-name">
                <strong>{item.name}</strong>
                <span>{formatCurrency(item.unitPrice)} للوحدة</span>
              </div>
              <button className="remove-line-button" type="button" aria-label={`إزالة ${item.name}`} onClick={() => onRemove(item.productId)}>×</button>
            </div>
            <div className="invoice-line-bottom">
              <div className="quantity-control" aria-label={`كمية ${item.name}`}>
                <button type="button" aria-label="زيادة الكمية" disabled={item.quantity >= available} onClick={() => onQuantityChange(item.productId, 1)}>+</button>
                <span>{item.quantity}</span>
                <button type="button" aria-label="تقليل الكمية" disabled={item.quantity <= 1} onClick={() => onQuantityChange(item.productId, -1)}>−</button>
              </div>
              <strong className="line-total">{formatCurrency(item.unitPrice * item.quantity)}</strong>
            </div>
            {item.quantity >= available && <small className="stock-limit-note">وصلت للكمية المتاحة ({available})</small>}
          </article>
        );
      })}
    </div>
  );
}
