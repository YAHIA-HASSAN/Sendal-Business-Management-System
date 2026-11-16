import { formatCurrency } from "../../utils/formatCurrency";
import type { PaymentDraft } from "./types";
import "./shared.css";
import "./PaymentDialog.css";

const paymentMethods = [
  { value: "cash", label: "نقدي" },
  { value: "wallet", label: "محفظة إلكترونية" },
  { value: "card", label: "بطاقة بنكية" },
  { value: "bank", label: "تحويل بنكي" },
];

type Props = {
  total: number;
  paid: number;
  remaining: number;
  payments: PaymentDraft[];
  invalidPayments: boolean;
  error: string;
  onAddPayment: () => void;
  onUpdatePayment: (paymentId: string, updates: Partial<PaymentDraft>) => void;
  onRemovePayment: (paymentId: string) => void;
  onClose: () => void;
  onIssue: () => void;
};

export default function PaymentDialog({
  total, paid, remaining, payments, invalidPayments, error,
  onAddPayment, onUpdatePayment, onRemovePayment, onClose, onIssue,
}: Props) {
  const invalidTotal = paid > total + 0.001;

  return (
    <div className="payment-overlay" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="payment-dialog" role="dialog" aria-modal="true" aria-labelledby="payment-title" dir="rtl">
        <header className="payment-dialog-header">
          <div>
            <p className="pos-eyebrow">الخطوة الأخيرة</p>
            <h2 id="payment-title">دفع وإصدار الفاتورة</h2>
          </div>
          <button className="dialog-close-button" type="button" aria-label="إغلاق" onClick={onClose}>×</button>
        </header>

        <div className="payment-totals">
          <div><span>صافي الفاتورة</span><strong>{formatCurrency(total)}</strong></div>
          <div><span>المدفوع</span><strong>{formatCurrency(paid)}</strong></div>
          <div className="payment-remaining"><span>المتبقي</span><strong>{formatCurrency(remaining)}</strong></div>
        </div>

        <div className="payment-method-list">
          <div className="payment-list-heading"><h3>طرق الدفع</h3><button type="button" onClick={onAddPayment}>إضافة طريقة +</button></div>
          {payments.length ? payments.map((payment) => (
            <div className="payment-method-row" key={payment.id}>
              <label>
                <span>طريقة الدفع</span>
                <select value={payment.method} onChange={(event) => onUpdatePayment(payment.id, { method: event.target.value })}>
                  {paymentMethods.map((method) => <option key={method.value} value={method.value}>{method.label}</option>)}
                </select>
              </label>
              <label>
                <span>المبلغ</span>
                <input type="number" min="0" step="0.01" value={payment.amount} onChange={(event) => onUpdatePayment(payment.id, { amount: event.target.value })} />
              </label>
              <button className="remove-payment-button" type="button" aria-label="حذف طريقة الدفع" onClick={() => onRemovePayment(payment.id)}>×</button>
            </div>
          )) : <p className="no-payment-note">لا توجد دفعات. يمكن إصدار الفاتورة دون دفع الآن.</p>}
        </div>

        {(invalidTotal || invalidPayments) && <p className="pos-error" role="alert">تحقق من مبالغ الدفع؛ يجب ألا تكون سالبة أو أكبر من صافي الفاتورة.</p>}
        {error && <p className="pos-error" role="alert">{error}</p>}
        <footer className="payment-actions">
          <button className="payment-back-button" type="button" onClick={onClose}>العودة للفاتورة</button>
          <button className="checkout-button" type="button" disabled={invalidTotal || invalidPayments} onClick={onIssue}>إصدار الفاتورة</button>
        </footer>
      </section>
    </div>
  );
}
