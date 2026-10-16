import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import {
  Batch,
  Demand,
  Order,
  InventoryEvent,
  TestReport,
  Alert,
  SensorReading,
} from "../types";
import { useAuth } from "./AuthContext";
import { evaluateMatch } from "../engine/matching";
import { apiFetch, readApiJson } from "../lib/api";

export type SyncStatus = "Saved" | "Saving…" | "Offline: changes will sync";

interface CollectionsState {
  batches: Batch[];
  demands: Demand[];
  orders: Order[];
  events: InventoryEvent[];
  testReports: TestReport[];
  alerts: Alert[];
  sensor_readings: SensorReading[];
}

interface DataContextType {
  batches: Batch[];
  demands: Demand[];
  orders: Order[];
  events: InventoryEvent[];
  testReports: TestReport[];
  alerts: Alert[];
  sensor_readings: SensorReading[];
  syncStatus: SyncStatus;
  version: number;
  lastSyncedAt: string;
  saveRecord: (
    collection: keyof CollectionsState,
    data: any,
  ) => Promise<{ success: boolean; error?: string }>;
  deleteRecord: (
    collection: keyof CollectionsState,
    id: string,
  ) => Promise<{ success: boolean; error?: string }>;
  markAlertRead: (id: string) => Promise<void>;
  clearSampleData: () => Promise<void>;
  resetSampleData: () => Promise<void>;
  exportAllData: () => void;
  refreshData: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = "buildloop_data_cache";

const defaultCollections: CollectionsState = {
  batches: [],
  demands: [],
  orders: [],
  events: [],
  testReports: [],
  alerts: [],
  sensor_readings: [],
};

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user } = useAuth();
  const [collections, setCollections] = useState<CollectionsState>(() => {
    try {
      const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (cached) {
        return { ...defaultCollections, ...JSON.parse(cached) };
      }
    } catch {
      // ignore
    }
    return defaultCollections;
  });

  const [syncStatus, setSyncStatus] = useState<SyncStatus>("Saved");
  const [version, setVersion] = useState<number>(0);
  const [lastSyncedAt, setLastSyncedAt] = useState<string>(
    new Date().toISOString(),
  );
  const localVersionRef = useRef<number>(0);
  const pendingSyncQueue = useRef<
    Array<{ id: string; collection: string; data: any; action?: string }>
  >([]);

  // Save to local storage whenever collections change
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(collections));
    } catch {
      // ignore
    }
  }, [collections]);

  // Fetch full data from server
  const fetchAllData = useCallback(async () => {
    try {
      setSyncStatus("Saving…");
      const res = await apiFetch("/api/data");
      if (!res.ok) throw new Error("Failed to load server data");
      const json = await readApiJson<any>(res);
      const loaded: CollectionsState = {
        batches: (json.collections.batches || []).map((r: any) => r.data),
        demands: (json.collections.demands || []).map((r: any) => r.data),
        orders: (json.collections.orders || []).map((r: any) => r.data),
        events: (json.collections.events || []).map((r: any) => r.data),
        testReports: (json.collections.testReports || []).map(
          (r: any) => r.data,
        ),
        alerts: (json.collections.alerts || []).map((r: any) => r.data),
        sensor_readings: (json.collections.sensor_readings || []).map(
          (r: any) => r.data,
        ),
      };

      setCollections(loaded);
      setVersion(json.version);
      localVersionRef.current = json.version;
      setLastSyncedAt(json.lastUpdated || new Date().toISOString());
      setSyncStatus("Saved");
    } catch (err) {
      console.warn("[Sync] Offline or fetch failed:", err);
      setSyncStatus("Offline: changes will sync");
    }
  }, []);

  // Poll version every 5 seconds
  useEffect(() => {
    fetchAllData();

    const interval = setInterval(async () => {
      try {
        const res = await apiFetch("/api/data/version");
        if (!res.ok) throw new Error("Version check failed");
        const data = await readApiJson<any>(res);
        if (data.version > localVersionRef.current) {
          fetchAllData();
        } else {
          setSyncStatus("Saved");
        }
      } catch {
        setSyncStatus("Offline: changes will sync");
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [fetchAllData]);

  // Rematch open demands against batches and generate alerts if a strong match (>=80) is found
  const rematchOpenDemands = useCallback(
    (currentBatches: Batch[], currentDemands: Demand[]) => {
      const openDemands = currentDemands.filter((d) => d.status === "open");
      const publishedBatches = currentBatches.filter(
        (b) => b.status === "published",
      );

      for (const d of openDemands) {
        for (const b of publishedBatches) {
          const match = evaluateMatch(b, d);
          if (match.passedHardFilters && match.totalScore >= 80) {
            // Check if alert already exists
            const alreadyAlerted = collections.alerts.some(
              (a) => a.userId === d.buyerId && a.link.includes(b.id),
            );
            if (!alreadyAlerted) {
              const newAlert: Alert = {
                id: `alt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
                userId: d.buyerId,
                type: "match_found",
                title: `A new batch matches your demand: ${match.totalScore}/100`,
                body: `${b.title} matches "${d.title}" (${match.band} band, ₹${match.netSaving} est. savings).`,
                link: `#/batches/${b.id}`,
                read: false,
                created_at: new Date().toISOString(),
              };
              saveRecord("alerts", newAlert);
            }
          }
        }
      }
    },
    [collections.alerts],
  );

  const saveRecord = async (
    collection: keyof CollectionsState,
    data: any,
  ): Promise<{ success: boolean; error?: string }> => {
    setSyncStatus("Saving…");

    // Optimistic local update
    setCollections((prev) => {
      const arr = prev[collection] as any[];
      const idx = arr.findIndex((item) => item.id === data.id);
      let updatedArr;
      if (idx >= 0) {
        updatedArr = [...arr];
        updatedArr[idx] = data;
      } else {
        updatedArr = [data, ...arr];
      }
      return { ...prev, [collection]: updatedArr };
    });

    try {
      const res = await apiFetch("/api/data/changes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          changes: [
            {
              id: data.id,
              collection,
              data,
              action: "upsert",
            },
          ],
        }),
      });

      const resData = await readApiJson<any>(res);
      if (!res.ok) {
        throw new Error(resData.error || "Failed to save record on server");
      }

      setVersion(resData.version);
      localVersionRef.current = resData.version;
      setSyncStatus("Saved");

      // Trigger auto-rematch if a batch or demand was saved
      if (collection === "batches" || collection === "demands") {
        const nextBatches =
          collection === "batches"
            ? [data, ...collections.batches.filter((b) => b.id !== data.id)]
            : collections.batches;
        const nextDemands =
          collection === "demands"
            ? [data, ...collections.demands.filter((d) => d.id !== data.id)]
            : collections.demands;
        rematchOpenDemands(nextBatches, nextDemands);
      }

      return { success: true };
    } catch (err: any) {
      console.warn("[Sync Error]", err);
      setSyncStatus("Offline: changes will sync");
      pendingSyncQueue.current.push({
        id: data.id,
        collection,
        data,
        action: "upsert",
      });
      return { success: false, error: err.message };
    }
  };

  const deleteRecord = async (
    collection: keyof CollectionsState,
    id: string,
  ): Promise<{ success: boolean; error?: string }> => {
    setSyncStatus("Saving…");

    // Optimistic local deletion
    setCollections((prev) => ({
      ...prev,
      [collection]: (prev[collection] as any[]).filter(
        (item) => item.id !== id,
      ),
    }));

    try {
      const res = await apiFetch("/api/data/changes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          changes: [{ id, collection, data: {}, action: "delete" }],
        }),
      });
      const resData = await readApiJson<any>(res);
      if (!res.ok) throw new Error(resData.error || "Failed to delete record");

      setVersion(resData.version);
      localVersionRef.current = resData.version;
      setSyncStatus("Saved");
      return { success: true };
    } catch (err: any) {
      setSyncStatus("Offline: changes will sync");
      return { success: false, error: err.message };
    }
  };

  const markAlertRead = async (id: string) => {
    const alert = collections.alerts.find((a) => a.id === id);
    if (!alert) return;
    await saveRecord("alerts", { ...alert, read: true });
  };

  const clearSampleData = async () => {
    try {
      setSyncStatus("Saving…");
      const res = await apiFetch("/api/data/clear-sample", { method: "POST" });
      if (res.ok) {
        await fetchAllData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const resetSampleData = async () => {
    try {
      setSyncStatus("Saving…");
      const res = await apiFetch("/api/data/reset-sample", { method: "POST" });
      if (res.ok) {
        await fetchAllData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const exportAllData = () => {
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(collections, null, 2),
    )}`;
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", jsonString);
    downloadAnchor.setAttribute(
      "download",
      `buildloop_export_${new Date().toISOString().slice(0, 10)}.json`,
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <DataContext.Provider
      value={{
        batches: collections.batches,
        demands: collections.demands,
        orders: collections.orders,
        events: collections.events,
        testReports: collections.testReports,
        alerts: collections.alerts,
        sensor_readings: collections.sensor_readings,
        syncStatus,
        version,
        lastSyncedAt,
        saveRecord,
        deleteRecord,
        markAlertRead,
        clearSampleData,
        resetSampleData,
        exportAllData,
        refreshData: fetchAllData,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used within DataProvider");
  return ctx;
}
