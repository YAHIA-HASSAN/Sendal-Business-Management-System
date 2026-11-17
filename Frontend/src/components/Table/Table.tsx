import { useEffect, useMemo, useState } from "react";
import type { InvoiceSummary } from "../../data/invoiceStore";
import "./Table.css";

type Props = { invoices: InvoiceSummary[] };

const currency = new Intl.NumberFormat("ar-EG", { style: "currency", currency: "EGP", maximumFractionDigits: 2 });
const statusLabel: Record<InvoiceSummary["status"], string> = { paid: "مدفوعة", partial: "مدفوعة جزئيًا", unpaid: "غير مدفوعة" };

export default function Table({ invoices }: Props) {
  const [search, setSearch] = useState("");
  const [pageSize, setPageSize] = useState(() => getPageSize());
  const [currentPage, setCurrentPage] = useState(1);
  const visibleInvoices = useMemo(() => {
    const query = search.trim();
    return invoices.filter((invoice) => !query || String(invoice.number).includes(query) || `#${String(invoice.number).padStart(5, "0")}`.includes(query));
  }, [invoices, search]);
  const pageCount = Math.max(1, Math.ceil(visibleInvoices.length / pageSize));
  const activePage = Math.min(currentPage, pageCount);
  const pageInvoices = visibleInvoices.slice((activePage - 1) * pageSize, activePage * pageSize);

  useEffect(() => {
    const updatePageSize = () => setPageSize(getPageSize());
    window.addEventListener("resize", updatePageSize);
    return () => window.removeEventListener("resize", updatePageSize);
  }, []);


  return (
    <section className="bills-list-card">
      <div className="bills-list-toolbar">
        <div>
          <h2>كل الفواتير</h2>
          <p>تابع الفواتير والمدفوعات المسجلة في النظام.</p>
        </div>
        <label className="bills-search">
          <span aria-hidden="true">⌕</span>
          <input value={search} onChange={(event) => { setSearch(event.target.value); setCurrentPage(1); }} placeholder="ابحث برقم الفاتورة" />
        </label>
      </div>
      <div className="bills-table-wrap">
        <table className="bills-table">
          <thead>
            <tr><th>رقم الفاتورة</th><th>التاريخ</th><th>العميل</th><th>الحالة</th><th>الخصم</th><th>صافي الفاتورة</th><th>المدفوع</th><th>المتبقي</th></tr>
          </thead>
          <tbody>
            {pageInvoices.map((invoice) => (
              <tr key={invoice.id}>
                <td className="bill-number">#{String(invoice.number).padStart(5, "0")}</td>
                <td>{new Intl.DateTimeFormat("ar-EG", { year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(`${invoice.issueDate}T00:00:00`))}</td>
                <td>{invoice.customerName}</td>
                <td><span className={`bill-status bill-status-${invoice.status}`}>{statusLabel[invoice.status]}</span></td>
                <td>{currency.format(invoice.discountAmount)}</td>
                <td className="bill-amount">{currency.format(invoice.amount)}</td>
                <td>{currency.format(invoice.paid)}</td>
                <td className={invoice.remaining ? "bill-remaining" : "bill-zero"}>{currency.format(invoice.remaining)}</td>
              </tr>
            ))}
            {!visibleInvoices.length && <tr><td colSpan={8} className="bills-empty-row">{search ? "لا توجد فاتورة بهذا الرقم." : "لا توجد فواتير حتى الآن."}</td></tr>}
          </tbody>
        </table>
      </div>
      <div className="bills-list-footer">
        <span>عدد الفواتير</span><strong>{visibleInvoices.length}</strong>
        <div className="bills-pagination" dir="rtl">
          <button type="button" onClick={() => setCurrentPage((page) => Math.max(1, page - 1))} disabled={activePage <= 1}>السابق</button>
          <span>صفحة {activePage} من {pageCount}</span>
          <button type="button" onClick={() => setCurrentPage((page) => Math.min(pageCount, page + 1))} disabled={activePage >= pageCount}>التالي</button>
        </div>
      </div>
    </section>
  );
}

function getPageSize(): number {
  if (window.innerHeight <= 500) return 3;
  if (window.innerHeight <= 640) return 4;
  return 5;
}
