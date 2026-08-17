"use server";

import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const supabaseAdmin = createClient(
process.env.NEXT_PUBLIC_SUPABASE_URL!,
process.env.SUPABASE_SERVICE_ROLE_KEY!,
{
auth: {
autoRefreshToken: false,
persistSession: false,
},
}
);

export async function inviteUserAction(
email: string,
role: "agent" | "agency",
metadata: any
) {
try {
const cleanEmail = email.trim().toLowerCase();

const baseUrl =
process.env.NEXT_PUBLIC_SITE_URL ||
"https://arovix-portal.vercel.app";

const redirectTo =
`${baseUrl.replace(/\/$/, "")}/auth/callback`;

/*
* ============================================================
* 1. CREATE / INVITE THE SUPABASE AUTH USER
* ============================================================
*
* IMPORTANT:
* This creates ONLY the Auth user.
*
* It does NOT create a Partner.
* The Partner has already been created by the
* Admin Create Agency flow.
*/

const {
data: linkData,
error: linkError,
} =
await supabaseAdmin.auth.admin.generateLink({
type: "invite",
email: cleanEmail,
options: {
redirectTo,
data: {
role,
...metadata,
},
},
});

if (linkError) {
throw linkError;
}

if (!linkData?.user) {
throw new Error(
"Supabase did not return the invited user."
);
}

const invitedUserId = linkData.user.id;

/*
* ============================================================
* 2. LINK THE EXISTING PARTNER TO THE AUTH USER
* ============================================================
*
* IMPORTANT:
*
* DO NOT INSERT A NEW PARTNER HERE.
*
* The Admin Dashboard has already created:
*
* Partner
* +
* Business Shop
*
* before this invitation is sent.
*
* We only attach the Supabase Auth user ID to that
* existing Partner.
*/

if (role === "agency") {
const {
data: existingPartner,
error: existingPartnerError,
} = await supabaseAdmin
.from("partners")
.select(
"id, partner_id, user_id, email, company_name"
)
.eq("email", cleanEmail)
.maybeSingle();

if (existingPartnerError) {
throw existingPartnerError;
}

if (!existingPartner) {
throw new Error(
`No existing Partner was found for ${cleanEmail}. Create the Agency first, then send the invitation.`
);
}

/*
* Link the EXISTING Partner to the Auth user.
*
* No new Partner is created.
* No Business Shop is created.
* Existing credit and all existing Partner data remain untouched.
*/

const { error: updatePartnerError } =
await supabaseAdmin
.from("partners")
.update({
user_id: invitedUserId,
})
.eq("id", existingPartner.id);

if (updatePartnerError) {
throw updatePartnerError;
}
}

/*
* ============================================================
* 3. GET THE INVITATION TOKEN
* ============================================================
*
* We intentionally use token_hash so the existing
* /auth/callback flow can handle the invitation.
*/

const hashedToken =
linkData.properties.hashed_token;

if (!hashedToken) {
throw new Error(
"Supabase did not return the invitation token."
);
}

const inviteLink =
`${redirectTo}?token_hash=${encodeURIComponent(
hashedToken
)}&type=invite`;

/*
* ============================================================
* 4. SEND ONE INVITATION EMAIL
* ============================================================
*/

const { error: resendError } =
await resend.emails.send({
from: "Arovix <noreply@arovix.io>",
to: cleanEmail,
subject:
"Welcome to AROVIX - Set your password",
html: `
<div
style="
font-family: Arial, sans-serif;
padding: 20px;
color: #333;
max-width: 600px;
margin: 0 auto;
"
>
<h2>Welcome to AROVIX</h2>

<p>Your AROVIX account is ready.</p>

<p>
Please click the button below to set your
password and access your dashboard:
</p>

<a
href="${inviteLink}"
style="
display: inline-block;
padding: 12px 24px;
background-color: #0070f3;
color: #fff;
text-decoration: none;
border-radius: 6px;
margin-top: 15px;
font-weight: bold;
"
>
Set Password
</a>

<p
style="
margin-top: 30px;
font-size: 12px;
color: #777;
"
>
If you did not request this invitation,
please ignore this email.
</p>
</div>
`,
});

if (resendError) {
throw resendError;
}

/*
* ============================================================
* 5. SUCCESS
* ============================================================
*/

return {
success: true,
message: "Invitation sent successfully!",
userId: invitedUserId,
};
} catch (err: any) {
console.error(
"inviteUserAction error:",
err
);

return {
success: false,
error:
err?.message ||
"Failed to send invitation.",
};
}
}
