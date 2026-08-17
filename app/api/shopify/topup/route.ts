import { NextResponse } from "next/server";

export async function POST(request: Request) {
try {
const body = await request.json();
const { partnerId, amount, email } = body;

if (!partnerId || !amount || amount <= 0) {
return NextResponse.json(
{ success: false, error: "Invalid partner ID or amount" },
{ status: 400 }
);
}

const shopifyDomain = process.env.SHOPIFY_STORE_DOMAIN || "arovix.myshopify.com";
// رابط تحويل للدفع أو معالجة الشحن
const checkoutUrl = `https://${shopifyDomain}/checkout/topup?partner=${partnerId}&amount=${amount}&ref=arv_${Date.now()}`;

return NextResponse.json({
success: true,
message: "Shopify checkout session created successfully",
checkoutUrl: checkoutUrl,
orderReference: "ARV-TOPUP-" + Math.floor(100000 + Math.random() * 900000),
});

} catch (error: any) {
return NextResponse.json(
{ success: false, error: error.message || "Internal server error" },
{ status: 500 }
);
}
}

