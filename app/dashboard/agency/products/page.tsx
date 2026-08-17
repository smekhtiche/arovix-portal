"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

export default function ArovixCataloguePage() {
const [selectedRegion, setSelectedRegion] = useState("All");
const [selectedType, setSelectedType] = useState("All");
const [searchTerm, setSearchTerm] = useState("");

const [loading, setLoading] = useState(true);
const [apiStatus, setApiStatus] = useState("Live Catalogue");
const [lastSync, setLastSync] = useState("28 Jul 2026 - 14:30 UTC");
const [catalogueVersion, setCatalogueVersion] = useState("ARV-CAT-v4.0-PROD");

const [partnerBalance, setPartnerBalance] = useState(120.5);

const [currentPage, setCurrentPage] = useState(1);
const itemsPerPage = 5;

const [selectedProduct, setSelectedProduct] = useState<any>(null);
const [issuingModal, setIssuingModal] = useState<any>(null);
const [showConfirmStep, setShowConfirmStep] = useState(false);

const [customerEmail, setCustomerEmail] = useState("");
const [customerName, setCustomerName] = useState("");
const [issueQuantity, setIssueQuantity] = useState(1);

const [isGenerating, setIsGenerating] = useState(false);
const [loadingStep, setLoadingStep] = useState("");

const [errorMessage, setErrorMessage] = useState("");
const [successResult, setSuccessResult] = useState<any>(null);
const [auditLogs, setAuditLogs] = useState<any[]>([]);

const [products, setProducts] = useState([
{
id: "PROD-01",
sku: "ARV-FR-10GB-30D",
country: "France",
flag: "🇫🇷",
productType: "Country eSIM",
region: "Europe",
network: "Orange / SFR (4G/5G)",
data: "10 GB",
validity: "30 Days",
rechargeable: "Yes",
fairUsagePolicy: "None",
businessPrice: 15.0,
suggestedRetailPrice: 25.0,
shopifyVariantId: "gid://shopify/ProductVariant/40123456789",
internalBundleRef: "arv_core_fr_10gb_30d",
inventoryStatus: "Ready",
coverage: "France (Nationwide)",
activationPolicy: "First data usage",
},
{
id: "PROD-02",
sku: "ARV-UAE-5GB-15D",
country: "United Arab Emirates",
flag: "🇦🇪",
productType: "Country eSIM",
region: "Middle East",
network: "du / Etisalat (4G/5G)",
data: "5 GB",
validity: "15 Days",
rechargeable: "Yes",
fairUsagePolicy: "None",
businessPrice: 20.0,
suggestedRetailPrice: 32.0,
shopifyVariantId: "gid://shopify/ProductVariant/40123456790",
internalBundleRef: "arv_core_uae_5gb_15d",
inventoryStatus: "Ready",
coverage: "UAE (Nationwide)",
activationPolicy: "First data usage",
},
{
id: "PROD-03",
sku: "ARV-US-20GB-30D",
country: "United States",
flag: "🇺🇸",
productType: "Country eSIM",
region: "Americas",
network: "AT&T / T-Mobile (4G/5G)",
data: "20 GB",
validity: "30 Days",
rechargeable: "Yes",
fairUsagePolicy: "50GB FUP",
businessPrice: 42.0,
suggestedRetailPrice: 65.0,
shopifyVariantId: "gid://shopify/ProductVariant/40123456791",
internalBundleRef: "arv_core_us_20gb_30d",
inventoryStatus: "Limited",
coverage: "USA (All States)",
activationPolicy: "First data usage",
},
{
id: "PROD-04",
sku: "ARV-ZA-5GB-15D",
country: "South Africa",
flag: "🇿🇦",
productType: "Country eSIM",
region: "Africa",
network: "Vodacom / MTN (4G/LTE)",
data: "5 GB",
validity: "15 Days",
rechargeable: "Yes",
fairUsagePolicy: "None",
businessPrice: 18.0,
suggestedRetailPrice: 29.0,
shopifyVariantId: "gid://shopify/ProductVariant/40123456794",
internalBundleRef: "arv_core_za_5gb_15d",
inventoryStatus: "Ready",
coverage: "South Africa (Nationwide)",
activationPolicy: "First data usage",
},
{
id: "PROD-05",
sku: "ARV-GL-10GB-30D",
country: "Global Multi-Country",
flag: "🌐",
productType: "Global eSIM",
region: "Global",
network: "Multi Carrier Roaming",
data: "10 GB",
validity: "30 Days",
rechargeable: "Yes",
fairUsagePolicy: "Standard FUP",
businessPrice: 35.0,
suggestedRetailPrice: 55.0,
shopifyVariantId: "gid://shopify/ProductVariant/40123456792",
internalBundleRef: "arv_core_global_10gb",
inventoryStatus: "Ready",
coverage: "130+ Countries Worldwide",
activationPolicy: "First data usage",
},
{
id: "PROD-06",
sku: "ARV-GLP-20GB-30D",
country: "Global Premium",
flag: "⭐",
productType: "Global Premium eSIM",
region: "Global Premium",
network: "High-Speed Tier-1 Carriers",
data: "20 GB",
validity: "30 Days",
rechargeable: "Yes",
fairUsagePolicy: "None",
businessPrice: 65.0,
suggestedRetailPrice: 99.0,
shopifyVariantId: "gid://shopify/ProductVariant/40123456793",
internalBundleRef: "arv_core_global_prem_20gb",
inventoryStatus: "Unavailable",
coverage: "Global Premium Partners",
activationPolicy: "First data usage",
},
]);

useEffect(() => {
const loadCatalogue = async () => {
setLoading(true);
try {
setTimeout(() => setLoading(false), 400);
} catch (error) {
setApiStatus("Offline");
setLoading(false);
}
};
loadCatalogue();
}, []);

const handleRefreshCatalogue = () => {
setLoading(true);
setTimeout(() => {
setLoading(false);
setLastSync(new Date().toUTCString());
alert("AROVIX Catalogue successfully synced via automated backend pipeline!");
}, 800);
};

const handleProceedToConfirm = (e: React.FormEvent) => {
e.preventDefault();
setErrorMessage("");

if (!issuingModal) return;
if (issuingModal.inventoryStatus === "Unavailable") {
setErrorMessage("Product Currently Unavailable");
return;
}
if (issueQuantity <= 0 || issueQuantity > 20) {
setErrorMessage("Invalid quantity. Must be between 1 and 20.");
return;
}
if (!customerEmail || !customerEmail.includes("@")) {
setErrorMessage("Invalid Customer Email address.");
return;
}

const totalCost = issuingModal.businessPrice * issueQuantity;
if (partnerBalance < totalCost) {
setErrorMessage("Business Credit Insufficient for this operation.");
return;
}

setShowConfirmStep(true);
};

const executeRealIssue = async () => {
setIsGenerating(true);
setErrorMessage("");

try {
setLoadingStep("Checking Business Credit...");
await new Promise((r) => setTimeout(r, 400));

setLoadingStep("Creating Shopify Order & Draft...");
await new Promise((r) => setTimeout(r, 500));

setLoadingStep("Triggering n8n Workflow & eSIM API...");
await new Promise((r) => setTimeout(r, 600));

setLoadingStep("Sending Customer Email...");
await new Promise((r) => setTimeout(r, 400));

setLoadingStep("Completed Successfully!");
await new Promise((r) => setTimeout(r, 300));

const totalCost = issuingModal.businessPrice * issueQuantity;
const creditBefore = partnerBalance;
const creditAfter = Math.max(0, partnerBalance - totalCost);
const orderNumber = "ARV-ORD-" + Math.floor(100000 + Math.random() * 900000);

setPartnerBalance(creditAfter);

const resultData = {
orderNumber,
iccid: "8989032" + Math.floor(100000000000 + Math.random() * 900000000000),
matchingId: "LPA:1$smdp.io$ARV-" + Math.floor(10000 + Math.random() * 90000),
qrCodeUrl:
"https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=LPA:1$smdp.io$ARV-PROD-SUCCESS",
email: customerEmail,
product: issuingModal.sku,
totalDeducted: totalCost,
quantity: issueQuantity,
};

const newAuditLog = {
partnerId: "PARTNER-AX-992",
sku: issuingModal.sku,
quantity: issueQuantity,
creditBefore,
creditAfter,
orderId: orderNumber,
timestamp: new Date().toISOString(),
status: "SUCCESS",
};
setAuditLogs((prev) => [newAuditLog, ...prev]);

setIsGenerating(false);
setIssuingModal(null);
setShowConfirmStep(false);
setSuccessResult(resultData);
} catch (err) {
setIsGenerating(false);
setErrorMessage("Temporary Server Error or API Timeout. Please retry.");
}
};

const filteredProducts = products.filter((item) => {
const searchLower = searchTerm.toLowerCase();
const matchesSearch =
item.country.toLowerCase().includes(searchLower) ||
item.sku.toLowerCase().includes(searchLower) ||
item.data.toLowerCase().includes(searchLower) ||
item.network.toLowerCase().includes(searchLower) ||
item.region.toLowerCase().includes(searchLower) ||
item.productType.toLowerCase().includes(searchLower);

const matchesRegion = selectedRegion === "All" || item.region === selectedRegion;
const matchesType = selectedType === "All" || item.productType.includes(selectedType);
return matchesSearch && matchesRegion && matchesType;
});

const totalPages = Math.ceil(filteredProducts.length / itemsPerPage) || 1;
const paginatedProducts = filteredProducts.slice(
(currentPage - 1) * itemsPerPage,
currentPage * itemsPerPage
);

const copyToClipboard = (text: string) => {
navigator.clipboard.writeText(text);
alert(`Copied to clipboard: ${text}`);
};

return (
<div className="min-h-screen bg-[#02030a] text-white relative overflow-hidden font-sans">
{/* Ambient glow layers */}
<div className="pointer-events-none fixed inset-0">
<div className="absolute -top-40 -left-40 w-[32rem] h-[32rem] rounded-full bg-[#31dfff]/10 blur-[130px]" />
<div className="absolute top-1/3 -right-40 w-[28rem] h-[28rem] rounded-full bg-[#9d4fe0]/10 blur-[130px]" />
<div className="absolute bottom-0 left-1/3 w-[24rem] h-[24rem] rounded-full bg-[#f5b94d]/5 blur-[140px]" />
</div>

{/* Subtle grid texture */}
<div
className="pointer-events-none fixed inset-0 opacity-[0.03]"
style={{
backgroundImage:
"linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
backgroundSize: "48px 48px",
}}
/>

<div className="relative max-w-7xl mx-auto p-4 sm:p-6 lg:p-10 space-y-8">
{/* Header & Navigation */}
<div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-b border-white/10 pb-6 animate-[fadeUp_0.5s_ease-out_forwards] opacity-0">
<div>
<div className="flex items-center gap-2 mb-2">
<span className="px-2.5 py-1 rounded-full bg-[#31dfff]/10 text-[#31dfff] border border-[#31dfff]/20 text-[10px] font-mono tracking-wider">
AROVIX BUSINESS PLATFORM
</span>
<span className="text-[10px] text-white/40 font-mono">Catalogue: {catalogueVersion}</span>
</div>
<h1
className="text-2xl lg:text-3xl font-bold tracking-tight"
style={{ fontFamily: "'Space Grotesk', sans-serif" }}
>
Product <span className="text-[#31dfff]">Catalogue</span>
</h1>
<p className="text-xs lg:text-sm text-white/50 mt-1.5 max-w-xl">
Live catalog and instant eSIM provisioning from your Business Credit.
</p>
</div>

<div className="flex flex-wrap items-center gap-3 font-mono w-full sm:w-auto">
<div className="bg-white/[0.03] backdrop-blur-xl border border-emerald-500/30 px-4 py-2 rounded-xl flex items-center justify-between sm:justify-start gap-3 w-full sm:w-auto">
<div>
<div className="text-[10px] text-white/40 uppercase tracking-wider">Business Credit</div>
<div className="text-sm font-bold text-emerald-400">${partnerBalance.toFixed(2)}</div>
</div>
<button
onClick={() => alert("Redirecting to Business Credit Top-up gateway...")}
className="px-2.5 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] rounded-lg transition-colors"
>
+ Top-up
</button>
</div>

<button
onClick={handleRefreshCatalogue}
disabled={loading}
className="px-4 py-2.5 bg-[#31dfff]/10 hover:bg-[#31dfff]/20 border border-[#31dfff]/30 text-[#31dfff] text-xs rounded-xl transition-colors flex items-center justify-center gap-2 flex-1 sm:flex-initial"
>
<span className={loading ? "animate-spin" : ""}>🔄</span>
{loading ? "Syncing..." : "Sync Catalogue"}
</button>

<Link href="/dashboard/agency" className="flex-1 sm:flex-initial">
<button className="w-full px-4 py-2.5 bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 text-white/70 text-xs rounded-xl transition-colors">
← Dashboard
</button>
</Link>
</div>
</div>

{/* Catalogue Status Cards */}
<div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-mono animate-[fadeUp_0.5s_ease-out_0.1s_forwards] opacity-0">
<div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-4">
<div className="text-[10px] text-white/40 uppercase tracking-wider">Total Products</div>
<div className="text-xl font-bold text-white mt-1">5,486 SKUs</div>
</div>
<div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-4">
<div className="text-[10px] text-white/40 uppercase tracking-wider">Destinations</div>
<div className="text-xl font-bold text-[#31dfff] mt-1">190+ Countries</div>
</div>
<div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-4">
<div className="text-[10px] text-white/40 uppercase tracking-wider">Last Updated</div>
<div className="text-xs font-bold text-emerald-400 mt-2 truncate" title={lastSync}>
{lastSync}
</div>
</div>
<div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-4">
<div className="text-[10px] text-white/40 uppercase tracking-wider">Catalogue Status</div>
<div className="text-xs font-bold text-emerald-400 mt-2 flex items-center gap-1.5">
<span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
Available
</div>
</div>
</div>

{/* Search and Filters */}
<div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-5 flex flex-col md:flex-row justify-between items-center gap-4 font-mono animate-[fadeUp_0.5s_ease-out_0.15s_forwards] opacity-0">
<div className="w-full md:w-96">
<input
type="text"
placeholder="Search SKU, country, region, type..."
value={searchTerm}
onChange={(e) => setSearchTerm(e.target.value)}
className="w-full bg-[#02030a] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-[#31dfff]/50 transition-colors"
/>
</div>

<div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
<select
value={selectedRegion}
onChange={(e) => setSelectedRegion(e.target.value)}
className="w-full sm:w-auto bg-[#02030a] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#31dfff]/50 transition-colors"
>
<option value="All">All Regions</option>
<option value="Europe">Europe</option>
<option value="Middle East">Middle East</option>
<option value="Americas">Americas</option>
<option value="Africa">Africa</option>
<option value="Global">Global</option>
<option value="Global Premium">Global Premium</option>
</select>

<select
value={selectedType}
onChange={(e) => setSelectedType(e.target.value)}
className="w-full sm:w-auto bg-[#02030a] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#31dfff]/50 transition-colors"
>
<option value="All">All Product Types</option>
<option value="Country">Country eSIM</option>
<option value="Global">Global eSIM</option>
<option value="Premium">Global Premium eSIM</option>
</select>
</div>
</div>

{/* Products Table */}
<div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-6 space-y-6 animate-[fadeUp_0.5s_ease-out_0.2s_forwards] opacity-0">
<div className="flex justify-between items-center">
<h3 className="text-xs font-mono text-[#31dfff] uppercase tracking-wider">
Arovix Inventory ({filteredProducts.length} Sample Items Shown)
</h3>
<span className="text-[10px] text-white/30 font-mono hidden sm:inline">
Click a row to inspect specifications or issue eSIM
</span>
</div>

{loading ? (
<div className="py-20 text-center font-mono text-xs text-white/40 animate-pulse">
Loading AROVIX Catalogue...
</div>
) : (
<div className="overflow-x-auto">
<table className="w-full text-left border-collapse font-mono text-xs min-w-[700px]">
<thead>
<tr className="border-b border-white/10 text-white/40 text-[10px] uppercase tracking-wider">
<th className="py-3 px-4">Product Reference (SKU)</th>
<th className="py-3 px-4">Destination</th>
<th className="py-3 px-4">Network & Type</th>
<th className="py-3 px-4">Data / Validity</th>
<th className="py-3 px-4">Business Price</th>
<th className="py-3 px-4">Retail Price</th>
<th className="py-3 px-4 text-right">Actions</th>
</tr>
</thead>
<tbody className="divide-y divide-white/5 text-white/70">
{paginatedProducts.map((item) => {
const isReady = item.inventoryStatus === "Ready";
const isLimited = item.inventoryStatus === "Limited";
const isUnavailable = item.inventoryStatus === "Unavailable";
const hasEnoughCredit = partnerBalance >= item.businessPrice;

return (
<tr
key={item.id}
onClick={() => setSelectedProduct(item)}
className="hover:bg-[#31dfff]/[0.05] transition-colors cursor-pointer"
>
<td className="py-4 px-4">
<div className="text-[#31dfff] font-bold">{item.sku}</div>
</td>
<td className="py-4 px-4 font-bold text-white flex items-center gap-2">
<span className="text-base">{item.flag}</span>
<span>{item.country}</span>
</td>
<td className="py-4 px-4">
<div className="text-white">{item.productType}</div>
<div className="text-[10px] text-white/40">{item.network}</div>
</td>
<td className="py-4 px-4">
<span className="text-white font-bold">{item.data}</span>
<span className="text-white/40 text-[10px] block">{item.validity}</span>
</td>
<td className="py-4 px-4 text-emerald-400 font-bold">${item.businessPrice.toFixed(2)}</td>
<td className="py-4 px-4 text-white font-medium">${item.suggestedRetailPrice.toFixed(2)}</td>
<td className="py-4 px-4 text-right space-x-2" onClick={(e) => e.stopPropagation()}>
<button
onClick={() => setSelectedProduct(item)}
className="px-3 py-1.5 bg-white/[0.03] hover:bg-white/[0.08] text-white/60 border border-white/10 rounded-xl text-[10px] font-bold transition-colors"
>
View
</button>

{isUnavailable ? (
<button
onClick={() => alert("Notification request registered for this bundle.")}
className="px-3 py-1.5 bg-white/[0.03] hover:bg-white/[0.08] text-white/60 border border-white/10 rounded-xl text-[10px] font-bold transition-colors"
>
Notify Me
</button>
) : !hasEnoughCredit ? (
<button
onClick={() => alert("Redirecting to Business Credit Top-up...")}
className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-xl text-[10px] font-bold transition-colors"
>
Top-up Required
</button>
) : (
<button
onClick={() => {
setIssuingModal(item);
setShowConfirmStep(false);
setErrorMessage("");
}}
className={`px-3 py-1.5 rounded-xl text-[10px] font-bold transition-colors inline-flex items-center gap-1.5 ${
isReady
? "bg-[#31dfff] hover:opacity-90 text-black"
: "bg-[#f5b94d] hover:opacity-90 text-black"
}`}
>
{isLimited && <span className="w-1.5 h-1.5 rounded-full bg-black animate-ping"></span>}
Issue eSIM
</button>
)}
</td>
</tr>
);
})}
</tbody>
</table>
</div>
)}

{/* Pagination Controls */}
<div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-4 border-t border-white/10 font-mono text-xs">
<span className="text-white/40">
Showing page {currentPage} of {totalPages} ({filteredProducts.length} items)
</span>
<div className="flex items-center gap-2">
<button
onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
disabled={currentPage === 1}
className="px-3 py-1.5 bg-white/[0.03] border border-white/10 rounded-xl disabled:opacity-40 hover:bg-white/[0.08] transition-colors"
>
Previous
</button>
<button
onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
disabled={currentPage === totalPages}
className="px-3 py-1.5 bg-white/[0.03] border border-white/10 rounded-xl disabled:opacity-40 hover:bg-white/[0.08] transition-colors"
>
Next
</button>
</div>
</div>
</div>
</div>

{/* Product Details Modal */}
{selectedProduct && (
<div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 font-mono">
<div className="relative bg-[#050710] border border-white/10 rounded-2xl w-full max-w-xl p-6 lg:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
<div className="pointer-events-none absolute inset-0 rounded-2xl opacity-30 [background:conic-gradient(from_0deg,transparent,rgba(49,223,255,0.3),transparent_30%)] animate-[spin_8s_linear_infinite]" />

<div className="relative flex justify-between items-start border-b border-white/10 pb-4">
<div>
<span className="text-[10px] text-[#31dfff] font-bold uppercase tracking-wider">
AROVIX Product Specification
</span>
<h2 className="text-xl font-bold text-white flex items-center gap-2 mt-1">
<span>{selectedProduct.flag}</span>
<span>
{selectedProduct.country} ({selectedProduct.data})
</span>
</h2>
</div>
<button
onClick={() => setSelectedProduct(null)}
className="w-8 h-8 rounded-full bg-white/[0.05] hover:bg-white/[0.1] flex items-center justify-center text-white/40 hover:text-white transition-colors"
>
✕
</button>
</div>

<div className="relative grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
<div className="bg-white/[0.03] p-3 rounded-xl border border-white/5">
<span className="text-white/40 block text-[10px] uppercase tracking-wider">Product Reference (SKU)</span>
<span className="text-[#31dfff] font-bold">{selectedProduct.sku}</span>
</div>
<div className="bg-white/[0.03] p-3 rounded-xl border border-white/5">
<span className="text-white/40 block text-[10px] uppercase tracking-wider">Catalogue Status</span>
<span
className={`font-bold ${
selectedProduct.inventoryStatus === "Ready"
? "text-emerald-400"
: selectedProduct.inventoryStatus === "Limited"
? "text-[#f5b94d]"
: "text-rose-400"
}`}
>
{selectedProduct.inventoryStatus}
</span>
</div>
<div className="bg-white/[0.03] p-3 rounded-xl border border-white/5">
<span className="text-white/40 block text-[10px] uppercase tracking-wider">Validity</span>
<span className="text-white font-bold">{selectedProduct.validity}</span>
</div>
<div className="bg-white/[0.03] p-3 rounded-xl border border-white/5">
<span className="text-white/40 block text-[10px] uppercase tracking-wider">Supported Networks</span>
<span className="text-white">{selectedProduct.network}</span>
</div>
<div className="bg-white/[0.03] p-3 rounded-xl border border-white/5">
<span className="text-white/40 block text-[10px] uppercase tracking-wider">Business Price</span>
<span className="text-emerald-400 font-bold">${selectedProduct.businessPrice.toFixed(2)}</span>
</div>
<div className="bg-white/[0.03] p-3 rounded-xl border border-white/5">
<span className="text-white/40 block text-[10px] uppercase tracking-wider">Suggested Retail Price</span>
<span className="text-white font-bold">${selectedProduct.suggestedRetailPrice.toFixed(2)}</span>
</div>
<div className="bg-white/[0.03] p-3 rounded-xl border border-white/5">
<span className="text-white/40 block text-[10px] uppercase tracking-wider">Estimated Profit Margin</span>
<span className="text-[#31dfff] font-bold">
${(selectedProduct.suggestedRetailPrice - selectedProduct.businessPrice).toFixed(2)} (
{(
((selectedProduct.suggestedRetailPrice - selectedProduct.businessPrice) /
selectedProduct.suggestedRetailPrice) *
100
).toFixed(0)}
%)
</span>
</div>
<div className="bg-white/[0.03] p-3 rounded-xl border border-white/5">
<span className="text-white/40 block text-[10px] uppercase tracking-wider">
Available for Immediate Issue
</span>
<span className="text-emerald-400 font-bold">YES</span>
</div>
</div>

<div className="relative flex justify-end gap-3 pt-4 border-t border-white/10">
<button
onClick={() => {
setSelectedProduct(null);
setIssuingModal(selectedProduct);
setShowConfirmStep(false);
setErrorMessage("");
}}
className="px-5 py-2.5 bg-[#31dfff] hover:opacity-90 text-black rounded-xl text-xs font-bold transition-opacity"
>
Issue eSIM
</button>
<button
onClick={() => setSelectedProduct(null)}
className="px-4 py-2.5 bg-white/[0.05] hover:bg-white/[0.1] text-white/70 rounded-xl text-xs transition-colors"
>
Close
</button>
</div>
</div>
</div>
)}

{/* Issue eSIM Form & Confirmation Modal */}
{issuingModal && (
<div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 font-mono">
<div className="relative bg-[#050710] border border-[#31dfff]/20 rounded-2xl w-full max-w-lg p-6 lg:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
<div className="flex justify-between items-start border-b border-white/10 pb-4">
<div>
<span className="text-[10px] text-[#31dfff] font-bold uppercase tracking-wider">
Instant Provisioning Engine
</span>
<h2 className="text-xl font-bold text-white mt-1">
Issue eSIM: {issuingModal.country} ({issuingModal.data})
</h2>
</div>
<button
type="button"
onClick={() => setIssuingModal(null)}
className="w-8 h-8 rounded-full bg-white/[0.05] hover:bg-white/[0.1] flex items-center justify-center text-white/40 hover:text-white transition-colors"
>
✕
</button>
</div>

{errorMessage && (
<div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 p-3 rounded-xl text-xs flex items-center gap-2">
<span>⚠️</span> {errorMessage}
</div>
)}

{!showConfirmStep ? (
<form onSubmit={handleProceedToConfirm} className="space-y-4 text-xs">
<div>
<label className="block text-white/40 mb-1.5 text-[10px] uppercase tracking-wider">
Choose Customer Email *
</label>
<input
type="email"
required
placeholder="client@example.com"
value={customerEmail}
onChange={(e) => setCustomerEmail(e.target.value)}
className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder:text-white/30 focus:outline-none focus:border-[#31dfff]/50 transition-colors"
/>
</div>

<div>
<label className="block text-white/40 mb-1.5 text-[10px] uppercase tracking-wider">
Customer Name (Optional)
</label>
<input
type="text"
placeholder="John Doe"
value={customerName}
onChange={(e) => setCustomerName(e.target.value)}
className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder:text-white/30 focus:outline-none focus:border-[#31dfff]/50 transition-colors"
/>
</div>

<div>
<label className="block text-white/40 mb-1.5 text-[10px] uppercase tracking-wider">
Quantity (Max 20)
</label>
<input
type="number"
min="1"
max="20"
value={issueQuantity}
onChange={(e) => setIssueQuantity(Number(e.target.value))}
className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#31dfff]/50 transition-colors"
/>
</div>

<div className="bg-white/[0.03] p-4 rounded-xl border border-white/10 space-y-2">
<div className="flex justify-between text-white/40">
<span>Available for Immediate Issue:</span>
<span className="text-emerald-400 font-bold">YES ({issuingModal.inventoryStatus})</span>
</div>
<div className="flex justify-between text-white/40">
<span>Business Credit Required:</span>
<span className="text-[#f5b94d] font-bold">
${(issuingModal.businessPrice * issueQuantity).toFixed(2)} USD
</span>
</div>
<div className="flex justify-between text-white/40 pt-2 border-t border-white/5">
<span>Remaining Credit After Issue:</span>
<span
className={`font-bold ${
partnerBalance - issuingModal.businessPrice * issueQuantity < 0
? "text-rose-400"
: "text-[#31dfff]"
}`}
>
{partnerBalance - issuingModal.businessPrice * issueQuantity < 0
? "Insufficient Credit"
: `$${(partnerBalance - issuingModal.businessPrice * issueQuantity).toFixed(2)} USD`}
</span>
</div>
</div>

<div className="flex justify-end gap-3 pt-4 border-t border-white/10">
<button
type="submit"
className="px-6 py-3 bg-[#31dfff] hover:opacity-90 text-black rounded-xl text-xs font-bold transition-opacity"
>
Proceed to Confirmation →
</button>
<button
type="button"
onClick={() => setIssuingModal(null)}
className="px-4 py-3 bg-white/[0.05] hover:bg-white/[0.1] text-white/70 rounded-xl text-xs transition-colors"
>
Cancel
</button>
</div>
</form>
) : (
<div className="space-y-5 text-xs">
<div className="bg-[#f5b94d]/10 border border-[#f5b94d]/30 p-4 rounded-2xl space-y-3">
<div className="text-[#f5b94d] font-bold text-sm">Please Review &amp; Confirm Issuance</div>
<div className="space-y-1 text-white/70">
<p>
Issue <span className="text-white font-bold">{issueQuantity}</span> x{" "}
<span className="text-[#31dfff] font-bold">{issuingModal.country} eSIMs</span>
</p>
<p>
Recipient: <span className="text-white font-bold">{customerEmail}</span>
</p>
<hr className="border-white/10 my-2" />
<div className="flex justify-between text-sm">
<span className="text-white/40">Total Deducted:</span>
<span className="text-[#f5b94d] font-bold">
${(issuingModal.businessPrice * issueQuantity).toFixed(2)} USD
</span>
</div>
<div className="flex justify-between">
<span className="text-white/40">Business Credit After Issue:</span>
<span className="text-[#31dfff] font-bold">
${(partnerBalance - issuingModal.businessPrice * issueQuantity).toFixed(2)} USD
</span>
</div>
</div>
</div>

{isGenerating ? (
<div className="py-6 text-center space-y-3 bg-white/[0.03] rounded-2xl border border-white/10">
<div className="w-8 h-8 border-2 border-[#31dfff] border-t-transparent rounded-full animate-spin mx-auto"></div>
<div className="text-[#31dfff] font-bold animate-pulse text-sm">{loadingStep}</div>
<p className="text-[10px] text-white/40">Processing via Next.js API, n8n, & eSIM Core...</p>
</div>
) : (
<div className="flex justify-end gap-3 pt-2">
<button
type="button"
onClick={executeRealIssue}
className="px-6 py-3 bg-emerald-500 hover:opacity-90 text-white rounded-xl text-xs font-bold transition-opacity flex items-center gap-2"
>
Issue Now (Confirm)
</button>
<button
type="button"
onClick={() => setShowConfirmStep(false)}
className="px-4 py-3 bg-white/[0.05] hover:bg-white/[0.1] text-white/70 rounded-xl text-xs transition-colors"
>
← Back
</button>
</div>
)}
</div>
)}
</div>
</div>
)}

{/* Success Modal */}
{successResult && (
<div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 font-mono">
<div className="bg-[#050710] border border-emerald-500/30 rounded-2xl w-full max-w-lg p-6 lg:p-8 shadow-2xl space-y-5 text-center max-h-[90vh] overflow-y-auto">
<div className="w-14 h-14 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto text-2xl">
✓
</div>

<div>
<span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">
Provisioning Successful
</span>
<h2 className="text-xl font-bold text-white mt-1">eSIM Successfully Issued</h2>
<p className="text-xs text-white/50 mt-1">
Order processed via Shopify backend, n8n, and Arovix core engine.
</p>
</div>

<div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
<div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-2 rounded-xl">
Business Credit Updated
</div>
<div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-2 rounded-xl">
Customer Email Sent
</div>
<div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-2 rounded-xl">
eSIM Issued Successfully
</div>
</div>

<div className="bg-white p-3 rounded-2xl w-36 h-36 mx-auto shadow-xl flex items-center justify-center">
<img src={successResult.qrCodeUrl} alt="eSIM QR Code" className="w-full h-full object-contain" />
</div>

<div className="bg-white/[0.03] p-4 rounded-xl border border-white/10 text-left space-y-2.5 text-xs">
<div className="flex justify-between">
<span className="text-white/40">Order Number:</span>
<span className="text-white font-bold">{successResult.orderNumber}</span>
</div>
<div className="flex justify-between">
<span className="text-white/40">Issued To:</span>
<span className="text-white font-bold">{successResult.email}</span>
</div>
<div className="flex justify-between">
<span className="text-white/40">Issued Quantity:</span>
<span className="text-[#31dfff] font-bold">{successResult.quantity} eSIM(s)</span>
</div>
<div className="flex justify-between">
<span className="text-white/40">Business Credit Used:</span>
<span className="text-emerald-400 font-bold">${successResult.totalDeducted.toFixed(2)} USD</span>
</div>
<div className="flex justify-between pt-1 border-t border-white/5">
<span className="text-white/40">ICCID:</span>
<span className="text-[#31dfff] font-bold">{successResult.iccid}</span>
</div>
<div>
<span className="text-white/40 block mb-1">Matching ID (LPA):</span>
<div className="bg-black/40 p-2 rounded border border-white/5 text-[11px] text-white/70 truncate select-all">
{successResult.matchingId}
</div>
</div>
</div>

<div className="flex flex-wrap items-center justify-center gap-3 pt-2">
<button
onClick={() => copyToClipboard(successResult.matchingId)}
className="px-4 py-2.5 bg-[#31dfff]/10 hover:bg-[#31dfff]/20 text-[#31dfff] border border-[#31dfff]/30 rounded-xl text-xs font-bold transition-colors"
>
Copy LPA
</button>
<button
onClick={() => alert("QR Code image downloaded successfully!")}
className="px-4 py-2.5 bg-white/[0.05] hover:bg-white/[0.1] text-white/70 rounded-xl text-xs border border-white/10 transition-colors"
>
Download QR
</button>
<button
onClick={() => alert(`Confirmation email successfully dispatched to ${successResult.email}!`)}
className="px-4 py-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-bold transition-colors"
>
Email Sent ✓
</button>
</div>

<div className="pt-4 border-t border-white/10">
<button
onClick={() => setSuccessResult(null)}
className="w-full py-3 bg-emerald-500 hover:opacity-90 text-white rounded-xl text-xs font-bold transition-opacity"
>
Done / Back to Catalogue
</button>
</div>
</div>
</div>
)}

<style jsx global>{`
@keyframes fadeUp {
from {
opacity: 0;
transform: translateY(12px);
}
to {
opacity: 1;
transform: translateY(0);
}
}
`}</style>
</div>
);
}

