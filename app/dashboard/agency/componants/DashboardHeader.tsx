"use client";

import React, { useState } from "react";

type PartnerType = string;

type DashboardHeaderProps = {
partnerName?: string;
partnerCode?: string;
partnerType?: PartnerType;
};

export default function DashboardHeader({
partnerName = "AROVIX Partner",
partnerCode = "ARV-PARTNER-001",
partnerType = "Business Partner",
}: DashboardHeaderProps) {
const [isNotificationsOpen, setIsNotificationsOpen] =
useState(false);

const [notifications, setNotifications] = useState([
{
id: 1,
title: "Business Credit Updated",
desc: "Your prepaid business credit balance has been updated.",
time: "10m ago",
unread: true,
},
{
id: 2,
title: "eSIM Successfully Issued",
desc: "A customer eSIM order has been completed successfully.",
time: "1h ago",
unread: true,
},
{
id: 3,
title: "New Plans Added",
desc: "New eSIM destinations and bundles are now available.",
time: "1d ago",
unread: false,
},
{
id: 4,
title: "System Maintenance",
desc: "API optimization scheduled by AROVIX technical team.",
time: "2d ago",
unread: false,
},
]);

const unreadCount = notifications.filter(
(item) => item.unread
).length;

const markAllAsRead = () => {
setNotifications((previous) =>
previous.map((item) => ({
...item,
unread: false,
}))
);
};

return (
<div
className="
bg-gradient-to-r
from-[#0c0f1d]
to-[#12172e]
border
border-white/10
rounded-2xl
p-6
shadow-xl
flex
flex-col
md:flex-row
justify-between
items-start
md:items-center
gap-4
relative
"
>
{/* ================================================== */}
{/* PARTNER INFORMATION */}
{/* ================================================== */}

<div className="space-y-2">
<div className="flex items-center gap-2 flex-wrap">
<span
className="
px-2.5
py-0.5
rounded-full
bg-blue-500/10
text-[#31dfff]
border
border-blue-500/20
text-xs
font-mono
uppercase
"
>
AROVIX GLOBAL PARTNER NETWORK
</span>

<span
className="
text-xs
font-mono
text-slate-400
"
>
ID: {partnerCode}
</span>

<span
className="
text-xs
font-mono
text-emerald-400
border
border-emerald-500/20
px-2
py-0.5
rounded-full
"
>
{partnerType}
</span>
</div>

{/* Dynamic dashboard title */}

<h1
className="
text-2xl
lg:text-3xl
font-extrabold
tracking-tight
text-white
"
>
{partnerType}

<span className="text-[#31dfff]">
{" "}
Dashboard
</span>
</h1>

{/* Dynamic partner name */}

<p
className="
text-xs
lg:text-sm
text-slate-400
"
>
Welcome back,

<span className="text-white font-semibold">
{" "}
{partnerName}
</span>

. Manage your eSIM distribution, credit balance
and business performance.
</p>
</div>

{/* ================================================== */}
{/* RIGHT SECTION */}
{/* ================================================== */}

<div className="flex items-center gap-3">
{/* ================================================== */}
{/* NOTIFICATIONS */}
{/* ================================================== */}

<div className="relative">
<button
type="button"
onClick={() =>
setIsNotificationsOpen(
(previous) => !previous
)
}
className="
relative
p-3
bg-[#070812]
border
border-white/10
hover:border-blue-500/50
rounded-xl
text-slate-300
hover:text-white
"
>
🔔

{unreadCount > 0 && (
<span
className="
absolute
-top-1
-right-1
w-5
h-5
bg-blue-500
text-white
font-bold
text-[10px]
rounded-full
flex
items-center
justify-center
"
>
{unreadCount}
</span>
)}
</button>

{isNotificationsOpen && (
<div
className="
absolute
right-0
mt-3
w-80
sm:w-96
bg-[#0c0f1d]
border
border-white/15
rounded-2xl
shadow-2xl
p-4
z-50
"
>
<div
className="
flex
justify-between
border-b
border-white/10
pb-3
mb-3
"
>
<span
className="
text-xs
font-bold
text-white
font-mono
"
>
Notifications Center
</span>

<button
type="button"
onClick={markAllAsRead}
className="
text-[10px]
text-[#31dfff]
"
>
Mark all as read
</button>
</div>

<div
className="
space-y-2
max-h-72
overflow-y-auto
"
>
{notifications.map((item) => (
<div
key={item.id}
className="
p-3
rounded-xl
border
bg-[#070812]
border-white/5
"
>
<div className="flex justify-between">
<h4
className="
text-xs
font-bold
text-white
"
>
{item.title}
</h4>

<span
className="
text-[10px]
text-slate-400
"
>
{item.time}
</span>
</div>

<p
className="
text-[11px]
text-slate-400
mt-1
"
>
{item.desc}
</p>
</div>
))}
</div>
</div>
)}
</div>

{/* ================================================== */}
{/* SYSTEM STATUS */}
{/* ================================================== */}

<div
className="
flex
items-center
gap-3
bg-[#070812]
border
border-white/10
px-4
py-3
rounded-xl
"
>
<div
className="
w-3
h-3
rounded-full
bg-emerald-500
animate-pulse
"
/>

<div>
<div
className="
text-[10px]
font-mono
text-slate-400
uppercase
"
>
System Status
</div>

<div
className="
text-xs
font-bold
text-emerald-400
font-mono
"
>
API Connected & Active
</div>
</div>
</div>
</div>
</div>
);
}
