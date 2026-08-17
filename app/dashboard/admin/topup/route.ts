import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
process.env.NEXT_PUBLIC_SUPABASE_URL!,
process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
try {
const body = await request.json();
const { partnerId, amount } = body;

if (!partnerId || !amount) {
return NextResponse.json(
{
success: false,
error: "Missing required fields.",
},
{ status: 400 }
);
}

const { error: rpcError } =
await supabaseAdmin.rpc(
"top_up_partner_credit",
{
p_partner_id: partnerId,
p_amount: Number(amount),
p_agent_email: "admin",
}
);

if (rpcError) {
throw new Error(
rpcError.message
);
}

return NextResponse.json({
success: true,
});
} catch (error: any) {
return NextResponse.json(
{
success: false,
error:
error.message,
},
{ status: 500 }
);
}
}
