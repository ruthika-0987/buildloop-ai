import { DbRecord } from "./db";

export function generateSeedData(
  adminId: string = "system_admin",
): Record<string, DbRecord> {
  const now = new Date();
  const isoNow = now.toISOString();

  // Hyderabad coordinates reference:
  // Jubilee Hills: 17.4319, 78.4073
  // Financial District (Nanakramguda): 17.4143, 78.3431
  // Gachibowli: 17.4401, 78.3489
  // Kukatpally: 17.4933, 78.3914
  // Begumpet: 17.4447, 78.4664
  // Uppal: 17.4022, 78.5601
  // Shamshabad: 17.2403, 78.4294

  const records: Record<string, DbRecord> = {};

  const add = (collection: string, id: string, data: any) => {
    records[`${collection}:${id}`] = {
      id,
      collection,
      data: {
        ...data,
        id,
        isSample: true,
      },
      updated_at: isoNow,
      updated_by: adminId,
    };
  };

  // 1. Batches (Supply)
  add("batches", "batch-jh-bricks-01", {
    title: "Salvaged Heritage Red Clay Bricks (Jubilee Hills)",
    materialType: "Clay Bricks",
    materialSubtype: "Hand-moulded Red Clay Bricks",
    quantity: 12000,
    unit: "Pieces",
    pricePerUnit: 4.5, // INR per brick (new is ~9-11 INR)
    originalNewPrice: 10,
    condition: "Intact",
    visibleMortar: "Lime mortar, easily brushed",
    lawfulDeclarationAccepted: true,
    location: {
      address: "Road No. 36, Jubilee Hills, Hyderabad",
      lat: 17.4319,
      lng: 78.4073,
      zone: "Jubilee Hills",
    },
    availableFrom: "2026-10-15",
    availableUntil: "2026-11-30",
    readinessScore: 88,
    trustLevel: "L2", // Evidence Verified
    sellerId: adminId,
    sellerName: "Deccan Salvage & Demolition Co.",
    sellerPhone: "+91 98490 12345",
    photos: [
      "https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=800&q=80",
    ],
    documents: [
      {
        name: "Recovery_Source_Deed.pdf",
        type: "Permit",
        verified: true,
        date: "2026-10-10",
      },
      {
        name: "Initial_Visual_Inspection.pdf",
        type: "Measurement",
        verified: true,
        date: "2026-10-11",
      },
    ],
    measurements: {
      lengthMm: 230,
      widthMm: 110,
      heightMm: 70,
      compressiveStrengthMpa: 8.4, // IS 3495 Class 7.5+
    },
    status: "published",
    created_at: isoNow,
  });

  add("batches", "batch-fd-rca-02", {
    title: "Recycled Concrete Aggregate (40mm - Financial District)",
    materialType: "Recycled Concrete Aggregate (RCA)",
    materialSubtype: "Coarse 40mm Graded Concrete Rubble",
    quantity: 250,
    unit: "Tons",
    pricePerUnit: 380, // INR per ton (new granite aggregate is ~750 INR)
    originalNewPrice: 750,
    condition: "Crushed/Rubble",
    visibleMortar: "Under 15% adhering mortar",
    lawfulDeclarationAccepted: true,
    location: {
      address: "Near WaveRock, Financial District, Nanakramguda, Hyderabad",
      lat: 17.4143,
      lng: 78.3431,
      zone: "Financial District",
    },
    availableFrom: "2026-10-14",
    availableUntil: "2026-12-15",
    readinessScore: 92,
    trustLevel: "L3", // Inspection Verified
    sellerId: adminId,
    sellerName: "Telangana Eco-Infra Works",
    sellerPhone: "+91 98480 23456",
    photos: [
      "https://images.unsplash.com/photo-1517646287270-a5a9ca602e5c?auto=format&fit=crop&w=800&q=80",
    ],
    documents: [
      {
        name: "IS383_Gradation_Test_Report.pdf",
        type: "Lab Test",
        verified: true,
        date: "2026-10-09",
      },
    ],
    measurements: {
      aggregateSizeMm: 40,
      sievePassingPercent: 96,
      crushingValue: 24.2,
    },
    status: "published",
    created_at: isoNow,
  });

  add("batches", "batch-kpt-flyash-03", {
    title: "Recovered Fly Ash Hollow Blocks (Kukatpally)",
    materialType: "Fly Ash Bricks",
    materialSubtype: "Cement-Flyash Solid Blocks",
    quantity: 4500,
    unit: "Pieces",
    pricePerUnit: 22, // INR per block (new is ~38 INR)
    originalNewPrice: 38,
    condition: "Minor Chipping",
    visibleMortar: "Clean separation",
    lawfulDeclarationAccepted: true,
    location: {
      address: "KPHB Colony Phase 3, Kukatpally, Hyderabad",
      lat: 17.4933,
      lng: 78.3914,
      zone: "Kukatpally",
    },
    availableFrom: "2026-10-18",
    availableUntil: "2026-11-20",
    readinessScore: 65,
    trustLevel: "L1", // Visual Record
    sellerId: adminId,
    sellerName: "Sri Balaji Site Recyclers",
    sellerPhone: "+91 99080 34567",
    photos: [
      "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80",
    ],
    documents: [],
    measurements: {
      lengthMm: 400,
      widthMm: 200,
      heightMm: 200,
    },
    status: "published",
    created_at: isoNow,
  });

  // 2. Demands (Buyer Requests)
  add("demands", "demand-begumpet-boundary-01", {
    title: "Need 10,000 Bricks for Boundary Wall & Landscaping",
    materialType: "Clay Bricks",
    materialSubtype: "Hand-moulded Red Clay Bricks",
    intendedUse: "Non-loadbearing boundary wall and garden steps",
    quantityNeeded: 10000,
    unit: "Pieces",
    maxBudgetPerUnit: 6.0,
    requiredTrustLevel: "L2",
    deliveryLocation: {
      address: "Prakash Nagar, Begumpet, Hyderabad",
      lat: 17.4447,
      lng: 78.4664,
      zone: "Begumpet",
    },
    neededFrom: "2026-10-15",
    neededUntil: "2026-11-15",
    buyerId: adminId,
    buyerName: "GreenScape Landscapes Hyderabad",
    buyerPhone: "+91 97010 88990",
    status: "open",
    created_at: isoNow,
  });

  add("demands", "demand-gachibowli-subbase-02", {
    title: "Sub-base Gravel / Coarse Aggregate for Parking Area",
    materialType: "Recycled Concrete Aggregate (RCA)",
    materialSubtype: "Coarse 40mm Graded Concrete Rubble",
    intendedUse: "Porous parking pavement sub-base layer",
    quantityNeeded: 200,
    unit: "Tons",
    maxBudgetPerUnit: 500,
    requiredTrustLevel: "L2",
    deliveryLocation: {
      address: "Telecom Nagar, Gachibowli, Hyderabad",
      lat: 17.4401,
      lng: 78.3489,
      zone: "Gachibowli",
    },
    neededFrom: "2026-10-16",
    neededUntil: "2026-12-01",
    buyerId: adminId,
    buyerName: "Urban Habitat Builders",
    buyerPhone: "+91 94400 55667",
    status: "open",
    created_at: isoNow,
  });

  // 3. Inventory Events
  add("events", "evt-01", {
    batchId: "batch-jh-bricks-01",
    eventType: "recovered",
    quantity: 12000,
    unit: "Pieces",
    source: "manual",
    actorId: adminId,
    actorName: "Deccan Salvage",
    notes: "Recovered from heritage villa demolition with manual de-mortaring.",
    timestamp: new Date(now.getTime() - 48 * 3600000).toISOString(),
  });

  add("events", "evt-02", {
    batchId: "batch-fd-rca-02",
    eventType: "recovered",
    quantity: 250,
    unit: "Tons",
    source: "qr_scan",
    actorId: adminId,
    actorName: "Telangana Eco-Infra",
    notes: "Crushed on-site with 40mm screener plant.",
    timestamp: new Date(now.getTime() - 72 * 3600000).toISOString(),
  });

  add("events", "evt-03", {
    batchId: "batch-kpt-flyash-03",
    eventType: "recovered",
    quantity: 4500,
    unit: "Pieces",
    source: "manual",
    actorId: adminId,
    actorName: "Sri Balaji Site Recyclers",
    notes: "Stacked and sorted in yard.",
    timestamp: new Date(now.getTime() - 24 * 3600000).toISOString(),
  });

  // 4. Sample Order
  add("orders", "order-sample-01", {
    batchId: "batch-jh-bricks-01",
    demandId: "demand-begumpet-boundary-01",
    sellerId: adminId,
    sellerName: "Deccan Salvage & Demolition Co.",
    buyerId: adminId,
    buyerName: "GreenScape Landscapes Hyderabad",
    driverToken: "driver-live-token-889",
    orderType: "B", // Inspect-first
    quantity: 2000,
    unit: "Pieces",
    unitPrice: 4.5,
    totalMaterialCost: 9000,
    simulatedLogisticsCost: 1800,
    simulatedEscrowTotal: 10800,
    status: "accepted", // Requested -> Accepted -> Inspection -> Pre-dispatch -> Dispatched -> Delivered -> Delivery check -> Closed
    paymentStatus: "ESCROW_HELD_SIMULATED",
    preDispatchGate: {
      evidenceCheckPassed: true,
      inspectionPassed: true,
      inspectorName: "Er. R. K. Rao (Govt Empanelled)",
      inspectorNotes:
        "Bricks inspected on site: minimal fractures, mortar clean.",
      gateUnlocked: true,
    },
    driverInfo: {
      name: "M. Yadagiri",
      phone: "+91 98492 44332",
      vehicleNumber: "TS 09 UA 4120 (Tata 407)",
      tripStatus: "not_started", // not_started | in_transit | delivered
      currentLat: 17.4319,
      currentLng: 78.4073,
      lastPingAt: isoNow,
    },
    deliveryCheck: {
      checked: false,
      deadlineAt: new Date(now.getTime() + 48 * 3600000).toISOString(),
      acceptedQuantity: 0,
      damagedQuantity: 0,
      damagePercent: 0,
      remedy: null,
    },
    created_at: isoNow,
  });

  // Reserve the 2000 pieces in event ledger
  add("events", "evt-order-01-reserve", {
    batchId: "batch-jh-bricks-01",
    orderId: "order-sample-01",
    eventType: "reserved",
    quantity: 2000,
    unit: "Pieces",
    source: "manual",
    actorId: adminId,
    actorName: "System Engine",
    notes: "Escrow hold reservation for Order #order-sample-01",
    timestamp: isoNow,
  });

  // 5. Sample Alert
  add("alerts", "alert-sample-01", {
    userId: adminId,
    type: "match_found",
    title: "High Feasibility Match: 87/100",
    body: "Salvaged Heritage Red Clay Bricks (Jubilee Hills) is an 87/100 match for your Boundary Wall demand.",
    link: "#/batches/batch-jh-bricks-01",
    read: false,
    created_at: isoNow,
  });

  // 6. Sample IS 3495 Test Report
  add("testReports", "test-is3495-01", {
    batchId: "batch-jh-bricks-01",
    standard: "IS 3495 (Parts 1-4) / DEMO Reference",
    isDemoThresholds: true,
    testDate: "2026-10-12",
    labName: "JNTUH Material Testing Wing (Sample Demo)",
    compressiveStrengthMpa: 8.4,
    waterAbsorptionPercent: 14.2,
    efflorescence: "Slight",
    dimensionalToleranceMm: 3,
    sampleSize: 10,
    failedCount: 1, // 1 of 10 failed
    wilson95UpperBound: 40.4, // Wilson 95% upper bound
    verdict: "Compliant for non-loadbearing and exterior cladding",
    created_at: isoNow,
  });

  // 7. Sample IoT Readings
  add("sensor_readings", "iot-log-01", {
    deviceId: "DEV-TEL-HYD-04",
    batchId: "batch-jh-bricks-01",
    moisturePercent: 4.8,
    ambientTempC: 31.5,
    vibrationG: 0.08,
    tiltDegrees: 0.4,
    batteryPercent: 94,
    timestamp: isoNow,
    status: "NORMAL",
  });

  return records;
}
