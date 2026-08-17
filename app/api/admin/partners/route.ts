import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

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

export async function GET() {
try {
const { data, error } = await supabaseAdmin
.from("partners")
.select(
"*, business_shops(business_credit, shop_id)"
)
.order("created_at", {
ascending: false,
});

if (error) {
console.error(
"Admin partners API error:",
error
);

return NextResponse.json(
{
success: false,
error: error.message,
},
{ status: 500 }
);
}

return NextResponse.json({
success: true,
partners: data || [],
});
} catch (error: any) {
console.error(
"Unexpected admin partners API error:",
error
);

return NextResponse.json(
{
success: false,
error:
error?.message ||
"Failed to load partners.",
},
{ status: 500 }
);
}
}
