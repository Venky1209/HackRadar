import { create } from "zustand";
import type { HackathonFilters } from "@/lib/types";

const defaultFilters: HackathonFilters = {
  search: "",
  dateFrom: "",
  dateTo: "",
  mode: "all",
  location: "all",
  ppoOnly: false,
  majorOnly: false,
  prizeTier: "all",
  status: "all",
  sortMode: "deadline",
  viewMode: "grid",
};

interface HackathonStore {
  filters: HackathonFilters;
  hasScanned: boolean;
  setHasScanned: (value: boolean) => void;
  setFilter: <Key extends keyof HackathonFilters>(key: Key, value: HackathonFilters[Key]) => void;
  resetFilters: () => void;
  setViewMode: (mode: HackathonFilters["viewMode"]) => void;
  setSortMode: (mode: HackathonFilters["sortMode"]) => void;
}

export const useHackathonStore = create<HackathonStore>((set) => ({
  filters: defaultFilters,
  hasScanned: false,
  setHasScanned: (value) => set({ hasScanned: value }),
  setFilter: (key, value) =>
    set((state) => ({
      filters: {
        ...state.filters,
        [key]: value,
      },
    })),
  resetFilters: () => set({ filters: defaultFilters }),
  setViewMode: (mode) =>
    set((state) => ({
      filters: {
        ...state.filters,
        viewMode: mode,
      },
    })),
  setSortMode: (mode) =>
    set((state) => ({
      filters: {
        ...state.filters,
        sortMode: mode,
      },
    })),
}));

export { defaultFilters };
