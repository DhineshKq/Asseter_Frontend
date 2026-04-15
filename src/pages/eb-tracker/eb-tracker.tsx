import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { DEFAULT_TABLE_PAGE_SIZE, TablePagination, useTablePagination } from "../../components/common-component/tables";
import useAxiosPrivate from "../../services/hooks/useaxios-private";
import "../../styles/pages/asset-admin/asset-admin.scss";
import "../../styles/pages/eb-tracker/eb-tracker.scss";

interface GroundFloorFormState {
  entryDate: string;
  remarks: string;
  startTime: string;
  endTime: string;
  startKqReading: string;
  startBleReading: string;
  startDgReading: string;
  endKqReading: string;
  endBleReading: string;
  endDgReading: string;
}

interface FirstFloorFormState {
  entryDate: string;
  remarks: string;
  startTime: string;
  endTime: string;
  startReading: string;
  endReading: string;
}

interface GroundFloorEntryRecord {
  id: string;
  apiId: string | null;
  entryDate: string;
  remarks?: string;
  startTime: string;
  endTime: string;
  startKqReading: number | null;
  startBleReading: number | null;
  startDgReading: number | null;
  endKqReading: number | null;
  endBleReading: number | null;
  endDgReading: number | null;
  totalUnitKq: number | null;
  totalUnitBle: number | null;
  dgUnit: number | null;
  intraUnitKq?: number | null;
  intraUnitBle?: number | null;
}

interface GroundFloorDisplayEntryRecord extends GroundFloorEntryRecord {
  intraUnitKq: number | null;
  intraUnitBle: number | null;
}

interface FirstFloorEntryRecord {
  id: string;
  apiId: string | null;
  entryDate: string;
  remarks?: string;
  startTime: string;
  startReading: number | null;
  endTime: string;
  endReading: number | null;
  totalUnits: number | null;
}

interface GroundChartRecord {
  date: string;
  kq: number;
  ble: number;
}

interface FirstFloorChartRecord {
  date: string;
  totalUnits: number;
}

type TrackerView = "kq" | "aitronics";

const today = new Date().toISOString().slice(0, 10);

const initialGroundFloorFormState: GroundFloorFormState = {
  entryDate: today,
  remarks: "",
  startTime: "",
  endTime: "",
  startKqReading: "",
  startBleReading: "",
  startDgReading: "",
  endKqReading: "",
  endBleReading: "",
  endDgReading: "",
};

const initialFirstFloorFormState: FirstFloorFormState = {
  entryDate: today,
  remarks: "",
  startTime: "",
  endTime: "",
  startReading: "",
  endReading: "",
};

const groundAutoMultiplyFields = new Set<keyof GroundFloorFormState>([
  "startKqReading",
  "startBleReading",
  "startDgReading",
  "endKqReading",
  "endBleReading",
  "endDgReading",
]);

const parseReading = (value: string) => {
  const parsedValue = Number(value);
  return Number.isFinite(parsedValue) ? parsedValue : 0;
};

const sortEntriesByDateTime = <T extends { entryDate: string; startTime: string }>(records: T[]) =>
  [...records].sort((first, second) => {
    const firstDateTime = new Date(`${first.entryDate}T${first.startTime || "00:00"}`).getTime();
    const secondDateTime = new Date(`${second.entryDate}T${second.startTime || "00:00"}`).getTime();
    return secondDateTime - firstDateTime;
  });

const formatUnits = (value: number) =>
  value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const formatNullableUnits = (value: number | null | undefined) =>
  typeof value === "number" && Number.isFinite(value) ? formatUnits(value) : "--";

const addDays = (dateValue: string, days: number) => {
  const parsedDate = new Date(`${dateValue}T00:00:00`);
  parsedDate.setDate(parsedDate.getDate() + days);
  return parsedDate.toISOString().slice(0, 10);
};

const normaliseTime = (value: unknown) => {
  if (typeof value !== "string" || value.trim() === "") {
    return "";
  }

  return value.slice(0, 5);
};

const isGroundRemarkOnlyEntry = (entry: GroundFloorDisplayEntryRecord) =>
  entry.remarks?.trim() &&
  entry.startTime === "" &&
  entry.endTime === "" &&
  entry.startKqReading === null &&
  entry.startBleReading === null &&
  entry.startDgReading === null &&
  entry.endKqReading === null &&
  entry.endBleReading === null &&
  entry.endDgReading === null &&
  entry.totalUnitKq === null &&
  entry.totalUnitBle === null &&
  entry.dgUnit === null &&
  entry.intraUnitKq === null &&
  entry.intraUnitBle === null;

