import { Printer, Receipt, X } from 'lucide-react';
import dayjs from 'dayjs';

interface ReceiptModalProps {
  bill: any;
  onClose: () => void;
}

function numberToWords(num: number): string {
  const rounded = Math.round(num);
  if (rounded === 0) return 'Zero';
  const a = [
    '', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ',
    'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '
  ];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  const numStr = rounded.toString();
  if (numStr.length > 9) return 'overflow';
  const n = ('000000000' + numStr).slice(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
  if (!n) return '';
  let str = '';
  str += (Number(n[1]) !== 0) ? (a[Number(n[1])] || b[Number(n[1][0])] + ' ' + a[Number(n[1][1])]) + 'Crore ' : '';
  str += (Number(n[2]) !== 0) ? (a[Number(n[2])] || b[Number(n[2][0])] + ' ' + a[Number(n[2][1])]) + 'Lakh ' : '';
  str += (Number(n[3]) !== 0) ? (a[Number(n[3])] || b[Number(n[3][0])] + ' ' + a[Number(n[3][1])]) + 'Thousand ' : '';
  str += (Number(n[4]) !== 0) ? (a[Number(n[4])] || b[Number(n[4][0])] + ' ' + a[Number(n[4][1])]) + 'Hundred ' : '';
  str += (Number(n[5]) !== 0) ? ((str !== '') ? 'and ' : '') + (a[Number(n[5])] || b[Number(n[5][0])] + ' ' + a[Number(n[5][1])]) : '';
  return str.trim();
}

function BarcodeSVG({ value = '60829605957' }: { value?: string }) {
  // SVG Barcode representation
  const bars = [
    1,0,1,1,0,1,0,0,1,1,0,1,1,1,0,1,0,1,1,0,0,1,0,1,1,1,0,1,0,0,1,
    0,1,1,0,1,1,0,1,0,1,1,1,0,0,1,0,1,0,1,1,0,1,1,1,0,1,0,0,1,1,0,
    1,0,1,1,0,1,0,0,1,1,0,1,1,1,0,1,0,1,1,0
  ];
  return (
    <svg className="h-7 w-36" viewBox="0 0 100 30" preserveAspectRatio="none">
      <rect width="100" height="30" fill="white" />
      {bars.map((bar, idx) => (
        bar === 1 ? (
          <rect key={idx} x={(idx * 100) / bars.length} y="0" width={100 / bars.length} height="30" fill="black" />
        ) : null
      ))}
    </svg>
  );
}

export default function ReceiptModal({ bill, onClose }: ReceiptModalProps) {
  const handlePrint = () => window.print();

  const formattedInvoiceDate = bill?.createdAt
    ? dayjs(bill.createdAt).format('DD-MMM-YYYY HH:mm')
    : dayjs().format('DD-MMM-YYYY HH:mm');

  // Expected report date (+3 hours if not specified)
  const expectedReportDate = bill?.createdAt
    ? dayjs(bill.createdAt).add(3, 'hour').format('DD-MMM-YYYY HH:mm')
    : dayjs().add(3, 'hour').format('DD-MMM-YYYY HH:mm');

  let patientLine = 'Walk-in Customer';
  if (bill?.customer?.name) {
    patientLine = bill.customer.name;
    if (bill.customer.gender) {
      patientLine += ` - ${bill.customer.gender}`;
    }
    if (bill.customer.age !== undefined && bill.customer.age !== null) {
      patientLine += ` - ${bill.customer.age} Yrs`;
    }
  }

  const branchName = bill?.branch?.name || bill?.branch?.store?.name || 'OMR-Perungudi';
  const clientName = bill?.branch?.store?.name || 'MERL DIAGNOSTICS';
  const receivedBy = (bill?.receivedBy || bill?.cashier?.name || 'ADMIN').toUpperCase();

  const subtotal = bill?.subtotal ?? bill?.totalAmount ?? 60.0;
  const netAmount = bill?.totalAmount ?? 60.0;
  const paidAmount = bill?.totalAmount ?? 60.0;
  const balanceToPay = 0.0;

  const paymentMode = bill?.paymentMode === 'UPI' ? 'Paytm' : (bill?.paymentMode || 'Paytm');
  const receiptNo = bill?.invoiceNumber ? `R-296-26-27-${bill.invoiceNumber.replace(/\D/g, '').slice(-5) || bill.invoiceNumber}` : 'R-296-26-27-51906';

  const amountInWords = numberToWords(paidAmount);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 sm:p-8">
      <div className="card w-full max-w-4xl shadow-2xl animate-slide-up max-h-full overflow-y-auto bg-white text-black p-0 rounded-md flex flex-col">
        {/* Modal Controls Bar (hidden during printing) */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 no-print bg-slate-50 text-slate-900 rounded-t-md sticky top-0 z-10">
          <h2 className="font-bold text-lg flex items-center gap-2">
            <Receipt size={20} className="text-brand-600" /> Bill Cum Receipt Preview
          </h2>
          <div className="flex gap-2">
            <button
              onClick={handlePrint}
              className="btn-primary btn-sm bg-brand-600 hover:bg-brand-700 text-white border-none flex items-center gap-1.5 px-4"
            >
              <Printer size={16} /> Print Receipt
            </button>
            <button
              onClick={onClose}
              className="btn-icon btn-ghost text-slate-500 hover:text-slate-900"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* PRINTABLE RECEIPT CONTAINER - Matched Exactly to PDF */}
        <div
          className="p-6 sm:p-10 print-receipt bg-white text-black font-sans w-full mx-auto flex-1 text-[13px] leading-snug"
          style={{ maxWidth: '210mm' }}
        >
          {/* Top Line */}
          <div className="border-b border-black mb-1"></div>

          {/* Header Row */}
          <div className="flex justify-between items-center py-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-[13px]">Kiosk:</span>
              <BarcodeSVG value={bill?.invoiceNumber} />
            </div>
            <h1 className="text-lg font-bold tracking-wider uppercase text-center mx-2">
              BILL CUM RECEIPT
            </h1>
            <div className="flex items-center">
              <BarcodeSVG value={bill?.invoiceNumber} />
            </div>
          </div>

          {/* Line after header */}
          <div className="border-b border-black mt-1 mb-3"></div>

          {/* Info Section Grid */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 mb-3 text-[13px]">
            <div className="space-y-1.5">
              <div className="flex">
                <span className="w-24 shrink-0 font-medium">Name</span>
                <span className="w-4 shrink-0">:</span>
                <span className="flex-1 font-normal">{patientLine}</span>
              </div>
              <div className="flex">
                <span className="w-24 shrink-0 font-medium">Branch</span>
                <span className="w-4 shrink-0">:</span>
                <span className="flex-1 font-normal">{branchName}</span>
              </div>
              <div className="flex">
                <span className="w-24 shrink-0 font-medium">Client</span>
                <span className="w-4 shrink-0">:</span>
                <span className="flex-1 font-normal">{clientName}</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex">
                <span className="w-36 shrink-0 font-medium">Invoice No / Date</span>
                <span className="w-4 shrink-0">:</span>
                <span className="flex-1">
                  {bill?.invoiceNumber || '60829605957'} / {formattedInvoiceDate}
                </span>
              </div>
              <div className="flex">
                <span className="w-36 shrink-0 font-medium">Email</span>
                <span className="w-4 shrink-0">:</span>
                <span className="flex-1">{bill?.customer?.email || ''}</span>
              </div>
              <div className="flex">
                <span className="w-36 shrink-0 font-medium">Contact No</span>
                <span className="w-4 shrink-0">:</span>
                <span className="flex-1">{bill?.customer?.phone || ''}</span>
              </div>
              <div className="flex">
                <span className="w-36 shrink-0 font-medium">Expected Report</span>
                <span className="w-4 shrink-0">:</span>
                <span className="flex-1">{expectedReportDate}</span>
              </div>
            </div>
          </div>

          {/* Border line before table */}
          <div className="border-b border-black my-2"></div>

          {/* Test Items Table */}
          <table className="w-full mb-4 text-[13px] border-collapse">
            <thead>
              <tr className="border-b border-black">
                <th className="text-left py-1.5 font-bold w-[45%]">Test Name</th>
                <th className="text-left py-1.5 font-bold w-[35%]">Remarks</th>
                <th className="text-right py-1.5 font-bold w-[20%]">Amount</th>
              </tr>
            </thead>
            <tbody>
              {bill?.items && bill.items.length > 0 ? (
                bill.items.map((item: any) => (
                  <tr key={item.id || item.productId}>
                    <td className="py-1">{item.productName || item.name}</td>
                    <td className="py-1">
                      {item.quantity > 1 ? `${item.quantity} x ₹${(item.sellingPrice || 0).toFixed(2)}` : ''}
                    </td>
                    <td className="text-right py-1">
                      {(item.totalAmount ?? (item.sellingPrice ? item.sellingPrice * item.quantity : 0)).toFixed(2)}
                    </td>
                  </tr>
                ))
              ) : (
                <>
                  <tr>
                    <td className="py-1">Glucose - Fasting</td>
                    <td className="py-1"></td>
                    <td className="text-right py-1">30.00</td>
                  </tr>
                  <tr>
                    <td className="py-1">Glucose - Post Prandial</td>
                    <td className="py-1"></td>
                    <td className="text-right py-1">30.00</td>
                  </tr>
                </>
              )}
            </tbody>
          </table>

          {/* Border line after table */}
          <div className="border-b border-black mb-4"></div>

          {/* Bottom Section: Left (Receipt Table & Words), Right (Totals) */}
          <div className="grid grid-cols-[1fr_240px] gap-6 items-start text-[13px]">
            {/* Left Column */}
            <div>
              {/* Receipt Sub-table */}
              <table className="w-full border border-black text-[12px] border-collapse mb-2">
                <thead>
                  <tr className="border-b border-black bg-white">
                    <th className="text-left py-1 px-1.5 border-r border-black font-bold">Receipt No</th>
                    <th className="text-left py-1 px-1.5 border-r border-black font-bold">Receipt Date</th>
                    <th className="text-right py-1 px-1.5 border-r border-black font-bold">Amount</th>
                    <th className="text-left py-1 px-1.5 border-r border-black font-bold">Mode</th>
                    <th className="text-left py-1 px-1.5 font-bold">Received By</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="py-1 px-1.5 border-r border-black">{receiptNo}</td>
                    <td className="py-1 px-1.5 border-r border-black">{formattedInvoiceDate}</td>
                    <td className="text-right py-1 px-1.5 border-r border-black">{paidAmount.toFixed(2)}</td>
                    <td className="py-1 px-1.5 border-r border-black">{paymentMode}</td>
                    <td className="py-1 px-1.5 uppercase">{receivedBy}</td>
                  </tr>
                </tbody>
              </table>

              {/* Amount Paid in Words */}
              <div className="italic text-[13px] mt-3">
                Amount Paid in Words : {amountInWords} Rupees Only
              </div>

              {/* Authorized By */}
              <div className="mt-8 text-center text-[13px]">
                Authorized By : {clientName}
              </div>
            </div>

            {/* Right Column: Totals */}
            <div className="space-y-1.5 text-[13px]">
              <div className="flex justify-between">
                <span className="w-32 font-medium">Gross Bill Amount</span>
                <span className="w-3">:</span>
                <span className="flex-1 text-right">{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="w-32 font-medium">Net Amount</span>
                <span className="w-3">:</span>
                <span className="flex-1 text-right">{netAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="w-32 font-medium">Paid Amount</span>
                <span className="w-3">:</span>
                <span className="flex-1 text-right">{paidAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold pt-0.5">
                <span className="w-32">Balance to Pay</span>
                <span className="w-3">:</span>
                <span className="flex-1 text-right">{balanceToPay.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Bottom border line */}
          <div className="border-b border-black mt-4"></div>
        </div>
      </div>
    </div>
  );
}
