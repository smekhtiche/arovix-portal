import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
const requestUrl = new URL(request.url);
const code = requestUrl.searchParams.get("code");
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
cookiesToSet.forEach(({ name, value, options }) => {
cookieStore.set(name, value, options);
});
} catch {
// Ignore cookie errors when headers have already been prepared.
}
},
},
}
);

/*
* PKCE flow
*
* Password recovery links can arrive with ?code=...
* Exchange the code for a Supabase session first.
*/
if (code) {
const { error } =
await supabase.auth.exchangeCodeForSession(code);

if (error) {
console.error("Auth callback code exchange error:", error);

return NextResponse.redirect(
`${siteUrl}/login?error=invalid-or-expired-link`
);
}

/*
* We now have the authenticated recovery session.
* Send the user to the password update page.
*/
return NextResponse.redirect(
`${siteUrl}/update-password`
);
}

/*
* Invitation flow
*/
if (tokenHash && type === "invite") {
const { error } = await supabase.auth.verifyOtp({
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

/*
* Anything else is invalid.
*/
return NextResponse.redirect(
`${siteUrl}/login?error=invalid-auth-link`
);
}
