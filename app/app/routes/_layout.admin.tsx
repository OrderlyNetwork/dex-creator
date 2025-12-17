import { useState, FormEvent, useEffect } from "react";
import { toast } from "react-toastify";
import { del, get, post } from "../utils/apiClient";
import { useAuth } from "../context/useAuth";
import { useModal } from "../context/ModalContext";
import { Button } from "../components/Button";
import FormInput from "../components/FormInput";
import FuzzySearchInput from "../components/FuzzySearchInput";
import AllDexesList from "../components/AllDexesList";
import {
  getBlockExplorerUrlByChainId,
  getChainById,
  ALL_CHAINS,
  type OrderTokenChainName,
} from "../../../config";
import { getBaseUrl } from "../utils/orderly";

interface DeleteDexResponse {
  message: string;
  success: boolean;
}

interface UpdateBrokerIdResponse {
  id: string;
  brokerId: string;
  brokerName: string;
}

interface RenameRepoResponse {
  message: string;
  dex: {
    id: string;
    repoUrl: string;
  };
  oldName: string;
  newName: string;
}

interface AdminCheckResponse {
  isAdmin: boolean;
}

interface AdminUser {
  id: string;
  address: string;
  isAdmin: boolean;
  createdAt: string;
  updatedAt: string;
}

interface AdminUsersResponse {
  admins: AdminUser[];
}

interface Dex {
  id: string;
  brokerName: string;
  brokerId: string;
  repoUrl: string | null;
  customDomain?: string | null;
  customDomainOverride?: string | null;
  createdAt: string;
  makerFee?: number | null;
  takerFee?: number | null;
  themeCSS?: string | null;
  user: {
    address: string;
  };
}

interface DexesResponse {
  dexes: Dex[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
  };
}

interface DexStatsResponse {
  total: {
    allTime: number;
    new: number;
  };
  graduated: {
    allTime: number;
    new: number;
  };
  demo: {
    allTime: number;
    new: number;
  };
  period: string;
}

interface ManualBrokerCreationResponse {
  success: boolean;
  message: string;
  brokerCreationData: {
    brokerId: string;
    transactionHashes: Record<number, string>;
  };
  dex: {
    id: string;
    brokerId: string;
    brokerName: string;
    isGraduated: boolean;
  };
}

const getChainName = (chainId: number): string => {
  const chain = getChainById(chainId);
  return chain ? chain.name : "Unknown";
};

