"use client";

import { useEffect, useState, useCallback } from "react";

export const dynamic = "force-dynamic"; // still opt-out of caching

interface CurrentUser {
  id: number | string;
  email: string;
  name?: string;
  organizationId?: number;
  needsOnboarding?: boolean;
  role?: string;
}

interface UserSalesStats {
  userId: string;
  userName: string;
  userEmail: string;
  salesCount: number;
  totalRevenue: number;
}

export default function Dashboard() {
  const [me, setMe] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [orgName, setOrgName] = useState("-");
  const [salesStats, setSalesStats] = useState<UserSalesStats[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch current user via frontend proxy (keeps cookies)
      const userRes = await fetch("/api/backend/account", {
        cache: "no-store",
      });
      if (userRes.status === 401) {
        setMe(null);
        setLoading(false);
        return;
      }
      if (!userRes.ok) throw new Error(`Failed user fetch: ${userRes.status}`);
      const userJson: CurrentUser = await userRes.json();
      setMe(userJson);

      // Parallel fetches that depend on user
      if (userJson.organizationId) {
        // Fetch organization via Next.js proxy to avoid CORS and forward cookies
        try {
          const orgRes = await fetch(
            `/api/backend/organizations/${userJson.organizationId}`,
            { cache: "no-store" }
          );
          if (orgRes.ok) {
            const org = await orgRes.json();
            setOrgName(org?.name || "Unknown Organization");
          } else setOrgName("Unknown Organization");
        } catch {
          setOrgName("Unknown Organization");
        }

        try {
          const statsRes = await fetch(`/api/backend/inventory/sales-stats`, {
            cache: "no-store",
          });
          if (statsRes.ok) {
            const statsJson = await statsRes.json();
            if (Array.isArray(statsJson)) setSalesStats(statsJson);
          }
        } catch {
          // ignore stats errors silently
        }
      } else {
        setOrgName("No organization");
      }
    } catch (e: unknown) {
      function hasMessage(x: unknown): x is { message: string } {
        return (
          !!x &&
          typeof x === "object" &&
          "message" in x &&
          typeof (x as { message?: unknown }).message === "string"
        );
      }
      if (hasMessage(e)) setError(e.message);
      else setError("Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  if (loading) {
    return <p className="p-6">Loading dashboard...</p>;
  }

  if (!me) {
    return <p className="p-6">Not authenticated.</p>;
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <div className="rounded-lg bg-card p-6 shadow">
          {error && (
            <div className="mb-4 rounded border border-destructive/50 bg-destructive/10 px-4 py-2 text-sm text-destructive">
              {error}
            </div>
          )}
          <h1 className="text-3xl font-bold text-card-foreground mb-4">
            Welcome, {me.name || me.email}!
          </h1>
          <div className="space-y-2 text-muted-foreground mb-6">
            <p>
              <span className="font-medium text-card-foreground">Email:</span>{" "}
              {me.email}
            </p>
            <p>
              <span className="font-medium text-card-foreground">
                Organization:
              </span>{" "}
              {orgName}
            </p>
            <p>
              <span className="font-medium text-card-foreground">Role:</span>{" "}
              {me.role || "No role assigned"}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <a
              href="/inventory"
              className="block p-4 bg-blue-100 dark:bg-blue-900 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
            >
              <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-2">
                Inventory Management
              </h3>
              <p className="text-blue-600 dark:text-blue-300 text-sm">
                Manage stock levels, add products, and track inventory changes
              </p>
            </a>

            <a
              href="/pos"
              className="block p-4 bg-green-100 dark:bg-green-900 rounded-lg hover:bg-green-200 dark:hover:bg-green-800 transition-colors"
            >
              <h3 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-2">
                Point of Sales
              </h3>
              <p className="text-green-600 dark:text-green-300 text-sm">
                Process sales, manage cart, and handle customer transactions
              </p>
            </a>
          </div>

          {salesStats.length > 0 && (
            <div className="rounded-lg bg-card p-6 shadow">
              <h2 className="text-xl font-semibold text-card-foreground mb-4">
                Sales Performance
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 text-muted-foreground font-medium">
                        User
                      </th>
                      <th className="text-left py-2 text-muted-foreground font-medium">
                        Sales Count
                      </th>
                      <th className="text-left py-2 text-muted-foreground font-medium">
                        Total Revenue
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {salesStats.map((stat) => (
                      <tr
                        key={stat.userId}
                        className="border-b border-border last:border-0"
                      >
                        <td className="py-3">
                          <div>
                            <div className="font-medium text-card-foreground">
                              {stat.userName || "Unknown User"}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {stat.userEmail}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 text-card-foreground font-medium">
                          {stat.salesCount}
                        </td>
                        <td className="py-3 text-card-foreground font-medium">
                          €{stat.totalRevenue.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
