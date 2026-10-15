import { en } from './en';

export const te: Record<keyof typeof en, string> = {
  // Brand & Motto
  "BuildLoop AI": "బిల్డ్‌లూప్ AI",
  "From recovered material to feasible reuse": "పునరుద్ధరించిన సామగ్రి నుండి ఆచరణాత్మక పునర్వినియోగం వరకు",
  "AI suggests, the engine decides, people confirm.": "AI సూచిస్తుంది, ఇంజిన్ నిర్ణయిస్తుంది, ప్రజలు ధృవీకరిస్తారు.",
  "Hyderabad C&D Materials": "హైదరాబాద్ C&D సామగ్రి",

  // Sync statuses
  "Saved": "సేవ్ చేయబడింది",
  "Saving…": "సేవ్ అవుతోంది…",
  "Offline: changes will sync": "ఆఫ్‌లైన్: మార్పులు సమకాలీకరించబడతాయి",

  // Topbar & Navigation
  "Home": "హోమ్",
  "Batches": "లాట్లు / బ్యాచ్‌లు",
  "Demand Board": "డిమాండ్ బోర్డు",
  "Orders": "ఆర్డర్లు",
  "Recovery Intel": "రికవరీ ఇంటెలిజెన్స్",
  "IoT Sensors": "IoT సెన్సార్లు",
  "Impact": "ప్రభావం",
  "Validation": "ధృవీకరణ",
  "Coverage": "కవరేజ్",
  "About": "గురించి",
  "Admin": "నిర్వాహకుడు",
  "Sign In": "లాగిన్ అవ్వండి",
  "Sign Up": "ఖాతా తెరవండి",
  "Sign Out": "లాగ్ అవుట్",
  "My Profile": "నా ప్రొఫైల్",
  "List a Batch": "కొత్త బ్యాచ్ నమోదు",
  "Post Demand": "డిమాండ్ నమోదు",

  // Roles
  "Seller": "విక్రేత",
  "Buyer": "కొనుగోలుదారు",
  "Both": "రెండూ",
  "Inspector": "ఇన్‌స్పెక్టర్",
  "Admin Role": "అడ్మిన్",

  // Trust Levels
  "L1 Visual Record": "L1 దృశ్య రికార్డు",
  "L2 Evidence Verified": "L2 ఆధారాల ధృవీకరణ",
  "L3 Inspection Verified": "L3 తనిఖీ ధృవీకరణ",
  "Photos and basic listing details recorded.": "ఫోటోలు మరియు ప్రాథమిక వివరాలు నమోదు చేయబడ్డాయి.",
  "Completeness >= 70% with verified measurement or lab document.": "కొలత లేదా ల్యాబ్ పత్రంతో 70% కంటే ఎక్కువ పూర్తి సమాచారం.",
  "Certified on-site by empanelled civil inspector.": "సివిల్ ఇన్‌స్పెక్టర్ ద్వారా సైట్ వద్ద ప్రత్యక్షంగా ధృవీకరించబడింది.",

  // Order Types
  "Type A: Standard": "రకం A: ప్రామాణిక",
  "Type B: Inspect-first": "రకం B: ముందస్తు తనిఖీ",
  "Type C: Test-required": "రకం C: ల్యాబ్ పరీక్ష అవసరం",
  "Direct dispatch with 48h delivery remedy protection.": "48 గంటల డెలివరీ తనిఖీ రక్షణతో నేరుగా పంపకం.",
  "On-site visual verification required before truck dispatch.": "వాహనం బయలుదేరే ముందు సైట్ వద్ద దృశ్య తనిఖీ తప్పనిసరి.",
  "Mandatory laboratory crush or sieve test report required.": "తప్పనిసరి ప్రయోగశాల పరీక్ష నివేదిక అవసరం.",

  // Match Bands & Filters
  "Strong": "బలమైన మ్యాచ్",
  "Possible": "అనుకూలమైనది",
  "Weak": "బలహీనమైనది",
  "Why this score": "ఈ స్కోరు ఎందుకు వచ్చింది?",
  "Compatibility": "అనుకూలత",
  "Quantity": "పరిమాణం",
  "Timing": "సమయపాలన",
  "Distance": "దూరం",
  "Evidence": "సాక్ష్యం / ఆధారాలు",
  "Economics": "ఆర్థిక లాభం",
  "INCOMPATIBLE_SUBTYPE": "మెటీరియల్ రకం అవసరమైన నిర్దేశాలకు సరిపోలడం లేదు.",
  "NOT_AVAILABLE": "ఈ బ్యాచ్ ప్రస్తుతం అందుబాటులో లేదు లేదా రిజర్వ్ చేయబడింది.",
  "TIMING_MISMATCH": "లభ్యత తేదీలు నిర్మాణ షెడ్యూల్‌తో సరిపోలడం లేదు.",
  "OUT_OF_RANGE": "రవాణా దూరం 40 కి.మీ పరిమితిని మించిపోయింది.",
  "USE_REQUIRES_PROFESSIONAL": "నిర్మాణ ఉపయోగం కోసం అర్హత కలిగిన ఇంజనీర్ తనిఖీ (L3) అవసరం.",
  "INSUFFICIENT_EVIDENCE": "సాక్ష్య స్థాయి కొనుగోలుదారు అడిగిన దానికంటే తక్కువగా ఉంది.",
  "UNECONOMICAL_LOGISTICS": "రవాణా ఖర్చు మెటీరియల్ ఆదా కంటే ఎక్కువగా ఉంది.",

  // Badges & Labels
  "SIMULATED": "అనుకరణ (SIMULATED)",
  "Estimated": "అంచనా (Estimated)",
  "DEMO Thresholds": "డెమో పరిమితులు (DEMO)",
  "Sample": "నమూనా (Sample)",

  // Seller Wizard
  "Step 1: Upload Photos": "దశ 1: ఫోటోలు అప్‌లోడ్ చేయండి",
  "Step 2: Material Details": "దశ 2: మెటీరియల్ వివరాలు",
  "Step 3: Review & Publish": "దశ 3: సమీక్షించి ప్రచురించండి",
  "Take or upload 1 to 6 photos of the recovered materials.": "రికవర్ చేసిన సామగ్రికి చెందిన 1 నుండి 6 ఫోటోలను అప్‌లోడ్ చేయండి.",
  "AI Analysis Suggestion": "AI విశ్లేషణ సూచన",
  "AI reading unavailable. Continue with manual entry.": "AI రీడింగ్ అందుబాటులో లేదు. వివరాలను మాన్యువల్‌గా నమోదు చేయండి.",
  "Analyzing photos with Gemini Vision…": "జెమిని విజన్‌తో ఫోటోలను విశ్లేషిస్తోంది…",
  "Material Type": "మెటీరియల్ రకం",
  "Material Subtype": "మెటీరియల్ ఉప-రకం",
  "Condition": "స్థితి",
  "Recovery Location": "లభ్యత ప్రదేశం",
  "Available Quantity": "అందుబాటులో ఉన్న పరిమాణం",
  "Unit Price (₹)": "యూనిట్ ధర (₹)",
  "Free / Zero Cost": "ఉచితం / సున్నా రుసుము",
  "Lawful Recovery Declaration": "చట్టబద్ధమైన సేకరణ ప్రకటన",
  "I declare under penalty of perjury that these materials were lawfully salvaged from an authorized site and not stolen or illegally dumped.": "ఈ సామగ్రి అధీకృత సైట్ నుండి చట్టబద్ధంగా సేకరించబడిందని మరియు దొంగిలించబడలేదని నేను ధృవీకరిస్తున్నాను.",
  "Publish Batch": "బ్యాచ్ ప్రచురించండి",
  "Save Draft": "డ్రాఫ్ట్ సేవ్ చేయండి",
  "Readiness Score": "సన్నద్ధత స్కోరు",

  // Orders & Gates
  "Pre-dispatch Gate": "రవాణా ముందస్తు గేట్",
  "Gate Locked": "గేట్ లాక్ చేయబడింది",
  "Gate Unlocked": "గేట్ తెరవబడింది",
  "Dispatch Blocked": "రవాణా నిలిపివేయబడింది",
  "Simulated Payment Escrow": "ఎస్క్రో చెల్లింపు (అనుకరణ)",
  "Payment held safely in simulated escrow until delivery check is verified.": "డెలివరీ తనిఖీ పూర్తయ్యే వరకు చెల్లింపు ఎస్క్రోలో భద్రంగా ఉంటుంది.",
  "Delivery Check": "డెలివరీ తనిఖీ",
  "Buyer has 48 hours from delivery to confirm condition.": "వస్తువులు చేరిన 48 గంటల్లో కొనుగోలుదారు స్థితిని ధృవీకరించాలి.",
  "Accept Delivery": "డెలివరీ ఆమోదించండి",
  "Request Partial Refund": "పాక్షిక రీఫండ్ అడగండి",
  "Request Replacement": "మార్పిడి అడగండి",
  "Reject & Return": "తిరస్కరించి తిరిగి పంపండి",
  "Driver Trip Tracking": "డ్రైవర్ ప్రయాణ ట్రాకింగ్",
  "Start trip": "ప్రయాణం ప్రారంభించండి",
  "Delivered": "చేరింది",
  "Simulate trip": "ట్రిప్ అనుకరించండి",

  // Recovery Intel
  "Test Reports (IS 3495 Reference)": "పరీక్ష నివేదికలు (IS 3495 ఆధారంగా)",
  "Wilson 95% Failure Bound": "విల్సన్ 95% వైఫల్య పరిమితి",
  "Sub-batch Division": "ఉప-బ్యాచ్ విభజన",
  "Parent Batch Quantity": "ప్రధాన బ్యాచ్ పరిమాణం",
  "Child Sub-batches Sum": "ఉప-బ్యాచ్‌ల మొత్తం",
  "Reuse Pathways": "పునర్వినియోగ మార్గాలు",

  // Admin & Proof
  "Clear sample data": "నమూనా డేటా తొలగించండి",
  "Reset sample data": "నమూనా డేటా రీసెట్ చేయండి",
  "Export all data (JSON)": "మొత్తం డేటాను ఎగుమతి చేయండి (JSON)",
  "User Management": "వినియోగదారుల నిర్వహణ",
  "Audit Log": "ఆడిట్ లాగ్",
  "Run checks now": "పరీక్షలను ఇప్పుడే ప్రారంభించండి",
  "All tests passed": "అన్ని పరీక్షలు విజయవంతమయ్యాయి",
  "Calibration Case: 87/100": "క్యాలిబ్రేషన్ కేసు: 87/100",

  // Common UI
  "Search": "వెతకండి",
  "Filter": "ఫిల్టర్",
  "Sort": "క్రమబద్ధీకరించండి",
  "All": "అన్నీ",
  "Submit": "సమర్పించండి",
  "Cancel": "రద్దు చేయండి",
  "Save Changes": "మార్పులను సేవ్ చేయండి",
  "View Details": "వివరాలు చూడండి",
  "Back": "వెనుకకు",
  "Loading…": "లోడ్ అవుతోంది…",
  "No items found": "ఏమీ కనుగొనబడలేదు",
  "Close": "మూసివేయి",
  "Help": "సహాయం"
};
