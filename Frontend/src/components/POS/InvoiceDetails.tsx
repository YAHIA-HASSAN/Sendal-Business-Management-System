import type { Customer } from "../../data/invoiceStore";

type Props = {
  customers: Customer[];
  customerId: string;
  warranty: string;
  notes: string;
  onCustomerChange: (customerId: string) => void;
  onCreateCustomer: () => void;
  onWarrantyChange: (value: string) => void;
  onNotesChange: (value: string) => void;
};

export default function InvoiceDetails({ customers, customerId, warranty, notes, onCustomerChange, onCreateCustomer, onWarrantyChange, onNotesChange }: Props) {
  return (
    <div className="invoice-details-fields">
      <label className="invoice-field">
        <span>العميل <small>اختياري</small><button type="button" className="inline-add-customer" onClick={onCreateCustomer}>إضافة جديد ＋</button></span>
        <select value={customerId} onChange={(event) => onCustomerChange(event.target.value)}>
          <option value="">عميل نقدي / بدون تسجيل</option>
          {customers.map((customer) => <option key={customer.id} value={customer.id}>{customer.name} — {customer.phoneNumber}</option>)}
        </select>
      </label>
      <label className="invoice-field">
        <span>الضمان <small>اختياري</small></span>
        <input value={warranty} onChange={(event) => onWarrantyChange(event.target.value)} placeholder="مثال: ضمان 6 أشهر" />
      </label>
      <label className="invoice-field invoice-notes-field">
        <span>ملاحظات الفاتورة <small>اختياري</small></span>
        <textarea value={notes} onChange={(event) => onNotesChange(event.target.value)} rows={2} placeholder="أضف ملاحظة عند الحاجة" />
      </label>
    </div>
  );
}
