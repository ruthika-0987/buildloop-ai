export type UserRole = 'admin' | 'seller' | 'buyer' | 'both' | 'inspector';
export type Language = 'en' | 'te' | 'hi';

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: UserRole;
  language: Language;
  created_at: string;
}

export type TrustLevel = 'L1' | 'L2' | 'L3';
// L1: Visual Record (photos and details only)
// L2: Evidence Verified (readiness >= 70 and at least 1 document or measurement)
// L3: Inspection Verified (only certified inspector or admin after inspection form)

export type FactState = 'seen' | 'claimed' | 'verified' | 'unknown';

export interface LocationInfo {
  address: string;
  lat: number;
  lng: number;
  zone?: string;
}

export interface BatchDocument {
  name: string;
  type: string;
  url?: string;
  verified: boolean;
  date: string;
}

export interface BatchMeasurements {
  lengthMm?: number;
  widthMm?: number;
  heightMm?: number;
  compressiveStrengthMpa?: number;
  aggregateSizeMm?: number;
  sievePassingPercent?: number;
  crushingValue?: number;
  rebarDiameterMm?: number;
  rebarGrade?: string;
}

export interface Batch {
  id: string;
  title: string;
  materialType: string;
  materialSubtype: string;
  quantity: number;
  unit: string;
  pricePerUnit: number; // in INR
  originalNewPrice?: number; // for economic savings calculation
  condition: 'Intact' | 'Minor Chipping' | 'Mixed Mortar' | 'Crushed/Rubble' | 'Heavily Damaged';
  visibleMortar?: string;
  lawfulDeclarationAccepted: boolean;
  location: LocationInfo;
  availableFrom: string;
  availableUntil: string;
  readinessScore: number; // 0 to 100
  trustLevel: TrustLevel;
  sellerId: string;
  sellerName: string;
  sellerPhone?: string;
  photos: string[];
  documents: BatchDocument[];
  measurements?: BatchMeasurements;
  status: 'draft' | 'published' | 'allocated' | 'depleted';
  parentBatchId?: string; // for sub-batches
  subBatchIds?: string[];
  isSample?: boolean;
  created_at: string;
}

export interface Demand {
  id: string;
  title: string;
  materialType: string;
  materialSubtype?: string;
  intendedUse: string; // e.g. "Non-loadbearing wall", "Structural concrete", "Road sub-base"
  quantityNeeded: number;
  unit: string;
  maxBudgetPerUnit: number;
  requiredTrustLevel: TrustLevel;
  deliveryLocation: LocationInfo;
  neededFrom: string;
  neededUntil: string;
  buyerId: string;
  buyerName: string;
  buyerPhone?: string;
  status: 'open' | 'matched' | 'ordered' | 'closed';
  isSample?: boolean;
  created_at: string;
}

export type InventoryEventType =
  | 'recovered'
  | 'internal_use_allocated'
  | 'internal_use_released'
  | 'reserved'
  | 'reservation_released'
  | 'dispatched'
  | 'received_confirmed'
  | 'marked_unsuitable'
  | 'damaged'
  | 'stock_correction'
  | 'qr_scan';

export type EventSource = 'manual' | 'qr_scan' | 'phone_gps' | 'iot_device';

export interface InventoryEvent {
  id: string;
  batchId: string;
  orderId?: string;
  eventType: InventoryEventType;
  quantity: number;
  unit: string;
  source: EventSource;
  actorId: string;
  actorName: string;
  notes?: string;
  timestamp: string;
}

export type OrderType = 'A' | 'B' | 'C';
// A: Standard
// B: Inspect-first
// C: Test-required

export type OrderStatus =
  | 'requested'
  | 'accepted'
  | 'inspection_pending'
  | 'inspection_completed'
  | 'pre_dispatch_cleared'
  | 'dispatched'
  | 'delivered'
  | 'delivery_checked'
  | 'closed'
  | 'cancelled';

