import { useEffect, useState, type FormEvent } from "react";
import {
  createExpense,
  getCashDrawer,
  getCashMovements,
  type CashMovement,
} from "../api/client";
import { useAuth } from "../auth/AuthContext";
import type { CashDrawerRecord } from "../data/invoiceStore";

const currency = new Intl.NumberFormat("ar-EG", {
  style: "currency",
  currency: "EGP",
  maximumFractionDigits: 2,
});
const fieldClass =
  "h-11 rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100";

export default function Expenses() {
  const { user } = useAuth();
  const [drawer, setDrawer] = useState<CashDrawerRecord | null>(null);
  const [movements, setMovements] = useState<CashMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 8;
  const expenses = movements.filter((movement) => movement.type === "out");
  const pageCount = Math.max(1, Math.ceil(expenses.length / pageSize));
  const visibleExpenses = expenses.slice(
    (page - 1) * pageSize,
    page * pageSize,
  );

  async function refresh() {
    setLoading(true);
    setError("");
    try {
      const [nextDrawer, nextMovements] = await Promise.all([
        getCashDrawer(),
        getCashMovements(),
      ]);
      setDrawer(nextDrawer);
      setMovements(nextMovements);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "تعذر تحميل المصروفات.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let active = true;
    Promise.all([getCashDrawer(), getCashMovements()])
      .then(([nextDrawer, nextMovements]) => {
        if (active) {
          setDrawer(nextDrawer);
          setMovements(nextMovements);
        }
      })
      .catch((loadError: unknown) => {
        if (active)
          setError(
            loadError instanceof Error
              ? loadError.message
              : "تعذر تحميل المصروفات.",
          );
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user) return;
    const formElement = event.currentTarget;
    const form = new FormData(event.currentTarget);
    setSaving(true);
    setError("");
    setNotice("");
    try {
      await createExpense({
        amount: Number(form.get("amount")),
        reason: String(form.get("reason")).trim(),
        userId: user.id,
      });
      formElement.reset();
      setNotice("تم تسجيل حركة السحب وتحديث رصيد الخزنة.");
      setPage(1);
      await refresh();
    } catch (saveError) {
      setError(
        saveError instanceof Error ? saveError.message : "تعذر تسجيل المصروف.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <main
      className="page flex min-h-0 flex-col gap-4 overflow-hidden"
      dir="rtl"
    >
      <header className="flex flex-none flex-wrap items-center justify-between gap-3">
        <div>
          <p className="mb-1 text-xs font-bold text-sendal-orange-600">
            إدارة النقدية
          </p>
          <h1 className="m-0 text-2xl font-bold">المصروفات</h1>
          <p className="mt-2 text-sm text-slate-500">
            سجّل عمليات السحب من درج النقدية وتابع الحركات السابقة.
          </p>
        </div>
        <div className="min-w-48 rounded-xl border border-orange-100 bg-orange-50 px-5 py-3">
          <span className="block text-xs text-slate-500">رصيد درج النقدية</span>
          <strong className="mt-1 block text-xl text-slate-900">
            {drawer ? currency.format(drawer.balance) : "—"}
          </strong>
        </div>
      </header>

      {error && (
        <div
          className="flex flex-none items-center justify-between gap-3 rounded-lg bg-red-50 p-3 text-sm text-red-700"
          role="alert"
        >
          {error}
          <button
            type="button"
            className="font-bold underline"
            onClick={() => void refresh()}
          >
            إعادة المحاولة
          </button>
        </div>
      )}
      {notice && (
        <p
          className="m-0 flex-none rounded-lg bg-green-50 p-3 text-sm text-green-700"
          role="status"
        >
          {notice}
        </p>
      )}

      <section className="grid min-h-0 flex-1 grid-cols-1 grid-rows-[minmax(0,1fr)_auto] gap-4 overflow-hidden lg:grid-cols-[minmax(0,1fr)_340px] lg:grid-rows-1">
        <div className="flex min-h-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="flex flex-none items-center justify-between border-b border-slate-100 px-4 py-3">
            <div>
              <h2 className="m-0 text-base font-bold">سجل السحب</h2>
              <p className="mb-0 mt-1 text-xs text-slate-500">
                {expenses.length} حركة مسجلة
              </p>
            </div>
            <span className="text-sm font-semibold text-red-600">
              إجمالي السحب:{" "}
              {currency.format(
                expenses.reduce((sum, movement) => sum + movement.amount, 0),
              )}
            </span>
          </div>
          <div className="min-h-0 flex-1 overflow-auto">
            <table className="w-full text-right text-sm">
              <thead className="sticky top-0 bg-slate-50 text-xs text-slate-500">
                <tr>
                  <th className="p-3">التاريخ والوقت</th>
                  <th className="p-3">السبب</th>
                  <th className="p-3">المبلغ</th>
                </tr>
              </thead>
              <tbody>
                {visibleExpenses.map((movement) => (
                  <tr key={movement.id} className="border-t border-slate-100">
                    <td className="whitespace-nowrap p-3 text-slate-500">
                      {new Date(movement.date_time).toLocaleString("ar-EG", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </td>
                    <td className="p-3 font-medium">{movement.reason}</td>
                    <td className="whitespace-nowrap p-3 font-bold text-red-600">
                      −{currency.format(movement.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!loading && expenses.length === 0 && (
              <p className="p-8 text-center text-sm text-slate-500">
                لا توجد حركات سحب مسجلة.
              </p>
            )}
            {loading && (
              <p className="p-8 text-center text-sm text-slate-500">
                جارٍ تحميل المصروفات…
              </p>
            )}
          </div>
          <div className="customer-pager">
            <button
              disabled={page <= 1}
              onClick={() => setPage((value) => value - 1)}
            >
              السابق
            </button>
            <span>
              {page} / {pageCount}
            </span>
            <button
              disabled={page >= pageCount}
              onClick={() => setPage((value) => value + 1)}
            >
              التالي
            </button>
          </div>
        </div>

        <form
          onSubmit={submit}
          className="flex h-fit flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5"
        >
          <div>
            <h2 className="m-0 text-base font-bold">تسجيل حركة سحب</h2>
            <p className="mb-0 mt-1 text-xs leading-5 text-slate-500">
              سيُخصم المبلغ من رصيد الخزنة فور الحفظ.
            </p>
          </div>
          <label className="grid gap-1.5 text-xs font-semibold text-slate-600">
            مبلغ السحب (ج.م)
            <input
              className={fieldClass}
              name="amount"
              type="number"
              min="0.01"
              max={drawer?.balance ?? undefined}
              step="0.01"
              placeholder="0.00"
              required
            />
          </label>
          <label className="grid gap-1.5 text-xs font-semibold text-slate-600">
            سبب السحب
            <textarea
              className="min-h-24 rounded-lg border border-slate-200 p-3 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
              name="reason"
              maxLength={240}
              placeholder="اكتب سبب المصروف"
              required
            />
          </label>
          <button
            className="rounded-lg bg-sendal-orange-500 px-4 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
            type="submit"
            disabled={saving || !drawer || drawer.balance <= 0}
          >
            {saving ? "جارٍ التسجيل…" : "تسجيل السحب"}
          </button>
        </form>
      </section>
    </main>
  );
}
