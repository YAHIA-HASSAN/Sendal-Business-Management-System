export type User = {
  id: string;
  name: string;
  username: string;
  role: "seller" | "admin";
};

export type Customer = {
  id: string;
  name: string;
  phoneNumber: string;
};

export type Category = { id: string; name: string };

export type ProductRecord = {
  id: string;
  name: string;
  code: string;
  categoryId: string;
  stock: number;
  active: boolean;
};

export type SellingPriceHistory = {
  id: string;
  productId: string;
  datetimeOfPriceUpdate: string;
  sellingPricePerEach: number;
};

export type Product = ProductRecord & { unitPrice: number };

export type InvoiceLine = {
  productId: string;
  name: string;
  code: string;
  unitPrice: number;
  quantity: number;
};

export type Payment = {
  id: string;
  method: string;
  amount: number;
};

export type BillRecord = {
  id: string;
  amount: number;
  discountAmount: number;
  warranty: string | null;
  notes: string | null;
  issueDatetime: string;
  status: "paid" | "partial" | "unpaid";
  sellerId: string;
  customerId: string | null;
};

export type SoldItemRecord = {
  id: string;
  billId: string;
  productId: string;
  quantity: number;
  pricePerEach: number;
};

export type PaymentHistoryRecord = {
  id: string;
  billId: string;
  datetime: string;
  amount: number;
  paymentMethod: string;
};

export type CashMovementRecord = {
  id: string;
  billId: string | null;
  amount: number;
  datetime: string;
  type: "deposit" | "withdrawal";
  direction: string;
};

export type CashDrawerRecord = {
  id: string;
  balance: number;
  lastUpdate: string | null;
};

type StoreState = {
  users: User[];
  customers: Customer[];
  categories: Category[];
  products: ProductRecord[];
  sellingPriceHistory: SellingPriceHistory[];
  bills: BillRecord[];
  soldItems: SoldItemRecord[];
  paymentHistory: PaymentHistoryRecord[];
  cashMovements: CashMovementRecord[];
  cashDrawer: CashDrawerRecord;
  nextBillId: number;
};

export type InvoiceSummary = {
  id: string;
  number: number;
  issueDate: string;
  amount: number;
  discountAmount: number;
  customerName: string;
  paid: number;
  remaining: number;
  status: BillRecord["status"];
};

export type CreateInvoiceInput = {
  items: InvoiceLine[];
  payments: Payment[];
  discountAmount: number;
  discountApproved: boolean;
  warranty: string;
  notes: string;
  customerId: string | null;
};

const STORAGE_KEY = "sendal.frontend-demo.v2";
const LEGACY_STORAGE_KEY = "sendal.frontend-demo.v1";

