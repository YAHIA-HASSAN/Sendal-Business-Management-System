import type { Payment } from "../../data/invoiceStore";

export type PaymentDraft = Omit<Payment, "amount"> & { amount: string };
