import { Router, Request, Response } from 'express';
import { db, DbRecord } from '../db';

const router = Router();

// Device ingestion endpoint
router.post('/sensor', (req: Request, res: Response) => {
  const deviceKey = req.headers['x-device-key'] || req.body.deviceKey;
  // Demo key validation: any valid key starting with 'BL-IOT-' or default demo key
  if (!deviceKey || (typeof deviceKey === 'string' && !deviceKey.startsWith('BL-IOT-') && deviceKey !== 'demo-iot-key')) {
    return res.status(401).json({ error: 'Invalid or missing device key. Must start with BL-IOT- or use demo-iot-key' });
  }

  const { deviceId, batchId, moisturePercent, ambientTempC, vibrationG, tiltDegrees, batteryPercent } = req.body;

  if (!deviceId || !batchId) {
    return res.status(400).json({ error: 'deviceId and batchId are required' });
  }

  const id = `iot-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  const nowIso = new Date().toISOString();

  let status: 'NORMAL' | 'WARNING' | 'ALERT' = 'NORMAL';
  if ((vibrationG && vibrationG > 0.5) || (tiltDegrees && tiltDegrees > 5) || (moisturePercent && moisturePercent > 20)) {
    status = 'WARNING';
  }

  const readingData = {
    id,
    deviceId,
    batchId,
    moisturePercent: Number(moisturePercent ?? 0),
    ambientTempC: Number(ambientTempC ?? 28),
    vibrationG: Number(vibrationG ?? 0),
    tiltDegrees: Number(tiltDegrees ?? 0),
    batteryPercent: Number(batteryPercent ?? 100),
    timestamp: nowIso,
    status
  };

  const rec: DbRecord = {
    id,
    collection: 'sensor_readings',
    data: readingData,
    updated_at: nowIso,
    updated_by: `device:${deviceId}`
  };

  db.upsertRecord(rec);

  // If status is WARNING, auto-create an audit event
  if (status === 'WARNING') {
    const eventId = `evt-iot-alert-${Date.now()}`;
    db.upsertRecord({
      id: eventId,
      collection: 'events',
      data: {
        id: eventId,
        batchId,
        eventType: 'damaged',
        quantity: 0,
        unit: 'Pieces',
        source: 'iot_device',
        actorId: `device:${deviceId}`,
        actorName: `IoT Telemetry (${deviceId})`,
        notes: `Telemetry threshold exceeded: vibration=${vibrationG}G, tilt=${tiltDegrees}°, moisture=${moisturePercent}%`,
        timestamp: nowIso
      },
      updated_at: nowIso,
      updated_by: `device:${deviceId}`
    });
  }

  return res.status(201).json({
    success: true,
    readingId: id,
    status,
    message: 'Sensor reading ingested successfully'
  });
});

export default router;
