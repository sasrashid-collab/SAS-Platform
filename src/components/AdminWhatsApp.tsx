import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Phone, Check, X, ShieldAlert, Sparkles, MessageSquare, AlertCircle, RefreshCw, Paperclip, Eye, EyeOff, QrCode, Camera, Scan, Cpu, Filter, HelpCircle, Printer, Download, Share2, History, ChevronDown, FileSpreadsheet, FileDown, Search, BarChart3, TrendingUp } from "lucide-react";
import { Invoice } from "../types";
import jsQR from "jsqr";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

const LEGEND_TRANSLATIONS = {
  ku: {
    title: "ڕێبەری ڕەنگی دۆخی پسوولەكان:",
    approved: "پەسەندکراو",
    pending: "چاوەڕوان",
    rejected: "ڕەتکراوە"
  },
  ar: {
    title: "مفتاح ألوان حالة الفواتير:",
    approved: "مقبول",
    pending: "قيد الانتظار",
    rejected: "مرفوض"
  },
  en: {
    title: "Status Badge Color Key:",
    approved: "Approved",
    pending: "Pending",
    rejected: "Rejected"
  }
};

const WHATSAPP_TRANSLATIONS = {
  ku: {
    adminTitle: "واتسئاپی بەڕێوەبەر",
    adminSubtitle: "هاوشێوەکەری دەسەڵاتی خاوەن پلاتفۆرم",
    lastScanPrefix: "کۆتا سکان (001):",
    qrScannerBtn: "سکانەری QR",
    qrScannerBtnTitle: "سکانکردنی کۆدی QRی پسوولەکان",
    filterLabel: "پاڵاوتنی لیستی پسوولەکان:",
    filterPending: "تەنها هەڵپەسێردراو",
    filterAll: "مێژووی گشتی",
    searchPlaceholder: "گەڕان بەپێی ناسنامەی پسوولە یان ئیمەیڵ...",
    chatWaiting: "چاوەڕوانی نامەی نوێ...",
    chatEmptyHistory: "مێژووی فاتورەکان بەتاڵە...",
    chatWaitingDesc: "کاتێک بەشداربوو فاتورەی بەشداری نوێ دەکات و کلیکی 'ناردن بۆ واتسئاپ' دەکات، فاتورەکە لێرە دەردەکەوێت بۆت تا پەسەندی بکەیت.",
    chatEmptyHistoryDesc: "هیچ فاتورەیەکی نێردراو لە مێژوودا نییە بۆ پیشاندان.",
    todayPendingLabel: "ئەمڕۆ - نامە نوێیە نێردراوەکانی چاوەڕوانی",
    allHistoryLabel: "مێژووی سەرجەم پسوولە نێردراوەکان",
    amountLabel: "بڕی پارە:",
    currencyLabel: "دینار",
    txCodeLabel: "کۆدی کارلێک:",
    invoiceLabel: "فاتورە:",
    proofAttachment: "پسوولەی ناردنی پارە (Screenshot)",
    hideButton: "بشارەوە",
    viewButton: "سەیرکردن",
    noAttachment: "هیچ پسوولەیەک هاوپێچ نەکراوە لەگەڵ ئەم فاتورەیە",
    mockInvoiceQr: "کۆدی تاقیکاری QR پسوولە",
    approvedInvoiceQr: "کۆدی QR پسوولەی پەسەندکراو",
    cameraGuideTooltip: "ئەم کۆدە بە کامێرای مۆبایلەکەت یان سکانەری سەرەوەی لاپەڕەکە سکان بکە بۆ ئەوەی راستەوخۆ پارەکە پشتڕاست بێتەوە و کارا بێت!",
    cameraGuideHelpBtn: "ڕێبەری کامێرا و پرسیارە باوەکان ↗",
    cameraGuideTooltipTitle: "ئەمە سکان بکە بۆ پشتڕاستکردنەوە!",
    approvedStatus: "پەسەندکراوە:",
    registeredLabel: "تۆمارکراو",
    printReceiptBtn: "چاپکردنی پسوولە",
    archiveExportBtn: "ئەرشیفکردن (Export)",
    copiedLabel: "کۆپی کرا!",
    shareReceiptBtn: "هاوبەشکردنی پسوولە",
    showQrBtn: "پیشاندانی QR",
    printHistoryTitle: "مێژووی چاپکردن (Print History Audit Trail)",
    printedTimes: "جار چاپکراوە",
    printJobLabel: "چاپکاری",
    noPrintHistory: "هیچ مێژوویەکی چاپکردن تۆمار نەکراوە بۆ ئەم پسوولەیە.",
    downloadQrBtn: "داگرتنی QR",
    directVerifyBtn: "پشکنین و کاراکردنی ڕاستەوخۆ",
    alreadyDirectVerified: "✓ ئەم پسوولەیە پێشتر بە سەرکەوتوویی کاراکراوە",
    finalStatusLabel: "باری کۆتایی فاتورەکە:",
    finalApprovedLabel: "پەسەندکراوە (Approved)",
    finalRejectedLabel: "ڕەتکراوەتەوە (Rejected)",
    approveButton: "پەسەندکردن",
    rejectButton: "ڕەتکردنەوە",
    scannerTitle: "سکانکەری کۆدی QRی پسوولەکان",
    imageAnalysis: "شیکردنەوەی وێنە",
    analysisDone: "تەواوبوو!",
    analyzing: "شیکردنەوە...",
    waitingCamera: "چاوەڕوانی دەستپێکردنی کامێرا بکە...",
    simScanTitle: "هاوشێوەکەری سکانکردنی خێرا (Simulation Test)",
    simScanNoPending: "هیچ پسوولەیەکی هەڵپەسێردراو نییە بۆ تاقیکردنەوە.",
    simScanSelectPending: "پسوولەیەکی هەڵپەسێردراو هەڵبژێرە بۆ لێکچواندنی سکان:",
    manualPasteLabel: "پاستکردنی دەقی QR بۆ تاقیکردنەوەی دەستی:",
    manualPastePlaceholder: "لێرە دەقی کۆد بنووسە یان بیکە بە هاوبەش...",
    bypassButton: "تێپەڕاندن",
    verifiedQrText: "کۆدی بڕواپێکراو / VERIFIED QR",
    officialApprovalTitle: "پەسەندکردنی فەرمی!",
    officialApprovalDesc1: "پسوولەی فەرمی تایبەت بە ناسنامەی",
    officialApprovalDesc2: "بە سەرکەوتوویی خوێندرایەوە و بڕوا پێکرا!",
    subscriptionActiveSuccess: "خزمەتگوزاری بەشداریکردنەکەت بەبێ کێشە کارا کرا",
    sandboxWarningText: "ئەمە ژینگەیەکی تاقیکاری بەستراوە بۆ تاقیکردنەوەی خێرا.",
    helpModalTitle: "ڕێبەری سکانکردن و پرسیارە باوەکان",
    helpFaqSystemTitle: "سیستەمی سکانەری زیرەکی SAS چییە؟",
    helpFaqSystemDesc: "ئەم سیستەمە ڕێگە دەدات بە مۆدەرەیتەر و کارگێڕانی سیستەمەکە کە پسوولەی کڕینی بەکارهێنەران لەڕێی کۆدی QR سەر تەلەفۆنەکانیان پشتڕاست بکەنەوە و خزمەتگوزارییەکانیان دەسبەجێ کارا بکەن.",
    helpCameraStepTitle: "💡 چۆنێتی بەکارهێنانی کامێرا بۆ پشتڕاستکردنەوە:",
    helpStep1Title: "١. پیشاندانی کۆدی QR",
    helpStep1Desc: "لە ژێر هەر پسوولەیەکی هەڵپەسێردراودا، کلیک لەسەر دوگمەی 'پیشاندانی QR' بکە.",
    helpStep2Title: "٢. کردنەوەی سکانەری سەرەوە",
    helpStep2Desc: "لە بەشی سەرەوەی مۆدیوولەکە کلیک لەسەر 'سکانەری QR' بکە بۆ چالاککردنی کامێرا.",
    helpStep3Title: "٣. ڕێپێدانی کامێرا و سکانکردن",
    helpStep3Desc: "دڵنیابەوە کە مۆڵەتی بەکارهێنانی کامێرا (Camera Permission) دەدەیت بە وێبگەڕەکەت پاشان ڕووی کامێراکە بکە بە ئاراستەی کۆدەکە.",
    helpFaqTitle: "❓ پرسیارە باوەکان (FAQ):",
    helpFaqCameraBlockTitle: "سکانەرەکە بۆچی پەیامی هەڵەی کامێرا یان بلۆککردن نیشان دەدات؟",
    helpFaqCameraBlockDesc: "بەهۆی ئەوەی ئەم پلاتفۆرمە لەناو ژینگەی داخراوی iFrame-ی AI Studio دایە، زۆربەی وێبگەڕەکان بەهۆکاری پاراستنی کڕیار ڕێگە نادەن کامێرای ڕاستەقینە کار بکات.",
    helpFaqNoCameraTitle: "چی بکەم ئەگەر نەتوانم کامێرای ڕاستەقینە کار پێبکەم؟",
    helpFaqNoCameraDesc: "ئێمە چارەسەری نایابمان بۆ داناویت! دەتوانیت لە ڕێگەی 'Mock Scan' (سکانکردنی تاقیکاری) لە مۆدیوولەکەدا تەنها بە یەک کلیک پرۆسەی سکانەکە بە تەواوی تاقیبکەیتەوە. هەروەها دەتوانیت کۆدی پسوولەکە کۆپی بکەیت و لە بەشی تێپەڕاندنی دەستیدا دایبنێیت.",
    helpFaqPhoneScanTitle: "ئایا دەتوانم بە کامێرای مۆبایلەکەم کۆدەکە سکان بکەم؟",
    helpFaqPhoneScanDesc: "بەڵێ! کامێرای ئاسایی مۆبایلەکەت ئاراستەی کۆدی QR بکە، مۆبایلەکەت پێشنیاری بەستەرێکی تاقیکاریت (Simulated Verification URL) بۆ دەکات کە ڕاستەوخۆ دەتباتە سەر سیستەمی فەرمی پشتڕاستکردنەوەی پسوولەکان.",
    understandCloseBtn: "تێگەیشتم و داخستن",
    printPreviewTitle: "پێشبینی چاپکردنی پسوولە",
    printInvoiceSystemTitle: "SAS SMART SYSTEM",
    printInvoiceSystemSubtitle: "پلاتفۆرمی زیرەکی گەشەپێدان و ڕیکلام",
    printInvoiceSystemUrl: "https://ai.studio/build",
    printInvoiceDateLabel: "ڕێکەوت:",
    printInvoiceStatusLabel: "بارودۆخی پسوولە",
    printInvoiceApprovedStatus: "پەسەندکراو / Approved",
    printInvoiceRejectedStatus: "ڕەتکراوە / Rejected",
    printInvoicePendingStatus: "هەڵپەسێردراو / Pending",
    printInvoicePaymentMethod: "ڕێگەی پارەدان",
    printInvoiceDirectedTo: "ئاراستەکراوە بۆ (کڕیار):",
    printInvoiceTxLabel: "ناسنامەی گواستنەوە (Transaction ID):",
    printInvoiceDetailsTitle: "وردەکاری کڕین و بەشداریکردن:",
    printInvoiceTableHeaderItem: "خزمەتگوزاری / پلان",
    printInvoiceTableHeaderQuantity: "ڕێژە",
    printInvoiceTableHeaderTotal: "کۆی گشتی (IQD)",
    printInvoiceTableSubDesc: "بەشداریکردنی نایابی پلاتفۆرم",
    printInvoiceTableCurrency: "د.ع",
    printInvoiceTotalLabel: "کۆی گشتی:",
    printInvoiceFinalAmountLabel: "بڕی کۆتایی دراو:",
    printInvoiceSignatureTitle: "مۆر و واژۆی کارگێڕی (SAS Admin)",
    printInvoiceSignatureElectronic: "پشتڕاستکراوە بە شێوازی ئەلیکترۆنی",
    printInvoiceCloseBtn: "داخستن",
    printInvoicePrintBtn: "چاپکردنی پسوولە",
    webcamNotSupported: "وێبکامەکە یان کامێراکە کار ناکات یان مۆڵەتی پێنەدراوە."
  },
  ar: {
    adminTitle: "واتساب المسؤول",
    adminSubtitle: "محاكي صلاحيات مالك المنصة",
    lastScanPrefix: "آخر مسح (001):",
    qrScannerBtn: "قارئ الـ QR",
    qrScannerBtnTitle: "مسح رمز QR للفواتير",
    filterLabel: "تصفية قائمة الفواتير:",
    filterPending: "المعلقة فقط",
    filterAll: "السجل العام",
    searchPlaceholder: "البحث بمعرف الفاتورة أو البريد...",
    chatWaiting: "في انتظار رسائل جديدة...",
    chatEmptyHistory: "سجل الفواتير فارغ...",
    chatWaitingDesc: "عندما يقوم المشترك بتجديد الفاتورة والنقر على 'إرسال إلى واتساب'، ستظهر الفاتورة هنا للموافقة عليها.",
    chatEmptyHistoryDesc: "لا توجد فواتير مرسلة في السجل لعرضها.",
    todayPendingLabel: "اليوم - الرسائل الجديدة المعلقة في الانتظار",
    allHistoryLabel: "سجل جميع الفواتير المرسلة",
    amountLabel: "المبلغ:",
    currencyLabel: "دينار",
    txCodeLabel: "رمز المعاملة:",
    invoiceLabel: "الفاتورة:",
    proofAttachment: "إيصال إرسال الأموال (Screenshot)",
    hideButton: "إخفاء",
    viewButton: "عرض",
    noAttachment: "لا يوجد إيصال مرفق مع هذه الفاتورة",
    mockInvoiceQr: "رمز QR التجريبي للفاتورة",
    approvedInvoiceQr: "رمز QR للفاتورة المقبولة",
    cameraGuideTooltip: "امسح هذا الرمز بكاميرا هاتفك أو القارئ في أعلى الصفحة لتأكيد وتفعيل الدفع فوراً!",
    cameraGuideHelpBtn: "دليل الكاميرا والأسئلة الشائعة ↗",
    cameraGuideTooltipTitle: "امسح هذا الرمز للتحقق!",
    approvedStatus: "تم القبول:",
    registeredLabel: "مسجل",
    printReceiptBtn: "طباعة الفاتورة",
    archiveExportBtn: "أرشفة وتصدير (Export)",
    copiedLabel: "تم النسخ!",
    shareReceiptBtn: "مشاركة الفاتورة",
    showQrBtn: "عرض الـ QR",
    printHistoryTitle: "سجل تاريخ الطباعة (Print History Audit Trail)",
    printedTimes: "مرات طباعة",
    printJobLabel: "عملية الطباعة",
    noPrintHistory: "لا يوجد سجل طباعة مسجل لهذه الفاتورة.",
    downloadQrBtn: "تحميل الـ QR",
    directVerifyBtn: "التحقق والتنشيط المباشر",
    alreadyDirectVerified: "✓ تم التحقق وتفعيل هذه الفاتورة بنجاح سابقاً",
    finalStatusLabel: "حالة الفاتورة النهائية:",
    finalApprovedLabel: "مقبول (Approved)",
    finalRejectedLabel: "مرفوض (Rejected)",
    approveButton: "موافقة",
    rejectButton: "رفض",
    scannerTitle: "قارئ رموز QR للفواتير",
    imageAnalysis: "تحليل الصورة",
    analysisDone: "اكتمل!",
    analyzing: "تحليل...",
    waitingCamera: "يرجى الانتظار لتشغيل الكاميرا...",
    simScanTitle: "محاكي المسح السريع (Simulation Test)",
    simScanNoPending: "لا توجد فواتير معلقة للاختبار.",
    simScanSelectPending: "اختر فاتورة معلقة لمحاكاة المسح:",
    manualPasteLabel: "لصق نص الـ QR للاختبار اليدوي:",
    manualPastePlaceholder: "اكتب نص الرمز هنا أو ألصقه...",
    bypassButton: "تجاوز",
    verifiedQrText: "رمز معتمد / VERIFIED QR",
    officialApprovalTitle: "الموافقة الرسمية!",
    officialApprovalDesc1: "تم قراءة واعتماد الفاتورة الرسمية للمعرف",
    officialApprovalDesc2: "بنجاح وبشكل موثوق!",
    subscriptionActiveSuccess: "تم تفعيل خدمة اشتراكك بنجاح وبدون أي مشاكل",
    sandboxWarningText: "هذه بيئة اختبارية مغلقة للتجربة السريعة.",
    helpModalTitle: "دليل الكاميرا والأسئلة الشائعة",
    helpFaqSystemTitle: "ما هو نظام قارئ الفواتير الذكي لـ SAS؟",
    helpFaqSystemDesc: "يسمح هذا النظام للمشرفين والمسؤولين بالتحقق من فواتير المشتركين عبر مسح رموز QR مباشرة من هواتفهم لتفعيل خدماتهم فوراً.",
    helpCameraStepTitle: "💡 كيفية استخدام الكاميرا للتحقق:",
    helpStep1Title: "١. عرض رمز الـ QR",
    helpStep1Desc: "تحت أي فاتورة معلقة، انقر على زر 'عرض الـ QR'.",
    helpStep2Title: "٢. فتح القارئ في الأعلى",
    helpStep2Desc: "انقر على 'قارئ ال الـ QR' في الجزء العلوي لتفعيل الكاميرا.",
    helpStep3Title: "٣. السماح بالكاميرا والمسح",
    helpStep3Desc: "تأكد من إعطاء إذن الكاميرا لمتصفحك ثم وجه الكاميرا نحو الرمز.",
    helpFaqTitle: "❓ الأسئلة الشائعة (FAQ):",
    helpFaqCameraBlockTitle: "لماذا يظهر القارئ رسالة خطأ في الكاميرا أو حظر؟",
    helpFaqCameraBlockDesc: "بسبب وجود المنصة داخل إطار عمل مغلق (iFrame) لـ AI Studio، تمنع بعض المتصفحات تشغيل الكاميرا الحقيقية لأسباب أمنية.",
    helpFaqNoCameraTitle: "ماذا أفعل إذا لم أتمكن من تشغيل الكاميرا الحقيقية؟",
    helpFaqNoCameraDesc: "لقد قدمنا لك حلاً ممتازاً! يمكنك استخدام 'Mock Scan' (المسح التجريبي) في الوحدة لمحاكاة العملية بنقرة واحدة بالكامل. كما يمكنك نسخ رمز الفاتورة ووضعه في حقل التجاوز اليدوي.",
    helpFaqPhoneScanTitle: "هل يمكنني مسح الرمز بكاميرا هاتفي الخاصة؟",
    helpFaqPhoneScanDesc: "نعم! وجه كاميرا هاتفك العادية نحو رمز الـ QR، وسيقترح هاتفك رابطاً تجريبياً (Simulated Verification URL) يأخذك مباشرة إلى النظام الرسمي للتحقق من الفواتير.",
    understandCloseBtn: "فهمت وإغلاق",
    printPreviewTitle: "معاينة طباعة الفاتورة",
    printInvoiceSystemTitle: "SAS SMART SYSTEM",
    printInvoiceSystemSubtitle: "المنصة الذكية للتطوير والإعلان",
    printInvoiceSystemUrl: "https://ai.studio/build",
    printInvoiceDateLabel: "التاريخ:",
    printInvoiceStatusLabel: "حالة الفاتورة",
    printInvoiceApprovedStatus: "مقبول / Approved",
    printInvoiceRejectedStatus: "مرفوض / Rejected",
    printInvoicePendingStatus: "قيد الانتظار / Pending",
    printInvoicePaymentMethod: "طريقة الدفع",
    printInvoiceDirectedTo: "موجه إلى (الزبون):",
    printInvoiceTxLabel: "رمز المعاملة (Transaction ID):",
    printInvoiceDetailsTitle: "تفاصيل الشراء والاشتراك:",
    printInvoiceTableHeaderItem: "الخدمة / الخطة",
    printInvoiceTableHeaderQuantity: "الكمية",
    printInvoiceTableHeaderTotal: "الإجمالي (IQD)",
    printInvoiceTableSubDesc: "الاشتراك المميز في المنصة",
    printInvoiceTableCurrency: "د.ع",
    printInvoiceTotalLabel: "الإجمالي:",
    printInvoiceFinalAmountLabel: "المبلغ الإجمالي المدفوع:",
    printInvoiceSignatureTitle: "ختم وتوقيع الإدارة (SAS Admin)",
    printInvoiceSignatureElectronic: "تم التحقق والتوقيع إلكترونياً",
    printInvoiceCloseBtn: "إغلاق",
    printInvoicePrintBtn: "طباعة الفاتورة",
    webcamNotSupported: "كاميرا الويب أو الكاميرا لا تعمل أو لم يتم منحها الإذن."
  },
  en: {
    adminTitle: "WhatsApp Admin",
    adminSubtitle: "Platform Owner Sandbox Simulator",
    lastScanPrefix: "Last Scan (001):",
    qrScannerBtn: "QR Scanner",
    qrScannerBtnTitle: "Scan Invoice QR Codes",
    filterLabel: "Filter Invoice List:",
    filterPending: "Pending Only",
    filterAll: "All Invoices",
    searchPlaceholder: "Search ID or Email...",
    chatWaiting: "Waiting for new messages...",
    chatEmptyHistory: "Invoice history is empty...",
    chatWaitingDesc: "When a subscriber creates a payment invoice and clicks 'Send to WhatsApp', the invoice will appear here for your approval.",
    chatEmptyHistoryDesc: "There are no sent invoices in the history to display.",
    todayPendingLabel: "Today - New Pending Message Queue",
    allHistoryLabel: "History of All Sent Invoices",
    amountLabel: "Amount:",
    currencyLabel: "IQD",
    txCodeLabel: "Tx Code:",
    invoiceLabel: "Invoice:",
    proofAttachment: "Money Transfer Proof (Screenshot)",
    hideButton: "Hide",
    viewButton: "View",
    noAttachment: "No transfer proof attachment for this invoice",
    mockInvoiceQr: "Mock Invoice QR Code",
    approvedInvoiceQr: "Approved Invoice QR Code",
    cameraGuideTooltip: "Scan this code with your phone camera or the scanner on top to instantly verify and activate the payment!",
    cameraGuideHelpBtn: "Camera Guide & FAQs ↗",
    cameraGuideTooltipTitle: "Scan this to verify!",
    approvedStatus: "Approved:",
    registeredLabel: "Registered",
    printReceiptBtn: "Print Receipt",
    archiveExportBtn: "Archive (Export)",
    copiedLabel: "Copied!",
    shareReceiptBtn: "Share Receipt",
    showQrBtn: "Show QR",
    printHistoryTitle: "Print History Audit Trail",
    printedTimes: "times printed",
    printJobLabel: "Print Job",
    noPrintHistory: "No printing history recorded for this receipt.",
    downloadQrBtn: "Download QR",
    directVerifyBtn: "Direct Verify",
    alreadyDirectVerified: "✓ This receipt has been successfully direct-verified",
    finalStatusLabel: "Final Invoice Status:",
    finalApprovedLabel: "Approved",
    finalRejectedLabel: "Rejected",
    approveButton: "Approve",
    rejectButton: "Reject",
    scannerTitle: "Payment Receipt QR Scanner",
    imageAnalysis: "Image Analysis",
    analysisDone: "Done!",
    analyzing: "Analyzing...",
    waitingCamera: "Waiting for camera...",
    simScanTitle: "Quick Scan Simulator",
    simScanNoPending: "No pending invoices to test.",
    simScanSelectPending: "Select a pending invoice to simulate scan:",
    manualPasteLabel: "Paste QR code text for manual bypass:",
    manualPastePlaceholder: "Type code text or paste here...",
    bypassButton: "Bypass",
    verifiedQrText: "VERIFIED QR CODE",
    officialApprovalTitle: "Official Approval!",
    officialApprovalDesc1: "The official invoice belonging to",
    officialApprovalDesc2: "was successfully parsed and verified!",
    subscriptionActiveSuccess: "Your premium subscription service has been fully activated",
    sandboxWarningText: "This is a sandboxed mockup environment for quick testing.",
    helpModalTitle: "Scanner Guide & FAQs",
    helpFaqSystemTitle: "What is SAS Smart Receipt Scanner?",
    helpFaqSystemDesc: "This system allows administrators to scan client invoice QR codes from their phone cameras to instantly approve transactions and activate subscriptions.",
    helpCameraStepTitle: "💡 How to use the camera for verification:",
    helpStep1Title: "1. Display the QR Code",
    helpStep1Desc: "Under any pending receipt, click the 'Show QR' button.",
    helpStep2Title: "2. Open the Scanner",
    helpStep2Desc: "Click the 'QR Scanner' button at the top to activate your device camera.",
    helpStep3Title: "3. Allow Permissions & Scan",
    helpStep3Desc: "Make sure you grant camera access when prompted, then aim your lens at the code.",
    helpFaqTitle: "❓ Frequently Asked Questions (FAQ):",
    helpFaqCameraBlockTitle: "Why does the scanner show a camera error or block?",
    helpFaqCameraBlockDesc: "Because the platform runs inside the secure AI Studio iFrame sandbox, some browsers prevent direct camera access for safety reasons.",
    helpFaqNoCameraTitle: "What should I do if my webcam doesn't work?",
    helpFaqNoCameraDesc: "We built an excellent workaround! Use the 'Mock Scan' button in the scanner utility to trigger a realistic verification cycle in a single click.",
    helpFaqPhoneScanTitle: "Can I scan the QR code with my actual smartphone?",
    helpFaqPhoneScanDesc: "Yes! Scan the code with your normal phone camera, and it will offer a simulated verification URL linking straight to our verification system.",
    understandCloseBtn: "Got it & Close",
    printPreviewTitle: "Receipt Print Preview",
    printInvoiceSystemTitle: "SAS SMART SYSTEM",
    printInvoiceSystemSubtitle: "Smart Development & Advertising Platform",
    printInvoiceSystemUrl: "https://ai.studio/build",
    printInvoiceDateLabel: "Date:",
    printInvoiceStatusLabel: "Invoice Status",
    printInvoiceApprovedStatus: "Approved",
    printInvoiceRejectedStatus: "Rejected",
    printInvoicePendingStatus: "Pending",
    printInvoicePaymentMethod: "Payment Method",
    printInvoiceDirectedTo: "Directed To (Client):",
    printInvoiceTxLabel: "Transaction ID:",
    printInvoiceDetailsTitle: "Purchase & Subscription Details:",
    printInvoiceTableHeaderItem: "Service / Plan Name",
    printInvoiceTableHeaderQuantity: "Qty",
    printInvoiceTableHeaderTotal: "Total Amount (IQD)",
    printInvoiceTableSubDesc: "Premium Platform Subscription Access",
    printInvoiceTableCurrency: "IQD",
    printInvoiceTotalLabel: "Subtotal:",
    printInvoiceFinalAmountLabel: "Final Paid Amount:",
    printInvoiceSignatureTitle: "SAS Admin Stamp & Signature",
    printInvoiceSignatureElectronic: "Digitally Authorized & Verified",
    printInvoiceCloseBtn: "Close",
    printInvoicePrintBtn: "Print Receipt",
    webcamNotSupported: "Webcam or camera not working or not granted permission."
  }
};

