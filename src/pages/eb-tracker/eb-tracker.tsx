import React, { useMemo, useState } from "react";
import "../../styles/pages/asset-admin/asset-admin.scss";
import "../../styles/pages/eb-tracker/eb-tracker.scss";

interface EbFormState {
  entryDate: string;
  startTime: string;
  endTime: string;
  startKqReading: string;
  startBleReading: string;
  startDgReading: string;
  endKqReading: string;
  endBleReading: string;
  endDgReading: string;
}

interface EbEntryRecord {
  id: string;
  entryDate: string;
  startTime: string;
  endTime: string;
  startKqReading: number;
  endKqReading: number;
  startBleReading: number;
  endBleReading: number;
  startDgReading: number;
  endDgReading: number;
  totalUnitKq: number;
  totalUnitBle: number;
  dgUnit: number;
}

interface EbDisplayEntryRecord extends EbEntryRecord {
  intraUnitKq: number | null;
  intraUnitBle: number | null;
}

const today = new Date().toISOString().slice(0, 10);

const initialFormState: EbFormState = {
  entryDate: today,
  startTime: "",
  endTime: "",
  startKqReading: "",
  startBleReading: "",
  startDgReading: "",
  endKqReading: "",
  endBleReading: "",
  endDgReading: "",
};

const parseReading = (value: string) => {
  const parsedValue = Number(value);
  return Number.isFinite(parsedValue) ? parsedValue : 0;
};

const addOneDay = (dateValue: string) => {
  const parsedDate = new Date(`${dateValue}T00:00:00`);
  parsedDate.setDate(parsedDate.getDate() + 1);
  return parsedDate.toISOString().slice(0, 10);
};

const sortEntriesByDate = (records: EbEntryRecord[]) =>
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

