import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { approveDiscount, createCustomer, getCustomers, getProducts, issueInvoice } from "../api/client";
import { useAuth } from "../auth/AuthContext";
import type { Customer, InvoiceLine, Payment, Product } from "../data/invoiceStore";
import SearchForm from "../components/SearchForm/SearchForm";
import Purchase from "../components/Purchase/Purchase";
import DiscountApprovalDialog from "../components/POS/DiscountApprovalDialog";
import PaymentDialog from "../components/POS/PaymentDialog";
import type { PaymentDraft } from "../components/POS/types";
import "./POS.css";

function newPayment(amount = 0): PaymentDraft { return { id: `${Date.now()}-${Math.random()}`, method: "cash", amount: String(amount) }; }

export default function POS() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [items, setItems] = useState<InvoiceLine[]>([]);
  const [paymentStep, setPaymentStep] = useState(false);
  const [issuing, setIssuing] = useState(false);
  const [payments, setPayments] = useState<PaymentDraft[]>([]);
  const [error, setError] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [discountAmount, setDiscountAmount] = useState(0);
  const [approvedDiscountAmount, setApprovedDiscountAmount] = useState<number | null>(null);
  const [discountApprovalToken, setDiscountApprovalToken] = useState<string>();
  const [warranty, setWarranty] = useState("");
  const [notes, setNotes] = useState("");
  const [discountModalOpen, setDiscountModalOpen] = useState(false);
  const [discountError, setDiscountError] = useState("");
  const [customerModalOpen, setCustomerModalOpen] = useState(false);
  const [customerSaving, setCustomerSaving] = useState(false);

  useEffect(() => {
    Promise.all([getProducts(), getCustomers()]).then(([nextProducts, nextCustomers]) => {
      setProducts(nextProducts); setCustomers(nextCustomers);
    }).catch((loadError: unknown) => setError(loadError instanceof Error ? loadError.message : "تعذر تحميل بيانات نقطة البيع."))
      .finally(() => setLoading(false));
  }, []);

  const subtotal = Math.round(items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0) * 100) / 100;
  const total = Math.max(0, subtotal - discountAmount);
  const paid = payments.reduce((sum, payment) => sum + (Number(payment.amount) || 0), 0);
  const remaining = Math.max(0, total - paid);
  const invalidDiscount = discountAmount < 0 || discountAmount > subtotal;
  const invalidPayments = payments.some((payment) => payment.amount.trim() === "" || !Number.isFinite(Number(payment.amount)) || Number(payment.amount) < 0);
  const isDiscountApproved = discountAmount === 0 || approvedDiscountAmount === discountAmount;
  const selectedQuantities = useMemo(() => Object.fromEntries(items.map((item) => [item.productId, item.quantity])), [items]);
  const matchingProducts = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("ar");
    return products.filter((product) => product.stock > 0 && (!query || `${product.name} ${product.code}`.toLocaleLowerCase("ar").includes(query)));
  }, [products, search]);

  function invalidateDiscountApproval() { setApprovedDiscountAmount(null); setDiscountApprovalToken(undefined); }
  function addProduct(product: Product) {
    setError("");
    const existing = items.find((item) => item.productId === product.id);
    if (existing && existing.quantity >= product.stock) { setError(`المتاح من ${product.name} هو ${product.stock} فقط.`); return; }
    invalidateDiscountApproval();
    setItems((current) => existing ? current.map((item) => item.productId === product.id ? { ...item, quantity: item.quantity + 1 } : item) : [...current, { productId: product.id, name: product.name, code: product.code, unitPrice: product.unitPrice, quantity: 1 }]);
  }
  function changeQuantity(productId: string, delta: number) {
    const item = items.find((entry) => entry.productId === productId);
    const available = products.find((product) => product.id === productId)?.stock ?? 0;
    if (!item) return;
    const quantity = Math.min(available, Math.max(1, item.quantity + delta));
    if (quantity !== item.quantity) invalidateDiscountApproval();
    setItems((current) => current.map((entry) => entry.productId === productId ? { ...entry, quantity } : entry));
  }
  function clearInvoice() {
    setItems([]); setCustomerId(""); setDiscountAmount(0); invalidateDiscountApproval(); setWarranty(""); setNotes(""); setError("");
  }
  function startPayment() {
    if (!items.length) return;
    if (invalidDiscount || !isDiscountApproved) { setError("يجب اعتماد الخصم الصحيح من المدير قبل المتابعة."); return; }
    setPayments([newPayment(total)]); setError(""); setPaymentStep(true);
  }
  async function handleApproveDiscount(username: string, password: string) {
    try {
      const approval = await approveDiscount(username, password, discountAmount, subtotal);
      setApprovedDiscountAmount(discountAmount); setDiscountApprovalToken(approval.approval_token); setDiscountError(""); setDiscountModalOpen(false);
    } catch (approvalError) { setDiscountError(approvalError instanceof Error ? approvalError.message : "تعذر اعتماد الخصم."); }
  }
  async function handleCreateCustomer(name: string, phoneNumber: string) {
    setCustomerSaving(true);
    try {
      const customer = await createCustomer({ name, phoneNumber });
      setCustomers((current) => [...current, customer]); setCustomerId(customer.id); setCustomerModalOpen(false);
    } catch (createError) { setError(createError instanceof Error ? createError.message : "تعذر إنشاء العميل."); }
    finally { setCustomerSaving(false); }
  }
  async function handleIssueInvoice() {
    if (!user || issuing) return;
    setIssuing(true);
    try {
      const bill = await issueInvoice({ sellerId: user.id, customerId: customerId || null, items, payments: payments.map((payment): Payment => ({ method: payment.method, amount: Number(payment.amount) || 0 })), discountAmount, discountApprovalToken, warranty, notes });
      navigate("/Bills", { state: { issuedInvoiceNumber: bill.id } });
    } catch (issueError) {
      setError(issueError instanceof Error ? issueError.message : "تعذر إصدار الفاتورة.");
      try { setProducts(await getProducts()); } catch { /* Keep the original API error visible. */ }
    } finally { setIssuing(false); }
  }

  return (
    <main className="page pos-page" dir="rtl">
      <header className="pos-heading"><div><p className="pos-eyebrow">نقطة البيع</p><h1>فاتورة جديدة</h1><p>ابحث عن المنتجات وأضفها إلى الفاتورة.</p></div><button className="pos-back-button" type="button" onClick={() => navigate("/Bills")}>العودة للفواتير</button></header>
      {loading ? <div className="page-state">جارٍ تحميل المنتجات والعملاء…</div> : error && !products.length ? <div className="page-state error" role="alert">{error}</div> : (
        <div className="pos-columns">
          <SearchForm products={matchingProducts} search={search} selectedQuantities={selectedQuantities} onSearchChange={setSearch} onAddProduct={addProduct} />
          <Purchase items={items} products={products} customers={customers} customerId={customerId} warranty={warranty} notes={notes} subtotal={subtotal} total={total} discountAmount={discountAmount} isDiscountApproved={isDiscountApproved} invalidDiscount={invalidDiscount} error={error} onCustomerChange={setCustomerId} onCreateCustomer={() => setCustomerModalOpen(true)} onWarrantyChange={setWarranty} onNotesChange={setNotes} onDiscountChange={(amount) => { setDiscountAmount(Math.round(amount * 100) / 100); invalidateDiscountApproval(); }} onRequestDiscountApproval={() => { setDiscountError(""); setDiscountModalOpen(true); }} onQuantityChange={changeQuantity} onRemoveLine={(id) => { setItems((current) => current.filter((item) => item.productId !== id)); invalidateDiscountApproval(); }} onClearInvoice={clearInvoice} onContinueToPayment={startPayment} />
        </div>
      )}
      {discountModalOpen && <DiscountApprovalDialog discountAmount={discountAmount} error={discountError} onApprove={handleApproveDiscount} onClose={() => setDiscountModalOpen(false)} />}
      {paymentStep && <PaymentDialog total={total} paid={paid} remaining={remaining} payments={payments} invalidPayments={invalidPayments} error={error} isIssuing={issuing} onAddPayment={() => setPayments((current) => [...current, newPayment()])} onUpdatePayment={(id, updates) => setPayments((current) => current.map((payment) => payment.id === id ? { ...payment, ...updates } : payment))} onRemovePayment={(id) => setPayments((current) => current.filter((payment) => payment.id !== id))} onClose={() => { setPaymentStep(false); setError(""); }} onIssue={handleIssueInvoice} />}
      {customerModalOpen && <CustomerQuickCreate saving={customerSaving} onClose={() => setCustomerModalOpen(false)} onSave={handleCreateCustomer} />}
    </main>
  );
}

function CustomerQuickCreate({ saving, onClose, onSave }: { saving: boolean; onClose: () => void; onSave: (name: string, phone: string) => void }) {
  const [name, setName] = useState(""); const [phone, setPhone] = useState("");
  return <div className="payment-overlay" role="presentation"><form className="payment-dialog discount-approval-form" dir="rtl" onSubmit={(event) => { event.preventDefault(); onSave(name.trim(), phone.trim()); }}><h2>إضافة عميل</h2><label className="invoice-field"><span>اسم العميل</span><input autoFocus required value={name} onChange={(event) => setName(event.target.value)} /></label><label className="invoice-field"><span>رقم الهاتف</span><input required value={phone} onChange={(event) => setPhone(event.target.value)} /></label><footer className="payment-actions"><button type="button" className="payment-back-button" onClick={onClose}>إلغاء</button><button className="checkout-button" disabled={saving} type="submit">{saving ? "جارٍ الحفظ…" : "حفظ العميل"}</button></footer></form></div>;
}
