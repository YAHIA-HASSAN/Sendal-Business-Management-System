export type User = { id: string; name: string; username: string; role: "seller" | "admin" };
export type Customer = { id: string; name: string; phoneNumber: string };
export type Category = { id: string; name: string };
export type ProductRecord = { id: string; name: string; code: string; categoryId: string; stock: number; active: boolean };
export type Product = ProductRecord & { unitPrice: number; buyingPrice?: number; warranty?: string };
export type InvoiceLine = { productId: string; name: string; code: string; unitPrice: number; quantity: number };
export type Payment = { method: string; amount: number };
export type BillRecord = { id: string; amount: number; discountAmount: number; notes: string | null; issueDatetime: string; status: "paid" | "partial" | "unpaid"; sellerId: string; customerId: string | null };
export type InvoiceSummary = { id: string; number: number; issueDate: string; amount: number; discountAmount: number; customerId: string | null; customerName: string; paid: number; remaining: number; status: BillRecord["status"] };
export type CashDrawerRecord = { id: string; balance: number; lastUpdate: string | null };
export function roundMoney(value: number) { return Math.round((value + Number.EPSILON) * 100) / 100; }
