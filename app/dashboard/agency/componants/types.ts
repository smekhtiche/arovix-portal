export interface PartnerInfo {
    partnerName: string;
    distributionRegion: string;
    lastLogin: string;
    creditBalance: number;
    paymentType: "Prepaid" | "Postpaid";
    todayOrders: number;
    monthlyOrders: number;
    activeEsims: number;
    availableCountries: number;
    }
    
    export interface CatalogPlan {
    sku: string;
    country: string;
    region: string;
    planName: string;
    price: number;
    dataAmount: string;
    validityDays: number;
    }
    
    export interface OrderTransaction {
    id: string;
    country: string;
    plan: string;
    iccid: string;
    purchaseDate: string;
    status: "Active" | "Expired" | "Pending";
    creditUsed: number;
    sku: string;
    }
    
    