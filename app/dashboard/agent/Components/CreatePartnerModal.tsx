"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

interface CreatePartnerModalProps {
agentId: string;
onCreatePartner: (partner: any) => void;
}

export default function CreatePartnerModal({ agentId, onCreatePartner }: CreatePartnerModalProps) {
const [companyName, setCompanyName] = useState("");
const [email, setEmail] = useState("");
const [country, setCountry] = useState("");
const [tier, setTier] = useState("Standard");
const [credit, setCredit] = useState(500);
const [loading, setLoading] = useState(false);

const handleSubmit = async (e: React.FormEvent) => {
e.preventDefault();
if (credit < 500) {
alert("Minimum initial credit is 500");
return;
}

setLoading(true);
try {
const tempPassword = Math.random().toString(36).slice(-8) + "A1!";

const { data: authData, error: authError } = await supabase.auth.signUp({
email,
password: tempPassword,
});

if (authError) throw authError;

const { error: partnerError } = await supabase.from("partners").insert([
{
user_id: authData.user?.id,
agent_id: agentId,
company_name: companyName,
email: email,
country: country,
tier: tier,
credit: credit,
total_orders: 0,
total_sales: 0,
status: "Active",
},
]);

if (partnerError) throw partnerError;

alert("Partner created successfully and assigned to your network!");
onCreatePartner({ companyName, email, country, tier, initialCredit: credit });

setCompanyName("");
setEmail("");
setCountry("");
setTier("Standard");
setCredit(500);
} catch (error: any) {
alert("Error: " + error.message);
} finally {
setLoading(false);
}
};

return (
<div className="bg-[#070812]/80 backdrop-blur-xl rounded-2xl border border-white/5 p-6 shadow-xl mt-8">
<h2 className="text-lg font-bold text-[#31dfff] mb-5">Create New Partner (Agency)</h2>
<form onSubmit={handleSubmit} className="space-y-4">
<div>
<label className="text-xs text-slate-400 block mb-1">Company Name</label>
<input required type="text" placeholder="e.g. Global Tours" value={companyName} onChange={(e) => setCompanyName(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white" />
</div>
<div>
<label className="text-xs text-slate-400 block mb-1">Email Address</label>
<input required type="email" placeholder="partner@company.com" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white" />
</div>
<div>
<label className="text-xs text-slate-400 block mb-1">Country</label>
<input required type="text" placeholder="e.g. Algeria" value={country} onChange={(e) => setCountry(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white" />
</div>
<div>
<label className="text-xs text-slate-400 block mb-1">Partner Tier</label>
<select value={tier} onChange={(e) => setTier(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white">
<option value="Standard">Standard</option>
<option value="Silver">Silver</option>
<option value="Gold">Gold</option>
<option value="Platinum">Platinum</option>
<option value="Elite">Elite</option>
</select>
</div>
<div>
<label className="text-xs text-slate-400 block mb-1">Initial Top-up Credit (Minimum 500)</label>
<input required type="number" min={500} value={credit} onChange={(e) => setCredit(Number(e.target.value))} className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white font-bold text-[#f5b94d]" />
</div>
<button type="submit" disabled={loading} className="w-full py-3 rounded-xl font-bold text-black" style={{ background: "linear-gradient(135deg,#31dfff,#9d4fe0)" }}>
{loading ? "Creating..." : "Create Partner & Save"}
</button>
</form>
</div>
);
}

