import { NextResponse } from "next/server";

export async function POST(request: Request) {
try {
const body = await request.json();

return NextResponse.json({
success: true,
message: "Shopify draft payment endpoint is ready.",
data: body,
});
} catch (error) {
console.error("Shopify draft payment error:", error);

return NextResponse.json(
{
success: false,
error: "Invalid request body",
},
{
status: 400,
}
);
}
}
