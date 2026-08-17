"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
const [showPassword, setShowPassword] = useState(false);
const [error, setError] = useState("");
const [loading, setLoading] = useState(false);

const supabase = createClient();

const handleLogin = async (e: React.FormEvent) => {
e.preventDefault();
setLoading(true);
setError("");

try {
const { error: authError } = await supabase.auth.signInWithPassword({
email: email.trim(),
password,
});

if (authError) {
throw new Error(authError.message);
}

window.location.replace("/dashboard/admin");
} catch (err: any) {
setError(err?.message || "Failed to sign in. Please try again.");
setLoading(false);
}
};

return (
<div className="min-h-screen bg-[#02030a] text-white flex items-center justify-center p-6 font-mono">
<div className="w-full max-w-md bg-[#0b0e1a] p-8 rounded-2xl border border-slate-800 shadow-xl">
<div className="text-center mb-8">
<h1 className="text-2xl font-bold text-white mb-2">Sign In</h1>
<p className="text-sm text-slate-400">Welcome back to AROVIX Portal</p>
</div>

{error && (
<div className="mb-4 rounded-lg bg-red-500/20 border border-red-500/50 p-3 text-xs text-red-300 text-center">
{error}
</div>
)}

<form onSubmit={handleLogin} className="space-y-6">
<div>
<label className="text-xs text-slate-400 block mb-1 font-medium">Email Address</label>
<div className="relative">
<span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
<Mail className="h-5 w-5" />
</span>
<input
type="email"
required
value={email}
onChange={(e) => setEmail(e.target.value)}
className="w-full rounded-xl bg-[#02030a] border border-slate-700 px-4 py-3 pl-10 text-white placeholder-slate-500 focus:border-[#31dfff] focus:outline-none text-sm transition"
placeholder="name@arovix.io"
/>
</div>
</div>

<div>
<div className="flex justify-between items-center mb-1">
<label className="text-xs text-slate-400 font-medium">Password</label>
<Link href="/forgot-password" className="text-xs text-[#31dfff] hover:underline">
Forgot password?
</Link>
</div>
<div className="relative">
<span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
<Lock className="h-5 w-5" />
</span>
<input
type={showPassword ? "text" : "password"}
required
value={password}
onChange={(e) => setPassword(e.target.value)}
className="w-full rounded-xl bg-[#02030a] border border-slate-700 px-4 py-3 pl-10 pr-10 text-white placeholder-slate-500 focus:border-[#31dfff] focus:outline-none text-sm transition"
placeholder="••••••••"
/>
<button
type="button"
onClick={() => setShowPassword(!showPassword)}
className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-200 focus:outline-none"
>
{showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
</button>
</div>
</div>

<button
type="submit"
disabled={loading}
className="w-full rounded-xl bg-[#31dfff] text-[#02030a] py-3 text-sm font-bold shadow-lg hover:opacity-90 transition-all disabled:opacity-50"
>
{loading ? "Signing in..." : "Sign In"}
</button>
</form>
</div>
</div>
);
}

