"use client";

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

interface DropdownTask {
  run: () => Promise<unknown>;
  setter: (value: unknown[]) => void;
}

interface DropdownDataContextType {
  loading: boolean;
  refreshDropdowns: () => Promise<void>;
}

const AllDropdownListDataContext = createContext<DropdownDataContextType>({
  loading: false,
  refreshDropdowns: async () => { },
});

const normalize = (r: unknown): unknown[] => {
  if (r && typeof r === "object") {
    const obj = r as Record<string, unknown>;
    if (Array.isArray(obj.data)) return obj.data;
  }
  if (Array.isArray(r)) return r;
  return r ? [r] : [];
};

export const AllDropdownListDataProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [loading, setLoading] = useState(false);

  const [countries, setCountries] = useState<unknown[]>([]);
  const [roles, setRoles] = useState<unknown[]>([]);
  const [units, setUnits] = useState<unknown[]>([]);

  const criticalTasks: DropdownTask[] = [
    // { run: fetchCountries, setter: setCountries },
    // { run: fetchRoles, setter: setRoles },
  ];

  const nonCriticalTasks: DropdownTask[] = [
    // { run: fetchUnits, setter: setUnits },
  ];

  const refreshDropdowns = async () => {
    try {
      setLoading(true);

      const criticalPromises = criticalTasks.map((t) => t.run());
      const criticalSettled = await Promise.allSettled(criticalPromises);

      criticalSettled.forEach((result, index) => {
        if (result.status === "fulfilled") {
          try {
            const arr = normalize(result.value);
            criticalTasks[index].setter(arr);
          } catch (e) {
            console.warn("Critical dropdown normalization failed", e);
          }
        } else {
          console.warn("Critical dropdown fetch failed", result.reason);
        }
      });

      const backgroundFetch = async () => {
        const nonCriticalPromises = nonCriticalTasks.map((t) => t.run());
        const settled = await Promise.allSettled(nonCriticalPromises);

        settled.forEach((result, index) => {
          if (result.status === "fulfilled") {
            try {
              const arr = normalize(result.value);
              nonCriticalTasks[index].setter(arr);
            } catch (e) {
              console.warn("Non-critical dropdown normalization failed", e);
            }
          } else {
            console.warn("Non-critical dropdown fetch failed", result.reason);
          }
        });
      };

      if ("requestIdleCallback" in window) {
        (window as any).requestIdleCallback(backgroundFetch, { timeout: 2000 });
      } else {
        setTimeout(backgroundFetch, 1500);
      }
    } catch (error) {
      console.error("refreshDropdowns error", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshDropdowns();
  }, []);

  return (
    <AllDropdownListDataContext.Provider
      value={{
        loading,
        refreshDropdowns,
      }}
    >
      {children}
    </AllDropdownListDataContext.Provider>
  );
};

export const useAllDropdownListData = () =>
  useContext(AllDropdownListDataContext);
