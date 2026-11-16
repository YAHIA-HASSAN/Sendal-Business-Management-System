import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import SearchForm from "../components/SearchForm/SearchForm";
import Purchase from "../components/Purchase/Purchase";
import DiscountApprovalDialog from "../components/POS/DiscountApprovalDialog";
import PaymentDialog from "../components/POS/PaymentDialog";
import type { PaymentDraft } from "../components/POS/types";
import { getCustomers, getProducts, roundMoney, saveInvoice, type Customer, type InvoiceLine, type Payment, type Product } from "../data/invoiceStore";
import "./POS.css";

const demoAdminCredentials = { username: "admin", password: "demo123" };

function createPayment(amount = 0): PaymentDraft {
  return { id: `${Date.now()}-${Math.random()}`, method: "cash", amount: String(amount) };
}

export default function POS() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>(getProducts);
  const [customers] = useState<Customer[]>(getCustomers);
  const [search, setSearch] = useState("");
  const [items, setItems] = useState<InvoiceLine[]>([]);
  const [paymentStep, setPaymentStep] = useState(false);
  const [payments, setPayments] = useState<PaymentDraft[]>([]);
  const [error, setError] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [discountAmount, setDiscountAmount] = useState(0);
  const [approvedDiscountAmount, setApprovedDiscountAmount] = useState<number | null>(null);
  const [warranty, setWarranty] = useState("");
  const [notes, setNotes] = useState("");
  const [discountModalOpen, setDiscountModalOpen] = useState(false);
  const [discountError, setDiscountError] = useState("");

  const subtotal = roundMoney(items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0));
  const total = roundMoney(Math.max(0, subtotal - discountAmount));
  const paid = roundMoney(payments.reduce((sum, payment) => sum + (Number(payment.amount) || 0), 0));
  const remaining = roundMoney(Math.max(0, total - paid));
  const invalidDiscount = discountAmount < 0 || discountAmount > subtotal;
  const invalidPayments = payments.some((payment) => !Number.isFinite(Number(payment.amount)) || Number(payment.amount) < 0);
  const isDiscountApproved = discountAmount === 0 || approvedDiscountAmount === discountAmount;
  const selectedQuantities = useMemo(
    () => Object.fromEntries(items.map((item) => [item.productId, item.quantity])),
    [items],
  );
  const matchingProducts = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("ar");
    return products.filter((product) =>
      product.stock > 0 && (!query || `${product.name} ${product.code}`.toLocaleLowerCase("ar").includes(query)),
    );
  }, [products, search]);

  function addProduct(product: Product) {
    setError("");
    const selectedItem = items.find((item) => item.productId === product.id);
    if (selectedItem && selectedItem.quantity >= product.stock) {
      setError(`المتاح من ${product.name} هو ${product.stock} فقط.`);
      return;
    }
    setApprovedDiscountAmount(null);
    setItems((current) => {
      const existing = current.find((item) => item.productId === product.id);
      if (existing) return current.map((item) => item.productId === product.id ? { ...item, quantity: Math.min(product.stock, item.quantity + 1) } : item);
      return [...current, { productId: product.id, name: product.name, code: product.code, unitPrice: product.unitPrice, quantity: 1 }];
    });
  }

  function changeQuantity(productId: string, delta: number) {
    setError("");
    const selectedItem = items.find((item) => item.productId === productId);
    const available = products.find((product) => product.id === productId)?.stock ?? selectedItem?.quantity ?? 0;
    const nextQuantity = selectedItem ? Math.min(available, Math.max(1, selectedItem.quantity + delta)) : 0;
    if (selectedItem && nextQuantity !== selectedItem.quantity) setApprovedDiscountAmount(null);
    setItems((current) => current.map((item) => item.productId === productId ? { ...item, quantity: nextQuantity } : item));
  }

  function removeLine(productId: string) {
    setItems((current) => current.filter((item) => item.productId !== productId));
    setApprovedDiscountAmount(null);
    setError("");
  }

  function clearInvoice() {
    setItems([]);
    setCustomerId("");
    setDiscountAmount(0);
    setApprovedDiscountAmount(null);
    setWarranty("");
    setNotes("");
    setError("");
  }

  function startPayment() {
    if (!items.length) return;
    if (invalidDiscount) {
      setError("الخصم يجب أن يكون بين صفر وإجمالي البنود.");
      return;
    }
    if (!isDiscountApproved) {
      setError("يجب اعتماد مبلغ الخصم من المدير قبل المتابعة.");
      return;
    }
    setPayments([createPayment(total)]);
    setError("");
    setPaymentStep(true);
  }

  function updatePayment(paymentId: string, updates: Partial<PaymentDraft>) {
    setPayments((current) => current.map((payment) => payment.id === paymentId ? { ...payment, ...updates } : payment));
    setError("");
  }

  function issueInvoice() {
    try {
      const bill = saveInvoice({
        items,
        payments: payments.map((payment): Payment => ({ ...payment, amount: Number(payment.amount) || 0 })),
        discountAmount,
        discountApproved: isDiscountApproved,
        warranty,
        notes,
        customerId: customerId || null,
      });
      navigate("/Bills", { state: { issuedInvoiceNumber: Number(bill.id) } });
    } catch (issueError) {
      setError(issueError instanceof Error ? issueError.message : "تعذر إصدار الفاتورة. حاول مرة أخرى.");
      setProducts(getProducts());
    }
  }

  function approveDiscount(username: string, password: string) {
    if (username.trim() === demoAdminCredentials.username && password === demoAdminCredentials.password) {
      setApprovedDiscountAmount(discountAmount);
      setDiscountError("");
      setDiscountModalOpen(false);
      return;
    }
    setDiscountError("بيانات المدير غير صحيحة في الحساب التجريبي.");
  }

  function changeDiscount(amount: number) {
    setDiscountAmount(roundMoney(amount));
    setApprovedDiscountAmount(null);
    setError("");
  }

  function changeCustomer(nextCustomerId: string) {
    setCustomerId(nextCustomerId);
    setApprovedDiscountAmount(null);
  }

  return (
    <main className="page pos-page" dir="rtl">
      <header className="pos-heading">
        <div>
          <p className="pos-eyebrow">نقطة البيع</p>
          <h1>فاتورة جديدة</h1>
          <p>ابحث عن المنتجات وأضفها إلى الفاتورة.</p>
        </div>
        <button className="pos-back-button" type="button" onClick={() => navigate("/Bills")}>العودة للفواتير</button>
      </header>

      <div className="pos-columns">
        <SearchForm
          products={matchingProducts}
          search={search}
          selectedQuantities={selectedQuantities}
          onSearchChange={setSearch}
          onAddProduct={addProduct}
        />
        <Purchase
          items={items}
          products={products}
          customers={customers}
          customerId={customerId}
          warranty={warranty}
          notes={notes}
          subtotal={subtotal}
          total={total}
          discountAmount={discountAmount}
          isDiscountApproved={isDiscountApproved}
          invalidDiscount={invalidDiscount}
          error={error}
          onCustomerChange={changeCustomer}
          onWarrantyChange={setWarranty}
          onNotesChange={setNotes}
          onDiscountChange={changeDiscount}
          onRequestDiscountApproval={() => { setDiscountError(""); setDiscountModalOpen(true); }}
          onQuantityChange={changeQuantity}
          onRemoveLine={removeLine}
          onClearInvoice={clearInvoice}
          onContinueToPayment={startPayment}
        />
      </div>

      {discountModalOpen && (
        <DiscountApprovalDialog
          discountAmount={discountAmount}
          error={discountError}
          onApprove={approveDiscount}
          onClose={() => setDiscountModalOpen(false)}
        />
      )}
      {paymentStep && (
        <PaymentDialog
          total={total}
          paid={paid}
          remaining={remaining}
          payments={payments}
          invalidPayments={invalidPayments}
          error={error}
          onAddPayment={() => setPayments((current) => [...current, createPayment()])}
          onUpdatePayment={updatePayment}
          onRemovePayment={(paymentId) => setPayments((current) => current.filter((payment) => payment.id !== paymentId))}
          onClose={() => setPaymentStep(false)}
          onIssue={issueInvoice}
        />
      )}
    </main>
  );
}
