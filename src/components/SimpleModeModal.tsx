import React, { useState } from 'react';
import { X, Volume2, Phone, CheckCircle, Navigation, Mail, ArrowRight, ShieldCheck } from 'lucide-react';
import { speakText } from '../lib/speech';
import { useTranslation } from '../i18n';
import { useData } from '../context/DataContext';
import { useToast } from '../context/ToastContext';

interface SimpleModeModalProps {
  onClose: () => void;
  onOpenWorkspace?: () => void;
}

export const SimpleModeModal: React.FC<SimpleModeModalProps> = ({ onClose, onOpenWorkspace }) => {
  const { currentLanguage } = useTranslation();
  const { batches, orders, saveRecord } = useData();
  const { showSuccess } = useToast();
  const [selectedBatch, setSelectedBatch] = useState<any | null>(batches[0] || null);

  // Big pictorial items
  const materials = [
    {
      id: 'bricks',
      icon: '🧱',
      nameEn: 'Red Clay Bricks',
      nameTe: 'ఎర్ర ఇటుకలు',
      nameHi: 'लाल ईंटें',
      color: 'bg-red-500',
      lightColor: 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-900',
      descEn: '8,500 whole bricks from Jubilee Hills. Certified 87% match.',
      descTe: 'జూబ్లీహిల్స్ నుండి 8,500 ఇటుకలు. ల్యాబ్ సర్టిఫైడ్.',
      descHi: 'जुबली हिल्स से 8,500 पक्की ईंटें। 87% स्कोर।',
      batch: batches.find(b => b.materialType.toLowerCase().includes('brick')) || batches[0],
      phone: '+91 98490 12345',
      driverName: 'Suresh Driver (Tata Ace)',
    },
    {
      id: 'concrete',
      icon: '🏗️',
      nameEn: 'Crushed Concrete Aggregate',
      nameTe: 'కాంక్రీట్ ముక్కలు (RCA)',
      nameHi: 'कंक्रीट गिट्टी (RCA)',
      color: 'bg-sky-500',
      lightColor: 'bg-sky-50 dark:bg-sky-950/40 border-sky-200 dark:border-sky-900',
      descEn: '450 tons crushed 20mm concrete in Miyapur. Green certified.',
      descTe: 'మియాపూర్ వద్ద 450 టన్నుల కాంక్రీట్ ముక్కలు. నాణ్యత ఆమోదం.',
      descHi: 'मियापुर में 450 टन 20mm कंक्रीट। ग्रीन प्रमाणित।',
      batch: batches.find(b => b.materialType.toLowerCase().includes('aggregate') || b.materialType.toLowerCase().includes('concrete')) || batches[1],
      phone: '+91 94401 56789',
      driverName: 'Ramu Transport',
    },
    {
      id: 'sand',
      icon: '🏜️',
      nameEn: 'Stone Dust / M-Sand',
      nameTe: 'రాతి ఇసుక (M-Sand)',
      nameHi: 'एम-सैंड / पत्थर की रेत',
      color: 'bg-amber-500',
      lightColor: 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900',
      descEn: '1,200 tons washed stone dust in Gachibowli. Tested & clean.',
      descTe: 'గచ్చిబౌలిలో 1,200 టన్నుల రాతి ఇసుక. శుభ్రపరిచినది.',
      descHi: 'गच्चीबाउली में 1,200 टन धुली हुई रेत। साफ और मजबूत।',
      batch: batches.find(b => b.materialType.toLowerCase().includes('sand') || b.materialType.toLowerCase().includes('dust')) || batches[2] || batches[0],
      phone: '+91 99887 76655',
      driverName: 'Krishna Tipper',
    },
  ];

  const activeMaterial = selectedBatch
    ? materials.find(m => m.batch?.id === selectedBatch.id) || materials[0]
    : materials[0];

  const handleSpeakItem = (item: typeof materials[0]) => {
    const text =
      currentLanguage === 'te'
        ? `${item.nameTe}. ${item.descTe}. ధర సరిచూడబడింది. ఆకుపచ్చ బటన్ నొక్కి ఆర్డర్ చేయండి.`
        : currentLanguage === 'hi'
        ? `${item.nameHi}. ${item.descHi}. ऑर्डर करने के लिए हरा बटन दबाएं।`
        : `${item.nameEn}. ${item.descEn}. Verified price. Tap green button to reserve.`;
    speakText(text, currentLanguage);
  };

  const handleFastOrder = async () => {
    if (!activeMaterial.batch) return;
    const newOrderId = `ORD-${Date.now().toString().slice(-6)}`;
    const newOrder = {
      id: newOrderId,
      batchId: activeMaterial.batch.id,
      demandId: 'DEM-DEMO-01',
      sellerId: activeMaterial.batch.sellerId || 'seller_system',
      sellerName: activeMaterial.batch.sellerName || 'Deccan Salvage',
      buyerId: 'buyer_quick',
      buyerName: 'Fast Field Buyer',
      driverToken: `drv-${Date.now().toString(36)}`,
      orderType: 'A' as const,
      quantity: 500,
      unit: activeMaterial.batch.unit || 'units',
      unitPrice: activeMaterial.batch.pricePerUnit || 12,
      totalMaterialCost: (activeMaterial.batch.pricePerUnit || 12) * 500,
      simulatedLogisticsCost: 1800,
      simulatedEscrowTotal: (activeMaterial.batch.pricePerUnit || 12) * 500 + 1800,
      status: 'accepted' as const,
      paymentStatus: 'ESCROW_HELD_SIMULATED' as const,
      preDispatchGate: {
        evidenceCheckPassed: true,
        inspectionPassed: true,
        gateUnlocked: true,
        unlockedAt: new Date().toISOString(),
      },
      driverInfo: {
        name: activeMaterial.driverName,
        phone: activeMaterial.phone,
        vehicleNumber: 'TS 09 UA 4421',
        tripStatus: 'not_started' as const,
      },
      deliveryCheck: {
        checked: false,
        deadlineAt: new Date(Date.now() + 48 * 3600000).toISOString(),
        acceptedQuantity: 500,
        damagedQuantity: 0,
        damagePercent: 0,
        remedy: null,
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    await saveRecord('orders', newOrder);

    const successVoice =
      currentLanguage === 'te'
        ? 'ఆర్డర్ విజయవంతంగా నమోదైంది! డ్రైవర్ సమాచారం భద్రపరచబడింది.'
        : currentLanguage === 'hi'
        ? 'ऑर्डर सफलतापूर्वक दर्ज हो गया! ड्राइवर से संपर्क कर सकते हैं।'
        : 'Order placed successfully! Driver details connected.';
    speakText(successVoice, currentLanguage);

    showSuccess(`Fast 1-Tap Order Confirmed! Order #${newOrderId} created.`);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white dark:bg-stone-900 border-2 border-emerald-500 rounded-3xl max-w-4xl w-full p-5 sm:p-8 shadow-2xl relative text-stone-900 dark:text-stone-100 space-y-6">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b pb-4 dark:border-stone-800">
          <div className="flex items-center gap-3">
            <span className="text-3xl">👷‍♂️</span>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-emerald-700 dark:text-emerald-400">
                {currentLanguage === 'te'
                  ? 'సరళమైన చిత్రాల మోడ్ (కార్మికులు & డ్రైవర్ల కోసం)'
                  : currentLanguage === 'hi'
                  ? 'सरल चित्र मोड (श्रमिकों और ड्राइवरों के लिए)'
                  : 'Simple Picture Mode (For Drivers & Field Workers)'}
              </h2>
              <p className="text-xs text-stone-500 font-medium">
                {currentLanguage === 'te'
                  ? 'చిత్రంపై నొక్కండి, ఆడియో వినండి, నేరుగా డ్రైవర్‌ని పిలవండి'
                  : currentLanguage === 'hi'
                  ? 'तस्वीर छुएं, आवाज सुनें, सीधे ड्राइवर को कॉल करें'
                  : 'Tap any photo, listen to voice guidance, and 1-tap call or order'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center hover:bg-stone-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 1. Large Material Selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {materials.map((item) => {
            const isSelected = activeMaterial.id === item.id;
            return (
              <div
                key={item.id}
                onClick={() => {
                  setSelectedBatch(item.batch);
                  handleSpeakItem(item);
                }}
                className={`p-4 rounded-2xl border-3 cursor-pointer transition-all transform text-center space-y-2 ${
                  isSelected
                    ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 ring-4 ring-emerald-300 scale-102 shadow-lg'
                    : 'border-stone-200 dark:border-stone-700 hover:border-emerald-400 bg-white dark:bg-stone-800'
                }`}
              >
                <div className="text-5xl">{item.icon}</div>
                <h3 className="font-black text-base sm:text-lg">
                  {currentLanguage === 'te'
                    ? item.nameTe
                    : currentLanguage === 'hi'
                    ? item.nameHi
                    : item.nameEn}
                </h3>
                <p className="text-xs text-stone-600 dark:text-stone-300">
                  {currentLanguage === 'te'
                    ? item.descTe
                    : currentLanguage === 'hi'
                    ? item.descHi
                    : item.descEn}
                </p>
                <div className="flex items-center justify-center gap-1 text-emerald-700 dark:text-emerald-400 font-bold text-xs pt-1">
                  <ShieldCheck className="w-4 h-4" />
                  <span>87% Verified</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* 2. Jumbo 1-Tap Action Center for Selected Item */}
        <div className="bg-stone-50 dark:bg-stone-800/80 rounded-2xl p-4 sm:p-6 border border-stone-200 dark:border-stone-700 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b dark:border-stone-700 pb-3">
            <div className="flex items-center gap-3">
              <span className="text-4xl">{activeMaterial.icon}</span>
              <div>
                <span className="text-xs uppercase tracking-wider font-extrabold text-emerald-600">
                  SELECTED MATERIAL
                </span>
                <h4 className="text-xl font-black">
                  {currentLanguage === 'te'
                    ? activeMaterial.nameTe
                    : currentLanguage === 'hi'
                    ? activeMaterial.nameHi
                    : activeMaterial.nameEn}
                </h4>
              </div>
            </div>

            {/* Read Aloud button */}
            <button
              onClick={() => handleSpeakItem(activeMaterial)}
              className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-900 rounded-xl font-black text-xs flex items-center gap-2 shadow-md transition"
            >
              <Volume2 className="w-5 h-5" />
              <span>
                {currentLanguage === 'te'
                  ? '🔊 తెలుగులో వినండి'
                  : currentLanguage === 'hi'
                  ? '🔊 हिंदी में सुनें'
                  : '🔊 Listen in English'}
              </span>
            </button>
          </div>

          {/* Big Jumbo Buttons for Uneducated Users */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            {/* Green Button: Buy/Reserve */}
            <button
              onClick={handleFastOrder}
              className="py-4 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black text-sm flex items-center justify-center gap-3 shadow-lg transition active:scale-95"
            >
              <CheckCircle className="w-6 h-6" />
              <div className="text-left">
                <div className="text-base font-black">
                  {currentLanguage === 'te'
                    ? '1-ట్యాప్ ఆర్డర్ చేయండి'
                    : currentLanguage === 'hi'
                    ? '1-टैप ऑर्डर करें'
                    : '1-Tap Fast Order'}
                </div>
                <div className="text-[10px] text-emerald-100 font-normal">
                  {currentLanguage === 'te' ? 'ఆకుపచ్చ బటన్' : currentLanguage === 'hi' ? 'हरा बटन' : 'Guaranteed Quality'}
                </div>
              </div>
            </button>

            {/* Phone Button: Direct Call */}
            <a
              href={`tel:${activeMaterial.phone}`}
              className="py-4 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black text-sm flex items-center justify-center gap-3 shadow-lg transition active:scale-95 text-center"
            >
              <Phone className="w-6 h-6 animate-pulse" />
              <div className="text-left">
                <div className="text-base font-black">
                  {currentLanguage === 'te'
                    ? 'డ్రైవర్‌కి కాల్ చేయండి'
                    : currentLanguage === 'hi'
                    ? 'ड्राइवर को कॉल करें'
                    : 'Call Driver'}
                </div>
                <div className="text-[10px] text-blue-100 font-normal">
                  {activeMaterial.driverName}
                </div>
              </div>
            </a>

            {/* Workspace Email Receipt */}
            <button
              onClick={() => {
                if (onOpenWorkspace) {
                  onClose();
                  onOpenWorkspace();
                } else {
                  showSuccess('Opening Workspace Hub for Gmail & Contacts.');
                }
              }}
              className="py-4 px-4 bg-purple-600 hover:bg-purple-500 text-white rounded-2xl font-black text-sm flex items-center justify-center gap-3 shadow-lg transition active:scale-95"
            >
              <Mail className="w-6 h-6" />
              <div className="text-left">
                <div className="text-base font-black">
                  {currentLanguage === 'te'
                    ? 'రసీదు పంపండి (Gmail)'
                    : currentLanguage === 'hi'
                    ? 'रसीद भेजें (Gmail)'
                    : 'Gmail & Contacts'}
                </div>
                <div className="text-[10px] text-purple-100 font-normal">
                  Google Workspace
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Bottom Helper Note */}
        <div className="text-center text-xs text-stone-500 font-medium">
          💡 {currentLanguage === 'te'
            ? 'ఈ మోడ్ హైదరాబాద్ సైట్‌లలో పనిచేసే డ్రైవర్లు మరియు కార్మికులకు చాలా సులభం.'
            : currentLanguage === 'hi'
            ? 'यह मोड हैदराबाद साइटों के ड्राइवरों और श्रमिकों के लिए सबसे आसान है।'
            : 'Designed for field ease: high-contrast colors, clear voice feedback, and 1-tap actions.'}
        </div>
      </div>
    </div>
  );
};
