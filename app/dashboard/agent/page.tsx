"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function AgentDashboard() {
const router = useRouter();
const supabase = createClient();

const [partners, setPartners] = useState<any[]>([]);
const [loading, setLoading] = useState(true);
const [currentAgentEmail, setCurrentAgentEmail] = useState<string>("");

// حقول نموذج إنشاء الشريك
const [shopName, setShopName] = useState("");
const [shopEmail, setShopEmail] = useState("");
const [tier, setTier] = useState("Standard");
const [commission, setCommission] = useState("10");
const [successMsg, setSuccessMsg] = useState("");
const [searchTerm, setSearchTerm] = useState("");

// حالات الـ Modals
const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
const [inviteEmailInput, setInviteEmailInput] = useState("");
const [inviting, setInviting] = useState(false);

useEffect(() => {
async function fetchAgentDataAndPartners() {
try {
setLoading(true);

const { data: { user }, error: authError } = await supabase.auth.getUser();

if (authError || !user || !user.email) {
router.replace("/login");
return;
}

setCurrentAgentEmail(user.email);

const { data, error } = await supabase
.from("partners")
.select("*, business_shops(*)")
.eq("agent_id", user.email);

if (error) {
console.error("Error fetching agent partners:", error.message);
} else if (data) {
setPartners(data);
}
} catch (err) {
console.error("Unexpected error:", err);
} finally {
setLoading(false);
}
}

fetchAgentDataAndPartners();
}, [router, supabase]);

const handleCreatePartner = async (e: React.FormEvent) => {
e.preventDefault();
try {
const customPartnerId = `AROVIX-AGENCY-${Date.now().toString().slice(-4)}`;
const shopIdValue = `SHOP-${Date.now().toString().slice(-4)}`;

const { error: rpcError } = await supabase.rpc("create_partner_with_shop", {
p_partner_id: customPartnerId,
p_company_name: shopName,
p_email: shopEmail,
p_partner_type: "agency",
p_tier: tier,
p_commission: Number(commission),
p_status: "Active",
p_shop_id: shopIdValue,
p_shop_name: `${shopName} Shop`,
p_business_credit: 0,
p_agent_id: currentAgentEmail,
});

if (rpcError) throw rpcError;

setSuccessMsg("Partner created successfully!");
setShopName("");
setShopEmail("");
setTier("Standard");
setCommission("10");

setTimeout(() => {
setIsCreateModalOpen(false);
window.location.reload();
}, 1500);
} catch (err: any) {
console.error("Error creating partner:", err);
alert("Error: " + err.message);
}
};

// دالة إرسال الدعوة برابط إعادة التعيين
const handleSendInvite = async (e: React.FormEvent) => {
e.preventDefault();
if (!inviteEmailInput) return;

try {
setInviting(true);
const { error } = await supabase.auth.resetPasswordForEmail(inviteEmailInput, {
redirectTo: `${window.location.origin}/auth/update-password`,
});

if (error) throw error;

alert(`Invitation link successfully sent to: ${inviteEmailInput}`);
setInviteEmailInput("");
setIsInviteModalOpen(false);
} catch (err: any) {
console.error("Error sending invite:", err);
alert("Failed to send invitation link: " + err.message);
} finally {
setInviting(false);
}
};

const filteredPartners = partners.filter((p) =>
p.company_name?.toLowerCase().includes(searchTerm.toLowerCase())
);

const totalPartnersCount = partners.length;
const totalCreditSum = partners.reduce((acc, p) => {
const shopRecord = Array.isArray(p.business_shops) ? p.business_shops[0] : p.business_shops;
return acc + (shopRecord?.business_credit ?? 0);
}, 0);

