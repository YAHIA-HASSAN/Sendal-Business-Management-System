import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getCashDrawer, getInvoices } from "../api/client";
import type { CashDrawerRecord, InvoiceSummary } from "../data/invoiceStore";
import Table from "../components/Table/Table";
import "./Bills.css";

type NavigationState = { issuedInvoiceNumber?: string } | null;
const currency = new Intl.NumberFormat("ar-EG", { style: "currency", currency: "EGP", maximumFractionDigits: 2 });

export default function Bills() {
  const navigate = useNavigate(); const location = useLocation();
  const [invoices, setInvoices] = useState<InvoiceSummary[]>([]);
  const [cashDrawer, setCashDrawer] = useState<CashDrawerRecord | null>(null);
  const [loading, setLoading] = useState(true); const [error, setError] = useState("");
  const state = location.state as NavigationState;
  async function refresh() {
    setLoading(true); setError("");
    try { const [nextInvoices, nextDrawer] = await Promise.all([getInvoices(), getCashDrawer()]); setInvoices(nextInvoices); setCashDrawer(nextDrawer); }
    catch (loadError) { setError(loadError instanceof Error ? loadError.message : "تعذر تحميل الفواتير."); }
    finally { setLoading(false); }
  }
  useEffect(() => {
    let active = true;
    Promise.all([getInvoices(), getCashDrawer()]).then(([nextInvoices, nextDrawer]) => {
      if (active) { setInvoices(nextInvoices); setCashDrawer(nextDrawer); }
    }).catch((loadError: unknown) => {
      if (active) setError(loadError instanceof Error ? loadError.message : "تعذر تحميل الفواتير.");
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  return (
    <main className="page bills-page" dir="rtl">
      <header className="bills-heading"><div><p className="bills-eyebrow">إدارة المبيعات</p><h1>الفواتير</h1><p>أنشئ فواتير البيع وتابع المبالغ والمدفوعات.</p></div><div className="bills-heading-actions">{cashDrawer && <div className="cash-drawer-summary"><span>رصيد درج النقدية</span><strong>{currency.format(cashDrawer.balance)}</strong></div>}<button className="new-invoice-button" type="button" onClick={() => navigate("/POS")}><span aria-hidden="true">＋</span> فاتورة جديدة</button></div></header>
      {state?.issuedInvoiceNumber && <div className="invoice-issued-notice" role="status"><span className="notice-check" aria-hidden="true">✓</span><div><strong>تم إصدار الفاتورة بنجاح</strong><span>رقم الفاتورة {state.issuedInvoiceNumber}</span></div><button type="button" aria-label="إغلاق التنبيه" onClick={() => navigate(location.pathname, { replace: true, state: null })}>×</button></div>}
      {loading ? <p className="bills-state">جارٍ تحميل الفواتير…</p> : error ? <div className="bills-state bills-state-error" role="alert">{error}<button type="button" onClick={() => void refresh()}>إعادة المحاولة</button></div> : <Table invoices={invoices} />}
    </main>
  );
}
