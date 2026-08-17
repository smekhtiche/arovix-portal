"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function AgencyLoginPage() {
const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
const [loading, setLoading] = useState(false);
const [errorMsg, setErrorMsg] = useState("");
const [isClient, setIsClient] = useState(false);
const router = useRouter();

// منع مشاكل الـ Hydration بالتأكد من تشغيل الصفحة على العميل فقط
useEffect(() => {
setIsClient(true);
}, []);

const handleLogin = async (e: React.FormEvent) => {
e.preventDefault();
setErrorMsg("");
setLoading(true);

try {
const { data, error } = await supabase.auth.signInWithPassword({
email,
password,
});

if (error) throw error;

// توجيه الشريك لوحة التحكم الخاصة به بعد تسجيل الدخول بنجاح
router.push("/agency/dashboard");
} catch (err: any) {
setErrorMsg(err.message || "حدث خطأ أثناء تسجيل الدخول.");
} finally {
setLoading(false);
}
};

if (!isClient) return null;

return (
<div className="min-h-screen bg-[#02030a] text-white flex items-center justify-center p-6">
<div className="max-w-md w-full bg-[#0b0e17] border border-slate-800 rounded-2xl p-8 shadow-2xl">
<h2 className="text-2xl font-bold mb-2 text-center text-cyan-400">تسجيل دخول الشركاء</h2>
<p className="text-slate-400 text-sm text-center mb-6">أدخل بيانات حسابك لإدارة المتجر والطلبات.</p>

{errorMsg && (
<div className="bg-red-500/10 border border-red-500 text-red-400 p-3 rounded-lg text-sm mb-4 text-center">
{errorMsg}
</div>
)}

<form onSubmit={handleLogin} className="space-y-4">
<div>
<label className="block text-xs font-medium text-slate-400 mb-1">البريد الإلكتروني</label>
<input
type="email"
value={email}
onChange={(e) => setEmail(e.target.value)}
required
className="w-full bg-[#121826] border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500"
placeholder="name@example.com"
/>
</div>

<div>
<label className="block text-xs font-medium text-slate-400 mb-1">كلمة المرور</label>
<input
type="password"
value={password}
onChange={(e) => setPassword(e.target.value)}
required
className="w-full bg-[#121826] border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500"
placeholder="••••••••"
/>
</div>

<button
type="submit"
disabled={loading}
className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-medium py-3 rounded-xl transition duration-200 disabled:opacity-50"
>
{loading ? "جاري تسجيل الدخول..." : "تسجيل الدخول"}
</button>
</form>
</div>
</div>
);
}

