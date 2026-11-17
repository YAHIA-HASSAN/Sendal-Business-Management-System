import type { Customer, InvoiceLine, Product } from "../../data/invoiceStore";
import InvoiceDetails from "../POS/InvoiceDetails";
import InvoiceLineList from "../POS/InvoiceLineList";
import InvoiceSummary from "../POS/InvoiceSummary";
import "../POS/shared.css";
import "./Purchase.css";

type Props = {
  items: InvoiceLine[];
  products: Product[];
  customers: Customer[];
  customerId: string;
  warranty: string;
  notes: string;
  subtotal: number;
  total: number;
  discountAmount: number;
  isDiscountApproved: boolean;
  invalidDiscount: boolean;
  error: string;
  onCustomerChange: (customerId: string) => void;
  onCreateCustomer: () => void;
  onWarrantyChange: (value: string) => void;
  onNotesChange: (value: string) => void;
  onDiscountChange: (amount: number) => void;
  onRequestDiscountApproval: () => void;
  onQuantityChange: (productId: string, delta: number) => void;
  onRemoveLine: (productId: string) => void;
  onClearInvoice: () => void;
  onContinueToPayment: () => void;
};

export default function Purchase({
  items, products, customers, customerId, warranty, notes, subtotal, total, discountAmount,
  isDiscountApproved, invalidDiscount, error, onCustomerChange, onCreateCustomer, onWarrantyChange, onNotesChange,
  onDiscountChange, onRequestDiscountApproval, onQuantityChange, onRemoveLine, onClearInvoice,
  onContinueToPayment,
}: Props) {
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <section className="pos-panel invoice-panel" aria-labelledby="invoice-title">
      <div className="panel-heading invoice-panel-heading">
        <div>
          <h2 id="invoice-title">محتويات الفاتورة</h2>
          <p>{items.length ? `${items.length} صنف` : "أضف منتجات للبدء"}</p>
        </div>
        {items.length > 0 && <button className="clear-cart-button" type="button" onClick={onClearInvoice}>إفراغ الفاتورة</button>}
      </div>

      <InvoiceLineList items={items} products={products} onQuantityChange={onQuantityChange} onRemove={onRemoveLine} />
      <InvoiceDetails
        customers={customers}
        customerId={customerId}
        warranty={warranty}
        notes={notes}
        onCustomerChange={onCustomerChange}
        onCreateCustomer={onCreateCustomer}
        onWarrantyChange={onWarrantyChange}
        onNotesChange={onNotesChange}
      />
      <InvoiceSummary
        itemCount={itemCount}
        subtotal={subtotal}
        total={total}
        discountAmount={discountAmount}
        isDiscountApproved={isDiscountApproved}
        invalidDiscount={invalidDiscount}
        error={error}
        onDiscountChange={onDiscountChange}
        onRequestDiscountApproval={onRequestDiscountApproval}
        onContinueToPayment={onContinueToPayment}
      />
    </section>
  );
}
