import React, { useState, useEffect } from 'react';
import { Truck, MapPin, Navigation, CheckCircle2, Clock, AlertTriangle, ShieldCheck } from 'lucide-react';
import { useData } from '../context/DataContext';
import { useToast } from '../context/ToastContext';
import { MapViewer, MapMarker } from '../components/MapViewer';
import { SimulatedChip } from '../components/Badge';

export const DriverTrackingPage: React.FC<{ token: string }> = ({ token }) => {
  const { orders, batches, saveRecord } = useData();
  const { showSuccess, showError } = useToast();

  const [simulating, setSimulating] = useState(false);
  const [gpsActive, setGpsActive] = useState(false);
  const [lastPing, setLastPing] = useState<string>(new Date().toISOString());

  // Find order matching token
  const order = orders.find(o => o.driverToken === token);
  const batch = order ? batches.find(b => b.id === order.batchId) : null;

  // Truck position state (defaults to batch origin or current Hyderabad position)
  const [truckLat, setTruckLat] = useState<number>(order?.driverInfo.currentLat || batch?.location.lat || 17.4319);
  const [truckLng, setTruckLng] = useState<number>(order?.driverInfo.currentLng || batch?.location.lng || 78.4073);

  // Stale check: > 2 minutes without ping
  const isStale = (Date.now() - new Date(lastPing).getTime()) > 120000;

  // Real phone GPS tracking with consent
  const toggleRealGps = () => {
    if (!navigator.geolocation) {
      showError('GPS geolocation not supported on this device.');
      return;
    }
    if (gpsActive) {
      setGpsActive(false);
      showSuccess('Phone GPS tracking paused.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      pos => {
        setTruckLat(pos.coords.latitude);
        setTruckLng(pos.coords.longitude);
        setLastPing(new Date().toISOString());
        setGpsActive(true);
        showSuccess('Live GPS broadcast active (updates every 15s).');
      },
      err => {
        showError('Permission denied for GPS tracking.', 'Allow location in your browser.');
      }
    );
  };

  // 15-second periodic GPS update when active
  useEffect(() => {
    if (!gpsActive) return;
    const interval = setInterval(() => {
      navigator.geolocation.getCurrentPosition(pos => {
        setTruckLat(pos.coords.latitude);
        setTruckLng(pos.coords.longitude);
        setLastPing(new Date().toISOString());
        if (order) {
          saveRecord('orders', {
            ...order,
            driverInfo: {
              ...order.driverInfo,
              currentLat: pos.coords.latitude,
              currentLng: pos.coords.longitude,
              lastPingAt: new Date().toISOString()
            }
          });
        }
      });
    }, 15000);

    return () => clearInterval(interval);
  }, [gpsActive, order, saveRecord]);

  if (!order) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 text-center bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 space-y-3">
        <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto" />
        <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100">Invalid Driver Token</h2>
        <p className="text-xs text-stone-500">
          This driver tracking link is expired or does not correspond to an active order.
        </p>
      </div>
    );
  }

  const handleStartTrip = async () => {
    const updated = {
      ...order,
      status: 'dispatched' as const,
      driverInfo: {
        ...order.driverInfo,
        tripStatus: 'in_transit' as const,
        currentLat: truckLat,
        currentLng: truckLng,
        lastPingAt: new Date().toISOString()
      }
    };
    await saveRecord('orders', updated);
    showSuccess('Trip started! Status updated to In Transit.');
  };

  const handleMarkDelivered = async () => {
    const updated = {
      ...order,
      status: 'delivered' as const,
      driverInfo: {
        ...order.driverInfo,
        tripStatus: 'delivered' as const
      },
      deliveryCheck: {
        ...order.deliveryCheck,
        deadlineAt: new Date(Date.now() + 48 * 3600000).toISOString()
      }
    };
    await saveRecord('orders', updated);
    showSuccess('Delivery confirmed! 48-hour buyer check window started.');
  };

  // Simulate Trip Movement
  const handleSimulateMovement = () => {
    setSimulating(true);
    let step = 0;
    const destLat = 17.4447; // Begumpet destination
    const destLng = 78.4664;
    const startLat = truckLat;
    const startLng = truckLng;

    const interval = setInterval(() => {
      step += 1;
      const progress = step / 5;
      const curLat = startLat + (destLat - startLat) * progress;
      const curLng = startLng + (destLng - startLng) * progress;
      setTruckLat(curLat);
      setTruckLng(curLng);
      setLastPing(new Date().toISOString());

      if (step >= 5) {
        clearInterval(interval);
        setSimulating(false);
        showSuccess('Simulated truck arrived at buyer site!');
      }
    }, 1500);
  };

  const markers: MapMarker[] = [
    {
      id: 'origin',
      lat: batch?.location.lat || 17.4319,
      lng: batch?.location.lng || 78.4073,
      title: 'Origin / Salvage Site',
      subtitle: batch?.location.address,
      type: 'batch'
    },
    {
      id: 'truck',
      lat: truckLat,
      lng: truckLng,
      title: `Truck (${order.driverInfo.vehicleNumber})`,
      subtitle: `Driver: ${order.driverInfo.name}`,
      type: 'truck'
    },
    {
      id: 'dest',
      lat: 17.4447,
      lng: 78.4664,
      title: 'Buyer Site Destination',
      subtitle: 'Begumpet Site',
      type: 'demand'
    }
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6 py-6 px-4">
      {/* Header */}
      <div className="p-5 rounded-2xl bg-stone-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <Truck className="w-5 h-5 text-emerald-400" />
            <h1 className="text-xl font-bold">Driver Trip Portal</h1>
            <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-stone-800 text-emerald-300">
              No Login Required
            </span>
          </div>
          <p className="text-xs text-stone-400 mt-1">
            Order #{order.id} • Vehicle: {order.driverInfo.vehicleNumber} ({order.driverInfo.name})
          </p>
        </div>

        <div className="flex items-center gap-2">
          <SimulatedChip label="SIMULATED TELEMETRY" />
        </div>
      </div>

      {/* Trip Status Banner */}
      <div className="p-4 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 flex items-center justify-between text-xs">
        <div>
          <span className="text-stone-400 block text-[10px]">CURRENT STATUS</span>
          <span className="font-extrabold text-sm uppercase text-emerald-600 dark:text-emerald-400">
            {order.driverInfo.tripStatus.replace('_', ' ')}
          </span>
          <span className="text-[10px] text-stone-500 block mt-0.5">
            Last GPS ping: {new Date(lastPing).toLocaleTimeString()} {isStale && '(Stale >2min)'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {order.driverInfo.tripStatus === 'not_started' && (
            <button
              onClick={handleStartTrip}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm"
            >
              Start Trip
            </button>
          )}

          {order.driverInfo.tripStatus === 'in_transit' && (
            <button
              onClick={handleMarkDelivered}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-sm"
            >
              Confirm Delivered
            </button>
          )}
        </div>
      </div>

      {/* Map View */}
      <div className="space-y-2">
        <MapViewer markers={markers} height="400px" center={[truckLat, truckLng]} zoom={13} />
        <div className="flex items-center justify-between text-[11px] text-stone-500">
          <span>Lat: {truckLat.toFixed(4)}, Lng: {truckLng.toFixed(4)}</span>
          <span>Route: Jubilee Hills → Begumpet (~16 km road)</span>
        </div>
      </div>

      {/* Driver Controls */}
      <div className="p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-4">
        <h3 className="font-bold text-sm text-stone-900 dark:text-stone-100">
          Driver Location & Simulation Tools
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={toggleRealGps}
            className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition ${
              gpsActive
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                : 'border-stone-300 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-200'
            }`}
          >
            <Navigation className="w-4 h-4" />
            <span>{gpsActive ? 'GPS Active (Updating)' : 'Broadcast Phone GPS'}</span>
          </button>

          <button
            onClick={handleSimulateMovement}
            disabled={simulating}
            className="p-3 rounded-xl border border-stone-300 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 text-xs font-semibold flex items-center justify-center gap-2"
          >
            <Truck className="w-4 h-4 text-purple-600" />
            <span>{simulating ? 'Simulating trip…' : 'Simulate Trip (SIMULATED)'}</span>
          </button>
        </div>

        <p className="text-[11px] text-stone-400 leading-relaxed">
          * Broadcast Phone GPS requests your browser geolocation and sends an encrypted ping every 15 seconds. No personal account or login required.
        </p>
      </div>
    </div>
  );
};
