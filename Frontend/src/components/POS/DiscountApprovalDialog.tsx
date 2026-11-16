import { useState, type FormEvent } from "react";
import { formatCurrency } from "../../utils/formatCurrency";
import "./shared.css";
import "./PaymentDialog.css";

type Props = {
  discountAmount: number;
  error: string;
  onApprove: (username: string, password: string) => void;
  onClose: () => void;
};

export default function DiscountApprovalDialog({ discountAmount, error, onApprove, onClose }: Props) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onApprove(username, password);
  }

  return (
    <div className="payment-overlay discount-approval-overlay" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="payment-dialog discount-approval-dialog" role="dialog" aria-modal="true" aria-labelledby="discount-approval-title" dir="rtl">
        <header className="payment-dialog-header">
          <div>
            <p className="pos-eyebrow">صلاحية المدير مطلوبة</p>
            <h2 id="discount-approval-title">اعتماد الخصم</h2>
          </div>
          <button className="dialog-close-button" type="button" aria-label="إغلاق" onClick={onClose}>×</button>
        </header>
        <p className="discount-approval-copy">سيتم اعتماد خصم بقيمة <strong>{formatCurrency(discountAmount)}</strong> لهذه الفاتورة فقط.</p>
        <form className="discount-approval-form" onSubmit={submit}>
          <label className="invoice-field">
            <span>اسم مستخدم</span>
            <input autoFocus autoComplete="username" value={username} onChange={(event) => setUsername(event.target.value)} required />
          </label>
          <label className="invoice-field">
            <span>كلمة المرور</span>
            <input type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required />
          </label>
          {error && <p className="pos-error" role="alert">{error}</p>}
          <footer className="payment-actions">
            <button className="payment-back-button" type="button" onClick={onClose}>إلغاء</button>
            <button className="checkout-button" type="submit">اعتماد الخصم</button>
          </footer>
        </form>
      </section>
    </div>
  );
}
