import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
const requestUrl = new URL(request.url);

const tokenHash = requestUrl.searchParams.get("token_hash");
const type = requestUrl.searchParams.get("type");

const siteUrl =
process.env.NEXT_PUBLIC_SITE_URL ||
"https://arovix-portal.vercel.app";

const cookieStore = await cookies();

const supabase = createServerClient(
process.env.NEXT_PUBLIC_SUPABASE_URL!,
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
{
cookies: {
getAll() {
return cookieStore.getAll();
},

setAll(cookiesToSet) {
try {
cookiesToSet.forEach(
({ name, value, options }) => {
cookieStore.set(name, value, options);
}
);
} catch {
// Ignore cookie errors when headers have already been prepared.
}
},
},
}
);

// ============================================================
// INVITATION FLOW
// ============================================================

if (tokenHash && type === "invite") {
const { error } = await supabase.auth.verifyOtp({
token_hash: tokenHash,
type: "invite",
});

if (error) {
console.error(
"AROVIX INVITATION VERIFICATION ERROR:",
error
);

return NextResponse.redirect(
`${siteUrl}/login?error=invalid-invitation`
);
}

return NextResponse.redirect(
`${siteUrl}/login?mode=set-password`
);
}

// ============================================================
// PASSWORD RECOVERY FLOW
// ============================================================

if (tokenHash && type === "recovery") {
const { error } = await supabase.auth.verifyOtp({
token_hash: tokenHash,
type: "recovery",
});

if (error) {
console.error(
"AROVIX RECOVERY VERIFICATION ERROR:",
error
);

return NextResponse.redirect(
`${siteUrl}/login?error=invalid-or-expired-link`
);
}

return NextResponse.redirect(
`${siteUrl}/login?mode=set-password`
);
}

// ============================================================
// INVALID AUTH CALLBACK
// ============================================================

return NextResponse.redirect(
`${siteUrl}/login?error=invalid-auth-link`
);
}
