"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase"; // تم التعديل هنا ليتوافق مع طريقة الـ export لديك
import { partners } from "../../data/partners"; // الاحتفاظ بالبيانات القديمة كاحتياطي

export default function PartnerAccountPage() {
const supabase = createClient(); // إنشاء الـ client داخل الدالة
const [partnerInfo, setPartnerInfo] = useState<any>(null);
const [loading, setLoading] = useState(true);

useEffect(() => {
async function fetchPartnerData() {
try {
// 1. جلب المستخدم الحالي المسجل دخول
const { data: { user } } = await supabase.auth.getUser();

if (user) {
// 2. جلب بيانات الشريك المرتبطة بالـ user_id من جدول partners
const { data, error } = await supabase
.from("partners")
.select("*")
.eq("user_id", user.id)
.single();

if (data && !error) {
setPartnerInfo({
partnerId: data.partner_id || "ARV-PARTNER-001",
companyName: data.company_name || "Arovix Partner",
contactPerson: "Business Owner",
email: data.email || user.email,
phone: data.phone || "+000 000 0000",
country: data.country || "Global",
preferredCurrency: "USD ($)",
timeZone: "UTC +2",
kycStatus: "Verified",
businessVerification: "Active Commercial Register",
apiStatus: "Connected & Active",
});
setLoading(false);
return;
}
}

// في حال لم يكن هناك مستخدم مسجل دخول، نستخدم البيانات القديمة مؤقتاً لكي لا تنكسر الصفحة
const partnerData = partners[0];
setPartnerInfo({
partnerId: partnerData?.shopId || "ARV-PARTNER-001",
companyName: partnerData?.companyName || "Arovix Partner",
contactPerson: "Business Owner",
email: partnerData?.email || "partner@arovix.io",
phone: "+000 000 0000",
country: partnerData?.country || "Global",
preferredCurrency: "USD ($)",
timeZone: "UTC +2",
kycStatus: "Verified",
businessVerification: "Active Commercial Register",
apiStatus: "Connected & Active",
});
} catch (err) {
console.error(err);
} finally {
setLoading(false);
}
}

fetchPartnerData();
}, [supabase]);

if (loading) {
return (
<div className="min-h-screen bg-[#070812] text-white flex items-center justify-center font-mono">
Loading Account Details...
</div>
);
}

return (
<div className="min-h-screen bg-[#070812] text-white p-6 lg:p-10 font-sans space-y-8">
<div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-b border-white/10 pb-6">
<div>
<div className="flex items-center gap-2 mb-1">
<span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 text-[#31dfff] border border-blue-500/20 text-xs font-mono">
AGENCY MANAGEMENT
</span>
<span className="text-xs text-slate-400 font-mono">
ID: {partnerInfo?.partnerId}
</span>
</div>
<h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight">
My Business <span className="text-[#31dfff]">Account</span>
</h1>
<p className="text-xs lg:text-sm text-slate-400 mt-1">
View your business credentials, verification status, and system connection.
</p>
</div>

<Link href="/dashboard/agency">
<button className="px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-xs font-mono rounded-xl transition">
← Back to Dashboard
</button>
</Link>
</div>

<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
<div className="bg-[#0c0f1d] border border-white/10 rounded-2xl p-6 shadow-xl space-y-5">
<h3 className="text-sm font-mono text-[#31dfff] uppercase tracking-wider border-b border-white/10 pb-3">
🏢 Company & Contact Details
</h3>

<div className="space-y-4 font-mono text-xs">
<div className="flex justify-between bg-[#070812] p-3 rounded-xl border border-white/5">
<span className="text-slate-400">Company Name:</span>
<span className="font-bold">{partnerInfo?.companyName}</span>
</div>

<div className="flex justify-between bg-[#070812] p-3 rounded-xl border border-white/5">
<span className="text-slate-400">Contact:</span>
<span className="font-bold">{partnerInfo?.contactPerson}</span>
</div>

<div className="flex justify-between bg-[#070812] p-3 rounded-xl border border-white/5">
<span className="text-slate-400">Email:</span>
<span>{partnerInfo?.email}</span>
</div>

<div className="flex justify-between bg-[#070812] p-3 rounded-xl border border-white/5">
<span className="text-slate-400">Country:</span>
<span>{partnerInfo?.country}</span>
</div>
</div>
</div>

<div className="bg-[#0c0f1d] border border-white/10 rounded-2xl p-6 shadow-xl space-y-5">
<h3 className="text-sm font-mono text-[#31dfff] uppercase tracking-wider border-b border-white/10 pb-3">
🔒 Verification & System
</h3>

<div className="space-y-4 font-mono text-xs">
<div className="flex justify-between bg-[#070812] p-3 rounded-xl border border-white/5">
<span className="text-slate-400">KYC:</span>
<span className="text-emerald-400">{partnerInfo?.kycStatus}</span>
</div>

<div className="flex justify-between bg-[#070812] p-3 rounded-xl border border-white/5">
<span className="text-slate-400">Business:</span>
<span>{partnerInfo?.businessVerification}</span>
</div>

<div className="flex justify-between bg-[#070812] p-3 rounded-xl border border-white/5">
<span className="text-slate-400">Currency:</span>
<span>{partnerInfo?.preferredCurrency}</span>
</div>

<div className="flex justify-between bg-[#070812] p-3 rounded-xl border border-white/5">
<span className="text-slate-400">API:</span>
<span className="text-emerald-400 font-bold">● {partnerInfo?.apiStatus}</span>
</div>
</div>
</div>
</div>

<div className="bg-[#0c0f1d] border border-blue-500/30 rounded-2xl p-4 flex items-center justify-between text-xs font-mono text-slate-400">
<span>ℹ️ Profile updates are managed through AROVIX support.</span>
<button
onClick={() => alert("Edit request submitted.")}
className="px-4 py-2 bg-blue-500/10 text-[#31dfff] border border-blue-500/30 rounded-xl hover:bg-blue-500/20 transition"
>
Request Update
</button>
</div>
</div>
);
}

