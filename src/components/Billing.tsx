import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { CreditCard, CheckCircle, ShieldAlert, FileText, Send, Phone, RefreshCw, Layers, ArrowRight, Sparkles, Plus, Zap, QrCode, Paperclip, UploadCloud, FileImage, Trash2, FileDown, Printer, X } from "lucide-react";
import { SubscriptionPlan, ActivePlan, Invoice, DigitalProduct } from "../types";
import { SUBSCRIPTION_PLANS } from "../data/plans";

interface BillingProps {
  activePlan: ActivePlan;
  invoices: Invoice[];
  createdProducts: DigitalProduct[];
  userEmail: string;
  onSendInvoiceToWhatsApp: (invoice: Invoice) => void;
}

export default function Billing({
  activePlan,
  invoices,
  createdProducts,
  userEmail,
  onSendInvoiceToWhatsApp,
}: BillingProps) {
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"FIB" | "FastPay">("FIB");
  const [showInvoiceCreator, setShowInvoiceCreator] = useState(false);
  const [activeCreatedInvoice, setActiveCreatedInvoice] = useState<Invoice | null>(null);
  const [selectedQrInvoice, setSelectedQrInvoice] = useState<Invoice | null>(null);
  const [showPdfInvoice, setShowPdfInvoice] = useState<Invoice | null>(null);
  const [justAttached, setJustAttached] = useState(false);
  
  // Receipt file upload states
  const [uploadedReceipt, setUploadedReceipt] = useState<string | null>(null);
  const [receiptFileName, setReceiptFileName] = useState<string>("");
  const [dragActive, setDragActive] = useState(false);

  const handleInitiatePayment = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
    setShowInvoiceCreator(true);
    setActiveCreatedInvoice(null);
    setUploadedReceipt(null);
    setReceiptFileName("");
    setDragActive(false);
  };

  const handleCreateInvoice = () => {
    if (!selectedPlan) return;

    const newInvoice: Invoice = {
      id: "SAS-INV-" + Math.floor(1000 + Math.random() * 9000),
      planId: selectedPlan.id,
      planName: selectedPlan.name,
      amount: selectedPlan.price,
      paymentMethod: paymentMethod,
      status: "pending",
      invoiceDate: new Date().toLocaleDateString("ku-IQ") + " " + new Date().toLocaleTimeString("ku-IQ", { hour: "2-digit", minute: "2-digit" }),
      transactionId: "TXN-" + Math.random().toString(36).substring(2, 10).toUpperCase(),
      userEmail: userEmail,
      whatsappSent: false,
      receiptScreenshot: uploadedReceipt || undefined
    };

    setActiveCreatedInvoice(newInvoice);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setUploadedReceipt(event.target.result as string);
        setReceiptFileName(file.name);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveFile = () => {
    setUploadedReceipt(null);
    setReceiptFileName("");
  };

  const handleSendToWhatsApp = () => {
    if (!activeCreatedInvoice) return;
    const updatedInvoice = { ...activeCreatedInvoice, whatsappSent: true };
    onSendInvoiceToWhatsApp(updatedInvoice);
    setActiveCreatedInvoice(updatedInvoice);
  };

  const handleDownloadMockPdf = (inv: Invoice) => {
    const pdfContent = `%PDF-1.4
%
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [ 3 0 R ] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /Resources << /Font << /F1 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> >> >> /MediaBox [ 0 0 595.27 841.89 ] /Contents 4 0 R >>
endobj
4 0 obj
<< /Length 500 >>
stream
BT
/F1 18 Tf
50 800 Td
(SAS PLATFORM OFFICIAL TRANSACTION RECEIPT) Tj
/F1 12 Tf
0 -30 Td
(Invoice ID: ${inv.id}) Tj
0 -20 Td
(Date: ${inv.invoiceDate}) Tj
0 -20 Td
(User Account: ${inv.userEmail}) Tj
0 -20 Td
(Service Plan: ${inv.planName}) Tj
0 -20 Td
(Amount: ${inv.amount.toLocaleString("en-US")} IQD) Tj
0 -20 Td
(Payment Method Proxy: ${inv.paymentMethod}) Tj
0 -20 Td
(Verification ID: ${inv.transactionId}) Tj
0 -40 Td
(STAMP: SAS PLATFORM - CO. - ERBIL HEADQUARTERS) Tj
0 -20 Td
(STATUS: PENDING MANAGER APPROVAL) Tj
0 -30 Td
(Thank you for choosing SAS No-Code Platform!) Tj
ET
endstream
endobj
xref
0 5
0000000000 65535 f 
0000000018 00000 n 
0000000067 00000 n 
0000000122 00000 n 
0000000281 00000 n 
trailer
<< /Size 5 /Root 1 0 R >>
startxref
850
%%EOF`;

    const blob = new Blob([pdfContent], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `SAS-Receipt-${inv.id}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleAutoAttachScreenshot = (inv: Invoice) => {
    const svgString = `
      <svg xmlns="http://www.w3.org/2000/svg" width="600" height="800" viewBox="0 0 600 800">
        <rect width="600" height="800" fill="#ffffff"/>
        <rect x="20" y="20" width="560" height="760" rx="15" fill="#fafafa" stroke="#e2e8f0" stroke-width="2"/>
        
        <text x="300" y="60" font-family="system-ui, sans-serif" font-size="22" font-weight="900" fill="#0f172a" text-anchor="middle">SAS PLATFORM CO.</text>
        <text x="300" y="85" font-family="system-ui, sans-serif" font-size="11" fill="#64748b" text-anchor="middle">Erbil, Kurdistan Region, Iraq • support@sasplatform.com</text>
        
        <line x1="40" y1="110" x2="560" y2="110" stroke="#cbd5e1" stroke-width="1" stroke-dasharray="4 4"/>
        
        <text x="300" y="145" font-family="system-ui, sans-serif" font-size="16" font-weight="bold" fill="#0f172a" text-anchor="middle">OFFICIAL TRANSACTION RECEIPT / پسوولەی فەرمی</text>
        
        <rect x="40" y="170" width="520" height="150" rx="8" fill="#ffffff" stroke="#f1f5f9" stroke-width="1"/>
        
        <text x="60" y="200" font-family="system-ui, sans-serif" font-size="12" font-weight="bold" fill="#64748b">Invoice ID:</text>
        <text x="200" y="200" font-family="monospace" font-size="12" font-weight="bold" fill="#0f172a">${inv.id}</text>
        
        <text x="60" y="230" font-family="system-ui, sans-serif" font-size="12" font-weight="bold" fill="#64748b">Date &amp; Time:</text>
        <text x="200" y="230" font-family="system-ui, sans-serif" font-size="12" fill="#0f172a">${inv.invoiceDate}</text>
        
        <text x="60" y="260" font-family="system-ui, sans-serif" font-size="12" font-weight="bold" fill="#64748b">User Account:</text>
        <text x="200" y="260" font-family="monospace" font-size="12" fill="#0f172a">${inv.userEmail}</text>

        <text x="60" y="290" font-family="system-ui, sans-serif" font-size="12" font-weight="bold" fill="#64748b">Payment Method:</text>
        <text x="200" y="290" font-family="system-ui, sans-serif" font-size="12" font-weight="bold" fill="#d97706">${inv.paymentMethod} Payment Proxy</text>

        <line x1="40" y1="340" x2="560" y2="340" stroke="#cbd5e1" stroke-width="1"/>
        
        <text x="60" y="375" font-family="system-ui, sans-serif" font-size="12" font-weight="bold" fill="#0f172a">ITEM DESCRIPTION</text>
        <text x="400" y="375" font-family="system-ui, sans-serif" font-size="12" font-weight="bold" fill="#0f172a" text-anchor="end">QTY</text>
        <text x="540" y="375" font-family="system-ui, sans-serif" font-size="12" font-weight="bold" fill="#0f172a" text-anchor="end">TOTAL (IQD)</text>
        
        <line x1="40" y1="390" x2="560" y2="390" stroke="#e2e8f0" stroke-width="1"/>
        
        <text x="60" y="415" font-family="system-ui, sans-serif" font-size="12" font-weight="bold" fill="#1e293b">SAS No-Code Platform - ${inv.planName}</text>
        <text x="400" y="415" font-family="monospace" font-size="12" fill="#334155" text-anchor="end">1</text>
        <text x="540" y="415" font-family="monospace" font-size="12" font-weight="bold" fill="#1e293b" text-anchor="end">${inv.amount.toLocaleString()} IQD</text>
        
        <line x1="40" y1="440" x2="560" y2="440" stroke="#e2e8f0" stroke-width="1"/>
        
        <text x="350" y="480" font-family="system-ui, sans-serif" font-size="14" font-weight="bold" fill="#475569">GRAND TOTAL:</text>
        <text x="540" y="480" font-family="monospace" font-size="18" font-weight="900" fill="#059669" text-anchor="end">${inv.amount.toLocaleString()} IQD</text>
        
        <rect x="40" y="520" width="520" height="50" rx="8" fill="#f8fafc" stroke="#e2e8f0" stroke-width="1"/>
        <text x="60" y="550" font-family="system-ui, sans-serif" font-size="11" font-weight="bold" fill="#64748b">Verification Transaction Hash ID:</text>
        <text x="250" y="550" font-family="monospace" font-size="12" font-weight="bold" fill="#1e293b">${inv.transactionId}</text>
        
        <circle cx="150" cy="670" r="45" fill="none" stroke="#dc2626" stroke-width="3" stroke-opacity="0.75" stroke-dasharray="5 2"/>
        <text x="150" y="665" font-family="system-ui, sans-serif" font-size="11" font-weight="900" fill="#dc2626" fill-opacity="0.75" text-anchor="middle">SAS PLATFORM</text>
        <text x="150" y="682" font-family="system-ui, sans-serif" font-size="9" font-weight="bold" fill="#dc2626" fill-opacity="0.75" text-anchor="middle">OFFICIAL SECURE</text>
        <text x="150" y="695" font-family="system-ui, sans-serif" font-size="8" fill="#dc2626" fill-opacity="0.75" text-anchor="middle">APPROVED proxy</text>

        <text x="450" y="660" font-family="system-ui, sans-serif" font-size="12" font-weight="bold" fill="#475569" text-anchor="middle">Billing Manager</text>
        <path d="M 400 700 Q 420 670 450 680 T 500 675" fill="none" stroke="#0284c7" stroke-width="2" stroke-linecap="round"/>
        <text x="450" y="715" font-family="system-ui, sans-serif" font-size="10" fill="#64748b" text-anchor="middle">Authorized Signature</text>

        <rect x="230" y="730" width="140" height="30" rx="2" fill="#0f172a"/>
        <text x="300" y="775" font-family="monospace" font-size="9" fill="#94a3b8" text-anchor="middle">${inv.id}</text>
      </svg>
    `;

    const base64Svg = btoa(unescape(encodeURIComponent(svgString)));
    const dataUrl = `data:image/svg+xml;base64,${base64Svg}`;
    
    setUploadedReceipt(dataUrl);
    setReceiptFileName(`SAS_AUTO_PROOF_${inv.id}.png`);
    setJustAttached(true);
    setTimeout(() => {
      setJustAttached(false);
    }, 4000);
  };

  return (
    <div className="space-y-6 text-right font-sans animate-fade-in" dir="rtl">
      {/* Active subscription summary bar */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 to-transparent pointer-events-none" />
        <div className="space-y-1 z-10">
          <h3 className="text-md font-bold text-slate-400">ڕەوشی بەشداری ئێستای تۆ</h3>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-black text-white">{activePlan.name}</span>
            {activePlan.isTrial && (
              <span className="bg-amber-500/10 text-amber-500 text-[10px] font-black px-2.5 py-1 rounded-full border border-amber-500/20">
                هەفتەی تاقیکاری بە خۆڕایی
              </span>
            )}
          </div>
          <p className="text-slate-500 text-xs mt-1">
            {activePlan.isTrial 
              ? `تاقیکردنەوەکەت بەسەردەچێت لە بەرواری: ${activePlan.trialEnd}` 
              : `خزمەتگوزاریەکەت چالاکە تا: ${activePlan.expirationDate || "نوێکردنەوەی خۆکار"}`}
          </p>
        </div>

        {/* Current capacities check based on Production Budget */}
        {(() => {
          const getProductCost = (type: "app" | "website" | "3d-game"): number => {
            if (type === "app") return 3000;
            if (type === "website") return 15000;
            return 30000;
          };

          const getPlanBudget = (planId: string, isTrial: boolean): number => {
            if (isTrial) return 3000; // Free trial budget (Allows 1 App worth 3,000 IQD)
            if (planId === "plan_a") return 30000; // Plan A budget (30,000 IQD)
            if (planId === "plan_b") return 100000; // Plan B budget (100,000 IQD)
            return 3000;
          };

          const totalSpent = createdProducts
            .filter(p => p.creatorEmail === userEmail)
            .reduce((sum, p) => sum + getProductCost(p.type), 0);

          const currentBudget = getPlanBudget(activePlan.planId, activePlan.isTrial);
          const remainingBudget = Math.max(0, currentBudget - totalSpent);

          return (
            <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800/80 shrink-0 z-10 w-full md:w-auto text-right">
              <div className="text-[10px] text-slate-500 font-bold leading-none">بوودجەی بەرهەمهێنانی ماوە</div>
              <div className="text-emerald-400 font-black text-lg font-mono mt-1">
                {remainingBudget.toLocaleString("ku-IQ")} / {currentBudget.toLocaleString("ku-IQ")} د.ع
              </div>
              <div className="text-[9px] text-slate-500 mt-1 leading-none">
                ئەپ: ٣,٠٠٠ د.ع • ماڵپەڕ: ١٥,٠٠٠ د.ع • یاری ٣دوری: ٣٠,٠٠٠ د.ع
              </div>
            </div>
          );
        })()}
      </div>

      {/* Subscription Plans Shelf */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
        {SUBSCRIPTION_PLANS.map((plan) => {
          const isCurrent = activePlan.planId === plan.id;
          return (
            <div 
              key={plan.id}
              className={`bg-slate-900 border rounded-3xl p-6 flex flex-col justify-between shadow-xl relative transition-all ${
                isCurrent 
                  ? "border-amber-500/60 shadow-amber-500/5 ring-1 ring-amber-500/20" 
                  : "border-slate-800 hover:border-slate-700/80"
              }`}
            >
              {isCurrent && (
                <div className="absolute top-4 left-4 bg-amber-500 text-slate-950 font-black text-[9px] px-2.5 py-1 rounded-full uppercase tracking-wider">
                  پاکێجی چالاک
                </div>
              )}
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-black text-white">{plan.name}</h3>
                  <p className="text-xs text-slate-500 mt-1">{plan.description}</p>
                </div>

                <div className="flex items-baseline gap-1 py-1 border-y border-slate-800/80">
                  <span className="text-3xl font-black text-emerald-400">{plan.priceFormatted}</span>
                  <span className="text-slate-500 text-xs">/ مانگانە</span>
                </div>

                <div className="space-y-2">
                  <div className="text-xs font-extrabold text-slate-300">تایبەتمەندییەکان:</div>
                  <ul className="space-y-2">
                    {plan.features.map((feat, idx) => (
                      <li key={idx} className="text-xs text-slate-400 flex items-start gap-2 leading-relaxed">
                        <CheckCircle size={14} className="text-amber-500 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800/60">
                <button
                  onClick={() => handleInitiatePayment(plan)}
                  className={`w-full py-3.5 rounded-2xl font-black text-xs transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1.5 ${
                    isCurrent
                      ? "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
                      : "bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 hover:from-amber-600 hover:to-yellow-600 shadow-md shadow-amber-500/10"
                  }`}
                >
                  <CreditCard size={14} />
                  <span>{isCurrent ? "نوێکردنەوە یان گۆڕینی لیمیت" : "کڕین و بەشداربوون ئێستا"}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Invoices History & QR Verification Hub */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl relative text-right space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-800 pb-4">
          <div className="space-y-1">
            <h3 className="text-md font-black text-white flex items-center gap-2">
              <QrCode className="text-amber-500" size={18} />
              <span>مێژووی فاتورەکان و دەرکەری کۆدی QR بۆ خێراکردنی پرۆسەی پەسەندکردن</span>
            </h3>
            <p className="text-xs text-slate-400">
              لێرەوە زانیاری فاتورەکان دەتوانیت بکەیتە کۆدی QRی سکانکراو بۆ ئەوەی بەڕێوەبەر لە ڕێگەی کامێراوە زۆر بە خێرایی فاتورەکەت پشتڕاستبکاتەوە.
            </p>
          </div>
        </div>

        {invoices.length === 0 ? (
          <div className="text-center py-10 space-y-2 bg-slate-950/40 rounded-2xl border border-slate-800/40">
            <div className="w-12 h-12 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-center text-slate-700 mx-auto">
              <FileText size={20} />
            </div>
            <h4 className="text-xs font-bold text-slate-400">هیچ فاتورەیەک تۆمارنەکراوە</h4>
            <p className="text-[10px] text-slate-500 max-w-[240px] mx-auto leading-relaxed">
              کاتێک هەوڵی کڕین یان بەشداربوونی پاکێجێک دەدەیت، فاتورەکەت لێرە تۆمار دەبێت و دەتوانیت کۆدی QR بۆ دروستبکەیت.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* List of Invoices */}
            <div className="lg:col-span-7 space-y-3 max-h-[400px] overflow-y-auto pr-1 custom-scrollbar">
              {invoices.map((inv) => {
                const isSelected = selectedQrInvoice?.id === inv.id;
                return (
                  <div
                    key={inv.id}
                    onClick={() => setSelectedQrInvoice(inv)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex justify-between items-center gap-4 ${
                      isSelected
                        ? "bg-amber-500/10 border-amber-500/60 shadow-md shadow-amber-500/5"
                        : "bg-slate-950/60 border-slate-800/80 hover:border-slate-700/60"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0">
                        <FileText size={16} className={isSelected ? "text-amber-500" : "text-slate-400"} />
                      </div>
                      <div className="space-y-1 text-right">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-white">{inv.id}</span>
                          <span className="text-[9px] text-slate-500 font-mono">({inv.invoiceDate})</span>
                          {inv.receiptScreenshot && (
                            <span className="inline-flex items-center gap-0.5 text-[8px] font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1 py-0.25 rounded" title="پسوولە هاوپێچکراوە">
                              <Paperclip size={8} />
                              <span>هاوپێچ</span>
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          بۆ کڕینی: <span className="font-semibold text-slate-300">{inv.planName}</span> • ڕێگا: <span className="font-semibold text-slate-300">{inv.paymentMethod}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-left">
                        <div className="text-xs font-black text-emerald-400">{inv.amount.toLocaleString("ku-IQ")} د.ع</div>
                        <span className={`inline-block text-[8px] font-black px-1.5 py-0.5 rounded-full mt-1 ${
                          inv.status === "approved" 
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : inv.status === "rejected"
                            ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                            : "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                        }`}>
                          {inv.status === "approved" ? "پەسەندکراو" : inv.status === "rejected" ? "ڕەتکراوە" : "چاوەڕوان (Pending)"}
                        </span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedQrInvoice(inv);
                        }}
                        className={`p-2 rounded-xl border transition active:scale-95 flex items-center justify-center cursor-pointer ${
                          isSelected
                            ? "bg-amber-500 border-amber-500 text-slate-950"
                            : "bg-slate-900 border-slate-800 text-slate-300 hover:text-white"
                        }`}
                        title="پیشاندانی کۆدی QR"
                      >
                        <QrCode size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* QR Code Presentation Display */}
            <div className="lg:col-span-5 bg-slate-950 border border-slate-800 p-5 rounded-2xl flex flex-col items-center justify-center text-center relative overflow-hidden min-h-[350px]">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600" />
              
              <AnimatePresence mode="wait">
                {selectedQrInvoice ? (
                  <motion.div
                    key={selectedQrInvoice.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="w-full space-y-4"
                  >
                    <div className="space-y-1">
                      <span className="text-[10px] bg-amber-500/10 text-amber-500 font-extrabold px-2.5 py-0.5 rounded-full border border-amber-500/20">
                        کۆدی سەلماندنی فەرمی
                      </span>
                      <h4 className="text-xs font-black text-white mt-2">
                        {selectedQrInvoice.id}
                      </h4>
                    </div>

                    {/* Highly precise QR Code generation matching selected invoice */}
                    <div className="bg-white p-3 rounded-2xl inline-block shadow-lg shadow-black/60 border border-slate-700 mx-auto">
                      <img 
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&color=0f172a&bgcolor=ffffff&qzone=1&data=${encodeURIComponent(
                          `SAS-VERIFY | ID: ${selectedQrInvoice.id} | User: ${selectedQrInvoice.userEmail} | Plan: ${selectedQrInvoice.planName} | Amount: ${selectedQrInvoice.amount.toLocaleString("en-US")} IQD | Method: ${selectedQrInvoice.paymentMethod} | Txn: ${selectedQrInvoice.transactionId} | Status: ${selectedQrInvoice.status}`
                        )}`}
                        alt="Scannable Admin QR"
                        className="w-[150px] h-[150px] object-contain rounded-lg"
                        referrerPolicy="no-referrer"
                      />
                    </div>

                    <div className="text-[9px] text-slate-500 font-black font-mono tracking-wide uppercase">
                      QR CODE GENERATED FOR ADMIN
                    </div>

                    {/* Detailed spec card for verification review */}
                    <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800 text-right text-[10px] space-y-1.5 font-mono">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">کڕیار:</span>
                        <span className="text-slate-300 font-bold max-w-[150px] truncate">{selectedQrInvoice.userEmail}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">ڕێگەی پارەدان:</span>
                        <span className="text-white font-black">{selectedQrInvoice.paymentMethod}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">بڕی پارە:</span>
                        <span className="text-emerald-400 font-black">{selectedQrInvoice.amount.toLocaleString("ku-IQ")} دینار</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">کۆدی کارلێک (Transaction ID):</span>
                        <span className="text-slate-400 font-bold text-[9px] truncate max-w-[130px]">{selectedQrInvoice.transactionId}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">بارودۆخ:</span>
                        <span className={`font-black ${
                          selectedQrInvoice.status === "approved" 
                            ? "text-emerald-400" 
                            : selectedQrInvoice.status === "rejected" 
                            ? "text-rose-400" 
                            : "text-amber-500"
                        }`}>
                          {selectedQrInvoice.status === "approved" ? "پەسەندکراو" : selectedQrInvoice.status === "rejected" ? "ڕەتکراوە" : "چاوەڕوان (Pending)"}
                        </span>
                      </div>
                      
                      {selectedQrInvoice.receiptScreenshot && (
                        <div className="pt-2 border-t border-slate-800 space-y-1">
                          <span className="text-slate-500 text-[9px] block">وێنەی پسوولەی پارەدان (هاوپێچکراو):</span>
                          <div className="relative w-full max-h-[140px] rounded-lg overflow-hidden border border-slate-800 bg-slate-950">
                            <img 
                              src={selectedQrInvoice.receiptScreenshot} 
                              alt="Attached screenshot receipt" 
                              className="w-full h-auto object-contain max-h-[140px] mx-auto"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    <p className="text-[9px] text-slate-500 leading-normal max-w-[250px] mx-auto">
                      بۆ بەڕێوەبەر: ئەم کۆدە بە کامێرای مۆبایلەکەت سکان بکە یان ئامێری سکانەرەکە لە ئەپی واتسئاپ بۆ سەلماندن و نوێکردنەوەی باری فاتورەکە.
                    </p>

                    <button
                      type="button"
                      onClick={() => setShowPdfInvoice(selectedQrInvoice)}
                      className="w-full mt-2 bg-slate-950 hover:bg-slate-900 text-amber-400 hover:text-amber-300 border border-slate-800 hover:border-slate-700 py-2.5 rounded-xl text-[10px] font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                    >
                      <FileDown size={12} />
                      <span>دروستکردنی فایلی PDFی فاتورە</span>
                    </button>
                  </motion.div>
                ) : (
                  <motion.div
                    key="placeholder"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-3"
                  >
                    <div className="w-16 h-16 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-center text-slate-700 mx-auto">
                      <QrCode size={28} className="animate-pulse text-slate-600" />
                    </div>
                    <h4 className="text-xs font-bold text-slate-400">سەلمێنەری کۆدی QR ئامادەیە</h4>
                    <p className="text-[10px] text-slate-500 max-w-[200px] mx-auto leading-relaxed">
                      تکایە یەکێک لە فاتورەکانی لای ڕاست هەڵبژێرە بۆ بەرهەمهێنانی کۆدی سکانکردن بۆ بەڕێوەبەر.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}
      </div>

      {/* Invoice Creator Payment Modal */}
      <AnimatePresence>
        {showInvoiceCreator && selectedPlan && (
          <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg p-5 md:p-6 shadow-2xl relative text-right"
            >
              {/* Header */}
              <div className="flex justify-between items-center border-b border-slate-800 pb-3 mb-4">
                <h3 className="text-md font-black text-white flex items-center gap-2">
                  <FileText className="text-amber-500" size={18} />
                  <span>دروستکردنی فاتورەی فەرمی کڕینی پاکێج</span>
                </h3>
                <button 
                  onClick={() => setShowInvoiceCreator(false)}
                  className="text-slate-500 hover:text-white font-bold text-xs"
                >
                  داخستن
                </button>
              </div>

              {!activeCreatedInvoice ? (
                // Step 1: Payment Method Selector
                <div className="space-y-5">
                  <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex justify-between items-center">
                    <div>
                      <div className="text-[10px] text-slate-500 font-bold">پاکێجی هەڵبژێردراو</div>
                      <div className="text-sm font-extrabold text-white mt-0.5">{selectedPlan.name}</div>
                    </div>
                    <div className="text-left">
                      <div className="text-[10px] text-slate-500 font-bold">بڕی کۆتایی</div>
                      <div className="text-sm font-black text-emerald-400 mt-0.5">{selectedPlan.priceFormatted}</div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-black text-slate-200 mb-2">دەروازەی ناردنی پارەکە هەڵبژێرە:</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod("FIB")}
                        className={`p-4 rounded-2xl border font-bold text-xs flex flex-col items-center gap-2 cursor-pointer transition-all ${
                          paymentMethod === "FIB"
                            ? "bg-amber-500/10 border-amber-500 text-amber-500"
                            : "bg-slate-950 border-slate-800 text-slate-400"
                        }`}
                      >
                        <div className="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 font-black flex items-center justify-center text-xs">FIB</div>
                        <span>FIB Bank</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaymentMethod("FastPay")}
                        className={`p-4 rounded-2xl border font-bold text-xs flex flex-col items-center gap-2 cursor-pointer transition-all ${
                          paymentMethod === "FastPay"
                            ? "bg-pink-500/10 border-pink-500 text-pink-500"
                            : "bg-slate-950 border-slate-800 text-slate-400"
                        }`}
                      >
                        <div className="w-8 h-8 rounded-lg bg-pink-500 text-white font-black flex items-center justify-center text-xs font-mono">Fast</div>
                        <span>FastPay Wallet</span>
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 items-center bg-slate-950/50 p-4 rounded-2xl border border-slate-800">
                    <div className="flex-1 text-xs text-slate-400 leading-relaxed space-y-2 text-right">
                      <div className="font-bold text-amber-500 flex items-center gap-1.5 justify-end">
                        <Sparkles size={13} className="text-amber-400 animate-pulse" />
                        <span>سکانی کۆد بکە بۆ دانی پارە</span>
                      </div>
                      {paymentMethod === "FIB" ? (
                        <p>
                          ١. بڕی <span className="text-emerald-400 font-extrabold">{selectedPlan.priceFormatted}</span> بنێرە بۆ حسابی فەرمی <span className="text-white font-extrabold font-mono">FIB-4039-2010</span>.
                          <br />
                          ٢. دەتوانیت بە ئەپی FIB کۆدی بەرامبەر سکان بکەیت بۆ ناردنی خێرا، یان دوای گواستنەوە دوگمەی ژێرەوە دابگریت.
                        </p>
                      ) : (
                        <p>
                          ١. بڕی <span className="text-emerald-400 font-extrabold">{selectedPlan.priceFormatted}</span> بنێرە بۆ ژمارەی <span className="text-white font-extrabold font-mono">0750 123 4567</span>.
                          <br />
                          ٢. کۆدی بەرامبەر لە ئەپی FastPay سکان بکە بۆ ئاسانکاری و کاتی کەمتر، پاشان فاتورەکەت دروستبکە.
                        </p>
                      )}
                    </div>
                    
                    <div className="bg-white p-2.5 rounded-xl border border-slate-700/50 shrink-0 shadow-lg shadow-black/40 flex flex-col items-center gap-1">
                      <img 
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&color=0f172a&bgcolor=ffffff&qzone=1&data=${encodeURIComponent(
                          paymentMethod === "FIB" 
                            ? `FIB-Pay: Account=FIB-4039-2010 | Amount=${selectedPlan.price.toLocaleString("en-US")} IQD | Plan=${selectedPlan.id}`
                            : `FastPay-Pay: Phone=07501234567 | Amount=${selectedPlan.price.toLocaleString("en-US")} IQD | Plan=${selectedPlan.id}`
                        )}`}
                        alt="Payment QR"
                        className="w-[110px] h-[110px] object-contain rounded-md"
                        referrerPolicy="no-referrer"
                      />
                      <span className="text-[9px] text-slate-500 font-black font-mono">
                        {paymentMethod === "FIB" ? "FIB QUICK-PAY" : "FASTPAY SCAN"}
                      </span>
                    </div>
                  </div>

                  {/* Dummy File Upload Zone (Screenshot receipt) */}
                  <div className="space-y-2">
                    <label className="block text-xs font-black text-slate-200">
                      پاشکۆکردنی پسوولەی پارەدان (Receipt Screenshot):
                    </label>
                    
                    <div
                      onDragEnter={handleDrag}
                      onDragOver={handleDrag}
                      onDragLeave={handleDrag}
                      onDrop={handleDrop}
                      className={`relative border-2 border-dashed rounded-2xl p-5 text-center transition-all ${
                        dragActive
                          ? "border-amber-500 bg-amber-500/10"
                          : uploadedReceipt
                          ? "border-emerald-500/50 bg-emerald-500/5"
                          : "border-slate-800 bg-slate-950/40 hover:border-slate-700/60"
                      }`}
                    >
                      <input
                        id="receipt-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleChange}
                      />
                      
                      {uploadedReceipt ? (
                        <div className="flex flex-col items-center gap-3">
                          <div className="relative w-24 h-24 rounded-lg overflow-hidden border border-slate-700/80 shadow-inner group">
                            <img
                              src={uploadedReceipt}
                              alt="Receipt proof"
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <span className="text-[10px] text-white">وێنەی پاشکۆکراو</span>
                            </div>
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs font-bold text-emerald-400 flex items-center gap-1 justify-center">
                              <CheckCircle size={13} />
                              <span>پسوولە بە سەرکەوتوویی پاشکۆکرا</span>
                            </p>
                            <p className="text-[9px] text-slate-500 max-w-[250px] truncate mx-auto" dir="ltr">
                              {receiptFileName || "attached_receipt.png"}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={handleRemoveFile}
                            className="text-[10px] text-rose-400 hover:text-rose-300 font-bold bg-rose-500/10 hover:bg-rose-500/20 px-3 py-1 rounded-xl transition flex items-center gap-1 cursor-pointer"
                          >
                            <Trash2 size={11} />
                            <span>سڕینەوەی وێنە</span>
                          </button>
                        </div>
                      ) : (
                        <label
                          htmlFor="receipt-upload"
                          className="flex flex-col items-center gap-2 cursor-pointer"
                        >
                          <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400">
                            <UploadCloud size={18} className={dragActive ? "text-amber-500 animate-bounce" : "text-slate-400"} />
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs font-bold text-slate-300">
                              {dragActive ? "وێنەکە لێرە بەربدەوە..." : "وێنەی پسوولەکە ڕابکێشە ئێرە یان کلیک بکە"}
                            </p>
                            <p className="text-[10px] text-slate-500">
                              پشتیوانی لە وێنەی JPG، PNG دەکات بۆ سەلماندنی ناردنی پارەکە
                            </p>
                          </div>
                        </label>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={handleCreateInvoice}
                    className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 py-3.5 rounded-2xl font-black text-sm transition-all shadow-lg active:scale-95 cursor-pointer"
                  >
                    دروستکردنی فاتورە و جێبەجێکردن
                  </button>
                </div>
              ) : (
                // Step 2: Invoice Display & Send to WhatsApp
                <div className="space-y-5">
                  {/* Styled Invoice Card */}
                  <div className="bg-white text-slate-950 p-5 rounded-2xl shadow-inner border border-slate-200 text-right space-y-4">
                    {/* Invoice header */}
                    <div className="flex justify-between items-center border-b border-slate-200 pb-3">
                      <div>
                        <div className="text-[10px] text-slate-400 font-bold uppercase">SAS No-Code Platform</div>
                        <div className="text-sm font-black text-slate-900">{activeCreatedInvoice.id}</div>
                      </div>
                      <div className="bg-amber-100 text-amber-800 text-[9px] font-black px-2.5 py-1 rounded-full border border-amber-200 uppercase">
                        {activeCreatedInvoice.status === "pending" ? "چاوەڕوان (Pending)" : "پەسەندکراو"}
                      </div>
                    </div>

                    {/* Meta fields */}
                    <div className="grid grid-cols-2 gap-3 text-xs border-b border-slate-100 pb-3">
                      <div>
                        <span className="text-slate-400 block text-[9px]">کڕیار:</span>
                        <span className="font-mono text-slate-800 truncate block">{activeCreatedInvoice.userEmail}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[9px]">بەرواری فاتورە:</span>
                        <span className="font-semibold text-slate-800">{activeCreatedInvoice.invoiceDate}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[9px]">ڕێگەی پێدان:</span>
                        <span className="font-bold text-slate-800">{activeCreatedInvoice.paymentMethod}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[9px]">کۆدی تەرخانکردن:</span>
                        <span className="font-mono text-slate-600 block truncate">{activeCreatedInvoice.transactionId}</span>
                      </div>
                    </div>

                    {/* Plan details line */}
                    <div className="flex justify-between items-center text-xs">
                      <div>
                        <span className="font-bold text-slate-800">{activeCreatedInvoice.planName}</span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">بەشداری چالاککردنی خزمەتگوزاری مانگانە</span>
                      </div>
                      <div className="text-slate-900 font-black text-sm">{activeCreatedInvoice.amount.toLocaleString("ku-IQ")} دینار</div>
                    </div>

                    {/* QR Code section */}
                    <div className="border-t border-dashed border-slate-200 pt-4 flex flex-col sm:flex-row items-center gap-4 justify-between">
                      <div className="text-right space-y-1">
                        <span className="text-[10px] font-black text-slate-800 block">سکانی کۆدی سەلماندنی فاتورە</span>
                        <p className="text-[9px] text-slate-500 leading-relaxed max-w-[240px]">
                          ئەم کۆدە زانیاری فەرمی ئەم فاتورەیەی تێدایە. بۆ سەلماندن و خێراکردنی پرۆسەی پەسەندکردن لەلایەن بەڕێوەبەرەوە بەکاردێت.
                        </p>
                      </div>
                      <div className="bg-slate-50 p-2 rounded-xl border border-slate-200/80 shadow-sm flex flex-col items-center gap-1 shrink-0">
                        <img 
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=110x110&color=0f172a&bgcolor=ffffff&qzone=1&data=${encodeURIComponent(
                            activeCreatedInvoice.paymentMethod === "FIB" 
                              ? `FIB-INV: Account=FIB-4039-2010 | Amount=${activeCreatedInvoice.amount.toLocaleString("en-US")} IQD | ID=${activeCreatedInvoice.id} | Txn=${activeCreatedInvoice.transactionId}`
                              : `FastPay-INV: Phone=07501234567 | Amount=${activeCreatedInvoice.amount.toLocaleString("en-US")} IQD | ID=${activeCreatedInvoice.id} | Txn=${activeCreatedInvoice.transactionId}`
                          )}`}
                          alt="Invoice QR"
                          className="w-[90px] h-[90px] object-contain rounded-md"
                          referrerPolicy="no-referrer"
                        />
                        <span className="text-[8px] text-slate-400 font-extrabold font-mono tracking-wider">
                          {activeCreatedInvoice.paymentMethod === "FIB" ? "FIB OFFICIAL" : "FASTPAY VERIFIED"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* PDF Document Creator Action */}
                  <div className="bg-slate-950/60 border border-slate-800 p-3.5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-right">
                    <div className="space-y-0.5">
                      <span className="text-xs font-black text-white flex items-center gap-1.5">
                        <FileText size={14} className="text-amber-500 animate-pulse" />
                        <span>دروستکردنی ڕاپۆرتی فۆرمی PDFی پسوولەکە</span>
                      </span>
                      <p className="text-[10px] text-slate-400">
                        دەتوانیت فایلی فەرمی PDF بە هەموو مۆر و واژووەکانیەوە دابەزێنیت یان وێنەکەی ڕاستەوخۆ پاشکۆ بکەیت بۆ سەلماندنی ناردنی پارەکە.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowPdfInvoice(activeCreatedInvoice)}
                      className="bg-amber-500 hover:bg-amber-600 text-slate-950 px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shrink-0 cursor-pointer active:scale-95 shadow-md shadow-amber-500/10"
                    >
                      <FileDown size={13} />
                      <span>دروستکردنی PDF</span>
                    </button>
                  </div>

                  {/* WhatsApp Action */}
                  <div className="space-y-3">
                    {activeCreatedInvoice.whatsappSent ? (
                      <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-2xl text-xs space-y-2 leading-relaxed">
                        <div className="font-extrabold flex items-center gap-1">
                          <CheckCircle size={14} />
                          <span>فاتورەکەت ڕەوانەکرا بۆ بەڕێوەبەر!</span>
                        </div>
                        <p>
                          فاتورەکەت نێردرا بۆ واتسئاپی فەرمی SAS. ئێستا، تکایە <span className="text-white font-black underline">مۆبایلی هاوشێوەکراوی بەڕێوەبەر لە لای چەپ / خوارەوەی داشبۆردەکە</span> بەکاربهێنە بۆ بینینی فاتورەکە و پەسەندکردنی (Approve) تا بەشداریەکەت ڕاستەوخۆ کارا بێت!
                        </p>
                      </div>
                    ) : (
                      <div className="text-xs text-amber-500 bg-amber-500/10 border border-amber-500/20 p-3.5 rounded-2xl leading-relaxed">
                        ⚠️ **مەرجی سەرەکی**: پێویستە ئەم فاتورەیە ڕەوانەی واتسئاپی بەڕێوەبەر بکەیت. کاتێک بەڕێوەبەر لە نێو واتسئاپ پەسەندی (Approve) دەکات، پاکێجەکە بۆت دەکرێتەوە.
                      </div>
                    )}

                    {!activeCreatedInvoice.whatsappSent && (
                      <button
                        onClick={handleSendToWhatsApp}
                        className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 py-4 rounded-2xl font-black text-sm transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Phone size={16} />
                        <span>ناردنی فاتورە بۆ واتسئاپی SAS (ڕەزامەندی دەستی)</span>
                      </button>
                    )}

                    <button
                      onClick={() => {
                        setShowInvoiceCreator(false);
                        setSelectedPlan(null);
                        setActiveCreatedInvoice(null);
                      }}
                      className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 py-3 rounded-2xl text-xs font-bold transition"
                    >
                      گەڕانەوە بۆ لایەنەکان
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Live PDF Preview Modal Overlay */}
      <AnimatePresence>
        {showPdfInvoice && (
          <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-sm z-[60] flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl relative text-right flex flex-col max-h-[90vh]"
              dir="rtl"
            >
              {/* Top toolbar */}
              <div className="bg-slate-950 p-4 border-b border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4 shrink-0">
                <div className="flex items-center gap-2">
                  <FileText className="text-amber-500 animate-pulse" size={18} />
                  <div>
                    <h4 className="text-sm font-black text-white">ئامرازی دروستکەر و بینەری PDFی فەرمی</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">پسوولەی ئەلیکترۆنی پاراستنی مافی بەشداربووان</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {/* Auto-attach action */}
                  <button
                    type="button"
                    onClick={() => handleAutoAttachScreenshot(showPdfInvoice)}
                    className={`px-3 py-2 rounded-xl text-xs font-black transition-all duration-300 flex items-center gap-1.5 cursor-pointer ${
                      justAttached
                        ? "bg-emerald-500 text-slate-950 font-bold scale-105 shadow-lg shadow-emerald-500/20 animate-bounce"
                        : "bg-slate-800 hover:bg-slate-700 text-amber-400 hover:text-white border border-slate-700/60"
                    }`}
                  >
                    {justAttached ? (
                      <>
                        <CheckCircle size={13} />
                        <span>پسوولە پاشکۆکرا!</span>
                      </>
                    ) : (
                      <>
                        <Paperclip size={13} />
                        <span>پاشکۆکردنی خۆکار (Auto-Attach)</span>
                      </>
                    )}
                  </button>

                  {/* Download PDF action */}
                  <button
                    type="button"
                    onClick={() => handleDownloadMockPdf(showPdfInvoice)}
                    className="bg-slate-800 hover:bg-slate-700 text-white px-3 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 border border-slate-700/60 cursor-pointer active:scale-95"
                    title="داگرتنی فایلی PDFی ڕاستەقینە"
                  >
                    <FileDown size={13} />
                    <span>داگرتنی PDF</span>
                  </button>

                  {/* Print action */}
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="bg-slate-800 hover:bg-slate-700 text-white px-3 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 border border-slate-700/60 cursor-pointer active:scale-95"
                    title="چاپکردنی فایلی پسوولە"
                  >
                    <Printer size={13} />
                    <span>چاپکردن (Print)</span>
                  </button>

                  {/* Close modal */}
                  <button
                    type="button"
                    onClick={() => {
                      setShowPdfInvoice(null);
                      setJustAttached(false);
                    }}
                    className="p-2 bg-slate-800 hover:bg-rose-500 text-slate-400 hover:text-white rounded-xl transition cursor-pointer"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>

              {/* PDF Document Container Section */}
              <div className="p-5 md:p-8 overflow-y-auto flex-1 custom-scrollbar bg-slate-950/40">
                
                {justAttached && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-3 rounded-2xl text-[11px] font-black mb-4 text-center flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle size={14} />
                    <span>وێنەی سەلمێنەری ئەم پسوولەیە بە سەرکەوتوویی پاشکۆکرا بۆ فۆرمی ناردن! ئێستا دەتوانیت فۆرمەکە ڕاستەوخۆ بنێریت.</span>
                  </motion.div>
                )}

                <div className="bg-white text-slate-950 p-6 md:p-8 rounded-2xl shadow-xl max-w-xl mx-auto border border-slate-200 text-right space-y-6 relative overflow-hidden font-sans">
                  {/* Watermark Logo */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03] select-none">
                    <div className="text-[120px] font-black rotate-12 uppercase tracking-widest text-slate-950">SAS</div>
                  </div>

                  {/* Official Stamp */}
                  <div className="absolute bottom-8 left-8 border-4 border-emerald-600/60 border-double text-emerald-600/70 rounded-full w-24 h-24 flex flex-col items-center justify-center rotate-[-12deg] font-sans font-black tracking-tighter select-none pointer-events-none scale-90">
                    <span className="text-[9px]">SAS PLATFORM</span>
                    <span className="text-[11px] border-y border-emerald-600/50 my-0.5 px-1">BILLING</span>
                    <span className="text-[8px]">OFFICIAL</span>
                  </div>

                  {/* Header info */}
                  <div className="flex justify-between items-start border-b border-slate-200 pb-5">
                    <div className="space-y-1">
                      <h2 className="text-lg font-black text-slate-900 tracking-tight">SAS PLATFORM CO.</h2>
                      <p className="text-[10px] text-slate-500 leading-normal font-medium">
                        پلاتفۆرمی فەرمی ساس بۆ بەرهەمهێنانی نەرمەکاڵا و یاری ٣ ڕەهەندی<br />
                        ناونیشان: عێراق، هەرێمی کوردستان، هەولێر، جادەی گەشەپێدان<br />
                        پەیوەندی: support@sasplatform.com
                      </p>
                    </div>
                    <div className="text-left space-y-1">
                      <span className="bg-slate-100 text-slate-800 text-[9px] font-black px-3 py-1 rounded-full border border-slate-200 tracking-wider">
                        RECEIPT / پسوولە
                      </span>
                      <p className="text-[10px] text-slate-400 font-mono pt-1">ID: {showPdfInvoice.id}</p>
                    </div>
                  </div>

                  {/* Invoice Metadata */}
                  <div className="grid grid-cols-2 gap-4 text-xs border-b border-slate-100 pb-5">
                    <div>
                      <span className="text-slate-400 block text-[9px] font-bold">بۆ بەکارهێنەر (Billed To):</span>
                      <span className="font-bold text-slate-850 font-mono block truncate">{showPdfInvoice.userEmail}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[9px] font-bold">بەرواری پسوولە:</span>
                      <span className="font-semibold text-slate-800">{showPdfInvoice.invoiceDate}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[9px] font-bold">شێوازی پارەدان (Payment):</span>
                      <span className="font-black text-amber-600">{showPdfInvoice.paymentMethod} Proxy Gateway</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[9px] font-bold">کۆدی کارلێک (Transaction ID):</span>
                      <span className="font-mono text-slate-500 font-bold block truncate">{showPdfInvoice.transactionId}</span>
                    </div>
                  </div>

                  {/* Product Details Table */}
                  <div className="space-y-2">
                    <div className="grid grid-cols-12 text-[10px] font-black text-slate-400 uppercase tracking-wider border-b border-slate-200 pb-2">
                      <div className="col-span-6 text-right">خزمەتگوزاری / بەرهەم</div>
                      <div className="col-span-2 text-center">دانە</div>
                      <div className="col-span-4 text-left">کۆی گشتی (IQD)</div>
                    </div>

                    <div className="grid grid-cols-12 text-xs font-bold text-slate-800 py-2 border-b border-slate-100">
                      <div className="col-span-6 text-right">
                        <span>پاکێجی فەرمی بەشداری: {showPdfInvoice.planName}</span>
                        <span className="text-[9px] text-slate-400 block font-normal mt-0.5">چالاککردنی سەرجەم خزمەتگوزارییەکانی دروستکردنی پڕۆژە بێ کۆد</span>
                      </div>
                      <div className="col-span-2 text-center font-mono">1</div>
                      <div className="col-span-4 text-left font-mono">{showPdfInvoice.amount.toLocaleString()} IQD</div>
                    </div>
                  </div>

                  {/* Total calculation */}
                  <div className="flex justify-end pt-2">
                    <div className="w-1/2 space-y-1.5">
                      <div className="flex justify-between text-xs text-slate-500">
                        <span>کۆی نرخ:</span>
                        <span className="font-mono">{showPdfInvoice.amount.toLocaleString()} IQD</span>
                      </div>
                      <div className="flex justify-between text-xs text-slate-500">
                        <span>باج و خزمەتگوزاری:</span>
                        <span className="font-mono">0 IQD</span>
                      </div>
                      <div className="flex justify-between items-center text-sm font-black text-slate-900 border-t border-slate-200 pt-2">
                        <span>کۆی گشتی (Grand Total):</span>
                        <span className="font-mono text-emerald-600 text-base">{showPdfInvoice.amount.toLocaleString()} IQD</span>
                      </div>
                    </div>
                  </div>

                  {/* Signature Section */}
                  <div className="pt-6 border-t border-slate-100 flex justify-between items-end">
                    <div className="space-y-1 max-w-[280px]">
                      <span className="text-[9px] font-black text-slate-400 uppercase block">ڕێنمایی فەرمی:</span>
                      <p className="text-[8.5px] text-slate-500 leading-relaxed font-medium">
                        ئەم پسوولەیە وەک مۆری دڵنیایی و سەلماندنی فەرمی پارەدان بەکاردێت. تکایە پاشکۆی بکە و بیبنێرە بۆ واتسئاپ تا ڕاستەوخۆ لەلایەن ئادمینەوە پەسەند بکرێت.
                      </p>
                    </div>
                    <div className="text-left font-sans pr-2">
                      <span className="text-[10px] text-slate-400 block font-bold">واژووی دەسەڵاتدار</span>
                      <div className="h-10 w-28 flex items-center justify-center opacity-80 select-none">
                        <svg className="w-full h-full stroke-blue-600" viewBox="0 0 100 40" fill="none">
                          <path d="M10,30 Q30,10 50,25 T90,20" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                      </div>
                      <span className="text-[9px] text-slate-500 font-bold block">مودیری بەشی دارایی (Billing)</span>
                    </div>
                  </div>

                  {/* Scannable Barcode representation & status bar */}
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-150 flex items-center justify-between text-[10px]">
                    <div className="font-mono text-slate-400">Barcode Verification: {showPdfInvoice.id}</div>
                    <div className="font-bold text-amber-600 flex items-center gap-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                      <span>چاوەڕێی پەسەندکردنی بەڕێوەبەر</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom bar */}
              <div className="bg-slate-950 p-4 border-t border-slate-800 text-center text-xs shrink-0 flex items-center justify-between">
                <span className="text-slate-500 text-[10px]">سیستەمی فەرمی حیساباتی SAS - هەموو مافێک پارێزراوە</span>
                <button
                  type="button"
                  onClick={() => {
                    setShowPdfInvoice(null);
                    setJustAttached(false);
                  }}
                  className="bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer active:scale-95"
                >
                  داخستنی لاپەڕە
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
