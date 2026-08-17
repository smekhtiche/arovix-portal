"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { inviteUserAction } from "@/app/actions/auth-actions";

type AgentEarning = {
agent_id?: string;
shop_id?: string;
amount?: number | string;
created_at?: string;
order_reference?: string;
sales_amount?: number | string;
commission_rate?: number | string;
transaction_id?: string;
updated_at?: string;
};

export default function AgentDashboard() {
const router = useRouter();
const supabase = createClient();

const [partners, setPartners] = useState<any[]>([]);
const [loading, setLoading] = useState(true);

const [currentAgentEmail, setCurrentAgentEmail] = useState("");
const [currentAgentId, setCurrentAgentId] = useState<string | null>(null);
const [currentAgentName, setCurrentAgentName] = useState("");

// Agent Earnings
const [agentEarnings, setAgentEarnings] = useState<AgentEarning[]>([]);
const [earningsLoading, setEarningsLoading] = useState(false);

// Partner creation
const [shopName, setShopName] = useState("");
const [shopEmail, setShopEmail] = useState("");
const [tier, setTier] = useState("Standard");
const [commission, setCommission] = useState("10");
const [successMsg, setSuccessMsg] = useState("");
const [searchTerm, setSearchTerm] = useState("");
const [creatingPartner, setCreatingPartner] = useState(false);

// Modals
const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

// Manual invitation
const [inviteEmailInput, setInviteEmailInput] = useState("");
const [inviting, setInviting] = useState(false);

// ============================================================
// AGENT EARNINGS WEBHOOK
// ============================================================

const loadAgentEarnings = async (agentId: string) => {
if (!agentId) {
return;
}

try {
setEarningsLoading(true);

const webhookUrl =
"https://arovix-esim.app.n8n.cloud/webhook/agent-earnings";

const response = await fetch(
`${webhookUrl}?agentId=${encodeURIComponent(agentId)}`,
{
method: "GET",
cache: "no-store",
}
);

if (!response.ok) {
throw new Error(
`Agent earnings request failed: ${response.status}`
);
}

const result = await response.json();

console.log("AROVIX Agent Earnings:", result);

const earnings =
Array.isArray(result?.earnings)
? result.earnings
: [];

setAgentEarnings(
earnings as AgentEarning[]
);
} catch (error) {
console.error(
"Agent earnings loading error:",
error
);

setAgentEarnings([]);
} finally {
setEarningsLoading(false);
}
};

// ============================================================
// LOAD AGENT + PARTNERS
// ============================================================

useEffect(() => {
let mounted = true;

async function fetchAgentDataAndPartners() {
try {
setLoading(true);

const {
data: { user },
error: authError,
} = await supabase.auth.getUser();

if (
authError ||
!user ||
!user.email
) {
router.replace("/login");
return;
}

if (!mounted) {
return;
}

setCurrentAgentEmail(user.email);

// IMPORTANT:
// agents.id is the real database Agent ID.
// partners.agent_id stores this ID.
const {
data: agentData,
error: agentError,
} = await supabase
.from("agents")
.select("id, email, name, commission")
.eq("email", user.email)
.maybeSingle();

if (agentError) {
throw agentError;
}

if (!agentData) {
throw new Error(
"Your Agent account is not linked to an Agent record."
);
}

const realAgentId =
String(agentData.id);

if (!mounted) {
return;
}

setCurrentAgentId(
realAgentId
);

setCurrentAgentName(
agentData.name ||
"Agent"
);

// --------------------------------------------------------
// LOAD ONLY PARTNERS ASSIGNED TO THIS AGENT
// --------------------------------------------------------

const {
data,
error,
} = await supabase
.from("partners")
.select(
"*, business_shops(*)"
)
.eq(
"agent_id",
realAgentId
)
.order(
"created_at",
{
ascending: false,
}
);

if (error) {
console.error(
"Error fetching agent partners:",
error.message
);
} else if (mounted) {
setPartners(
data || []
);
}

// --------------------------------------------------------
// LOAD AGENT EARNINGS
// --------------------------------------------------------

await loadAgentEarnings(
realAgentId
);
} catch (err: any) {
console.error(
"Unexpected Agent Dashboard error:",
err
);

if (mounted) {
alert(
err?.message ||
"Failed to load Agent Dashboard."
);
}
} finally {
if (mounted) {
setLoading(false);
}
}
}

fetchAgentDataAndPartners();

return () => {
mounted = false;
};
}, [router, supabase]);

// ============================================================
// CREATE PARTNER
// ============================================================

const handleCreatePartner = async (
e: React.FormEvent
) => {
e.preventDefault();

if (creatingPartner) {
return;
}

setCreatingPartner(true);
setSuccessMsg("");

try {
if (!currentAgentId) {
throw new Error(
"Agent account is not properly configured."
);
}

if (!shopName.trim()) {
throw new Error(
"Partner name is required."
);
}

if (!shopEmail.trim()) {
throw new Error(
"Partner email is required."
);
}

const requestedCommission =
Number(commission);

if (
!Number.isFinite(
requestedCommission
) ||
requestedCommission < 0
) {
throw new Error(
"Commission must be a valid percentage."
);
}

// Keep the existing Agent Partner
// creation rule exactly as it was.
const partnerCommission =
Math.min(
requestedCommission,
10
);

const timestamp =
Date.now()
.toString()
.slice(-4);

const customPartnerId =
`AROVIX-AGENCY-${timestamp}`;

const shopIdValue =
`SHOP-${timestamp}`;

// ----------------------------------------------------------
// 1. CREATE PARTNER + BUSINESS SHOP
// ----------------------------------------------------------

const {
error: rpcError,
} = await supabase.rpc(
"create_partner_with_shop",
{
p_partner_id:
customPartnerId,

p_company_name:
shopName.trim(),

p_email:
shopEmail
.trim()
.toLowerCase(),

p_partner_type:
"agency",

p_tier:
tier,

p_commission:
partnerCommission,

p_status:
"Active",

p_shop_id:
shopIdValue,

p_shop_name:
`${shopName.trim()} Shop`,

p_business_credit:
0,

// IMPORTANT:
// Use the real Agent database ID.
p_agent_id:
currentAgentId,
}
);

if (rpcError) {
throw rpcError;
}

// ----------------------------------------------------------
// 2. SEND PARTNER INVITATION
// ----------------------------------------------------------

const inviteResult =
await inviteUserAction(
shopEmail
.trim()
.toLowerCase(),
"agency",
{
role: "agency",
company_name:
shopName.trim(),
partner_email:
shopEmail
.trim()
.toLowerCase(),
}
);

if (!inviteResult.success) {
throw new Error(
inviteResult.error ||
"Partner was created, but the invitation could not be sent."
);
}

// ----------------------------------------------------------
// 3. SUCCESS
// ----------------------------------------------------------

setSuccessMsg(
`Partner "${shopName.trim()}" created successfully and invitation sent.`
);

setShopName("");
setShopEmail("");
setTier("Standard");
setCommission("10");

setTimeout(() => {
setIsCreateModalOpen(false);
setSuccessMsg("");
window.location.reload();
}, 1500);
} catch (err: any) {
console.error(
"Error creating Partner:",
err
);

alert(
"Error: " +
(err?.message ||
"Failed to create Partner.")
);
} finally {
setCreatingPartner(false);
}
};

// ============================================================
// MANUAL PARTNER INVITATION
// ============================================================

const handleSendInvite = async (
e: React.FormEvent
) => {
e.preventDefault();

const cleanEmail =
inviteEmailInput
.trim()
.toLowerCase();

if (!cleanEmail || inviting) {
return;
}

try {
setInviting(true);

const inviteResult =
await inviteUserAction(
cleanEmail,
"agency",
{
role: "agency",
partner_email:
cleanEmail,
}
);

if (!inviteResult.success) {
throw new Error(
inviteResult.error ||
"Failed to send invitation."
);
}

alert(
`Invitation sent successfully to: ${cleanEmail}`
);

setInviteEmailInput("");
setIsInviteModalOpen(false);
} catch (err: any) {
console.error(
"Error sending Partner invitation:",
err
);

alert(
"Failed to send invitation: " +
(err?.message ||
"Unknown error.")
);
} finally {
setInviting(false);
}
};

// ============================================================
// FILTER
// ============================================================

const filteredPartners =
partners.filter((p) =>
p.company_name
?.toLowerCase()
.includes(
searchTerm.toLowerCase()
)
);

// ============================================================
// PARTNER STATS
// ============================================================

const totalPartnersCount =
partners.length;

const totalCreditSum =
partners.reduce(
(acc, p) => {
const shopRecord =
Array.isArray(
p.business_shops
)
? p.business_shops[0]
: p.business_shops;

return (
acc +
Number(
shopRecord?.business_credit ||
0
)
);
},
0
);

// ============================================================
// REAL AGENT EARNINGS
// ============================================================

const totalAgentSales =
agentEarnings.reduce(
(total, earning) =>
total +
Number(
earning.sales_amount || 0
),
0
);

const totalAgentCommission =
agentEarnings.reduce(
(total, earning) =>
total +
Number(
earning.amount || 0
),
0
);

const latestCommissionRate =
agentEarnings.length > 0
? Number(
agentEarnings[
agentEarnings.length - 1
]?.commission_rate || 0
)
: 0;

// ============================================================
// UI
// ============================================================

return (
<div className="min-h-screen bg-[#02030a] text-white p-6 md:p-8 font-mono relative">
<div className="max-w-7xl mx-auto">

{/* HEADER */}

<div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-4">

<div>
<h1 className="text-2xl font-bold text-white">
Agent Dashboard
</h1>

<p className="text-sm text-slate-400 mt-1">
Logged in as:{" "}
<span className="text-[#31dfff] font-bold">
{currentAgentEmail ||
"Loading..."}
</span>
</p>

{currentAgentName && (
<p className="text-xs text-slate-500 mt-1">
Agent:{" "}
<span className="text-slate-300">
{currentAgentName}
</span>
</p>
)}
</div>

<div className="flex items-center gap-3">

<button
type="button"
onClick={() =>
setIsInviteModalOpen(true)
}
disabled={inviting}
className="bg-slate-800 hover:bg-slate-700 text-[#31dfff] border border-slate-700 font-bold px-4 py-2.5 rounded-xl text-sm transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
>
<span>✉️</span>
Invite Partner
</button>

<button
type="button"
onClick={() => {
setSuccessMsg("");
setIsCreateModalOpen(true);
}}
disabled={creatingPartner}
className="bg-gradient-to-r from-[#31dfff] to-blue-600 text-slate-950 font-bold px-5 py-2.5 rounded-xl text-sm shadow-lg hover:opacity-90 transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
>
<span>➕</span>
Create New Partner
</button>

</div>
</div>

{/* STATS */}

<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">

{/* TOTAL PARTNERS */}

<div className="bg-gradient-to-br from-[#0b0e1a] to-[#10152a] p-5 rounded-2xl border border-slate-800 shadow-xl min-h-[142px] flex flex-col justify-between">

<div className="flex items-start justify-between gap-3">

<div>
<div className="text-xs text-slate-400 uppercase font-medium mb-2">
Total Partners
</div>

<div className="text-3xl font-black text-white">
{totalPartnersCount}
</div>
</div>

<div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
🤝
</div>

</div>

<div className="text-[10px] text-slate-500">
Partners assigned to you
</div>

</div>

{/* TOTAL CREDIT */}

<div className="bg-gradient-to-br from-[#0b0e1a] to-[#10152a] p-5 rounded-2xl border border-emerald-500/20 shadow-xl min-h-[142px] flex flex-col justify-between">

<div className="flex items-start justify-between gap-3">

<div>
<div className="text-xs text-slate-400 uppercase font-medium mb-2">
Total Credit Balance
</div>

<div className="text-3xl font-black text-emerald-400">
${totalCreditSum.toFixed(2)}
</div>
</div>

<div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
💳
</div>

</div>

<div className="text-[10px] text-slate-500">
Current partner credit
</div>

</div>

{/* TOTAL SALES */}

<div className="bg-gradient-to-br from-[#0b0e1a] to-[#10152a] p-5 rounded-2xl border border-cyan-500/20 shadow-xl min-h-[142px] flex flex-col justify-between">

<div className="flex items-start justify-between gap-3">

<div>
<div className="text-xs text-slate-400 uppercase font-medium mb-2">
Total Sales
</div>

<div className="text-3xl font-black text-[#31dfff]">
$
{totalAgentSales.toFixed(
2
)}
</div>
</div>

<div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
📊
</div>

</div>

<div className="text-[10px] text-slate-500">
Partner sales generating your earnings
</div>

</div>

{/* AGENT COMMISSION */}

<div className="bg-gradient-to-br from-[#0b0e1a] to-[#10152a] p-5 rounded-2xl border border-amber-500/30 shadow-xl min-h-[142px] flex flex-col justify-between">

<div className="flex items-start justify-between gap-3">

<div>
<div className="text-xs text-slate-400 uppercase font-medium mb-2">
Agent Commission
</div>

<div className="text-3xl font-black text-amber-400">
$
{totalAgentCommission.toFixed(
2
)}
</div>
</div>

<div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
💰
</div>

</div>

<div className="text-[10px] text-slate-500">
{earningsLoading
? "Loading earnings..."
: `Your earned commission${
latestCommissionRate > 0
? ` • ${latestCommissionRate}%`
: ""
}`}
</div>

</div>

</div>

{/* EARNINGS SUMMARY */}

<div className="bg-gradient-to-br from-[#0b0e1a] to-[#070812] border border-amber-500/20 rounded-2xl p-5 mb-8 shadow-xl">

<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

<div>

<div className="flex items-center gap-2">

<div className="w-2.5 h-2.5 rounded-full bg-amber-400" />

<h2 className="text-sm font-bold text-white uppercase tracking-wider">
Agent Earnings
</h2>

</div>

<p className="text-xs text-slate-400 mt-2">
Your earnings are recorded automatically when an assigned Partner completes an eSIM sale.
</p>

</div>

<div className="text-right">

<div className="text-[10px] text-slate-500 uppercase">
Recorded Transactions
</div>

<div className="text-lg font-bold text-amber-400">
{agentEarnings.length}
</div>

</div>

</div>

</div>

{/* PARTNERS TABLE */}

<div className="bg-[#0b0e1a] p-6 rounded-xl border border-slate-800">

<div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">

<h2 className="text-lg font-bold text-white">
Your Assigned Partners & Performance
</h2>

<input
type="text"
placeholder="Search partners..."
className="bg-[#02030a] border border-slate-700 px-3 py-1.5 rounded-lg text-sm text-white focus:outline-none focus:border-[#31dfff]"
value={searchTerm}
onChange={(e) =>
setSearchTerm(
e.target.value
)
}
/>

</div>

{loading ? (
<div className="text-center py-12 text-slate-400">
Loading partners...
</div>
) : (
<div className="overflow-x-auto">

<table className="w-full text-left text-sm text-slate-300">

<thead className="bg-[#02030a] text-xs uppercase text-slate-400">

<tr>

<th className="py-3 px-3">
Partner
</th>

<th className="py-3 px-3">
Credit
</th>

<th className="py-3 px-3">
Tier / Comm
</th>

<th className="py-3 px-3">
Status
</th>

<th className="py-3 px-3">
Actions
</th>

</tr>

</thead>

<tbody>

{filteredPartners.length > 0 ? (
filteredPartners.map(
(p) => {

const shopRecord =
Array.isArray(
p.business_shops
)
? p.business_shops[0]
: p.business_shops;

const creditVal =
shopRecord?.business_credit ??
0;

return (
<tr
key={p.id}
className="border-b border-slate-800"
>

<td className="py-3 px-3">

<div className="font-bold text-white">
{p.company_name}
</div>

<div className="text-xs text-slate-500">
{p.email}
</div>

</td>

<td className="py-3 px-3 font-bold text-emerald-400">
$
{Number(
creditVal
).toFixed(2)}
</td>

<td className="py-3 px-3">

<span className="bg-slate-800 px-2 py-1 rounded text-xs">
{p.tier ||
"Standard"}
</span>

<span className="ml-2 text-amber-400 font-bold text-xs">
{p.commission}%
</span>

</td>

<td className="py-3 px-3">

<span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-xs">
{p.status ||
"Active"}
</span>

</td>

<td className="py-3 px-3">

<button
type="button"
onClick={() =>
router.push(
`/dashboard/agent/partners/${p.id}`
)
}
className="bg-slate-700 hover:bg-slate-600 px-3 py-1 rounded text-xs text-white transition cursor-pointer"
>
View Details
</button>

</td>

</tr>
);
}
)
) : (
<tr>

<td
colSpan={5}
className="text-center py-8 text-slate-500"
>
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

{/* ======================================================
INVITE PARTNER MODAL
====================================================== */}

{isInviteModalOpen && (
<div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">

<div className="bg-[#0c0f1d] border border-white/10 rounded-2xl p-6 md:p-8 max-w-md w-full shadow-2xl">

<div className="flex justify-between items-center mb-4">

<h2 className="text-lg font-bold text-[#31dfff]">
Send Partner Invitation
</h2>

<button
type="button"
onClick={() =>
setIsInviteModalOpen(
false
)
}
disabled={inviting}
className="text-slate-400 hover:text-white text-lg font-bold cursor-pointer disabled:opacity-50"
>
✕
</button>

</div>

<p className="text-xs text-slate-400 mb-6">
Enter the partner's email address to send an AROVIX invitation and password setup link.
</p>

<form
onSubmit={
handleSendInvite
}
className="flex flex-col gap-4"
>

<div>

<label className="text-xs text-slate-400 block mb-1">
Partner Email Address
</label>

<input
type="email"
required
disabled={inviting}
className="w-full bg-[#02030a] border border-slate-700 px-3 py-2.5 rounded-xl text-sm text-white focus:outline-none focus:border-[#31dfff] disabled:opacity-50"
value={
inviteEmailInput
}
onChange={(e) =>
setInviteEmailInput(
e.target.value
)
}
placeholder="partner@example.com"
/>

</div>

<div className="flex gap-3 mt-4">

<button
type="button"
onClick={() => {
setIsInviteModalOpen(
false
);
setInviteEmailInput(
""
);
}}
disabled={inviting}
className="w-1/2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-2.5 rounded-xl transition text-sm cursor-pointer disabled:opacity-50"
>
Cancel
</button>

<button
type="submit"
disabled={
inviting ||
!inviteEmailInput.trim()
}
className="w-1/2 bg-gradient-to-r from-[#31dfff] to-blue-600 text-slate-950 font-bold py-2.5 rounded-xl hover:opacity-90 transition text-sm shadow-lg cursor-pointer disabled:opacity-50"
>
{inviting
? "Sending..."
: "Send Invite"}
</button>

</div>

</form>

</div>

</div>
)}

{/* ======================================================
CREATE PARTNER MODAL
====================================================== */}

{isCreateModalOpen && (
<div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">

<div className="bg-[#0c0f1d] border border-white/10 rounded-2xl p-6 md:p-8 max-w-md w-full shadow-2xl">

<div className="flex justify-between items-center mb-4">

<h2 className="text-lg font-bold text-[#31dfff]">
Create New Partner
</h2>

<button
type="button"
onClick={() =>
setIsCreateModalOpen(
false
)
}
disabled={creatingPartner}
className="text-slate-400 hover:text-white text-lg font-bold cursor-pointer disabled:opacity-50"
>
✕
</button>

</div>

<p className="text-xs text-slate-400 mb-6">
Fill in the partner details. Agents can assign a maximum 10% commission to Partners.
</p>

{successMsg && (
<div className="mb-4 p-3 bg-emerald-500/20 text-emerald-300 rounded text-xs">
{successMsg}
</div>
)}

<form
onSubmit={
handleCreatePartner
}
className="flex flex-col gap-4"
>

<div>

<label className="text-xs text-slate-400 block mb-1">
Company / Partner Name
</label>

<input
type="text"
required
disabled={creatingPartner}
className="w-full bg-[#02030a] border border-slate-700 px-3 py-2.5 rounded-xl text-sm text-white focus:outline-none focus:border-[#31dfff] disabled:opacity-50"
value={shopName}
onChange={(e) =>
setShopName(
e.target.value
)
}
placeholder="e.g. Arovix Store"
/>

</div>

<div>

<label className="text-xs text-slate-400 block mb-1">
Partner Email Address
</label>

<input
type="email"
required
disabled={creatingPartner}
className="w-full bg-[#02030a] border border-slate-700 px-3 py-2.5 rounded-xl text-sm text-white focus:outline-none focus:border-[#31dfff] disabled:opacity-50"
value={shopEmail}
onChange={(e) =>
setShopEmail(
e.target.value
)
}
placeholder="partner@example.com"
/>

</div>

<div className="grid grid-cols-2 gap-3">

<div>

<label className="text-xs text-slate-400 block mb-1">
Tier
</label>

<select
disabled={creatingPartner}
className="w-full bg-[#02030a] border border-slate-700 px-3 py-2.5 rounded-xl text-sm text-white focus:outline-none focus:border-[#31dfff] disabled:opacity-50"
value={tier}
onChange={(e) =>
setTier(
e.target.value
)
}
>

<option value="Standard">
Standard
</option>

<option value="Silver">
Silver
</option>

<option value="Gold">
Gold
</option>

<option value="Elite">
Elite
</option>

</select>

</div>

<div>

<label className="text-xs text-slate-400 block mb-1">
Commission (%)
</label>

<input
type="number"
required
min="0"
max="10"
disabled={creatingPartner}
className="w-full bg-[#02030a] border border-slate-700 px-3 py-2.5 rounded-xl text-sm text-white focus:outline-none focus:border-[#31dfff] disabled:opacity-50"
value={commission}
onChange={(e) => {
const value =
Number(
e.target.value
);

if (
Number.isNaN(
value
)
) {
setCommission(
"0"
);
return;
}

setCommission(
String(
Math.min(
10,
Math.max(
0,
value
)
)
)
);
}}
/>

<p className="text-[10px] text-slate-500 mt-1">
Agent maximum: 10%
</p>

</div>

</div>

<div className="flex gap-3 mt-4">

<button
type="button"
onClick={() =>
setIsCreateModalOpen(
false
)
}
disabled={creatingPartner}
className="w-1/2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-2.5 rounded-xl transition text-sm cursor-pointer disabled:opacity-50"
>
Cancel
</button>

<button
type="submit"
disabled={
creatingPartner ||
!shopName.trim() ||
!shopEmail.trim()
}
className="w-1/2 bg-gradient-to-r from-[#31dfff] to-blue-600 text-slate-950 font-bold py-2.5 rounded-xl hover:opacity-90 transition text-sm shadow-lg cursor-pointer disabled:opacity-50"
>
{creatingPartner
? "Creating..."
: "Create Partner"}
</button>

</div>

</form>

</div>

</div>
)}

</div>
);
}