export function roundMoney(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

const initialState: StoreState = {
  users: [
    { id: "user-demo", name: "نوح", username: "noah", role: "seller" },
    { id: "admin-demo", name: "مدير تجريبي", username: "admin", role: "admin" },
  ],
  customers: [
    { id: "customer-001", name: "أحمد محمد", phoneNumber: "01012345678" },
    { id: "customer-002", name: "محمود علي", phoneNumber: "01123456789" },
    { id: "customer-003", name: "سارة حسن", phoneNumber: "01234567890" },
  ],
  categories: [
    { id: "category-accessories", name: "إكسسوارات" },
    { id: "category-parts", name: "قطع غيار" },
    { id: "category-audio", name: "صوتيات" },
  ],
  products: [
    { id: "product-001", name: "شاشة ايفون 13", code: "SCR-IP13", categoryId: "category-parts", stock: 8, active: true },
    { id: "product-002", name: "شاحن سريع Type-C", code: "CHR-TC20", categoryId: "category-accessories", stock: 15, active: true },
    { id: "product-003", name: "سماعة بلوتوث", code: "AUD-BT01", categoryId: "category-audio", stock: 9, active: true },
    { id: "product-004", name: "جراب ايفون 13", code: "CAS-IP13", categoryId: "category-accessories", stock: 22, active: true },
    { id: "product-005", name: "كابل شحن Type-C", code: "CBL-TC01", categoryId: "category-accessories", stock: 30, active: true },
    { id: "product-006", name: "بطارية سامسونج A52", code: "BAT-SA52", categoryId: "category-parts", stock: 4, active: true },
    { id: "product-007", name: "لاصقة حماية شاشة", code: "GLS-UNI1", categoryId: "category-accessories", stock: 40, active: true },
    { id: "product-008", name: "سماعة سلكية", code: "AUD-WR01", categoryId: "category-audio", stock: 0, active: true },
  ],
  sellingPriceHistory: [
    { id: "price-001", productId: "product-001", datetimeOfPriceUpdate: "2026-11-01T09:00:00.000Z", sellingPricePerEach: 1250 },
    { id: "price-002", productId: "product-002", datetimeOfPriceUpdate: "2026-11-01T09:00:00.000Z", sellingPricePerEach: 320 },
    { id: "price-003", productId: "product-003", datetimeOfPriceUpdate: "2026-11-01T09:00:00.000Z", sellingPricePerEach: 475 },
    { id: "price-004", productId: "product-004", datetimeOfPriceUpdate: "2026-11-01T09:00:00.000Z", sellingPricePerEach: 180 },
    { id: "price-005", productId: "product-005", datetimeOfPriceUpdate: "2026-11-01T09:00:00.000Z", sellingPricePerEach: 95 },
    { id: "price-006", productId: "product-006", datetimeOfPriceUpdate: "2026-11-01T09:00:00.000Z", sellingPricePerEach: 690 },
    { id: "price-007", productId: "product-007", datetimeOfPriceUpdate: "2026-11-01T09:00:00.000Z", sellingPricePerEach: 75 },
    { id: "price-008", productId: "product-008", datetimeOfPriceUpdate: "2026-11-01T09:00:00.000Z", sellingPricePerEach: 140 },
  ],
  bills: [],
  soldItems: [],
  paymentHistory: [],
  cashMovements: [],
  cashDrawer: { id: "drawer-main", balance: 0, lastUpdate: null },
  nextBillId: 1,
};

function currentPrice(state: StoreState, productId: string): number {
  return state.sellingPriceHistory
    .filter((entry) => entry.productId === productId)
    .sort((left, right) => right.datetimeOfPriceUpdate.localeCompare(left.datetimeOfPriceUpdate))[0]?.sellingPricePerEach ?? 0;
}

function cashMovementEffect(movement: Pick<CashMovementRecord, "amount" | "type">): number {
  return movement.type === "deposit" ? movement.amount : -movement.amount;
}

function migrateLegacyState(): StoreState | null {
  try {
    const stored = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (!stored) return null;
    const parsed = JSON.parse(stored) as {
      products?: Array<{ id: string; name: string; sku: string; unitPrice: number; stock: number }>;
      invoices?: Array<{ id: string; number: number; issueDate: string; items?: Array<{ productId: string; unitPrice: number; quantity: number }>; total: number; paid: number; remaining: number; status: BillRecord["status"]; payments?: Payment[] }>;
      nextInvoiceNumber?: number;
    };
    if (!Array.isArray(parsed.products) || !Array.isArray(parsed.invoices)) return null;

    const state = structuredClone(initialState);
    state.products = parsed.products.map((product) => ({
      id: product.id,
      name: product.name,
      code: product.sku,
      categoryId: "category-accessories",
      stock: product.stock,
      active: true,
    }));
    state.sellingPriceHistory = parsed.products.map((product, index) => ({
      id: `migrated-price-${index + 1}`,
      productId: product.id,
      datetimeOfPriceUpdate: "2026-11-01T09:00:00.000Z",
      sellingPricePerEach: product.unitPrice,
    }));
    state.bills = parsed.invoices.map((invoice) => ({
      id: String(invoice.number),
      amount: invoice.total,
      discountAmount: 0,
      warranty: null,
      notes: null,
      issueDatetime: `${invoice.issueDate}T00:00:00.000Z`,
      status: invoice.status,
      sellerId: "user-demo",
      customerId: null,
    }));
    state.soldItems = parsed.invoices.flatMap((invoice) => (invoice.items ?? []).map((item, index) => ({
      id: `migrated-item-${invoice.number}-${index + 1}`,
      billId: String(invoice.number),
      productId: item.productId,
      quantity: item.quantity,
      pricePerEach: item.unitPrice,
    })));
    state.paymentHistory = parsed.invoices.flatMap((invoice) => {
      const payments = (invoice.payments ?? []).filter((payment) => payment.amount > 0).map((payment, index) => ({
        id: `migrated-payment-${invoice.number}-${index + 1}`,
        billId: String(invoice.number),
        datetime: `${invoice.issueDate}T00:00:00.000Z`,
        amount: payment.amount,
        paymentMethod: payment.method,
      }));
      if (!payments.length && invoice.paid > 0) {
        payments.push({ id: `migrated-payment-${invoice.number}-legacy`, billId: String(invoice.number), datetime: `${invoice.issueDate}T00:00:00.000Z`, amount: invoice.paid, paymentMethod: "legacy" });
      }
      return payments;
    });
    state.cashMovements = state.paymentHistory.filter((payment) => payment.paymentMethod === "cash").map((payment, index) => ({
      id: `migrated-cash-${index + 1}`,
      billId: payment.billId,
      amount: payment.amount,
      datetime: payment.datetime,
      type: "deposit",
      direction: "sale_payment",
    }));
    state.cashDrawer.balance = roundMoney(state.cashMovements.reduce((sum, movement) => sum + cashMovementEffect(movement), 0));
    state.cashDrawer.lastUpdate = state.cashMovements.at(-1)?.datetime ?? null;
    state.nextBillId = Math.max(parsed.nextInvoiceNumber ?? 1, ...parsed.invoices.map((invoice) => invoice.number + 1), 1);
    return state;
  } catch {
    return null;
  }
}

function isStoreState(value: unknown): value is StoreState {
  return typeof value === "object" && value !== null &&
    "products" in value && Array.isArray(value.products) &&
    "bills" in value && Array.isArray(value.bills) &&
    "paymentHistory" in value && Array.isArray(value.paymentHistory) &&
    "cashDrawer" in value && typeof value.cashDrawer === "object" && value.cashDrawer !== null &&
    "nextBillId" in value && typeof value.nextBillId === "number";
}

function readState(): StoreState {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed: unknown = JSON.parse(stored);
      if (isStoreState(parsed)) return parsed;
    }
    const migrated = migrateLegacyState();
    if (migrated) {
      writeState(migrated);
      return migrated;
    }
  } catch {
    // Use a fresh demo data set if local storage is unavailable or malformed.
  }
  return initialState;
}

