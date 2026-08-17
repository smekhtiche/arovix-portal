"use client";

import React, { useState } from "react";
import { FINANCE_CONFIG } from "./FinanceConfig";

interface TopUpModalProps {
isOpen: boolean;
onClose: () => void;
shopId: string;
}

export default function TopUpModal({ isOpen, onClose, shopId }: TopUpModalProps) {
const [amount, setAmount] = useState<number>(FINANCE_CONFIG.limits.minTopUp);
const [selectedMethod, setSelectedMethod] = useState<string>(
FINANCE_CONFIG.paymentMethods[0].id
);
const [reference, setReference] = useState<string>("");
const [loading, setLoading] = useState<boolean>(false);
const [successMsg, setSuccessMsg] = useState<string>("");
const [errorMsg, setErrorMsg] = useState<string>("");

if (!isOpen) return null;

const handleTopUpSubmit = async (e: React.FormEvent) => {
e.preventDefault();
setLoading(true);
setSuccessMsg("");
setErrorMsg("");

try {
// الاتصال بالـ API الجديد الذي أنشأناه في الخطوة السابقة
const response = await fetch("/api/topup", {
method: "POST",
headers: {
"Content-Type": "application/json",
},
body: JSON.stringify({
partnerId: shopId || "ARV-PARTNER-001",
amount: Number(amount),
currency: FINANCE_CONFIG.defaultCurrency,
payment_method: selectedMethod,
transaction_reference: reference,
email: "partnerships@arovix.io",
}),
});

const data = await response.json();

if (!response.ok || !data.success) {
throw new Error(data.error || "Failed to initiate top-up request.");
}

setSuccessMsg("Redirecting to checkout...");
// توجيه الشريك مباشرة لرابط الدفع أو الجلسة المنشأة
setTimeout(() => {
setLoading(false);
if (data.checkoutUrl) {
window.location.href = data.checkoutUrl;
} else {
onClose();
}
}, 1000);

} catch (err: any) {
console.error(err);
setErrorMsg(err.message || "حدث خطأ أثناء الاتصال بالخادم.");
setLoading(false);
}
};

const currentMethodObj = FINANCE_CONFIG.paymentMethods.find(
(m) => m.id === selectedMethod
);

return (
<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
<div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl text-white">
<div className="flex justify-between items-center mb-4 border-b border-slate-800 pb-3">
<h3 className="text-xl font-bold">Business Credit Top-Up</h3>
<button
onClick={onClose}
className="text-slate-400 hover:text-white text-lg font-bold px-2"
>
✕
</button>
</div>

{successMsg ? (
<div className="bg-emerald-900/50 border border-emerald-500 text-emerald-200 p-4 rounded-xl text-center font-medium my-4">
{successMsg}
</div>
) : (
<form onSubmit={handleTopUpSubmit} className="space-y-4">
{errorMsg && (
<div className="bg-rose-900/50 border border-rose-500 text-rose-200 p-3 rounded-xl text-sm">
{errorMsg}
</div>
)}

<div>
<label className="block text-sm text-slate-300 mb-1">Top-Up Amount ({FINANCE_CONFIG.defaultCurrency})</label>
<input
type="number"
min={FINANCE_CONFIG.limits.minTopUp}
max={FINANCE_CONFIG.limits.maxTopUp}
value={amount}
onChange={(e) => setAmount(Number(e.target.value))}
className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500"
required
/>
<span className="text-xs text-slate-500 mt-1 block">
Minimum: ${FINANCE_CONFIG.limits.minTopUp} | Maximum: ${FINANCE_CONFIG.limits.maxTopUp}
</span>
</div>

<div>
<label className="block text-sm text-slate-300 mb-1">Payment Method</label>
<select
value={selectedMethod}
onChange={(e) => setSelectedMethod(e.target.value)}
className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500"
>
{FINANCE_CONFIG.paymentMethods.map((method) => (
<option key={method.id} value={method.id}>
{method.name}
</option>
))}
</select>
</div>

{selectedMethod === "bank_wire" && (
<div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700 text-xs space-y-1 text-slate-300">
<p className="font-bold text-blue-400">Bank Wire Details:</p>
<p>Bank: {FINANCE_CONFIG.officialBankDetails.bankName}</p>
<p>IBAN: {FINANCE_CONFIG.officialBankDetails.iban}</p>
</div>
)}

{currentMethodObj?.requiresReference && (
<div>
<label className="block text-sm text-slate-300 mb-1">Transaction Reference / Receipt Number</label>
<input
type="text"
value={reference}
onChange={(e) => setReference(e.target.value)}
placeholder="Enter transaction reference or ID"
className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500"
required
/>
</div>
)}

<div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
<button
type="button"
onClick={onClose}
className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 transition"
>
Cancel
</button>
<button
type="submit"
disabled={loading}
className="px-6 py-2 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-500 transition disabled:opacity-50"
>
{loading ? "Processing..." : "Confirm Top-Up"}
</button>
</div>
</form>
)}
</div>
</div>
);
}

