export const FINANCE_CONFIG = {
    limits: {
    minTopUp: 500,
    maxTopUp: 10000,
    },
    
    supportedCurrencies: ["USD", "EUR", "DZD"],
    defaultCurrency: "USD",
    
    paymentMethods: [
    {
    id: "bank_wire",
    name: "Bank Wire Transfer",
    enabled: true,
    requiresReference: true,
    },
    {
    id: "card",
    name: "Credit / Debit Card",
    enabled: true,
    requiresReference: false,
    },
    {
    id: "usdt_crypto",
    name: "USDT Crypto Payment",
    enabled: true,
    requiresReference: true,
    },
    {
    id: "local_cash",
    name: "Local Cash Payment",
    enabled: true,
    requiresReference: true,
    },
    ],
    
    officialBankDetails: {
    bankName: "Arovix Global Finance Corp",
    iban: "DZ58 0000 1234 5678 9012 3456",
    },
    
    cryptoWallets: {
    network: "USDT (TRC20)",
    address: "T9z1K2LmNoPqRsTuVwXyZ123456789ABC",
    },
    };
    