"use client";

import { useState } from "react";
import { inviteUserAction } from "@/app/actions/auth-actions";

export default function InviteModal() {
const [isOpen, setIsOpen] = useState(false);
const [email, setEmail] = useState("");
const [role, setRole] =
useState<"agent" | "partner">("agent");
const [loading, setLoading] = useState(false);
const [message, setMessage] = useState("");

const handleInvite = async (
e: React.FormEvent
) => {
e.preventDefault();

setLoading(true);
setMessage("");

try {
/*
--------------------------------------------------------
PARTNER → agency
AGENT → agent

Keep the existing auth-actions contract.
--------------------------------------------------------
*/

const selectedRole =
role === "partner"
? "agency"
: "agent";

const res =
await inviteUserAction(
email.trim().toLowerCase(),
selectedRole,
{}
);

if (res.success) {
setMessage(
"Invitation sent successfully!"
);

setEmail("");
} else {
setMessage(
`Error: ${res.error}`
);
}
} catch (error: any) {
console.error(
"Invitation error:",
error
);

setMessage(
`Error: ${
error?.message ||
"Failed to send invitation."
}`
);
} finally {
setLoading(false);
}
};

return (
<div>
{/* Trigger Button */}

<button
onClick={() =>
setIsOpen(true)
}
className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition"
>
+ Invite New User
</button>

{/* Modal */}

{isOpen && (
<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">

<div className="bg-white p-6 rounded-lg w-96 shadow-xl relative text-black">

<h3 className="text-lg font-bold mb-4">
Send New Invitation
</h3>

<form
onSubmit={
handleInvite
}
className="space-y-4"
>

{/* Email */}

<div>
<label className="block text-sm font-medium mb-1">
Email Address
</label>

<input
type="email"
required
value={email}
onChange={(e) =>
setEmail(
e.target.value
)
}
className="w-full border rounded p-2 text-sm"
placeholder="name@example.com"
disabled={loading}
/>
</div>

{/* Role */}

<div>
<label className="block text-sm font-medium mb-1">
Role
</label>

<select
value={role}
onChange={(e) =>
setRole(
e.target.value as
| "agent"
| "partner"
)
}
className="w-full border rounded p-2 text-sm"
disabled={loading}
>
<option value="agent">
Agent
</option>

<option value="partner">
Partner
</option>
</select>
</div>

{/* Message */}

{message && (
<p
className={`text-xs ${
message.includes(
"successfully"
)
? "text-green-600"
: "text-red-600"
}`}
>
{message}
</p>
)}

{/* Buttons */}

<div className="flex justify-end space-x-2 space-x-reverse pt-2">

<button
type="button"
onClick={() => {
setIsOpen(false);
setMessage("");
}}
disabled={loading}
className="bg-gray-300 text-gray-800 px-3 py-1.5 rounded text-sm disabled:opacity-50"
>
Cancel
</button>

<button
type="submit"
disabled={
loading ||
!email.trim()
}
className="bg-blue-600 text-white px-3 py-1.5 rounded text-sm hover:bg-blue-700 disabled:opacity-50"
>
{loading
? "Sending..."
: "Send Invite"}
</button>

</div>

</form>

</div>

</div>
)}
</div>
);
}
