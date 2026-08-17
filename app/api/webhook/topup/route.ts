import { NextResponse } from "next/server";

export async function POST(request: Request) {
try {
const body = await request.json();
// استلام البيانات القادمة من شوبي فاي أو n8n عند نجاح الدفع
const { partnerId, amount, transactionId, status } = body;

if (!partnerId || !amount) {
return NextResponse.json(
{ success: false, error: "Missing required fields: partnerId or amount" },
{ status: 400 }
);
}

if (status === "paid" || status === "success") {
// هنا يتم تحديث قاعدة البيانات لديك لزيادة رصيد الشريك (Business Credit)
// مثال: await db.partners.incrementCredit(partnerId, amount);

console.log(`Successfully credited $${amount} to Partner: ${partnerId} (Tx: ${transactionId})`);

return NextResponse.json({
success: true,
message: `Partner ${partnerId} credited with $${amount} successfully.`,
});
}

return NextResponse.json({
success: false,
message: "Payment status is not verified or failed.",
}, { status: 400 });

} catch (error: any) {
return NextResponse.json(
{ success: false, error: error.message || "Internal server error" },
{ status: 500 }
);
}
}