function writeState(state: StoreState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function getProducts(): Product[] {
  const state = readState();
  return state.products
    .filter((product) => product.active)
    .map((product) => ({ ...product, unitPrice: currentPrice(state, product.id) }));
}

export function getCustomers(): Customer[] {
  return readState().customers;
}

export function getInvoices(): InvoiceSummary[] {
  const state = readState();
  return state.bills
    .map((bill) => {
      const paid = roundMoney(state.paymentHistory.filter((payment) => payment.billId === bill.id).reduce((sum, payment) => sum + payment.amount, 0));
      return {
        id: bill.id,
        number: Number(bill.id),
        issueDate: bill.issueDatetime.slice(0, 10),
        amount: bill.amount,
        discountAmount: bill.discountAmount,
        customerName: state.customers.find((customer) => customer.id === bill.customerId)?.name ?? "عميل نقدي",
        paid,
        remaining: Math.max(0, bill.amount - paid),
        status: bill.status,
      };
    })
    .sort((left, right) => right.number - left.number);
}

export function getCashDrawer(): CashDrawerRecord {
  return readState().cashDrawer;
}

export function recordCashMovement(input: Omit<CashMovementRecord, "id" | "datetime"> & { datetime?: string }): CashMovementRecord {
  if (!Number.isFinite(input.amount) || input.amount <= 0) throw new Error("قيمة حركة الخزنة يجب أن تكون أكبر من صفر.");
  const state = readState();
  const movement: CashMovementRecord = {
    ...input,
    amount: roundMoney(input.amount),
    id: `cash-${Date.now()}-${state.cashMovements.length + 1}`,
    datetime: input.datetime ?? new Date().toISOString(),
  };
  writeState({
    ...state,
    cashMovements: [movement, ...state.cashMovements],
    cashDrawer: {
      ...state.cashDrawer,
      balance: roundMoney(state.cashDrawer.balance + cashMovementEffect(movement)),
      lastUpdate: movement.datetime,
    },
  });
  return movement;
}

export function saveInvoice(input: CreateInvoiceInput): BillRecord {
  const state = readState();
  const timestamp = new Date().toISOString();
  const discountAmount = roundMoney(Number(input.discountAmount) || 0);
  const subtotal = roundMoney(input.items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0));
  const amount = roundMoney(subtotal - discountAmount);
  const normalizedPayments = input.payments.map((payment) => ({ ...payment, amount: roundMoney(Number(payment.amount) || 0) }));
  const paid = roundMoney(normalizedPayments.reduce((sum, payment) => sum + payment.amount, 0));

  if (input.items.length === 0) throw new Error("أضف منتجًا واحدًا على الأقل قبل إصدار الفاتورة.");
  if (discountAmount < 0 || discountAmount > subtotal) throw new Error("الخصم يجب أن يكون بين صفر وإجمالي البنود.");
  if (discountAmount > 0 && !input.discountApproved) throw new Error("يجب اعتماد الخصم من المدير قبل إصدار الفاتورة.");
  if (normalizedPayments.some((payment) => payment.amount < 0) || paid > amount + 0.001) {
    throw new Error("إجمالي المدفوع لا يمكن أن يتجاوز صافي الفاتورة.");
  }
  if (input.customerId && !state.customers.some((customer) => customer.id === input.customerId)) {
    throw new Error("العميل المحدد غير موجود.");
  }

  const quantities = new Map<string, number>();
  for (const item of input.items) quantities.set(item.productId, (quantities.get(item.productId) ?? 0) + item.quantity);
  for (const [productId, quantity] of quantities) {
    const product = state.products.find((candidate) => candidate.id === productId && candidate.active);
    if (!product || quantity <= 0 || quantity > product.stock) {
      const name = input.items.find((item) => item.productId === productId)?.name ?? "المنتج";
      throw new Error(`الكمية المتاحة من ${name} لم تعد كافية.`);
    }
  }

  const billId = String(state.nextBillId);
  const remaining = Math.max(0, amount - paid);
  const bill: BillRecord = {
    id: billId,
    amount,
    discountAmount,
    warranty: input.warranty.trim() || null,
    notes: input.notes.trim() || null,
    issueDatetime: timestamp,
    status: remaining === 0 ? "paid" : paid === 0 ? "unpaid" : "partial",
    sellerId: state.users.find((user) => user.role === "seller")?.id ?? state.users[0]?.id ?? "user-demo",
    customerId: input.customerId,
  };

  const soldItems = input.items.map((item, index): SoldItemRecord => ({
    id: `${billId}-item-${index + 1}`,
    billId,
    productId: item.productId,
    quantity: item.quantity,
    pricePerEach: item.unitPrice,
  }));
  const payments = normalizedPayments.filter((payment) => payment.amount > 0).map((payment, index): PaymentHistoryRecord => ({
    id: `${billId}-payment-${index + 1}`,
    billId,
    datetime: timestamp,
    amount: payment.amount,
    paymentMethod: payment.method,
  }));
  const cashMovements = payments.filter((payment) => payment.paymentMethod === "cash").map((payment, index): CashMovementRecord => ({
    id: `${billId}-cash-${index + 1}`,
    billId,
    amount: payment.amount,
    datetime: payment.datetime,
    type: "deposit",
    direction: "sale_payment",
  }));
  const cashEffect = cashMovements.reduce((sum, movement) => sum + cashMovementEffect(movement), 0);

  writeState({
    ...state,
    products: state.products.map((product) => ({ ...product, stock: product.stock - (quantities.get(product.id) ?? 0) })),
    bills: [bill, ...state.bills],
    soldItems: [...soldItems, ...state.soldItems],
    paymentHistory: [...payments, ...state.paymentHistory],
    cashMovements: [...cashMovements, ...state.cashMovements],
    cashDrawer: { ...state.cashDrawer, balance: roundMoney(state.cashDrawer.balance + cashEffect), lastUpdate: cashMovements.length ? timestamp : state.cashDrawer.lastUpdate },
    nextBillId: state.nextBillId + 1,
  });

  return bill;
}

