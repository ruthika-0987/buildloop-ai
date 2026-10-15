import { en } from './en';

export const hi: Record<keyof typeof en, string> = {
  // Brand & Motto
  "BuildLoop AI": "BuildLoop AI",
  "From recovered material to feasible reuse": "बरामद सामग्री से व्यावहारिक पुनर्चक्रण तक",
  "AI suggests, the engine decides, people confirm.": "AI सुझाव देता है, इंजन निर्णय लेता है, लोग पुष्टि करते हैं।",
  "Hyderabad C&D Materials": "हैदराबाद C&D सामग्री",

  // Sync statuses
  "Saved": "सहेजा गया",
  "Saving…": "सहेजा जा रहा है…",
  "Offline: changes will sync": "ऑफ़लाइन: परिवर्तन बाद में सिंक होंगे",

  // Topbar & Navigation
  "Home": "होम",
  "Batches": "बैच / लॉट",
  "Demand Board": "मांग बोर्ड",
  "Orders": "ऑर्डर",
  "Recovery Intel": "रिकवरी इंटेलिजेंस",
  "IoT Sensors": "IoT सेंसर",
  "Impact": "पर्यावरणीय प्रभाव",
  "Validation": "सत्यापन",
  "Coverage": "कवरेज",
  "About": "के बारे में",
  "Admin": "प्रशासक",
  "Sign In": "साइन इन करें",
  "Sign Up": "साइन अप करें",
  "Sign Out": "साइन आउट",
  "My Profile": "मेरी प्रोफ़ाइल",
  "List a Batch": "नया बैच जोड़ें",
  "Post Demand": "मांग दर्ज करें",

  // Roles
  "Seller": "विक्रेता",
  "Buyer": "खरीदार",
  "Both": "दोनों",
  "Inspector": "निरीक्षक",
  "Admin Role": "एडमिन",

  // Trust Levels
  "L1 Visual Record": "L1 दृश्य रिकॉर्ड",
  "L2 Evidence Verified": "L2 साक्ष्य सत्यापित",
  "L3 Inspection Verified": "L3 निरीक्षण सत्यापित",
  "Photos and basic listing details recorded.": "तस्वीरें और बुनियादी विवरण दर्ज किए गए हैं।",
  "Completeness >= 70% with verified measurement or lab document.": "माप या लैब दस्तावेज़ के साथ 70% या अधिक पूर्णता।",
  "Certified on-site by empanelled civil inspector.": "पैनल में शामिल सिविल इंजीनियर द्वारा साइट पर प्रमाणित।",

  // Order Types
  "Type A: Standard": "प्रकार A: मानक",
  "Type B: Inspect-first": "प्रकार B: पूर्व-निरीक्षण",
  "Type C: Test-required": "प्रकार C: लैब टेस्ट आवश्यक",
  "Direct dispatch with 48h delivery remedy protection.": "48 घंटे की डिलीवरी सुरक्षा के साथ सीधा प्रेषण।",
  "On-site visual verification required before truck dispatch.": "वाहन प्रेषण से पहले ऑन-साइट दृश्य सत्यापन अनिवार्य।",
  "Mandatory laboratory crush or sieve test report required.": "अनिवार्य प्रयोगशाला परीक्षण रिपोर्ट आवश्यक।",

  // Match Bands & Filters
  "Strong": "मजबूत मैच",
  "Possible": "संभावित",
  "Weak": "कमजोर",
  "Why this score": "यह स्कोर क्यों मिला?",
  "Compatibility": "अनुकूलता",
  "Quantity": "मात्रा",
  "Timing": "समय सीमा",
  "Distance": "दूरी",
  "Evidence": "साक्ष्य",
  "Economics": "आर्थिक बचत",
  "INCOMPATIBLE_SUBTYPE": "सामग्री उप-प्रकार आवश्यक विशिष्टताओं से मेल नहीं खाता।",
  "NOT_AVAILABLE": "बैच वर्तमान में उपलब्ध नहीं है या आरक्षित है।",
  "TIMING_MISMATCH": "उपलब्धता तिथियां निर्माण कार्यक्रम से मेल नहीं खातीं।",
  "OUT_OF_RANGE": "परिवहन दूरी 40 किमी की सीमा से अधिक है।",
  "USE_REQUIRES_PROFESSIONAL": "संरचनात्मक उपयोग के लिए प्रमाणित इंजीनियर (L3) की आवश्यकता है।",
  "INSUFFICIENT_EVIDENCE": "साक्ष्य स्तर खरीदार की आवश्यकता से कम है।",
  "UNECONOMICAL_LOGISTICS": "परिवहन लागत सामग्री की बचत से अधिक है।",

  // Badges & Labels
  "SIMULATED": "सिम्युलेटेड (SIMULATED)",
  "Estimated": "अनुमानित (Estimated)",
  "DEMO Thresholds": "डेमो मानक (DEMO)",
  "Sample": "नमूना (Sample)",

  // Seller Wizard
  "Step 1: Upload Photos": "चरण 1: तस्वीरें अपलोड करें",
  "Step 2: Material Details": "चरण 2: सामग्री विवरण",
  "Step 3: Review & Publish": "चरण 3: समीक्षा और प्रकाशित करें",
  "Take or upload 1 to 6 photos of the recovered materials.": "पुनर्प्राप्त सामग्री की 1 से 6 तस्वीरें अपलोड करें।",
  "AI Analysis Suggestion": "AI विश्लेषण सुझाव",
  "AI reading unavailable. Continue with manual entry.": "AI रीडिंग अनुपलब्ध है। मैन्युअल प्रविष्टि के साथ जारी रखें।",
  "Analyzing photos with Gemini Vision…": "Gemini Vision से तस्वीरों का विश्लेषण हो रहा है…",
  "Material Type": "सामग्री का प्रकार",
  "Material Subtype": "सामग्री का उप-प्रकार",
  "Condition": "स्थिति",
  "Recovery Location": "पुनर्प्राप्ति स्थान",
  "Available Quantity": "उपलब्ध मात्रा",
  "Unit Price (₹)": "इकाई मूल्य (₹)",
  "Free / Zero Cost": "निःशुल्क / शून्य लागत",
  "Lawful Recovery Declaration": "वैध पुनर्प्राप्ति घोषणा",
  "I declare under penalty of perjury that these materials were lawfully salvaged from an authorized site and not stolen or illegally dumped.": "मैं घोषणा करता हूँ कि यह सामग्री अधिकृत स्थल से कानूनी रूप से प्राप्त की गई है।",
  "Publish Batch": "बैच प्रकाशित करें",
  "Save Draft": "ड्राफ्ट सहेजें",
  "Readiness Score": "तैयारी स्कोर",

  // Orders & Gates
  "Pre-dispatch Gate": "प्रेषण-पूर्व गेट",
  "Gate Locked": "गेट बंद है",
  "Gate Unlocked": "गेट खुला है",
  "Dispatch Blocked": "प्रेषण रोका गया",
  "Simulated Payment Escrow": "एस्क्रो भुगतान (सिम्युलेटेड)",
  "Payment held safely in simulated escrow until delivery check is verified.": "डिलीवरी की पुष्टि होने तक भुगतान एस्क्रो में सुरक्षित है।",
  "Delivery Check": "डिलीवरी जांच",
  "Buyer has 48 hours from delivery to confirm condition.": "खरीदार के पास स्थिति की पुष्टि के लिए डिलीवरी से 48 घंटे हैं।",
  "Accept Delivery": "डिलीवरी स्वीकार करें",
  "Request Partial Refund": "आंशिक रिफंड का अनुरोध करें",
  "Request Replacement": "बदलाव का अनुरोध करें",
  "Reject & Return": "अस्वीकार कर वापस भेजें",
  "Driver Trip Tracking": "ड्राइवर यात्रा ट्रैकिंग",
  "Start trip": "यात्रा शुरू करें",
  "Delivered": "वितरित किया गया",
  "Simulate trip": "यात्रा का अनुकरण करें",

  // Recovery Intel
  "Test Reports (IS 3495 Reference)": "परीक्षण रिपोर्ट (IS 3495 संदर्भ)",
  "Wilson 95% Failure Bound": "विल्सन 95% विफलता सीमा",
  "Sub-batch Division": "उप-बैच विभाजन",
  "Parent Batch Quantity": "मुख्य बैच मात्रा",
  "Child Sub-batches Sum": "उप-बैचों का योग",
  "Reuse Pathways": "पुनर्चक्रण मार्ग",

  // Admin & Proof
  "Clear sample data": "नमूना डेटा साफ़ करें",
  "Reset sample data": "नमूना डेटा रीसेट करें",
  "Export all data (JSON)": "सभी डेटा निर्यात करें (JSON)",
  "User Management": "उपयोगकर्ता प्रबंधन",
  "Audit Log": "ऑडिट लॉग",
  "Run checks now": "जांच अभी चलाएं",
  "All tests passed": "सभी परीक्षण पास हुए",
  "Calibration Case: 87/100": "कैलिब्रेशन केस: 87/100",

  // Common UI
  "Search": "खोजें",
  "Filter": "फ़िल्टर",
  "Sort": "क्रमबद्ध करें",
  "All": "सभी",
  "Submit": "जमा करें",
  "Cancel": "रद्द करें",
  "Save Changes": "परिवर्तन सहेजें",
  "View Details": "विवरण देखें",
  "Back": "वापस",
  "Loading…": "लोड हो रहा है…",
  "No items found": "कोई आइटम नहीं मिला",
  "Close": "बंद करें",
  "Help": "सहायता"
};
