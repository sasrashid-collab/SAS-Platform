import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  TrendingUp, 
  DollarSign, 
  Users, 
  FileSpreadsheet, 
  Printer, 
  Search, 
  Filter, 
  CheckCircle, 
  Clock, 
  XCircle, 
  ArrowDownToLine,
  ChevronDown,
  ChevronUp,
  FileText,
  Percent,
  Calendar
} from "lucide-react";
import { Invoice, DigitalProduct } from "../types";

interface FinancialReportsProps {
  invoices: Invoice[];
  createdProducts: DigitalProduct[];
  userEmail: string;
}

export default function FinancialReports({ invoices, createdProducts, userEmail }: FinancialReportsProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "approved" | "pending" | "rejected">("all");
  const [activeReportTab, setActiveReportTab] = useState<"overview" | "invoices" | "products">("overview");

  // Calculations
  const approvedInvoices = invoices.filter(inv => inv.status === "approved");
  const pendingInvoices = invoices.filter(inv => inv.status === "pending");
  const rejectedInvoices = invoices.filter(inv => inv.status === "rejected");

  const totalSubscriptionRevenue = approvedInvoices.reduce((sum, inv) => sum + inv.amount, 0);
  const pendingSubscriptionVolume = pendingInvoices.reduce((sum, inv) => sum + inv.amount, 0);

  // All product sales (overall system-wide)
  const totalProductSalesCount = createdProducts.reduce((sum, p) => sum + (p.salesCount || 0), 0);
  const totalProductRevenue = createdProducts.reduce((sum, p) => sum + ((p.salesCount || 0) * (p.price || 0)), 0);

  // User-specific product sales (Current developer)
  const myProducts = createdProducts.filter(p => p.creatorEmail === userEmail);
  const myProductSalesCount = myProducts.reduce((sum, p) => sum + (p.salesCount || 0), 0);
  const myProductRevenue = myProducts.reduce((sum, p) => sum + ((p.salesCount || 0) * (p.price || 0)), 0);

  // Filter invoices for table
  const filteredInvoices = invoices.filter(inv => {
    const matchesSearch = inv.userEmail.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          inv.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          inv.planName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || inv.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Filter products for table
  const filteredProducts = createdProducts.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.creatorEmail.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  // Export Subscription Invoices to CSV
  const handleExportInvoicesCSV = () => {
    const headers = ["Invoice ID", "User Email", "Plan Name", "Amount (IQD)", "Payment Method", "Status", "Date", "Transaction ID"];
    const rows = invoices.map(inv => [
      inv.id,
      inv.userEmail,
      inv.planName,
      inv.amount,
      inv.paymentMethod,
      inv.status.toUpperCase(),
      inv.invoiceDate,
      inv.transactionId
    ]);

    const csvContent = [headers, ...rows]
      .map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `SAS_Subscription_Invoices_Report_${new Date().toLocaleDateString("ku-IQ")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export Products Sales to CSV
  const handleExportProductsCSV = () => {
    const headers = ["Product ID", "Product Name", "Creator Email", "Type", "Unit Price (IQD)", "Sales Count", "Total Revenue (IQD)", "Status"];
    const rows = createdProducts.map(p => [
      p.id,
      p.name,
      p.creatorEmail,
      p.type.toUpperCase(),
      p.price,
      p.salesCount || 0,
      (p.salesCount || 0) * p.price,
      p.isPublished ? "PUBLISHED" : "DRAFT"
    ]);

    const csvContent = [headers, ...rows]
      .map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `SAS_Products_Sales_Report_${new Date().toLocaleDateString("ku-IQ")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Trigger Print Report
  const handlePrintReport = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const invoicesListHtml = invoices.map(inv => `
      <tr style="border-bottom: 1px solid #e2e8f0; text-align: right;">
        <td style="padding: 10px; font-family: monospace;">${inv.id}</td>
        <td style="padding: 10px;">${inv.userEmail}</td>
        <td style="padding: 10px;">${inv.planName}</td>
        <td style="padding: 10px; font-family: monospace;">${inv.amount.toLocaleString()} IQD</td>
        <td style="padding: 10px;">${inv.paymentMethod}</td>
        <td style="padding: 10px; font-weight: bold; color: ${inv.status === 'approved' ? '#10b981' : inv.status === 'rejected' ? '#ef4444' : '#f59e0b'}">${inv.status.toUpperCase()}</td>
        <td style="padding: 10px;">${inv.invoiceDate}</td>
      </tr>
    `).join("");

    const productsListHtml = createdProducts.map(p => `
      <tr style="border-bottom: 1px solid #e2e8f0; text-align: right;">
        <td style="padding: 10px;">${p.name}</td>
        <td style="padding: 10px;">${p.creatorEmail}</td>
        <td style="padding: 10px; text-transform: uppercase;">${p.type}</td>
        <td style="padding: 10px; font-family: monospace;">${p.price.toLocaleString()} IQD</td>
        <td style="padding: 10px; font-family: monospace;">${p.salesCount || 0}</td>
        <td style="padding: 10px; font-family: monospace; font-weight: bold; color: #10b981;">${((p.salesCount || 0) * p.price).toLocaleString()} IQD</td>
      </tr>
    `).join("");

    printWindow.document.write(`
      <html>
        <head>
          <title>ڕاپۆرتی دارایی گشتی - SAS PLATFORM</title>
          <style>
            body { font-family: system-ui, -apple-system, sans-serif; direction: rtl; padding: 40px; color: #1e293b; }
            .header { text-align: center; border-bottom: 3px double #cbd5e1; padding-bottom: 20px; margin-bottom: 30px; }
            .title { font-size: 24px; font-weight: 900; margin: 0; color: #0f172a; }
            .subtitle { font-size: 14px; color: #64748b; margin-top: 5px; }
            .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 40px; }
            .stat-card { border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; text-align: center; background: #f8fafc; }
            .stat-label { font-size: 11px; color: #64748b; font-weight: bold; margin-bottom: 5px; text-transform: uppercase; }
            .stat-value { font-size: 20px; font-weight: 800; color: #0f172a; }
            .section-title { font-size: 16px; font-weight: bold; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; margin-top: 40px; margin-bottom: 15px; color: #0f172a; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 12px; }
            th { background: #f1f5f9; padding: 12px 10px; font-weight: bold; text-align: right; border-bottom: 2px solid #cbd5e1; }
            .stamp { text-align: left; margin-top: 50px; font-size: 11px; color: #94a3b8; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1 class="title">ڕاپۆرتی دارایی و باری گشتی پلاتفۆرمی SAS</h1>
            <div class="subtitle">ڕاپۆرتی بەرهەمەهێنراو لە ڕێکەوتی: ${new Date().toLocaleString("ku-IQ")}</div>
          </div>

          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-label">کۆی داهاتی بەشداری پاکێجەکان (پەسەندکراو)</div>
              <div class="stat-value">${totalSubscriptionRevenue.toLocaleString()} IQD</div>
            </div>
            <div class="stat-card">
              <div class="stat-label">کۆی داهاتی فرۆشی ئەندامان (بەرهەمەکان)</div>
              <div class="stat-value">${totalProductRevenue.toLocaleString()} IQD</div>
            </div>
            <div class="stat-card">
              <div class="stat-label">کۆی گشتی فرۆشراو لە پلاتفۆرم</div>
              <div class="stat-value">${totalProductSalesCount} جار</div>
            </div>
          </div>

          <div class="section-title">١. مێژووی پسوولەکانی بەشداربوون و پاکێجەکان</div>
          <table>
            <thead>
              <tr>
                <th>کۆدی پسوولە</th>
                <th>ئیمەیڵی بەشداربوو</th>
                <th>ناوی پاکێج</th>
                <th>بڕی دراو</th>
                <th>ڕێگای پارەدان</th>
                <th>بارودۆخ</th>
                <th>ڕێکەوت</th>
              </tr>
            </thead>
            <tbody>
              ${invoicesListHtml || '<tr><td colspan="7" style="padding: 20px; text-align: center; color: #94a3b8;">هیچ پسوولەیەک تۆمار نەکراوە.</td></tr>'}
            </tbody>
          </table>

          <div class="section-title">٢. ڕاپۆرتی بەرهەمە دیجیتاڵییەکان و داهاتی ئەندامان</div>
          <table>
            <thead>
              <tr>
                <th>ناوی بەرهەم</th>
                <th>ئیمەیڵی دروستکەر</th>
                <th>جۆر</th>
                <th>نرخی یەکە</th>
                <th>ژمارەی فرۆشتن</th>
                <th>داهاتی کۆکراوە</th>
              </tr>
            </thead>
            <tbody>
              ${productsListHtml || '<tr><td colspan="6" style="padding: 20px; text-align: center; color: #94a3b8;">هیچ بەرهەمێک لە کۆگادا نییە.</td></tr>'}
            </tbody>
          </table>

          <div class="stamp">
            <p>سیستەمی ژمێریاری خۆکار - SAS Platform Automation System</p>
            <p>پەسەندکراوە لەلایەن کۆنسۆلی ئەمنی بەڕێوەبەر</p>
          </div>

          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div id="financial-reports-panel" className="space-y-6 text-right" dir="rtl">
      
      {/* Upper Cards Area */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        {/* Total subscription approved revenue */}
        <div id="stat-sub-approved" className="bg-slate-900 border border-slate-800/80 p-5 rounded-2xl flex items-center justify-between relative overflow-hidden">
          <div className="absolute top-0 left-0 w-16 h-16 bg-emerald-500/5 rounded-full filter blur-xl pointer-events-none" />
          <div className="space-y-1">
            <span className="text-[10px] text-slate-500 block font-bold">داهاتی پاکێجەکان (پەسەندکراو)</span>
            <span className="text-lg font-black text-emerald-400 font-mono block">
              {totalSubscriptionRevenue.toLocaleString("ku-IQ")} <span className="text-[10px] font-sans">دینار</span>
            </span>
          </div>
          <div className="w-10 h-10 bg-emerald-500/10 text-emerald-400 rounded-xl flex items-center justify-center">
            <DollarSign size={18} />
          </div>
        </div>

        {/* Total pending subscriptions volume */}
        <div id="stat-sub-pending" className="bg-slate-900 border border-slate-800/80 p-5 rounded-2xl flex items-center justify-between relative overflow-hidden">
          <div className="absolute top-0 left-0 w-16 h-16 bg-amber-500/5 rounded-full filter blur-xl pointer-events-none" />
          <div className="space-y-1">
            <span className="text-[10px] text-slate-500 block font-bold">بڕی چاوەڕوان (Pending)</span>
            <span className="text-lg font-black text-amber-400 font-mono block">
              {pendingSubscriptionVolume.toLocaleString("ku-IQ")} <span className="text-[10px] font-sans">دینار</span>
            </span>
          </div>
          <div className="w-10 h-10 bg-amber-500/10 text-amber-500 rounded-xl flex items-center justify-center">
            <Clock size={18} />
          </div>
        </div>

        {/* Total platform developer revenue */}
        <div id="stat-developer-sales" className="bg-slate-900 border border-slate-800/80 p-5 rounded-2xl flex items-center justify-between relative overflow-hidden">
          <div className="absolute top-0 left-0 w-16 h-16 bg-blue-500/5 rounded-full filter blur-xl pointer-events-none" />
          <div className="space-y-1">
            <span className="text-[10px] text-slate-500 block font-bold">داهاتی فرۆشتنی ئەپەکان (گشتی)</span>
            <span className="text-lg font-black text-blue-400 font-mono block">
              {totalProductRevenue.toLocaleString("ku-IQ")} <span className="text-[10px] font-sans">دینار</span>
            </span>
          </div>
          <div className="w-10 h-10 bg-blue-500/10 text-blue-400 rounded-xl flex items-center justify-center">
            <TrendingUp size={18} />
          </div>
        </div>

        {/* Current user specific products revenue */}
        <div id="stat-my-revenue" className="bg-gradient-to-br from-slate-900 to-slate-950 border border-amber-500/15 p-5 rounded-2xl flex items-center justify-between relative overflow-hidden">
          <div className="absolute top-0 left-0 w-16 h-16 bg-amber-500/5 rounded-full filter blur-xl pointer-events-none" />
          <div className="space-y-1">
            <span className="text-[10px] text-amber-500/80 block font-extrabold">داهاتی دروستکراوەکانی خۆت</span>
            <span className="text-lg font-black text-amber-400 font-mono block">
              {myProductRevenue.toLocaleString("ku-IQ")} <span className="text-[10px] font-sans">دینار</span>
            </span>
          </div>
          <div className="w-10 h-10 bg-amber-500/10 text-amber-400 rounded-xl flex items-center justify-center">
            <Percent size={18} />
          </div>
        </div>

      </div>

      {/* Main Reporting Center Card */}
      <div id="reporting-center-card" className="bg-slate-900 border border-slate-800 p-6 md:p-8 rounded-3xl space-y-6">
        
        {/* Navigation & Fast Export Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
          
          {/* View Toggle tabs */}
          <div className="flex items-center gap-1.5 bg-slate-950/80 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => { setActiveReportTab("overview"); setSearchQuery(""); }}
              className={`px-4 py-2 rounded-lg text-xs font-black transition cursor-pointer ${
                activeReportTab === "overview" 
                  ? "bg-slate-800 text-white" 
                  : "text-slate-400 hover:text-white"
              }`}
            >
              پێداچوونەوە و هێڵکاری
            </button>
            <button
              onClick={() => { setActiveReportTab("invoices"); setSearchQuery(""); }}
              className={`px-4 py-2 rounded-lg text-xs font-black transition cursor-pointer ${
                activeReportTab === "invoices" 
                  ? "bg-slate-800 text-white" 
                  : "text-slate-400 hover:text-white"
              }`}
            >
              ڕاپۆرتی پسوولەی بەشداربووان
            </button>
            <button
              onClick={() => { setActiveReportTab("products"); setSearchQuery(""); }}
              className={`px-4 py-2 rounded-lg text-xs font-black transition cursor-pointer ${
                activeReportTab === "products" 
                  ? "bg-slate-800 text-white" 
                  : "text-slate-400 hover:text-white"
              }`}
            >
              ڕاپۆرتی فرۆشی بەرهەمەکان
            </button>
          </div>

          {/* Export / Print Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrintReport}
              className="bg-slate-800 hover:bg-slate-700 hover:text-white text-slate-300 text-xs font-black px-4 py-2.5 rounded-xl border border-slate-700/60 transition active:scale-95 flex items-center gap-1.5 cursor-pointer"
            >
              <Printer size={13} />
              <span>پڕینتکردن / دەرکردنی PDF</span>
            </button>

            {activeReportTab === "invoices" && (
              <button
                onClick={handleExportInvoicesCSV}
                className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-black px-4 py-2.5 rounded-xl transition active:scale-95 flex items-center gap-1.5 cursor-pointer"
              >
                <FileSpreadsheet size={13} />
                <span>داگرتنی فایل (CSV)</span>
              </button>
            )}

            {activeReportTab === "products" && (
              <button
                onClick={handleExportProductsCSV}
                className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-black px-4 py-2.5 rounded-xl transition active:scale-95 flex items-center gap-1.5 cursor-pointer"
              >
                <FileSpreadsheet size={13} />
                <span>داگرتنی فایل (CSV)</span>
              </button>
            )}
          </div>

        </div>

        {/* Tab contents */}
        <AnimatePresence mode="wait">
          
          {/* 1. OVERVIEW GRAPHICAL SUMMARY */}
          {activeReportTab === "overview" && (
            <motion.div
              key="tab-overview"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Left side: Business progress summary */}
                <div className="bg-slate-950/40 border border-slate-800 p-6 rounded-2xl space-y-4">
                  <h4 className="text-xs font-extrabold text-slate-300">پوختەی گەشەکردنی دارایی</h4>
                  <div className="space-y-3.5">
                    
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400">ژمارەی پسوولە چالاکەکان</span>
                      <span className="font-mono font-bold text-white">{approvedInvoices.length} پسوولە</span>
                    </div>

                    <div className="h-px bg-slate-850" />

                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400">ڕێژەی سەرکەوتنی بەشداربوون</span>
                      <span className="font-mono font-bold text-emerald-400">
                        {invoices.length > 0 
                          ? `${Math.round((approvedInvoices.length / invoices.length) * 100)}%` 
                          : "٠%"}
                      </span>
                    </div>

                    <div className="h-px bg-slate-850" />

                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400">کۆی بەرهەمە دیجیتاڵییەکانی پلاتفۆرم</span>
                      <span className="font-mono font-bold text-white">{createdProducts.length} بەرهەم</span>
                    </div>

                    <div className="h-px bg-slate-850" />

                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400">کۆبڕی بازاڕی فرۆشی بەکارهێنەران</span>
                      <span className="font-mono font-bold text-blue-400">
                        {totalProductSalesCount} جار کڕین
                      </span>
                    </div>

                  </div>
                </div>

                {/* Right side: Visual progress bar graph simulation */}
                <div className="bg-slate-950/40 border border-slate-800 p-6 rounded-2xl space-y-4">
                  <h4 className="text-xs font-extrabold text-slate-300">ڕێژەی داهاتەکان بەپێی بەشەکان</h4>
                  
                  <div className="space-y-4">
                    {/* Subscription segment */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center text-[11px]">
                        <span className="text-slate-400 font-bold">داهاتی پاکێجەکانی بەشداربوون (Platform Fee)</span>
                        <span className="font-mono text-emerald-400 font-black">
                          {totalSubscriptionRevenue.toLocaleString()} IQD
                        </span>
                      </div>
                      <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-emerald-500 rounded-full transition-all duration-1000"
                          style={{ 
                            width: totalSubscriptionRevenue + totalProductRevenue > 0 
                              ? `${(totalSubscriptionRevenue / (totalSubscriptionRevenue + totalProductRevenue)) * 100}%` 
                              : "50%" 
                          }}
                        />
                      </div>
                    </div>

                    {/* Developer segment */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center text-[11px]">
                        <span className="text-slate-400 font-bold">داهاتی گشتی بەرهەمەکانی بەکاربەران (User Sales)</span>
                        <span className="font-mono text-blue-400 font-black">
                          {totalProductRevenue.toLocaleString()} IQD
                        </span>
                      </div>
                      <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-500 rounded-full transition-all duration-1000"
                          style={{ 
                            width: totalSubscriptionRevenue + totalProductRevenue > 0 
                              ? `${(totalProductRevenue / (totalSubscriptionRevenue + totalProductRevenue)) * 100}%` 
                              : "50%" 
                          }}
                        />
                      </div>
                    </div>

                    <div className="text-[10px] text-slate-500 leading-normal pt-2">
                      * پلاتفۆرم بە شێوەیەکی ئۆتۆماتیکی پشکی فرۆشی بەکارهێنەران و ئەپلیکەیشنەکان دەپارێزێت و ١٠٠٪ داهاتی فرۆشی ڕاستەوخۆ دەچێتە سەر هەژماری دروستکەری بەرهەمەکە.
                    </div>
                  </div>

                </div>

              </div>
            </motion.div>
          )}

          {/* 2. DETAILED INVOICES TABLE WITH FILTERS */}
          {activeReportTab === "invoices" && (
            <motion.div
              key="tab-invoices"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              {/* Search & Status Controls */}
              <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
                
                {/* Search text */}
                <div className="relative w-full sm:w-72">
                  <Search size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    placeholder="گەڕان بەپێی ئیمێڵ، پسوولە..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pr-10 pl-4 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/60"
                  />
                </div>

                {/* Status Toggle filter */}
                <div className="bg-slate-950 p-1 rounded-xl border border-slate-800 flex items-center gap-1">
                  <button
                    onClick={() => setStatusFilter("all")}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition cursor-pointer ${
                      statusFilter === "all" ? "bg-slate-800 text-white" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    گشتی
                  </button>
                  <button
                    onClick={() => setStatusFilter("approved")}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition cursor-pointer flex items-center gap-1 ${
                      statusFilter === "approved" ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <CheckCircle size={10} />
                    پەسەندکراو
                  </button>
                  <button
                    onClick={() => setStatusFilter("pending")}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition cursor-pointer flex items-center gap-1 ${
                      statusFilter === "pending" ? "bg-amber-500/15 text-amber-400 border border-amber-500/20" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <Clock size={10} />
                    هەڵپەسێردراو
                  </button>
                  <button
                    onClick={() => setStatusFilter("rejected")}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition cursor-pointer flex items-center gap-1 ${
                      statusFilter === "rejected" ? "bg-rose-500/15 text-rose-400 border border-rose-500/20" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <XCircle size={10} />
                    ڕەتکراوە
                  </button>
                </div>

              </div>

              {/* Data Table */}
              <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950/40">
                <table className="w-full text-right border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-900/80 border-b border-slate-800 text-slate-400 font-bold">
                      <th className="p-4">پسوولە</th>
                      <th className="p-4">ئەندامی بەشداربوو</th>
                      <th className="p-4 text-center">پاکێجی بەشداری</th>
                      <th className="p-4 text-center">بڕی دراو</th>
                      <th className="p-4 text-center">ڕێگای پارەدان</th>
                      <th className="p-4 text-center">باری پسوولە</th>
                      <th className="p-4 text-left">ڕێکەوتی واژۆ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredInvoices.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-slate-500">
                          هیچ تۆمارێک نەدۆزرایەوە بۆ پاڵاوتنەکە.
                        </td>
                      </tr>
                    ) : (
                      filteredInvoices.map((inv) => (
                        <tr key={inv.id} className="hover:bg-slate-900/40 transition">
                          <td className="p-4 font-mono font-bold text-white">{inv.id}</td>
                          <td className="p-4 font-mono text-slate-300">{inv.userEmail}</td>
                          <td className="p-4 text-center text-white font-bold">{inv.planName}</td>
                          <td className="p-4 text-center font-mono font-bold text-emerald-400">
                            {inv.amount.toLocaleString("ku-IQ")} د.ع
                          </td>
                          <td className="p-4 text-center">
                            <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] text-slate-300">
                              {inv.paymentMethod}
                            </span>
                          </td>
                          <td className="p-4 text-center">
                            <span className={`inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full ${
                              inv.status === "approved" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                              inv.status === "rejected" ? "bg-rose-500/10 text-rose-400 border border-rose-500/20" :
                              "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                            }`}>
                              {inv.status === "approved" ? "پەسەندکراو" :
                               inv.status === "rejected" ? "ڕەتکراوە" : "چاوەڕوان"}
                            </span>
                          </td>
                          <td className="p-4 text-left text-slate-500 font-mono">{inv.invoiceDate}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {/* 3. DETAILED PRODUCTS SALES REPORT */}
          {activeReportTab === "products" && (
            <motion.div
              key="tab-products"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              {/* Search Control */}
              <div className="flex justify-between items-center">
                <div className="relative w-full sm:w-72">
                  <Search size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    placeholder="گەڕان بەپێی ناوی ئەپ یان دروستکەر..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pr-10 pl-4 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/60"
                  />
                </div>
                <div className="text-[10px] text-slate-400 font-bold">
                  ڕاپۆرتی سەرجەم بەرهەمە دیجیتاڵییە تۆمارکراوەکانی کۆگا
                </div>
              </div>

              {/* Data Table */}
              <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950/40">
                <table className="w-full text-right border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-900/80 border-b border-slate-800 text-slate-400 font-bold">
                      <th className="p-4">ناوی بەرهەم</th>
                      <th className="p-4">ئیمێڵی دروستکەر</th>
                      <th className="p-4 text-center">جۆری پڕۆژە</th>
                      <th className="p-4 text-center">نرخی یەکە</th>
                      <th className="p-4 text-center">ژمارەی فرۆشراو</th>
                      <th className="p-4 text-center">کۆداهات (IQD)</th>
                      <th className="p-4 text-left">باری بڵاوکراوە</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredProducts.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-slate-500">
                          هیچ بەرهەمێک نەدۆزرایەوە بۆ پاڵاوتنەکە.
                        </td>
                      </tr>
                    ) : (
                      filteredProducts.map((p) => {
                        const revenue = (p.salesCount || 0) * (p.price || 0);
                        return (
                          <tr key={p.id} className="hover:bg-slate-900/40 transition">
                            <td className="p-4 font-bold text-white">{p.name}</td>
                            <td className="p-4 font-mono text-slate-400">{p.creatorEmail}</td>
                            <td className="p-4 text-center">
                              <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                                p.type === "app" ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" :
                                p.type === "website" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" :
                                "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                              }`}>
                                {p.type === "app" ? "ئەپ" : p.type === "website" ? "ماڵپەڕ" : "یاری ٣دوری"}
                              </span>
                            </td>
                            <td className="p-4 text-center font-mono text-slate-300 font-bold">
                              {(p.price || 0).toLocaleString("ku-IQ")} IQD
                            </td>
                            <td className="p-4 text-center font-mono font-extrabold text-white">
                              {p.salesCount || 0} جار
                            </td>
                            <td className="p-4 text-center font-mono font-black text-emerald-400">
                              {revenue.toLocaleString("ku-IQ")}
                            </td>
                            <td className="p-4 text-left">
                              <span className={`inline-flex items-center gap-1 text-[10px] font-bold ${
                                p.isPublished ? "text-emerald-400" : "text-slate-500"
                              }`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${
                                  p.isPublished ? "bg-emerald-400 animate-pulse" : "bg-slate-600"
                                }`} />
                                {p.isPublished ? "چالاک لە کۆگا" : "ڕەشنووس"}
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

        </AnimatePresence>

      </div>

    </div>
  );
}
