import { useCallback, useMemo } from 'react';
import { da40ng } from '@/data/da40ng';
import {
  calculateLoadingCondition,
  getVisibleStations,
} from '@/lib/calculations';
import type {
  AircraftConfig,
  LoadingEntry,
  LoadingState,
  ModificationId,
  TankConfig,
} from '@/lib/types';
import { useLocalStorage } from './useLocalStorage';

// Serializable version of AircraftConfig (Set → array)
interface StoredConfig {
  bemMass: number;
  bemCg: number;
  activeMods: ModificationId[];
  tankConfig: TankConfig;
}

const initialStoredConfig: StoredConfig = {
  bemMass: da40ng.defaultBem.mass,
  bemCg: da40ng.defaultBem.cg,
  activeMods: [],
  tankConfig: 'standard',
};

function buildInitialEntries(): LoadingEntry[] {
  return da40ng.stations.map((s) => ({ stationId: s.id, mass: 0 }));
}

const initialLoading: LoadingState = {
  entries: buildInitialEntries(),
  takeoffFuelUsg: 0,
  tripFuelUsg: 0,
};

function toConfig(stored: StoredConfig): AircraftConfig {
  return {
    ...stored,
    activeMods: new Set(stored.activeMods),
  };
}

function toStored(config: AircraftConfig): StoredConfig {
  return {
    ...config,
    activeMods: [...config.activeMods],
  };
}

export function useCalculation() {
  const [storedConfig, setStoredConfig, resetConfig] = useLocalStorage<StoredConfig>(
    'da40ng-wb-config',
    initialStoredConfig,
  );
  const [loading, setLoading, resetLoading] = useLocalStorage<LoadingState>(
    'da40ng-wb-loading',
    initialLoading,
  );

  const config = useMemo(() => toConfig(storedConfig), [storedConfig]);

  const setBemMass = useCallback((mass: number) => {
    setStoredConfig((c) => ({ ...c, bemMass: mass }));
  }, [setStoredConfig]);

  const setBemCg = useCallback((cg: number) => {
    setStoredConfig((c) => ({ ...c, bemCg: cg }));
  }, [setStoredConfig]);

  const toggleMod = useCallback((modId: ModificationId) => {
    setStoredConfig((prev) => {
      const mods = new Set(prev.activeMods);
      if (mods.has(modId)) {
        mods.delete(modId);
      } else {
        mods.add(modId);
      }
      return { ...prev, activeMods: [...mods] };
    });

    setLoading((prev) => {
      const updatedEntries = prev.entries.map((entry) => {
        const station = da40ng.stations.find((s) => s.id === entry.stationId);
        if (station?.requiresMods?.includes(modId)) {
          return { ...entry, mass: 0 };
        }
        return entry;
      });
      return { ...prev, entries: updatedEntries };
    });
  }, [setStoredConfig, setLoading]);

  const setTankConfig = useCallback((tank: TankConfig) => {
    setStoredConfig((c) => ({ ...c, tankConfig: tank }));
  }, [setStoredConfig]);

  const setStationMass = useCallback((stationId: string, mass: number) => {
    setLoading((prev) => ({
      ...prev,
      entries: prev.entries.map((e) =>
        e.stationId === stationId ? { ...e, mass } : e,
      ),
    }));
  }, [setLoading]);

  const setTakeoffFuel = useCallback((usg: number) => {
    setLoading((prev) => ({ ...prev, takeoffFuelUsg: usg }));
  }, [setLoading]);

  const setTripFuel = useCallback((usg: number) => {
    setLoading((prev) => ({ ...prev, tripFuelUsg: usg }));
  }, [setLoading]);

  const resetAll = useCallback(() => {
    resetConfig();
    resetLoading();
  }, [resetConfig, resetLoading]);

  const visibleStations = useMemo(
    () => getVisibleStations(da40ng.stations, config.activeMods),
    [config.activeMods],
  );

  const result = useMemo(
    () => calculateLoadingCondition(config, loading, da40ng),
    [config, loading],
  );

  return {
    config,
    loading,
    visibleStations,
    result,
    setBemMass,
    setBemCg,
    toggleMod,
    setTankConfig,
    setStationMass,
    setTakeoffFuel,
    setTripFuel,
    resetAll,
  };
}
