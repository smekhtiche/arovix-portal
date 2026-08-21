"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import Link from "next/link";

const supabase = createClient();

function getDashboardPath(role: string | undefined | null) {
switch (role) {
case "admin":
return "/dashboard/admin";

case "agent":
return "/dashboard/agent";

case "partner":
case "agency":
return "/dashboard/agency";

default:
return null;
}
}

export default function LoginPage() {
// Normal login
const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
const [showPassword, setShowPassword] = useState(false);

// Set password
const [newPassword, setNewPassword] = useState("");
const [confirmPassword, setConfirmPassword] = useState("");
const [showNewPassword, setShowNewPassword] = useState(false);
const [showConfirmPassword, setShowConfirmPassword] = useState(false);

// Shared state
const [error, setError] = useState("");
const [success, setSuccess] = useState("");
const [loading, setLoading] = useState(false);

// Authentication / invitation state
const [mode, setMode] = useState<"login" | "set-password">("login");
const [checkingInvite, setCheckingInvite] = useState(true);
const [hasSession, setHasSession] = useState(false);

useEffect(() => {
const initializeAuth = async () => {
try {
const params = new URLSearchParams(
window.location.search
);

const requestedMode = params.get("mode");

if (requestedMode === "set-password") {
setMode("set-password");

const {
data: { session },
error: sessionError,
} = await supabase.auth.getSession();

if (sessionError) {
console.error(
"Set password session error:",
sessionError
);

setError(
sessionError.message ||
"Unable to verify your invitation session."
);

setCheckingInvite(false);
return;
}

if (!session) {
setHasSession(false);

setError(
"This invitation link is invalid or has expired. Please request a new invitation."
);

setCheckingInvite(false);
return;
}

setHasSession(true);
setCheckingInvite(false);
return;
}

// Normal login mode
setMode("login");
setCheckingInvite(false);
} catch (err: any) {
console.error(
"Authentication initialization error:",
err
);

setError(
err?.message ||
"Unable to initialize authentication."
);

setCheckingInvite(false);
}
};

initializeAuth();
}, []);

const handleLogin = async (
e: React.FormEvent
) => {
e.preventDefault();

setLoading(true);
setError("");
setSuccess("");

try {
const {
data: { user },
error: authError,
} = await supabase.auth.signInWithPassword({
email: email.trim(),
password,
});

if (authError) {
throw new Error(authError.message);
}

if (!user) {
throw new Error(
"Unable to retrieve your user account."
);
}

// --------------------------------------------------------
// CONFIRM THAT THE AUTHENTICATED SESSION EXISTS
// --------------------------------------------------------

const {
data: { session },
error: sessionError,
} = await supabase.auth.getSession();

if (sessionError) {
throw new Error(
sessionError.message ||
"Unable to retrieve your login session."
);
}

if (!session) {
throw new Error(
"Login succeeded, but the authentication session could not be established."
);
}

console.log(
"AROVIX LOGIN SESSION:",
session
);

// --------------------------------------------------------
// IMPORTANT:
// Give Supabase a brief moment to persist the session
// before navigating to the protected dashboard.
// The proxy will determine the correct dashboard
// for the authenticated user's role.
// --------------------------------------------------------

await new Promise((resolve) =>
setTimeout(resolve, 100)
);

window.location.replace("/dashboard");
} catch (err: any) {
console.error(
"Login error:",
err
);

setError(
err?.message ||
"Failed to sign in. Please check your credentials."
);

setLoading(false);
}
};

const handleSetPassword = async (
e: React.FormEvent
) => {
e.preventDefault();

setLoading(true);
setError("");
setSuccess("");

if (newPassword.length < 8) {
setError(
"Password must be at least 8 characters."
);

setLoading(false);
return;
}

if (newPassword !== confirmPassword) {
setError("Passwords do not match.");

setLoading(false);
return;
}

if (!hasSession) {
setError(
"Your invitation session is not available. Please request a new invitation."
);

setLoading(false);
return;
}

try {
const {
data: { user },
error: updateError,
} = await supabase.auth.updateUser({
password: newPassword,
});

if (updateError) {
throw new Error(updateError.message);
}

if (!user) {
throw new Error(
"Unable to retrieve your user account after setting the password."
);
}

setSuccess(
"Password set successfully. Redirecting..."
);

setTimeout(() => {
window.location.replace("/dashboard");
}, 1200);
} catch (err: any) {
console.error(
"Set password error:",
err
);

setError(
err?.message ||
"Failed to set your password. Please try again."
);

setLoading(false);
}
};

// Do not show either form while the
// invitation/session state is being checked.
if (checkingInvite) {
return (
<div className="min-h-screen bg-[#02030a] text-white flex items-center justify-center p-6 font-mono">
<div className="text-sm text-slate-400">
Verifying your authentication...
</div>
</div>
);
}

// --------------------------------------------------
// SET PASSWORD MODE
// --------------------------------------------------

if (mode === "set-password") {
return (
<div className="min-h-screen bg-[#02030a] text-white flex items-center justify-center p-6 font-mono">
<div className="w-full max-w-md bg-[#0b0e1a] p-8 rounded-2xl border border-slate-800 shadow-xl">
<div className="text-center mb-8">
<h1 className="text-2xl font-bold text-white mb-2">
Set Your Password
</h1>

<p className="text-sm text-slate-400">
Choose a password to activate your
AROVIX Portal account.
</p>
</div>

{error && (
<div className="mb-4 rounded-lg bg-red-500/20 border border-red-500/50 p-3 text-xs text-red-300 text-center">
{error}
</div>
)}

{success && (
<div className="mb-4 rounded-lg bg-emerald-500/20 border border-emerald-500/50 p-3 text-xs text-emerald-300 text-center">
{success}
</div>
)}

{hasSession && (
<form
onSubmit={handleSetPassword}
className="space-y-6"
autoComplete="off"
>
<div>
<label className="text-xs text-slate-400 block mb-1 font-medium">
New Password
</label>

<div className="relative">
<span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
<Lock className="h-5 w-5" />
</span>

<input
type={
showNewPassword
? "text"
: "password"
}
required
minLength={8}
value={newPassword}
onChange={(e) =>
setNewPassword(
e.target.value
)
}
autoComplete="new-password"
name="new-password"
className="w-full rounded-xl bg-[#02030a] border border-slate-700 px-4 py-3 pl-10 pr-10 text-white placeholder-slate-500 focus:border-[#31dfff] focus:outline-none text-sm transition"
placeholder="••••••••"
/>

<button
type="button"
onClick={() =>
setShowNewPassword(
!showNewPassword
)
}
className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-200 focus:outline-none"
>
{showNewPassword ? (
<EyeOff className="h-5 w-5" />
) : (
<Eye className="h-5 w-5" />
)}
</button>
</div>
</div>

<div>
<label className="text-xs text-slate-400 block mb-1 font-medium">
Confirm Password
</label>

<div className="relative">
<span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
<Lock className="h-5 w-5" />
</span>

<input
type={
showConfirmPassword
? "text"
: "password"
}
required
minLength={8}
value={confirmPassword}
onChange={(e) =>
setConfirmPassword(
e.target.value
)
}
autoComplete="new-password"
name="confirm-password"
className="w-full rounded-xl bg-[#02030a] border border-slate-700 px-4 py-3 pl-10 pr-10 text-white placeholder-slate-500 focus:border-[#31dfff] focus:outline-none text-sm transition"
placeholder="••••••••"
/>

<button
type="button"
onClick={() =>
setShowConfirmPassword(
!showConfirmPassword
)
}
className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-200 focus:outline-none"
>
{showConfirmPassword ? (
<EyeOff className="h-5 w-5" />
) : (
<Eye className="h-5 w-5" />
)}
</button>
</div>
</div>

<button
type="submit"
disabled={loading}
className="w-full rounded-xl bg-[#31dfff] text-[#02030a] py-3 text-sm font-bold shadow-lg hover:opacity-90 transition-all disabled:opacity-50"
>
{loading
? "Setting password..."
: "Set Password"}
</button>
</form>
)}

{!hasSession && (
<Link
href="/login"
className="block w-full text-center rounded-xl bg-[#31dfff] text-[#02030a] py-3 text-sm font-bold shadow-lg hover:opacity-90 transition-all"
>
Return to Login
</Link>
)}
</div>
</div>
);
}

// --------------------------------------------------
// NORMAL LOGIN MODE
// --------------------------------------------------

return (
<div className="min-h-screen bg-[#02030a] text-white flex items-center justify-center p-6 font-mono">
<div className="w-full max-w-md bg-[#0b0e1a] p-8 rounded-2xl border border-slate-800 shadow-xl">
<div className="text-center mb-8">
<h1 className="text-2xl font-bold text-white mb-2">
Sign In
</h1>

<p className="text-sm text-slate-400">
Welcome back to AROVIX Portal
</p>
</div>

{error && (
<div className="mb-4 rounded-lg bg-red-500/20 border border-red-500/50 p-3 text-xs text-red-300 text-center">
{error}
</div>
)}

<form
onSubmit={handleLogin}
className="space-y-6"
autoComplete="off"
>
<div>
<label className="text-xs text-slate-400 block mb-1 font-medium">
Email Address
</label>

<div className="relative">
<span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
<Mail className="h-5 w-5" />
</span>

<input
type="email"
required
value={email}
onChange={(e) =>
setEmail(e.target.value)
}
autoComplete="off"
name="no-autofill-email"
className="w-full rounded-xl bg-[#02030a] border border-slate-700 px-4 py-3 pl-10 text-white placeholder-slate-500 focus:border-[#31dfff] focus:outline-none text-sm transition"
placeholder="name@arovix.io"
/>
</div>
</div>

<div>
<div className="flex justify-between items-center mb-1">
<label className="text-xs text-slate-400 font-medium">
Password
</label>

<Link
href="/forgot-password"
className="text-xs text-[#31dfff] hover:underline"
>
Forgot password?
</Link>
</div>

<div className="relative">
<span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
<Lock className="h-5 w-5" />
</span>

<input
type={
showPassword
? "text"
: "password"
}
required
value={password}
onChange={(e) =>
setPassword(
e.target.value
)
}
autoComplete="new-password"
name="no-autofill-password"
className="w-full rounded-xl bg-[#02030a] border border-slate-700 px-4 py-3 pl-10 pr-10 text-white placeholder-slate-500 focus:border-[#31dfff] focus:outline-none text-sm transition"
placeholder="••••••••"
/>

<button
type="button"
onClick={() =>
setShowPassword(
!showPassword
)
}
className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-200 focus:outline-none"
>
{showPassword ? (
<EyeOff className="h-5 w-5" />
) : (
<Eye className="h-5 w-5" />
)}
</button>
</div>
</div>

<button
type="submit"
disabled={loading}
className="w-full rounded-xl bg-[#31dfff] text-[#02030a] py-3 text-sm font-bold shadow-lg hover:opacity-90 transition-all disabled:opacity-50"
>
{loading
? "Signing in..."
: "Sign In"}
</button>
</form>
</div>
</div>
);
}
