import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createClient as createSupabaseAdmin } from "@supabase/supabase-js";

export async function proxy(request: NextRequest) {
console.log(
"AROVIX PROXY RUNNING:",
request.nextUrl.pathname
);

let supabaseResponse = NextResponse.next({
request,
});

const supabaseUrl =
process.env.NEXT_PUBLIC_SUPABASE_URL;

const supabaseAnonKey =
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const serviceRoleKey =
process.env.SUPABASE_SERVICE_ROLE_KEY;

if (
!supabaseUrl ||
!supabaseAnonKey ||
!serviceRoleKey
) {
console.error(
"AROVIX PROXY: Supabase environment variables are missing."
);

return NextResponse.redirect(
new URL(
"/login?error=configuration_error",
request.url
)
);
}

// ============================================================
// SUPABASE SERVER CLIENT
// Used to read the authenticated user's session from cookies.
// ============================================================

const supabase = createServerClient(
supabaseUrl,
supabaseAnonKey,
{
cookies: {
getAll() {
return request.cookies.getAll();
},

setAll(cookiesToSet) {
cookiesToSet.forEach(
({ name, value }) => {
request.cookies.set(
name,
value
);
}
);

supabaseResponse =
NextResponse.next({
request,
});

cookiesToSet.forEach(
({
name,
value,
options,
}) => {
supabaseResponse.cookies.set(
name,
value,
options
);
}
);
},
},
}
);

const pathname =
request.nextUrl.pathname;

// ============================================================
// 1. PUBLIC ROUTES
//
// These routes must NEVER require a profile or dashboard role.
// This is important for Login, Forgot Password, Set Password,
// Auth Callback and API routes.
// ============================================================

const isPublicRoute =
pathname === "/login" ||
pathname === "/forgot-password" ||
pathname === "/update-password" ||
pathname.startsWith("/auth/") ||
pathname.startsWith("/api/");

if (isPublicRoute) {
return supabaseResponse;
}

// ============================================================
// 2. ONLY DASHBOARD ROUTES REQUIRE AUTHENTICATION
// ============================================================

if (!pathname.startsWith("/dashboard")) {
return supabaseResponse;
}

// ============================================================
// 3. GET AUTHENTICATED USER
// ============================================================

const {
data: { user },
error: userError,
} = await supabase.auth.getUser();

console.log(
"AROVIX PROXY USER:",
user?.id || "NO USER",
userError?.message || ""
);

// ============================================================
// 4. NO AUTHENTICATED USER
// ============================================================

if (userError || !user) {
const url =
request.nextUrl.clone();

url.pathname = "/login";
url.searchParams.set(
"error",
"unauthorized"
);

return NextResponse.redirect(url);
}

// ============================================================
// 5. ADMIN SUPABASE CLIENT
//
// Service Role is SERVER-SIDE ONLY.
//
// It is used here only to read the profile by the Auth UID,
// preventing RLS from incorrectly returning "profile not found".
// ============================================================

const supabaseAdmin =
createSupabaseAdmin(
supabaseUrl,
serviceRoleKey,
{
auth: {
autoRefreshToken: false,
persistSession: false,
},
}
);

// ============================================================
// 6. GET PROFILE BY AUTH USER UID
//
// IMPORTANT:
// profiles.id MUST equal auth.users.id.
// We do NOT search by email.
// ============================================================

const {
data: profile,
error: profileError,
} = await supabaseAdmin
.from("profiles")
.select(
"id, full_name, email, role, status, agent_id, partner_id, shop_id, company_name"
)
.eq("id", user.id)
.maybeSingle();

console.log(
"AROVIX PROXY PROFILE:",
profile?.role || "NO PROFILE",
profile?.status || "",
profile?.id || ""
);

// ============================================================
// 7. PROFILE MUST EXIST
// ============================================================

if (profileError || !profile) {
console.error(
"AROVIX PROXY PROFILE ERROR:",
profileError
);

const url =
request.nextUrl.clone();

url.pathname = "/login";
url.searchParams.set(
"error",
"profile_not_found"
);

return NextResponse.redirect(url);
}

// ============================================================
// 8. NORMALIZE ROLE / STATUS
// ============================================================

const role = String(
profile.role || ""
)
.trim()
.toLowerCase();

const status = String(
profile.status || ""
)
.trim()
.toLowerCase();

// ============================================================
// 9. BLOCK INACTIVE ACCOUNTS
// ============================================================

if (
status === "inactive" ||
status === "suspended" ||
status === "blocked" ||
status === "disabled"
) {
const url =
request.nextUrl.clone();

url.pathname = "/login";
url.searchParams.set(
"error",
"account_inactive"
);

return NextResponse.redirect(url);
}

// ============================================================
// 10. DETERMINE ALLOWED DASHBOARD
// ============================================================

let allowedDashboard: string | null =
null;

switch (role) {
case "admin":
allowedDashboard =
"/dashboard/admin";
break;

case "agent":
allowedDashboard =
"/dashboard/agent";
break;

case "partner":
case "agency":
allowedDashboard =
"/dashboard/agency";
break;

default:
allowedDashboard = null;
}

// ============================================================
// 11. UNKNOWN ROLE
// ============================================================

if (!allowedDashboard) {
const url =
request.nextUrl.clone();

url.pathname = "/login";
url.searchParams.set(
"error",
"invalid_role"
);

return NextResponse.redirect(url);
}

// ============================================================
// 12. GENERIC /dashboard
// ============================================================

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

// ============================================================
// 13. ADMIN DASHBOARD
// ============================================================

if (
pathname.startsWith(
"/dashboard/admin"
)
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

// ============================================================
// 14. AGENT DASHBOARD
// ============================================================

if (
pathname.startsWith(
"/dashboard/agent"
)
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
const url =
request.nextUrl.clone();

url.pathname = "/login";
url.searchParams.set(
"error",
"agent_not_configured"
);

return NextResponse.redirect(url);
}

return supabaseResponse;
}

// ============================================================
// 15. AGENCY / PARTNER DASHBOARD
// ============================================================

if (
pathname.startsWith(
"/dashboard/agency"
)
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
const url =
request.nextUrl.clone();

url.pathname = "/login";
url.searchParams.set(
"error",
"partner_not_configured"
);

return NextResponse.redirect(url);
}

return supabaseResponse;
}

// ============================================================
// 16. UNKNOWN DASHBOARD PATH
// ============================================================

return NextResponse.redirect(
new URL(
allowedDashboard,
request.url
)
);
}

// ============================================================
// MATCHER
// ============================================================

export const config = {
matcher: [
"/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
],
};
