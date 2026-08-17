import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
try {
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
console.error("Missing NEXT_PUBLIC_SUPABASE_URL");
return NextResponse.json(
{
success: false,
error: "Supabase URL is not configured.",
},
{ status: 500 }
);
}

if (!supabaseServiceRoleKey) {
console.error("Missing SUPABASE_SERVICE_ROLE_KEY");
return NextResponse.json(
{
success: false,
error: "Supabase service role key is not configured.",
},
{ status: 500 }
);
}

const supabaseAdmin = createClient(
supabaseUrl,
supabaseServiceRoleKey
);

const body = await request.json();
const { partnerId, amount } = body;

if (!partnerId) {
return NextResponse.json(
{
success: false,
error: "Partner ID is required.",
},
{ status: 400 }
);
}

if (!amount || Number(amount) <= 0) {
return NextResponse.json(
{
success: false,
error: "Invalid top-up amount.",
},
{ status: 400 }
);
}

const { error: rpcError } = await supabaseAdmin.rpc(
"top_up_partner_credit",
{
p_partner_id: partnerId,
p_amount: Number(amount),
p_agent_email: "admin",
}
);

if (rpcError) {
throw new Error(
"Failed to update credit via RPC: " + rpcError.message
);
}

return NextResponse.json({
success: true,
message: "Top-up successful and balance updated.",
});
} catch (error: any) {
console.error("Top-up error:", error);

return NextResponse.json(
{
success: false,
error: error?.message || "Internal Server Error",
},
{ status: 500 }
);
}
}
