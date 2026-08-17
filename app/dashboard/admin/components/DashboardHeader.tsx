interface DashboardHeaderProps {
    activePartners: number;
    }
    
    export default function DashboardHeader({
    activePartners,
    }: DashboardHeaderProps) {
    return (
    <header className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-white/5 pb-6 mb-8 gap-4">
    <div>
    <p
    className="text-[11px] tracking-[0.3em] uppercase font-medium mb-1"
    style={{
    color: "#f5b94d",
    fontFamily: "'JetBrains Mono', monospace",
    }}
    >
    AROVIX
    </p>
    
    <h1
    className="text-2xl font-bold tracking-tight"
    style={{ fontFamily: "'Space Grotesk', sans-serif" }}
    >
    Super Admin{" "}
    <span className="bg-gradient-to-r from-[#31dfff] to-[#9d4fe0] bg-clip-text text-transparent">
    Portal
    </span>
    </h1>
    
    <p
    className="text-xs text-slate-500 mt-1"
    style={{ fontFamily: "'Inter', sans-serif" }}
    >
    Manage distribution partners and approved resellers
    </p>
    </div>
    
    <div className="bg-white/5 backdrop-blur-sm px-5 py-3 rounded-2xl border border-white/10">
    <span
    className="text-[11px] text-slate-400 block mb-0.5"
    style={{ fontFamily: "'Inter', sans-serif" }}
    >
    Active Partners
    </span>
    
    <span
    className="text-xl font-bold bg-gradient-to-r from-[#31dfff] to-[#9d4fe0] bg-clip-text text-transparent"
    style={{ fontFamily: "'Space Grotesk', sans-serif" }}
    >
    {activePartners} Partners
    </span>
    </div>
    </header>
    );
    }
    