import { useEffect, useState, type FormEvent } from "react";
import { createUser, getUsers, type ApiUser, type UserInput } from "../api/client";
import "./Users.css";

const field = "h-10 rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-orange-400";
export default function Users() {
  const [users, setUsers] = useState<ApiUser[]>([]); const [page, setPage] = useState(1); const [loading, setLoading] = useState(true); const [error, setError] = useState(""); const [open, setOpen] = useState(false); const [saving, setSaving] = useState(false);
  const pageCount = Math.max(1, Math.ceil(users.length / 7)); const pageUsers = users.slice((page - 1) * 7, page * 7);
  useEffect(() => {
    let active = true;
    getUsers().then((result) => { if (active) setUsers(result); })
      .catch((e: unknown) => { if (active) setError(e instanceof Error ? e.message : "تعذر تحميل المستخدمين."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const f = new FormData(event.currentTarget);
    const input: UserInput = { name: String(f.get("name")).trim(), username: String(f.get("username")).trim(), password: String(f.get("password")), role: String(f.get("role")) as UserInput["role"], start_date: String(f.get("start_date")), salary: Number(f.get("salary")), mobile_number: String(f.get("mobile_number")) };
    setSaving(true); setError(""); try { const created = await createUser(input); setUsers((list) => [...list, created]); setPage(Math.ceil((users.length + 1) / 7)); setOpen(false); } catch (e) { setError(e instanceof Error ? e.message : "تعذر إضافة المستخدم."); } finally { setSaving(false); }
  }
  return <main className="page flex min-h-0 flex-col gap-4 overflow-hidden" dir="rtl">
    <header className="flex flex-none items-center justify-between gap-4"><div><p className="mb-1 text-xs font-bold text-sendal-orange-600">إدارة النظام</p><h1 className="m-0 text-2xl font-bold">المستخدمون</h1><p className="mt-2 text-sm text-slate-500">إنشاء حسابات البائعين والمديرين.</p></div><button className="rounded-lg bg-sendal-orange-500 px-4 py-2.5 text-sm font-bold text-white" onClick={() => setOpen(true)}>إضافة مستخدم ＋</button></header>
    {error && <p className="m-0 rounded-lg bg-red-50 p-3 text-sm text-red-700" role="alert">{error}</p>}
    <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white"><div className="min-h-0 flex-1"><table className="users-table w-full text-right text-sm"><thead className="bg-slate-50 text-xs text-slate-500"><tr>{["الاسم", "اسم المستخدم", "الدور", "الهاتف", "تاريخ البدء", "الراتب"].map((x) => <th className="p-3" key={x}>{x}</th>)}</tr></thead><tbody>{pageUsers.map((u) => <tr key={u.id} className="border-t border-slate-100"><td className="p-3 font-semibold">{u.name}</td><td className="p-3">{u.username}</td><td className="p-3">{u.role === "admin" ? "مدير" : "بائع"}</td><td className="p-3">{u.mobile_number ?? "—"}</td><td className="p-3">{u.start_date ?? "—"}</td><td className="p-3">{u.salary?.toLocaleString("ar-EG") ?? "—"} ج.م</td></tr>)}</tbody></table>{loading && <p className="p-6 text-sm text-slate-500">جارٍ التحميل…</p>}</div><div className="customer-pager"><button disabled={page <= 1} onClick={() => setPage((value) => value - 1)}>السابق</button><span>{page} / {pageCount} · {users.length} مستخدم</span><button disabled={page >= pageCount} onClick={() => setPage((value) => value + 1)}>التالي</button></div></section>
    {open && <div className="payment-overlay" role="presentation"><form className="payment-dialog grid gap-3" dir="rtl" onSubmit={submit}><h2 className="m-0">إضافة مستخدم</h2><label className="grid gap-1 text-xs">الاسم<input className={field} name="name" required /></label><label className="grid gap-1 text-xs">اسم المستخدم<input className={field} name="username" autoComplete="off" required /></label><label className="grid gap-1 text-xs">كلمة المرور المؤقتة<input className={field} name="password" type="password" autoComplete="new-password" minLength={6} required /></label><label className="grid gap-1 text-xs">الدور<select className={field} name="role"><option value="seller">بائع</option><option value="admin">مدير</option></select></label><label className="grid gap-1 text-xs">رقم الهاتف<input className={field} name="mobile_number" /></label><div className="grid grid-cols-2 gap-3"><label className="grid gap-1 text-xs">تاريخ بدء العمل<input className={field} name="start_date" type="date" required /></label><label className="grid gap-1 text-xs">الراتب<input className={field} name="salary" type="number" min="0" step="0.01" defaultValue="0" required /></label></div>{error && <p className="text-xs text-red-700">{error}</p>}<footer className="flex justify-between gap-3 pt-2"><button type="button" className="payment-back-button" onClick={() => setOpen(false)}>إلغاء</button><button className="checkout-button" type="submit" disabled={saving}>{saving ? "جارٍ الحفظ…" : "إنشاء المستخدم"}</button></footer></form></div>}
  </main>;
}
