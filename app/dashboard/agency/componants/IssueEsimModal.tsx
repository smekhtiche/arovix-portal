"use client";

import React, { useState } from "react";

type IssueEsimModalProps = {
onClose: () => void;
onSuccessAction: (apiData: any, packagePrice: number) => void;
partnerBalance: number;
partnerId: string;
};

const SAMPLE_PACKAGES = [
{ id: "p1", name: "France (3GB - 30 Days)", price: 15 },
];

export default function IssueEsimModal({
onClose,
onSuccessAction,
partnerBalance,
}: IssueEsimModalProps) {
const [selectedPackage] = useState(SAMPLE_PACKAGES[0]);

return (
<div className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-50 font-mono text-white">
<div className="bg-red-600 border-4 border-yellow-300 rounded-3xl p-10 max-w-lg w-full text-center">
<h1 className="text-3xl font-black text-white mb-4">
🔥 TEST VERSION 99 🔥
</h1>
<p className="text-white mb-6">If you can see this, this file IS loading correctly.</p>
<button
onClick={onClose}
className="px-6 py-3 bg-white text-black font-bold rounded-xl"
>
Close
</button>
</div>
</div>
);
}

