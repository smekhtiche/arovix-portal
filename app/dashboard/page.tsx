"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function DashboardRouter() {
const supabase = createClient();
const router = useRouter();
const [statusText, setStatusText] = useState(
"Authenticating session..."
);

useEffect(() => {
async function routeUser() {
try {
// 1. Get the currently authenticated Supabase user
const {
data: { user },
error: authError,
} = await supabase.auth.getUser();

if (authError || !user) {
router.replace("/login");
return;
}

// IMPORTANT:
// We use the authenticated Supabase user ID as the
// primary identity key instead of relying on email.
const userId = user.id;
const userEmail = user.email;

// 2. Check if this is the Super Admin
if (
userEmail === "info@arovix.io" ||
userEmail?.includes("admin")
) {
router.replace("/dashboard/admin");
return;
}

setStatusText("Checking partner profile...");

// 3. Check Partners using the Supabase Auth user ID
const {
data: partnerData,
error: partnerError,
} = await supabase
.from("partners")
.select("*")
.eq("user_id", userId)
.maybeSingle();

if (partnerData && !partnerError) {
router.replace("/dashboard/agency");
return;
}

setStatusText("Checking agent profile...");

// 4. Check Agents using the Supabase Auth user ID
const {
data: agentData,
error: agentError,
} = await supabase
.from("agents")
.select("*")
.eq("user_id", userId)
.maybeSingle();

if (agentData && !agentError) {
router.replace("/dashboard/agent");
return;
}

// 5. No matching profile found
console.warn(
"No partner or agent profile found for user:",
userId
);

router.replace("/login");
} catch (err) {
console.error("Routing error:", err);
router.replace("/login");
}
}

routeUser();
}, [router, supabase]);

return (
<div className="min-h-screen bg-[#070812] text-white flex flex-col items-center justify-center font-mono">
<div className="w-12 h-12 border-4 border-[#31dfff] border-t-transparent rounded-full animate-spin mb-4"></div>

<h2 className="text-lg font-bold text-white tracking-wide">
AROVIX SECURE GATEWAY
</h2>

<p className="text-xs text-slate-400 mt-2">
{statusText}
</p>
</div>
);
}
