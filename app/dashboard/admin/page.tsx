"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";

import DashboardHeader from "./components/DashboardHeader";
import CreatePartnerCard from "./components/CreatePartnerCard";
import CreateAgentCard from "./components/CreateAgentCard";
import PartnerTable from "./components/PartnerTable";
import InviteModal from "./components/InviteModal";

import { inviteUserAction } from "@/app/actions/auth-actions";

import { Partner, PartnerTier } from "../data/partners";
import { Agent } from "../data/agents";

// ============================================================
// SUPABASE CLIENT
// ============================================================

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
);

export default function AdminDashboard() {
  // ============================================================
  // AUTHORIZATION
  // ============================================================

  const [authChecking, setAuthChecking] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  // ============================================================
  // DATA
  // ============================================================

  const [partners, setPartners] = useState<Partner[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);

  // ============================================================
  // PARTNER FORM
  // ============================================================

  const [shopName, setShopName] = useState("");
  const [shopEmail, setShopEmail] = useState("");
  const [initialCredit, setInitialCredit] = useState("");

  const [tier, setTier] =
    useState<PartnerTier>("Standard");

  const [commission, setCommission] =
    useState<number>(10);

  const [selectedAgentId, setSelectedAgentId] =
    useState<string>("");

  const [searchTerm, setSearchTerm] =
    useState("");

  const [successMsg, setSuccessMsg] =
    useState("");

  // ============================================================
  // AGENT FORM
  // ============================================================

  const [agentName, setAgentName] = useState("");
  const [agentEmail, setAgentEmail] = useState("");
  const [agentCountry, setAgentCountry] = useState("");

  const [agentCommission, setAgentCommission] =
    useState<number>(10);

  const [agentSuccessMsg, setAgentSuccessMsg] =
    useState("");

  // ============================================================
  // AUTHORIZATION CHECK
  // ============================================================

  useEffect(() => {
    let mounted = true;

    async function checkAdminAccess() {
      try {
        setAuthChecking(true);

        // --------------------------------------------------------
        // 1. Get authenticated user
        // --------------------------------------------------------

        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (
          userError ||
          !user
        ) {
          if (mounted) {
            setAuthorized(false);
            window.location.replace(
              "/login?error=unauthorized"
            );
          }

          return;
        }

        // --------------------------------------------------------
        // 2. Get profile for this exact Supabase user UUID
        // --------------------------------------------------------

        const {
          data: profile,
          error: profileError,
        } = await supabase
          .from("profiles")
          .select("id, role, status")
          .eq("id", user.id)
          .maybeSingle();

        if (
          profileError ||
          !profile
        ) {
          console.error(
            "Admin authorization profile lookup failed:",
            profileError
          );

          if (mounted) {
            setAuthorized(false);
            window.location.replace(
              "/login?error=profile_not_found"
            );
          }

          return;
        }

        // --------------------------------------------------------
        // 3. Normalize role and status
        // --------------------------------------------------------

        const role = String(
          profile.role || ""
        )
          .trim()
          .toLowerCase();

        const status = String(
          profile.status || ""
        )
          .trim()
          .toLowerCase();

        // --------------------------------------------------------
        // 4. Admin role is mandatory
        // --------------------------------------------------------

        if (role !== "admin") {
          console.warn(
            "Unauthorized attempt to access Admin Dashboard:",
            {
              userId: user.id,
              email: user.email,
              role,
            }
          );

          if (mounted) {
            setAuthorized(false);
            window.location.replace(
              "/login?error=unauthorized"
            );
          }

          return;
        }

        // --------------------------------------------------------
        // 5. Block inactive / suspended / disabled admin
        // --------------------------------------------------------

        if (
          status === "inactive" ||
          status === "suspended" ||
          status === "blocked" ||
          status === "disabled"
        ) {
          if (mounted) {
            setAuthorized(false);
            window.location.replace(
              "/login?error=account_inactive"
            );
          }

          return;
        }

        // --------------------------------------------------------
        // 6. Authorized
        // --------------------------------------------------------

        if (mounted) {
          setAuthorized(true);
        }
      } catch (error) {
        console.error(
          "Admin authorization check failed:",
          error
        );

        if (mounted) {
          setAuthorized(false);
          window.location.replace(
            "/login?error=unauthorized"
          );
        }
      } finally {
        if (mounted) {
          setAuthChecking(false);
        }
      }
    }

    checkAdminAccess();

    return () => {
      mounted = false;
    };
  }, []);

  // ============================================================
  // AGENT PAGINATION
  // ============================================================

  const AGENTS_PER_PAGE = 5;

  const [agentPage, setAgentPage] = useState(1);

  const agentTotalPages = Math.max(
    1,
    Math.ceil(
      agents.length / AGENTS_PER_PAGE
    )
  );

  const paginatedAgents = useMemo(() => {
    const start =
      (agentPage - 1) * AGENTS_PER_PAGE;

    return agents.slice(
      start,
      start + AGENTS_PER_PAGE
    );
  }, [agents, agentPage]);

  useEffect(() => {
    if (agentPage > agentTotalPages) {
      setAgentPage(agentTotalPages);
    }
  }, [agentPage, agentTotalPages]);

  // ============================================================
  // LOAD DASHBOARD DATA
  // ============================================================

  useEffect(() => {
    if (!authorized) {
      return;
    }

    async function fetchDashboardData() {
      try {
        setLoading(true);

        // ------------------------------------------------------
        // AGENTS
        // ------------------------------------------------------

        const {
          data: agentsData,
          error: agentsError,
        } = await supabase
          .from("agents")
          .select("*")
          .order("created_at", {
            ascending: false,
          });

        if (agentsError) {
          console.error(
            "Error fetching agents:",
            agentsError.message
          );
        }

        const agentsList =
          agentsData || [];

        setAgents(
          agentsList as Agent[]
        );

        if (
          agentsList.length > 0 &&
          !selectedAgentId
        ) {
          setSelectedAgentId(
            String(agentsList[0].id)
          );
        }

        // ------------------------------------------------------
        // PARTNERS / AGENCIES
        // ------------------------------------------------------

        const partnersResponse =
          await fetch(
            "/api/admin/partners",
            {
              method: "GET",
              cache: "no-store",
            }
          );

        const partnersResult =
          await partnersResponse.json();

        if (
          !partnersResponse.ok ||
          !partnersResult.success
        ) {
          console.error(
            "Supabase partners error:",
            partnersResult.error ||
              "Failed to load partners."
          );
        } else {
          const partnersData =
            partnersResult.partners || [];

          const mappedPartners: Partner[] =
            partnersData.map(
              (p: any) => {
                const foundAgent =
                  agentsList.find(
                    (a: any) =>
                      String(a.id) ===
                      String(
                        p.agent_id
                      )
                  );

                const businessShop =
                  Array.isArray(
                    p.business_shops
                  )
                    ? p.business_shops[0]
                    : p.business_shops;

                return {
                  id: p.id,

                  shopId:
                    businessShop?.shop_id ||
                    `SHOP-${p.id}`,

                  companyName:
                    p.company_name ||
                    "Unnamed Agency",

                  email:
                    p.email || "",

                  country:
                    p.country ||
                    "Not Set",

                  creditBalance:
                    Number(
                      businessShop?.business_credit
                    ) || 0,

                  totalOrders:
                    Number(
                      p.total_orders
                    ) || 0,

                  totalSales:
                    Number(
                      p.total_sales
                    ) || 0,

                  status:
                    p.status ||
                    "Active",

                  agentId:
                    foundAgent
                      ? foundAgent.name
                      : p.agent_id ||
                        "No Agent",

                  tier:
                    p.tier ||
                    "Standard",

                  commission:
                    Number(
                      p.commission
                    ) || 10,
                };
              }
            );

          setPartners(
            mappedPartners
          );
        }
      } catch (err) {
        console.error(
          "Unexpected dashboard error:",
          err
        );
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();

    // IMPORTANT:
    // Do not reload dashboard when selected agent changes.
  }, [authorized]);

  // ============================================================
  // CREATE PARTNER / AGENCY
  // ============================================================

  const handleCreatePartner = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    setSuccessMsg("");

    try {
      if (!shopName.trim()) {
        throw new Error(
          "Agency / Shop Name is required."
        );
      }

      if (!shopEmail.trim()) {
        throw new Error(
          "Partner email is required."
        );
      }

      // --------------------------------------------------------
      // CREATE PARTNER + SHOP
      // --------------------------------------------------------

      const {
        error: rpcError,
      } = await supabase.rpc(
        "create_partner_with_shop",
        {
          p_partner_id:
            `AROVIX-AGENCY-${Date.now()
              .toString()
              .slice(-4)}`,

          p_company_name:
            shopName.trim(),

          p_email:
            shopEmail.trim(),

          p_partner_type:
            "agency",

          p_tier:
            tier,

          p_commission:
            commission,

          p_status:
            "Active",

          p_shop_id:
            `SHOP-${Date.now()
              .toString()
              .slice(-4)}`,

          p_shop_name:
            `${shopName.trim()} Shop`,

          p_business_credit:
            Number(initialCredit) || 0,

          p_agent_id:
            selectedAgentId || null,
        }
      );

      if (rpcError) {
        throw rpcError;
      }

      // --------------------------------------------------------
      // SEND INVITATION
      // --------------------------------------------------------

      const inviteResult =
        await inviteUserAction(
          shopEmail.trim(),
          "agency",
          {
            role: "agency",

            company_name:
              shopName.trim(),

            partner_email:
              shopEmail.trim(),
          }
        );

      if (!inviteResult.success) {
        throw new Error(
          inviteResult.error ||
            "Partner was created, but the invitation could not be sent."
        );
      }

      // --------------------------------------------------------
      // SUCCESS
      // --------------------------------------------------------

      setSuccessMsg(
        `Agency "${shopName}" created successfully and invitation sent.`
      );

      setShopName("");
      setShopEmail("");
      setInitialCredit("");
      setTier("Standard");
      setCommission(10);
      setSelectedAgentId("");

      setTimeout(() => {
        window.location.reload();
      }, 1200);
    } catch (err: any) {
      console.error(
        "Create Partner error:",
        err
      );

      alert(
        "Error: " +
          (err?.message ||
            "Failed to create agency.")
      );
    }
  };

  // ============================================================
  // CREATE AGENT
  // ============================================================

  const handleCreateAgent = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    setAgentSuccessMsg("");

    try {
      if (!agentName.trim()) {
        throw new Error(
          "Agent name is required."
        );
      }

      if (!agentEmail.trim()) {
        throw new Error(
          "Agent email is required."
        );
      }

      if (!agentCountry.trim()) {
        throw new Error(
          "Agent country is required."
        );
      }

      // IMPORTANT:
      // Exactly ONE insert.
      // No manually generated ID.
      // No duplicate insert.

      const {
        data,
        error,
      } = await supabase
        .from("agents")
        .insert({
          name:
            agentName.trim(),

          email:
            agentEmail.trim(),

          country:
            agentCountry.trim(),

          status:
            "Active",

          commission:
            agentCommission,
        })
        .select("*")
        .single();

      if (error) {
        throw error;
      }

      if (data) {
        setAgents((prev) => [
          data as Agent,
          ...prev,
        ]);
      }

      setAgentSuccessMsg(
        `Agent (${agentName}) created successfully.`
      );

      setAgentName("");
      setAgentEmail("");
      setAgentCountry("");
      setAgentCommission(10);

      setAgentPage(1);
    } catch (err: any) {
      console.error(
        "Create Agent error:",
        err
      );

      alert(
        "Error: " +
          (err?.message ||
            "Failed to create agent.")
      );
    }
  };

  // ============================================================
  // TOP-UP
  // ============================================================

  const handleTopUp = (
    id: string,
    amount: number
  ) => {
    setPartners((prev) =>
      prev.map((partner) =>
        partner.id === id
          ? {
              ...partner,
              creditBalance:
                Number(
                  partner.creditBalance
                ) + amount,
            }
          : partner
      )
    );
  };

  // ============================================================
  // SEARCH
  // ============================================================

  const filteredPartners =
    partners.filter(
      (partner) =>
        partner.companyName
          .toLowerCase()
          .includes(
            searchTerm.toLowerCase()
          ) ||
        partner.email
          .toLowerCase()
          .includes(
            searchTerm.toLowerCase()
          )
    );

  // ============================================================
  // AUTH CHECK SCREEN
  // ============================================================

  if (authChecking) {
    return (
      <div className="min-h-screen bg-[#02030a] text-white flex items-center justify-center p-6 font-mono">
        <div className="text-sm text-slate-400">
          Verifying admin access...
        </div>
      </div>
    );
  }

  // ============================================================
  // DO NOT RENDER ADMIN DASHBOARD IF NOT AUTHORIZED
  // ============================================================

  if (!authorized) {
    return (
      <div className="min-h-screen bg-[#02030a] text-white flex items-center justify-center p-6 font-mono">
        <div className="text-sm text-slate-400">
          Redirecting to login...
        </div>
      </div>
    );
  }

  // ============================================================
  // UI
  // ============================================================

  return (
    <div className="min-h-screen bg-[#02030a] text-white p-6 md:p-8">
      <div className="max-w-7xl mx-auto">

        {/* ====================================================
        HEADER
        ==================================================== */}

        <DashboardHeader
          activePartners={
            partners.length
          }
        />

        {/* ====================================================
        INVITE
        ==================================================== */}

        <div className="mt-6 flex justify-end">
          <InviteModal />
        </div>

        {/* ====================================================
        CREATE CARDS
        ==================================================== */}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">

          <div className="flex flex-col gap-6">

            <CreatePartnerCard
              shopName={
                shopName
              }

              setShopName={
                setShopName
              }

              shopEmail={
                shopEmail
              }

              setShopEmail={
                setShopEmail
              }

              initialCredit={
                initialCredit
              }

              setInitialCredit={
                setInitialCredit
              }

              tier={
                tier
              }

              setTier={
                setTier
              }

              commission={
                commission
              }

              setCommission={
                setCommission
              }

              agents={
                agents
              }

              selectedAgentId={
                selectedAgentId
              }

              setSelectedAgentId={
                setSelectedAgentId
              }

              onSubmit={
                handleCreatePartner
              }

              successMsg={
                successMsg
              }
            />

            <CreateAgentCard
              agentName={
                agentName
              }

              setAgentName={
                setAgentName
              }

              agentEmail={
                agentEmail
              }

              setAgentEmail={
                setAgentEmail
              }

              country={
                agentCountry
              }

              setCountry={
                setAgentCountry
              }

              commission={
                agentCommission
              }

              setCommission={
                setAgentCommission
              }

              onSubmit={
                handleCreateAgent
              }

              successMsg={
                agentSuccessMsg
              }
            />

          </div>

          {/* ==================================================
          PARTNERS + AGENTS
          ================================================== */}

          <div className="lg:col-span-2 flex flex-col gap-6">

            {/* ==================================================
            PARTNER / AGENCY TABLE
            ================================================== */}

            {loading ? (
              <div className="text-center py-12 text-slate-400">
                Loading...
              </div>
            ) : (
              <PartnerTable
                partners={
                  filteredPartners
                }

                searchTerm={
                  searchTerm
                }

                setSearchTerm={
                  setSearchTerm
                }

                onTopUp={
                  handleTopUp
                }
              />
            )}

            {/* ==================================================
            AGENTS TABLE
            DIRECTLY UNDER PARTNERS TABLE
            ================================================== */}

            <div className="bg-[#0b0e1a] p-6 rounded-xl border border-slate-800">

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">

                <div>
                  <h2 className="text-xl font-bold text-white">
                    Agents List
                  </h2>

                  <p className="text-xs text-slate-500 mt-1">
                    {agents.length} agent
                    {agents.length === 1
                      ? ""
                      : "s"} found
                  </p>
                </div>

              </div>

              <div className="overflow-x-auto">

                <table className="w-full text-left text-sm text-slate-300">

                  <thead className="text-xs uppercase bg-[#02030a] text-slate-400">

                    <tr>

                      <th className="py-3 px-4">
                        Agent
                      </th>

                      <th className="py-3 px-4">
                        Email
                      </th>

                      <th className="py-3 px-4">
                        Country
                      </th>

                      <th className="py-3 px-4">
                        Commission
                      </th>

                      <th className="py-3 px-4">
                        Status
                      </th>

                      <th className="py-3 px-4">
                        Partners
                      </th>

                    </tr>

                  </thead>

                  <tbody>

                    {paginatedAgents.length > 0 ? (

                      paginatedAgents.map(
                        (agent: any) => {

                          const partnerCount =
                            partners.filter(
                              (partner: any) =>
                                String(
                                  partner.agentId
                                ) ===
                                  String(
                                    agent.name
                                  ) ||
                                String(
                                  partner.agent_id
                                ) ===
                                  String(
                                    agent.id
                                  )
                            ).length;

                          return (
                            <tr
                              key={String(
                                agent.id
                              )}
                              className="border-b border-slate-800 hover:bg-slate-900/40 transition"
                            >

                              <td className="py-3 px-4">

                                <div className="font-bold text-white">
                                  {agent.name ||
                                    "Unnamed Agent"}
                                </div>

                                <div className="text-xs text-slate-500">
                                  ID:{" "}
                                  {agent.id}
                                </div>

                              </td>

                              <td className="py-3 px-4 text-slate-300">
                                {agent.email ||
                                  "—"}
                              </td>

                              <td className="py-3 px-4 text-slate-300">
                                {agent.country ||
                                  "—"}
                              </td>

                              <td className="py-3 px-4">

                                <span className="text-amber-400 font-bold">
                                  {Number(
                                    agent.commission
                                  ) || 0}
                                  %
                                </span>

                              </td>

                              <td className="py-3 px-4">

                                <span className="px-2 py-1 rounded bg-emerald-500/20 text-emerald-300 text-xs">
                                  {agent.status ||
                                    "Active"}
                                </span>

                              </td>

                              <td className="py-3 px-4">

                                <span className="text-[#31dfff] font-bold">
                                  {partnerCount}
                                </span>

                              </td>

                            </tr>
                          );
                        }
                      )

                    ) : (

                      <tr>

                        <td
                          colSpan={6}
                          className="text-center py-8 text-slate-500"
                        >
                          No agents found.
                        </td>

                      </tr>

                    )}

                  </tbody>

                </table>

              </div>

              {/* ==================================================
              AGENT PAGINATION
              ================================================== */}

              {agents.length >
                AGENTS_PER_PAGE && (

                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-5 pt-4 border-t border-slate-800">

                  <div className="text-xs text-slate-500">

                    Page{" "}

                    <span className="text-white font-bold">
                      {agentPage}
                    </span>

                    {" "}of{" "}

                    <span className="text-white font-bold">
                      {agentTotalPages}
                    </span>

                  </div>

                  <div className="flex items-center gap-2">

                    <button
                      type="button"
                      onClick={() =>
                        setAgentPage(
                          (page) =>
                            Math.max(
                              1,
                              page - 1
                            )
                        )
                      }
                      disabled={
                        agentPage === 1
                      }
                      className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed text-xs font-bold"
                    >
                      Previous
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setAgentPage(
                          (page) =>
                            Math.min(
                              agentTotalPages,
                              page + 1
                            )
                        )
                      }
                      disabled={
                        agentPage ===
                        agentTotalPages
                      }
                      className="px-4 py-2 rounded-lg bg-[#31dfff]/20 text-[#31dfff] hover:bg-[#31dfff]/30 disabled:opacity-30 disabled:cursor-not-allowed text-xs font-bold"
                    >
                      Next
                    </button>

                  </div>

                </div>
              )}

            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