export interface PreDispatchGate {
  evidenceCheckPassed: boolean;
  inspectionPassed: boolean;
  inspectorName?: string;
  inspectorNotes?: string;
  testReportPassed?: boolean;
  gateUnlocked: boolean;
  unlockedAt?: string;
}

export interface DriverInfo {
  name: string;
  phone: string;
  vehicleNumber: string;
  tripStatus: 'not_started' | 'in_transit' | 'delivered';
  currentLat?: number;
  currentLng?: number;
  lastPingAt?: string;
}

export interface DeliveryCheck {
  checked: boolean;
  checkedAt?: string;
  deadlineAt: string; // 48h after delivery
  acceptedQuantity: number;
  damagedQuantity: number;
  damagePercent: number;
  damagePhotos?: string[];
  remedy: 'accept' | 'partial_refund' | 'replace' | 'return' | null;
  remedyNotes?: string;
  refundAmount?: number;
  disputeOpened?: boolean;
  disputeResolution?: string;
}

export interface Order {
  id: string;
  batchId: string;
  demandId?: string;
  sellerId: string;
  sellerName: string;
  buyerId: string;
  buyerName: string;
  driverToken: string; // for driver view /d/:token
  orderType: OrderType;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalMaterialCost: number;
  simulatedLogisticsCost: number;
  simulatedEscrowTotal: number;
  status: OrderStatus;
  paymentStatus: 'ESCROW_HELD_SIMULATED' | 'ESCROW_RELEASED_SIMULATED' | 'REFUNDED_SIMULATED';
  preDispatchGate: PreDispatchGate;
  driverInfo: DriverInfo;
  deliveryCheck: DeliveryCheck;
  isSample?: boolean;
  created_at: string;
}

export interface TestReport {
  id: string;
  batchId: string;
  standard: string; // e.g., "IS 3495 (Parts 1-4) / DEMO Reference"
  isDemoThresholds: boolean; // clearly labelled DEMO
  testDate: string;
  labName: string;
  compressiveStrengthMpa?: number;
  waterAbsorptionPercent?: number;
  efflorescence?: 'Nil' | 'Slight' | 'Moderate' | 'Heavy' | 'Serious';
  dimensionalToleranceMm?: number;
  sampleSize: number;
  failedCount: number;
  wilson95UpperBound: number;
  verdict: string;
  isSample?: boolean;
  created_at: string;
}

export interface SensorReading {
  id: string;
  deviceId: string;
  batchId: string;
  moisturePercent: number;
  ambientTempC: number;
  vibrationG: number;
  tiltDegrees: number;
  batteryPercent: number;
  timestamp: string;
  status: 'NORMAL' | 'WARNING' | 'ALERT';
}

export interface Alert {
  id: string;
  userId: string;
  type: 'match_found' | 'order_update' | 'inspection_needed' | 'delivery_check_due' | 'sensor_alert';
  title: string;
  body: string;
  link: string;
  read: boolean;
  created_at: string;
}

export type HardFilterReason =
  | 'INCOMPATIBLE_SUBTYPE'
  | 'NOT_AVAILABLE'
  | 'TIMING_MISMATCH'
  | 'OUT_OF_RANGE'
  | 'USE_REQUIRES_PROFESSIONAL'
  | 'INSUFFICIENT_EVIDENCE'
  | 'UNECONOMICAL_LOGISTICS';

export type MatchBand = 'Strong' | 'Possible' | 'Weak';

export interface MatchScoreComponents {
  compatibility: number; // max 25
  quantity: number; // max 20
  timing: number; // max 15
  distance: number; // max 15
  evidence: number; // max 10
  economics: number; // max 15
}

export interface MatchResult {
  batchId: string;
  demandId: string;
  batchTitle: string;
  sellerName: string;
  totalScore: number; // 0 - 100
  band: MatchBand;
  passedHardFilters: boolean;
  hardFilterReasons: HardFilterReason[];
  components: MatchScoreComponents;
  roadDistanceKm: number;
  netSaving: number;
  savingPercent: number;
  recommendedOrderType: OrderType;
  requiresProfessionalOverride: boolean;
  aiExplanation?: string;
}
