import { useCallback, useMemo, useState } from 'react';
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

const initialConfig: AircraftConfig = {
  bemMass: da40ng.defaultBem.mass,
  bemCg: da40ng.defaultBem.cg,
  activeMods: new Set<ModificationId>(),
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

export function useCalculation() {
  const [config, setConfig] = useState<AircraftConfig>(initialConfig);
  const [loading, setLoading] = useState<LoadingState>(initialLoading);

  const setBemMass = useCallback((mass: number) => {
    setConfig((c) => ({ ...c, bemMass: mass }));
  }, []);

  const setBemCg = useCallback((cg: number) => {
    setConfig((c) => ({ ...c, bemCg: cg }));
  }, []);

  const toggleMod = useCallback((modId: ModificationId) => {
    setConfig((prev) => {
      const next = new Set(prev.activeMods);
      if (next.has(modId)) {
        next.delete(modId);
      } else {
        next.add(modId);
      }
      return { ...prev, activeMods: next };
    });

    // Clear entries for stations that depend on the toggled mod
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
  }, []);

  const setTankConfig = useCallback((tank: TankConfig) => {
    setConfig((c) => ({ ...c, tankConfig: tank }));
  }, []);

  const setStationMass = useCallback((stationId: string, mass: number) => {
    setLoading((prev) => ({
      ...prev,
      entries: prev.entries.map((e) =>
        e.stationId === stationId ? { ...e, mass } : e,
      ),
    }));
  }, []);

  const setTakeoffFuel = useCallback((usg: number) => {
    setLoading((prev) => ({ ...prev, takeoffFuelUsg: usg }));
  }, []);

  const setTripFuel = useCallback((usg: number) => {
    setLoading((prev) => ({ ...prev, tripFuelUsg: usg }));
  }, []);

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
  };
}
