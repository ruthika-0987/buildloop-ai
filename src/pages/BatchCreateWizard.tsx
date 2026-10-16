import React, { useState } from "react";
import {
  Camera,
  Upload,
  X,
  Sparkles,
  MapPin,
  FileText,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Info,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useData } from "../context/DataContext";
import { useToast } from "../context/ToastContext";
import { useTranslation, t } from "../i18n";
import { Batch, TrustLevel } from "../types";
import { apiFetch, readApiJson } from "../lib/api";

export const BatchCreateWizard: React.FC = () => {
  const { user } = useAuth();
  const { saveRecord } = useData();
  const { showSuccess, showError, showInfo } = useToast();
  const { currentLanguage } = useTranslation();

  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Photos state (1 to 6)
  const [photos, setPhotos] = useState<
    Array<{ mimeType: string; data: string; preview: string }>
  >([]);
  const [isAiAnalyzing, setIsAiAnalyzing] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<any>(null);
  const [aiMessage, setAiMessage] = useState<string | null>(null);

  // Form Fields
  const [title, setTitle] = useState("");
  const [materialType, setMaterialType] = useState("Clay Bricks");
  const [materialSubtype, setMaterialSubtype] = useState("");
  const [condition, setCondition] = useState<Batch["condition"]>("Intact");
  const [visibleMortar, setVisibleMortar] = useState("");
  const [quantity, setQuantity] = useState<number>(1000);
  const [unit, setUnit] = useState("Pieces");
  const [pricePerUnit, setPricePerUnit] = useState<number>(4.5);
  const [originalNewPrice, setOriginalNewPrice] = useState<number>(10);
  const [isFree, setIsFree] = useState(false);

  // Location
  const [address, setAddress] = useState(
    "Jubilee Hills, Road No. 36, Hyderabad",
  );
  const [lat, setLat] = useState<number>(17.4319);
  const [lng, setLng] = useState<number>(78.4073);
  const [gettingLocation, setGettingLocation] = useState(false);

  // Dates
  const [availableFrom, setAvailableFrom] = useState(
    new Date().toISOString().slice(0, 10),
  );
  const [availableUntil, setAvailableUntil] = useState(
    new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
  );

  // Measurements
  const [lengthMm, setLengthMm] = useState<string>("230");
  const [widthMm, setWidthMm] = useState<string>("110");
  const [heightMm, setHeightMm] = useState<string>("70");
  const [strengthMpa, setStrengthMpa] = useState<string>("7.5");

  // Documents
  const [documents, setDocuments] = useState<
    Array<{ name: string; type: string; verified: boolean; date: string }>
  >([]);
  const [docName, setDocName] = useState("");
  const [docType, setDocType] = useState("Demolition Permit / Source Deed");

  // Legal declaration
  const [lawfulDeclaration, setLawfulDeclaration] = useState(false);
  const [saving, setSaving] = useState(false);

  // Client-side image compression
  const compressImage = (
    file: File,
  ): Promise<{ mimeType: string; data: string; preview: string }> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (ev) => {
        const img = new Image();
        img.src = ev.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const maxDim = 1200;
          let width = img.width;
          let height = img.height;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.8);
          resolve({
            mimeType: "image/jpeg",
            data: compressedDataUrl,
            preview: compressedDataUrl,
          });
        };
        img.onerror = reject;
      };
      reader.onerror = reject;
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    if (photos.length + files.length > 6) {
      showError(
        "Maximum 6 photos allowed per batch listing.",
        "Please remove some images first.",
      );
      return;
    }

    try {
      const compressedList = await Promise.all(files.map(compressImage));
      const nextPhotos = [...photos, ...compressedList];
      setPhotos(nextPhotos);

      // Trigger server-side AI photo reading if this is first batch of photos
      if (nextPhotos.length > 0) {
        runAiPhotoAnalysis(nextPhotos);
      }
    } catch (err: any) {
      showError(
        "Could not process image upload.",
        "Ensure file is a valid JPG or PNG under 10MB.",
      );
    }
  };

  const runAiPhotoAnalysis = async (imagesToAnalyze: typeof photos) => {
    setIsAiAnalyzing(true);
    setAiMessage(null);
    try {
      const payload = {
        base64Images: imagesToAnalyze.map((p) => ({
          mimeType: p.mimeType,
          data: p.data,
        })),
        context: "Salvaged C&D material batch in Hyderabad",
      };

      const res = await apiFetch("/api/ai/analyze-photos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await readApiJson<any>(res);
      if (result.source === "unavailable") {
        setAiMessage(t("AI reading unavailable. Continue with manual entry."));
      } else {
        setAiSuggestions(result);
        // Pre-fill fields if empty or default
        if (result.materialType) setMaterialType(result.materialType);
        if (result.materialSubtype && !materialSubtype)
          setMaterialSubtype(result.materialSubtype);
        if (result.estimatedCondition) setCondition(result.estimatedCondition);
        if (result.suggestedUnit && !unit) setUnit(result.suggestedUnit);
        if (!title) {
          setTitle(
            `Salvaged ${result.materialSubtype || result.materialType} (${address.split(",")[0]})`,
          );
        }
        showSuccess("AI photo reading completed. Review and adjust fields.");
      }
    } catch (err: any) {
      setAiMessage(t("AI reading unavailable. Continue with manual entry."));
    } finally {
      setIsAiAnalyzing(false);
    }
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  // Browser Geolocation with consent
  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      showError("Geolocation is not supported by your browser.");
      return;
    }
    setGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(pos.coords.latitude);
        setLng(pos.coords.longitude);
        setAddress(
          `Hyderabad Site (${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)})`,
        );
        setGettingLocation(false);
        showSuccess("Location pinned to your current GPS coordinates.");
      },
      (err) => {
        setGettingLocation(false);
        showError(
          "Could not get GPS location.",
          "Check browser permissions or enter address manually.",
        );
      },
      { timeout: 10000 },
    );
  };

  // Add document
  const handleAddDocument = () => {
    if (!docName.trim()) return;
    setDocuments((prev) => [
      ...prev,
      {
        name: docName.trim(),
        type: docType,
        verified: true,
        date: new Date().toISOString().slice(0, 10),
      },
    ]);
    setDocName("");
  };

  // Calculate Readiness Score 0 - 100
  const computeReadinessScore = (): number => {
    let score = 0;
    // Photos: up to 35 points
    if (photos.length >= 1) score += 20;
    if (photos.length >= 3) score += 15;
    // Details: up to 30 points
    if (title && materialSubtype) score += 15;
    if (quantity > 0 && pricePerUnit >= 0) score += 15;
    // Measurements: 15 points
    if (lengthMm && widthMm && heightMm) score += 15;
    // Documents: 20 points
    if (documents.length > 0) score += 20;
    return Math.min(100, score);
  };

  const readiness = computeReadinessScore();

  // Trust Level determination:
  // L1 Visual: default
  // L2 Evidence Verified: readiness >= 70 and at least 1 document or measurement
  // L3: Only Inspector/Admin
  let derivedTrustLevel: TrustLevel = "L1";
  if (readiness >= 70 && (documents.length > 0 || (lengthMm && strengthMpa))) {
    derivedTrustLevel = "L2";
  }

  const handleSave = async (status: "draft" | "published") => {
    if (!title.trim()) {
      showError(
        "Please enter a title for this batch.",
        "Provide a descriptive name.",
      );
      return;
    }
    if (status === "published" && !lawfulDeclaration) {
      showError(
        "You must confirm the Lawful Recovery Declaration.",
        "Check the mandatory checkbox.",
      );
      return;
    }

    setSaving(true);
    const batchId = `batch-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

    const newBatch: Batch = {
      id: batchId,
      title: title.trim(),
      materialType,
      materialSubtype: materialSubtype.trim() || materialType,
      quantity: Number(quantity) || 1,
      unit,
      pricePerUnit: isFree ? 0 : Number(pricePerUnit) || 0,
      originalNewPrice: Number(originalNewPrice) || Number(pricePerUnit) * 1.8,
      condition,
      visibleMortar: visibleMortar.trim(),
      lawfulDeclarationAccepted: lawfulDeclaration,
      location: {
        address: address.trim(),
        lat,
        lng,
      },
      availableFrom,
      availableUntil,
      readinessScore: readiness,
      trustLevel: derivedTrustLevel,
      sellerId: user?.id || "guest_seller",
      sellerName: user?.name || "Local Seller",
      sellerPhone: user?.phone,
      photos: photos.map((p) => p.preview),
      documents,
      measurements: {
        lengthMm: Number(lengthMm) || undefined,
        widthMm: Number(widthMm) || undefined,
        heightMm: Number(heightMm) || undefined,
        compressiveStrengthMpa: Number(strengthMpa) || undefined,
      },
      status,
      created_at: new Date().toISOString(),
    };

    const res = await saveRecord("batches", newBatch);
    setSaving(false);

    if (res.success) {
      // Record 'recovered' inventory event
      await saveRecord("events", {
        id: `evt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        batchId,
        eventType: "recovered",
        quantity: Number(quantity) || 1,
        unit,
        source: "manual",
        actorId: user?.id || "seller",
        actorName: user?.name || "Seller",
        notes: `Initial stock recovery listing created with ${readiness}% readiness score.`,
        timestamp: new Date().toISOString(),
      });

      showSuccess(
        status === "published"
          ? "Batch published successfully!"
          : "Draft saved.",
      );
      window.location.hash = `#/batches/${batchId}`;
    } else {
      showError(
        res.error || "Failed to create batch.",
        "Check all required fields.",
      );
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      {/* Page Header */}
      <div>
        <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
          Seller Portal • Milestone M1
        </span>
        <h1 className="text-2xl font-extrabold text-stone-900 dark:text-stone-100">
          List Recovered C&D Material
        </h1>
        <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
          Complete the 3-step wizard to register recovered materials with
          verifiable trust scores.
        </p>
      </div>

      {/* Wizard Steps Stepper */}
      <div className="flex items-center justify-between p-3 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-xs">
        <button
          onClick={() => setStep(1)}
          className={`flex items-center gap-2 font-bold ${
            step === 1
              ? "text-emerald-600 dark:text-emerald-400"
              : "text-stone-500"
          }`}
        >
          <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-[10px]">
            1
          </span>
          <span>{t("Step 1: Upload Photos")}</span>
        </button>

        <span className="text-stone-300">→</span>

        <button
          onClick={() => setStep(2)}
          className={`flex items-center gap-2 font-bold ${
            step === 2
              ? "text-emerald-600 dark:text-emerald-400"
              : "text-stone-500"
          }`}
        >
          <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-[10px]">
            2
          </span>
          <span>{t("Step 2: Material Details")}</span>
        </button>

        <span className="text-stone-300">→</span>

        <button
          onClick={() => setStep(3)}
          className={`flex items-center gap-2 font-bold ${
            step === 3
              ? "text-emerald-600 dark:text-emerald-400"
              : "text-stone-500"
          }`}
        >
          <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-[10px]">
            3
          </span>
          <span>{t("Step 3: Review & Publish")}</span>
        </button>
      </div>

      {/* STEP 1: PHOTOS */}
      {step === 1 && (
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-6 space-y-6">
          <div>
            <h2 className="text-base font-bold text-stone-900 dark:text-stone-100">
              Upload Site Photos (1 to 6)
            </h2>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
              {t("Take or upload 1 to 6 photos of the recovered materials.")}{" "}
              Images are compressed client-side and analyzed by Gemini Vision.
            </p>
          </div>

          {/* Photo Grid & Upload Area */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {photos.map((p, idx) => (
              <div
                key={idx}
                className="relative aspect-4/3 rounded-xl overflow-hidden border border-stone-200 dark:border-stone-700 group shadow-xs"
              >
                <img
                  src={p.preview}
                  alt={`Upload ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => removePhoto(idx)}
                  className="absolute top-2 right-2 p-1 rounded-full bg-black/70 hover:bg-red-600 text-white transition"
                  aria-label="Remove photo"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="absolute bottom-1 left-2 text-[10px] text-white/90 font-mono bg-black/60 px-1 rounded">
                  Photo {idx + 1}
                </div>
              </div>
            ))}

            {photos.length < 6 && (
              <label className="flex flex-col items-center justify-center aspect-4/3 rounded-xl border-2 border-dashed border-stone-300 dark:border-stone-700 hover:border-emerald-500 bg-stone-50 dark:bg-stone-950/40 cursor-pointer p-4 text-center transition">
                <Camera className="w-6 h-6 text-stone-400 mb-2" />
                <span className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                  Add Photo
                </span>
                <span className="text-[10px] text-stone-400 mt-1">
                  JPG or PNG up to 10MB
                </span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* AI Analysis Status / Suggestions */}
          {isAiAnalyzing && (
            <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-900 dark:text-emerald-200 flex items-center gap-3 animate-pulse">
              <Sparkles className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{t("Analyzing photos with Gemini Vision…")}</span>
            </div>
          )}

          {aiMessage && (
            <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2.5">
              <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <p>{aiMessage}</p>
            </div>
          )}

          {aiSuggestions && !isAiAnalyzing && (
            <div className="p-4 rounded-xl bg-stone-50 dark:bg-stone-950/60 border border-stone-200 dark:border-stone-800 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span>{t("AI Analysis Suggestion")}</span>
                </span>
                <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  {aiSuggestions.confidence}% Confidence
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-stone-600 dark:text-stone-400">
                <div>
                  <strong>Detected Material:</strong>{" "}
                  {aiSuggestions.materialType}
                </div>
                <div>
                  <strong>Subtype:</strong> {aiSuggestions.materialSubtype}
                </div>
                <div>
                  <strong>Visual Condition:</strong>{" "}
                  {aiSuggestions.estimatedCondition}
                </div>
                <div>
                  <strong>Suggested Unit:</strong> {aiSuggestions.suggestedUnit}
                </div>
              </div>
              {aiSuggestions.visibleObservations?.length > 0 && (
                <div>
                  <span className="font-semibold text-stone-700 dark:text-stone-300">
                    Observations:
                  </span>
                  <ul className="list-disc pl-4 mt-0.5 space-y-0.5 text-stone-500 dark:text-stone-400">
                    {aiSuggestions.visibleObservations.map(
                      (obs: string, i: number) => (
                        <li key={i}>{obs}</li>
                      ),
                    )}
                  </ul>
                </div>
              )}
              <p className="text-[10px] text-stone-400 italic">
                Note: AI suggestions are non-binding. You can modify any field
                in Step 2.
              </p>
            </div>
          )}

          <div className="flex justify-end pt-4 border-t border-stone-200 dark:border-stone-800">
            <button
              onClick={() => setStep(2)}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-sm transition"
            >
              <span>Continue to Details</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: DETAILS */}
      {step === 2 && (
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-6 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
            <h2 className="text-base font-bold text-stone-900 dark:text-stone-100">
              Material Specification & Location
            </h2>
            <div className="text-xs text-stone-500 font-mono">
              Readiness:{" "}
              <strong className="text-emerald-600">{readiness}%</strong>
            </div>
          </div>

          {/* Title & Material Type */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Batch Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Salvaged Red Clay Bricks (Jubilee Hills)"
                className="w-full px-3.5 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-sm text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  {t("Material Type")} *
                </label>
                <select
                  value={materialType}
                  onChange={(e) => setMaterialType(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-sm text-stone-900 dark:text-stone-100"
                >
                  <option value="Clay Bricks">Clay Bricks</option>
                  <option value="Concrete Blocks">Concrete Blocks</option>
                  <option value="Fly Ash Bricks">Fly Ash Bricks</option>
                  <option value="Recycled Concrete Aggregate (RCA)">
                    Recycled Concrete Aggregate (RCA)
                  </option>
                  <option value="Granite & Stone Rubble">
                    Granite & Stone Rubble
                  </option>
                  <option value="Rebar & Steel Sections">
                    Rebar & Steel Sections
                  </option>
                  <option value="Timber & Wood Scantlings">
                    Timber & Wood Scantlings
                  </option>
                  <option value="Ceramic Tiles">Ceramic Tiles</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  {t("Material Subtype")}
                </label>
                <input
                  type="text"
                  value={materialSubtype}
                  onChange={(e) => setMaterialSubtype(e.target.value)}
                  placeholder="e.g. Hand-moulded Red Clay Bricks"
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-sm text-stone-900 dark:text-stone-100"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  {t("Condition")}
                </label>
                <select
                  value={condition}
                  onChange={(e) => setCondition(e.target.value as any)}
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-sm text-stone-900 dark:text-stone-100"
                >
                  <option value="Intact">Intact</option>
                  <option value="Minor Chipping">Minor Chipping</option>
                  <option value="Mixed Mortar">Mixed Mortar</option>
                  <option value="Crushed/Rubble">Crushed/Rubble</option>
                  <option value="Heavily Damaged">Heavily Damaged</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  {t("Available Quantity")} *
                </label>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) =>
                    setQuantity(Math.max(1, parseInt(e.target.value) || 1))
                  }
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-sm text-stone-900 dark:text-stone-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Unit
                </label>
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-sm text-stone-900 dark:text-stone-100"
                >
                  <option value="Pieces">Pieces</option>
                  <option value="Tons">Tons</option>
                  <option value="Cubic Meters">Cubic Meters</option>
                  <option value="Sq.Ft">Sq.Ft</option>
                </select>
              </div>
            </div>

            {/* Pricing */}
            <div className="p-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950/60 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-xs text-stone-900 dark:text-stone-100">
                  Pricing & Market Reference
                </span>
                <label className="flex items-center gap-1.5 text-xs text-stone-600 dark:text-stone-400 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isFree}
                    onChange={(e) => setIsFree(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>{t("Free / Zero Cost")}</span>
                </label>
              </div>

              {!isFree && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-medium text-stone-600 dark:text-stone-400 mb-1">
                      {t("Unit Price (₹)")}
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={pricePerUnit}
                      onChange={(e) =>
                        setPricePerUnit(parseFloat(e.target.value) || 0)
                      }
                      className="w-full px-3 py-1.5 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-stone-600 dark:text-stone-400 mb-1">
                      Original Brand-New Price (₹)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={originalNewPrice}
                      onChange={(e) =>
                        setOriginalNewPrice(parseFloat(e.target.value) || 0)
                      }
                      className="w-full px-3 py-1.5 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-sm"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Location in Hyderabad */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                  {t("Recovery Location")} (Hyderabad) *
                </label>
                <button
                  type="button"
                  onClick={handleUseMyLocation}
                  disabled={gettingLocation}
                  className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 hover:underline"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>
                    {gettingLocation ? "Locating…" : "Use my GPS location"}
                  </span>
                </button>
              </div>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Site address, locality, Hyderabad"
                className="w-full px-3.5 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-sm"
              />
            </div>

            {/* Dimensional Measurements */}
            <div className="p-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950/60 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-xs text-stone-900 dark:text-stone-100">
                  Dimensional & Strength Measurements (+15% Readiness)
                </span>
                <span className="text-[10px] text-stone-400">
                  IS 3495 reference
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[10px] text-stone-500">
                    Length (mm)
                  </label>
                  <input
                    type="number"
                    value={lengthMm}
                    onChange={(e) => setLengthMm(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-stone-500">
                    Width (mm)
                  </label>
                  <input
                    type="number"
                    value={widthMm}
                    onChange={(e) => setWidthMm(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-stone-500">
                    Height (mm)
                  </label>
                  <input
                    type="number"
                    value={heightMm}
                    onChange={(e) => setHeightMm(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-stone-500">
                    Est. Strength (MPa)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={strengthMpa}
                    onChange={(e) => setStrengthMpa(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Documents & Verification */}
            <div className="p-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950/60 space-y-3">
              <span className="font-semibold text-xs text-stone-900 dark:text-stone-100">
                Recovery Documents & Permits (+20% Readiness)
              </span>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={docName}
                  onChange={(e) => setDocName(e.target.value)}
                  placeholder="e.g. GHMC Demolition Authorization.pdf"
                  className="flex-1 px-3 py-1.5 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs"
                />
                <select
                  value={docType}
                  onChange={(e) => setDocType(e.target.value)}
                  className="px-2.5 py-1.5 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs"
                >
                  <option value="Demolition Permit / Source Deed">
                    Permit
                  </option>
                  <option value="Lab Test Report">Lab Test</option>
                  <option value="Weighbridge Slip">Weighbridge</option>
                </select>
                <button
                  type="button"
                  onClick={handleAddDocument}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold"
                >
                  Add
                </button>
              </div>

              {documents.length > 0 && (
                <div className="space-y-1.5 pt-2">
                  {documents.map((d, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-stone-800 text-xs border border-stone-200 dark:border-stone-700"
                    >
                      <div className="flex items-center gap-2">
                        <FileText className="w-3.5 h-3.5 text-blue-500" />
                        <span className="font-medium">{d.name}</span>
                        <span className="text-[10px] text-stone-400">
                          ({d.type})
                        </span>
                      </div>
                      <button
                        onClick={() =>
                          setDocuments((docs) =>
                            docs.filter((_, idx) => idx !== i),
                          )
                        }
                        className="text-stone-400 hover:text-red-500"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-stone-200 dark:border-stone-800">
            <button
              onClick={() => setStep(1)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-stone-300 dark:border-stone-700 text-xs font-semibold hover:bg-stone-100 dark:hover:bg-stone-800"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <button
              onClick={() => setStep(3)}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-sm transition"
            >
              <span>Review & Publish</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: REVIEW & PUBLISH */}
      {step === 3 && (
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-6 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
            <div>
              <h2 className="text-base font-bold text-stone-900 dark:text-stone-100">
                {t("Step 3: Review & Publish")}
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Verify specifications and confirm lawful recovery ownership.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold">Trust Tier:</span>
              <span
                className={`px-2 py-0.5 rounded text-xs font-bold ${
                  derivedTrustLevel === "L2"
                    ? "bg-blue-100 text-blue-800"
                    : "bg-stone-100 text-stone-800"
                }`}
              >
                {derivedTrustLevel === "L2"
                  ? t("L2 Evidence Verified")
                  : t("L1 Visual Record")}
              </span>
            </div>
          </div>

          {/* Readiness Meter */}
          <div className="p-4 rounded-xl bg-stone-50 dark:bg-stone-950/60 border border-stone-200 dark:border-stone-800 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span>Listing Readiness Score:</span>
              <span className="font-mono text-emerald-600 dark:text-emerald-400">
                {readiness}/100
              </span>
            </div>
            <div className="w-full bg-stone-200 dark:bg-stone-800 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${readiness}%` }}
              />
            </div>
            <p className="text-[11px] text-stone-500">
              {readiness >= 70
                ? "Qualifies for L2 Evidence Verified badge with priority buyer matching."
                : "Add more photos, dimensions, or salvage permits to reach 70+ for L2 Verified."}
            </p>
          </div>

          {/* Summary Details */}
          <div className="p-4 rounded-xl border border-stone-200 dark:border-stone-800 space-y-3 text-xs">
            <h3 className="font-bold text-sm text-stone-900 dark:text-stone-100">
              {title}
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-stone-600 dark:text-stone-400">
              <div>
                <strong>Material:</strong> {materialType} ({materialSubtype})
              </div>
              <div>
                <strong>Quantity:</strong> {quantity} {unit}
              </div>
              <div>
                <strong>Price:</strong>{" "}
                {isFree ? "Free" : `₹${pricePerUnit} / ${unit}`}
              </div>
              <div>
                <strong>Condition:</strong> {condition}
              </div>
              <div>
                <strong>Location:</strong> {address}
              </div>
              <div>
                <strong>Photos Attached:</strong> {photos.length}
              </div>
            </div>
          </div>

          {/* Mandatory Lawful Recovery Declaration */}
          <div className="p-4 rounded-xl border-2 border-emerald-300 dark:border-emerald-800 bg-emerald-50/40 dark:bg-emerald-950/20 space-y-3">
            <div className="flex items-center gap-2 text-emerald-900 dark:text-emerald-200 font-bold text-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>{t("Lawful Recovery Declaration")} (Mandatory)</span>
            </div>
            <label className="flex items-start gap-3 cursor-pointer text-xs text-stone-700 dark:text-stone-300">
              <input
                type="checkbox"
                checked={lawfulDeclaration}
                onChange={(e) => setLawfulDeclaration(e.target.checked)}
                className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500"
              />
              <span className="leading-relaxed">
                {t(
                  "I declare under penalty of perjury that these materials were lawfully salvaged from an authorized site and not stolen or illegally dumped.",
                )}
              </span>
            </label>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-stone-200 dark:border-stone-800">
            <button
              onClick={() => setStep(2)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-stone-300 dark:border-stone-700 text-xs font-semibold hover:bg-stone-100 dark:hover:bg-stone-800"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>

            <div className="flex items-center gap-3">
              <button
                type="button"
                disabled={saving}
                onClick={() => handleSave("draft")}
                className="px-4 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 text-xs font-semibold transition"
              >
                {t("Save Draft")}
              </button>
              <button
                type="button"
                disabled={saving || !lawfulDeclaration}
                onClick={() => handleSave("published")}
                className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-emerald-900/20 transition"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{saving ? "Publishing…" : t("Publish Batch")}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
