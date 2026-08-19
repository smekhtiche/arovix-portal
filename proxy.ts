import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";

export async function proxy(request: NextRequest) {
let supabaseResponse = NextResponse.next({
request,
});

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey || !serviceRoleKey) {
console.error("AROVIX PROXY: Missing Supabase environment variables.");

return NextResponse.redirect(
new URL("/login?error=configuration_error", request.url)
);
}

const supabase = createServerClient(
supabaseUrl,
supabaseAnonKey,
{
cookies: {
getAll() {
return request.cookies.getAll();
},

setAll(cookiesToSet) {
cookiesToSet.forEach(({ name, value }) => {
request.cookies.set(name, value);
});

supabaseResponse = NextResponse.next({
request,
});

cookiesToSet.forEach(({ name, value, options }) => {
supabaseResponse.cookies.set(name, value, options);
});
},
},
}
);

const pathname = request.nextUrl.pathname;

// ------------------------------------------------------------
// PUBLIC ROUTES
// ------------------------------------------------------------

const isPublicRoute =
pathname === "/login" ||
pathname.startsWith("/auth/") ||
pathname.startsWith("/api/") ||
pathname === "/forgot-password" ||
pathname === "/update-password" ||
pathname === "/agency/login" ||
pathname === "/agency/update-password";

if (isPublicRoute) {
return supabaseResponse;
}

// ------------------------------------------------------------
// ONLY DASHBOARD ROUTES REQUIRE AUTHENTICATION
// ------------------------------------------------------------

if (!pathname.startsWith("/dashboard")) {
return supabaseResponse;
}

// ------------------------------------------------------------
// GET AUTHENTICATED USER
// ------------------------------------------------------------

const {
data: { user },
error: userError,
} = await supabase.auth.getUser();

console.log(
"AROVIX PROXY USER:",
user?.id || "NO USER",
userError?.message || ""
);

if (userError || !user) {
const url = request.nextUrl.clone();

url.pathname = "/login";
url.searchParams.set("error", "unauthorized");

return NextResponse.redirect(url);
}

// ------------------------------------------------------------
// SERVER-SIDE ADMIN CLIENT
// This bypasses profiles RLS.
// ------------------------------------------------------------

const adminSupabase = createClient(
supabaseUrl,
serviceRoleKey,
{
auth: {
autoRefreshToken: false,
persistSession: false,
},
}
);

// ------------------------------------------------------------
// GET PROFILE USING AUTH UID
// ------------------------------------------------------------

const {
data: profile,
error: profileError,
} = await adminSupabase
.from("profiles")
.select(
"id, role, status, agent_id, partner_id, shop_id, company_name"
)
.eq("id", user.id)
.maybeSingle();

console.log(
"AROVIX PROXY PROFILE:",
profile?.role || "NO PROFILE",
profile?.status || "",
profileError?.message || ""
);

if (profileError || !profile) {
console.error(
"AROVIX PROXY PROFILE ERROR:",
profileError
);

const url = request.nextUrl.clone();

url.pathname = "/login";
url.searchParams.set(
"error",
"profile_not_found"
);

return NextResponse.redirect(url);
}

// ------------------------------------------------------------
// NORMALIZE ROLE / STATUS
// ------------------------------------------------------------

const role = String(profile.role || "")
.trim()
.toLowerCase();

const status = String(profile.status || "")
.trim()
.toLowerCase();

// ------------------------------------------------------------
// BLOCK INACTIVE ACCOUNTS
// ------------------------------------------------------------

if (
status === "inactive" ||
status === "suspended" ||
status === "blocked" ||
status === "disabled"
) {
const url = request.nextUrl.clone();

url.pathname = "/login";
url.searchParams.set(
"error",
"account_inactive"
);

return NextResponse.redirect(url);
}

// ------------------------------------------------------------
// DETERMINE ALLOWED DASHBOARD
// ------------------------------------------------------------

let allowedDashboard: string | null = null;

switch (role) {
case "admin":
allowedDashboard = "/dashboard/admin";
break;

case "agent":
allowedDashboard = "/dashboard/agent";
break;

case "partner":
case "agency":
allowedDashboard = "/dashboard/agency";
break;

default:
allowedDashboard = null;
}

// ------------------------------------------------------------
// INVALID ROLE
// ------------------------------------------------------------

if (!allowedDashboard) {
const url = request.nextUrl.clone();

url.pathname = "/login";
url.searchParams.set(
"error",
"invalid_role"
);

return NextResponse.redirect(url);
}

// ------------------------------------------------------------
// GENERIC /dashboard
// ------------------------------------------------------------

if (
pathname === "/dashboard" ||
pathname === "/dashboard/"
) {
return NextResponse.redirect(
new URL(
allowedDashboard,
request.url
)
);
}

// ------------------------------------------------------------
// ADMIN DASHBOARD
// ------------------------------------------------------------

if (
pathname.startsWith("/dashboard/admin")
) {
if (role !== "admin") {
return NextResponse.redirect(
new URL(
allowedDashboard,
request.url
)
);
}

return supabaseResponse;
}

// ------------------------------------------------------------
// AGENT DASHBOARD
// ------------------------------------------------------------

if (
pathname.startsWith("/dashboard/agent")
) {
if (role !== "agent") {
return NextResponse.redirect(
new URL(
allowedDashboard,
request.url
)
);
}

if (!profile.agent_id) {
const url = request.nextUrl.clone();

url.pathname = "/login";
url.searchParams.set(
"error",
"agent_not_configured"
);

return NextResponse.redirect(url);
}

return supabaseResponse;
}

// ------------------------------------------------------------
// AGENCY / PARTNER DASHBOARD
// ------------------------------------------------------------

if (
pathname.startsWith("/dashboard/agency")
) {
if (
role !== "partner" &&
role !== "agency"
) {
return NextResponse.redirect(
new URL(
allowedDashboard,
request.url
)
);
}

if (!profile.partner_id) {
const url = request.nextUrl.clone();

url.pathname = "/login";
url.searchParams.set(
"error",
"partner_not_configured"
);

return NextResponse.redirect(url);
}

return supabaseResponse;
}

// ------------------------------------------------------------
// UNKNOWN DASHBOARD PATH
// ------------------------------------------------------------

return NextResponse.redirect(
new URL(
allowedDashboard,
request.url
)
);
}

export const config = {
matcher: [
"/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
],
};
