import { createHash, randomUUID } from "node:crypto";
import { readFile, rename, writeFile } from "node:fs/promises";
import { createServer } from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";

const port = Number(process.env.MOCK_API_PORT ?? 3001);
const databasePath = process.env.MOCK_API_DB_PATH ? path.resolve(process.env.MOCK_API_DB_PATH) : fileURLToPath(new URL("./db.json", import.meta.url));
const collectionNames = new Set(["users", "customers", "categories", "products", "sellingPriceHistory", "buyingPriceHistory", "bills", "soldItems", "paymentHistory", "cashMovements", "stockMovements", "cashDrawers"]);
const discountApprovals = new Map();
const hashPassword = (password) => `sha256:${createHash("sha256").update(String(password ?? "")).digest("hex")}`;
const fail = (status, message) => Object.assign(new Error(message), { status });

async function readDb() { return JSON.parse(await readFile(databasePath, "utf8")); }
async function saveDb(db) {
  const tempPath = `${databasePath}.tmp`;
  await writeFile(tempPath, `${JSON.stringify(db, null, 2)}\n`, "utf8");
  await rename(tempPath, databasePath);
}
function reply(res, status, data) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8", "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS", "Access-Control-Allow-Headers": "Content-Type, Authorization" });
  res.end(data === undefined ? "" : JSON.stringify(data));
}
async function bodyOf(req) {
  let raw = "";
  for await (const chunk of req) { raw += chunk; if (raw.length > 1_000_000) throw fail(413, "حجم الطلب كبير جدًا."); }
  if (!raw) return {};
  try { return JSON.parse(raw); } catch { throw fail(400, "يجب إرسال بيانات JSON صالحة."); }
}
function filtered(records, params) {
  let result = records.filter((record) => [...params].every(([key, value]) => ["_sort", "_order", "_page", "_limit"].includes(key) || String(record[key] ?? "") === value));
  const sort = params.get("_sort");
  if (sort) result = [...result].sort((a, b) => String(a[sort] ?? "").localeCompare(String(b[sort] ?? ""), undefined, { numeric: true }) * (params.get("_order") === "desc" ? -1 : 1));
  const limit = Number(params.get("_limit"));
  if (limit > 0) { const page = Math.max(1, Number(params.get("_page")) || 1); result = result.slice((page - 1) * limit, page * limit); }
  return result;
}
function withoutSecret(user) { const { password_hashed: _secret, ...safeUser } = user; return safeUser; }
function nextBillId(db) { return `bill-${Math.max(1000, ...db.bills.map((bill) => Number(String(bill.id).match(/\d+$/)?.[0]) || 0)) + 1}`; }
function billPaid(db, billId) { return db.paymentHistory.filter((payment) => payment.bill_id === billId).reduce((sum, payment) => sum + Number(payment.amount), 0); }
function applyCash(db, payment, billId, userId, datetime) {
  if (payment.payment_method !== "cash") return;
  const movement = { id: `cash-${randomUUID()}`, date_time: datetime, amount: payment.amount, type: "in", reason: `دفعة نقدية للفاتورة ${billId}`, user_id: userId, bill_id: billId };
  db.cashMovements.push(movement);
  const drawer = db.cashDrawers[0];
  drawer.balance = Math.round((drawer.balance + payment.amount + Number.EPSILON) * 100) / 100;
  drawer.last_cash_movement = movement.id;
}

async function login(req, res) {
  if (req.method !== "POST") return reply(res, 405, { message: "Method not allowed" });
  const { username, password } = await bodyOf(req);
  const db = await readDb();
  const user = db.users.find((entry) => entry.username === username && entry.password_hashed == (password));
  if (!user) return reply(res, 401, { message: "اسم المستخدم أو كلمة المرور غير صحيحة." });
  return reply(res, 200, { token: `demo-${randomUUID()}`, user: withoutSecret(user) });
}

