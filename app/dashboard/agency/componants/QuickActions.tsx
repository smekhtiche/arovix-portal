"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { PAYMENT_CONFIG } from "./paymentConfig";

type QuickActionsProps = {
partnerId: string;
shopId: string;
partnerName: string;
partnerEmail?: string | null;
partnerBalance?: number;
onIssueSuccess: (
apiData: any,
packagePrice: number,
backendRemainingBalance?: number
) => void;
};

const APPROVED_REGIONS = [
"Europe",
"Middle East",
"North America",
"North Africa",
"Africa",
"Asia",
"Global",
];

const ALLOWED_GB_SIZES = [
1,
2,
3,
5,
10,
20,
50,
100,
];

const ALLOWED_DURATIONS = [7, 15, 30];

const INVALID_DESTINATIONS = new Set([
"Africa",
"Europe",
"Europe Light",
"Europe Extra",
"Middle East",
"North America",
"North Africa",
"Asia",
"Global",
]);

const REGION_OVERRIDES: Record<string, string> = {
Turkey: "Europe",
Türkiye: "Europe",
Egypt: "Middle East",
"Egypt (Arab Republic of)": "Middle East",
Cyprus: "Middle East",
};

type CatalogPackage = {
sku: string;
name: string;
description: string;
country: string;
region: string;
iso: string;
data_amount_mb: number;
data_gb: number;
true_cost: number;
retail_price: number;
duration: number;
};

const ESIMGO_EXTRA_RATE = 0.20;
const OPERATING_COST_RATE = 0.05;
const BASE_MARGIN = 0.58;
const LARGE_PLAN_THRESHOLD = 20;
const LARGE_PLAN_EXTRA_MARGIN = 0.10;

function normalizeCountryName(country: string): string {
return country.trim();
}

function normalizeRegion(
country: string,
catalogueRegion: string
): string {
const cleanCountry = normalizeCountryName(country);

if (REGION_OVERRIDES[cleanCountry]) {
return REGION_OVERRIDES[cleanCountry];
}

return catalogueRegion;
}

function isValidDestination(
country: string,
region: string
): boolean {
const cleanCountry = normalizeCountryName(country);

if (!cleanCountry) return false;

if (INVALID_DESTINATIONS.has(cleanCountry)) {
return false;
}

if (
cleanCountry.toLowerCase() ===
region.toLowerCase()
) {
return false;
}

return true;
}

