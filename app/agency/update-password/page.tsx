"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";

export default function UpdatePasswordPage() {
const [password, setPassword] = useState("");
const [confirmPassword, setConfirmPassword] = useState("");
const [showPassword, setShowPassword] = useState(false);
const [showConfirmPassword, setShowConfirmPassword] = useState(false);
const [loading, setLoading] = useState(false);
const [errorMsg, setErrorMsg] = useState("");
const [successMsg, setSuccessMsg] = useState("");
const [isClient, setIsClient] = useState(false);
const router = useRouter();

useEffect(() => {
setIsClient(true);
}, []);

const handleUpdatePassword = async (e: React.FormEvent) => {
e.preventDefault();
setErrorMsg("");
setSuccessMsg("");

if (password !== confirmPassword) {
setErrorMsg("Passwords do not match.");
return;
}

if (password.length < 6) {
setErrorMsg("Password must be at least 6 characters.");
return;
}

setLoading(true);

try {
const { error } = await supabase.auth.updateUser({
password: password,
});

if (error) throw error;

setSuccessMsg("Password updated successfully! Redirecting...");

setTimeout(() => {
router.push("/agency/login");
}, 2000);

} catch (err: any) {
setErrorMsg(err.message || "An error occurred.");
} finally {
setLoading(false);
}
};

if (!isClient) {
return (
<div className="min-h-screen bg-[#02030a] text-white flex items-center justify-center p-6">
<div className="text-slate-400 text-sm">Loading...</div>
</div>
);
}

return (
<div className="min-h-screen bg-[#02030a] text-white flex items-center justify-center p-6">
<div className="max-w-md w-full bg-[#0b0e17] border border-slate-800 rounded-2xl p-8 shadow-2xl">
<h2 className="text-2xl font-bold mb-2 text-center text-cyan-400">Set New Password</h2>
<p className="text-slate-400 text-sm text-center mb-6">Please enter your new password below.</p>

{errorMsg && (
<div className="bg-red-500/10 border border-red-500 text-red-400 p-3 rounded-lg text-sm mb-4 text-center">
{errorMsg}
</div>
)}

{successMsg && (
<div className="bg-emerald-500/10 border border-emerald-500 text-emerald-400 p-3 rounded-lg text-sm mb-4 text-center">
{successMsg}
</div>
)}

<form onSubmit={handleUpdatePassword} className="space-y-4">
<div>
<label className="block text-xs font-medium text-slate-400 mb-1">New Password</label>
<div className="relative">
<input
type={showPassword ? "text" : "password"}
value={password}
onChange={(e) => setPassword(e.target.value)}
required
className="w-full bg-[#121826] border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500 pl-4 pr-10"
placeholder="••••••••"
/>
<button
type="button"
onClick={() => setShowPassword(!showPassword)}
className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
>
{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
</button>
</div>
</div>

<div>
<label className="block text-xs font-medium text-slate-400 mb-1">Confirm Password</label>
<div className="relative">
<input
type={showConfirmPassword ? "text" : "password"}
value={confirmPassword}
onChange={(e) => setConfirmPassword(e.target.value)}
required
className="w-full bg-[#121826] border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500 pl-4 pr-10"
placeholder="••••••••"
/>
<button
type="button"
onClick={() => setShowConfirmPassword(!showConfirmPassword)}
className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
>
{showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
</button>
</div>
</div>

<button
type="submit"
disabled={loading}
className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-medium py-3 rounded-xl transition duration-200 disabled:opacity-50 mt-2"
>
{loading ? "Saving..." : "Update Password"}
</button>
</form>
</div>
</div>
);
}

