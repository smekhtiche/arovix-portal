import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
try {
const body = await request.json();
const { partnerId, amount } = body;

if (!partnerId) {
return NextResponse.json(
{ success: false, error: "Partner ID is required." },
{ status: 400 }
);
}

if (!amount || Number(amount) <= 0) {
return NextResponse.json(
{ success: false, error: "Invalid top-up amount." },
{ status: 400 }
);
}

// Create Supabase admin client only when the API is actually called.
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

// 1. Fetch the partner's current credit
const { data: currentShop, error: fetchError } = await supabaseAdmin
.from("business_shops")
.select("credit")
.eq("id", partnerId)
.single();

if (fetchError) {
throw new Error(
"Failed to fetch partner data: " + fetchError.message
);
}

const currentCredit = Number(currentShop?.credit || 0);
const addedAmount = Number(amount);
const newTotalCredit = currentCredit + addedAmount;

// 2. Update the partner's credit
const { error: updateError } = await supabaseAdmin
.from("business_shops")
.update({ credit: newTotalCredit })
.eq("id", partnerId);

if (updateError) {
throw new Error(
"Failed to update credit: " + updateError.message
);
}

return NextResponse.json({
success: true,
message: "Top-up successful and balance updated.",
newCredit: newTotalCredit,
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