const STATS_TRANSLATIONS = {
  ku: {
    modalTitle: "ئاماری پشتڕاستکردنەوەکان",
    attemptsTitle: "هەوڵەکانی پشتڕاستکردنەوە (٧ ڕۆژی ڕابردوو)",
    totalAttempts: "کۆی گشتی هەوڵەکان",
    successRate: "ڕێژەی سەرکەوتن",
    avgTime: "تێکڕای کاتی وەڵامدانەوە",
    successLabel: "سەرکەوتوو",
    failedLabel: "شکستخواردوو",
    attemptsCount: "جار",
    closeBtn: "داخستن",
    activeLabel: "چالاک",
    statsSummary: "کورتەی ئامارەکان",
    last7Days: "٧ ڕۆژی ڕابردوو",
    btnLabel: "ئاماری پشتڕاستکردنەوە",
  },
  ar: {
    modalTitle: "إحصائيات عمليات التحقق",
    attemptsTitle: "محاولات التحقق (آخر 7 أيام)",
    totalAttempts: "إجمالي المحاولات",
    successRate: "نسبة النجاح",
    avgTime: "متوسط وقت الاستجابة",
    successLabel: "ناجحة",
    failedLabel: "فاشلة",
    attemptsCount: "مرات",
    closeBtn: "إغلاق",
    activeLabel: "نشط",
    statsSummary: "ملخص الإحصائيات",
    last7Days: "آخر 7 أيام",
    btnLabel: "إحصائيات التحقق",
  },
  en: {
    modalTitle: "Verification Analytics",
    attemptsTitle: "Verification Attempts (Last 7 Days)",
    totalAttempts: "Total Attempts",
    successRate: "Success Rate",
    avgTime: "Avg Response Time",
    successLabel: "Success",
    failedLabel: "Failed",
    attemptsCount: "attempts",
    closeBtn: "Close",
    activeLabel: "Active",
    statsSummary: "Analytics Summary",
    last7Days: "Last 7 Days",
    btnLabel: "Verification Stats",
  },
};

