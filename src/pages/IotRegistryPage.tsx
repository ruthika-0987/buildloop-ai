import React, { useState } from 'react';
import { Radio, Activity, AlertTriangle, ShieldCheck, Plus, RefreshCw, Send, CheckCircle2 } from 'lucide-react';
import { useData } from '../context/DataContext';
import { useToast } from '../context/ToastContext';
import { useTranslation, t } from '../i18n';
import { SimulatedChip } from '../components/Badge';

export const IotRegistryPage: React.FC = () => {
  const { sensor_readings, batches, refreshData } = useData();
  const { showSuccess, showError } = useToast();
  const { currentLanguage } = useTranslation();

  // Simulator controls
  const [targetBatchId, setTargetBatchId] = useState<string>(batches[0]?.id || '');
  const [deviceId, setDeviceId] = useState<string>('DEV-TEL-HYD-04');
  const [deviceKey, setDeviceKey] = useState<string>('BL-IOT-HYD-PRIMARY-KEY');
  const [moisture, setMoisture] = useState<number>(6.2);
  const [temp, setTemp] = useState<number>(31.0);
  const [vibration, setVibration] = useState<number>(0.12);
  const [tilt, setTilt] = useState<number>(0.5);
  const [battery, setBattery] = useState<number>(92);
  const [sending, setSending] = useState(false);

  const handleSimulateReading = async () => {
    if (!targetBatchId) {
      showError('Please select a target batch.');
      return;
    }

    setSending(true);
    try {
      const res = await fetch('/api/ingest/sensor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-device-key': deviceKey
        },
        body: JSON.stringify({
          deviceId,
          batchId: targetBatchId,
          moisturePercent: Number(moisture),
          ambientTempC: Number(temp),
          vibrationG: Number(vibration),
          tiltDegrees: Number(tilt),
          batteryPercent: Number(battery)
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to ingest sensor telemetry');
      }

      showSuccess(`Sensor packet ingested! Status: ${data.status}`);
      await refreshData();
    } catch (err: any) {
      showError(err.message || 'Ingestion failed.', 'Check device key format (must start with BL-IOT-).');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            Hardware & Telemetry • Milestone M10
          </span>
          <h1 className="text-2xl font-extrabold text-stone-900 dark:text-stone-100">
            IoT Sensor Registry & Ingestion
          </h1>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
            "IoT-ready, not IoT-dependent." Everything in BuildLoop works without any physical device.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <SimulatedChip label="SIMULATOR READY" />
        </div>
      </div>

      {/* Simulator Card */}
      <div className="p-6 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-4 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
          <div className="flex items-center gap-2">
            <Radio className="w-5 h-5 text-emerald-600" />
            <h2 className="font-bold text-base text-stone-900 dark:text-stone-100">
              Live Sensor Signal Generator (Simulator)
            </h2>
          </div>
          <span className="text-[10px] text-stone-400 font-mono">POST /api/ingest/sensor</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block font-semibold mb-1">Target Material Batch</label>
            <select
              value={targetBatchId}
              onChange={e => setTargetBatchId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800"
            >
              {batches.map(b => (
                <option key={b.id} value={b.id}>
                  {b.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold mb-1">Device Identifier</label>
            <input
              type="text"
              value={deviceId}
              onChange={e => setDeviceId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 font-mono"
            />
          </div>

          <div>
            <label className="block font-semibold mb-1">Device Key (x-device-key)</label>
            <input
              type="text"
              value={deviceKey}
              onChange={e => setDeviceKey(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 font-mono text-[11px]"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2 text-xs">
          <div>
            <label className="block text-[11px] font-medium text-stone-500 mb-1">Moisture (%)</label>
            <input
              type="number"
              step="0.1"
              value={moisture}
              onChange={e => setMoisture(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-1.5 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 font-mono"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-stone-500 mb-1">Temp (°C)</label>
            <input
              type="number"
              step="0.5"
              value={temp}
              onChange={e => setTemp(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-1.5 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 font-mono"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-stone-500 mb-1">Vibration (G)</label>
            <input
              type="number"
              step="0.05"
              value={vibration}
              onChange={e => setVibration(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-1.5 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 font-mono"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-stone-500 mb-1">Tilt (Degrees)</label>
            <input
              type="number"
              step="0.1"
              value={tilt}
              onChange={e => setTilt(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-1.5 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 font-mono"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-stone-500 mb-1">Battery (%)</label>
            <input
              type="number"
              min="0"
              max="100"
              value={battery}
              onChange={e => setBattery(parseInt(e.target.value) || 0)}
              className="w-full px-3 py-1.5 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 font-mono"
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-stone-100 dark:border-stone-800">
          <p className="text-[11px] text-stone-400">
            Tip: Set Vibration &gt; 0.5G or Tilt &gt; 5° to trigger an automated WARNING audit event.
          </p>
          <button
            onClick={handleSimulateReading}
            disabled={sending}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{sending ? 'Transmitting…' : 'Transmit Sensor Reading'}</span>
          </button>
        </div>
      </div>

      {/* Ingested Readings Table */}
      <section className="p-6 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
          <h2 className="font-bold text-base text-stone-900 dark:text-stone-100">
            Ingested Telemetry Log ({sensor_readings.length})
          </h2>
          <button
            onClick={refreshData}
            className="p-1.5 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-400"
            aria-label="Refresh telemetry"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-stone-200 dark:border-stone-800 text-stone-400 font-medium">
                <th className="pb-2">Timestamp</th>
                <th className="pb-2">Device ID</th>
                <th className="pb-2">Batch</th>
                <th className="pb-2">Moisture</th>
                <th className="pb-2">Vibration</th>
                <th className="pb-2">Tilt</th>
                <th className="pb-2">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-stone-800 font-mono">
              {sensor_readings.map(r => (
                <tr key={r.id} className="text-stone-700 dark:text-stone-300">
                  <td className="py-2.5 text-[11px] text-stone-400">
                    {new Date(r.timestamp).toLocaleTimeString()}
                  </td>
                  <td className="py-2.5 font-bold">{r.deviceId}</td>
                  <td className="py-2.5 font-sans truncate max-w-xs">{r.batchId}</td>
                  <td className="py-2.5">{r.moisturePercent}%</td>
                  <td className="py-2.5">{r.vibrationG}G</td>
                  <td className="py-2.5">{r.tiltDegrees}°</td>
                  <td className="py-2.5 font-sans">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      r.status === 'NORMAL' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {r.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
