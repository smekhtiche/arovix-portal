"use client";

import React, { useMemo, useState } from "react";
import { Partner } from "../../data/partners";
import { useRouter } from "next/navigation";

interface Props {
partners: Partner[];
searchTerm: string;
setSearchTerm: (term: string) => void;
onTopUp?: (id: string, amount: number) => void;
}

export default function PartnerTable({
partners,
searchTerm,
setSearchTerm,
onTopUp,
}: Props) {
const router = useRouter();

const [isModalOpen, setIsModalOpen] =
useState(false);

const [selectedPartner, setSelectedPartner] =
useState<Partner | null>(null);

const [amount, setAmount] =
useState("");

const [loading, setLoading] =
useState(false);

// ============================================================
// FILTER
// ============================================================

const filtered = useMemo(() => {
const search =
searchTerm.trim().toLowerCase();

if (!search) {
return partners;
}

return partners.filter((p) =>
p.companyName
.toLowerCase()
.includes(search) ||
p.email
.toLowerCase()
.includes(search)
);
}, [partners, searchTerm]);

// ============================================================
// PAGINATION
// ============================================================

const ITEMS_PER_PAGE = 5;

const [currentPage, setCurrentPage] =
useState(1);

const totalPages = Math.max(
1,
Math.ceil(
filtered.length /
ITEMS_PER_PAGE
)
);

React.useEffect(() => {
setCurrentPage(1);
}, [searchTerm]);

const paginatedPartners =
useMemo(() => {
const start =
(currentPage - 1) *
ITEMS_PER_PAGE;

return filtered.slice(
start,
start + ITEMS_PER_PAGE
);
}, [
filtered,
currentPage,
]);

// ============================================================
// TOP-UP
// ============================================================

const handleOpenTopUp = (
partner: Partner
) => {
setSelectedPartner(partner);
setAmount("");
setIsModalOpen(true);
};

const handleConfirmTopUp =
async () => {
if (
!selectedPartner ||
!amount
) {
return;
}

const numericAmount =
Number(amount);

if (
!Number.isFinite(
numericAmount
) ||
numericAmount <= 0
) {
alert(
"Please enter a valid amount."
);
return;
}

setLoading(true);

try {
const response =
await fetch(
"/api/admin/topup",
{
method: "POST",
headers: {
"Content-Type":
"application/json",
},
body: JSON.stringify({
partnerId:
selectedPartner.id,
amount:
numericAmount,
}),
}
);

const result =
await response.json();

if (
!response.ok ||
!result?.success
) {
throw new Error(
result?.error ||
`Top-up failed with HTTP ${response.status}`
);
}

// The API/RPC has successfully
// updated Supabase.
//
// The parent dashboard now only
// updates its local UI balance.
onTopUp?.(
selectedPartner.id,
numericAmount
);

setIsModalOpen(false);
setAmount("");

alert(
"Top-up successful and balance updated."
);
} catch (error: any) {
console.error(
"ADMIN TOP-UP ERROR:",
error
);

alert(
error?.message ||
"Server connection error."
);
} finally {
setLoading(false);
}
};

// ============================================================
// UI
// ============================================================

return (
<div className="bg-[#0b0e1a] p-6 rounded-xl border border-slate-800">

{/* HEADER */}

<div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">

<div>
<h2 className="text-xl font-bold text-white">
Partners List
</h2>

<p className="text-xs text-slate-500 mt-1">
{filtered.length} partner
{filtered.length === 1
? ""
: "s"} found
</p>
</div>

<input
type="text"
placeholder="Search partners..."
className="bg-[#02030a] border border-slate-700 px-4 py-2 rounded-lg text-sm text-white focus:outline-none focus:border-sky-500 w-full md:w-64"
value={searchTerm}
onChange={(e) =>
setSearchTerm(
e.target.value
)
}
/>
</div>

{/* TABLE */}

<div className="overflow-x-auto">
<table className="w-full text-left text-sm text-slate-300">

<thead className="text-xs uppercase bg-[#02030a] text-slate-400">
<tr>
<th className="py-3 px-4">
Partner
</th>

<th className="py-3 px-4">
Agent
</th>

<th className="py-3 px-4">
Credit
</th>

<th className="py-3 px-4">
Tier / Comm
</th>

<th className="py-3 px-4">
Status
</th>

<th className="py-3 px-4">
Actions
</th>
</tr>
</thead>

<tbody>
{paginatedPartners.length >
0 ? (
paginatedPartners.map(
(p) => (
<tr
key={p.id}
className="border-b border-slate-800 hover:bg-slate-900/40 transition"
>

{/* PARTNER */}

<td className="py-3 px-4">
<div className="font-bold text-white">
{
p.companyName
}
</div>

<div className="text-xs text-slate-500">
{p.shopId}
</div>
</td>

{/* AGENT */}

<td className="py-3 px-4 text-[#31dfff]">
{p.agentId}
</td>

{/* CREDIT */}

<td className="py-3 px-4 font-bold text-emerald-400">
$
{typeof p.creditBalance ===
"number"
? p.creditBalance.toFixed(
2
)
: "0.00"}
</td>

{/* TIER / COMMISSION */}

<td className="py-3 px-4">
<span className="bg-slate-800 px-2 py-1 rounded">
{p.tier}
</span>

<span className="ml-2 text-amber-400 font-bold">
{p.commission}%
</span>
</td>

{/* STATUS */}

<td className="py-3 px-4">
<span className="px-2 py-1 rounded bg-emerald-500/20 text-emerald-300 text-xs">
{p.status}
</span>
</td>

{/* ACTIONS */}

<td className="py-3 px-4">
<div className="flex gap-2">

<button
type="button"
onClick={() =>
router.push(
`/dashboard/admin/partners/${p.id}`
)
}
className="bg-slate-700 hover:bg-slate-600 px-3 py-1 rounded text-xs text-white transition"
>
View
</button>

<button
type="button"
onClick={() =>
handleOpenTopUp(
p
)
}
className="bg-[#31dfff]/20 hover:bg-[#31dfff]/30 text-[#31dfff] px-3 py-1 rounded text-xs transition font-medium"
>
Top Up
</button>

</div>
</td>

</tr>
)
)
) : (
<tr>
<td
colSpan={6}
className="text-center py-6 text-slate-500"
>
No partners found.
</td>
</tr>
)}
</tbody>

</table>
</div>

{/* PAGINATION */}

{filtered.length >
ITEMS_PER_PAGE && (
<div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-5 pt-4 border-t border-slate-800">

<div className="text-xs text-slate-500">
Page{" "}
<span className="text-white font-bold">
{currentPage}
</span>{" "}
of{" "}
<span className="text-white font-bold">
{totalPages}
</span>
</div>

<div className="flex items-center gap-2">

<button
type="button"
onClick={() =>
setCurrentPage(
(page) =>
Math.max(
1,
page - 1
)
)
}
disabled={
currentPage === 1
}
className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed text-xs font-bold"
>
Previous
</button>

<button
type="button"
onClick={() =>
setCurrentPage(
(page) =>
Math.min(
totalPages,
page + 1
)
)
}
disabled={
currentPage ===
totalPages
}
className="px-4 py-2 rounded-lg bg-[#31dfff]/20 text-[#31dfff] hover:bg-[#31dfff]/30 disabled:opacity-30 disabled:cursor-not-allowed text-xs font-bold"
>
Next
</button>

</div>
</div>
)}

{/* TOP-UP MODAL */}

{isModalOpen && (
<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">

<div className="w-full max-w-md rounded-2xl bg-[#0b0e1a] border border-slate-800 p-6 shadow-2xl animate-in fade-in zoom-in duration-200">

<h3 className="text-xl font-bold text-white mb-2">
Top-Up Partner Credit
</h3>

<p className="text-sm text-slate-400 mb-4">
Enter the amount to add
to:{" "}
<span className="text-[#31dfff] font-semibold">
{
selectedPartner?.companyName
}
</span>
</p>

<div className="mb-6">

<label className="block text-xs text-slate-400 mb-2">
Amount ($)
</label>

<input
type="number"
value={amount}
onChange={(e) =>
setAmount(
e.target.value
)
}
placeholder="Enter amount (e.g., 100)"
min="1"
className="w-full rounded-xl bg-[#02030a] border border-slate-700 px-4 py-3 text-white focus:outline-none focus:border-[#31dfff] transition"
autoFocus
disabled={loading}
/>

</div>

<div className="flex justify-end gap-3">

<button
type="button"
onClick={() =>
setIsModalOpen(
false
)
}
disabled={loading}
className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 transition text-sm font-medium disabled:opacity-50"
>
Cancel
</button>

<button
type="button"
onClick={
handleConfirmTopUp
}
disabled={loading}
className="px-5 py-2 rounded-xl bg-[#31dfff] text-[#02030a] font-bold hover:bg-[#2bc4e0] transition text-sm disabled:opacity-50"
>
{loading
? "Processing..."
: "Confirm Top-Up"}
</button>

</div>

</div>
</div>
)}

</div>
);
}