export default function EbTrackerPage() {
  const [formData, setFormData] = useState<EbFormState>(initialFormState);
  const [entries, setEntries] = useState<EbEntryRecord[]>([]);

  const calculations = useMemo(() => {
    const startKq = parseReading(formData.startKqReading);
    const endKq = parseReading(formData.endKqReading);
    const startBle = parseReading(formData.startBleReading);
    const endBle = parseReading(formData.endBleReading);
    const startDg = parseReading(formData.startDgReading);
    const endDg = parseReading(formData.endDgReading);
    const dgUnit = endDg - startDg;
    const totalUnitKq = endKq - startKq;
    const totalUnitBle = endBle - startBle;

    return {
      dgUnit,
      totalUnitKq,
      totalUnitBle,
    };
  }, [
    formData.endBleReading,
    formData.endDgReading,
    formData.endKqReading,
    formData.startBleReading,
    formData.startDgReading,
    formData.startKqReading,
  ]);

  const displayEntries = useMemo<EbDisplayEntryRecord[]>(() => {
    const sortedEntries = sortEntriesByDate(entries);

    return sortedEntries.map((entry) => {
      const nextDayEntry = sortedEntries.find(
        (candidate) => candidate.entryDate === addOneDay(entry.entryDate)
      );

      return {
        ...entry,
        intraUnitKq: nextDayEntry ? entry.endKqReading - nextDayEntry.startKqReading : null,
        intraUnitBle: nextDayEntry ? entry.endBleReading - nextDayEntry.startBleReading : null,
      };
    });
  }, [entries]);

  const isCalculationReady =
    formData.endTime.trim() !== "" &&
    formData.startTime.trim() !== "" &&
    formData.startKqReading.trim() !== "" &&
    formData.startBleReading.trim() !== "" &&
    formData.startDgReading.trim() !== "" &&
    formData.endKqReading.trim() !== "" &&
    formData.endBleReading.trim() !== "" &&
    formData.endDgReading.trim() !== "";

  const isSaveDisabled = !isCalculationReady || formData.entryDate.trim() === "";

  const nextDayForCurrentEntry = useMemo(
    () => entries.find((entry) => entry.entryDate === addOneDay(formData.entryDate)),
    [entries, formData.entryDate]
  );

  const currentIntraUnitKq =
    isCalculationReady && nextDayForCurrentEntry
      ? parseReading(formData.endKqReading) - nextDayForCurrentEntry.startKqReading
      : null;

  const currentIntraUnitBle =
    isCalculationReady && nextDayForCurrentEntry
      ? parseReading(formData.endBleReading) - nextDayForCurrentEntry.startBleReading
      : null;

  const metrics = [
    { label: "Saved Entries", value: displayEntries.length, helper: "Date-wise energy entries stored in this screen" },
    {
      label: "Latest Date",
      value: displayEntries[0]?.entryDate ?? formData.entryDate,
      helper: "Most recent tracker date in the working list",
    },
    {
      label: "Latest KQ Total",
      value: displayEntries[0] ? formatUnits(displayEntries[0].totalUnitKq) : formatUnits(calculations.totalUnitKq),
      helper: "Computed as end KQ minus start KQ",
    },
    {
      label: "Latest BLE Total",
      value: displayEntries[0] ? formatUnits(displayEntries[0].totalUnitBle) : formatUnits(calculations.totalUnitBle),
      helper: "Computed as end BLE minus start BLE",
    },
  ];

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleReset = () => {
    setFormData({
      ...initialFormState,
      entryDate: formData.entryDate || today,
    });
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isSaveDisabled) {
      return;
    }

    const nextEntry: EbEntryRecord = {
      id: `${formData.entryDate}-${formData.startTime}-${Date.now()}`,
      entryDate: formData.entryDate,
      startTime: formData.startTime,
      endTime: formData.endTime,
      startKqReading: parseReading(formData.startKqReading),
      endKqReading: parseReading(formData.endKqReading),
      startBleReading: parseReading(formData.startBleReading),
      endBleReading: parseReading(formData.endBleReading),
      startDgReading: parseReading(formData.startDgReading),
      endDgReading: parseReading(formData.endDgReading),
      totalUnitKq: calculations.totalUnitKq,
      totalUnitBle: calculations.totalUnitBle,
      dgUnit: calculations.dgUnit,
    };

    setEntries((current) => sortEntriesByDate([nextEntry, ...current]));
    setFormData((current) => ({
      ...initialFormState,
      entryDate: current.entryDate,
    }));
  };

  return (
    <div className="asset-admin-page eb-tracker-page">
      <div className="asset-admin-shell">
        <div className="asset-admin-hero eb-tracker-hero">
          <div className="asset-admin-hero-copy">
            <p className="asset-admin-kicker">Utility Monitoring</p>
            <h2>EB Tracker</h2>
            <p>
              Capture date-wise start and end readings, then review the calculated energy units for KQ and BLE
              instantly before saving the day&apos;s entry.
            </p>
            <div className="asset-admin-hero-meta">
              <span>Start + end shift entry</span>
              <span>Live unit calculation</span>
              <span>Daily tracker preview</span>
            </div>
          </div>
          <div className="asset-admin-hero-highlight">
            <span>Calculation Rule</span>
            <strong>Intra Unit uses the next day start reading</strong>
            <p>Total Unit is calculated separately for KQ and BLE using same-day readings only.</p>
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

        <div className="eb-tracker-grid">
          <div className="asset-admin-table-card eb-tracker-entry-card">
            <div className="asset-admin-card-header">
              <div>
                <h3>Daily Entry Form</h3>
                <p>Enter the date, start readings, and end readings to compute units automatically.</p>
              </div>
            </div>

            <form className="eb-tracker-form" onSubmit={handleSubmit}>
              <div className="eb-tracker-section">
                <label className="asset-admin-control">
                  <span>Entry Date</span>
                  <input
                    type="date"
                    name="entryDate"
                    value={formData.entryDate}
                    onChange={handleInputChange}
                  />
                </label>
              </div>

              <div className="eb-tracker-reading-grid">
                <div className="eb-tracker-reading-card">
                  <div className="eb-tracker-reading-header">
                    <h4>Start Time</h4>
                    <p>Beginning readings for the selected date.</p>
                  </div>
                  <div className="eb-tracker-input-grid">
                    <label className="asset-admin-control">
                      <span>Start Time</span>
                      <input
                        type="time"
                        name="startTime"
                        value={formData.startTime}
                        onChange={handleInputChange}
                      />
                    </label>
                    <label className="asset-admin-control">
                      <span>KQ Reading</span>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        name="startKqReading"
                        value={formData.startKqReading}
                        onChange={handleInputChange}
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
                        value={formData.startBleReading}
                        onChange={handleInputChange}
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
                        value={formData.startDgReading}
                        onChange={handleInputChange}
                        placeholder="Enter DG start"
                      />
                    </label>
                  </div>
                </div>

                <div className="eb-tracker-reading-card">
                  <div className="eb-tracker-reading-header">
                    <h4>End Time</h4>
                    <p>Closing readings used for unit calculation.</p>
                  </div>
                  <div className="eb-tracker-input-grid">
                    <label className="asset-admin-control">
                      <span>End Time</span>
                      <input
                        type="time"
                        name="endTime"
                        value={formData.endTime}
                        onChange={handleInputChange}
                      />
                    </label>
                    <label className="asset-admin-control">
                      <span>KQ Reading</span>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        name="endKqReading"
                        value={formData.endKqReading}
                        onChange={handleInputChange}
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
                        value={formData.endBleReading}
                        onChange={handleInputChange}
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
                        value={formData.endDgReading}
                        onChange={handleInputChange}
                        placeholder="Enter DG end"
                      />
                    </label>
                  </div>
                </div>
              </div>

              <div className="eb-tracker-form-actions">
                <button type="button" className="asset-admin-secondary-btn" onClick={handleReset}>
                  Clear Entry
                </button>
                <button type="submit" className="asset-admin-primary-btn" disabled={isSaveDisabled}>
                  Save Entry
                </button>
              </div>
            </form>
          </div>

          <div className="asset-admin-table-card eb-tracker-summary-card">
            <div className="asset-admin-card-header">
              <div>
                <h3>Calculated Units</h3>
                <p>The values below update as soon as the end-time readings are available.</p>
              </div>
            </div>

            <div className="eb-tracker-summary-grid">
              <div className="eb-tracker-summary-item">
                <span>Total Unit (KQ)</span>
                <strong>{isCalculationReady ? formatUnits(calculations.totalUnitKq) : "--"}</strong>
              </div>
              <div className="eb-tracker-summary-item">
                <span>Total Unit (Ble)</span>
                <strong>{isCalculationReady ? formatUnits(calculations.totalUnitBle) : "--"}</strong>
              </div>
              <div className="eb-tracker-summary-item">
                <span>Intra Unit (KQ)</span>
                <strong>{currentIntraUnitKq === null ? "Pending" : formatUnits(currentIntraUnitKq)}</strong>
              </div>
              <div className="eb-tracker-summary-item">
                <span>Intra Unit (Ble)</span>
                <strong>{currentIntraUnitBle === null ? "Pending" : formatUnits(currentIntraUnitBle)}</strong>
              </div>
            </div>

            <div className="eb-tracker-rule-note">
              <p>DG Unit: {isCalculationReady ? formatUnits(calculations.dgUnit) : "--"}</p>
              <p>Intra Unit is calculated as current date end reading minus the next day start reading.</p>
            </div>
          </div>
        </div>

        <div className="asset-admin-table-card">
          <div className="asset-admin-card-header">
            <div>
              <h3>EB Tracker History</h3>
              <p>{displayEntries.length} saved entries currently available in this frontend session.</p>
            </div>
            <div className="asset-admin-card-toolbar">
              <span>{displayEntries.length} items</span>
              <span>Date-wise preview</span>
            </div>
          </div>

          <div className="asset-admin-table-wrap">
            {displayEntries.length > 0 ? (
              <table className="asset-admin-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Start Time</th>
                    <th>End Time</th>
                    <th>Total Unit (KQ)</th>
                    <th>Total Unit (Ble)</th>
                    <th>Intra Unit (KQ)</th>
                    <th>Intra Unit (Ble)</th>
                  </tr>
                </thead>
                <tbody>
                  {displayEntries.map((entry) => (
                    <tr key={entry.id}>
                      <td>{entry.entryDate}</td>
                      <td>{entry.startTime}</td>
                      <td>{entry.endTime}</td>
                      <td>{formatUnits(entry.totalUnitKq)}</td>
                      <td>{formatUnits(entry.totalUnitBle)}</td>
                      <td>{entry.intraUnitKq === null ? "Pending next day" : formatUnits(entry.intraUnitKq)}</td>
                      <td>{entry.intraUnitBle === null ? "Pending next day" : formatUnits(entry.intraUnitBle)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="asset-admin-empty-state">
                <h4>No EB entries yet</h4>
                <p>Fill the form above and save the first date-wise tracker record to start the history table.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