async function approveDiscount(req, res) {
  if (req.method !== "POST") return reply(res, 405, { message: "Method not allowed" });
  const { username, password, amount, subtotal } = await bodyOf(req);
  const db = await readDb();
  const admin = db.users.find((entry) => entry.username === username && entry.password_hashed === hashPassword(password) && entry.role === "admin");
  if (!admin) return reply(res, 401, { message: "بيانات المدير غير صحيحة." });
  if (!Number.isFinite(amount) || amount <= 0 || amount > subtotal) return reply(res, 400, { message: "مبلغ الخصم غير صالح." });
  const token = randomUUID();
  discountApprovals.set(token, { amount, subtotal, expiresAt: Date.now() + 10 * 60_000 });
  return reply(res, 200, { approval_token: token, approved_by: withoutSecret(admin) });
}

async function issueBill(req, res) {
  if (req.method !== "POST") return reply(res, 405, { message: "Method not allowed" });
  const input = await bodyOf(req);
  const db = await readDb();
  const seller = db.users.find((user) => user.id === input.seller_id);
  if (!seller) return reply(res, 400, { message: "البائع غير موجود." });
  if (input.buyer_id && !db.customers.some((customer) => customer.id === input.buyer_id)) return reply(res, 400, { message: "العميل غير موجود." });
  if (!Array.isArray(input.items) || input.items.length === 0) return reply(res, 400, { message: "يجب أن تحتوي الفاتورة على منتج واحد على الأقل." });
  const quantities = new Map();
  for (const item of input.items) {
    const product = db.products.find((entry) => entry.id === item.product_id && entry.active);
    if (!product || !Number.isInteger(item.quantity) || item.quantity <= 0) return reply(res, 400, { message: "بيانات أحد المنتجات أو كميته غير صالحة." });
    const available = product.stock - (quantities.get(product.id) ?? 0);
    if (item.quantity > available) return reply(res, 409, { message: `المخزون غير كافٍ للمنتج ${product.name}.` });
    const latestPrice = db.sellingPriceHistory.filter((price) => price.product_id === product.id).sort((a, b) => b.datetime_of_price_update.localeCompare(a.datetime_of_price_update))[0]?.selling_price_per_each;
    if (!Number.isFinite(item.price_per_each) || item.price_per_each !== latestPrice) return reply(res, 409, { message: `تغير سعر المنتج ${product.name}. حدّث الفاتورة قبل الإصدار.` });
    quantities.set(product.id, (quantities.get(product.id) ?? 0) + item.quantity);
  }
  const subtotal = input.items.reduce((sum, item) => sum + item.quantity * item.price_per_each, 0);
  const discount = Number(input.discount_amount ?? 0);
  if (!Number.isFinite(discount) || discount < 0 || discount > subtotal) return reply(res, 400, { message: "قيمة الخصم غير صالحة." });
  if (discount > 0) {
    const approval = discountApprovals.get(input.discount_approval_token);
    if (!approval || approval.expiresAt < Date.now() || approval.amount !== discount || approval.subtotal !== subtotal) return reply(res, 403, { message: "اعتماد المدير للخصم غير صالح أو منتهي." });
    discountApprovals.delete(input.discount_approval_token);
  }
  const total = Math.round((subtotal - discount + Number.EPSILON) * 100) / 100;
  const payments = Array.isArray(input.payments) ? input.payments : [];
  if (payments.some((payment) => !Number.isFinite(payment.amount) || payment.amount < 0 || !["cash", "wallet", "card", "bank"].includes(payment.payment_method))) return reply(res, 400, { message: "بيانات الدفعات غير صالحة." });
  const paid = payments.reduce((sum, payment) => sum + payment.amount, 0);
  if (paid > total + 0.001) return reply(res, 400, { message: "المدفوع لا يمكن أن يتجاوز صافي الفاتورة." });
  const id = nextBillId(db);
  const datetime = new Date().toISOString();
  const remaining = Math.max(0, total - paid);
  const bill = { id, issue_datetime: datetime, status: remaining === 0 ? "paid" : paid === 0 ? "unpaid" : "partial", seller_id: seller.id, buyer_id: input.buyer_id || null, notes: String(input.notes ?? ""), amount: total, discount_amount: discount };
  db.bills.unshift(bill);
  input.items.forEach((item, index) => {
    db.soldItems.push({ id: `${id}-item-${index + 1}`, product_id: item.product_id, bill_id: id, quantity: item.quantity, price_per_each: item.price_per_each });
    const product = db.products.find((entry) => entry.id === item.product_id);
    product.stock -= item.quantity;
    db.stockMovements.push({ id: `stock-${randomUUID()}`, type: "out", quantity: item.quantity, product_id: item.product_id, user_id: seller.id, bill_id: id });
  });
  payments.filter((payment) => payment.amount > 0).forEach((payment) => {
    const record = { id: `payment-${randomUUID()}`, amount: payment.amount, payment_method: payment.payment_method, datetime, bill_id: id };
    db.paymentHistory.push(record);
    applyCash(db, record, id, seller.id, datetime);
  });
  await saveDb(db);
  return reply(res, 201, bill);
}