const REALTIME_TRANSLATIONS = {
  ku: {
    liveStatus: "بەکاتی ڕاستەقینە (WebSocket-Live) چالاکە",
    simulatorBtn: "ناردنی فاتورەیەکی نوێی تاقیکاری (WebSocket Push)",
    incomingTitle: "پەیوەندی ڕاستەوخۆ: فاتورەیەکی نوێ گەیشت! 🔔",
    incomingDesc: "فاتورەی {id} لە لایەن {user} بۆ {plan}.",
    simulationNotice: "ئەمە لێکچواندنی ناردنی پسوولەی ڕاستەقینەیە لە ڕێگەی WebSocket."
  },
  ar: {
    liveStatus: "قناة البث المباشر (WebSocket-Live) نشطة",
    simulatorBtn: "إرسال فاتورة تجريبية جديدة (WebSocket Push)",
    incomingTitle: "بث مباشر: وصلت فاتورة جديدة الآن! 🔔",
    incomingDesc: "الفاتورة {id} من {user} لاشتراك {plan}.",
    simulationNotice: "محاكاة لاستلام الفواتير المباشرة عبر الويب سوكيت."
  },
  en: {
    liveStatus: "Live Channel (WebSocket-Live) Active",
    simulatorBtn: "Simulate Incoming Invoice (WebSocket Push)",
    incomingTitle: "Live WebSocket: New Invoice Received! 🔔",
    incomingDesc: "Invoice {id} from {user} for {plan}.",
    simulationNotice: "Simulating a real-time invoice dispatch via WebSocket."
  }
};

interface AdminWhatsAppProps {
  invoices: Invoice[];
  onApproveInvoice: (invoiceId: string) => void;
  onRejectInvoice: (invoiceId: string) => void;
  lang?: "ku" | "ar" | "en";
  onSendInvoiceToWhatsApp?: (invoice: Invoice) => void;
}

