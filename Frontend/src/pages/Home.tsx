import { useEffect, useState } from "react";
import { getDashboardData } from "../api/client";
import type { InvoiceSummary, Product } from "../data/invoiceStore";

type Dashboard = {
  invoices: InvoiceSummary[];
  products: Product[];
  revenue: number;
  outstanding: number;
  lowStock: Product[];
};
const money = new Intl.NumberFormat("ar-EG", {
  style: "currency",
  currency: "EGP",
  maximumFractionDigits: 0,
});

export default function Home() {
  const [data, setData] = useState<Dashboard>();
  const [error, setError] = useState("");
  useEffect(() => {
    getDashboardData()
      .then(setData)
      .catch((failure: unknown) =>
        setError(
          failure instanceof Error
            ? failure.message
            : "تعذر تحميل ملخص المتجر.",
        ),
      );
  }, []);
  return (
    <main
      className="page flex min-h-0 flex-col gap-4 overflow-hidden"
      dir="rtl"
    >
      <header>
        <p className="mb-1 text-xs font-bold text-sendal-orange-600">
          نظرة عامة
        </p>
        <h1 className="m-0 text-2xl font-bold">الرئيسية</h1>
        <p className="mt-2 text-sm text-slate-500">
          ملخص المبيعات والمخزون في متجرك.
        </p>
      </header>
      {error && (
        <p
          className="rounded-xl bg-red-50 p-4 text-sm text-red-700"
          role="alert"
        >
          {error}
        </p>
      )}
      {!data && !error && (
        <p className="text-sm text-slate-500">جارٍ تحميل بيانات المتجر…</p>
      )}
      {data && (
        <>
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Metric
              title="إجمالي الفواتير"
              value={String(data.invoices.length)}
              detail="فاتورة مسجلة"
            />
            <Metric
              title="المبالغ المحصلة"
              value={money.format(data.revenue)}
              detail="من جميع الفواتير"
            />
            <Metric
              title="مبالغ مستحقة"
              value={money.format(data.outstanding)}
              detail="رصيد العملاء المتبقي"
            />
            <Metric
              title="مخزون منخفض"
              value={String(data.lowStock.length)}
              detail="منتجات مخزونها 5 أو أقل"
            />
          </section>
          <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-2">
            <section className="min-h-0 overflow-hidden rounded-2xl border border-slate-200 bg-white">
              <div className="border-b border-slate-100 px-5 py-4">
                <h2 className="m-0 text-base font-bold">أحدث الفواتير</h2>
              </div>
              <div>
                <table className="w-full text-right text-sm">
                  <thead className="bg-slate-50 text-xs text-slate-500">
                    <tr>
                      <th className="p-3">الفاتورة</th>
                      <th className="p-3">التاريخ</th>
                      <th className="p-3">العميل</th>
                      <th className="p-3">الصافي</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.invoices.slice(0, 5).map((bill, index) => (
                      <tr
                        key={bill.id}
                        className={`border-t border-slate-100 ${index >= 3 ? "hidden sm:table-row" : ""}`}
                      >
                        <td className="p-3 font-semibold">#{bill.number}</td>
                        <td className="p-3">{bill.issueDate}</td>
                        <td className="p-3">{bill.customerName}</td>
                        <td className="p-3">{money.format(bill.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {data.invoices.length === 0 && (
                  <p className="p-5 text-sm text-slate-500">
                    لا توجد فواتير بعد.
                  </p>
                )}
              </div>
            </section>
            <section className="min-h-0 overflow-hidden rounded-2xl border border-slate-200 bg-white">
              <div className="border-b border-slate-100 px-5 py-4">
                <h2 className="m-0 text-base font-bold">تنبيه المخزون</h2>
              </div>
              <div>
                {data.lowStock.slice(0, 5).map((product, index) => (
                  <div
                    key={product.id}
                    className={`items-center justify-between border-b border-slate-100 px-5 py-3 last:border-0 ${index >= 3 ? "hidden sm:flex" : "flex"}`}
                  >
                    <div>
                      <strong className="block text-sm">{product.name}</strong>
                      <span className="text-xs text-slate-500">
                        {product.code}
                      </span>
                    </div>
                    <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">
                      متبقي {product.stock}
                    </span>
                  </div>
                ))}
                {data.lowStock.length === 0 && (
                  <p className="p-5 text-sm text-slate-500">
                    مستويات المخزون جيدة.
                  </p>
                )}
                {data.lowStock.length > 5 && (
                  <p className="px-5 py-2 text-xs text-slate-500">
                    و {data.lowStock.length - 5} منتجات أخرى.
                  </p>
                )}
              </div>
            </section>
          </div>
        </>
      )}
    </main>
  );
}

function Metric({
  title,
  value,
  detail,
}: {
  title: string;
  value: string;
  detail: string;
}) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5">
      <p className="m-0 text-xs text-slate-500">{title}</p>
      <strong className="mt-3 block text-2xl font-bold text-slate-800">
        {value}
      </strong>
      <span className="mt-2 block text-[11px] text-slate-400">{detail}</span>
    </article>
  );
}
