import { NextResponse } from "next/server";

export async function POST(request: Request) {
try {
const body = await request.json();

const {
shopId,
sku,
quantity,
customerEmail,
orderId
} = body;

if (!shopId || !sku) {
return NextResponse.json(
{
success: false,
error: "Missing shopId or sku"
},
{ status: 400 }
);
}

const workflowUrl =
process.env.PARTNER_WORKFLOW_URL!;

const workflowResponse = await fetch(workflowUrl, {
method: "POST",
headers: {
"Content-Type": "application/json"
},
body: JSON.stringify({
shopId,
sku,
quantity,
customerEmail,
orderId
})
});

const workflowData = await workflowResponse.json();

return NextResponse.json(workflowData);

} catch (error: any) {
return NextResponse.json(
{
success: false,
error: error.message
},
{ status: 500 }
);
}
}