return (
<div className="min-h-screen bg-[#02030a] text-white p-6 md:p-8 font-mono relative">
<div className="max-w-7xl mx-auto">

{/* Header مع زرين في الأعلى بشكل مرتب */}
<div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-4">
<div>
<h1 className="text-2xl font-bold text-white">Agent Dashboard</h1>
<p className="text-sm text-slate-400 mt-1">
Logged in as: <span className="text-[#31dfff] font-bold">{currentAgentEmail || "Loading..."}</span>
</p>
</div>

<div className="flex items-center gap-3">
<button
onClick={() => setIsInviteModalOpen(true)}
className="bg-slate-800 hover:bg-slate-700 text-[#31dfff] border border-slate-700 font-bold px-4 py-2.5 rounded-xl text-sm transition flex items-center gap-2 cursor-pointer"
>
<span>✉️</span> Invite Partner
</button>
<button
onClick={() => setIsCreateModalOpen(true)}
className="bg-gradient-to-r from-[#31dfff] to-blue-600 text-slate-950 font-bold px-5 py-2.5 rounded-xl text-sm shadow-lg hover:opacity-90 transition flex items-center gap-2 cursor-pointer"
>
<span>➕</span> Create New Partner
</button>
</div>
</div>

{/* Stats Grid */}
<div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
<div className="bg-[#0b0e1a] p-4 rounded-xl border border-slate-800">
<div className="text-xs text-slate-400 uppercase font-medium mb-1">Total Partners</div>
<div className="text-2xl font-bold text-white">{totalPartnersCount}</div>
</div>
<div className="bg-[#0b0e1a] p-4 rounded-xl border border-slate-800">
<div className="text-xs text-slate-400 uppercase font-medium mb-1">Total Credit Balance</div>
<div className="text-2xl font-bold text-emerald-400">${totalCreditSum.toFixed(2)}</div>
</div>
<div className="bg-[#0b0e1a] p-4 rounded-xl border border-slate-800">
<div className="text-xs text-slate-400 uppercase font-medium mb-1">Total Sales</div>
<div className="text-2xl font-bold text-[#31dfff]">$0.00</div>
</div>
<div className="bg-[#0b0e1a] p-4 rounded-xl border border-slate-800">
<div className="text-xs text-slate-400 uppercase font-medium mb-1">Total Commission</div>
<div className="text-2xl font-bold text-amber-400">$0.00</div>
</div>
</div>

{/* Partners Table Section */}
<div className="bg-[#0b0e1a] p-6 rounded-xl border border-slate-800">
<div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
<h2 className="text-lg font-bold text-white">Your Assigned Partners & Performance</h2>
<input
type="text"
placeholder="Search partners..."
className="bg-[#02030a] border border-slate-700 px-3 py-1.5 rounded-lg text-sm text-white focus:outline-none focus:border-[#31dfff]"
value={searchTerm}
onChange={(e) => setSearchTerm(e.target.value)}
/>
</div>

{loading ? (
<div className="text-center py-12 text-slate-400">Loading partners...</div>
) : (
<div className="overflow-x-auto">
<table className="w-full text-left text-sm text-slate-300">
<thead className="bg-[#02030a] text-xs uppercase text-slate-400">
<tr>
<th className="py-3 px-3">Partner</th>
<th className="py-3 px-3">Credit</th>
<th className="py-3 px-3">Tier / Comm</th>
<th className="py-3 px-3">Status</th>
<th className="py-3 px-3">Actions</th>
</tr>
</thead>
<tbody>
{filteredPartners.length > 0 ? (
filteredPartners.map((p) => {
const shopRecord = Array.isArray(p.business_shops) ? p.business_shops[0] : p.business_shops;
const creditVal = shopRecord?.business_credit ?? 0;

return (
<tr key={p.id} className="border-b border-slate-800">
<td className="py-3 px-3">
<div className="font-bold text-white">{p.company_name}</div>
<div className="text-xs text-slate-500">{p.email}</div>
</td>
<td className="py-3 px-3 font-bold text-emerald-400">${Number(creditVal).toFixed(2)}</td>
<td className="py-3 px-3">
<span className="bg-slate-800 px-2 py-1 rounded text-xs">{p.tier || "Standard"}</span>
<span className="ml-2 text-amber-400 font-bold text-xs">{p.commission}%</span>
</td>
<td className="py-3 px-3">
<span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-xs">
{p.status || "Active"}
</span>
</td>
<td className="py-3 px-3">
<button
onClick={() => router.push(`/dashboard/agent/partners/${p.id}`)}
className="bg-slate-700 hover:bg-slate-600 px-3 py-1 rounded text-xs text-white transition cursor-pointer"
>
View Details
</button>
</td>
</tr>
);
})
) : (
<tr>
<td colSpan={5} className="text-center py-8 text-slate-500">
No partners assigned to you yet. Use "Create New Partner" or "Invite Partner" above.
</td>
</tr>
)}
</tbody>
</table>
</div>
)}
</div>

</div>

{/* Modal إرسال الدعوة المنفصل */}
{isInviteModalOpen && (
<div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
<div className="bg-[#0c0f1d] border border-white/10 rounded-2xl p-6 md:p-8 max-w-md w-full shadow-2xl">
<div className="flex justify-between items-center mb-4">
<h2 className="text-lg font-bold text-[#31dfff]">Send Partner Invitation</h2>
<button
onClick={() => setIsInviteModalOpen(false)}
className="text-slate-400 hover:text-white text-lg font-bold cursor-pointer"
>
✕
</button>
</div>

<p className="text-xs text-slate-400 mb-6">
Enter the partner's email address to send them a password setup and login link. You can resend this anytime if needed.
</p>

<form onSubmit={handleSendInvite} className="flex flex-col gap-4">
<div>
<label className="text-xs text-slate-400 block mb-1">Partner Email Address</label>
<input
type="email"
required
className="w-full bg-[#02030a] border border-slate-700 px-3 py-2.5 rounded-xl text-sm text-white focus:outline-none focus:border-[#31dfff]"
value={inviteEmailInput}
onChange={(e) => setInviteEmailInput(e.target.value)}
placeholder="partner@example.com"
/>
</div>

<div className="flex gap-3 mt-4">
<button
type="button"
onClick={() => setIsInviteModalOpen(false)}
className="w-1/2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-2.5 rounded-xl transition text-sm cursor-pointer"
>
Cancel
</button>
<button
type="submit"
disabled={inviting}
className="w-1/2 bg-gradient-to-r from-[#31dfff] to-blue-600 text-slate-950 font-bold py-2.5 rounded-xl hover:opacity-90 transition text-sm shadow-lg cursor-pointer disabled:opacity-50"
>
{inviting ? "Sending..." : "Send Invite"}
</button>
</div>
</form>
</div>
</div>
)}

{/* Modal إنشاء الشريك (المستويات الأربعة: Standard, Silver, Gold, Elite) */}
{isCreateModalOpen && (
<div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
<div className="bg-[#0c0f1d] border border-white/10 rounded-2xl p-6 md:p-8 max-w-md w-full shadow-2xl">
<div className="flex justify-between items-center mb-4">
<h2 className="text-lg font-bold text-[#31dfff]">Create New Partner</h2>
<button
onClick={() => setIsCreateModalOpen(false)}
className="text-slate-400 hover:text-white text-lg font-bold cursor-pointer"
>
✕
</button>
</div>

<p className="text-xs text-slate-400 mb-6">
Fill in the partner details, select tier, and commission percentage.
</p>

{successMsg && (
<div className="mb-4 p-3 bg-emerald-500/20 text-emerald-300 rounded text-xs">
{successMsg}
</div>
)}

<form onSubmit={handleCreatePartner} className="flex flex-col gap-4">
<div>
<label className="text-xs text-slate-400 block mb-1">Company / Partner Name</label>
<input
type="text"
required
className="w-full bg-[#02030a] border border-slate-700 px-3 py-2.5 rounded-xl text-sm text-white focus:outline-none focus:border-[#31dfff]"
value={shopName}
onChange={(e) => setShopName(e.target.value)}
placeholder="e.g. Arovix Store"
/>
</div>

<div>
<label className="text-xs text-slate-400 block mb-1">Partner Email Address</label>
<input
type="email"
required
className="w-full bg-[#02030a] border border-slate-700 px-3 py-2.5 rounded-xl text-sm text-white focus:outline-none focus:border-[#31dfff]"
value={shopEmail}
onChange={(e) => setShopEmail(e.target.value)}
placeholder="partner@example.com"
/>
</div>

<div className="grid grid-cols-2 gap-3">
<div>
<label className="text-xs text-slate-400 block mb-1">Tier</label>
<select
className="w-full bg-[#02030a] border border-slate-700 px-3 py-2.5 rounded-xl text-sm text-white focus:outline-none focus:border-[#31dfff]"
value={tier}
onChange={(e) => setTier(e.target.value)}
>
<option value="Standard">Standard</option>
<option value="Silver">Silver</option>
<option value="Gold">Gold</option>
<option value="Elite">Elite</option>
</select>
</div>

<div>
<label className="text-xs text-slate-400 block mb-1">Commission (%)</label>
<input
type="number"
required
min="0"
max="100"
className="w-full bg-[#02030a] border border-slate-700 px-3 py-2.5 rounded-xl text-sm text-white focus:outline-none focus:border-[#31dfff]"
value={commission}
onChange={(e) => setCommission(e.target.value)}
placeholder="10"
/>
</div>
</div>

<div className="flex gap-3 mt-4">
<button
type="button"
onClick={() => setIsCreateModalOpen(false)}
className="w-1/2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-2.5 rounded-xl transition text-sm cursor-pointer"
>
Cancel
</button>
<button
type="submit"
className="w-1/2 bg-gradient-to-r from-[#31dfff] to-blue-600 text-slate-950 font-bold py-2.5 rounded-xl hover:opacity-90 transition text-sm shadow-lg cursor-pointer"
>
Create Partner
</button>
</div>
</form>
</div>
</div>
)}
</div>
);
}

