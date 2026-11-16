import { useLocation, useNavigate } from "react-router-dom";
import Table from "../components/Table/Table";
import { getCashDrawer, getInvoices } from "../data/invoiceStore";
import "./Bills.css";

type NavigationState = { issuedInvoiceNumber?: number } | null;

export default function Bills() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as NavigationState;
  const invoices = getInvoices();
  const cashDrawer = getCashDrawer();
  const currency = new Intl.NumberFormat("ar-EG", { style: "currency", currency: "EGP", maximumFractionDigits: 2 });

  return (
    <main className="page bills-page" dir="rtl">
      <header className="bills-heading">
        <div>
          <p className="bills-eyebrow">إدارة المبيعات</p>
          <h1>الفواتير</h1>
          <p>أنشئ فواتير البيع وتابع المبالغ والمدفوعات.</p>
        </div>
        <div className="bills-heading-actions">
          <div className="cash-drawer-summary"><span>رصيد درج النقدية</span><strong>{currency.format(cashDrawer.balance)}</strong></div>
          <button className="new-invoice-button" type="button" onClick={() => navigate("/POS")}><span aria-hidden="true">＋</span> فاتورة جديدة</button>
        </div>
      </header>

      {state?.issuedInvoiceNumber && (
        <div className="invoice-issued-notice" role="status">
          <span className="notice-check" aria-hidden="true">✓</span>
          <div><strong>تم إصدار الفاتورة بنجاح</strong><span>رقم الفاتورة #{String(state.issuedInvoiceNumber).padStart(5, "0")}</span></div>
          <button type="button" aria-label="إغلاق التنبيه" onClick={() => navigate(location.pathname, { replace: true, state: null })}>×</button>
        </div>
      )}

      <Table invoices={invoices} />
    </main>
  );
}
