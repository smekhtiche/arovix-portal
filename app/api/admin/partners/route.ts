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
// ------------------------------------------------------
// 1. Load partners
// ------------------------------------------------------

const {
data: partners,
error: partnersError,
} = await supabaseAdmin
.from("partners")
.select("*")
.order("created_at", {
ascending: false,
});

if (partnersError) {
console.error(
"Admin partners API - partners error:",
partnersError
);

return NextResponse.json(
{
success: false,
error: partnersError.message,
},
{ status: 500 }
);
}

// ------------------------------------------------------
// 2. Load business shops separately
// ------------------------------------------------------

const {
data: businessShops,
error: shopsError,
} = await supabaseAdmin
.from("business_shops")
.select(
"id, partner_id, shop_id, shop_name, business_credit, currency, status, created_at, updated_at"
);

if (shopsError) {
console.error(
"Admin partners API - business_shops error:",
shopsError
);

return NextResponse.json(
{
success: false,
error: shopsError.message,
},
{ status: 500 }
);
}

// ------------------------------------------------------
// 3. Attach the correct business shop to each partner
// ------------------------------------------------------

const partnersWithShops = (partners || []).map(
(partner: any) => {
const businessShop =
(businessShops || []).find(
(shop: any) =>
String(shop.partner_id) ===
String(partner.id)
) || null;

return {
...partner,

business_shops:
businessShop
? [businessShop]
: [],
};
}
);

// ------------------------------------------------------
// 4. Return final result
// ------------------------------------------------------

return NextResponse.json({
success: true,
partners: partnersWithShops,
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