export default function AdminWhatsApp({
  invoices,
  onApproveInvoice,
  onRejectInvoice,
  lang = "ku",
  onSendInvoiceToWhatsApp
}: AdminWhatsAppProps) {
  const lt = LEGEND_TRANSLATIONS[lang] || LEGEND_TRANSLATIONS.ku;
  const wt = WHATSAPP_TRANSLATIONS[lang] || WHATSAPP_TRANSLATIONS.ku;
  const st = STATS_TRANSLATIONS[lang] || STATS_TRANSLATIONS.ku;
  const rt = REALTIME_TRANSLATIONS[lang] || REALTIME_TRANSLATIONS.ku;
  const isRtl = lang !== "en";
  const dirAttr = isRtl ? "rtl" : "ltr";
  const textAlignClass = isRtl ? "text-right" : "text-left";

  const [openReceiptId, setOpenReceiptId] = useState<string | null>(null);
  const [openQrId, setOpenQrId] = useState<string | null>(null);
  const [filterMode, setFilterMode] = useState<"pending" | "all">("pending");
  const [searchText, setSearchText] = useState(() => localStorage.getItem("sas_admin_search_text") || "");

  // WebSocket real-time states
  const [activeRealtimeAlert, setActiveRealtimeAlert] = useState<{ id: string; userEmail: string; planName: string } | null>(null);
  const [isWebSocketActive, setIsWebSocketActive] = useState(true);
  const initialInvoiceIdsRef = useRef<Set<string>>(new Set(invoices.map(inv => inv.id)));
  const audioContextRef = useRef<AudioContext | null>(null);

  const playNotificationSound = () => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === "suspended") {
        ctx.resume();
      }
      const now = ctx.currentTime;
      
      // Dual tone synthesizer "ding-ding"
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = "sine";
      osc1.frequency.setValueAtTime(587.33, now); // D5
      osc1.frequency.exponentialRampToValueAtTime(880, now + 0.12); // A5
      gain1.gain.setValueAtTime(0.12, now);
      gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.45);

      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = "triangle";
      osc2.frequency.setValueAtTime(659.25, now + 0.08); // E5
      osc2.frequency.setValueAtTime(987.77, now + 0.18); // B5
      gain2.gain.setValueAtTime(0.06, now + 0.08);
      gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.08);
      osc2.stop(now + 0.55);
    } catch (e) {
      console.warn("Audio Context blocked or not supported:", e);
    }
  };

  useEffect(() => {
    if (!isWebSocketActive) return;

    // Detect a newly added pending invoice that we haven't seen yet
    const newPendingInvoice = invoices.find(inv => 
      inv.status === "pending" && 
      inv.whatsappSent && 
      !initialInvoiceIdsRef.current.has(inv.id)
    );

    if (newPendingInvoice) {
      initialInvoiceIdsRef.current.add(newPendingInvoice.id);
      
      setActiveRealtimeAlert({
        id: newPendingInvoice.id,
        userEmail: newPendingInvoice.userEmail,
        planName: newPendingInvoice.planName
      });

      playNotificationSound();
      setFilterMode("pending");
      setHighlightedInvoiceId(newPendingInvoice.id);

      const timer = setTimeout(() => {
        setActiveRealtimeAlert(null);
      }, 7000);
      return () => clearTimeout(timer);
    }
  }, [invoices, isWebSocketActive]);

  const handleSimulateWebSocketPush = () => {
    if (!onSendInvoiceToWhatsApp) return;
    const randomNum = Math.floor(Math.random() * 9000) + 1000;
    const mockInvId = `SAS-INV-${randomNum}`;
    const plans = [
      { id: "plan_a", name: "بەشداریکردنی پاکێجی ئاسایی (Plan A)", amount: 30000 },
      { id: "plan_b", name: "بەشداریکردنی پاکێجی پێشکەوتوو (Plan B)", amount: 65000 },
      { id: "plan_c", name: "بەشداریکردنی بازرگانی گشتی (Plan C)", amount: 120000 }
    ];
    const emails = [
      "hakar.rebin@gmail.com",
      "choman.dev@yahoo.com",
      "sara.kurdi@outlook.com",
      "dana.slemani@gmail.com"
    ];
    const methods: ("FIB" | "FastPay")[] = ["FIB", "FastPay"];
    const plan = plans[Math.floor(Math.random() * plans.length)];
    const user = emails[Math.floor(Math.random() * emails.length)];
    const method = methods[Math.floor(Math.random() * methods.length)];

    const simulatedInvoice: Invoice = {
      id: mockInvId,
      planId: plan.id,
      planName: plan.name,
      amount: plan.amount,
      paymentMethod: method,
      status: "pending",
      invoiceDate: new Date().toLocaleDateString("ku-IQ"),
      transactionId: `TXN-${Math.floor(Math.random() * 899999) + 100000}`,
      userEmail: user,
      whatsappSent: true,
      receiptScreenshot: "/screenshots/receipt_simulate_fib.png"
    };

    onSendInvoiceToWhatsApp(simulatedInvoice);
  };

  const handleSearchChange = (val: string) => {
    setSearchText(val);
    localStorage.setItem("sas_admin_search_text", val);
  };

  const pendingInvoices = invoices.filter(inv => inv.status === "pending" && inv.whatsappSent);
  const displayedInvoices = invoices.filter(inv => {
    const isModeMatch = filterMode === "pending"
      ? inv.status === "pending" && inv.whatsappSent
      : inv.whatsappSent;
    
    if (!isModeMatch) return false;
    
    if (!searchText.trim()) return true;
    const term = searchText.toLowerCase().trim();
    return inv.id.toLowerCase().includes(term) || inv.userEmail.toLowerCase().includes(term);
  });

  // QR Code Scanner Overlay States
  const [showScanner, setShowScanner] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [lastVerificationTime, setLastVerificationTime] = useState<string | null>(() => {
    return localStorage.getItem("sas_last_verification_SAS-INV-001");
  });
  const [scannedId, setScannedId] = useState<string | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);
  const [scannerFeedback, setScannerFeedback] = useState<string | null>(null);
  const [highlightedInvoiceId, setHighlightedInvoiceId] = useState<string | null>(null);
  const [manualCodeInput, setManualCodeInput] = useState("");
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [printInvoice, setPrintInvoice] = useState<Invoice | null>(null);
  const [selectedStatsInvoice, setSelectedStatsInvoice] = useState<Invoice | null>(null);
  const [copiedShareId, setCopiedShareId] = useState<string | null>(null);
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);

  const handleExportCSV = (inv: Invoice) => {
    const headers = ["Invoice ID", "Plan ID", "Plan Name", "Amount (IQD)", "Payment Method", "Status", "Date", "Transaction ID", "User Email"];
    const rows = [
      [
        inv.id,
        inv.planId,
        inv.planName,
        inv.amount.toString(),
        inv.paymentMethod,
        inv.status,
        inv.invoiceDate,
        inv.transactionId || "",
        inv.userEmail
      ]
    ];
    
    const csvContent = "\uFEFF" + [
      headers.join(","),
      ...rows.map(r => r.map(val => `"${val.replace(/"/g, '""')}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `SAS-Audit-Log-${inv.id}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExportPDF = (inv: Invoice) => {
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
(SAS PLATFORM OFFICIAL TRANSACTION AUDIT RECEIPT) Tj
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
(Verification ID: ${inv.transactionId || ""}) Tj
0 -40 Td
(STAMP: SAS PLATFORM - CO. - ERBIL HEADQUARTERS) Tj
0 -20 Td
(STATUS: VERIFIED & COMPLETED AUDIT) Tj
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
    link.download = `SAS-Audit-Receipt-${inv.id}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const [printHistories, setPrintHistories] = useState<Record<string, string[]>>(() => {
    const saved = localStorage.getItem("sas_invoice_print_histories");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    // Static localized mock history for illustration
    return {
      "SAS-INV-001": [
        "٢٠٢٦/٠٧/٠٢، ١٥:٢٢:١٠",
        "٢٠٢٦/٠٧/٠٢، ١٨:٤٥:٠٥"
      ]
    };
  });

  const registerPrintEvent = (invoiceId: string) => {
    const nowStr = new Date().toLocaleString(lang === "en" ? "en-US" : "ar-EG", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    });
    setPrintHistories(prev => {
      const current = prev[invoiceId] || [];
      if (current.includes(nowStr)) return prev;
      const updated = {
        ...prev,
        [invoiceId]: [nowStr, ...current]
      };
      localStorage.setItem("sas_invoice_print_histories", JSON.stringify(updated));
      return updated;
    });
  };

  const playVerificationSound = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      
      const playTone = (freq: number, startTime: number, duration: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, startTime);
        
        gain.gain.setValueAtTime(0.15, startTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(startTime);
        osc.stop(startTime + duration);
      };
      
      const now = ctx.currentTime;
      playTone(523.25, now, 0.12);
      playTone(659.25, now + 0.08, 0.12);
      playTone(783.99, now + 0.16, 0.12);
      playTone(1046.50, now + 0.24, 0.3);
    } catch (err) {
      console.warn("Could not play synthesized sound effect:", err);
    }
  };

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const requestRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Auto-fade the highlighted invoice after 8 seconds
  useEffect(() => {
    if (highlightedInvoiceId) {
      const timer = setTimeout(() => {
        setHighlightedInvoiceId(null);
      }, 8000);
      return () => clearTimeout(timer);
    }
  }, [highlightedInvoiceId]);

  // Circular progress simulator for real-time QR image analysis
  const [analysisProgress, setAnalysisProgress] = useState(0);

  useEffect(() => {
    if (!showScanner) {
      setAnalysisProgress(0);
      return;
    }
    if (scannedId) {
      setAnalysisProgress(100);
      return;
    }

    const interval = setInterval(() => {
      setAnalysisProgress(prev => {
        if (prev >= 100) {
          return 0;
        }
        const step = Math.floor(Math.random() * 8) + 4;
        return Math.min(prev + step, 100);
      });
    }, 140);

    return () => clearInterval(interval);
  }, [showScanner, scannedId]);

  // Clean up camera stream on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    setScanError(null);
    setScannerFeedback(null);
    setScannedId(null);

    if (typeof navigator === "undefined" || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setScanError(wt.webcamNotSupported || "Camera not supported or locked.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute("playsinline", "true");
        videoRef.current.play().catch(err => {
          console.warn("Video playback was interrupted:", err);
        });
        requestRef.current = requestAnimationFrame(tick);
      }
    } catch (err: any) {
      console.warn("Camera access warning:", err);
      setScanError(lang === "ku" ? "ناتوانرێت کامێرا کارا بکرێت. دڵنیابەوە لە مۆڵەتەکان." : (lang === "ar" ? "تعذر تشغيل الكاميرا. يرجى التحقق من الأذونات." : "Unable to activate camera. Check your permissions."));
    }
  };

  const stopCamera = () => {
    if (requestRef.current) {
      cancelAnimationFrame(requestRef.current);
      requestRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        try {
          track.stop();
        } catch (e) {
          console.warn("Failed to stop camera track:", e);
        }
      });
      streamRef.current = null;
    }
  };

  const handleToggleScanner = (open: boolean) => {
    setShowScanner(open);
    if (open) {
      startCamera();
    } else {
      stopCamera();
    }
  };

  const tick = () => {
    if (!streamRef.current) {
      return;
    }

    if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
      const video = videoRef.current;
      const canvas = canvasRef.current || document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        try {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: "dontInvert",
          });
          if (code) {
            handleDecodedText(code.data);
            return;
          }
        } catch (err) {
          console.warn("Failed to read image frame from canvas:", err);
        }
      }
    }
    
    if (streamRef.current) {
      requestRef.current = requestAnimationFrame(tick);
    }
  };

  const handleDecodedText = (text: string) => {
    console.log("Scanned QR Text:", text);
    const invoiceIdMatch = text.match(/SAS-INV-\d+/i);
    const matchedId = invoiceIdMatch ? invoiceIdMatch[0].toUpperCase() : null;
    
    if (matchedId) {
      const exists = pendingInvoices.find(inv => inv.id.toUpperCase() === matchedId);
      if (exists) {
        const successMsg = lang === "ku" ? `فاتورەی ${matchedId} بە سەرکەوتوویی خوێندرایەوە!` : (lang === "ar" ? `تمت قراءة الفاتورة ${matchedId} بنجاح!` : `Invoice ${matchedId} was scanned successfully!`);
        setScannerFeedback(successMsg);
        setScannedId(matchedId);
        setHighlightedInvoiceId(matchedId);
        
        const isTargetInv = matchedId === "SAS-INV-001";
        if (isTargetInv) {
          playVerificationSound();
          setShowCelebration(true);
          const nowStr = new Date().toLocaleTimeString(lang === "en" ? "en-US" : "ar-EG", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
          setLastVerificationTime(nowStr);
          localStorage.setItem("sas_last_verification_SAS-INV-001", nowStr);
        }

        setTimeout(() => {
          const element = document.getElementById(`invoice-card-${matchedId}`);
          if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "center" });
          }
          setShowScanner(false);
          setShowCelebration(false);
          stopCamera();
        }, isTargetInv ? 3000 : 1500);
      } else {
        const existsInAll = invoices.find(inv => inv.id.toUpperCase() === matchedId);
        if (existsInAll) {
          const statusText = existsInAll.status === "approved" ? (lang === "ku" ? "پەسەندکراو" : (lang === "ar" ? "مقبول" : "Approved")) : (lang === "ku" ? "ڕەتکراوە" : (lang === "ar" ? "مرفوض" : "Rejected"));
          const statusMsg = lang === "ku" ? `فاتورەی ${matchedId} دۆزرایەوە بەڵام باری ئێستای [${statusText}] هەیە.` : (lang === "ar" ? `تم العثور على الفاتورة ${matchedId} ولكن حالتها الحالية هي [${statusText}].` : `Invoice ${matchedId} found but its current status is [${statusText}].`);
          setScannerFeedback(statusMsg);
        } else {
          const notInListMsg = lang === "ku" ? `کۆدی فاتورەی ${matchedId} دۆزرایەوە بەڵام لە لیستی فاتورەکانی تۆدا نییە.` : (lang === "ar" ? `تم العثور على الفاتورة ${matchedId} ولكنها ليست في قائمتك.` : `Invoice ${matchedId} found but it is not in your list.`);
          setScannerFeedback(notInListMsg);
        }
      }
    } else {
      const trimmedText = text.trim();
      const directMatch = invoices.find(inv => inv.id.toLowerCase() === trimmedText.toLowerCase());
      if (directMatch) {
        const isPending = pendingInvoices.some(inv => inv.id === directMatch.id);
        if (isPending) {
          const successMsg = lang === "ku" ? `فاتورەی ${directMatch.id} بە سەرکەوتوویی خوێندرایەوە!` : (lang === "ar" ? `تمت قراءة الفاتورة ${directMatch.id} بنجاح!` : `Invoice ${directMatch.id} was scanned successfully!`);
          setScannerFeedback(successMsg);
          setScannedId(directMatch.id);
          setHighlightedInvoiceId(directMatch.id);
          
          const isTargetInv = directMatch.id.toUpperCase() === "SAS-INV-001";
          if (isTargetInv) {
            playVerificationSound();
            setShowCelebration(true);
            const nowStr = new Date().toLocaleTimeString(lang === "en" ? "en-US" : "ar-EG", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
            setLastVerificationTime(nowStr);
            localStorage.setItem("sas_last_verification_SAS-INV-001", nowStr);
          }

          setTimeout(() => {
            const element = document.getElementById(`invoice-card-${directMatch.id}`);
            if (element) {
              element.scrollIntoView({ behavior: "smooth", block: "center" });
            }
            setShowScanner(false);
            setShowCelebration(false);
            stopCamera();
          }, isTargetInv ? 3000 : 1500);
        } else {
          const statusMsg = lang === "ku" ? `فاتورەی ${directMatch.id} دۆزرایەوە بەڵام باری ئێستای [${directMatch.status}] هەیە.` : (lang === "ar" ? `تم العثور على الفاتورة ${directMatch.id} ولكن حالتها الحالية هي [${directMatch.status}].` : `Invoice ${directMatch.id} found but its current status is [${directMatch.status}].`);
          setScannerFeedback(statusMsg);
        }
      } else {
        const invalidMsg = lang === "ku" ? "کۆدی سکانکراو گونجاو نییە. تکایە پسوولەیەکی فەرمی QR سکان بکە." : (lang === "ar" ? "الرمز الممسوح غير متوافق. يرجى مسح رمز QR رسمي للفاتورة." : "Scanned code is invalid. Please scan an official receipt QR code.");
        setScannerFeedback(invalidMsg);
      }
    }
  };

  return (
    <div className={`bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl h-full flex flex-col font-sans ${textAlignClass}`} dir={dirAttr}>
      {/* Header mock */}
      <div className="bg-emerald-600 px-4 py-3.5 text-white flex justify-between items-center shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <div className="w-9 h-9 bg-slate-950/20 rounded-full flex items-center justify-center font-black text-xs">
              SAS
            </div>
            <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-emerald-400 border-2 border-emerald-600" />
          </div>
          <div>
            <h3 className="text-xs font-black">{wt.adminTitle}</h3>
            <p className="text-[10px] text-emerald-100 mt-0.5">{wt.adminSubtitle}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {lastVerificationTime && (
            <div className="flex items-center gap-1 bg-emerald-950/50 border border-emerald-400/30 px-2 py-1 rounded-xl text-[9px] font-bold text-emerald-300 shadow-sm font-mono animate-fade-in">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              <span>{wt.lastScanPrefix} {lastVerificationTime}</span>
            </div>
          )}
          <button
            onClick={() => handleToggleScanner(!showScanner)}
            className={`p-1.5 rounded-xl transition-all duration-300 flex items-center gap-1 cursor-pointer text-[10px] font-black shadow-md ${
              showScanner
                ? "bg-rose-500 text-white shadow-rose-500/20"
                : "bg-slate-950/20 hover:bg-slate-950/40 text-amber-400 hover:text-white"
            }`}
            title={wt.qrScannerBtnTitle}
          >
            <QrCode size={13} className={showScanner ? "rotate-90 transition-transform duration-300" : "animate-pulse"} />
            <span className="flex items-center gap-1">
              <Scan size={14} className="text-amber-500" />
              <span>{wt.qrScannerBtn}</span>
            </span>
          </button>
          <Phone size={14} className="text-emerald-100" />
        </div>
      </div>

      {/* Filters Toggle Subbar */}
      <div className="bg-slate-950 border-b border-slate-800/60 px-4 py-2 flex flex-col sm:flex-row items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-bold">
          <Filter size={11} className="text-amber-500" />
          <span>{wt.filterLabel}</span>
        </div>
        
        <div className="bg-slate-900 p-0.5 rounded-lg border border-slate-800 flex items-center gap-1">
          <button
            onClick={() => setFilterMode("pending")}
            className={`px-2.5 py-1 rounded-md text-[10px] font-black transition-all cursor-pointer ${
              filterMode === "pending"
                ? "bg-amber-500 text-slate-950 shadow-md font-black"
                : "text-slate-400 hover:text-white"
            }`}
          >
            {wt.filterPending}
          </button>
          <button
            onClick={() => setFilterMode("all")}
            className={`px-2.5 py-1 rounded-md text-[10px] font-black transition-all cursor-pointer ${
              filterMode === "all"
                ? "bg-slate-800 text-white font-black"
                : "text-slate-400 hover:text-white"
            }`}
          >
            {wt.filterAll}
          </button>
        </div>
      </div>

      {/* Search Bar Subbar */}
      <div className="bg-slate-950/80 border-b border-slate-800/60 px-4 py-2 shrink-0">
        <div className="relative">
          <input
            id="admin-invoice-search-input"
            type="text"
            value={searchText}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder={wt.searchPlaceholder}
            className={`w-full bg-slate-900 border border-slate-800/80 text-[10px] text-slate-200 placeholder-slate-500 rounded-xl px-3.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-amber-500/40 focus:border-amber-500/40 font-sans transition-all pr-8 pl-8 ${isRtl ? "text-right" : "text-left"}`}
            dir={dirAttr}
          />
          {searchText && (
            <button
              onClick={() => handleSearchChange("")}
              className={`absolute top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors p-0.5 cursor-pointer ${isRtl ? "left-2.5" : "right-2.5"}`}
            >
              <X size={11} />
            </button>
          )}
          <span className={`absolute top-1/2 -translate-y-1/2 text-slate-500 ${isRtl ? "right-2.5" : "left-2.5"}`}>
            <Search size={11} className="text-slate-500" />
          </span>
        </div>
      </div>

      {/* Real-time WebSocket Status & Simulator Bar */}
      <div className="bg-slate-950/90 border-b border-slate-800/50 px-4 py-2 shrink-0 flex flex-col gap-2">
        <div className="flex items-center justify-between text-[10px]">
          <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>{rt.liveStatus}</span>
          </div>
          <button
            onClick={() => setIsWebSocketActive(!isWebSocketActive)}
            className={`px-2 py-0.5 rounded-md text-[9px] font-bold transition-all ${isWebSocketActive ? "bg-emerald-950/40 text-emerald-400 border border-emerald-500/20" : "bg-slate-900 text-slate-400 border border-slate-800"}`}
          >
            {isWebSocketActive ? "Connected" : "Disconnected"}
          </button>
        </div>
        
        {onSendInvoiceToWhatsApp && (
          <button
            onClick={handleSimulateWebSocketPush}
            className="w-full bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-indigo-500/10 hover:from-emerald-500/20 hover:via-teal-500/20 hover:to-indigo-500/20 border border-emerald-500/30 text-emerald-300 text-[9px] font-black py-1.5 px-3 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Cpu size={12} className="animate-spin text-emerald-400" style={{ animationDuration: '3s' }} />
            <span>{rt.simulatorBtn}</span>
          </button>
        )}
      </div>

      {/* Simulated Chat Feed */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.05),transparent_50%),#090d16] custom-scrollbar min-h-[300px] relative">
        <AnimatePresence>
          {activeRealtimeAlert && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className="absolute top-2 left-2 right-2 z-50 bg-slate-900/95 border border-amber-500/30 text-amber-100 p-3 rounded-xl shadow-xl backdrop-blur-md flex flex-col gap-1 text-[11px]"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-black text-amber-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
                  <span>{rt.incomingTitle}</span>
                </div>
                <button 
                  onClick={() => setActiveRealtimeAlert(null)}
                  className="text-slate-400 hover:text-white p-0.5"
                >
                  <X size={11} />
                </button>
              </div>
              <p className="text-[10px] text-slate-300 font-sans leading-relaxed">
                {rt.incomingDesc
                  .replace("{id}", activeRealtimeAlert.id)
                  .replace("{user}", activeRealtimeAlert.userEmail)
                  .replace("{plan}", activeRealtimeAlert.planName)}
              </p>
              <div className="text-[8px] text-slate-500 mt-1 italic">
                {rt.simulationNotice}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        {displayedInvoices.length === 0 ? (
          <div className="text-center py-10 space-y-2">
            <div className="w-12 h-12 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-center text-slate-700 mx-auto">
              <MessageSquare size={20} />
            </div>
            <h4 className="text-xs font-bold text-slate-400">
              {filterMode === "pending" ? wt.chatWaiting : wt.chatEmptyHistory}
            </h4>
            <p className="text-[10px] text-slate-500 max-w-[200px] mx-auto leading-relaxed">
              {filterMode === "pending" ? wt.chatWaitingDesc : wt.chatEmptyHistoryDesc}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-[9px] text-slate-500 text-center bg-slate-950/60 py-1 rounded-full border border-slate-800/50">
              {filterMode === "pending" ? wt.todayPendingLabel : wt.allHistoryLabel}
            </div>

            {/* Visual Status Badge Legend */}
            <div className={`p-2 rounded-xl bg-slate-950/40 border border-slate-800/40 text-[9px] flex flex-wrap gap-x-3 gap-y-1 items-center justify-center ${lang === "en" ? "flex-row font-sans" : "flex-row-reverse font-sans"}`}>
              <span className="text-slate-400 font-bold">{lt.title}</span>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-slate-300 font-medium">{lt.approved}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                <span className="text-slate-300 font-medium">{lt.pending}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                <span className="text-slate-300 font-medium">{lt.rejected}</span>
              </div>
            </div>

            <AnimatePresence>
              {displayedInvoices.map((inv) => {
                const isHighlighted = highlightedInvoiceId === inv.id;
                
                // Get dynamic message
                let userMessageHTML;
                if (lang === "ar") {
                  userMessageHTML = (
                    <span>
                      مرحباً سيد SAS! لقد أرسلت الأموال عبر <span className="text-white font-bold">{inv.paymentMethod}</span> لشراء <span className="text-emerald-400 font-bold">{inv.planName}</span>. هذا هو إيصال الفاتورة الخاص بي، يرجى تفعيله لي، شكراً.
                    </span>
                  );
                } else if (lang === "en") {
                  userMessageHTML = (
                    <span>
                      Hello Dear SAS! I have sent the payment via <span className="text-white font-bold">{inv.paymentMethod}</span> to purchase <span className="text-emerald-400 font-bold">{inv.planName}</span>. Here is my invoice receipt proof, please activate it for me, thanks.
                    </span>
                  );
                } else {
                  userMessageHTML = (
                    <span>
                      سڵاو بەڕێز SAS! من پارەم نارد لە ڕێگەی <span className="text-white font-bold">{inv.paymentMethod}</span> بۆ کڕینی <span className="text-emerald-400 font-bold">{inv.planName}</span>. ئەمەش وێنەی فاتورەکەمە، تکایە بۆم کارا بکە سپاس.
                    </span>
                  );
                }

                const isCardOpened = openReceiptId === inv.id || openQrId === inv.id || highlightedInvoiceId === inv.id;
                const isAnyCardOpened = openReceiptId !== null || openQrId !== null || highlightedInvoiceId !== null;

                return (
                  <motion.div
                    key={inv.id}
                    id={`invoice-card-${inv.id}`}
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ 
                      opacity: isCardOpened ? 1 : (isAnyCardOpened ? 0.35 : 1), 
                      scale: isCardOpened ? 1.02 : (isAnyCardOpened ? 0.97 : 1), 
                      y: 0 
                    }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    onClick={() => {
                      if (!isCardOpened) {
                        setOpenReceiptId(inv.receiptScreenshot ? inv.id : null);
                        setOpenQrId(null);
                        setHighlightedInvoiceId(inv.id);
                      }
                    }}
                    className={`bg-slate-900 border rounded-2xl p-4 shadow-xl space-y-3 relative overflow-hidden transition-all duration-500 cursor-pointer ${
                      isCardOpened
                        ? "border-amber-500/40 shadow-amber-500/10 ring-1 ring-amber-500/20 bg-slate-900"
                        : isAnyCardOpened
                          ? "border-slate-800/40 opacity-35 filter brightness-90 saturate-70 select-none hover:opacity-60"
                          : "border-slate-800 hover:border-slate-700 hover:scale-[1.005]"
                    }`}
                  >
                    {isCardOpened && (
                      <div className="absolute inset-0 bg-amber-500/5 animate-pulse pointer-events-none" />
                    )}
                    {/* Decorative status bar */}
                    <div className={`absolute top-0 bottom-0 w-1 ${isRtl ? "right-0" : "left-0"} ${
                      inv.status === "approved" 
                        ? "bg-emerald-500/70" 
                        : inv.status === "rejected" 
                          ? "bg-rose-500/70" 
                          : "bg-amber-500/70"
                    }`} />

                    {/* Chat sender bubble layout */}
                    <div className="space-y-1">
                      <span className="text-[10px] text-amber-400 font-mono tracking-wide">{inv.userEmail}</span>
                      <p className="text-xs text-slate-300 leading-relaxed font-medium">
                        {userMessageHTML}
                      </p>
                    </div>

                    {/* Invoice Mini Spec Inside Chat */}
                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1.5 text-[10px] text-slate-400 font-mono">
                      <div className="flex justify-between">
                        <span>{wt.invoiceLabel}</span>
                        <span className="text-white font-bold">{inv.id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>{wt.amountLabel}</span>
                        <span className="text-emerald-400 font-bold">{inv.amount.toLocaleString(lang === "en" ? "en-US" : "ar-EG")} {wt.currencyLabel}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>{wt.txCodeLabel}</span>
                        <span className="text-slate-500 truncate max-w-[120px]">{inv.transactionId}</span>
                      </div>
                    </div>

                    {/* Paperclip attachment section */}
                    {inv.receiptScreenshot ? (
                      <div className="bg-slate-950/40 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between text-xs gap-2">
                        <div className="flex items-center gap-1.5 text-slate-300">
                          <Paperclip size={14} className="text-amber-500" />
                          <span className="font-semibold text-[10px]">{wt.proofAttachment}</span>
                        </div>
                        
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenReceiptId(openReceiptId === inv.id ? null : inv.id);
                          }}
                          className="text-[10px] bg-slate-800 hover:bg-slate-700 hover:text-white px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 cursor-pointer font-bold text-slate-400"
                        >
                          {openReceiptId === inv.id ? (
                            <>
                              <EyeOff size={11} />
                              <span>{wt.hideButton}</span>
                            </>
                          ) : (
                            <>
                              <Eye size={11} />
                              <span>{wt.viewButton}</span>
                            </>
                          )}
                        </button>
                      </div>
                    ) : (
                      <div className="bg-slate-950/20 p-2.5 rounded-xl border border-slate-800/50 flex items-center gap-1.5 text-slate-500 text-[9px]">
                        <Paperclip size={12} className="text-slate-600" />
                        <span>{wt.noAttachment}</span>
                      </div>
                    )}

                    {/* Attachment image block */}
                    <AnimatePresence>
                      {inv.receiptScreenshot && openReceiptId === inv.id && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden space-y-2 pt-1"
                        >
                          <div className="relative rounded-xl border border-slate-700/80 overflow-hidden bg-slate-950 p-1">
                            <img
                              src={inv.receiptScreenshot}
                              alt="Screenshot proof"
                              className="w-full h-auto object-contain max-h-[220px] rounded-lg mx-auto"
                            />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* INTERACTIVE QR CODE FOR TESTING */}
                    {(inv.status === "pending" || inv.status === "approved") && (
                      <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 flex flex-col gap-2">
                        <div className="flex items-center justify-between text-xs gap-2">
                          <div className="flex items-center gap-1.5 text-slate-300">
                            <QrCode size={14} className={inv.status === "approved" ? "text-emerald-400" : "text-amber-500"} />
                            <span className="font-bold text-[10px] text-amber-400">
                              {inv.status === "approved" ? wt.approvedInvoiceQr : wt.mockInvoiceQr}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            {/* Tooltip Help Guide */}
                            <div className="relative group/tooltip flex items-center justify-center">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setShowHelpModal(true);
                                }}
                                title={wt.helpModalTitle}
                                className="cursor-pointer text-slate-400 hover:text-amber-400 transition-colors duration-200 focus:outline-none flex items-center justify-center"
                              >
                                {!showScanner ? (
                                  <motion.span
                                    animate={{ scale: [1, 1.25, 1], opacity: [0.8, 1, 0.8] }}
                                    transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
                                    className="inline-flex"
                                  >
                                    <HelpCircle size={14} className="text-amber-400" />
                                  </motion.span>
                                ) : (
                                  <HelpCircle size={14} />
                                )}
                              </button>
                              
                              {/* Tooltip hover contents */}
                              <div className={`absolute bottom-full mb-2 hidden group-hover/tooltip:block bg-slate-900 text-[10px] text-slate-200 border border-slate-700/80 p-3 rounded-xl w-56 shadow-2xl z-50 pointer-events-auto ${isRtl ? "right-1/2 translate-x-1/2 text-right" : "left-1/2 -translate-x-1/2 text-left"}`}>
                                <div className="font-bold text-amber-400 mb-1 flex items-center gap-1 justify-center">
                                  <span>{wt.cameraGuideTooltipTitle}</span>
                                  <Scan size={10} className="text-amber-400 animate-pulse" />
                                </div>
                                <p className="leading-relaxed mb-2">
                                  {wt.cameraGuideTooltip}
                                </p>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setShowHelpModal(true);
                                  }}
                                  className="w-full text-center text-[9px] bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 font-extrabold py-1.5 rounded-lg transition-colors border border-amber-500/20 cursor-pointer"
                                >
                                  {wt.cameraGuideHelpBtn}
                                </button>
                                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900" />
                              </div>
                            </div>

                            {/* Verification status badge */}
                            <div className={`text-[9px] px-2 py-1 rounded-lg border font-extrabold flex items-center gap-1.5 transition-all ${
                              inv.status === "approved"
                                ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/20"
                                : "bg-slate-800/80 text-slate-400 border-slate-700/60"
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${inv.status === "approved" ? "bg-emerald-400" : "bg-slate-500"} animate-pulse`} />
                              <span>
                                {inv.status === "approved" 
                                  ? `${wt.approvedStatus} ${inv.verifiedAt || wt.registeredLabel}` 
                                  : "Not Verified"}
                              </span>
                            </div>

                            {/* Print receipt trigger */}
                            <button
                              id={`print-btn-${inv.id}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                setPrintInvoice(inv);
                                registerPrintEvent(inv.id);
                              }}
                              className="text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 cursor-pointer font-extrabold"
                            >
                              <Printer size={11} />
                              <span>{wt.printReceiptBtn}</span>
                            </button>

                            {/* Verification Stats Button */}
                            <button
                              id={`stats-btn-${inv.id}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedStatsInvoice(inv);
                              }}
                              className="text-[10px] bg-amber-950/40 hover:bg-amber-950/80 text-amber-400/80 px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 cursor-pointer font-extrabold border border-amber-900/30"
                            >
                              <BarChart3 size={11} />
                              <span>{st.btnLabel}</span>
                            </button>

                            {/* Export dropdown */}
                            <div className="relative inline-block text-right">
                              <button
                                id={`export-dropdown-btn-${inv.id}`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveDropdownId(activeDropdownId === inv.id ? null : inv.id);
                                }}
                                className="text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 cursor-pointer font-extrabold"
                              >
                                <FileDown size={11} />
                                <span>{wt.archiveExportBtn}</span>
                                <ChevronDown size={10} className={`transition-transform duration-200 ${activeDropdownId === inv.id ? "rotate-180" : ""}`} />
                              </button>

                              <AnimatePresence>
                                {activeDropdownId === inv.id && (
                                  <>
                                    <div 
                                      className="fixed inset-0 z-40 cursor-default" 
                                      onClick={() => setActiveDropdownId(null)}
                                    />
                                    <motion.div
                                      initial={{ opacity: 0, scale: 0.95, y: -5 }}
                                      animate={{ opacity: 1, scale: 1, y: 0 }}
                                      exit={{ opacity: 0, scale: 0.95, y: -5 }}
                                      transition={{ duration: 0.15 }}
                                      className={`absolute mt-1.5 w-32 rounded-xl bg-slate-950 border border-slate-800 p-1 shadow-2xl z-50 flex flex-col font-sans ${isRtl ? "right-0 text-right" : "left-0 text-left"}`}
                                    >
                                      <button
                                        onClick={() => {
                                          handleExportCSV(inv);
                                          setActiveDropdownId(null);
                                        }}
                                        className={`flex items-center gap-1.5 px-2.5 py-1.5 text-[9px] font-bold text-slate-300 hover:text-white hover:bg-slate-900 rounded-lg transition-all cursor-pointer w-full ${isRtl ? "justify-end" : "justify-start"}`}
                                      >
                                        {!isRtl && <FileSpreadsheet size={11} className="text-emerald-400" />}
                                        <span>Export CSV</span>
                                        {isRtl && <FileSpreadsheet size={11} className="text-emerald-400" />}
                                      </button>
                                      <button
                                        onClick={() => {
                                          handleExportPDF(inv);
                                          setActiveDropdownId(null);
                                        }}
                                        className={`flex items-center gap-1.5 px-2.5 py-1.5 text-[9px] font-bold text-slate-300 hover:text-white hover:bg-slate-900 rounded-lg transition-all cursor-pointer border-t border-slate-800/40 w-full ${isRtl ? "justify-end animate-fade-in" : "justify-start"}`}
                                      >
                                        {!isRtl && <FileDown size={11} className="text-rose-400" />}
                                        <span>Export PDF</span>
                                        {isRtl && <FileDown size={11} className="text-rose-400" />}
                                      </button>
                                    </motion.div>
                                  </>
                                )}
                              </AnimatePresence>
                            </div>

                            {/* Share button */}
                            <button
                              id={`share-btn-${inv.id}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                const shareUrl = `${window.location.origin}?shareInvoice=${inv.id}`;
                                navigator.clipboard.writeText(shareUrl);
                                setCopiedShareId(inv.id);
                                setTimeout(() => setCopiedShareId(null), 2500);
                              }}
                              className="text-[10px] bg-sky-950/40 hover:bg-sky-950/80 text-sky-400/80 px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 cursor-pointer font-extrabold border border-sky-900/30"
                            >
                              <Share2 size={11} className={copiedShareId === inv.id ? "animate-bounce text-emerald-400" : ""} />
                              <span>{copiedShareId === inv.id ? wt.copiedLabel : wt.shareReceiptBtn}</span>
                            </button>

                            {/* Show QR expansion trigger */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenQrId(openQrId === inv.id ? null : inv.id);
                              }}
                              className="text-[10px] bg-amber-950/40 hover:bg-amber-950/80 text-amber-400/80 px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 cursor-pointer font-extrabold border border-amber-900/30"
                            >
                              {openQrId === inv.id ? (
                                <>
                                  <EyeOff size={11} />
                                  <span>{wt.hideButton}</span>
                                </>
                              ) : (
                                <>
                                  {!showScanner ? (
                                    <motion.span
                                      animate={{ scale: [1, 1.25, 1], opacity: [0.8, 1, 0.8] }}
                                      transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
                                      className="inline-flex"
                                    >
                                      <QrCode size={11} className="text-amber-400" />
                                    </motion.span>
                                  ) : (
                                    <QrCode size={11} />
                                  )}
                                  <span>{wt.showQrBtn}</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Print History Audit Log */}
                        {inv.id === "SAS-INV-001" && (
                          <div className={`mt-2.5 pt-2.5 border-t border-slate-800/80 space-y-1.5 ${textAlignClass}`}>
                            <div className={`flex items-center justify-between text-[10px] text-slate-400 font-bold ${isRtl ? "flex-row" : "flex-row-reverse"}`}>
                              <div className="flex items-center gap-1 text-indigo-400">
                                <History size={11} className="text-indigo-400" />
                                <span>{wt.printHistoryTitle}</span>
                              </div>
                              <span className="text-slate-400 font-mono text-[9px] bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                                {(printHistories[inv.id] || []).length} {wt.printedTimes}
                              </span>
                            </div>
                            
                            <div className="max-h-[85px] overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                              {(!printHistories[inv.id] || printHistories[inv.id].length === 0) ? (
                                <p className="text-[9px] text-slate-500 leading-normal">{wt.noPrintHistory}</p>
                              ) : (
                                <div className="space-y-1">
                                  {printHistories[inv.id].map((time, tIdx) => (
                                    <div 
                                      key={tIdx} 
                                      className={`flex items-center justify-between text-[9px] bg-slate-950/85 hover:bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800/60 font-mono text-slate-300 transition-colors ${isRtl ? "flex-row" : "flex-row-reverse"}`}
                                    >
                                      <div className="flex items-center gap-1.5 text-slate-500">
                                        <span className="w-1 h-1 rounded-full bg-indigo-500/60 animate-pulse" />
                                        <span>{wt.printJobLabel} {printHistories[inv.id].length - tIdx}</span>
                                      </div>
                                      <span className="text-indigo-300/90">{time}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Expandable QR Image */}
                        <AnimatePresence>
                          {openQrId === inv.id && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              className="overflow-hidden space-y-3 pt-2 text-center"
                            >
                              <div className="bg-white p-3 rounded-2xl inline-block mx-auto relative shadow-xl text-center">
                                <img
                                  src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(`https://sas-platform.net/verify?invoiceId=${inv.id}&user=${inv.userEmail}`)}`}
                                  alt={`QR Code for ${inv.id}`}
                                  className="w-[120px] h-[120px] mx-auto rounded-lg mb-2"
                                  referrerPolicy="no-referrer"
                                />
                                <button
                                  onClick={async (e) => {
                                    e.stopPropagation();
                                    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(`https://sas-platform.net/verify?invoiceId=${inv.id}&user=${inv.userEmail}`)}`;
                                    try {
                                      const response = await fetch(qrUrl);
                                      const blob = await response.blob();
                                      const blobUrl = URL.createObjectURL(blob);
                                      const link = document.createElement("a");
                                      link.href = blobUrl;
                                      link.download = `QR_${inv.id}.png`;
                                      document.body.appendChild(link);
                                      link.click();
                                      document.body.removeChild(link);
                                      URL.revokeObjectURL(blobUrl);
                                    } catch (error) {
                                      console.error("Direct download failed, opening in new tab:", error);
                                      window.open(qrUrl, "_blank");
                                    }
                                  }}
                                  className="w-full flex items-center justify-center gap-1 bg-slate-900 hover:bg-slate-800 text-white font-black text-[9px] py-1.5 px-2 rounded-lg transition-all active:scale-95 cursor-pointer"
                                >
                                  <Download size={10} />
                                  <span>{wt.downloadQrBtn}</span>
                                </button>
                              </div>
                              
                              <div className={`space-y-1.5 ${textAlignClass}`}>
                                <div className="text-[9px] text-slate-400 break-all font-mono bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-left select-all">
                                  <span className="text-amber-400 font-bold">Simulated Verification URL:</span><br/>
                                  <span className="text-slate-300">https://sas-platform.net/verify?invoiceId={inv.id}&user={encodeURIComponent(inv.userEmail)}</span>
                                </div>
                                <p className="text-[9px] text-slate-400 leading-relaxed">
                                  💡 {wt.cameraGuideTooltip}
                                </p>

                                {/* Direct Verify button */}
                                <div className="pt-2 border-t border-slate-900 mt-2">
                                  {inv.status === "pending" ? (
                                    <button
                                      id={`direct-verify-btn-${inv.id}`}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        onApproveInvoice(inv.id);
                                        setHighlightedInvoiceId(inv.id);
                                      }}
                                      className="w-full flex items-center justify-center gap-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 active:scale-95 text-slate-950 font-black text-[10px] py-2 px-3 rounded-xl transition-all cursor-pointer shadow-lg shadow-emerald-500/10"
                                    >
                                      <Check size={11} className="stroke-[3]" />
                                      <span>{wt.directVerifyBtn} (Direct Verify)</span>
                                    </button>
                                  ) : (
                                    <div className="w-full text-center text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 py-2 rounded-xl">
                                      {wt.alreadyDirectVerified}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    )}

                    {/* Action triggers - Approve / Reject or final status */}
                    <div className="pt-2">
                      {inv.status === "pending" ? (
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onApproveInvoice(inv.id);
                            }}
                            className="bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-slate-950 py-2 rounded-xl text-[11px] font-black transition flex items-center justify-center gap-1 cursor-pointer"
                          >
                            <Check size={12} className="stroke-[3]" />
                            <span>{wt.approveButton} (Approve)</span>
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onRejectInvoice(inv.id);
                            }}
                            className="bg-slate-800 hover:bg-slate-700 hover:text-rose-400 py-2 rounded-xl text-[11px] font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                          >
                            <X size={12} />
                            <span>{wt.rejectButton}</span>
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
                          <span className="text-[10px] text-slate-500 font-bold">{wt.finalStatusLabel}</span>
                          {inv.status === "approved" ? (
                            <span className="text-[10px] font-black text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20 flex items-center gap-1">
                              <Check size={10} className="stroke-[3]" />
                              <span>{wt.finalApprovedLabel}</span>
                            </span>
                          ) : (
                            <span className="text-[10px] font-black text-rose-400 bg-rose-500/10 px-2.5 py-1 rounded-lg border border-rose-500/20 flex items-center gap-1">
                              <X size={10} />
                              <span>{wt.finalRejectedLabel}</span>
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Live QR Camera Scanner Overlay */}
      <AnimatePresence>
        {showScanner && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-950/95 z-50 flex flex-col p-4 overflow-y-auto custom-scrollbar text-right"
            dir={dirAttr}
          >
            {/* Header */}
            <div className={`flex justify-between items-center border-b border-slate-800 pb-3 mb-4 shrink-0 ${isRtl ? "flex-row" : "flex-row-reverse"}`}>
              <div className="flex items-center gap-2">
                <Scan className="text-amber-500 animate-pulse" size={18} />
                <h4 className="text-sm font-black text-white">{wt.scannerTitle}</h4>
              </div>
              <button
                onClick={() => handleToggleScanner(false)}
                className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Main Scanner Stage */}
            <div className="flex-1 flex flex-col items-center justify-center space-y-4 max-w-sm mx-auto w-full">
              {/* Camera view container */}
              <div className="relative w-full aspect-square max-w-[240px] rounded-2xl overflow-hidden border border-slate-800 bg-slate-900 shadow-2xl flex items-center justify-center shrink-0">
                
                {/* Circular analysis progress indicator */}
                <div className={`absolute top-3 bg-slate-950/80 border border-slate-800/85 backdrop-blur-md px-2 py-1.5 rounded-xl flex items-center gap-2 z-20 shadow-lg pointer-events-none transition-all ${isRtl ? "right-3 flex-row" : "left-3 flex-row-reverse"}`}>
                  <div className="relative flex items-center justify-center w-7 h-7">
                    <svg className="w-7 h-7 transform -rotate-90">
                      <circle
                        cx="14"
                        cy="14"
                        r="11"
                        className="stroke-slate-800"
                        strokeWidth="2"
                        fill="transparent"
                      />
                      <motion.circle
                        cx="14"
                        cy="14"
                        r="11"
                        className={scannedId ? "stroke-emerald-400" : "stroke-amber-500"}
                        strokeWidth="2"
                        fill="transparent"
                        strokeDasharray={2 * Math.PI * 11}
                        animate={{ strokeDashoffset: 2 * Math.PI * 11 * (1 - analysisProgress / 100) }}
                        transition={{ duration: 0.15, ease: "linear" }}
                      />
                    </svg>
                    <span className={`absolute text-[8px] font-black font-mono ${scannedId ? "text-emerald-400" : "text-amber-400"}`}>
                      {analysisProgress}%
                    </span>
                  </div>
                  <div className={isRtl ? "text-right" : "text-left"}>
                    <span className="text-[7px] text-slate-400 block font-bold leading-tight">{wt.imageAnalysis}</span>
                    <span className={`text-[8px] font-black leading-tight ${scannedId ? "text-emerald-400" : "text-amber-400 animate-pulse"}`}>
                      {scannedId ? wt.analysisDone : wt.analyzing}
                    </span>
                  </div>
                </div>

                <video
                  ref={videoRef}
                  className="absolute inset-0 w-full h-full object-cover"
                  playsInline
                  muted
                />
                <canvas ref={canvasRef} className="hidden" />

                <div className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-amber-500 to-transparent top-1/2 -translate-y-1/2 animate-[bounce_3s_infinite] shadow-lg shadow-amber-500" />
                
                <div className="absolute top-4 left-4 w-5 h-5 border-t-2 border-l-2 border-amber-500 rounded-tl-md" />
                <div className="absolute top-4 right-4 w-5 h-5 border-t-2 border-r-2 border-amber-500 rounded-tr-md" />
                <div className="absolute bottom-4 left-4 w-5 h-5 border-b-2 border-l-2 border-amber-500 rounded-bl-md" />
                <div className="absolute bottom-4 right-4 w-5 h-5 border-b-2 border-r-2 border-amber-500 rounded-br-md" />

                {!streamRef.current && !scanError && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 text-center p-4 space-y-2">
                    <RefreshCw className="animate-spin text-amber-500" size={24} />
                    <p className="text-[10px] text-slate-400">{wt.waitingCamera}</p>
                  </div>
                )}

                {scanError && (
                  <div className="absolute inset-0 bg-slate-950/90 flex flex-col items-center justify-center p-4 text-center space-y-2">
                    <Camera className="text-rose-500" size={28} />
                    <p className="text-[10px] text-rose-400 font-bold leading-relaxed">{scanError}</p>
                  </div>
                )}
              </div>

              {/* Status decoder feedback */}
              <div className="w-full text-center space-y-2">
                {scannerFeedback ? (
                  <div className={`p-3 rounded-xl border text-[11px] font-bold ${
                    scannedId 
                      ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 animate-bounce" 
                      : "bg-amber-500/10 border-amber-500/20 text-amber-400"
                  }`}>
                    {scannerFeedback}
                  </div>
                ) : (
                  <p className="text-[10px] text-slate-400">
                    {lang === "ku" ? "کۆدی QRی فاتورەکە بخەرە بەرامبەر کامێراکە بۆ خوێندنەوەی دەستبەجێ" : (lang === "ar" ? "وجه رمز الـ QR نحو الكاميرا لقراءته فوراً" : "Aime your camera lens directly at the invoice QR code")}
                  </p>
                )}
              </div>

              {/* Fallback Simulator / Fast tester */}
              <div className="w-full border-t border-slate-800/80 pt-4 mt-2 space-y-3">
                <div className="flex items-center gap-1.5 text-slate-400">
                  <Cpu size={12} className="text-amber-500 animate-pulse" />
                  <span className="text-[10px] font-black">{wt.simScanTitle}</span>
                </div>
                
                {pendingInvoices.length === 0 ? (
                  <p className="text-[9px] text-slate-500">{wt.simScanNoPending}</p>
                ) : (
                  <div className="space-y-2">
                    <p className="text-[9px] text-slate-400">{wt.simScanSelectPending}</p>
                    <div className="grid grid-cols-1 gap-1.5 max-h-[120px] overflow-y-auto custom-scrollbar">
                      {pendingInvoices.map((inv) => (
                        <button
                          key={inv.id}
                          onClick={() => handleDecodedText(`SAS-VERIFY | ID: ${inv.id} | User: ${inv.userEmail}`)}
                          className={`bg-slate-900 hover:bg-slate-800 border border-slate-800/80 p-2 rounded-xl text-[10px] flex justify-between items-center text-slate-300 hover:text-white transition cursor-pointer ${isRtl ? "text-right" : "text-left"}`}
                        >
                          <span className="font-mono text-amber-400 font-black">{inv.id}</span>
                          <span className="text-[9px] text-slate-500 truncate max-w-[120px]">{inv.userEmail}</span>
                          <span className="text-[9px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-md font-bold">Mock Scan</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Direct text input bypass */}
                <div className="space-y-1.5 pt-1.5">
                  <span className="text-[9px] text-slate-400 block">{wt.manualPasteLabel}</span>
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      placeholder={wt.manualPastePlaceholder}
                      value={manualCodeInput}
                      onChange={(e) => setManualCodeInput(e.target.value)}
                      className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-[10px] font-mono text-left focus:outline-none focus:border-amber-500 text-slate-300"
                    />
                    <button
                      onClick={() => {
                        if (manualCodeInput) {
                          handleDecodedText(manualCodeInput);
                          setManualCodeInput("");
                        }
                      }}
                      className="bg-amber-500 hover:bg-amber-600 text-slate-950 px-3 py-2 rounded-xl text-[10px] font-black cursor-pointer transition active:scale-95 shrink-0"
                    >
                      {wt.bypassButton}
                    </button>
                  </div>
                </div>
              </div>

            </div>

            {/* Verification Complete Celebration Overlay */}
            <AnimatePresence>
              {showCelebration && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-slate-950/98 z-50 flex flex-col items-center justify-center p-6 text-center space-y-6"
                >
                  <div className="absolute w-72 h-72 bg-emerald-500/15 rounded-full filter blur-3xl animate-pulse pointer-events-none" />

                  <div className="relative flex items-center justify-center">
                    <motion.div
                      animate={{ scale: [1, 1.35, 1], opacity: [0.6, 0.2, 0.6] }}
                      transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                      className="absolute w-24 h-24 bg-emerald-500/20 rounded-full border-2 border-emerald-500/40"
                    />
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
                      className="absolute w-28 h-28 border-4 border-dashed border-emerald-500/20 rounded-full"
                    />

                    <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center shadow-2xl shadow-emerald-500/40 relative z-10 border border-emerald-400">
                      <motion.div
                        initial={{ scale: 0, rotate: -45 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ delay: 0.15, type: "spring", stiffness: 220, damping: 12 }}
                      >
                        <Check size={42} className="text-slate-950 stroke-[3.5]" />
                      </motion.div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 justify-center">
                    <Sparkles className="text-yellow-400 animate-bounce" size={18} />
                    <span className="text-[10px] uppercase tracking-widest text-emerald-400 font-extrabold font-mono">{wt.verifiedQrText}</span>
                    <Sparkles className="text-yellow-400 animate-bounce" size={18} />
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-xl font-black text-white">{wt.officialApprovalTitle}</h3>
                    <p className="text-slate-300 text-xs max-w-xs leading-relaxed">
                      {wt.officialApprovalDesc1} <span className="font-mono font-bold text-emerald-400 text-sm">SAS-INV-001</span> {wt.officialApprovalDesc2}
                    </p>
                    <p className="text-slate-400 text-[10px] max-w-xs">
                      {wt.subscriptionActiveSuccess}
                    </p>
                  </div>

                  <div className="bg-emerald-500/10 border border-emerald-500/30 px-4 py-2 rounded-2xl text-[10px] font-bold text-emerald-400 flex items-center gap-1.5 shadow-lg">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    <span>VERIFICATION COMPLETE</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer warning */}
      <div className="bg-slate-950 p-3 border-t border-slate-800 text-center text-[10px] text-slate-500 flex items-center justify-center gap-1.5 shrink-0">
        <AlertCircle size={10} className="text-amber-500" />
        <span>{wt.sandboxWarningText}</span>
      </div>

      {/* CAMERA VERIFICATION GUIDE & FAQ MODAL */}
      <AnimatePresence>
        {showHelpModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className={`bg-slate-900 border border-slate-800/80 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl ${textAlignClass}`}
              dir={dirAttr}
            >
              {/* Header */}
              <div className={`bg-slate-950/80 px-6 py-4 border-b border-slate-800/60 flex items-center justify-between ${isRtl ? "flex-row" : "flex-row-reverse"}`}>
                <button
                  onClick={() => setShowHelpModal(false)}
                  className="text-slate-400 hover:text-white bg-slate-850 hover:bg-slate-800 p-1.5 rounded-xl transition-colors cursor-pointer"
                >
                  <X size={16} />
                </button>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-sm text-slate-100">{wt.helpModalTitle}</span>
                  <HelpCircle size={18} className="text-amber-500" />
                </div>
              </div>

              {/* Body Content */}
              <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar text-slate-300 text-xs leading-relaxed">
                <div className={`bg-amber-500/10 border border-amber-500/20 p-3.5 rounded-2xl flex gap-3 items-start ${isRtl ? "flex-row text-right" : "flex-row-reverse text-left"}`}>
                  <div className="flex-1">
                    <h4 className="font-extrabold text-amber-400 text-xs mb-1">{wt.helpFaqSystemTitle}</h4>
                    <p className="text-[11px] text-slate-300 leading-normal">
                      {wt.helpFaqSystemDesc}
                    </p>
                  </div>
                  <Sparkles size={18} className="text-amber-400 shrink-0 mt-0.5" />
                </div>

                {/* Steps */}
                <div className="space-y-3">
                  <h3 className="font-black text-slate-200 text-xs border-b border-slate-800 pb-1.5">{wt.helpCameraStepTitle}</h3>
                  
                  <div className="space-y-2.5">
                    <div className={`flex gap-2.5 items-start ${isRtl ? "flex-row text-right" : "flex-row-reverse text-left"}`}>
                      <div className="flex-1">
                        <span className="font-bold text-slate-200 block text-[11px]">{wt.helpStep1Title}</span>
                        <span className="text-[10px] text-slate-400 block">{wt.helpStep1Desc}</span>
                      </div>
                      <div className="w-5 h-5 bg-indigo-500/10 text-indigo-400 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">1</div>
                    </div>

                    <div className={`flex gap-2.5 items-start ${isRtl ? "flex-row text-right" : "flex-row-reverse text-left"}`}>
                      <div className="flex-1">
                        <span className="font-bold text-slate-200 block text-[11px]">{wt.helpStep2Title}</span>
                        <span className="text-[10px] text-slate-400 block">{wt.helpStep2Desc}</span>
                      </div>
                      <div className="w-5 h-5 bg-indigo-500/10 text-indigo-400 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">2</div>
                    </div>

                    <div className={`flex gap-2.5 items-start ${isRtl ? "flex-row text-right" : "flex-row-reverse text-left"}`}>
                      <div className="flex-1">
                        <span className="font-bold text-slate-200 block text-[11px]">{wt.helpStep3Title}</span>
                        <span className="text-[10px] text-slate-400 block">{wt.helpStep3Desc}</span>
                      </div>
                      <div className="w-5 h-5 bg-indigo-500/10 text-indigo-400 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">3</div>
                    </div>
                  </div>
                </div>

                {/* FAQ Section */}
                <div className="space-y-3 pt-2">
                  <h3 className="font-black text-slate-200 text-xs border-b border-slate-800 pb-1.5">{wt.helpFaqTitle}</h3>
                  
                  <div className="space-y-3">
                    <div className="bg-slate-950/40 p-3 rounded-2xl border border-slate-800/40 space-y-1">
                      <h4 className="font-bold text-slate-100 text-[11px]">{wt.helpFaqCameraBlockTitle}</h4>
                      <p className="text-[10px] text-slate-400">
                        {wt.helpFaqCameraBlockDesc}
                      </p>
                    </div>

                    <div className="bg-slate-950/40 p-3 rounded-2xl border border-slate-800/40 space-y-1">
                      <h4 className="font-bold text-slate-100 text-[11px]">{wt.helpFaqNoCameraTitle}</h4>
                      <p className="text-[10px] text-slate-400">
                        {wt.helpFaqNoCameraDesc}
                      </p>
                    </div>

                    <div className="bg-slate-950/40 p-3 rounded-2xl border border-slate-800/40 space-y-1">
                      <h4 className="font-bold text-slate-100 text-[11px]">{wt.helpFaqPhoneScanTitle}</h4>
                      <p className="text-[10px] text-slate-400">
                        {wt.helpFaqPhoneScanDesc}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className={`bg-slate-950/80 px-6 py-4 border-t border-slate-800/60 flex ${isRtl ? "justify-end" : "justify-start"}`}>
                <button
                  onClick={() => setShowHelpModal(false)}
                  className="bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white font-black px-6 py-2 rounded-2xl text-[11px] cursor-pointer transition-all active:scale-95 shadow-md"
                >
                  {wt.understandCloseBtn}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SIMPLIFIED PRINT-FRIENDLY INVOICE MODAL */}
      <AnimatePresence>
        {printInvoice && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 overflow-y-auto no-print animate-fade-in"
          >
            <style>{`
              @media print {
                body * {
                  visibility: hidden !important;
                }
                .print-invoice-area, .print-invoice-area * {
                  visibility: visible !important;
                }
                .print-invoice-area {
                  position: absolute !important;
                  left: 0 !important;
                  top: 0 !important;
                  width: 100% !important;
                  margin: 0 !important;
                  padding: 24px !important;
                  background: white !important;
                  color: #0f172a !important;
                  box-shadow: none !important;
                  border: none !important;
                }
                .no-print {
                  display: none !important;
                }
              }
            `}</style>

            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white text-slate-900 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col border border-slate-200"
            >
              {/* Controls Header - strictly hidden in print */}
              <div className={`bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center justify-between no-print ${isRtl ? "flex-row" : "flex-row-reverse"}`}>
                <button
                  onClick={() => setPrintInvoice(null)}
                  className="text-slate-500 hover:text-slate-800 bg-slate-200/50 hover:bg-slate-200 p-1.5 rounded-xl transition-colors cursor-pointer"
                >
                  <X size={16} />
                </button>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-sm text-slate-800">{wt.printPreviewTitle}</span>
                  <Printer size={18} className="text-indigo-600" />
                </div>
              </div>

              {/* Printable Area */}
              <div className={`p-8 space-y-6 print-invoice-area bg-white text-slate-900 ${textAlignClass}`} dir={dirAttr}>
                {/* Invoice Header */}
                <div className={`flex justify-between items-start border-b border-slate-200 pb-5 ${isRtl ? "flex-row text-right" : "flex-row-reverse text-left"}`}>
                  <div>
                    <h2 className="text-2xl font-black tracking-tight text-slate-900">{wt.printInvoiceSystemTitle}</h2>
                    <p className="text-xs text-slate-500 mt-1">{wt.printInvoiceSystemSubtitle}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{wt.printInvoiceSystemUrl}</p>
                  </div>
                  <div className={isRtl ? "text-left" : "text-right"}>
                    <div className="bg-slate-900 text-white font-mono text-[11px] font-black px-3 py-1.5 rounded-xl uppercase tracking-wider inline-block">
                      {printInvoice.id}
                    </div>
                    <p className="text-[10px] text-slate-500 mt-2">{wt.printInvoiceDateLabel} {printInvoice.invoiceDate}</p>
                  </div>
                </div>

                {/* Status Indicator */}
                <div className={`flex justify-between items-center bg-slate-50 p-4 rounded-2xl border border-slate-100 ${isRtl ? "flex-row" : "flex-row-reverse"}`}>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase tracking-wider font-bold">{wt.printInvoiceStatusLabel}</span>
                    <span className={`text-xs font-black px-2.5 py-1 rounded-lg inline-block mt-1 ${
                      printInvoice.status === "approved" 
                        ? "bg-emerald-100 text-emerald-800" 
                        : printInvoice.status === "rejected"
                        ? "bg-rose-100 text-rose-800"
                        : "bg-amber-100 text-amber-800"
                    }`}>
                      {printInvoice.status === "approved" 
                        ? wt.printInvoiceApprovedStatus 
                        : printInvoice.status === "rejected"
                        ? wt.printInvoiceRejectedStatus
                        : wt.printInvoicePendingStatus}
                    </span>
                  </div>
                  <div className={isRtl ? "text-left" : "text-right"}>
                    <span className="text-[10px] text-slate-400 block uppercase tracking-wider font-bold">{wt.printInvoicePaymentMethod}</span>
                    <span className="text-xs font-extrabold text-slate-800 block mt-1">
                      {printInvoice.paymentMethod}
                    </span>
                  </div>
                </div>

                {/* Invoice Metadata Grid */}
                <div className={`grid grid-cols-2 gap-4 text-xs border-b border-slate-200 pb-5 ${textAlignClass}`}>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold mb-1">{wt.printInvoiceDirectedTo}</span>
                    <span className="font-extrabold text-slate-800 block">{printInvoice.userEmail}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold mb-1">{wt.printInvoiceTxLabel}</span>
                    <span className="font-mono text-slate-700 block select-all">{printInvoice.transactionId}</span>
                  </div>
                </div>

                {/* Items Table */}
                <div className="space-y-3">
                  <span className="text-[10px] text-slate-400 block font-bold">{wt.printInvoiceDetailsTitle}</span>
                  <table className={`w-full text-xs border-collapse ${isRtl ? "text-right" : "text-left"}`}>
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-500 bg-slate-50">
                        <th className="py-2.5 px-3 font-bold">{wt.printInvoiceTableHeaderItem}</th>
                        <th className="py-2.5 px-3 font-bold text-center">{wt.printInvoiceTableHeaderQuantity}</th>
                        <th className={`py-2.5 px-3 font-bold ${isRtl ? "text-left" : "text-right"}`}>{wt.printInvoiceTableHeaderTotal}</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-slate-150">
                        <td className="py-3 px-3">
                          <span className="font-black text-slate-800 block">{printInvoice.planName}</span>
                          <span className="text-[10px] text-slate-500 block mt-0.5">{wt.printInvoiceTableSubDesc}</span>
                        </td>
                        <td className="py-3 px-3 text-center text-slate-600 font-bold">1</td>
                        <td className={`py-3 px-3 text-slate-950 font-black font-mono ${isRtl ? "text-left" : "text-right"}`}>
                          {printInvoice.amount.toLocaleString()} {wt.printInvoiceTableCurrency}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Total section */}
                <div className={`flex flex-col gap-1.5 pt-2 ${isRtl ? "items-end" : "items-start"}`}>
                  <div className="flex gap-12 text-xs">
                    <span className="text-slate-500">{wt.printInvoiceTotalLabel}</span>
                    <span className="font-bold text-slate-800 font-mono">{printInvoice.amount.toLocaleString()} {wt.printInvoiceTableCurrency}</span>
                  </div>
                  <div className={`flex gap-12 text-sm border-t border-slate-200 pt-2 w-full ${isRtl ? "justify-end" : "justify-start"}`}>
                    <span className="font-black text-slate-900">{wt.printInvoiceFinalAmountLabel}</span>
                    <span className="font-black text-indigo-600 font-mono">{printInvoice.amount.toLocaleString()} {wt.printInvoiceTableCurrency}</span>
                  </div>
                </div>

                {/* Stamp/Auth Section */}
                <div className={`flex justify-between items-end pt-12 text-[10px] text-slate-400 ${isRtl ? "flex-row" : "flex-row-reverse"}`}>
                  <div className="text-center">
                    <p className="font-bold text-slate-500 mb-6">{wt.printInvoiceSignatureTitle}</p>
                    <div className="w-32 border-b border-dashed border-slate-300 mx-auto" />
                  </div>
                  <div className={`text-[9px] leading-relaxed ${isRtl ? "text-left" : "text-right"}`}>
                    <p className="font-bold text-slate-500">{wt.printInvoiceSignatureElectronic}</p>
                    <p className="font-mono mt-0.5">SECURE-DIGITAL-SIGNATURE</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className={`bg-slate-50 px-6 py-4 border-t border-slate-200 flex justify-between gap-3 no-print ${isRtl ? "flex-row-reverse" : "flex-row"}`}>
                <button
                  onClick={() => setPrintInvoice(null)}
                  className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold px-5 py-2 rounded-2xl text-[11px] cursor-pointer transition-colors"
                >
                  {wt.printInvoiceCloseBtn}
                </button>
                <button
                  onClick={() => {
                    registerPrintEvent(printInvoice.id);
                    window.print();
                  }}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-black px-6 py-2 rounded-2xl text-[11px] cursor-pointer transition-all active:scale-95 shadow-md flex items-center gap-1.5"
                >
                  <Printer size={13} />
                  <span>{wt.printInvoicePrintBtn}</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* VERIFICATION STATS ANALYTICS MODAL */}
      <AnimatePresence>
        {selectedStatsInvoice && (() => {
          // Generate stats data for selected stats invoice
          const statsData = (() => {
            const days = [];
            // Last 7 days names
            const daysOfWeekKu = ["یەکشەممە", "دووشەممە", "سێشەممە", "چوارشەممە", "پێنجشەممە", "هەینی", "شەممە"];
            const daysOfWeekAr = ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];
            const daysOfWeekEn = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

            // Use determinism based on selectedStatsInvoice.id
            const hash = selectedStatsInvoice.id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);

            for (let i = 6; i >= 0; i--) {
              const d = new Date();
              d.setDate(d.getDate() - i);
              const dayName = lang === "ku" 
                ? daysOfWeekKu[d.getDay()] 
                : lang === "ar" 
                  ? daysOfWeekAr[d.getDay()] 
                  : daysOfWeekEn[d.getDay()];
              
              const dateString = d.toLocaleDateString(lang === "en" ? "en-US" : "ar-EG", { month: "short", day: "numeric" });
              
              const seed = (hash + i * 13) % 10;
              const successes = (seed % 4) + 1;
              const failures = seed % 3;
              
              days.push({
                name: dayName,
                date: dateString,
                [st.successLabel]: successes,
                [st.failedLabel]: failures,
                total: successes + failures,
              });
            }
            return days;
          })();

          const totalAttemptsCount = statsData.reduce((acc, cur) => acc + cur.total, 0);
          const totalSuccesses = statsData.reduce((acc, cur) => acc + cur[st.successLabel], 0);
          const successRatePercentage = totalAttemptsCount > 0 ? Math.round((totalSuccesses / totalAttemptsCount) * 100) : 100;
          // Deterministic average response time (e.g. 1.2s to 1.8s)
          const avgResponseTime = (1.1 + (selectedStatsInvoice.id.charCodeAt(selectedStatsInvoice.id.length - 1) % 8) * 0.1).toFixed(1);

          return (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 overflow-y-auto"
            >
              <motion.div
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 20 }}
                className="bg-slate-900 border border-slate-800 text-slate-100 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col font-sans"
                dir={dirAttr}
              >
                {/* Header */}
                <div className={`bg-slate-950 px-6 py-4 border-b border-slate-800/60 flex items-center justify-between ${isRtl ? "flex-row" : "flex-row-reverse"}`}>
                  <button
                    onClick={() => setSelectedStatsInvoice(null)}
                    className="text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-800 p-1.5 rounded-xl transition-colors cursor-pointer"
                  >
                    <X size={16} />
                  </button>
                  <div className="flex items-center gap-2.5">
                    <TrendingUp size={18} className="text-amber-500 animate-pulse" />
                    <span className="font-extrabold text-sm text-amber-400">
                      {st.modalTitle}
                    </span>
                  </div>
                </div>

                {/* Body */}
                <div className="p-6 space-y-6">
                  {/* Meta details */}
                  <div className={`flex justify-between items-center bg-slate-950/50 p-4 border border-slate-800/80 rounded-2xl ${isRtl ? "flex-row text-right" : "flex-row-reverse text-left"}`}>
                    <div className="space-y-1">
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">ID / Email</span>
                      <span className="font-extrabold text-xs text-slate-200 block">{selectedStatsInvoice.id}</span>
                      <span className="text-[10px] text-slate-400 block font-mono">{selectedStatsInvoice.userEmail}</span>
                    </div>
                    <div className={isRtl ? "text-left" : "text-right"}>
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">{wt.amountLabel}</span>
                      <span className="font-black text-amber-400 text-sm font-mono block">
                        {selectedStatsInvoice.amount.toLocaleString()} {wt.currencyLabel}
                      </span>
                      <span className="text-[9px] bg-slate-800 text-slate-300 font-extrabold px-2 py-0.5 rounded-full mt-1 inline-block">
                        {selectedStatsInvoice.planName}
                      </span>
                    </div>
                  </div>

                  {/* Chart Title */}
                  <div className="space-y-1 text-center">
                    <h4 className="text-xs font-black text-slate-300">{st.attemptsTitle}</h4>
                    <p className="text-[10px] text-slate-500 font-medium">({st.last7Days})</p>
                  </div>

                  {/* Recharts Container */}
                  <div className="h-60 w-full bg-slate-950/40 border border-slate-800/50 p-2.5 rounded-2xl" dir="ltr">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={statsData}
                        margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                        <XAxis 
                          dataKey="name" 
                          stroke="#64748b" 
                          fontSize={9} 
                          tickLine={false} 
                          axisLine={false}
                        />
                        <YAxis 
                          stroke="#64748b" 
                          fontSize={9} 
                          tickLine={false} 
                          axisLine={false}
                          allowDecimals={false}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#0f172a",
                            borderColor: "#334155",
                            borderRadius: "12px",
                            fontSize: "10px",
                            fontFamily: "sans-serif",
                          }}
                          labelStyle={{ fontWeight: "bold", color: "#94a3b8" }}
                        />
                        <Legend 
                          wrapperStyle={{ fontSize: "10px", marginTop: "10px" }} 
                        />
                        <Bar 
                          dataKey={st.successLabel} 
                          stackId="a" 
                          fill="#10b981" 
                          radius={[0, 0, 0, 0]} 
                        />
                        <Bar 
                          dataKey={st.failedLabel} 
                          stackId="a" 
                          fill="#f43f5e" 
                          radius={[4, 4, 0, 0]} 
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Summary Metrics Grid */}
                  <div className="space-y-2">
                    <span className={`text-[10px] text-slate-400 font-black block uppercase tracking-wider ${isRtl ? "text-right" : "text-left"}`}>
                      {st.statsSummary}
                    </span>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-slate-950/40 border border-slate-800/80 p-3 rounded-2xl text-center space-y-1">
                        <span className="text-[9px] text-slate-500 font-bold block">{st.totalAttempts}</span>
                        <span className="text-sm font-black text-slate-100 font-mono block">
                          {totalAttemptsCount} <span className="text-[10px] text-slate-500 font-medium">{st.attemptsCount}</span>
                        </span>
                      </div>
                      <div className="bg-slate-950/40 border border-slate-800/80 p-3 rounded-2xl text-center space-y-1">
                        <span className="text-[9px] text-slate-500 font-bold block">{st.successRate}</span>
                        <span className="text-sm font-black text-emerald-400 font-mono block">
                          {successRatePercentage}%
                        </span>
                      </div>
                      <div className="bg-slate-950/40 border border-slate-800/80 p-3 rounded-2xl text-center space-y-1">
                        <span className="text-[9px] text-slate-500 font-bold block">{st.avgTime}</span>
                        <span className="text-sm font-black text-cyan-400 font-mono block">
                          {avgResponseTime}s
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="bg-slate-950 px-6 py-4 border-t border-slate-800/60 flex justify-end">
                  <button
                    onClick={() => setSelectedStatsInvoice(null)}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold px-6 py-2 rounded-2xl text-[11px] cursor-pointer transition-colors"
                  >
                    {st.closeBtn}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          );
        })()}
      </AnimatePresence>
    </div>
  );
}