async function recordPayment(req, res, billId) {
  if (req.method !== "POST") return reply(res, 405, { message: "Method not allowed" });
  const { amount, payment_method, user_id } = await bodyOf(req);
  const db = await readDb();
  const bill = db.bills.find((entry) => entry.id === billId);
  const user = db.users.find((entry) => entry.id === user_id);
  if (!bill || !user) return reply(res, 404, { message: "الفاتورة أو المستخدم غير موجود." });
  if (!Number.isFinite(amount) || amount <= 0 || !["cash", "wallet", "card", "bank"].includes(payment_method)) return reply(res, 400, { message: "بيانات الدفعة غير صالحة." });
  if (amount > bill.amount - billPaid(db, billId) + 0.001) return reply(res, 400, { message: "الدفعة تتجاوز المبلغ المتبقي." });
  const datetime = new Date().toISOString();
  const payment = { id: `payment-${randomUUID()}`, amount, payment_method, datetime, bill_id: billId };
  db.paymentHistory.push(payment);
  applyCash(db, payment, billId, user.id, datetime);
  const paid = billPaid(db, billId);
  bill.status = paid >= bill.amount ? "paid" : "partial";
  await saveDb(db);
  return reply(res, 201, { payment, bill });
}

async function collection(req, res, name, id, params) {
  const db = await readDb();
  const rows = db[name];
  if (!Array.isArray(rows)) return reply(res, 404, { message: "Resource not found" });
  const key = name === "categories" ? "name" : "id";
  if (req.method === "GET") {
    if (id !== undefined) {
      const row = rows.find((entry) => String(entry[key]) === id);
      if (!row) return reply(res, 404, { message: "Record not found" });
      return reply(res, 200, name === "users" ? withoutSecret(row) : row);
    }
    const result = filtered(rows, params);
    return reply(res, 200, name === "users" ? result.map(withoutSecret) : result);
  }
  if (req.method === "POST") {
    if (["products", "bills", "soldItems", "paymentHistory", "cashMovements", "stockMovements", "cashDrawers", "sellingPriceHistory", "buyingPriceHistory"].includes(name)) return reply(res, 405, { message: "استخدم العملية المخصصة لهذا المورد." });
    const input = await bodyOf(req);
    if (name === "categories" && !input.name?.trim()) return reply(res, 400, { message: "اسم التصنيف مطلوب." });
    if (name === "users" && (!input.name?.trim() || !input.username?.trim() || !input.password || !input.start_date || !Number.isFinite(input.salary) || input.salary < 0)) return reply(res, 400, { message: "بيانات المستخدم غير مكتملة أو غير صالحة." });
    if (name === "users" && !["seller", "admin"].includes(input.role)) return reply(res, 400, { message: "دور المستخدم غير صالح." });
    if (name === "customers" && (!input.name?.trim() || !input.phone_number?.trim())) return reply(res, 400, { message: "اسم العميل ورقم هاتفه مطلوبان." });
    if (name === "users" && rows.some((user) => user.username === input.username)) return reply(res, 409, { message: "اسم المستخدم مستخدم بالفعل." });
    const row = name === "categories" ? { name: input.name.trim() } : { ...input, id: String(input.id ?? randomUUID()) };
    if (name === "users") { row.password_hashed = hashPassword(input.password); delete row.password; }
    if (rows.some((entry) => String(entry[key]) === String(row[key]))) return reply(res, 409, { message: "السجل موجود بالفعل." });
    rows.push(row);
    await saveDb(db);
    return reply(res, 201, name === "users" ? withoutSecret(row) : row);
  }
  if (["PUT", "PATCH", "DELETE"].includes(req.method) && id !== undefined) {
    if (["products", "bills", "soldItems", "paymentHistory", "cashMovements", "stockMovements", "cashDrawers", "sellingPriceHistory", "buyingPriceHistory"].includes(name)) return reply(res, 405, { message: "لا يمكن تعديل سجل مالي أو حركي مباشرة." });
    const index = rows.findIndex((entry) => String(entry[key]) === id);
    if (index < 0) return reply(res, 404, { message: "Record not found" });
    if (req.method === "DELETE") {
      if (name === "customers" && db.bills.some((bill) => bill.buyer_id === id)) return reply(res, 409, { message: "لا يمكن حذف عميل مرتبط بفواتير." });
      if (name === "categories" && db.products.some((product) => product.category === id)) return reply(res, 409, { message: "لا يمكن حذف تصنيف مرتبط بمنتجات." });
      if (name === "users" && (db.bills.some((bill) => bill.seller_id === id) || db.stockMovements.some((movement) => movement.user_id === id) || db.cashMovements.some((movement) => movement.user_id === id))) return reply(res, 409, { message: "لا يمكن حذف مستخدم مرتبط بحركات أو فواتير." });
      let removed = rows[index];
      if (name === "products") rows[index].active = false;
      else removed = rows.splice(index, 1)[0];
      await saveDb(db);
      return reply(res, 200, name === "users" ? withoutSecret(removed) : removed);
    }
    const input = await bodyOf(req);
    if (name === "customers" && (!input.name?.trim() || !input.phone_number?.trim())) return reply(res, 400, { message: "اسم العميل ورقم هاتفه مطلوبان." });
    if (name === "users" && input.role && !["seller", "admin"].includes(input.role)) return reply(res, 400, { message: "دور المستخدم غير صالح." });
    const { password_hashed: _untrustedHash, password, ...safeInput } = input;
    rows[index] = { ...rows[index], ...safeInput, [key]: rows[index][key] };
    if (name === "users" && password) rows[index].password_hashed = hashPassword(password);
    delete rows[index].password;
    await saveDb(db);
    return reply(res, 200, name === "users" ? withoutSecret(rows[index]) : rows[index]);
  }
  return reply(res, 405, { message: "Method not allowed" });
}