export default function EbTrackerPage() {
  const axiosPrivate = useAxiosPrivate();
  const [activeTrackerView, setActiveTrackerView] = useState<TrackerView>("kq");
  const [groundFloorFormData, setGroundFloorFormData] = useState<GroundFloorFormState>(initialGroundFloorFormState);
  const [firstFloorFormData, setFirstFloorFormData] = useState<FirstFloorFormState>(initialFirstFloorFormState);
  const [groundFloorEntries, setGroundFloorEntries] = useState<GroundFloorEntryRecord[]>([]);
  const [firstFloorEntries, setFirstFloorEntries] = useState<FirstFloorEntryRecord[]>([]);
  const [groundFormattedFields, setGroundFormattedFields] =
    useState<Partial<Record<keyof GroundFloorFormState, boolean>>>({});
  const [isGroundLoading, setIsGroundLoading] = useState(true);
  const [groundLoadError, setGroundLoadError] = useState("");
  const [isGroundSaving, setIsGroundSaving] = useState(false);
  const [isGroundDeleting, setIsGroundDeleting] = useState(false);
  const [groundSubmitError, setGroundSubmitError] = useState("");
  const [groundDeleteError, setGroundDeleteError] = useState("");
  const [editingGroundEntryId, setEditingGroundEntryId] = useState<string | null>(null);
  const [deleteGroundTarget, setDeleteGroundTarget] = useState<GroundFloorEntryRecord | null>(null);
  const [isFirstFloorLoading, setIsFirstFloorLoading] = useState(true);
  const [firstFloorLoadError, setFirstFloorLoadError] = useState("");
  const [isFirstFloorSaving, setIsFirstFloorSaving] = useState(false);
  const [isFirstFloorDeleting, setIsFirstFloorDeleting] = useState(false);
  const [firstFloorSubmitError, setFirstFloorSubmitError] = useState("");
  const [firstFloorDeleteError, setFirstFloorDeleteError] = useState("");
  const [editingFirstFloorEntryId, setEditingFirstFloorEntryId] = useState<string | null>(null);
  const [deleteFirstFloorTarget, setDeleteFirstFloorTarget] = useState<FirstFloorEntryRecord | null>(null);

  const mapGroundFloorRecord = useCallback((record: any): GroundFloorEntryRecord => {
    const entryDate = record?.readingDate ?? record?.entryDate ?? today;
    const startTime = normaliseTime(record?.startTime);
    const endTime = normaliseTime(record?.endTime);
    const apiId = record?.id ?? record?._id ?? record?.trackerId ?? record?.kqEbTrackerId ?? null;
    const startKqReading = record?.startKqReading === null || record?.startKqReading === undefined ? null : Number(record.startKqReading);
    const startBleReading = record?.startBleReading === null || record?.startBleReading === undefined ? null : Number(record.startBleReading);
    const startDgReading = record?.startDgReading === null || record?.startDgReading === undefined ? null : Number(record.startDgReading);
    const endKqReading = record?.endKqReading === null || record?.endKqReading === undefined ? null : Number(record.endKqReading);
    const endBleReading = record?.endBleReading === null || record?.endBleReading === undefined ? null : Number(record.endBleReading);
    const endDgReading = record?.endDgReading === null || record?.endDgReading === undefined ? null : Number(record.endDgReading);

    return {
      id: apiId ? String(apiId) : `${entryDate}-${startTime}-${endTime}`,
      apiId: apiId ? String(apiId) : null,
      entryDate,
      remarks: typeof record?.remarks === "string" ? record.remarks : "",
      startTime,
      endTime,
      startKqReading,
      startBleReading,
      startDgReading,
      endKqReading,
      endBleReading,
      endDgReading,
      totalUnitKq:
        record?.totalUnitKq === null || record?.totalUnitKq === undefined
          ? startKqReading !== null && endKqReading !== null
            ? endKqReading - startKqReading
            : null
          : Number(record.totalUnitKq),
      totalUnitBle:
        record?.totalUnitBle === null || record?.totalUnitBle === undefined
          ? startBleReading !== null && endBleReading !== null
            ? endBleReading - startBleReading
            : null
          : Number(record.totalUnitBle),
      dgUnit:
        startDgReading !== null && endDgReading !== null
          ? endDgReading - startDgReading
          : null,
      intraUnitKq:
        record?.intraUnitKq === null || record?.intraUnitKq === undefined ? null : Number(record.intraUnitKq),
      intraUnitBle:
        record?.intraUnitBle === null || record?.intraUnitBle === undefined ? null : Number(record.intraUnitBle),
    };
  }, []);

  const fetchGroundFloorEntries = useCallback(async () => {
    setIsGroundLoading(true);
    setGroundLoadError("");

    try {
      const response = await axiosPrivate.get("/assets/kq-eb-trackers");
      const payload = Array.isArray(response.data?.data)
        ? response.data.data
        : Array.isArray(response.data)
          ? response.data
          : [];

      setGroundFloorEntries(sortEntriesByDateTime(payload.map(mapGroundFloorRecord)));
    } catch (error: any) {
      setGroundFloorEntries([]);
      setGroundLoadError(
        error?.response?.data?.message || "Failed to load KQ EB tracker data. Check the API and try again."
      );
    } finally {
      setIsGroundLoading(false);
    }
  }, [axiosPrivate, mapGroundFloorRecord]);

  const mapFirstFloorRecord = useCallback((record: any): FirstFloorEntryRecord => {
    const entryDate = record?.readingDate ?? record?.entryDate ?? today;
    const startTime = normaliseTime(record?.startTime);
    const endTime = normaliseTime(record?.endTime);
    const apiId = record?.id ?? record?._id ?? record?.trackerId ?? record?.aitronicsEbTrackerId ?? null;
    const startReading =
      record?.startReading === null || record?.startReading === undefined ? null : Number(record.startReading);
    const endReading = record?.endReading === null || record?.endReading === undefined ? null : Number(record.endReading);

    return {
      id: apiId ? String(apiId) : `${entryDate}-${startTime}-${endTime}`,
      apiId: apiId ? String(apiId) : null,
      entryDate,
      remarks: typeof record?.remarks === "string" ? record.remarks : "",
      startTime,
      startReading,
      endTime,
      endReading,
      totalUnits:
        record?.totalUnits === null || record?.totalUnits === undefined
          ? startReading !== null && endReading !== null
            ? endReading - startReading
            : null
          : Number(record.totalUnits),
    };
  }, []);

  const fetchFirstFloorEntries = useCallback(async () => {
    setIsFirstFloorLoading(true);
    setFirstFloorLoadError("");

    try {
      const response = await axiosPrivate.get("/assets/aitronics-eb-trackers");
      const payload = Array.isArray(response.data?.data)
        ? response.data.data
        : Array.isArray(response.data)
          ? response.data
          : [];

      setFirstFloorEntries(sortEntriesByDateTime(payload.map(mapFirstFloorRecord)));
    } catch (error: any) {
      setFirstFloorEntries([]);
      setFirstFloorLoadError(
        error?.response?.data?.message || "Failed to load Aitronics EB tracker data. Check the API and try again."
      );
    } finally {
      setIsFirstFloorLoading(false);
    }
  }, [axiosPrivate, mapFirstFloorRecord]);

  useEffect(() => {
    fetchGroundFloorEntries();
  }, [fetchGroundFloorEntries]);

  useEffect(() => {
    fetchFirstFloorEntries();
  }, [fetchFirstFloorEntries]);

  const groundFloorCalculations = useMemo(() => {
    const startKq = parseReading(groundFloorFormData.startKqReading);
    const endKq = parseReading(groundFloorFormData.endKqReading);
    const startBle = parseReading(groundFloorFormData.startBleReading);
    const endBle = parseReading(groundFloorFormData.endBleReading);
    const startDg = parseReading(groundFloorFormData.startDgReading);
    const endDg = parseReading(groundFloorFormData.endDgReading);

    return {
      totalUnitKq: endKq - startKq,
      totalUnitBle: endBle - startBle,
      dgUnit: endDg - startDg,
    };
  }, [
    groundFloorFormData.endBleReading,
    groundFloorFormData.endDgReading,
    groundFloorFormData.endKqReading,
    groundFloorFormData.startBleReading,
    groundFloorFormData.startDgReading,
    groundFloorFormData.startKqReading,
  ]);

  const firstFloorCalculations = useMemo(() => {
    const startReading = parseReading(firstFloorFormData.startReading);
    const endReading = parseReading(firstFloorFormData.endReading);

    return {
      totalUnits: endReading - startReading,
    };
  }, [firstFloorFormData.endReading, firstFloorFormData.startReading]);

  const groundFloorDisplayEntries = useMemo<GroundFloorDisplayEntryRecord[]>(() => {
    const sortedEntries = sortEntriesByDateTime(groundFloorEntries);

    return sortedEntries.map((entry) => {
      const apiIntraUnitKq =
        "intraUnitKq" in entry && entry.intraUnitKq !== undefined
          ? Number(entry.intraUnitKq)
          : null;
      const apiIntraUnitBle =
        "intraUnitBle" in entry && entry.intraUnitBle !== undefined
          ? Number(entry.intraUnitBle)
          : null;
      const previousDayEntry = sortedEntries.find(
        (candidate) => candidate.entryDate === addDays(entry.entryDate, -1)
      );

      return {
        ...entry,
        intraUnitKq:
          apiIntraUnitKq !== null && Number.isFinite(apiIntraUnitKq)
            ? apiIntraUnitKq
            : previousDayEntry && entry.startKqReading !== null && previousDayEntry.endKqReading !== null
              ? entry.startKqReading - previousDayEntry.endKqReading
              : null,
        intraUnitBle:
          apiIntraUnitBle !== null && Number.isFinite(apiIntraUnitBle)
            ? apiIntraUnitBle
            : previousDayEntry && entry.startBleReading !== null && previousDayEntry.endBleReading !== null
              ? entry.startBleReading - previousDayEntry.endBleReading
              : null,
      };
    });
  }, [groundFloorEntries]);

  const groundFloorChartData = useMemo<GroundChartRecord[]>(
    () =>
      [...groundFloorDisplayEntries]
        .filter((entry) => entry.intraUnitKq !== null || entry.intraUnitBle !== null)
        .sort((first, second) => first.entryDate.localeCompare(second.entryDate))
        .map((entry) => ({
          date: entry.entryDate.slice(5),
          kq: entry.intraUnitKq ?? 0,
          ble: entry.intraUnitBle ?? 0,
        })),
    [groundFloorDisplayEntries]
  );

  const firstFloorChartData = useMemo<FirstFloorChartRecord[]>(
    () =>
      [...firstFloorEntries]
        .filter((entry) => entry.totalUnits !== null)
        .sort((first, second) => first.entryDate.localeCompare(second.entryDate))
        .map((entry) => ({
          date: entry.entryDate.slice(5),
          totalUnits: entry.totalUnits ?? 0,
        })),
    [firstFloorEntries]
  );

  const groundPaginatedEntries = useTablePagination(groundFloorDisplayEntries, {
    pageSize: DEFAULT_TABLE_PAGE_SIZE,
    resetDeps: [groundFloorDisplayEntries],
  });

  const firstFloorPaginatedEntries = useTablePagination(firstFloorEntries, {
    pageSize: DEFAULT_TABLE_PAGE_SIZE,
    resetDeps: [firstFloorEntries],
  });

  const isGroundCalculationReady =
    groundFloorFormData.entryDate.trim() !== "" &&
    groundFloorFormData.startTime.trim() !== "" &&
    groundFloorFormData.endTime.trim() !== "" &&
    groundFloorFormData.startKqReading.trim() !== "" &&
    groundFloorFormData.startBleReading.trim() !== "" &&
    groundFloorFormData.startDgReading.trim() !== "" &&
    groundFloorFormData.endKqReading.trim() !== "" &&
    groundFloorFormData.endBleReading.trim() !== "" &&
    groundFloorFormData.endDgReading.trim() !== "";

  const isGroundRemarkOnly =
    groundFloorFormData.entryDate.trim() !== "" &&
    groundFloorFormData.remarks.trim() !== "" &&
    groundFloorFormData.startTime.trim() === "" &&
    groundFloorFormData.endTime.trim() === "" &&
    groundFloorFormData.startKqReading.trim() === "" &&
    groundFloorFormData.startBleReading.trim() === "" &&
    groundFloorFormData.startDgReading.trim() === "" &&
    groundFloorFormData.endKqReading.trim() === "" &&
    groundFloorFormData.endBleReading.trim() === "" &&
    groundFloorFormData.endDgReading.trim() === "";

  const canSubmitGroundFloor = groundFloorFormData.entryDate.trim() !== "";

  const isFirstFloorCalculationReady =
    firstFloorFormData.entryDate.trim() !== "" &&
    firstFloorFormData.startTime.trim() !== "" &&
    firstFloorFormData.endTime.trim() !== "" &&
    firstFloorFormData.startReading.trim() !== "" &&
    firstFloorFormData.endReading.trim() !== "";

  const isFirstFloorRemarkOnly =
    firstFloorFormData.entryDate.trim() !== "" &&
    firstFloorFormData.remarks.trim() !== "" &&
    firstFloorFormData.startTime.trim() === "" &&
    firstFloorFormData.endTime.trim() === "" &&
    firstFloorFormData.startReading.trim() === "" &&
    firstFloorFormData.endReading.trim() === "";

  const canSubmitFirstFloor = firstFloorFormData.entryDate.trim() !== "";

  const previousDayGroundEntry = useMemo(
    () => groundFloorEntries.find((entry) => entry.entryDate === addDays(groundFloorFormData.entryDate, -1)),
    [groundFloorEntries, groundFloorFormData.entryDate]
  );

  const currentGroundIntraUnitKq =
    isGroundCalculationReady && previousDayGroundEntry && previousDayGroundEntry.endKqReading !== null
      ? parseReading(groundFloorFormData.startKqReading) - previousDayGroundEntry.endKqReading
      : null;

  const currentGroundIntraUnitBle =
    isGroundCalculationReady && previousDayGroundEntry && previousDayGroundEntry.endBleReading !== null
      ? parseReading(groundFloorFormData.startBleReading) - previousDayGroundEntry.endBleReading
      : null;

  const metrics = [
    {
      label: "Ground Entries",
      value: groundFloorDisplayEntries.length,
      helper: "Ground Floor records with KQ, BLE and DG readings",
    },
    {
      label: "First Floor Entries",
      value: firstFloorEntries.length,
      helper: "First Floor records using single reading flow",
    },
    {
      label: "Latest Ground Date",
      value: groundFloorDisplayEntries[0]?.entryDate ?? groundFloorFormData.entryDate,
      helper: "Most recent Ground Floor reading date",
    },
    {
      label: "Latest First Floor Units",
      value: firstFloorEntries[0] ? formatNullableUnits(firstFloorEntries[0].totalUnits) : formatUnits(firstFloorCalculations.totalUnits),
      helper: "Current First Floor total units snapshot",
    },
  ];
  const activeTrackerLabel = activeTrackerView === "kq" ? "KQ" : "Aitronics";
  const latestGroundEntry = groundFloorDisplayEntries[0] ?? null;
  const groundRemarkOnlyCount = groundFloorDisplayEntries.filter((entry) => isGroundRemarkOnlyEntry(entry)).length;

  const handleGroundInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    const fieldName = name as keyof GroundFloorFormState;

    setGroundFloorFormData((current) => ({
      ...current,
      [fieldName]: value,
    }));

    if (groundAutoMultiplyFields.has(fieldName)) {
      setGroundFormattedFields((current) => ({
        ...current,
        [fieldName]: false,
      }));
    }

    if (groundSubmitError) {
      setGroundSubmitError("");
    }
  };

  const handleFirstFloorInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    const fieldName = name as keyof FirstFloorFormState;

    setFirstFloorFormData((current) => ({
      ...current,
      [fieldName]: value,
    }));
  };

  const handleFirstFloorReadingBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    const fieldName = event.target.name as keyof FirstFloorFormState;

    if (fieldName !== "startReading" && fieldName !== "endReading") {
      return;
    }

    setFirstFloorFormData((current) => {
      const rawValue = current[fieldName].trim();

      if (rawValue === "") {
        return current;
      }

      const parsedValue = Number(rawValue);

      if (!Number.isFinite(parsedValue)) {
        return current;
      }

      return {
        ...current,
        [fieldName]: parsedValue.toFixed(2),
      };
    });
  };

  const applyGroundReadingMultiplier = (fieldName: keyof GroundFloorFormState) => {
    if (!groundAutoMultiplyFields.has(fieldName) || groundFormattedFields[fieldName]) {
      return;
    }

    setGroundFloorFormData((current) => {
      const rawValue = current[fieldName].trim();

      if (rawValue === "") {
        return current;
      }

      const parsedValue = Number(rawValue);

      if (!Number.isFinite(parsedValue)) {
        return current;
      }

      return {
        ...current,
        [fieldName]: (parsedValue * 1000).toFixed(2),
      };
    });

    setGroundFormattedFields((current) => ({
      ...current,
      [fieldName]: true,
    }));
  };

  const handleGroundReadingKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== "Enter" && event.key !== "Tab") {
      return;
    }

    const fieldName = event.currentTarget.name as keyof GroundFloorFormState;

    if (!groundAutoMultiplyFields.has(fieldName)) {
      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();
    }

    applyGroundReadingMultiplier(fieldName);
  };

  const resetGroundFloorForm = () => {
    setGroundFloorFormData({
      ...initialGroundFloorFormState,
      entryDate: groundFloorFormData.entryDate || today,
    });
    setGroundFormattedFields({});
    setGroundSubmitError("");
    setEditingGroundEntryId(null);
  };

  const resetFirstFloorForm = () => {
    setFirstFloorFormData({
      ...initialFirstFloorFormState,
      entryDate: firstFloorFormData.entryDate || today,
    });
    setFirstFloorSubmitError("");
    setEditingFirstFloorEntryId(null);
  };

  const handleTrackerViewChange = (nextView: TrackerView) => {
    if (nextView === activeTrackerView) {
      return;
    }

    if (activeTrackerView === "kq" && editingGroundEntryId) {
      resetGroundFloorForm();
    }

    if (activeTrackerView === "aitronics" && editingFirstFloorEntryId) {
      resetFirstFloorForm();
    }

    setActiveTrackerView(nextView);
  };

  const handleGroundFloorSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!canSubmitGroundFloor) {
      return;
    }

    const nextEntry: GroundFloorEntryRecord = {
      id: `${groundFloorFormData.entryDate}-${groundFloorFormData.startTime}-${Date.now()}`,
      apiId: editingGroundEntryId,
      entryDate: groundFloorFormData.entryDate,
      remarks: groundFloorFormData.remarks.trim(),
      startTime: groundFloorFormData.startTime,
      endTime: groundFloorFormData.endTime,
      startKqReading: parseReading(groundFloorFormData.startKqReading),
      startBleReading: parseReading(groundFloorFormData.startBleReading),
      startDgReading: parseReading(groundFloorFormData.startDgReading),
      endKqReading: parseReading(groundFloorFormData.endKqReading),
      endBleReading: parseReading(groundFloorFormData.endBleReading),
      endDgReading: parseReading(groundFloorFormData.endDgReading),
      totalUnitKq: groundFloorCalculations.totalUnitKq,
      totalUnitBle: groundFloorCalculations.totalUnitBle,
      dgUnit: groundFloorCalculations.dgUnit,
    };

    setIsGroundSaving(true);
    setGroundSubmitError("");

    try {
      const payload = {
        readingDate: nextEntry.entryDate,
        remarks: nextEntry.remarks || "",
        startTime: nextEntry.startTime ? `${nextEntry.startTime}:00` : null,
        startKqReading: groundFloorFormData.startKqReading.trim() !== "" ? nextEntry.startKqReading : null,
        startBleReading: groundFloorFormData.startBleReading.trim() !== "" ? nextEntry.startBleReading : null,
        startDgReading: groundFloorFormData.startDgReading.trim() !== "" ? nextEntry.startDgReading : null,
        endTime: nextEntry.endTime ? `${nextEntry.endTime}:00` : null,
        endKqReading: groundFloorFormData.endKqReading.trim() !== "" ? nextEntry.endKqReading : null,
        endBleReading: groundFloorFormData.endBleReading.trim() !== "" ? nextEntry.endBleReading : null,
        endDgReading: groundFloorFormData.endDgReading.trim() !== "" ? nextEntry.endDgReading : null,
      };

      if (editingGroundEntryId) {
        await axiosPrivate.put(`/assets/kq-eb-trackers/${editingGroundEntryId}`, payload);
      } else {
        // axios baseURL already includes `/v1`, so this hits `POST /v1/assets/kq-eb-trackers`.
        await axiosPrivate.post("/assets/kq-eb-trackers", payload);
      }

      await fetchGroundFloorEntries();
      setGroundFloorFormData((current) => ({
        ...initialGroundFloorFormState,
        entryDate: current.entryDate,
      }));
      setGroundFormattedFields({});
      setEditingGroundEntryId(null);
    } catch (error: any) {
      setGroundSubmitError(
        error?.response?.data?.message || `Failed to ${editingGroundEntryId ? "update" : "save"} KQ ground floor entry. Check the API and try again.`
      );
    } finally {
      setIsGroundSaving(false);
    }
  };

  const handleGroundEdit = (entry: GroundFloorDisplayEntryRecord) => {
    if (isGroundSaving || isGroundDeleting) {
      return;
    }

    if (!entry.apiId) {
      setGroundSubmitError("This record is missing a backend ID, so it cannot be updated. Refresh the page and try again.");
      return;
    }

    setEditingGroundEntryId(entry.apiId);
    setGroundSubmitError("");
    setGroundDeleteError("");
    setGroundFloorFormData({
      entryDate: entry.entryDate,
      remarks: entry.remarks ?? "",
      startTime: entry.startTime,
      endTime: entry.endTime,
      startKqReading: entry.startKqReading === null ? "" : String(entry.startKqReading),
      startBleReading: entry.startBleReading === null ? "" : String(entry.startBleReading),
      startDgReading: entry.startDgReading === null ? "" : String(entry.startDgReading),
      endKqReading: entry.endKqReading === null ? "" : String(entry.endKqReading),
      endBleReading: entry.endBleReading === null ? "" : String(entry.endBleReading),
      endDgReading: entry.endDgReading === null ? "" : String(entry.endDgReading),
    });
    setGroundFormattedFields({});
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const openGroundDeleteModal = (entry: GroundFloorDisplayEntryRecord) => {
    if (isGroundSaving || isGroundDeleting) {
      return;
    }

    if (!entry.apiId) {
      setGroundDeleteError("This record is missing a backend ID, so it cannot be deleted. Refresh the page and try again.");
      return;
    }

    setDeleteGroundTarget(entry);
    setGroundDeleteError("");
  };

  const closeGroundDeleteModal = () => {
    if (isGroundDeleting) {
      return;
    }

    setDeleteGroundTarget(null);
    setGroundDeleteError("");
  };

  const handleGroundDelete = async () => {
    if (!deleteGroundTarget?.apiId) {
      setGroundDeleteError("Record ID is missing. Refresh the page and try again.");
      return;
    }

    setIsGroundDeleting(true);
    setGroundDeleteError("");

    try {
      await axiosPrivate.delete(`/assets/kq-eb-trackers/${deleteGroundTarget.apiId}`);
      await fetchGroundFloorEntries();

      if (editingGroundEntryId && deleteGroundTarget.apiId === editingGroundEntryId) {
        setEditingGroundEntryId(null);
        setGroundFloorFormData((current) => ({
          ...initialGroundFloorFormState,
          entryDate: current.entryDate || today,
        }));
        setGroundFormattedFields({});
      }

      closeGroundDeleteModal();
    } catch (error: any) {
      setGroundDeleteError(
        error?.response?.data?.message || "Failed to delete KQ ground floor entry. Check the API and try again."
      );
    } finally {
      setIsGroundDeleting(false);
    }
  };

  const handleFirstFloorSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!canSubmitFirstFloor) {
      return;
    }

    const nextEntry: FirstFloorEntryRecord = {
      id: `${firstFloorFormData.entryDate}-${firstFloorFormData.startTime}-${Date.now()}`,
      apiId: editingFirstFloorEntryId,
      entryDate: firstFloorFormData.entryDate,
      remarks: firstFloorFormData.remarks.trim(),
      startTime: firstFloorFormData.startTime,
      startReading: firstFloorFormData.startReading.trim() !== "" ? parseReading(firstFloorFormData.startReading) : null,
      endTime: firstFloorFormData.endTime,
      endReading: firstFloorFormData.endReading.trim() !== "" ? parseReading(firstFloorFormData.endReading) : null,
      totalUnits: firstFloorFormData.startReading.trim() !== "" && firstFloorFormData.endReading.trim() !== "" ? firstFloorCalculations.totalUnits : null,
    };

    setIsFirstFloorSaving(true);
    setFirstFloorSubmitError("");

    try {
      const payload = {
        readingDate: nextEntry.entryDate,
        startTime: nextEntry.startTime ? `${nextEntry.startTime}:00` : null,
        startReading: firstFloorFormData.startReading.trim() !== "" ? nextEntry.startReading : null,
        endTime: nextEntry.endTime ? `${nextEntry.endTime}:00` : null,
        endReading: firstFloorFormData.endReading.trim() !== "" ? nextEntry.endReading : null,
        remarks: nextEntry.remarks || "",
      };

      if (editingFirstFloorEntryId) {
        await axiosPrivate.put(`/assets/aitronics-eb-trackers/${editingFirstFloorEntryId}`, payload);
      } else {
        await axiosPrivate.post("/assets/aitronics-eb-trackers", payload);
      }

      await fetchFirstFloorEntries();
      setFirstFloorFormData((current) => ({
        ...initialFirstFloorFormState,
        entryDate: current.entryDate,
      }));
      setEditingFirstFloorEntryId(null);
    } catch (error: any) {
      setFirstFloorSubmitError(
        error?.response?.data?.message ||
          `Failed to ${editingFirstFloorEntryId ? "update" : "save"} Aitronics first floor entry. Check the API and try again.`
      );
    } finally {
      setIsFirstFloorSaving(false);
    }
  };

  const handleFirstFloorEdit = (entry: FirstFloorEntryRecord) => {
    if (isFirstFloorSaving || isFirstFloorDeleting) {
      return;
    }

    if (!entry.apiId) {
      setFirstFloorSubmitError("This record is missing a backend ID, so it cannot be updated. Refresh the page and try again.");
      return;
    }

    setEditingFirstFloorEntryId(entry.apiId);
    setFirstFloorSubmitError("");
    setFirstFloorDeleteError("");
    setFirstFloorFormData({
      entryDate: entry.entryDate,
      remarks: entry.remarks ?? "",
      startTime: entry.startTime,
      endTime: entry.endTime,
      startReading: entry.startReading === null ? "" : String(entry.startReading),
      endReading: entry.endReading === null ? "" : String(entry.endReading),
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const openFirstFloorDeleteModal = (entry: FirstFloorEntryRecord) => {
    if (isFirstFloorSaving || isFirstFloorDeleting) {
      return;
    }

    if (!entry.apiId) {
      setFirstFloorDeleteError("This record is missing a backend ID, so it cannot be deleted. Refresh the page and try again.");
      return;
    }

    setDeleteFirstFloorTarget(entry);
    setFirstFloorDeleteError("");
  };

  const closeFirstFloorDeleteModal = () => {
    if (isFirstFloorDeleting) {
      return;
    }

    setDeleteFirstFloorTarget(null);
    setFirstFloorDeleteError("");
  };

  const handleFirstFloorDelete = async () => {
    if (!deleteFirstFloorTarget?.apiId) {
      setFirstFloorDeleteError("Record ID is missing. Refresh the page and try again.");
      return;
    }

    setIsFirstFloorDeleting(true);
    setFirstFloorDeleteError("");

    try {
      await axiosPrivate.delete(`/assets/aitronics-eb-trackers/${deleteFirstFloorTarget.apiId}`);
      await fetchFirstFloorEntries();

      if (editingFirstFloorEntryId && deleteFirstFloorTarget.apiId === editingFirstFloorEntryId) {
        setEditingFirstFloorEntryId(null);
        setFirstFloorFormData((current) => ({
          ...initialFirstFloorFormState,
          entryDate: current.entryDate || today,
        }));
      }

      closeFirstFloorDeleteModal();
    } catch (error: any) {
      setFirstFloorDeleteError(
        error?.response?.data?.message || "Failed to delete Aitronics first floor entry. Check the API and try again."
      );
    } finally {
      setIsFirstFloorDeleting(false);
    }
  };

  return (
    <div className="asset-admin-page eb-tracker-page">
      <div className="asset-admin-shell">
        <div className="asset-admin-hero eb-tracker-hero">
          <div className="asset-admin-hero-copy">
            <p className="asset-admin-kicker">Utility Monitoring</p>
            <h2>EB Tracker</h2>
            <p>
              Switch between the KQ and Aitronics reading flows from one tracker page, with the relevant form,
              calculations, graph and history shown for the selected view.
            </p>
            <div className="asset-admin-hero-meta">
              <span>KQ Ground Floor fields</span>
              <span>Aitronics First Floor fields</span>
              <span>Live unit calculation</span>
              <span>Visual daily tracking</span>
            </div>
          </div>
          <div className="asset-admin-hero-highlight">
            <span>Active View</span>
            <strong>{activeTrackerLabel}</strong>
            <p>KQ shows Ground Floor fields. Aitronics shows the simpler First Floor reading flow.</p>
          </div>
        </div>

        <div className="asset-admin-table-card eb-tracker-toggle-card">
          <div className="eb-tracker-toggle-shell" role="tablist" aria-label="EB tracker view selector">
            <button
              type="button"
              className={`eb-tracker-toggle-btn ${activeTrackerView === "kq" ? "is-active" : ""}`}
              onClick={() => handleTrackerViewChange("kq")}
            >
              KQ
            </button>
            <button
              type="button"
              className={`eb-tracker-toggle-btn ${activeTrackerView === "aitronics" ? "is-active" : ""}`}
              onClick={() => handleTrackerViewChange("aitronics")}
            >
              Aitronics
            </button>
          </div>
        </div>

        <div className="asset-admin-metrics">
          {metrics.map((metric) => (
            <div key={metric.label} className="asset-admin-metric-card">
              <span>{metric.label}</span>
              <strong>{metric.value}</strong>
              <p>{metric.helper}</p>
            </div>
          ))}
        </div>

        {activeTrackerView === "kq" ? (
          <>
            <div className="eb-tracker-kq-band">
              <div className="eb-tracker-kq-band-card">
                <span>Latest Reading Date</span>
                <strong>{latestGroundEntry?.entryDate ?? groundFloorFormData.entryDate}</strong>
                <p>Most recent KQ ground floor record currently loaded into the tracker.</p>
              </div>
              <div className="eb-tracker-kq-band-card">
                <span>Remark Only Days</span>
                <strong>{groundRemarkOnlyCount}</strong>
                <p>Days logged with remarks instead of meter values because readings were unavailable.</p>
              </div>
              <div className="eb-tracker-kq-band-card">
                <span>Entry Mode</span>
                <strong>{isGroundRemarkOnly ? "Remarks Only" : "Reading Entry"}</strong>
                <p>Use a full reading set or leave the meters empty and submit only the daily remark.</p>
              </div>
            </div>

            <section className="asset-admin-table-card eb-tracker-floor-card eb-tracker-kq-form-card">
              <div className="asset-admin-card-header">
                <div>
                  <h3>KQ Ground Floor Readings</h3>
                  <p>Date, time and KQ/BLE/DG readings with total and intra-unit calculation.</p>
                </div>
                <div className="asset-admin-card-toolbar">
                  <span>KQ flow</span>
                  <span>{isGroundLoading ? "Loading..." : `${groundFloorDisplayEntries.length} entries`}</span>
                </div>
              </div>

              <form className="eb-tracker-form" onSubmit={handleGroundFloorSubmit}>
                {editingGroundEntryId ? (
                  <div className="eb-tracker-edit-banner">
                    <div className="eb-tracker-edit-banner-copy">
                      <strong>Edit Mode</strong>
                      <span>You are updating an existing KQ entry. Save to apply changes or exit edit mode to start a new one.</span>
                    </div>
                    <button type="button" className="asset-admin-secondary-btn" onClick={resetGroundFloorForm}>
                      Exit Edit Mode
                    </button>
                  </div>
                ) : null}

                <div className="eb-tracker-section">
                  <label className="asset-admin-control">
                    <span>Date</span>
                    <input
                      type="date"
                      name="entryDate"
                      value={groundFloorFormData.entryDate}
                      onChange={handleGroundInputChange}
                    />
                  </label>
                  <label className="asset-admin-control">
                    <span>Remarks</span>
                    <input
                      type="text"
                      name="remarks"
                      value={groundFloorFormData.remarks}
                      onChange={handleGroundInputChange}
                      placeholder="Enter remarks if readings are unavailable"
                    />
                  </label>
                </div>

                <div className="eb-tracker-kq-form-note">
                  <strong>Daily entry rule</strong>
                  <span>Fill the full reading set for unit calculation, or enter only remarks to record a no-reading day.</span>
                </div>

                <div className="eb-tracker-reading-grid">
                  <div className="eb-tracker-reading-card eb-tracker-reading-card-ground">
                    <div className="eb-tracker-reading-header">
                      <h4>Start Readings</h4>
                      <p>Opening values for Ground Floor KQ, BLE and DG meters.</p>
                    </div>
                    <div className="eb-tracker-input-grid">
                      <label className="asset-admin-control">
                        <span>Start Time</span>
                        <input
                          type="time"
                          name="startTime"
                          value={groundFloorFormData.startTime}
                          onChange={handleGroundInputChange}
                        />
                      </label>
                      <label className="asset-admin-control">
                        <span>KQ Reading</span>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          name="startKqReading"
                          value={groundFloorFormData.startKqReading}
                          onChange={handleGroundInputChange}
                          onKeyDown={handleGroundReadingKeyDown}
                          placeholder="Enter KQ start"
                        />
                      </label>
                      <label className="asset-admin-control">
                        <span>BLE Reading</span>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          name="startBleReading"
                          value={groundFloorFormData.startBleReading}
                          onChange={handleGroundInputChange}
                          onKeyDown={handleGroundReadingKeyDown}
                          placeholder="Enter BLE start"
                        />
                      </label>
                      <label className="asset-admin-control">
                        <span>DG Reading</span>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          name="startDgReading"
                          value={groundFloorFormData.startDgReading}
                          onChange={handleGroundInputChange}
                          onKeyDown={handleGroundReadingKeyDown}
                          placeholder="Enter DG start"
                        />
                      </label>
                    </div>
                  </div>

                  <div className="eb-tracker-reading-card eb-tracker-reading-card-ground">
                    <div className="eb-tracker-reading-header">
                      <h4>End Readings</h4>
                      <p>Closing values used to derive total units for the same day.</p>
                    </div>
                    <div className="eb-tracker-input-grid">
                      <label className="asset-admin-control">
                        <span>End Time</span>
                        <input
                          type="time"
                          name="endTime"
                          value={groundFloorFormData.endTime}
                          onChange={handleGroundInputChange}
                        />
                      </label>
                      <label className="asset-admin-control">
                        <span>KQ Reading</span>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          name="endKqReading"
                          value={groundFloorFormData.endKqReading}
                          onChange={handleGroundInputChange}
                          onKeyDown={handleGroundReadingKeyDown}
                          placeholder="Enter KQ end"
                        />
                      </label>
                      <label className="asset-admin-control">
                        <span>BLE Reading</span>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          name="endBleReading"
                          value={groundFloorFormData.endBleReading}
                          onChange={handleGroundInputChange}
                          onKeyDown={handleGroundReadingKeyDown}
                          placeholder="Enter BLE end"
                        />
                      </label>
                      <label className="asset-admin-control">
                        <span>DG Reading</span>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          name="endDgReading"
                          value={groundFloorFormData.endDgReading}
                          onChange={handleGroundInputChange}
                          onKeyDown={handleGroundReadingKeyDown}
                          placeholder="Enter DG end"
                        />
                      </label>
                    </div>
                  </div>
                </div>

                <div className="eb-tracker-form-actions">
                  <button type="button" className="asset-admin-secondary-btn" onClick={resetGroundFloorForm}>
                    Clear Ground Floor
                  </button>
                  <button type="submit" className="asset-admin-primary-btn" disabled={!canSubmitGroundFloor || isGroundSaving}>
                    {isGroundSaving ? "Saving..." : editingGroundEntryId ? "Update Ground Floor" : "Save Ground Floor"}
                  </button>
                </div>
              </form>

              {groundSubmitError ? <p className="asset-admin-form-error">{groundSubmitError}</p> : null}
              {groundLoadError ? <p className="asset-admin-form-error">{groundLoadError}</p> : null}

              <div className="eb-tracker-summary-grid eb-tracker-summary-grid-floor">
                <div className="eb-tracker-summary-item eb-tracker-summary-item-kq">
                  <span>Total Unit (KQ)</span>
                  <strong>{isGroundCalculationReady ? formatUnits(groundFloorCalculations.totalUnitKq) : "--"}</strong>
                </div>
                <div className="eb-tracker-summary-item eb-tracker-summary-item-ble">
                  <span>Total Unit (Ble)</span>
                  <strong>{isGroundCalculationReady ? formatUnits(groundFloorCalculations.totalUnitBle) : "--"}</strong>
                </div>
                <div className="eb-tracker-summary-item eb-tracker-summary-item-neutral">
                  <span>Intra Unit (KQ)</span>
                  <strong>{currentGroundIntraUnitKq === null ? "Pending" : formatUnits(currentGroundIntraUnitKq)}</strong>
                </div>
                <div className="eb-tracker-summary-item eb-tracker-summary-item-neutral">
                  <span>Intra Unit (Ble)</span>
                  <strong>{currentGroundIntraUnitBle === null ? "Pending" : formatUnits(currentGroundIntraUnitBle)}</strong>
                </div>
              </div>

              <div className="eb-tracker-rule-note">
                <p>DG Unit: {isGroundCalculationReady ? formatUnits(groundFloorCalculations.dgUnit) : "--"}</p>
                <p>Intra Unit compares the current date start reading against the previous date end reading.</p>
                <p>You can also submit only remarks when a reading is not available.</p>
              </div>
            </section>

            <div className="asset-admin-table-card eb-tracker-chart-card eb-tracker-kq-chart-card">
              <div className="asset-admin-card-header">
                <div>
                  <h3>KQ Ground Floor Intra Unit Graph</h3>
                  <p>Daily comparison of KQ and BLE intra-unit movement.</p>
                </div>
              </div>

                {isGroundLoading ? (
                  <div className="asset-admin-empty-state">
                    <h4>Loading KQ graph</h4>
                    <p>Fetching KQ EB tracker data from the backend.</p>
                  </div>
                ) : groundFloorChartData.length > 0 ? (
                  <div className="eb-tracker-chart-wrap">
                    <ResponsiveContainer width="100%" height={320}>
                      <LineChart data={groundFloorChartData} margin={{ top: 10, right: 16, left: -12, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#dbe4ee" />
                        <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={10} />
                        <YAxis
                          tickLine={false}
                          axisLine={false}
                          width={72}
                          tickFormatter={(value) => formatUnits(Number(value))}
                        />
                        <Tooltip
                          formatter={(value: number, name: string) => [
                            formatUnits(Number(value)),
                            name === "kq" ? "Intra Unit (KQ)" : "Intra Unit (BLE)",
                          ]}
                          labelFormatter={(label) => `Date: ${label}`}
                          contentStyle={{
                            borderRadius: 16,
                            border: "1px solid #dbe4ee",
                            boxShadow: "0 18px 36px rgba(15, 23, 42, 0.12)",
                          }}
                        />
                        <Legend formatter={(value) => (value === "kq" ? "Intra Unit (KQ)" : "Intra Unit (BLE)")} />
                        <Line
                          type="monotone"
                          dataKey="kq"
                          name="kq"
                          stroke="#0f766e"
                          strokeWidth={3}
                          dot={{ r: 4, strokeWidth: 2, fill: "#ffffff" }}
                          activeDot={{ r: 6 }}
                        />
                        <Line
                          type="monotone"
                          dataKey="ble"
                          name="ble"
                          stroke="#2563eb"
                          strokeWidth={3}
                          dot={{ r: 4, strokeWidth: 2, fill: "#ffffff" }}
                          activeDot={{ r: 6 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="asset-admin-empty-state">
                    <h4>No KQ graph data yet</h4>
                    <p>Save at least two consecutive Ground Floor entries to display intra-unit trend lines.</p>
                  </div>
                )}
              </div>

              <div className="asset-admin-table-card eb-tracker-kq-history-card">
                <div className="asset-admin-card-header">
                  <div>
                    <h3>KQ Ground Floor History</h3>
                    <p>Date-wise Ground Floor records with total and intra-unit details.</p>
                  </div>
                  <div className="asset-admin-card-toolbar">
                    <span>{groundFloorDisplayEntries.length} items</span>
                    <span>KQ, BLE and DG flow</span>
                  </div>
                </div>

                <div className="asset-admin-table-wrap">
                  {isGroundLoading ? (
                    <div className="asset-admin-empty-state">
                      <h4>Loading KQ Ground Floor entries</h4>
                      <p>Fetching EB tracker records from the backend.</p>
                    </div>
                  ) : groundFloorDisplayEntries.length > 0 ? (
                    <>
                      <table className="asset-admin-table">
                        <thead>
                          <tr>
                            <th>Date</th>
                            <th>Remarks</th>
                            <th>Start Time</th>
                            <th>KQ Start</th>
                            <th>BLE Start</th>
                            <th>DG Start</th>
                            <th>End Time</th>
                            <th>KQ End</th>
                            <th>BLE End</th>
                            <th>DG End</th>
                            <th>Total Unit (KQ)</th>
                            <th>Total Unit (Ble)</th>
                            <th>Intra Unit (KQ)</th>
                            <th>Intra Unit (Ble)</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {groundPaginatedEntries.paginatedRows.map((entry) =>
                            isGroundRemarkOnlyEntry(entry) ? (
                              <tr key={entry.id} className="eb-tracker-remark-row">
                                <td>{entry.entryDate}</td>
                                <td colSpan={14}>
                                  <div className="eb-tracker-remark-cell">
                                    <span>
                                      <strong>Remarks:</strong> {entry.remarks}
                                    </span>
                                    <div className="eb-tracker-row-actions">
                                      <button
                                        type="button"
                                        className="asset-admin-secondary-btn"
                                        onClick={() => handleGroundEdit(entry)}
                                        disabled={isGroundSaving || isGroundDeleting || !entry.apiId}
                                      >
                                        Edit
                                      </button>
                                      <button
                                        type="button"
                                        className="asset-admin-danger-btn"
                                        onClick={() => openGroundDeleteModal(entry)}
                                        disabled={isGroundSaving || isGroundDeleting || !entry.apiId}
                                      >
                                        Delete
                                      </button>
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            ) : (
                              <tr key={entry.id}>
                                <td>{entry.entryDate}</td>
                                <td>{entry.remarks?.trim() ? entry.remarks : "--"}</td>
                                <td>{entry.startTime || "--"}</td>
                                <td>{formatNullableUnits(entry.startKqReading)}</td>
                                <td>{formatNullableUnits(entry.startBleReading)}</td>
                                <td>{formatNullableUnits(entry.startDgReading)}</td>
                                <td>{entry.endTime || "--"}</td>
                                <td>{formatNullableUnits(entry.endKqReading)}</td>
                                <td>{formatNullableUnits(entry.endBleReading)}</td>
                                <td>{formatNullableUnits(entry.endDgReading)}</td>
                                <td>{formatNullableUnits(entry.totalUnitKq)}</td>
                                <td>{formatNullableUnits(entry.totalUnitBle)}</td>
                                <td>{entry.intraUnitKq === null ? "Not calculated" : formatUnits(entry.intraUnitKq)}</td>
                                <td>{entry.intraUnitBle === null ? "Not calculated" : formatUnits(entry.intraUnitBle)}</td>
                                <td>
                                  <div className="eb-tracker-row-actions">
                                    <button
                                      type="button"
                                      className="asset-admin-secondary-btn"
                                      onClick={() => handleGroundEdit(entry)}
                                      disabled={isGroundSaving || isGroundDeleting || !entry.apiId}
                                    >
                                      Edit
                                    </button>
                                    <button
                                      type="button"
                                      className="asset-admin-danger-btn"
                                      onClick={() => openGroundDeleteModal(entry)}
                                      disabled={isGroundSaving || isGroundDeleting || !entry.apiId}
                                    >
                                      Delete
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            )
                          )}
                        </tbody>
                      </table>
                      <TablePagination
                        currentPage={groundPaginatedEntries.currentPage}
                        pageSize={groundPaginatedEntries.pageSize}
                        totalItems={groundPaginatedEntries.totalItems}
                        itemLabel="entries"
                        onPageChange={groundPaginatedEntries.setCurrentPage}
                      />
                    </>
                  ) : (
                    <div className="asset-admin-empty-state">
                      <h4>No KQ Ground Floor entries yet</h4>
                      <p>Save the first Ground Floor reading to start the detailed history table.</p>
                    </div>
                  )}
                </div>
              </div>
          </>
        ) : (
          <>
            <section className="asset-admin-table-card eb-tracker-floor-card">
                <div className="asset-admin-card-header">
                  <div>
                    <h3>Aitronics First Floor Readings</h3>
                    <p>Date, start time, end time and a single reading pair with total unit calculation.</p>
                  </div>
                  <div className="asset-admin-card-toolbar">
                    <span>Aitronics flow</span>
                    <span>{isFirstFloorLoading ? "Loading..." : `${firstFloorEntries.length} entries`}</span>
                  </div>
                </div>

                <form className="eb-tracker-form" onSubmit={handleFirstFloorSubmit}>
                  {editingFirstFloorEntryId ? (
                    <div className="eb-tracker-edit-banner">
                      <div className="eb-tracker-edit-banner-copy">
                        <strong>Edit Mode</strong>
                        <span>You are updating an existing Aitronics entry. Save to apply changes or exit edit mode to start a new one.</span>
                      </div>
                      <button type="button" className="asset-admin-secondary-btn" onClick={resetFirstFloorForm}>
                        Exit Edit Mode
                      </button>
                    </div>
                  ) : null}

                  <div className="eb-tracker-section eb-tracker-section-wide">
                    <label className="asset-admin-control">
                      <span>Date</span>
                      <input
                        type="date"
                        name="entryDate"
                        value={firstFloorFormData.entryDate}
                        onChange={handleFirstFloorInputChange}
                      />
                    </label>
                    <label className="asset-admin-control">
                      <span>Remarks</span>
                      <input
                        type="text"
                        name="remarks"
                        value={firstFloorFormData.remarks}
                        onChange={handleFirstFloorInputChange}
                        placeholder="Enter remarks if readings are unavailable"
                      />
                    </label>
                  </div>

                  <div className="eb-tracker-reading-card eb-tracker-reading-card-first">
                    <div className="eb-tracker-reading-header">
                      <h4>First Floor Entry</h4>
                      <p>Capture the opening and closing readings to derive total units.</p>
                    </div>
                    <div className="eb-tracker-input-grid">
                      <label className="asset-admin-control">
                        <span>Start Time</span>
                        <input
                          type="time"
                          name="startTime"
                          value={firstFloorFormData.startTime}
                          onChange={handleFirstFloorInputChange}
                        />
                      </label>
                      <label className="asset-admin-control">
                        <span>Reading</span>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          name="startReading"
                          value={firstFloorFormData.startReading}
                          onChange={handleFirstFloorInputChange}
                          onBlur={handleFirstFloorReadingBlur}
                          placeholder="Enter start reading"
                        />
                      </label>
                      <label className="asset-admin-control">
                        <span>End Time</span>
                        <input
                          type="time"
                          name="endTime"
                          value={firstFloorFormData.endTime}
                          onChange={handleFirstFloorInputChange}
                        />
                      </label>
                      <label className="asset-admin-control">
                        <span>Reading</span>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          name="endReading"
                          value={firstFloorFormData.endReading}
                          onChange={handleFirstFloorInputChange}
                          onBlur={handleFirstFloorReadingBlur}
                          placeholder="Enter end reading"
                        />
                      </label>
                    </div>
                  </div>

                  <div className="eb-tracker-form-actions">
                    <button type="button" className="asset-admin-secondary-btn" onClick={resetFirstFloorForm}>
                      Clear First Floor
                    </button>
                    <button type="submit" className="asset-admin-primary-btn" disabled={!canSubmitFirstFloor || isFirstFloorSaving}>
                      {isFirstFloorSaving ? "Saving..." : editingFirstFloorEntryId ? "Update First Floor" : "Save First Floor"}
                    </button>
                  </div>
                </form>

                {firstFloorSubmitError ? <p className="asset-admin-form-error">{firstFloorSubmitError}</p> : null}
                {firstFloorLoadError ? <p className="asset-admin-form-error">{firstFloorLoadError}</p> : null}
                <div className="eb-tracker-summary-grid eb-tracker-summary-grid-single">
                  <div className="eb-tracker-summary-item eb-tracker-summary-item-blue">
                    <span>Total Units</span>
                    <strong>{isFirstFloorCalculationReady ? formatUnits(firstFloorCalculations.totalUnits) : "--"}</strong>
                  </div>
                  <div className="eb-tracker-rule-note eb-tracker-rule-note-compact">
                    <p>First Floor uses a single reading pair for the selected date.</p>
                    <p>Total Units = End Reading - Start Reading.</p>
                    <p>You can also submit only remarks when a reading is not available.</p>
                  </div>
                </div>
            </section>

            <div className="asset-admin-table-card eb-tracker-chart-card">
                <div className="asset-admin-card-header">
                  <div>
                    <h3>Aitronics First Floor Total Units Graph</h3>
                    <p>Day-wise total units for the First Floor reading flow.</p>
                  </div>
                </div>

                {isFirstFloorLoading ? (
                  <div className="asset-admin-empty-state">
                    <h4>Loading Aitronics graph</h4>
                    <p>Fetching Aitronics EB tracker data from the backend.</p>
                  </div>
                ) : firstFloorChartData.length > 0 ? (
                  <div className="eb-tracker-chart-wrap eb-tracker-chart-wrap-aitronics">
                    <ResponsiveContainer width="100%" height={320}>
                      <LineChart data={firstFloorChartData} margin={{ top: 10, right: 16, left: -12, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#dbe4ee" />
                        <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={10} />
                        <YAxis
                          tickLine={false}
                          axisLine={false}
                          width={72}
                          tickFormatter={(value) => formatUnits(Number(value))}
                        />
                        <Tooltip
                          formatter={(value: number) => [formatUnits(Number(value)), "Total Units"]}
                          labelFormatter={(label) => `Date: ${label}`}
                          contentStyle={{
                            borderRadius: 16,
                            border: "1px solid #dbe4ee",
                            boxShadow: "0 18px 36px rgba(15, 23, 42, 0.12)",
                          }}
                        />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="totalUnits"
                          name="Total Units"
                          stroke="#7c3aed"
                          strokeWidth={3}
                          dot={{ r: 4, strokeWidth: 2, fill: "#ffffff" }}
                          activeDot={{ r: 6 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="asset-admin-empty-state">
                    <h4>No first floor graph data yet</h4>
                    <p>Save a First Floor entry to start the daily total-unit chart.</p>
                  </div>
                )}
              </div>

              <div className="asset-admin-table-card">
                <div className="asset-admin-card-header">
                  <div>
                    <h3>Aitronics First Floor History</h3>
                    <p>Date-wise First Floor records with the simple single-reading model.</p>
                  </div>
                  <div className="asset-admin-card-toolbar">
                    <span>{firstFloorEntries.length} items</span>
                    <span>Single-reading flow</span>
                  </div>
                </div>

                <div className="asset-admin-table-wrap">
                  {isFirstFloorLoading ? (
                    <div className="asset-admin-empty-state">
                      <h4>Loading Aitronics First Floor entries</h4>
                      <p>Fetching EB tracker records from the backend.</p>
                    </div>
                  ) : firstFloorEntries.length > 0 ? (
                    <>
                      <table className="asset-admin-table">
                        <thead>
                          <tr>
                            <th>Date</th>
                            <th>Remarks</th>
                            <th>Start Time</th>
                            <th>Reading</th>
                            <th>End Time</th>
                            <th>Reading</th>
                            <th>Total Units</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {firstFloorPaginatedEntries.paginatedRows.map((entry) => (
                            <tr key={entry.id}>
                              <td>{entry.entryDate}</td>
                              <td>{entry.remarks?.trim() ? entry.remarks : "--"}</td>
                              <td>{entry.startTime || "--"}</td>
                              <td>{formatNullableUnits(entry.startReading)}</td>
                              <td>{entry.endTime || "--"}</td>
                              <td>{formatNullableUnits(entry.endReading)}</td>
                              <td>{formatNullableUnits(entry.totalUnits)}</td>
                              <td>
                                <div className="eb-tracker-row-actions">
                                  <button
                                    type="button"
                                    className="asset-admin-secondary-btn"
                                    onClick={() => handleFirstFloorEdit(entry)}
                                    disabled={isFirstFloorSaving || isFirstFloorDeleting || !entry.apiId}
                                  >
                                    Edit
                                  </button>
                                  <button
                                    type="button"
                                    className="asset-admin-danger-btn"
                                    onClick={() => openFirstFloorDeleteModal(entry)}
                                    disabled={isFirstFloorSaving || isFirstFloorDeleting || !entry.apiId}
                                  >
                                    Delete
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      <TablePagination
                        currentPage={firstFloorPaginatedEntries.currentPage}
                        pageSize={firstFloorPaginatedEntries.pageSize}
                        totalItems={firstFloorPaginatedEntries.totalItems}
                        itemLabel="entries"
                        onPageChange={firstFloorPaginatedEntries.setCurrentPage}
                      />
                    </>
                  ) : (
                    <div className="asset-admin-empty-state">
                      <h4>No Aitronics First Floor entries yet</h4>
                      <p>Save the first First Floor reading to start the table.</p>
                    </div>
                  )}
                </div>
              </div>
          </>
        )}

        {deleteGroundTarget ? (
          <div className="asset-admin-modal-backdrop" onClick={closeGroundDeleteModal}>
            <div
              className="asset-admin-modal"
              onClick={(event) => event.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-labelledby="kq-eb-delete-modal-title"
            >
              <div className="asset-admin-modal-header">
                <div>
                  <p className="asset-admin-modal-kicker">Confirm Delete</p>
                  <h3 id="kq-eb-delete-modal-title">Delete KQ Entry</h3>
                </div>
                <button
                  type="button"
                  className="asset-admin-modal-close"
                  onClick={closeGroundDeleteModal}
                  aria-label="Close delete KQ entry popup"
                >
                  x
                </button>
              </div>

              <p className="eb-tracker-delete-copy">
                Delete the KQ entry for <strong>{deleteGroundTarget.entryDate}</strong>? This action cannot be undone.
              </p>

              {groundDeleteError ? <p className="asset-admin-form-error">{groundDeleteError}</p> : null}

              <div className="asset-admin-form-actions">
                <button type="button" className="asset-admin-secondary-btn" onClick={closeGroundDeleteModal}>
                  Cancel
                </button>
                <button type="button" className="asset-admin-danger-btn" onClick={handleGroundDelete} disabled={isGroundDeleting}>
                  {isGroundDeleting ? "Deleting..." : "Delete Entry"}
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {deleteFirstFloorTarget ? (
          <div className="asset-admin-modal-backdrop" onClick={closeFirstFloorDeleteModal}>
            <div
              className="asset-admin-modal"
              onClick={(event) => event.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-labelledby="aitronics-eb-delete-modal-title"
            >
              <div className="asset-admin-modal-header">
                <div>
                  <p className="asset-admin-modal-kicker">Confirm Delete</p>
                  <h3 id="aitronics-eb-delete-modal-title">Delete Aitronics Entry</h3>
                </div>
                <button
                  type="button"
                  className="asset-admin-modal-close"
                  onClick={closeFirstFloorDeleteModal}
                  aria-label="Close delete Aitronics entry popup"
                >
                  x
                </button>
              </div>

              <p className="eb-tracker-delete-copy">
                Delete the Aitronics entry for <strong>{deleteFirstFloorTarget.entryDate}</strong>? This action cannot be undone.
              </p>

              {firstFloorDeleteError ? <p className="asset-admin-form-error">{firstFloorDeleteError}</p> : null}

              <div className="asset-admin-form-actions">
                <button type="button" className="asset-admin-secondary-btn" onClick={closeFirstFloorDeleteModal}>
                  Cancel
                </button>
                <button
                  type="button"
                  className="asset-admin-danger-btn"
                  onClick={handleFirstFloorDelete}
                  disabled={isFirstFloorDeleting}
                >
                  {isFirstFloorDeleting ? "Deleting..." : "Delete Entry"}
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
