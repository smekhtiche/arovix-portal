export const PAYMENT_CONFIG = {
    // الحدود والعملات
    minTopupAmount: 500,
    maxTopupAmount: 10000,
    
    defaultCurrency: "USD",
    
    supportedCurrencies: [
    "USD",
    "EUR",
    "GBP",
    ],
    
    // طرق الدفع المتاحة
    enabledMethods: [
    {
    id: "card",
    name: "Credit / Debit Card",
    subtitle: "Secure Shopify Checkout",
    enabled: true,
    },
    {
    id: "bank",
    name: "Bank Wire Transfer",
    subtitle: "SWIFT / IBAN",
    enabled: true,
    },
    {
    id: "crypto",
    name: "USDT Crypto",
    subtitle: "TRC20 Network",
    enabled: true,
    },
    {
    id: "local",
    name: "Local Cash Payment",
    subtitle: "Partner Local Deposit",
    enabled: true,
    },
    ],
    
    // البيانات المالية
    accounts: {
    bankWire: {
    USD: {
    currency: "USD",
    bankName: "Wise US Inc",
    accountName: "Arovix Ltd",
    accountNumber: "344007305281303",
    routingNumber: "084009519",
    swiftBic: "TRWIUS35XXX",
    address:
    "Wise US Inc, 108 W 13th St, Wilmington, DE 19801, United States",
    },
    
    EUR: {
    currency: "EUR",
    bankName: "Wise Europe SA",
    accountName: "Arovix Ltd",
    iban: "BE44905886535345",
    swiftBic: "TRWIBEB1XXX",
    address:
    "Wise, Rue du Trône 100, 3rd floor, Brussels, 1050, Belgium",
    },
    
    GBP: {
    currency: "GBP",
    bankName: "Wise Payments Limited",
    accountName: "Arovix Ltd",
    accountNumber: "88219877",
    sortCode: "60-84-64",
    iban: "GB29TRWI60846488219877",
    swiftBic: "TRWIGB2LXXX",
    address:
    "Wise Payments Limited, Worship Square, 65 Clifton Street, London, EC2A 4JE, United Kingdom",
    },
    },
    
    crypto: {
    enabled: true,
    
    networks: [
    {
    name: "USDT",
    network: "TRON (TRC20)",
    address:
    "TYpq7LnYggJENhMbVEekudw1pitFzZPwoz",
    status: "active",
    },
    ],
    
    note:
    "TRC20 network recommended for faster confirmation and lower fees.",
    },
    
    localPayment: {
    enabled: true,
    
    instructions:
    "Contact AROVIX Partner Support for local cash deposit instructions.",
    },
    },
    
    // API Routes
    endpoints: {
    // AROVIX Partner Top-Up Payment Processor
    // Production n8n Webhook
    topUp:
    "/webhook/009b6cd0-1f0a-4cae-940c-32d0d0ea1b60",
    
    shopifyDraft:
    "/api/payments/shopify/draft",
    
    checkout:
    "/api/payments/shopify/checkout",
    
    bankVerify:
    "/api/payments/bank/verify",
    
    cryptoVerify:
    "/api/payments/crypto/verify",
    },
    };
    