const server = createServer(async (req, res) => {
  if (req.method === "OPTIONS") return reply(res, 204);
  const url = new URL(req.url ?? "/", `http://${req.headers.host ?? "localhost"}`);
  const parts = url.pathname.split("/").filter(Boolean);
  if (parts[0] !== "api") return reply(res, 404, { message: "Use /api" });
  if (parts[1] === "health") return reply(res, 200, { status: "ok", mode: "mock-json" });
  try {
    if (parts[1] === "auth" && parts[2] === "login") return await login(req, res);
    if (parts[1] === "auth" && parts[2] === "approve-discount") return await approveDiscount(req, res);
    if (parts[1] === "bills" && parts[2] === "issue") return await issueBill(req, res);
    if (parts[1] === "bills" && parts[3] === "payments") return await recordPayment(req, res, parts[2]);
    if (parts[1] === "inventory" && parts[2] === "products") {
      // Inventory writes use the same validated product and price-history resources below.
      if (req.method === "POST") {
        const input = await bodyOf(req);
        const db = await readDb();
        if (!db.users.some((entry) => entry.id === input.user_id)) return reply(res, 400, { message: "المستخدم غير موجود." });
        if (!db.categories.some((category) => category.name === input.category)) return reply(res, 400, { message: "التصنيف غير موجود." });
        const product = { id: `product-${randomUUID()}`, name: input.name.trim(), code: input.code.trim(), active: true, category: input.category, stock: Number(input.stock), warranty: input.warranty ?? "بدون ضمان" };
        if (!product.name || !product.code || !Number.isInteger(product.stock) || product.stock < 0 || db.products.some((entry) => entry.code === product.code)) return reply(res, 400, { message: "بيانات المنتج غير صالحة أو الكود مستخدم." });
        if (!(Number(input.selling_price) > 0) || !(Number(input.buying_price) >= 0)) return reply(res, 400, { message: "أسعار المنتج غير صالحة." });
        const now = new Date().toISOString();
        db.products.push(product);
        db.sellingPriceHistory.push({ id: `sell-price-${randomUUID()}`, product_id: product.id, selling_price_per_each: Number(input.selling_price), datetime_of_price_update: now, user_id: input.user_id });
        db.buyingPriceHistory.push({ id: `buy-price-${randomUUID()}`, product_id: product.id, buying_price_per_each: Number(input.buying_price), datetime_of_price_update: now, user_id: input.user_id });
        if (product.stock > 0) db.stockMovements.push({ id: `stock-${randomUUID()}`, type: "in", quantity: product.stock, product_id: product.id, user_id: input.user_id, bill_id: null });
        await saveDb(db);
        return reply(res, 201, product);
      }
      if (parts[3] && req.method === "PATCH") {
        const input = await bodyOf(req);
        const db = await readDb();
        const product = db.products.find((entry) => entry.id === parts[3]);
        if (!product) return reply(res, 404, { message: "المنتج غير موجود." });
        if (!db.users.some((entry) => entry.id === input.user_id)) return reply(res, 400, { message: "المستخدم غير موجود." });
        if (input.code && db.products.some((entry) => entry.id !== product.id && entry.code === input.code)) return reply(res, 409, { message: "كود المنتج مستخدم بالفعل." });
        const now = new Date().toISOString();
        if (input.category && !db.categories.some((category) => category.name === input.category)) return reply(res, 400, { message: "التصنيف غير موجود." });
        for (const field of ["name", "code", "active", "category", "warranty"]) if (field in input) product[field] = input[field];
        if ("stock_delta" in input) {
          const delta = Number(input.stock_delta);
          if (!Number.isInteger(delta) || product.stock + delta < 0) return reply(res, 400, { message: "تغيير المخزون غير صالح." });
          if (delta) { product.stock += delta; db.stockMovements.push({ id: `stock-${randomUUID()}`, type: delta > 0 ? "in" : "out", quantity: Math.abs(delta), product_id: product.id, user_id: input.user_id, bill_id: null }); }
        }
        if ("selling_price" in input) {
          if (!(Number(input.selling_price) > 0)) return reply(res, 400, { message: "سعر البيع غير صالح." });
          db.sellingPriceHistory.push({ id: `sell-price-${randomUUID()}`, product_id: product.id, selling_price_per_each: Number(input.selling_price), datetime_of_price_update: now, user_id: input.user_id });
        }
        if ("buying_price" in input) {
          if (!(Number(input.buying_price) >= 0)) return reply(res, 400, { message: "سعر الشراء غير صالح." });
          db.buyingPriceHistory.push({ id: `buy-price-${randomUUID()}`, product_id: product.id, buying_price_per_each: Number(input.buying_price), datetime_of_price_update: now, user_id: input.user_id });
        }
        await saveDb(db);
        return reply(res, 200, product);
      }
    }
    if (!collectionNames.has(parts[1])) return reply(res, 404, { message: "Resource not found" });
    return await collection(req, res, parts[1], parts[2], url.searchParams);
  } catch (error) {
    return reply(res, Number(error.status) || 500, { message: Number(error.status) ? error.message : "Mock API error" });
  }
});

server.listen(port, "0.0.0.0", () => console.log(`Sendal mock JSON API: http://localhost:${port}/api`));
