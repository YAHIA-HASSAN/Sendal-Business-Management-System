import type {
  BillRecord,
  CashDrawerRecord,
  Category,
  Customer,
  InvoiceLine,
  InvoiceSummary,
  Payment,
  Product,
  User,
} from "../data/invoiceStore";

export type ApiUser = User & {
  start_date?: string;
  salary?: number;
  mobile_number?: string;
};
export type ProductInput = {
  name: string;
  code: string;
  category: string;
  stock: number;
  warranty: string;
  selling_price: number;
  buying_price: number;
  user_id: string;
};
export type UserInput = {
  name: string;
  username: string;
  password: string;
  role: "seller" | "admin";
  start_date: string;
  salary: number;
  mobile_number: string;
};
type ApiProduct = {
  id: string;
  name: string;
  code: string;
  active: boolean;
  category: string;
  stock: number;
  warranty: string;
};
type ApiPrice = {
  id: string;
  product_id: string;
  selling_price_per_each: number;
  datetime_of_price_update: string;
  user_id: string;
};
type ApiCustomer = { id: string; name: string; phone_number: string };
type ApiBill = {
  id: string;
  issue_datetime: string;
  status: BillRecord["status"];
  seller_id: string;
  buyer_id: string | null;
  notes: string;
  amount: number;
  discount_amount: number;
};
type ApiPayment = {
  id: string;
  amount: number;
  payment_method: string;
  datetime: string;
  bill_id: string;
};
type ApiDrawer = {
  id: string;
  balance: number;
  last_cash_movement: string | null;
};

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`/api${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  const text = await response.text();
  const data = text ? JSON.parse(text) : undefined;
  if (!response.ok)
    throw new Error(data?.message ?? `تعذر تنفيذ الطلب (${response.status}).`);
  return data as T;
}
const json = (method: string, data?: unknown): RequestInit => ({
  method,
  ...(data === undefined ? {} : { body: JSON.stringify(data) }),
});

export function mockLogin(username: string, password: string) {
  return request<{ token: string; user: ApiUser }>(
    "/auth/login",
    json("POST", { username, password }),
  );
}
export async function approveDiscount(
  username: string,
  password: string,
  amount: number,
  subtotal: number,
) {
  return request<{ approval_token: string }>(
    "/auth/approve-discount",
    json("POST", { username, password, amount, subtotal }),
  );
}
export async function getInventoryProducts(): Promise<Product[]> {
  const [products, prices, costs] = await Promise.all([
    request<ApiProduct[]>("/products"),
    request<ApiPrice[]>("/sellingPriceHistory"),
    request<
      Array<{
        product_id: string;
        buying_price_per_each: number;
        datetime_of_price_update: string;
      }>
    >("/buyingPriceHistory"),
  ]);
  return products.map((product) => {
    const latest = prices
      .filter((price) => price.product_id === product.id)
      .sort((a, b) =>
        b.datetime_of_price_update.localeCompare(a.datetime_of_price_update),
      )[0];
    const latestCost = costs
      .filter((price) => price.product_id === product.id)
      .sort((a, b) =>
        b.datetime_of_price_update.localeCompare(a.datetime_of_price_update),
      )[0];
    return {
      id: product.id,
      name: product.name,
      code: product.code,
      categoryId: product.category,
      stock: product.stock,
      active: product.active,
      unitPrice: latest?.selling_price_per_each ?? 0,
      buyingPrice: latestCost?.buying_price_per_each ?? 0,
      warranty: product.warranty,
    };
  });
}
export async function getProducts(): Promise<Product[]> {
  return (await getInventoryProducts()).filter((product) => product.active);
}
export async function getCustomers(): Promise<Customer[]> {
  return (await request<ApiCustomer[]>("/customers")).map((customer) => ({
    id: customer.id,
    name: customer.name,
    phoneNumber: customer.phone_number,
  }));
}
export async function createCustomer(
  input: Omit<Customer, "id">,
): Promise<Customer> {
  const customer = await request<ApiCustomer>(
    "/customers",
    json("POST", { name: input.name, phone_number: input.phoneNumber }),
  );
  return {
    id: customer.id,
    name: customer.name,
    phoneNumber: customer.phone_number,
  };
}
export async function updateCustomer(customer: Customer): Promise<Customer> {
  const result = await request<ApiCustomer>(
    `/customers/${encodeURIComponent(customer.id)}`,
    json("PATCH", { name: customer.name, phone_number: customer.phoneNumber }),
  );
  return { id: result.id, name: result.name, phoneNumber: result.phone_number };
}
export async function deleteCustomer(id: string) {
  return request(`/customers/${encodeURIComponent(id)}`, json("DELETE"));
}
export async function getCategories(): Promise<Category[]> {
  return (await request<Array<{ name: string }>>("/categories")).map(
    ({ name }) => ({ id: name, name }),
  );
}
export async function createCategory(name: string): Promise<Category> {
  const category = await request<{ name: string }>(
    "/categories",
    json("POST", { name }),
  );
  return { id: category.name, name: category.name };
}
export async function getUsers(): Promise<ApiUser[]> {
  return request<ApiUser[]>("/users");
}
export async function createUser(user: UserInput): Promise<ApiUser> {
  return request<ApiUser>("/users", json("POST", user));
}
export async function updateUser(
  id: string,
  input: Partial<UserInput>,
): Promise<ApiUser> {
  return request<ApiUser>(
    `/users/${encodeURIComponent(id)}`,
    json("PATCH", input),
  );
}
export async function deleteUser(id: string) {
  return request(`/users/${encodeURIComponent(id)}`, json("DELETE"));
}
export async function createProduct(input: ProductInput): Promise<void> {
  await request<ApiProduct>("/inventory/products", json("POST", input));
}
export async function updateProduct(
  id: string,
  input: Partial<ProductInput> & { active?: boolean; stock_delta?: number },
): Promise<void> {
  await request<ApiProduct>(
    `/inventory/products/${encodeURIComponent(id)}`,
    json("PATCH", input),
  );
}
export async function getCashDrawer(): Promise<CashDrawerRecord> {
  const drawers = await request<ApiDrawer[]>("/cashDrawers");
  const drawer = drawers[0] ?? {
    id: "drawer-main",
    balance: 0,
    last_cash_movement: null,
  };
  return {
    id: drawer.id,
    balance: drawer.balance,
    lastUpdate: drawer.last_cash_movement,
  };
}
export async function getInvoices(
  customerId?: string,
): Promise<InvoiceSummary[]> {
  const [bills, customers, payments] = await Promise.all([
    request<ApiBill[]>("/bills?_sort=issue_datetime&_order=desc"),
    request<ApiCustomer[]>("/customers"),
    request<ApiPayment[]>("/paymentHistory"),
  ]);
  return bills
    .filter((bill) => customerId === undefined || bill.buyer_id === customerId)
    .map((bill) => {
      const paid = payments
        .filter((payment) => payment.bill_id === bill.id)
        .reduce((sum, payment) => sum + payment.amount, 0);
      return {
        id: bill.id,
        number: Number(String(bill.id).match(/\d+$/)?.[0] ?? 0),
        issueDate: bill.issue_datetime.slice(0, 10),
        amount: bill.amount,
        discountAmount: bill.discount_amount,
        customerId: bill.buyer_id,
        customerName:
          customers.find((customer) => customer.id === bill.buyer_id)?.name ??
          "عميل نقدي",
        paid,
        remaining: Math.max(0, bill.amount - paid),
        status: bill.status,
      };
    });
}
export async function getBillDetails(billId: string) {
  const [bill, items, payments, products] = await Promise.all([
    request<ApiBill>(`/bills/${encodeURIComponent(billId)}`),
    request<
      Array<{
        id: string;
        product_id: string;
        bill_id: string;
        quantity: number;
        price_per_each: number;
      }>
    >(`/soldItems?bill_id=${encodeURIComponent(billId)}`),
    request<ApiPayment[]>(
      `/paymentHistory?bill_id=${encodeURIComponent(billId)}`,
    ),
    request<ApiProduct[]>("/products"),
  ]);
  return {
    bill,
    items: items.map((item) => ({
      id: item.id,
      name:
        products.find((product) => product.id === item.product_id)?.name ??
        "منتج",
      quantity: item.quantity,
      price: item.price_per_each,
    })),
    payments,
  };
}
export async function issueInvoice(input: {
  sellerId: string;
  customerId: string | null;
  items: InvoiceLine[];
  payments: Payment[];
  discountAmount: number;
  discountApprovalToken?: string;
  warranty: string;
  notes: string;
}) {
  const notes = [
    input.warranty.trim() ? `الضمان: ${input.warranty.trim()}` : "",
    input.notes.trim(),
  ]
    .filter(Boolean)
    .join("\n");
  return request<BillRecord>(
    "/bills/issue",
    json("POST", {
      seller_id: input.sellerId,
      buyer_id: input.customerId,
      items: input.items.map((item) => ({
        product_id: item.productId,
        quantity: item.quantity,
        price_per_each: item.unitPrice,
      })),
      payments: input.payments.map((payment) => ({
        payment_method: payment.method,
        amount: payment.amount,
      })),
      discount_amount: input.discountAmount,
      discount_approval_token: input.discountApprovalToken,
      notes,
    }),
  );
}
export async function recordBillPayment(
  billId: string,
  input: { amount: number; paymentMethod: string; userId: string },
) {
  return request(
    `/bills/${encodeURIComponent(billId)}/payments`,
    json("POST", {
      amount: input.amount,
      payment_method: input.paymentMethod,
      user_id: input.userId,
    }),
  );
}
export async function getDashboardData() {
  const [invoices, products, cashDrawer] = await Promise.all([
    getInvoices(),
    getProducts(),
    getCashDrawer(),
  ]);
  return {
    invoices,
    products,
    cashDrawer,
    revenue: invoices.reduce((sum, invoice) => sum + invoice.paid, 0),
    outstanding: invoices.reduce((sum, invoice) => sum + invoice.remaining, 0),
    lowStock: products.filter((product) => product.stock <= 5),
  };
}