export default function AdminRoute() {
  const [dexStats, setDexStats] = useState<DexStatsResponse | null>(null);

  const [dexToDeleteId, setDexToDeleteId] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [filteredDeleteDexes, setFilteredDeleteDexes] = useState<Dex[]>([]);
  const [isSearchingDelete, setIsSearchingDelete] = useState(false);

  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [isLoadingAdmins, setIsLoadingAdmins] = useState(false);

  const [dexId, setDexId] = useState("");
  const [brokerId, setBrokerId] = useState("");
  const [isUpdatingBrokerId, setIsUpdatingBrokerId] = useState(false);
  const [filteredBrokerDexes, setFilteredBrokerDexes] = useState<Dex[]>([]);
  const [brokerSearchQuery, setBrokerSearchQuery] = useState("");
  const [isSearchingBroker, setIsSearchingBroker] = useState(false);

  const [repoDexId, setRepoDexId] = useState("");
  const [newRepoName, setNewRepoName] = useState("");
  const [isRenamingRepo, setIsRenamingRepo] = useState(false);
  const [filteredRepoDexes, setFilteredRepoDexes] = useState<Dex[]>([]);
  const [repoSearchQuery, setRepoSearchQuery] = useState("");
  const [isSearchingRepo, setIsSearchingRepo] = useState(false);

  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { isAuthenticated, token } = useAuth();
  const { openModal } = useModal();

  const [redeployingDexes, setRedeployingDexes] = useState<Set<string>>(
    new Set()
  );

  const [manualDexId, setManualDexId] = useState("");
  const [selectedDexName, setSelectedDexName] = useState("");
  const [manualBrokerId, setManualBrokerId] = useState("");
  const [manualMakerFee, setManualMakerFee] = useState(3);
  const [manualTakerFee, setManualTakerFee] = useState(6);
  const [manualRwaMakerFee, setManualRwaMakerFee] = useState(0);
  const [manualRwaTakerFee, setManualRwaTakerFee] = useState(5);
  const [manualTxHash, setManualTxHash] = useState("");
  const [manualChainId, setManualChainId] = useState<number | undefined>(
    undefined
  );
  const [isCreatingManualBroker, setIsCreatingManualBroker] = useState(false);
  const [filteredManualDexes, setFilteredManualDexes] = useState<Dex[]>([]);
  const [manualSearchQuery, setManualSearchQuery] = useState("");
  const [isSearchingManual, setIsSearchingManual] = useState(false);
  const [manualBrokerResult, setManualBrokerResult] =
    useState<ManualBrokerCreationResponse | null>(null);
  const [existingBrokerIds, setExistingBrokerIds] = useState<string[]>([]);
  const [manualBrokerIdError, setManualBrokerIdError] = useState<string | null>(
    null
  );

  const [isUpdatingCustomDomainOverride, setIsUpdatingCustomDomainOverride] =
    useState(false);

  const handleRedeployment = async (dexId: string, brokerName: string) => {
    openModal("confirmation", {
      title: "Redeploy DEX",
      message: `Are you sure you want to trigger a redeployment for "${brokerName}"?`,
      warningMessage:
        "This will redeploy the DEX to GitHub Pages. The process may take several minutes to complete, but the current version will remain available during deployment.",
      confirmButtonText: "Redeploy",
      confirmButtonVariant: "primary",
      onConfirm: async () => {
        setRedeployingDexes(prev => new Set(prev).add(dexId));
        try {
          await post(`api/admin/dex/${dexId}/redeploy`, {}, token);
          toast.success(`Redeployment triggered for ${brokerName}`);
        } catch (error) {
          console.error("Error triggering redeployment:", error);
          if (error instanceof Error) {
            toast.error(`Failed to trigger redeployment: ${error.message}`);
          } else {
            toast.error("Failed to trigger redeployment");
          }
        } finally {
          setRedeployingDexes(prev => {
            const newSet = new Set(prev);
            newSet.delete(dexId);
            return newSet;
          });
        }
      },
    });
  };

  const handleCustomDomainOverride = async (
    dexId: string,
    domainOverride: string
  ) => {
    setIsUpdatingCustomDomainOverride(true);
    try {
      const response = await post(
        `api/admin/dex/${dexId}/custom-domain-override`,
        { customDomainOverride: domainOverride || null },
        token
      );

      if (response.message) {
        toast.success(response.message);
      }
    } catch (error) {
      console.error("Error updating custom domain override:", error);
      if (error instanceof Error) {
        toast.error(
          `Failed to update custom domain override: ${error.message}`
        );
      } else {
        toast.error("Failed to update custom domain override");
      }
    } finally {
      setIsUpdatingCustomDomainOverride(false);
    }
  };

  useEffect(() => {
    async function checkAdmin() {
      if (!isAuthenticated) {
        setIsAdmin(false);
        setIsLoading(false);
        return;
      }

      try {
        const response = await get<AdminCheckResponse>(
          "api/admin/check",
          token
        );
        setIsAdmin(response.isAdmin);

        if (response.isAdmin) {
          loadAdminUsers();
          loadDexStats();
        }
      } catch (error) {
        console.error("Error checking admin status:", error);
        setIsAdmin(false);
      } finally {
        setIsLoading(false);
      }
    }

    checkAdmin();
  }, [isAuthenticated, token]);

  const loadAdminUsers = async () => {
    setIsLoadingAdmins(true);
    try {
      const response = await get<AdminUsersResponse>("api/admin/users", token);
      setAdminUsers(response.admins);
    } catch (error) {
      console.error("Error loading admin users:", error);
      toast.error("Failed to load admin users");
    } finally {
      setIsLoadingAdmins(false);
    }
  };

  const loadDexStats = async () => {
    try {
      const response = await get<DexStatsResponse>(
        "api/stats?period=30d",
        token
      );
      setDexStats(response);
    } catch (error) {
      console.error("Error loading DEX statistics:", error);
    }
  };

  const handleDeleteDexSearch = async (query: string) => {
    if (!query) {
      setFilteredDeleteDexes([]);
      setIsSearchingDelete(false);
      return;
    }

    setIsSearchingDelete(true);
    try {
      const response = await get<DexesResponse>(
        `api/admin/dexes?limit=100&offset=0&search=${encodeURIComponent(query.trim())}`,
        token
      );
      setFilteredDeleteDexes(response.dexes);
    } catch (error) {
      console.error("Error searching DEXs:", error);
      setFilteredDeleteDexes([]);
    } finally {
      setIsSearchingDelete(false);
    }
  };

  const handleBrokerSearch = async (query: string) => {
    setBrokerSearchQuery(query);
    if (!query) {
      setFilteredBrokerDexes([]);
      setIsSearchingBroker(false);
      return;
    }

    setIsSearchingBroker(true);
    try {
      const response = await get<DexesResponse>(
        `api/admin/dexes?limit=100&offset=0&search=${encodeURIComponent(query.trim())}`,
        token
      );
      setFilteredBrokerDexes(response.dexes);
    } catch (error) {
      console.error("Error searching DEXs:", error);
      setFilteredBrokerDexes([]);
    } finally {
      setIsSearchingBroker(false);
    }
  };

  const handleRepoSearch = async (query: string) => {
    setRepoSearchQuery(query);
    if (!query) {
      setFilteredRepoDexes([]);
      setIsSearchingRepo(false);
      return;
    }

    setIsSearchingRepo(true);
    try {
      const response = await get<DexesResponse>(
        `api/admin/dexes?limit=100&offset=0&search=${encodeURIComponent(query.trim())}`,
        token
      );
      const filtered = response.dexes.filter(dex => dex.repoUrl);
      setFilteredRepoDexes(filtered);
    } catch (error) {
      console.error("Error searching DEXs:", error);
      setFilteredRepoDexes([]);
    } finally {
      setIsSearchingRepo(false);
    }
  };

  const handleManualSearch = async (query: string) => {
    setManualSearchQuery(query);
    if (!query) {
      setFilteredManualDexes([]);
      setIsSearchingManual(false);
      return;
    }

    setIsSearchingManual(true);
    try {
      const response = await get<DexesResponse>(
        `api/admin/dexes?limit=100&offset=0&search=${encodeURIComponent(query.trim())}`,
        token
      );
      const filtered = response.dexes.filter(
        dex => dex.repoUrl && (dex.brokerId === "demo" || !dex.brokerId)
      );
      setFilteredManualDexes(filtered);
    } catch (error) {
      console.error("Error searching DEXs:", error);
      setFilteredManualDexes([]);
    } finally {
      setIsSearchingManual(false);
    }
  };

  const handleSelectDexToDelete = (dex: Dex) => {
    setDexToDeleteId(dex.id);
    setFilteredDeleteDexes([]);
  };

  const handleSelectBrokerDex = (dex: Dex) => {
    setDexId(dex.id);
    setBrokerId(dex.brokerId);
    setFilteredBrokerDexes([]);
    setBrokerSearchQuery("");
  };

  const handleSelectRepoDex = (dex: Dex) => {
    setRepoDexId(dex.id);
    if (dex.repoUrl) {
      const match = dex.repoUrl.match(/github\.com\/[^/]+\/([^/]+)/);
      if (match && match[1]) {
        setNewRepoName(match[1]);
      }
    }
    setFilteredRepoDexes([]);
    setRepoSearchQuery("");
  };

  const handleSelectManualDex = (dex: Dex) => {
    setManualDexId(dex.id);
    setSelectedDexName(dex.brokerName || "Unknown DEX");
    setFilteredManualDexes([]);
    setManualSearchQuery("");
  };

  const fetchExistingBrokerIds = async () => {
    try {
      const response = await fetch(`${getBaseUrl()}/v1/public/broker/name`);
      if (!response.ok) {
        throw new Error("Failed to fetch broker IDs");
      }

      const data = await response.json();

      if (data.success && data.data?.rows) {
        const brokerIds = data.data.rows.map(
          (row: { broker_id: string }) => row.broker_id
        );
        setExistingBrokerIds(brokerIds);
      }
    } catch (error) {
      console.error("Error fetching broker IDs:", error);
    }
  };

  useEffect(() => {
    if (!manualBrokerId) {
      setManualBrokerIdError(null);
      return;
    }

    const isValidFormat = /^[a-z0-9_-]+$/.test(manualBrokerId);
    if (!isValidFormat) {
      setManualBrokerIdError(
        "Broker ID must contain only lowercase letters, numbers, hyphens, and underscores"
      );
      return;
    }

    if (manualBrokerId.includes("orderly")) {
      setManualBrokerIdError("Broker ID cannot contain 'orderly'");
      return;
    }

    if (manualBrokerId.length < 5 || manualBrokerId.length > 15) {
      setManualBrokerIdError("Broker ID must be between 5-15 characters");
      return;
    }

    if (existingBrokerIds.includes(manualBrokerId)) {
      setManualBrokerIdError(
        "This broker ID is already taken. Please choose another one."
      );
      return;
    }

    setManualBrokerIdError(null);
  }, [manualBrokerId, existingBrokerIds]);

  useEffect(() => {
    fetchExistingBrokerIds();
  }, []);

  const handleDeleteDex = async (e: FormEvent) => {
    e.preventDefault();

    if (!dexToDeleteId.trim()) {
      toast.error("Please select a DEX to delete");
      return;
    }

    const dexName = "Selected DEX";

    openModal("confirmation", {
      title: "Delete DEX",
      message: `Are you sure you want to delete "${dexName}"? This action cannot be undone.`,
      warningMessage:
        "Deleting this DEX will permanently remove all associated data from the system, including the GitHub repository. However, any deployed instances on GitHub Pages will remain active and must be manually disabled through GitHub.",
      confirmButtonText: "Delete DEX",
      confirmButtonVariant: "danger",
      isDestructive: true,
      onConfirm: async () => {
        setIsDeleting(true);
        try {
          await del<DeleteDexResponse>(
            `api/admin/dex/${dexToDeleteId.trim()}`,
            null,
            token,
            { showToastOnError: false }
          );

          toast.success("DEX deleted successfully");
          loadDexStats();
          setDexToDeleteId("");
        } catch (error) {
          console.error("Error in admin component:", error);
          if (error instanceof Error) {
            toast.error(error.message);
          } else {
            toast.error("An unknown error occurred");
          }
        } finally {
          setIsDeleting(false);
        }
      },
    });
  };

  const handleUpdateBrokerId = async (e: FormEvent) => {
    e.preventDefault();

    if (!dexId.trim()) {
      toast.error("Please enter a DEX ID");
      return;
    }

    if (!brokerId.trim()) {
      toast.error("Please enter a Broker ID");
      return;
    }

    const dexName = "Selected DEX";
    const currentBrokerId = "Current";

    openModal("confirmation", {
      title: "Update Broker ID",
      message: `Are you sure you want to update the broker ID for "${dexName}" from "${currentBrokerId}" to "${brokerId.trim()}"?`,
      warningMessage:
        "Updating the broker ID will affect the DEX's integration with the Orderly Network. This change will be immediate and may impact trading functionality.",
      confirmButtonText: "Update Broker ID",
      confirmButtonVariant: "warning",
      onConfirm: async () => {
        setIsUpdatingBrokerId(true);
        try {
          await post<UpdateBrokerIdResponse>(
            `api/admin/dex/${dexId}/broker-id`,
            { brokerId: brokerId.trim() },
            token,
            { showToastOnError: false }
          );

          toast.success("Broker ID updated successfully");
          loadDexStats();
        } catch (error) {
          console.error("Error updating broker ID:", error);
          if (error instanceof Error) {
            toast.error(error.message);
          } else {
            toast.error("An unknown error occurred");
          }
        } finally {
          setIsUpdatingBrokerId(false);
        }
      },
    });
  };

  const handleRenameRepo = async (e: FormEvent) => {
    e.preventDefault();

    if (!repoDexId.trim()) {
      toast.error("Please enter a DEX ID");
      return;
    }

    if (!newRepoName.trim()) {
      toast.error("Please enter a new repository name");
      return;
    }

    const dexName = "Selected DEX";
    const currentRepoName = "Current Repository";

    openModal("confirmation", {
      title: "Rename Repository",
      message: `Are you sure you want to rename the repository for "${dexName}" from "${currentRepoName}" to "${newRepoName.trim()}"?`,
      warningMessage:
        "Renaming the repository will update all references including the deployment URL. This may cause temporary downtime during the transition.",
      confirmButtonText: "Rename Repository",
      confirmButtonVariant: "warning",
      onConfirm: async () => {
        setIsRenamingRepo(true);
        try {
          await post<RenameRepoResponse>(
            `api/admin/dex/${repoDexId}/rename-repo`,
            { newName: newRepoName.trim() },
            token,
            { showToastOnError: false }
          );

          toast.success("Repository renamed successfully");
          loadDexStats();
        } catch (error) {
          console.error("Error renaming repository:", error);
          if (error instanceof Error) {
            toast.error(error.message);
          } else {
            toast.error("An unknown error occurred");
          }
        } finally {
          setIsRenamingRepo(false);
        }
      },
    });
  };

  const handleManualBrokerCreation = async (e: FormEvent) => {
    e.preventDefault();

    if (!manualDexId.trim()) {
      toast.error("Please select a DEX");
      return;
    }

    if (!manualBrokerId.trim()) {
      toast.error("Please enter a broker ID");
      return;
    }

    if (!manualTxHash.trim()) {
      toast.error("Please enter a transaction hash");
      return;
    }

    const dexName = selectedDexName || "Selected DEX";

    openModal("confirmation", {
      title: "Create Broker ID Manually",
      message: `Are you sure you want to manually create broker ID "${manualBrokerId.trim()}" for "${dexName}"?`,
      warningMessage:
        "This will create the broker ID on-chain without requiring payment verification. The DEX will be graduated automatically and fees will be set as specified.",
      confirmButtonText: "Create Broker ID",
      confirmButtonVariant: "primary",
      onConfirm: async () => {
        setIsCreatingManualBroker(true);
        setManualBrokerResult(null);
        try {
          const response = await post<ManualBrokerCreationResponse>(
            `api/admin/dex/${manualDexId}/create-broker`,
            {
              brokerId: manualBrokerId.trim(),
              makerFee: manualMakerFee,
              takerFee: manualTakerFee,
              rwaMakerFee: manualRwaMakerFee,
              rwaTakerFee: manualRwaTakerFee,
              txHash: manualTxHash.trim(),
              chainId: manualChainId,
            },
            token,
            { showToastOnError: false }
          );

          toast.success(response.message);
          setManualBrokerResult(response);
          loadDexStats();
          setManualDexId("");
          setSelectedDexName("");
          setManualBrokerId("");
          setManualMakerFee(30);
          setManualTakerFee(60);
          setManualRwaMakerFee(0);
          setManualRwaTakerFee(50);
          setManualTxHash("");
          setManualChainId(undefined);
        } catch (error) {
          setManualBrokerResult(null);
          console.error("Error creating manual broker ID:", error);
          if (error instanceof Error) {
            toast.error(error.message);
          } else {
            toast.error("An unknown error occurred");
          }
        } finally {
          setIsCreatingManualBroker(false);
        }
      },
    });
  };

  if (isLoading) {
    return (
      <div className="w-full max-w-3xl mx-auto px-4 py-6 md:py-10 text-center mt-26 pb-52">
        <div className="i-svg-spinners:pulse-rings-multiple h-12 w-12 mx-auto text-primary-light mb-4"></div>
        <p>Checking admin status...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="w-full max-w-3xl mx-auto px-4 py-6 md:py-10 mt-26 pb-52">
        <h1 className="text-2xl md:text-3xl font-bold mb-6">Admin Tools</h1>
        <div className="bg-error/10 backdrop-blur-sm rounded-xl p-4 md:p-6 border border-error/20">
          <p className="text-error font-medium mb-2">⚠️ Access Denied</p>
          <p className="text-gray-300 text-sm">
            You don't have admin privileges to access this page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6 md:py-10 mt-26 pb-52">
      <h1 className="text-2xl md:text-3xl font-bold mb-6">Admin Tools</h1>
      <div className="bg-warning/10 backdrop-blur-sm rounded-xl p-4 md:p-6 border border-warning/20 mb-6">
        <p className="text-warning font-medium mb-2">
          ⚠️ Warning: Admin Only Area
        </p>
        <p className="text-gray-300 text-sm">
          This page contains tools for administrators only. Improper use can
          result in data loss.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Admin Users Section */}
        <div className="bg-light/5 backdrop-blur-sm rounded-xl p-4 md:p-6 border border-light/10">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-medium">Admin Users</h2>
            <button
              onClick={loadAdminUsers}
              disabled={isLoadingAdmins}
              className="p-1 rounded hover:bg-dark/50"
              title="Refresh admin list"
            >
              <div
                className={`i-mdi:refresh h-5 w-5 ${isLoadingAdmins ? "animate-spin" : ""}`}
              ></div>
            </button>
          </div>
          <p className="text-gray-400 text-sm mb-4">
            List of users with admin privileges.
          </p>

          {isLoadingAdmins ? (
            <div className="text-center py-4">
              <div className="i-svg-spinners:pulse-rings h-8 w-8 mx-auto text-primary-light mb-2"></div>
              <p className="text-sm text-gray-400">Loading admins...</p>
            </div>
          ) : (
            <>
              {adminUsers.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left border-b border-light/10">
                        <th className="px-2 py-2">Address</th>
                        <th className="px-2 py-2">Added On</th>
                      </tr>
                    </thead>
                    <tbody>
                      {adminUsers.map(admin => (
                        <tr key={admin.id} className="border-b border-light/5">
                          <td className="px-2 py-3 font-mono text-xs">
                            {admin.address.substring(0, 6)}...
                            {admin.address.substring(admin.address.length - 4)}
                          </td>
                          <td className="px-2 py-3">
                            {new Date(admin.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-400 text-sm italic">
                  No admin users found.
                </p>
              )}
            </>
          )}
        </div>

        {/* Broker ID Management */}
        <div className="bg-primary/5 backdrop-blur-sm rounded-xl p-4 md:p-6 border border-primary/10">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-medium">Broker ID Management</h2>
            <button
              onClick={() => {
                loadDexStats();
              }}
              className="p-1 rounded hover:bg-dark/50"
              title="Refresh stats"
            >
              <div className="i-mdi:refresh h-5 w-5"></div>
            </button>
          </div>
          <p className="text-gray-400 text-sm mb-4">
            Manage broker ID configurations and fee settings for DEXs.
            Graduation is now automated - users can graduate their DEX by
            sending ORDER tokens.
          </p>

          {/* Quick Stats */}
          <div className="mb-6">
            <h3 className="text-sm font-medium mb-2 flex items-center">
              <div className="i-mdi:chart-box text-primary-light mr-1.5 h-4 w-4"></div>
              Quick Stats
            </h3>

            <div className="grid grid-cols-1 gap-4">
              <div className="bg-success/10 rounded-lg p-3">
                <div className="flex flex-col">
                  <span className="text-xs text-gray-400">
                    Active Broker IDs
                  </span>
                  <span className="text-2xl font-medium text-success">
                    {dexStats?.graduated?.allTime || 0}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Update Broker ID Section */}
        <div className="bg-light/5 backdrop-blur-sm rounded-xl p-4 md:p-6 border border-light/10">
          <h2 className="text-xl font-medium mb-4" id="update-broker-id">
            Update Broker ID
          </h2>
          <p className="text-gray-400 text-sm mb-4">
            Update the broker ID for a specific DEX. This affects the DEX's
            integration with the Orderly Network.
          </p>

          <form onSubmit={handleUpdateBrokerId}>
            <div className="mb-4">
              <label
                htmlFor="brokerSearch"
                className="block text-sm font-medium mb-1"
              >
                Search DEX
              </label>
              <FuzzySearchInput
                placeholder="Search by DEX ID, broker name, or broker ID..."
                onSearch={handleBrokerSearch}
                initialValue={brokerSearchQuery}
                className="mb-2"
              />

              {filteredBrokerDexes.length > 0 && (
                <div className="mt-2 border border-light/10 rounded-lg overflow-hidden">
                  <div className="max-h-48 overflow-y-auto">
                    {filteredBrokerDexes.map(dex => (
                      <div
                        key={dex.id}
                        className="p-2 hover:bg-primary-light/10 cursor-pointer flex justify-between border-b border-light/5 last:border-b-0"
                        onClick={() => handleSelectBrokerDex(dex)}
                      >
                        <div>
                          <div className="font-medium">
                            {dex.brokerName || "Unnamed DEX"}
                          </div>
                          <div className="text-xs text-gray-400">
                            ID: {dex.id.substring(0, 8)}...
                          </div>
                          <div className="text-xs text-gray-400">
                            Current Broker ID: {dex.brokerId}
                          </div>
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(dex.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {brokerSearchQuery &&
                filteredBrokerDexes.length === 0 &&
                !isSearchingBroker && (
                  <div className="text-sm text-gray-400 p-2">
                    No DEXs found matching your search.
                  </div>
                )}

              {isSearchingBroker && (
                <div className="text-center py-2">
                  <div className="i-svg-spinners:pulse-rings h-6 w-6 mx-auto text-primary-light/80"></div>
                  <p className="text-xs text-gray-300 mt-1">Searching...</p>
                </div>
              )}
            </div>

            <FormInput
              id="dexId"
              label="DEX ID"
              value={dexId}
              onChange={e => setDexId(e.target.value)}
              placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
              helpText="Enter the UUID of the DEX to update"
              required
            />

            <FormInput
              id="brokerId"
              label="New Broker ID"
              value={brokerId}
              onChange={e => setBrokerId(e.target.value)}
              placeholder="new-broker-id"
              helpText="Enter the new broker ID (1-50 characters)"
              required
              minLength={1}
              maxLength={50}
            />

            <Button
              type="submit"
              variant="primary"
              isLoading={isUpdatingBrokerId}
              loadingText="Updating..."
              className="mt-2"
            >
              Update Broker ID
            </Button>
          </form>
        </div>

        {/* Rename Repository Section */}
        <div className="bg-light/5 backdrop-blur-sm rounded-xl p-4 md:p-6 border border-light/10">
          <h2 className="text-xl font-medium mb-4">Rename Repository</h2>
          <p className="text-gray-400 text-sm mb-4">
            Rename the GitHub repository for a DEX. This will update all
            references including the deployment URL.
          </p>

          <form onSubmit={handleRenameRepo}>
            <div className="mb-4">
              <label
                htmlFor="repoSearch"
                className="block text-sm font-medium mb-1"
              >
                Search DEX
              </label>
              <FuzzySearchInput
                placeholder="Search by DEX ID, broker name, or repository URL..."
                onSearch={handleRepoSearch}
                initialValue={repoSearchQuery}
                className="mb-2"
              />

              {filteredRepoDexes.length > 0 && (
                <div className="mt-2 border border-light/10 rounded-lg overflow-hidden">
                  <div className="max-h-48 overflow-y-auto">
                    {filteredRepoDexes.map(dex => (
                      <div
                        key={dex.id}
                        className="p-2 hover:bg-primary-light/10 cursor-pointer flex justify-between border-b border-light/5 last:border-b-0"
                        onClick={() => handleSelectRepoDex(dex)}
                      >
                        <div>
                          <div className="font-medium">
                            {dex.brokerName || "Unnamed DEX"}
                          </div>
                          <div className="text-xs text-gray-400">
                            ID: {dex.id.substring(0, 8)}...
                          </div>
                          {dex.repoUrl && (
                            <div className="text-xs text-gray-400 truncate max-w-xs">
                              Repo:{" "}
                              {dex.repoUrl.replace("https://github.com/", "")}
                            </div>
                          )}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(dex.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {repoSearchQuery &&
                filteredRepoDexes.length === 0 &&
                !isSearchingRepo && (
                  <div className="text-sm text-gray-400 p-2">
                    No DEXs found matching your search.
                  </div>
                )}

              {isSearchingRepo && (
                <div className="text-center py-2">
                  <div className="i-svg-spinners:pulse-rings h-6 w-6 mx-auto text-primary-light/80"></div>
                  <p className="text-xs text-gray-300 mt-1">Searching...</p>
                </div>
              )}
            </div>

            <FormInput
              id="repoDexId"
              label="DEX ID"
              value={repoDexId}
              onChange={e => setRepoDexId(e.target.value)}
              placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
              helpText="Enter the UUID of the DEX to update"
              required
            />

            <FormInput
              id="newRepoName"
              label="New Repository Name"
              value={newRepoName}
              onChange={e => setNewRepoName(e.target.value)}
              placeholder="new-repo-name"
              helpText="Lowercase letters, numbers, and hyphens only"
              required
              pattern="^[a-z0-9-]+$"
              minLength={1}
              maxLength={90}
            />

            <Button
              type="submit"
              variant="primary"
              isLoading={isRenamingRepo}
              loadingText="Renaming..."
              className="mt-2"
            >
              Rename Repository
            </Button>
          </form>
        </div>

        {/* Delete DEX Section */}
        <div className="bg-error/10 backdrop-blur-sm rounded-xl p-4 md:p-6 border border-error/20">
          <div className="flex items-center mb-4">
            <div className="i-mdi:alert-octagon text-error mr-2 h-6 w-6" />
            <h2 className="text-xl font-medium text-error">Delete DEX</h2>
          </div>
          <p className="text-gray-400 text-sm mb-6">
            Danger zone! This tool will{" "}
            <span className="text-error font-semibold">
              permanently delete a DEX
            </span>{" "}
            and all associated data. This action{" "}
            <span className="font-semibold">cannot be undone</span>.
          </p>

          <form onSubmit={handleDeleteDex}>
            <div className="mb-4">
              <label
                htmlFor="dexSearch"
                className="block text-sm font-medium mb-1 text-error"
              >
                Search DEX
              </label>
              <FuzzySearchInput
                placeholder="Search by wallet address, broker name, broker ID, or DEX ID..."
                onSearch={handleDeleteDexSearch}
                initialValue=""
                className="mb-2"
              />

              {filteredDeleteDexes.length > 0 && (
                <div className="mt-2 border border-error/30 rounded-lg overflow-hidden">
                  <div className="max-h-48 overflow-y-auto">
                    {filteredDeleteDexes.map(dex => (
                      <div
                        key={dex.id}
                        className="p-2 hover:bg-error/10 cursor-pointer flex justify-between items-center border-b border-error/20 last:border-b-0"
                        onClick={() => handleSelectDexToDelete(dex)}
                      >
                        <div>
                          <div className="font-medium">
                            {dex.brokerName || "Unnamed DEX"}
                          </div>
                          <div className="text-xs font-mono text-gray-400">
                            ID: {dex.id.substring(0, 8)}...
                          </div>
                          <div className="text-xs font-mono text-gray-400">
                            Wallet: {dex.user.address.substring(0, 8)}...
                            {dex.user.address.substring(
                              dex.user.address.length - 6
                            )}
                          </div>
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(dex.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {filteredDeleteDexes.length === 0 && !isSearchingDelete && (
                <div className="text-sm text-gray-400 p-2">
                  No DEXs found matching your search.
                </div>
              )}

              {isSearchingDelete && (
                <div className="text-center py-2">
                  <div className="i-svg-spinners:pulse-rings h-6 w-6 mx-auto text-primary-light/80"></div>
                  <p className="text-xs text-gray-300 mt-1">Searching...</p>
                </div>
              )}
            </div>

            <div>
              <label
                htmlFor="dexToDeleteId"
                className="block text-sm font-medium mb-1 text-error"
              >
                DEX ID
              </label>
              <input
                type="text"
                id="dexToDeleteId"
                value={dexToDeleteId}
                onChange={e => setDexToDeleteId(e.target.value)}
                placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                className="w-full bg-dark rounded px-4 py-3 text-base border border-error/30 focus:border-error outline-none placeholder:text-gray-500"
              />
              <div className="text-xs text-gray-400 mt-1">
                Enter the DEX ID or use the search above to find a DEX
              </div>
            </div>

            <Button
              type="submit"
              variant="danger"
              isLoading={isDeleting}
              loadingText="Deleting..."
              className="mt-4 text-base font-semibold py-3"
            >
              Delete DEX
            </Button>
          </form>
        </div>

        {/* Manual Broker Creation Section */}
        <div className="bg-success/10 backdrop-blur-sm rounded-xl p-4 md:p-6 border border-success/20">
          <div className="flex items-center mb-4">
            <div className="i-mdi:plus-circle text-success mr-2 h-6 w-6" />
            <h2 className="text-xl font-medium text-success">
              Manual Broker Creation
            </h2>
          </div>
          <p className="text-gray-400 text-sm mb-6">
            Create a broker ID manually for any user without requiring payment
            verification. A transaction hash must be provided as proof of some
            transaction, but it won't be validated.
          </p>

          <form onSubmit={handleManualBrokerCreation} className="space-y-4">
            <div className="mb-4">
              <label
                htmlFor="manualSearch"
                className="block text-sm font-medium mb-1"
              >
                Search DEX
              </label>
              <FuzzySearchInput
                placeholder="Search by DEX ID, broker name, or wallet address..."
                onSearch={handleManualSearch}
                initialValue={manualSearchQuery}
                className="mb-2"
              />

              {filteredManualDexes.length > 0 && (
                <div className="mt-2 border border-success/30 rounded-lg overflow-hidden">
                  <div className="max-h-48 overflow-y-auto">
                    {filteredManualDexes.map(dex => (
                      <div
                        key={dex.id}
                        className="p-2 hover:bg-success/10 cursor-pointer flex justify-between border-b border-success/20 last:border-b-0"
                        onClick={() => handleSelectManualDex(dex)}
                      >
                        <div>
                          <div className="font-medium">
                            {dex.brokerName || "Unnamed DEX"}
                          </div>
                          <div className="text-xs text-gray-400">
                            DEX ID: {dex.id.substring(0, 8)}...
                          </div>
                          <div className="text-xs text-gray-400">
                            Wallet: {dex.user.address.substring(0, 8)}...
                            {dex.user.address.substring(
                              dex.user.address.length - 6
                            )}
                          </div>
                          <div className="text-xs text-gray-400">
                            Broker ID: {dex.brokerId || "None"}
                          </div>
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(dex.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {manualSearchQuery &&
                filteredManualDexes.length === 0 &&
                !isSearchingManual && (
                  <div className="text-sm text-gray-400 p-2">
                    No eligible DEXs found. DEX must have a repository and no
                    existing broker ID.
                  </div>
                )}

              {isSearchingManual && (
                <div className="text-center py-2">
                  <div className="i-svg-spinners:pulse-rings h-6 w-6 mx-auto text-success/80"></div>
                  <p className="text-xs text-gray-300 mt-1">Searching...</p>
                </div>
              )}
            </div>

            <FormInput
              id="manualDexId"
              label="DEX ID"
              value={manualDexId}
              onChange={e => setManualDexId(e.target.value)}
              placeholder="dex-..."
              helpText={
                selectedDexName
                  ? `DEX ID for: ${selectedDexName}`
                  : "DEX ID (auto-filled when selecting a DEX from search)"
              }
              required
            />

            <FormInput
              id="manualBrokerId"
              label="Broker ID"
              value={manualBrokerId}
              onChange={e => setManualBrokerId(e.target.value)}
              placeholder="new-broker-id"
              helpText="5-15 characters, lowercase letters, numbers, hyphens, and underscores only. Cannot contain 'orderly'"
              required
              minLength={5}
              maxLength={15}
              pattern="^[a-z0-9_-]+$"
            />

            {manualBrokerIdError && (
              <div className="mt-1 text-xs text-error flex items-center">
                <span className="i-mdi:alert-circle mr-1"></span>
                {manualBrokerIdError}
              </div>
            )}

            {!manualBrokerIdError && manualBrokerId && (
              <div className="mt-1 text-xs text-success flex items-center">
                <span className="i-mdi:check-circle mr-1"></span>
                Broker ID is available
              </div>
            )}

            <FormInput
              id="manualTxHash"
              label="Transaction Hash"
              value={manualTxHash}
              onChange={e => setManualTxHash(e.target.value)}
              placeholder="0x..."
              helpText="Transaction hash as proof (will not be validated for payment)"
              required
              minLength={10}
              maxLength={100}
            />

            <div className="mb-4">
              <label
                htmlFor="manualChainId"
                className="block text-sm font-medium mb-1"
              >
                Chain (Optional)
              </label>
              <select
                id="manualChainId"
                value={manualChainId || ""}
                onChange={e =>
                  setManualChainId(
                    e.target.value ? parseInt(e.target.value) : undefined
                  )
                }
                className="w-full bg-dark rounded px-4 py-3 text-base border border-light/10 focus:border-primary-light outline-none"
              >
                <option value="">Select chain (optional)</option>
                <optgroup label="Mainnet">
                  {Object.values(ALL_CHAINS)
                    .filter(
                      chain =>
                        !chain.isTestnet &&
                        (
                          [
                            "ethereum",
                            "arbitrum",
                            "base",
                            "solana-mainnet-beta",
                          ] as OrderTokenChainName[]
                        ).includes(chain.id as OrderTokenChainName)
                    )
                    .map(chain => (
                      <option key={chain.chainId} value={chain.chainId}>
                        {chain.name}
                      </option>
                    ))}
                </optgroup>
                <optgroup label="Testnet">
                  {Object.values(ALL_CHAINS)
                    .filter(
                      chain =>
                        chain.isTestnet &&
                        (
                          [
                            "sepolia",
                            "arbitrum-sepolia",
                            "base-sepolia",
                            "solana-devnet",
                          ] as OrderTokenChainName[]
                        ).includes(chain.id as OrderTokenChainName)
                    )
                    .map(chain => (
                      <option key={chain.chainId} value={chain.chainId}>
                        {chain.name}
                      </option>
                    ))}
                </optgroup>
              </select>
              <div className="text-xs text-gray-400 mt-1">
                Select the chain where the transaction occurred (ORDER/USDC
                available chains)
              </div>
            </div>

            <div className="bg-light/5 rounded-xl p-4 mb-4">
              <h3 className="text-md font-medium mb-2 flex items-center">
                <div className="i-mdi:cog text-gray-400 w-5 h-5 mr-2"></div>
                Trading Fee Configuration
              </h3>
              <p className="text-sm text-gray-300 mb-4">
                Configure the trading fees for this DEX.
              </p>

              <div className="mb-4">
                <h4 className="text-sm font-semibold mb-2 text-gray-200">
                  Standard Fees
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormInput
                    id="manualMakerFee"
                    label="Maker Fee (bps)"
                    type="number"
                    value={manualMakerFee.toString()}
                    onChange={e =>
                      setManualMakerFee(parseInt(e.target.value) || 0)
                    }
                    placeholder="3"
                    helpText="0-15 bps"
                    required
                  />

                  <FormInput
                    id="manualTakerFee"
                    label="Taker Fee (bps)"
                    type="number"
                    value={manualTakerFee.toString()}
                    onChange={e =>
                      setManualTakerFee(parseInt(e.target.value) || 0)
                    }
                    placeholder="6"
                    helpText="3-15 bps"
                    required
                  />
                </div>
              </div>

              <div className="mb-4">
                <h4 className="text-sm font-semibold mb-2 text-gray-200">
                  RWA Asset Fees
                </h4>
                <p className="text-xs text-gray-400 mb-3">
                  Configure separate fees for Real World Asset (RWA) trading.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormInput
                    id="manualRwaMakerFee"
                    label="RWA Maker Fee (bps)"
                    type="number"
                    value={manualRwaMakerFee.toString()}
                    onChange={e =>
                      setManualRwaMakerFee(parseInt(e.target.value) || 0)
                    }
                    placeholder="0"
                    helpText="0-15 bps"
                  />

                  <FormInput
                    id="manualRwaTakerFee"
                    label="RWA Taker Fee (bps)"
                    type="number"
                    value={manualRwaTakerFee.toString()}
                    onChange={e =>
                      setManualRwaTakerFee(parseInt(e.target.value) || 0)
                    }
                    placeholder="5"
                    helpText="0-15 bps"
                  />
                </div>
              </div>

              <div className="mt-4 p-3 bg-info/10 rounded-lg border border-info/20">
                <div className="flex items-start space-x-2">
                  <div className="i-mdi:information-outline text-info mt-0.5 h-4 w-4 flex-shrink-0"></div>
                  <div className="text-xs text-gray-300">
                    <p className="font-medium text-info mb-1">
                      Fee Calculation:
                    </p>
                    <p className="font-medium text-gray-200 mt-2 mb-1">
                      Standard:
                    </p>
                    <p>
                      • Maker Fee: {manualMakerFee} bps ({manualMakerFee * 0.01}
                      %)
                    </p>
                    <p>
                      • Taker Fee: {manualTakerFee} bps ({manualTakerFee * 0.01}
                      %)
                    </p>
                    <p className="font-medium text-gray-200 mt-2 mb-1">RWA:</p>
                    <p>
                      • RWA Maker Fee: {manualRwaMakerFee} bps (
                      {manualRwaMakerFee * 0.01}%)
                    </p>
                    <p>
                      • RWA Taker Fee: {manualRwaTakerFee} bps (
                      {manualRwaTakerFee * 0.01}%)
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              isLoading={isCreatingManualBroker}
              loadingText="Creating broker ID..."
              className="mt-2 text-base font-semibold py-3"
              disabled={
                !manualDexId ||
                !manualBrokerId ||
                !manualTxHash ||
                !!manualBrokerIdError ||
                manualMakerFee < 0 ||
                manualMakerFee > 15 ||
                manualTakerFee < 3 ||
                manualTakerFee > 15
              }
            >
              Create Broker ID Manually
            </Button>
          </form>

          {manualBrokerResult && (
            <div className="mt-6 bg-dark/40 border border-success/30 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <div className="i-mdi:check-circle text-success mr-2 h-5 w-5" />
                <span className="text-success font-medium">
                  Broker ID created successfully
                </span>
              </div>
              <div className="text-xs text-gray-300 mb-1">
                <strong>Broker ID:</strong>{" "}
                {manualBrokerResult.brokerCreationData.brokerId}
              </div>
              <div className="text-xs text-gray-300 mb-1">
                <strong>DEX:</strong> {manualBrokerResult.dex.brokerName} (ID:{" "}
                {manualBrokerResult.dex.id})
              </div>
              <div className="text-xs text-gray-300">
                <strong>Transaction Hashes:</strong>
                <ul className="list-disc ml-6 mt-1">
                  {Object.entries(
                    manualBrokerResult.brokerCreationData.transactionHashes
                  ).map(([chainId, txHash]) => (
                    <li key={txHash} className="break-all">
                      <a
                        href={
                          getBlockExplorerUrlByChainId(
                            txHash,
                            parseInt(chainId)
                          ) || "#"
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary-light hover:underline"
                      >
                        {getChainName(parseInt(chainId))}: {txHash}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>

        <AllDexesList
          token={token || ""}
          onCustomDomainOverrideUpdate={handleCustomDomainOverride}
          onRedeployment={handleRedeployment}
          isUpdatingCustomDomainOverride={isUpdatingCustomDomainOverride}
          redeployingDexes={redeployingDexes}
        />
      </div>
    </div>
  );
}
