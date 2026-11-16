import { formatCurrency } from "../../utils/formatCurrency";

type Props = {
  itemCount: number;
  subtotal: number;
  total: number;
  discountAmount: number;
  isDiscountApproved: boolean;
  invalidDiscount: boolean;
  error: string;
  onDiscountChange: (amount: number) => void;
  onRequestDiscountApproval: () => void;
  onContinueToPayment: () => void;
};

export default function InvoiceSummary({
  itemCount, subtotal, total, discountAmount, isDiscountApproved, invalidDiscount, error,
  onDiscountChange, onRequestDiscountApproval, onContinueToPayment,
}: Props) {
  return (
    <div className="invoice-summary">
      <div><span>عدد القطع</span><strong>{itemCount}</strong></div>
      <div><span>مجموع البنود</span><strong>{formatCurrency(subtotal)}</strong></div>
      <div className="discount-row">
        <label htmlFor="invoice-discount">الخصم</label>
        <div className="discount-control">
          <input id="invoice-discount" type="number" min="0" max={subtotal} step="0.01" value={discountAmount} onChange={(event) => onDiscountChange(Number(event.target.value) || 0)} aria-label="قيمة الخصم بالجنيه" />
          <span>ج.م</span>
          {discountAmount > 0 && isDiscountApproved ? (
            <span className="discount-approved">معتمد ✓</span>
          ) : (
            <button type="button" onClick={onRequestDiscountApproval} disabled={discountAmount <= 0 || invalidDiscount}>طلب موافقة المدير</button>
          )}
        </div>
      </div>
      {invalidDiscount && <p className="pos-error" role="alert">الخصم يجب أن يكون بين صفر وإجمالي البنود.</p>}
      {discountAmount > 0 && !isDiscountApproved && !invalidDiscount && <p className="discount-pending-note">يلزم اعتماد Admin لهذا الخصم قبل المتابعة.</p>}
      <div className="invoice-total-row"><span>إجمالي الفاتورة</span><strong>{formatCurrency(total)}</strong></div>
      {error && <p className="pos-error" role="alert">{error}</p>}
      <button className="checkout-button" type="button" disabled={!itemCount || invalidDiscount || (discountAmount > 0 && !isDiscountApproved)} onClick={onContinueToPayment}>
        المتابعة إلى الدفع <span aria-hidden="true">←</span>
      </button>
    </div>
  );
}
