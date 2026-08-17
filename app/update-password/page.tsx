"use client";

import { Suspense, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { useRouter, useSearchParams } from "next/navigation";

function UpdatePasswordForm() {
const supabase = createClient();
const router = useRouter();
const searchParams = useSearchParams();

const [password, setPassword] = useState("");
const [confirmPassword, setConfirmPassword] = useState("");
const [loading, setLoading] = useState(false);
const [checkingSession, setCheckingSession] = useState(true);
const [message, setMessage] = useState("");
const [errorMsg, setErrorMsg] = useState("");

useEffect(() => {
const handleAuthSession = async () => {
try {
// PKCE flow
const code = searchParams.get("code");

if (code) {
const { error } =
await supabase.auth.exchangeCodeForSession(code);

if (error) {
throw error;
}
}

// Hash flow used by Supabase invitation/recovery links
if (typeof window !== "undefined") {
const hash = window.location.hash.substring(1);

if (hash) {
const hashParams = new URLSearchParams(hash);

const accessToken =
hashParams.get("access_token");

const refreshToken =
hashParams.get("refresh_token");

const hashError =
hashParams.get("error");

const hashErrorDescription =
hashParams.get("error_description");

if (hashError) {
throw new Error(
hashErrorDescription ||
"The password setup link is invalid or has expired."
);
}

if (accessToken && refreshToken) {
const { error } =
await supabase.auth.setSession({
access_token: accessToken,
refresh_token: refreshToken,
});

if (error) {
throw error;
}

// Remove tokens from the browser URL
window.history.replaceState(
{},
document.title,
window.location.pathname
);
}
}
}

// Check the final authenticated session
const {
data: { session },
} = await supabase.auth.getSession();

if (!session) {
setErrorMsg(
"This password setup link is invalid or has expired. Please request a new invitation."
);
return;
}

setErrorMsg("");
} catch (error: any) {
console.error(
"Password setup session error:",
error
);

setErrorMsg(
error?.message ||
"Unable to verify the password setup link."
);
} finally {
setCheckingSession(false);
}
};

handleAuthSession();
}, [searchParams, supabase]);

const handleUpdatePassword = async (
e: React.FormEvent
) => {
e.preventDefault();

setMessage("");
setErrorMsg("");

if (password.length < 6) {
setErrorMsg(
"Password must be at least 6 characters long."
);
return;
}

if (password !== confirmPassword) {
setErrorMsg("Passwords do not match.");
return;
}

setLoading(true);

try {
const {
data: { session },
} = await supabase.auth.getSession();

if (!session) {
throw new Error(
"Your password setup session is invalid or has expired."
);
}

const { error } =
await supabase.auth.updateUser({
password,
});

if (error) {
throw error;
}

setMessage(
"Password updated successfully! Redirecting to login..."
);

setTimeout(() => {
router.push("/login");
}, 2000);
} catch (error: any) {
console.error(
"Update password error:",
error
);

setErrorMsg(
error?.message ||
"Failed to update password. Please try again."
);
} finally {
setLoading(false);
}
};

if (checkingSession) {
return (
<div className="min-h-screen bg-[#02030a] text-white flex items-center justify-center p-6 font-mono">
<div className="text-sm text-slate-400">
Verifying password setup link...
</div>
</div>
);
}

return (
<div className="min-h-screen bg-[#02030a] text-white flex items-center justify-center p-6 font-mono">
<div className="max-w-md w-full bg-[#0b0e1a] p-8 rounded-2xl border border-slate-800 shadow-xl">
<div className="text-center mb-8">
<h1 className="text-2xl font-bold text-white mb-2">
Set New Password
</h1>

<p className="text-sm text-slate-400">
Please enter your new password below
</p>
</div>

{message && (
<div className="mb-4 p-3 bg-emerald-500/25 border border-emerald-500/50 text-emerald-300 rounded-lg text-sm">
{message}
</div>
)}

{errorMsg && (
<div className="mb-4 p-3 bg-red-500/25 border border-red-500/50 text-red-300 rounded-lg text-sm">
{errorMsg}
</div>
)}

{!errorMsg && (
<form
onSubmit={handleUpdatePassword}
className="flex flex-col gap-4"
>
<div>
<label className="text-xs text-slate-400 block mb-1 font-medium">
New Password
</label>

<input
type="password"
required
minLength={6}
value={password}
onChange={(e) =>
setPassword(e.target.value)
}
placeholder="••••••••"
className="w-full bg-[#02030a] border border-slate-700 px-4 py-2.5 rounded-xl text-sm text-white focus:outline-none focus:border-[#31dfff] transition"
/>
</div>

<div>
<label className="text-xs text-slate-400 block mb-1 font-medium">
Confirm Password
</label>

<input
type="password"
required
minLength={6}
value={confirmPassword}
onChange={(e) =>
setConfirmPassword(e.target.value)
}
placeholder="••••••••"
className="w-full bg-[#02030a] border border-slate-700 px-4 py-2.5 rounded-xl text-sm text-white focus:outline-none focus:border-[#31dfff] transition"
/>
</div>

<button
type="submit"
disabled={loading}
className="mt-2 w-full bg-[#31dfff] text-[#02030a] font-bold py-3 rounded-xl hover:opacity-90 transition text-sm disabled:opacity-50"
>
{loading
? "Updating..."
: "Update Password"}
</button>
</form>
)}

{errorMsg && (
<button
type="button"
onClick={() => router.push("/login")}
className="mt-4 w-full border border-slate-700 text-slate-300 font-bold py-3 rounded-xl hover:bg-slate-800 transition text-sm"
>
Back to Login
</button>
)}
</div>
</div>
);
}

function LoadingScreen() {
return (
<div className="min-h-screen bg-[#02030a] text-white flex items-center justify-center p-6 font-mono">
<div className="text-sm text-slate-400">
Loading password setup...
</div>
</div>
);
}

export default function UpdatePasswordPage() {
return (
<Suspense fallback={<LoadingScreen />}>
<UpdatePasswordForm />
</Suspense>
);
}