export default function QuickActions({
partnerId,
shopId,
partnerName,
partnerEmail = null,
partnerBalance = 0,
onIssueSuccess,
}: QuickActionsProps) {
const [isIssueOpen, setIsIssueOpen] =
useState(false);

const [isTopUpOpen, setIsTopUpOpen] =
useState(false);

const [isSupportOpen, setIsSupportOpen] =
useState(false);

const [catalogPackages, setCatalogPackages] =
useState<CatalogPackage[]>([]);

const [isCatalogLoading, setIsCatalogLoading] =
useState(false);

const [selectedRegion, setSelectedRegion] =
useState("Europe");

const [selectedCountry, setSelectedCountry] =
useState("");

const [countrySearch, setCountrySearch] =
useState("");

const [selectedPackageSku, setSelectedPackageSku] =
useState("");

const [clientName, setClientName] =
useState("");

const [clientEmail, setClientEmail] =
useState("");

const [selectedCatalogItem, setSelectedCatalogItem] =
useState<CatalogPackage | null>(null);

const [creditLedger, setCreditLedger] =
useState([
{
date: new Date().toLocaleDateString(
"en-GB",
{
day: "2-digit",
month: "short",
year: "numeric",
}
),
type: "Initial",
desc: "Account Created",
amount: 0,
balance: partnerBalance,
},
]);

const [isProcessing, setIsProcessing] =
useState(false);

const [progressStep, setProgressStep] =
useState("");

const [esimResult, setEsimResult] =
useState<any | null>(null);

const minTopupValue =
PAYMENT_CONFIG.minTopupAmount;

const [topUpAmount, setTopUpAmount] =
useState(
minTopupValue.toString()
);

const [paymentMethod, setPaymentMethod] =
useState("card");

const [selectedCurrency, setSelectedCurrency] =
useState(
PAYMENT_CONFIG.defaultCurrency
);

/*
============================================================
LOAD LIVE CATALOG
============================================================
*/

useEffect(() => {
const loadCatalog = async () => {
try {
setIsCatalogLoading(true);

const response = await fetch(
"https://arovix-esim.app.n8n.cloud/webhook/catalog",
{
method: "GET",
cache: "no-store",
}
);

if (!response.ok) {
throw new Error(
`Catalog request failed with HTTP ${response.status}`
);
}

const rawData =
await response.json();

const itemsArray: any[] =
Array.isArray(rawData)
? rawData
: Array.isArray(
rawData?.catalog
)
? rawData.catalog
: Array.isArray(
rawData?.data
)
? rawData.data
: Array.isArray(
rawData?.items
)
? rawData.items
: [];

const parsedList =
itemsArray
.map((item: any) => {
try {
if (!item) return null;

let json: any = item;

if (item.data) {
json =
typeof item.data ===
"string"
? JSON.parse(
item.data
)
: item.data;
}

if (!json) return null;

const sku =
item.sku ||
json.sku ||
json.name ||
"";

if (!sku) return null;

const countryObj =
Array.isArray(
json.countries
) &&
json.countries.length >
0
? json.countries[0]
: null;

const countryName =
countryObj?.name ||
json.country ||
"";

if (!countryName)
return null;

const rawRegion =
countryObj?.region ||
json.region ||
"";

const regionName =
normalizeRegion(
countryName,
rawRegion
);

if (
!APPROVED_REGIONS.includes(
regionName
)
) {
return null;
}

if (
!isValidDestination(
countryName,
regionName
)
) {
return null;
}

const rawDataAmount =
Number(
json.dataAmount ??
json.data_amount ??
json.data_amount_mb ??
0
);

if (
!rawDataAmount ||
rawDataAmount <= 0
) {
return null;
}

let dataGB =
rawDataAmount /
1000;

if (
rawDataAmount <= 100 &&
!json.dataAmount &&
!json.data_amount &&
!json.data_amount_mb
) {
dataGB =
rawDataAmount;
}

const roundedGB =
Math.round(dataGB);

if (
!ALLOWED_GB_SIZES.includes(
roundedGB
)
) {
return null;
}

const duration =
Number(
json.duration ||
json.durationDays ||
json.validity ||
0
);

if (
!ALLOWED_DURATIONS.includes(
duration
)
) {
return null;
}

const esimGoCost =
Number(
json.price ??
json.cost_price ??
json.esim_go_cost ??
0
);

if (
!Number.isFinite(
esimGoCost
) ||
esimGoCost <= 0
) {
return null;
}

const realCostAfter20 =
esimGoCost *
(1 +
ESIMGO_EXTRA_RATE);

const operatingCost =
realCostAfter20 *
OPERATING_COST_RATE;

const trueCost =
realCostAfter20 +
operatingCost;

let margin =
BASE_MARGIN;

if (
roundedGB >=
LARGE_PLAN_THRESHOLD
) {
margin +=
LARGE_PLAN_EXTRA_MARGIN;
}

const retailPrice =
Number(
(
trueCost /
(1 - margin)
).toFixed(2)
);

return {
sku,
name:
json.name ||
sku,
description:
json.description ||
"",
country:
normalizeCountryName(
countryName
),
region:
regionName,
iso:
countryObj?.iso ||
json.iso ||
"",
data_amount_mb:
rawDataAmount,
data_gb:
roundedGB,
true_cost:
Number(
trueCost.toFixed(
2
)
),
retail_price:
retailPrice,
duration,
};
} catch (error) {
console.error(
"CATALOG PARSE ERROR:",
error
);

return null;
}
})
.filter(
(
item
): item is CatalogPackage =>
item !== null
);

const uniquePackages =
Array.from(
new Map(
parsedList.map(
(item) => [
item.sku,
item,
]
)
).values()
);

setCatalogPackages(
uniquePackages
);

const europeCountries =
Array.from(
new Set(
uniquePackages
.filter(
(item) =>
item.region ===
"Europe" &&
item.country
)
.map(
(item) =>
item.country
)
)
).sort();

if (
europeCountries.length >
0
) {
const firstCountry =
europeCountries[0];

setSelectedCountry(
firstCountry
);

const packages =
uniquePackages
.filter(
(item) =>
item.region ===
"Europe" &&
item.country ===
firstCountry
)
.sort((a, b) => {
if (
a.data_gb !==
b.data_gb
) {
return (
a.data_gb -
b.data_gb
);
}

return (
a.duration -
b.duration
);
});

if (
packages.length > 0
) {
setSelectedPackageSku(
packages[0].sku
);

setSelectedCatalogItem(
packages[0]
);
}
}
} catch (error) {
console.error(
"CATALOG FETCH ERROR:",
error
);

setCatalogPackages([]);
} finally {
setIsCatalogLoading(
false
);
}
};

loadCatalog();
}, []);

/*
============================================================
COUNTRY / PACKAGE HELPERS
============================================================
*/

const allCountries = useMemo(() => {
return Array.from(
new Set(
catalogPackages
.filter((item) =>
isValidDestination(
item.country,
item.region
)
)
.map(
(item) =>
item.country
)
)
).sort();
}, [catalogPackages]);

const getCountriesForRegion = (
region: string
) => {
return Array.from(
new Set(
catalogPackages
.filter(
(item) =>
item.region ===
region &&
isValidDestination(
item.country,
item.region
)
)
.map(
(item) =>
item.country
)
)
).sort();
};

const searchedCountries =
useMemo(() => {
const search =
countrySearch
.trim()
.toLowerCase();

if (!search) return [];

return allCountries.filter(
(country) =>
country
.toLowerCase()
.includes(search)
);
}, [
countrySearch,
allCountries,
]);

const getPackagesForCountry = (
country: string
) => {
return catalogPackages
.filter(
(item) =>
item.country ===
country &&
item.sku
)
.sort((a, b) => {
if (
a.data_gb !==
b.data_gb
) {
return (
a.data_gb -
b.data_gb
);
}

return (
a.duration -
b.duration
);
});
};

const selectCountry = (
country: string
) => {
const countryPackages =
getPackagesForCountry(
country
);

if (
countryPackages.length ===
0
) {
setSelectedCountry(
country
);
setSelectedPackageSku(
""
);
setSelectedCatalogItem(
null
);
return;
}

const firstPackage =
countryPackages[0];

setSelectedRegion(
firstPackage.region
);

setSelectedCountry(
country
);

setSelectedPackageSku(
firstPackage.sku
);

setSelectedCatalogItem(
firstPackage
);

setCountrySearch(
country
);
};

const handleRegionChange = (
newRegion: string
) => {
setSelectedRegion(
newRegion
);

setCountrySearch("");

const countries =
getCountriesForRegion(
newRegion
);

if (
countries.length > 0
) {
selectCountry(
countries[0]
);
} else {
setSelectedCountry(
""
);
setSelectedPackageSku(
""
);
setSelectedCatalogItem(
null
);
}
};

const handleCountryChange = (
country: string
) => {
if (!country) {
setSelectedCountry(
""
);
setSelectedPackageSku(
""
);
setSelectedCatalogItem(
null
);
return;
}

selectCountry(country);
};

const handlePackageChange = (
sku: string
) => {
setSelectedPackageSku(
sku
);

const selected =
catalogPackages.find(
(item) =>
item.sku === sku
);

setSelectedCatalogItem(
selected || null
);

if (selected) {
setSelectedCountry(
selected.country
);

setSelectedRegion(
selected.region
);
}
};

/*
============================================================
TOP-UP
============================================================
*/

const handleTopUpRequest =
async () => {
const amount =
Number(topUpAmount);

if (
!amount ||
amount < minTopupValue
) {
alert(
`Minimum top-up amount is ${selectedCurrency} ${minTopupValue}`
);
return;
}

if (
paymentMethod ===
"card"
) {
try {
setIsTopUpOpen(
false
);

const response =
await fetch(
`https://arovix-esim.app.n8n.cloud${PAYMENT_CONFIG.endpoints.topUp}`,
{
method:
"POST",
headers: {
"Content-Type":
"application/json",
},
body: JSON.stringify(
{
partnerId,
shopId,
partnerName,
partnerEmail,
amount,
paymentMethod:
"Credit / Debit Card",
currency:
selectedCurrency,
email:
partnerEmail,
}
),
}
);

if (!response.ok) {
throw new Error(
`Top-up request failed with HTTP ${response.status}`
);
}

const data =
await response.json();

console.log("TOP-UP CHECKOUT RESPONSE:", data);

if (
data.success &&
data.checkout_url
) {
window.location.href =
data.checkout_url;
return;
}

throw new Error(
"Checkout URL missing"
);
} catch (error: any) {
console.error(
"Top-Up Error:",
error
);

alert(
error?.message ||
"Unable to create checkout"
);
}
} else {
alert(
`Your request for ${selectedCurrency} ${amount} via ${paymentMethod} has been registered.`
);

setIsTopUpOpen(
false
);
}
};

/*
============================================================
ISSUE eSIM
============================================================
*/

const handleIssueESIM =
async () => {
if (
!selectedCatalogItem
) {
alert(
"Please select a valid eSIM package."
);
return;
}

if (!clientEmail) {
alert(
"Client email is required."
);
return;
}

if (!partnerId) {
alert(
"Partner account is not connected."
);
return;
}

if (!shopId) {
alert(
"Business Shop account is not connected."
);
return;
}

const packagePrice =
Number(
selectedCatalogItem.retail_price
);

if (
!Number.isFinite(
packagePrice
) ||
packagePrice <= 0
) {
alert(
"Invalid package price."
);
return;
}

if (
Number(partnerBalance) <
packagePrice
) {
alert(
"Insufficient business credit! Please top-up your account first."
);
return;
}

try {
setIsProcessing(
true
);

setProgressStep(
"Sending eSIM request..."
);

const requestPayload =
{
partnerId,
shopId,
partnerName,
partnerEmail,

clientName,
clientEmail,

country:
selectedCatalogItem.country,

region:
selectedCatalogItem.region,

iso:
selectedCatalogItem.iso,

sku:
selectedCatalogItem.sku,

package:
selectedCatalogItem.name,

retailPrice:
packagePrice,

trueCost:
selectedCatalogItem.true_cost,

timestamp:
new Date().toISOString(),
};

console.log(
"AROVIX LIVE PARTNER ISSUE REQUEST:",
requestPayload
);

const response =
await fetch(
"https://arovix-esim.app.n8n.cloud/webhook/partner/issue-esim",
{
method:
"POST",

headers: {
"Content-Type":
"application/json",
},

body:
JSON.stringify(
requestPayload
),
}
);

if (!response.ok) {
throw new Error(
`Issue eSIM failed with HTTP ${response.status}`
);
}

const data =
await response.json();

console.log(
"AROVIX LIVE ISSUE eSIM RESPONSE:",
data
);

if (
!data ||
data.success !== true
) {
throw new Error(
data?.message ||
data?.error ||
"eSIM issuing failed"
);
}

const backendRemainingBalanceRaw =
data?.remainingBalance ??
data?.businessCredit ??
data?.balance ??
data?.shopBalance ??
data?.shop?.businessCredit ??
data?.shop?.balance ??
data?.businessShop?.businessCredit ??
data?.businessShop?.balance ??
data?.data?.remainingBalance ??
data?.data?.businessCredit ??
data?.data?.balance ??
null;

const backendRemainingBalance =
Number(
backendRemainingBalanceRaw
);

const hasBackendBalance =
Number.isFinite(
backendRemainingBalance
);

const orderNumber =
data?.orderNumber ||
data?.orderId ||
data?.orderReference ||
data?.order?.orderNumber ||
data?.order?.orderId ||
data?.order?.[0]
?.orderNumber ||
data?.order?.[0]
?.orderId ||
"";

const iccid =
data?.iccid ||
data?.order?.[0]
?.esims?.[0]
?.iccid ||
data?.esim?.iccid ||
"";

const matchingId =
data?.matchingId ||
data?.lpaCode ||
data?.order?.[0]
?.esims?.[0]
?.matchingId ||
data?.esim?.matchingId ||
"";

const smdpAddress =
data?.smdpAddress ||
data?.order?.[0]
?.esims?.[0]
?.smdpAddress ||
data?.esim?.smdpAddress ||
"";

const qrCodeUrl =
data?.qrCodeUrl ||
data?.qr_code_url ||
data?.order?.[0]
?.esims?.[0]
?.qrCodeUrl ||
data?.esim?.qrCodeUrl ||
"";

const transactionId =
data?.transactionId ||
data?.transactionReference ||
data?.transaction?.id ||
data?.transaction?.reference ||
"";

const displayRemainingBalance =
hasBackendBalance
? Number(
backendRemainingBalance.toFixed(
2
)
)
: Number(
partnerBalance
);

setProgressStep(
"eSIM issued successfully"
);

const newEsimResult =
{
status:
"SUCCESS",

orderId:
orderNumber ||
"—",

iccid:
iccid ||
"—",

lpaCode:
matchingId ||
"—",

smdpAddress:
smdpAddress ||
"",

qrCodeUrl:
qrCodeUrl ||
"",

sku:
data?.sku ||
selectedCatalogItem.sku,

paidAmount:
packagePrice,

remainingBalance:
displayRemainingBalance,

transactionId:
transactionId ||
"",
};

onIssueSuccess(
{
...data,

orderNumber:
orderNumber,

orderId:
orderNumber,

customerName:
data?.customerName ||
clientName ||
"Customer",

package:
data?.package ||
selectedCatalogItem.name,

packageName:
data?.packageName ||
selectedCatalogItem.name,

iccid:
iccid,

matchingId:
matchingId,

lpaCode:
matchingId,

smdpAddress:
smdpAddress,

qrCodeUrl:
qrCodeUrl,

transactionId:
transactionId,

remainingBalance:
hasBackendBalance
? backendRemainingBalance
: undefined,

businessCredit:
hasBackendBalance
? backendRemainingBalance
: undefined,

balance:
hasBackendBalance
? backendRemainingBalance
: undefined,
},
packagePrice,
hasBackendBalance
? backendRemainingBalance
: undefined
);

const newLedgerItem =
{
date:
new Date().toLocaleDateString(
"en-GB",
{
day:
"2-digit",
month:
"short",
year:
"numeric",
}
),

type:
"eSIM Sale",

desc: `${selectedCatalogItem.country} (${selectedCatalogItem.data_gb}GB / ${selectedCatalogItem.duration} Days)`,

amount:
-packagePrice,

balance:
displayRemainingBalance,
};

setCreditLedger(
(previous) => [
newLedgerItem,
...previous,
]
);

setEsimResult(
newEsimResult
);
} catch (error: any) {
console.error(
"Issue eSIM Error:",
error
);

alert(
error?.message ||
"Unable to issue eSIM"
);
} finally {
setIsProcessing(
false
);

setProgressStep(
""
);
}
};

/*
============================================================
WHATSAPP / PAYMENT DETAILS
============================================================
*/

const whatsappUrl =
`https://wa.me/447575382036?text=${encodeURIComponent(
`Hello Arovix Support, I am partner ${partnerId} (Shop ${shopId}, ${partnerName}). I would like to confirm a ${paymentMethod} deposit request of ${topUpAmount} ${selectedCurrency}.`
)}`;

const currentBankDetails =
(
PAYMENT_CONFIG
.accounts
.bankWire as Record<
string,
any
>
)[selectedCurrency] ||
PAYMENT_CONFIG.accounts
.bankWire.USD;

const cryptoNetwork =
PAYMENT_CONFIG.accounts
.crypto.networks[0];

/*
============================================================
UI
============================================================
*/

return (
<>
{/* QUICK ACTIONS */}

<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 relative">

{/* ISSUE eSIM */}

<div
onClick={() => {
setEsimResult(null);
setClientName("");
setClientEmail("");
setCountrySearch("");
setIsIssueOpen(true);
}}
className="group relative bg-gradient-to-br from-[#070812] to-[#0c0f1d] border border-white/10 hover:border-blue-500/50 rounded-2xl p-5 shadow-xl transition cursor-pointer"
>
<div className="text-3xl mb-3">
⚡
</div>

<h4 className="text-white font-bold">
Issue eSIM
</h4>

<p className="text-xs text-slate-400">
Generate and issue eSIM instantly.
</p>
</div>

{/* TOP-UP */}

<div
onClick={() =>
setIsTopUpOpen(true)
}
className="group relative bg-gradient-to-br from-[#070812] to-[#0c0f1d] border border-white/10 hover:border-emerald-500/50 rounded-2xl p-5 shadow-xl transition cursor-pointer"
>
<div className="text-3xl mb-3">
💳
</div>

<h4 className="text-white font-bold">
Top-Up Credit
</h4>

<p className="text-xs text-slate-400">
Add business credit balance.
</p>
</div>

{/* SALES */}

<Link
href="/dashboard/agency/sales"
className="group relative bg-gradient-to-br from-[#070812] to-[#0c0f1d] border border-white/10 rounded-2xl p-5 shadow-xl"
>
<div className="text-3xl mb-3">
📊
</div>

<h4 className="text-white font-bold">
Sales Reports
</h4>

<p className="text-xs text-slate-400">
View sales history.
</p>
</Link>

{/* SUPPORT */}

<div
onClick={() =>
setIsSupportOpen(true)
}
className="group relative bg-gradient-to-br from-[#070812] to-[#0c0f1d] border border-white/10 rounded-2xl p-5 shadow-xl cursor-pointer"
>
<div className="text-3xl mb-3">
🎧
</div>

<h4 className="text-white font-bold">
Agency Support
</h4>

<p className="text-xs text-slate-400">
Contact support.
</p>
</div>
</div>

{/* ISSUE ESIM MODAL */}

{isIssueOpen && (
<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
<div className="bg-[#0c0f1d] border border-white/10 rounded-2xl max-w-lg w-full max-h-[95vh] flex flex-col text-white">

<div className="flex justify-between items-center p-6 pb-4 border-b border-white/10 shrink-0">
<div>
<h3 className="text-lg font-bold text-[#31dfff]">
⚡ Issue eSIM
</h3>

<p className="text-[10px] text-slate-500 mt-1">
Shop: {shopId || "Not connected"}
</p>
</div>

<span className="text-xs text-emerald-400">
Balance $
{Number(
partnerBalance
).toFixed(2)}
</span>
</div>

{isCatalogLoading ? (
<div className="text-center py-10 text-[#31dfff]">
Loading live catalog...
</div>
) : (
<div className="overflow-y-auto px-6 py-4 space-y-4">

<input
value={
clientName
}
onChange={(e) =>
setClientName(
e.target.value
)
}
placeholder="Client Name"
className="w-full bg-[#070812] border border-white/10 rounded-xl px-4 py-2 text-white placeholder:text-slate-500 outline-none focus:border-[#31dfff]"
/>

<input
value={
clientEmail
}
onChange={(e) =>
setClientEmail(
e.target.value
)
}
placeholder="Client Email"
type="email"
className="w-full bg-[#070812] border border-white/10 rounded-xl px-4 py-2 text-white placeholder:text-slate-500 outline-none focus:border-[#31dfff]"
/>

<div>
<label className="text-xs text-slate-400 block mb-1">
Search Destination
</label>

<input
value={
countrySearch
}
onChange={(e) => {
const value =
e.target
.value;

setCountrySearch(
value
);

const exact =
allCountries.find(
(
country
) =>
country
.toLowerCase() ===
value
.trim()
.toLowerCase()
);

if (exact) {
selectCountry(
exact
);
}
}}
placeholder="Search country e.g. France, Turkey, Egypt..."
className="w-full bg-[#070812] border border-white/10 rounded-xl px-4 py-2 text-white placeholder:text-slate-500 outline-none focus:border-[#31dfff]"
/>

{countrySearch.trim() &&
searchedCountries.length >
0 && (
<div className="mt-2 max-h-40 overflow-y-auto bg-[#070812] border border-white/10 rounded-xl">
{searchedCountries.map(
(
country
) => (
<button
type="button"
key={
country
}
onClick={() =>
selectCountry(
country
)
}
className="w-full text-left px-4 py-2 text-sm text-white hover:bg-white/10 transition"
>
{
country
}
</button>
)
)}
</div>
)}

{countrySearch.trim() &&
searchedCountries.length ===
0 && (
<p className="text-xs text-red-400 mt-2">
No destination found.
</p>
)}
</div>

<div>
<label className="text-xs text-slate-400 block mb-1">
Region
</label>

<select
value={
selectedRegion
}
onChange={(e) =>
handleRegionChange(
e.target
.value
)
}
className="w-full bg-[#070812] border border-white/10 rounded-xl px-4 py-2 text-white outline-none focus:border-[#31dfff]"
>
{APPROVED_REGIONS.map(
(
region
) => (
<option
key={
region
}
value={
region
}
className="bg-[#070812] text-white"
>
{
region
}
</option>
)
)}
</select>
</div>

<div>
<label className="text-xs text-slate-400 block mb-1">
Country / Destination
</label>

<select
value={
selectedCountry
}
onChange={(e) =>
handleCountryChange(
e.target
.value
)
}
className="w-full bg-[#070812] border border-white/10 rounded-xl px-4 py-2 text-white outline-none focus:border-[#31dfff]"
>
<option
value=""
className="bg-[#070812] text-white"
>
Select Destination
</option>

{getCountriesForRegion(
selectedRegion
).map(
(
country
) => (
<option
key={
country
}
value={
country
}
className="bg-[#070812] text-white"
>
{
country
}
</option>
)
)}
</select>
</div>

<div>
<label className="text-xs text-slate-400 block mb-1">
Select Package
</label>

<select
value={
selectedPackageSku
}
onChange={(e) =>
handlePackageChange(
e.target
.value
)
}
className="w-full bg-[#070812] border border-white/10 rounded-xl px-4 py-2 text-white outline-none focus:border-[#31dfff]"
>
<option
value=""
className="bg-[#070812] text-white"
>
Select Package
</option>

{getPackagesForCountry(
selectedCountry
).map(
(
pkg
) => (
<option
key={
pkg.sku
}
value={
pkg.sku
}
className="bg-[#070812] text-white"
>
{
pkg.data_gb
}{" "}
GB —{" "}
{
pkg.duration
}{" "}
Days — $
{pkg.retail_price.toFixed(
2
)}
</option>
)
)}
</select>
</div>

{selectedCatalogItem && (
<div className="bg-[#070812] border border-white/5 rounded-xl p-3 text-xs space-y-2">
<div className="flex justify-between">
<span className="text-slate-400">
Destination:
</span>

<span className="text-white">
{
selectedCatalogItem.country
}
</span>
</div>

<div className="flex justify-between">
<span className="text-slate-400">
Region:
</span>

<span className="text-white">
{
selectedCatalogItem.region
}
</span>
</div>

<div className="flex justify-between">
<span className="text-slate-400">
Package:
</span>

<span className="text-white">
{
selectedCatalogItem.data_gb
}{" "}
GB /{" "}
{
selectedCatalogItem.duration
}{" "}
Days
</span>
</div>

<div className="flex justify-between">
<span className="text-slate-400">
Retail Price:
</span>

<span className="text-emerald-400 font-bold">
$
{selectedCatalogItem.retail_price.toFixed(
2
)}
</span>
</div>
</div>
)}
</div>
)}

{!isCatalogLoading && (
<div className="p-4 border-t border-white/10 shrink-0 bg-[#0c0f1d]">
<div className="flex gap-3">

<button
onClick={handleIssueESIM}
disabled={isProcessing}
className="flex-1 py-2.5 bg-gradient-to-r from-[#31dfff] to-blue-600 text-black font-bold rounded-xl disabled:opacity-40 disabled:cursor-not-allowed"
>
{isProcessing
? progressStep || "Processing..."
: "Generate & Issue"}
</button>

<button
onClick={() =>
setIsIssueOpen(
false
)
}
disabled={
isProcessing
}
className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 disabled:opacity-40"
>
Cancel
</button>

</div>
</div>
)}
</div>
</div>
)}

{/* TOP UP MODAL */}

{isTopUpOpen && (
<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
<div className="bg-[#0c0f1d] border border-white/10 rounded-2xl max-w-lg w-full p-6 text-white space-y-4">

<div className="flex justify-between items-center">
<h3 className="text-lg font-bold text-emerald-400">
💳 Top-Up Business Credit
</h3>

<button
onClick={() =>
setIsTopUpOpen(
false
)
}
className="text-slate-400 hover:text-white"
>
✕
</button>
</div>

<div>
<label className="text-xs text-slate-400 block mb-1">
Select Currency
</label>

<select
value={
selectedCurrency
}
onChange={(e) =>
setSelectedCurrency(
e.target
.value
)
}
className="w-full bg-[#070812] border border-white/10 rounded-xl px-4 py-2 text-white outline-none"
>
{PAYMENT_CONFIG.supportedCurrencies.map(
(
curr
) => (
<option
key={
curr
}
value={
curr
}
className="bg-[#070812]"
>
{
curr
}
</option>
)
)}
</select>
</div>

<div>
<label className="text-xs text-slate-400 block mb-1">
Top-Up Amount (
{
selectedCurrency
}
)
</label>

<input
type="number"
value={
topUpAmount
}
onChange={(e) =>
setTopUpAmount(
e.target
.value
)
}
min={
minTopupValue
}
className="w-full bg-[#070812] border border-white/10 rounded-xl px-4 py-2 text-white font-bold outline-none"
/>

<p className="text-[10px] text-slate-500 mt-1">
Minimum amount:{" "}
{
selectedCurrency
}{" "}
{
minTopupValue
}
</p>
</div>

<div>
<label className="text-xs text-slate-400 block mb-1">
Payment Method
</label>

<div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
{PAYMENT_CONFIG.enabledMethods.map(
(
method
) => (
<button
key={
method.id
}
onClick={() =>
setPaymentMethod(
method.id
)
}
className={`py-2 px-2 rounded-xl text-xs font-bold border transition ${
paymentMethod ===
method.id
? "border-emerald-500 bg-emerald-500/10 text-emerald-400"
: "border-white/10 bg-[#070812] text-slate-400"
}`}
>
{
method.name
}
</button>
)
)}
</div>
</div>

{paymentMethod ===
"bank" && (
<div className="bg-[#070812] p-3 rounded-xl text-xs space-y-1 border border-white/5 text-slate-300">

<p className="font-bold text-emerald-400">
Bank Wire Details (
{
selectedCurrency
}
):
</p>

<p>
Bank:{" "}
{
currentBankDetails.bankName
}
</p>

<p>
Account Name:{" "}
{
currentBankDetails.accountName
}
</p>

{currentBankDetails.accountNumber && (
<p>
Account Number:{" "}
{
currentBankDetails.accountNumber
}
</p>
)}

{currentBankDetails.iban && (
<p>
IBAN:{" "}
{
currentBankDetails.iban
}
</p>
)}

{currentBankDetails.routingNumber && (
<p>
Routing:{" "}
{
currentBankDetails.routingNumber
}
</p>
)}

{currentBankDetails.sortCode && (
<p>
Sort Code:{" "}
{
currentBankDetails.sortCode
}
</p>
)}

<p>
SWIFT/BIC:{" "}
{
currentBankDetails.swiftBic
}
</p>

</div>
)}

{paymentMethod ===
"crypto" && (
<div className="bg-[#070812] p-3 rounded-xl text-xs space-y-1 border border-white/5 text-slate-300">

<p className="font-bold text-emerald-400">
Crypto Deposit (
{
cryptoNetwork.name
}{" "}
-{" "}
{
cryptoNetwork.network
}
):
</p>

<p className="break-all font-mono text-[11px] text-white">
{
cryptoNetwork.address
}
</p>

<p className="text-[10px] text-slate-400 mt-1">
{
PAYMENT_CONFIG
.accounts
.crypto
.note
}
</p>

</div>
)}

{paymentMethod ===
"local" && (
<div className="bg-[#070812] p-3 rounded-xl text-xs space-y-2 border border-white/5 text-slate-300">

<p className="font-bold text-emerald-400">
Local Cash Payment / Deposit:
</p>

<p>
{
PAYMENT_CONFIG
.accounts
.localPayment
.instructions
}
</p>

</div>
)}

<div className="pt-2 flex gap-3">

<button
onClick={
handleTopUpRequest
}
className="flex-1 py-3 bg-gradient-to-r from-emerald-400 to-teal-600 text-black font-bold rounded-xl"
>
{paymentMethod ===
"card"
? "Proceed to Secure Checkout"
: "Confirm Request"}
</button>

{paymentMethod !==
"card" && (
<a
href={
whatsappUrl
}
target="_blank"
rel="noreferrer"
className="py-3 px-4 bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 rounded-xl font-bold flex items-center justify-center text-xs"
>
Confirm on WhatsApp
</a>
)}

</div>
</div>
</div>
)}

{/* ESIM RESULT */}

{esimResult && (
<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
<div className="bg-[#0c0f1d] border border-white/10 rounded-2xl max-w-lg w-full p-6 text-white">

<div className="flex justify-between items-center mb-5">

<h3 className="text-lg font-bold text-emerald-400">
✅ eSIM Issued Successfully
</h3>

<button
onClick={() =>
setEsimResult(
null
)
}
className="text-slate-400 hover:text-white"
>
✕
</button>

</div>

<div className="space-y-3 text-sm">

<div className="bg-[#070812] rounded-xl p-3">
<p className="text-slate-500 text-xs">
Order Number
</p>

<p className="font-bold">
{
esimResult.orderId ||
"—"
}
</p>
</div>

<div className="bg-[#070812] rounded-xl p-3">
<p className="text-slate-500 text-xs">
ICCID
</p>

<p className="font-mono break-all">
{
esimResult.iccid ||
"—"
}
</p>
</div>

<div className="bg-[#070812] rounded-xl p-3">
<p className="text-slate-500 text-xs">
Matching ID
</p>

<p className="font-mono break-all">
{
esimResult.lpaCode ||
"—"
}
</p>
</div>

{esimResult.smdpAddress && (
<div className="bg-[#070812] rounded-xl p-3">
<p className="text-slate-500 text-xs">
SM-DP+
</p>

<p className="font-mono break-all">
{
esimResult.smdpAddress
}
</p>
</div>
)}

<div className="bg-[#070812] rounded-xl p-3">
<p className="text-slate-500 text-xs">
Retail Price Charged
</p>

<p className="font-bold text-emerald-400">
$
{esimResult.paidAmount?.toFixed?.(
2
) ||
"0.00"}
</p>
</div>

<div className="bg-[#070812] rounded-xl p-3">
<p className="text-slate-500 text-xs">
Backend Business Credit
</p>

<p className="font-bold text-[#31dfff]">
$
{esimResult.remainingBalance?.toFixed?.(
2
) ||
"0.00"}
</p>
</div>

</div>

{esimResult.qrCodeUrl && (
<div className="mt-5 flex justify-center">
<img
src={
esimResult.qrCodeUrl
}
alt="eSIM QR Code"
className="w-48 h-48 bg-white p-2 rounded-xl"
/>
</div>
)}

<button
onClick={() => {
setEsimResult(
null
);
setIsIssueOpen(
false
);
}}
className="w-full mt-5 py-3 bg-white/5 hover:bg-white/10 rounded-xl font-bold"
>
Close
</button>

</div>
</div>
)}

{/* SUPPORT */}

{isSupportOpen && (
<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
<div className="bg-[#0c0f1d] border border-white/10 rounded-2xl max-w-md w-full p-6 text-white">

<div className="flex justify-between items-center mb-5">

<h3 className="text-lg font-bold text-[#31dfff]">
🎧 Agency Support
</h3>

<button
onClick={() =>
setIsSupportOpen(
false
)
}
className="text-slate-400 hover:text-white"
>
✕
</button>

</div>

<p className="text-sm text-slate-400 mb-5">
Need assistance with orders or pricing? Contact AROVIX support.
</p>

<div className="space-y-3">

<a
href="mailto:partnerships@arovix.io"
className="block w-full py-3 text-center bg-white/5 hover:bg-white/10 rounded-xl"
>
Email AROVIX Support
</a>

<a
href={
whatsappUrl
}
target="_blank"
rel="noreferrer"
className="block w-full py-3 text-center bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl"
>
WhatsApp Support
</a>

</div>
</div>
</div>
)}
</>
);
}