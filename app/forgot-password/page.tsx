"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase";
import Link from "next/link";

export default function ForgotPasswordPage() {
const supabase = createClient();
const [email, setEmail] = useState("");
const [loading, setLoading] = useState(false);
const [message, setMessage] = useState("");
const [errorMsg, setErrorMsg] = useState("");

const handleResetRequest = async (e: React.FormEvent) => {
e.preventDefault();
setLoading(true);
setMessage("");
setErrorMsg("");

try {
const { error } = await supabase.auth.resetPasswordForEmail(email, {
redirectTo: `${window.location.origin}/update-password`,
});

if (error) throw error;

setMessage("Password reset link has been sent to your email address.");
} catch (err: any) {
console.error("Reset password error:", err);
setErrorMsg(err.message || "Failed to send reset link. Please try again.");
} finally {
setLoading(false);
}
};

return (
<div className="min-h-screen bg-[#02030a] text-white flex items-center justify-center p-6">
<div className="max-w-md w-full bg-[#0b0e1a] p-8 rounded-2xl border border-slate-800 shadow-xl">
<div className="text-center mb-8">
<h1 className="text-2xl font-bold text-white mb-2">Reset Password</h1>
<p className="text-sm text-slate-400">Enter your email to receive a recovery link</p>
</div>

{message && (
<div className="mb-4 p-3 bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 rounded-lg text-sm">
{message}
</div>
)}

{errorMsg && (
<div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 text-red-300 rounded-lg text-sm">
{errorMsg}
</div>
)}

<form onSubmit={handleResetRequest} className="flex flex-col gap-4">
<div>
<label className="text-xs text-slate-400 block mb-1 font-medium">Email Address</label>
<input
type="email"
required
className="w-full bg-[#02030a] border border-slate-700 px-4 py-2.5 rounded-xl text-sm text-white focus:outline-none focus:border-[#31dfff] transition"
value={email}
onChange={(e) => setEmail(e.target.value)}
placeholder="name@arovix.io"
/>
</div>

<button
type="submit"
disabled={loading}
className="mt-2 w-full bg-[#31dfff] text-[#02030a] font-bold py-3 rounded-xl hover:opacity-90 transition text-sm disabled:opacity-50"
>
{loading ? "Sending link..." : "Send Reset Link"}
</button>
</form>

<div className="mt-6 text-center">
<Link href="/login" className="text-xs text-slate-400 hover:text-white transition">
← Back to Sign In
</Link>
</div>
</div>
</div>
);
}

