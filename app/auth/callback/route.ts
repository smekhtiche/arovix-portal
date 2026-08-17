import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
const { searchParams } = new URL(request.url);

const tokenHash = searchParams.get("token_hash");
const type = searchParams.get("type");

const siteUrl =
process.env.NEXT_PUBLIC_SITE_URL ||
"https://arovix-portal.vercel.app";

if (!tokenHash || type !== "invite") {
return NextResponse.redirect(
`${siteUrl}/login?error=invalid-invitation`
);
}

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
cookieStore.set(
name,
value,
options
);
}
);
} catch {
// Ignore cookie errors when headers
// have already been prepared.
}
},
},
}
);

const { error } =
await supabase.auth.verifyOtp({
token_hash: tokenHash,
type: "invite",
});

if (error) {
console.error(
"Invitation verification error:",
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
