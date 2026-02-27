import { useState, useEffect, useCallback } from "react";
import { T } from "../theme.js";

// ── SA flag stripe ─────────────────────────────────────────────────────────────
function FlagStripe() {
  return (
    <div style={{ display: "flex", height: 6, width: "100%", flexShrink: 0 }}>
      {["#000000","#FFB612","#007A4D","#F5F5F0","#DE3831","#4472CA"].map((c, i) => (
        <div key={i} style={{ flex: 1, background: c }} />
      ))}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// SVG ROAD SIGNS
// ══════════════════════════════════════════════════════════════════════════════

function SignStop() {
  return (
    <svg viewBox="0 0 100 100" width="120" height="120">
      <polygon points="29,7 71,7 93,29 93,71 71,93 29,93 7,71 7,29"
        fill="#DE3831" stroke="#F5F5F0" strokeWidth="4" />
      <polygon points="31,11 69,11 89,31 89,69 69,89 31,89 11,69 11,31"
        fill="none" stroke="#F5F5F0" strokeWidth="2" />
      <text x="50" y="57" textAnchor="middle" fill="#F5F5F0"
        fontSize="18" fontWeight="bold" fontFamily="Arial,sans-serif">STOP</text>
    </svg>
  );
}

function SignYield() {
  return (
    <svg viewBox="0 0 100 100" width="120" height="120">
      <polygon points="50,5 95,90 5,90" fill="#F5F5F0" stroke="#DE3831" strokeWidth="5" />
      <polygon points="50,15 87,85 13,85" fill="none" stroke="#DE3831" strokeWidth="3" />
      <text x="50" y="68" textAnchor="middle" fill="#DE3831"
        fontSize="11" fontWeight="bold" fontFamily="Arial,sans-serif">YIELD</text>
    </svg>
  );
}

function SignSpeedLimit({ speed }) {
  return (
    <svg viewBox="0 0 100 100" width="120" height="120">
      <circle cx="50" cy="50" r="46" fill="#F5F5F0" stroke="#DE3831" strokeWidth="7" />
      <text x="50" y="62" textAnchor="middle" fill="#1A1A1A"
        fontSize={speed.length > 2 ? "26" : "30"} fontWeight="bold" fontFamily="Arial,sans-serif">{speed}</text>
    </svg>
  );
}

function SignNoEntry() {
  return (
    <svg viewBox="0 0 100 100" width="120" height="120">
      <circle cx="50" cy="50" r="46" fill="#DE3831" stroke="#F5F5F0" strokeWidth="4" />
      <rect x="18" y="42" width="64" height="16" rx="3" fill="#F5F5F0" />
    </svg>
  );
}

function SignNoOvertaking() {
  return (
    <svg viewBox="0 0 100 100" width="120" height="120">
      <circle cx="50" cy="50" r="46" fill="#F5F5F0" stroke="#DE3831" strokeWidth="7" />
      {/* Two cars */}
      <rect x="20" y="40" width="28" height="18" rx="3" fill="#333" />
      <rect x="24" y="34" width="18" height="10" rx="2" fill="#333" />
      <circle cx="26" cy="59" r="4" fill="#888" />
      <circle cx="42" cy="59" r="4" fill="#888" />
      <rect x="50" y="42" width="26" height="16" rx="3" fill="#888" />
      <rect x="54" y="37" width="16" height="9" rx="2" fill="#888" />
      <circle cx="56" cy="59" r="4" fill="#555" />
      <circle cx="70" cy="59" r="4" fill="#555" />
      {/* Red diagonal slash */}
      <line x1="20" y1="20" x2="80" y2="80" stroke="#DE3831" strokeWidth="7" strokeLinecap="round" />
    </svg>
  );
}

function SignNoParking() {
  return (
    <svg viewBox="0 0 100 100" width="120" height="120">
      <circle cx="50" cy="50" r="46" fill="#4472CA" stroke="#F5F5F0" strokeWidth="4" />
      <text x="50" y="62" textAnchor="middle" fill="#F5F5F0"
        fontSize="40" fontWeight="bold" fontFamily="Arial,sans-serif">P</text>
      <line x1="20" y1="20" x2="80" y2="80" stroke="#DE3831" strokeWidth="7" strokeLinecap="round" />
    </svg>
  );
}

function SignNoStopping() {
  return (
    <svg viewBox="0 0 100 100" width="120" height="120">
      <circle cx="50" cy="50" r="46" fill="#F5F5F0" stroke="#DE3831" strokeWidth="7" />
      <line x1="25" y1="50" x2="75" y2="50" stroke="#DE3831" strokeWidth="8" strokeLinecap="round" />
      <line x1="20" y1="20" x2="80" y2="80" stroke="#DE3831" strokeWidth="7" strokeLinecap="round" />
    </svg>
  );
}

function SignOneWay({ direction }) {
  const flip = direction === "left";
  return (
    <svg viewBox="0 0 120 60" width="144" height="72">
      <rect x="2" y="2" width="116" height="56" rx="4" fill="#F5F5F0" stroke="#1A1A1A" strokeWidth="3" />
      <polygon
        points={flip ? "80,10 35,30 80,50 80,38 100,38 100,22 80,22" : "40,10 85,30 40,50 40,38 20,38 20,22 40,22"}
        fill="#1A1A1A" />
    </svg>
  );
}

function SignKeepLeft() {
  return (
    <svg viewBox="0 0 100 100" width="120" height="120">
      <circle cx="50" cy="50" r="46" fill="#4472CA" stroke="#F5F5F0" strokeWidth="4" />
      {/* Down-then-left arrow */}
      <polyline points="62,20 62,55 35,55" stroke="#F5F5F0" strokeWidth="7" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <polygon points="28,55 42,46 42,64" fill="#F5F5F0" />
    </svg>
  );
}

function SignMiniRoundabout() {
  return (
    <svg viewBox="0 0 100 100" width="120" height="120">
      <circle cx="50" cy="50" r="46" fill="#4472CA" stroke="#F5F5F0" strokeWidth="4" />
      <circle cx="50" cy="50" r="18" fill="none" stroke="#F5F5F0" strokeWidth="4" />
      {/* Arrows going around (simplified) */}
      <path d="M50,28 A22,22 0 0,1 72,50" stroke="#F5F5F0" strokeWidth="4" fill="none" strokeLinecap="round" />
      <polygon points="72,44 78,52 65,53" fill="#F5F5F0" />
    </svg>
  );
}

// ── Warning signs (triangles) ──────────────────────────────────────────────────
function WarnTriangle({ children, bg = "#FFB612" }) {
  return (
    <svg viewBox="0 0 100 100" width="120" height="120">
      <polygon points="50,5 97,92 3,92" fill={bg} stroke="#DE3831" strokeWidth="4" />
      <polygon points="50,14 90,88 10,88" fill="none" stroke="#F5F5F0" strokeWidth="2" />
      {children}
    </svg>
  );
}

function SignDangerousIntersection() {
  return (
    <WarnTriangle>
      <line x1="50" y1="30" x2="50" y2="72" stroke="#1A1A1A" strokeWidth="5" strokeLinecap="round" />
      <line x1="32" y1="55" x2="68" y2="55" stroke="#1A1A1A" strokeWidth="5" strokeLinecap="round" />
    </WarnTriangle>
  );
}

function SignPedestrianCrossing() {
  return (
    <WarnTriangle>
      {/* Stylised walking person */}
      <circle cx="50" cy="38" r="5" fill="#1A1A1A" />
      <line x1="50" y1="43" x2="50" y2="62" stroke="#1A1A1A" strokeWidth="4" strokeLinecap="round" />
      <line x1="50" y1="50" x2="42" y2="57" stroke="#1A1A1A" strokeWidth="3" strokeLinecap="round" />
      <line x1="50" y1="50" x2="58" y2="57" stroke="#1A1A1A" strokeWidth="3" strokeLinecap="round" />
      <line x1="50" y1="62" x2="44" y2="72" stroke="#1A1A1A" strokeWidth="3" strokeLinecap="round" />
      <line x1="50" y1="62" x2="56" y2="72" stroke="#1A1A1A" strokeWidth="3" strokeLinecap="round" />
    </WarnTriangle>
  );
}

function SignSchoolCrossing() {
  return (
    <WarnTriangle bg="#FFD700">
      <text x="50" y="72" textAnchor="middle" fill="#1A1A1A"
        fontSize="11" fontWeight="bold" fontFamily="Arial,sans-serif">SCHOOL</text>
      <circle cx="44" cy="42" r="4" fill="#1A1A1A" />
      <line x1="44" y1="46" x2="44" y2="58" stroke="#1A1A1A" strokeWidth="3" strokeLinecap="round" />
      <circle cx="56" cy="42" r="4" fill="#1A1A1A" />
      <line x1="56" y1="46" x2="56" y2="58" stroke="#1A1A1A" strokeWidth="3" strokeLinecap="round" />
    </WarnTriangle>
  );
}

function SignSlipperyRoad() {
  return (
    <WarnTriangle>
      {/* Car with skid lines */}
      <rect x="36" y="50" width="28" height="14" rx="3" fill="#1A1A1A" />
      <rect x="40" y="43" width="16" height="10" rx="2" fill="#1A1A1A" />
      <path d="M34,64 Q30,72 38,72" stroke="#1A1A1A" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M50,65 Q46,73 54,73" stroke="#1A1A1A" strokeWidth="3" fill="none" strokeLinecap="round" />
    </WarnTriangle>
  );
}

function SignDipRoad() {
  return (
    <WarnTriangle>
      <path d="M28,50 Q50,72 72,50" stroke="#1A1A1A" strokeWidth="5" fill="none" strokeLinecap="round" />
    </WarnTriangle>
  );
}

function SignSteepDescent() {
  return (
    <WarnTriangle>
      {/* Slope with percentage */}
      <line x1="32" y1="46" x2="68" y2="74" stroke="#1A1A1A" strokeWidth="5" strokeLinecap="round" />
      <text x="50" y="45" textAnchor="middle" fill="#1A1A1A"
        fontSize="12" fontWeight="bold" fontFamily="Arial,sans-serif">10%</text>
    </WarnTriangle>
  );
}

function SignRoadNarrows() {
  return (
    <WarnTriangle>
      <polygon points="50,30 65,75 35,75" fill="#1A1A1A" />
    </WarnTriangle>
  );
}

function SignFallingRocks() {
  return (
    <WarnTriangle>
      {/* Cliff + rocks */}
      <rect x="38" y="32" width="8" height="24" fill="#1A1A1A" rx="1" />
      <circle cx="58" cy="52" r="5" fill="#1A1A1A" />
      <circle cx="62" cy="62" r="4" fill="#1A1A1A" />
      <circle cx="52" cy="66" r="3" fill="#1A1A1A" />
    </WarnTriangle>
  );
}

function SignAnimals() {
  return (
    <WarnTriangle>
      {/* Simple cow silhouette */}
      <ellipse cx="50" cy="56" rx="16" ry="10" fill="#1A1A1A" />
      <ellipse cx="60" cy="48" rx="9" ry="7" fill="#1A1A1A" />
      <line x1="36" y1="66" x2="36" y2="75" stroke="#1A1A1A" strokeWidth="3" strokeLinecap="round" />
      <line x1="44" y1="66" x2="44" y2="75" stroke="#1A1A1A" strokeWidth="3" strokeLinecap="round" />
      <line x1="56" y1="66" x2="56" y2="75" stroke="#1A1A1A" strokeWidth="3" strokeLinecap="round" />
      <line x1="64" y1="66" x2="64" y2="75" stroke="#1A1A1A" strokeWidth="3" strokeLinecap="round" />
    </WarnTriangle>
  );
}

function SignTrafficLights() {
  return (
    <WarnTriangle>
      <rect x="43" y="30" width="14" height="38" rx="3" fill="#1A1A1A" />
      <circle cx="50" cy="38" r="4" fill="#DE3831" />
      <circle cx="50" cy="49" r="4" fill="#FFB612" />
      <circle cx="50" cy="60" r="4" fill="#007A4D" />
    </WarnTriangle>
  );
}

function SignLevelCrossing() {
  return (
    <WarnTriangle>
      <text x="50" y="68" textAnchor="middle" fill="#1A1A1A"
        fontSize="28" fontWeight="bold" fontFamily="Arial,sans-serif">X</text>
    </WarnTriangle>
  );
}

// ── Informatory / guidance signs ───────────────────────────────────────────────
function SignParking() {
  return (
    <svg viewBox="0 0 100 100" width="120" height="120">
      <rect x="4" y="4" width="92" height="92" rx="6" fill="#4472CA" stroke="#F5F5F0" strokeWidth="4" />
      <text x="50" y="70" textAnchor="middle" fill="#F5F5F0"
        fontSize="58" fontWeight="bold" fontFamily="Arial,sans-serif">P</text>
    </svg>
  );
}

function SignHospital() {
  return (
    <svg viewBox="0 0 100 100" width="120" height="120">
      <rect x="4" y="4" width="92" height="92" rx="6" fill="#4472CA" stroke="#F5F5F0" strokeWidth="4" />
      <rect x="42" y="25" width="16" height="50" rx="2" fill="#F5F5F0" />
      <rect x="25" y="42" width="50" height="16" rx="2" fill="#F5F5F0" />
    </svg>
  );
}

function SignFuel() {
  return (
    <svg viewBox="0 0 100 100" width="120" height="120">
      <rect x="4" y="4" width="92" height="92" rx="6" fill="#4472CA" stroke="#F5F5F0" strokeWidth="4" />
      {/* Fuel pump */}
      <rect x="30" y="28" width="26" height="44" rx="3" fill="#F5F5F0" />
      <rect x="36" y="34" width="14" height="16" rx="2" fill="#4472CA" />
      <rect x="56" y="32" width="8" height="28" rx="3" fill="#F5F5F0" />
      <rect x="56" y="28" width="10" height="8" rx="2" fill="#F5F5F0" />
    </svg>
  );
}

function SignTelephone() {
  return (
    <svg viewBox="0 0 100 100" width="120" height="120">
      <rect x="4" y="4" width="92" height="92" rx="6" fill="#4472CA" stroke="#F5F5F0" strokeWidth="4" />
      <path d="M28,62 C28,42 72,42 72,62 L68,70 C65,76 58,74 56,70 L52,64 C50,60 50,60 48,64 L44,70 C42,74 35,76 32,70 Z"
        fill="#F5F5F0" />
    </svg>
  );
}

function SignRestArea() {
  return (
    <svg viewBox="0 0 100 100" width="120" height="120">
      <rect x="4" y="4" width="92" height="92" rx="6" fill="#007A4D" stroke="#F5F5F0" strokeWidth="4" />
      {/* Table and bench */}
      <rect x="28" y="46" width="44" height="6" rx="2" fill="#F5F5F0" />
      <rect x="44" y="52" width="12" height="16" rx="2" fill="#F5F5F0" />
      <rect x="22" y="62" width="24" height="5" rx="2" fill="#F5F5F0" />
      <rect x="54" y="62" width="24" height="5" rx="2" fill="#F5F5F0" />
    </svg>
  );
}

function SignEmergencyExit() {
  return (
    <svg viewBox="0 0 100 100" width="120" height="120">
      <rect x="4" y="4" width="92" height="92" rx="6" fill="#007A4D" stroke="#F5F5F0" strokeWidth="4" />
      <text x="50" y="42" textAnchor="middle" fill="#F5F5F0"
        fontSize="10" fontWeight="bold" fontFamily="Arial,sans-serif">EMERGENCY</text>
      <text x="50" y="56" textAnchor="middle" fill="#F5F5F0"
        fontSize="10" fontWeight="bold" fontFamily="Arial,sans-serif">EXIT</text>
      <polygon points="35,68 50,58 65,68 60,68 60,80 40,80 40,68" fill="#F5F5F0" />
    </svg>
  );
}

function SignTollPlaza() {
  return (
    <svg viewBox="0 0 120 60" width="144" height="72">
      <rect x="2" y="2" width="116" height="56" rx="4" fill="#FFB612" stroke="#1A1A1A" strokeWidth="3" />
      <text x="60" y="38" textAnchor="middle" fill="#1A1A1A"
        fontSize="18" fontWeight="bold" fontFamily="Arial,sans-serif">TOLL</text>
    </svg>
  );
}

function SignHighway() {
  return (
    <svg viewBox="0 0 100 100" width="120" height="120">
      <path d="M10,90 L10,40 Q10,10 50,10 Q90,10 90,40 L90,90 Z" fill="#4472CA" stroke="#F5F5F0" strokeWidth="4" />
      <text x="50" y="65" textAnchor="middle" fill="#F5F5F0"
        fontSize="16" fontWeight="bold" fontFamily="Arial,sans-serif">N1</text>
    </svg>
  );
}

function SignRoadWorks() {
  return (
    <WarnTriangle bg="#FFB612">
      {/* Shovel / pickaxe silhouette */}
      <line x1="50" y1="32" x2="50" y2="72" stroke="#1A1A1A" strokeWidth="4" strokeLinecap="round" />
      <ellipse cx="50" cy="32" rx="9" ry="6" fill="#1A1A1A" />
      <line x1="44" y1="62" x2="56" y2="72" stroke="#1A1A1A" strokeWidth="4" strokeLinecap="round" />
    </WarnTriangle>
  );
}

function SignMinimumSpeed({ speed }) {
  return (
    <svg viewBox="0 0 100 100" width="120" height="120">
      <circle cx="50" cy="50" r="46" fill="#4472CA" stroke="#F5F5F0" strokeWidth="4" />
      <text x="50" y="64" textAnchor="middle" fill="#F5F5F0"
        fontSize="32" fontWeight="bold" fontFamily="Arial,sans-serif">{speed}</text>
    </svg>
  );
}

function SignEndOfRestriction() {
  return (
    <svg viewBox="0 0 100 100" width="120" height="120">
      <circle cx="50" cy="50" r="46" fill="#F5F5F0" stroke="#888" strokeWidth="4" />
      {/* Diagonal dashes */}
      {[0,1,2,3,4].map(i => (
        <line key={i}
          x1={22 + i * 14} y1="20"
          x2={8 + i * 14} y2="80"
          stroke="#888" strokeWidth="4" strokeLinecap="round" />
      ))}
    </svg>
  );
}

function SignBusOnly() {
  return (
    <svg viewBox="0 0 100 100" width="120" height="120">
      <rect x="4" y="4" width="92" height="92" rx="6" fill="#007A4D" stroke="#F5F5F0" strokeWidth="4" />
      <text x="50" y="62" textAnchor="middle" fill="#F5F5F0"
        fontSize="20" fontWeight="bold" fontFamily="Arial,sans-serif">BUS ONLY</text>
    </svg>
  );
}

function SignHeightLimit({ height }) {
  return (
    <svg viewBox="0 0 100 100" width="120" height="120">
      <circle cx="50" cy="50" r="46" fill="#F5F5F0" stroke="#DE3831" strokeWidth="7" />
      <text x="50" y="55" textAnchor="middle" fill="#1A1A1A"
        fontSize="16" fontWeight="bold" fontFamily="Arial,sans-serif">{height}m</text>
    </svg>
  );
}

function SignMassLimit({ mass }) {
  return (
    <svg viewBox="0 0 100 100" width="120" height="120">
      <circle cx="50" cy="50" r="46" fill="#F5F5F0" stroke="#DE3831" strokeWidth="7" />
      <text x="50" y="48" textAnchor="middle" fill="#1A1A1A"
        fontSize="14" fontWeight="bold" fontFamily="Arial,sans-serif">{mass}t</text>
      <text x="50" y="65" textAnchor="middle" fill="#1A1A1A"
        fontSize="10" fontFamily="Arial,sans-serif">MAX</text>
    </svg>
  );
}

function SignDoNotEnterFreeway() {
  return (
    <svg viewBox="0 0 100 100" width="120" height="120">
      <circle cx="50" cy="50" r="46" fill="#DE3831" stroke="#F5F5F0" strokeWidth="4" />
      <rect x="18" y="42" width="64" height="16" rx="3" fill="#F5F5F0" />
      <text x="50" y="82" textAnchor="middle" fill="#F5F5F0"
        fontSize="9" fontFamily="Arial,sans-serif">FREEWAY</text>
    </svg>
  );
}

function SignTurningTrafficYields() {
  return (
    <svg viewBox="0 0 100 100" width="120" height="120">
      <circle cx="50" cy="50" r="46" fill="#F5F5F0" stroke="#1A1A1A" strokeWidth="4" />
      {/* Straight arrow up */}
      <line x1="50" y1="75" x2="50" y2="28" stroke="#1A1A1A" strokeWidth="5" strokeLinecap="round" />
      <polygon points="50,20 42,34 58,34" fill="#1A1A1A" />
      {/* Curved yield arrow */}
      <path d="M68,70 Q80,50 68,32" stroke="#DE3831" strokeWidth="4" fill="none" strokeLinecap="round" />
      <polygon points="62,26 72,26 67,36" fill="#DE3831" />
    </svg>
  );
}

// ── Ground markings ────────────────────────────────────────────────────────────
function SignZigZag() {
  return (
    <svg viewBox="0 0 140 70" width="168" height="84">
      <rect x="2" y="2" width="136" height="66" rx="4" fill="#F5F5F0" stroke="#1A1A1A" strokeWidth="3" />
      <polyline points="15,55 35,15 55,55 75,15 95,55 115,15 125,30"
        stroke="#FFB612" strokeWidth="5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SignDoubleYellow() {
  return (
    <svg viewBox="0 0 140 70" width="168" height="84">
      <rect x="2" y="2" width="136" height="66" rx="4" fill="#1A1A1A" stroke="#555" strokeWidth="3" />
      <line x1="62" y1="10" x2="62" y2="60" stroke="#FFB612" strokeWidth="5" />
      <line x1="76" y1="10" x2="76" y2="60" stroke="#FFB612" strokeWidth="5" />
    </svg>
  );
}

function SignWhiteDashedLine() {
  return (
    <svg viewBox="0 0 140 70" width="168" height="84">
      <rect x="2" y="2" width="136" height="66" rx="4" fill="#1A1A1A" stroke="#555" strokeWidth="3" />
      {[0,1,2,3,4].map(i => (
        <line key={i} x1={18 + i * 26} y1="35" x2={34 + i * 26} y2="35"
          stroke="#F5F5F0" strokeWidth="5" strokeLinecap="round" />
      ))}
    </svg>
  );
}

function SignContinuousWhite() {
  return (
    <svg viewBox="0 0 140 70" width="168" height="84">
      <rect x="2" y="2" width="136" height="66" rx="4" fill="#1A1A1A" stroke="#555" strokeWidth="3" />
      <line x1="12" y1="35" x2="128" y2="35" stroke="#F5F5F0" strokeWidth="5" strokeLinecap="round" />
    </svg>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// QUESTION DATA
// ══════════════════════════════════════════════════════════════════════════════

const CATEGORIES = [
  { id: "regulatory", label: "Regulatory Signs", color: T.red, desc: "Signs that give instructions drivers must obey — mainly circular or octagonal." },
  { id: "warning",    label: "Warning Signs",    color: T.gold, desc: "Triangular signs alerting drivers to hazards ahead." },
  { id: "guidance",   label: "Guidance & Info",  color: T.blue, desc: "Signs providing directions, services, and general information." },
  { id: "markings",   label: "Road Markings",    color: T.green, desc: "Lines and symbols painted on the road surface." },
];

const QUESTIONS = [
  // ── REGULATORY ──────────────────────────────────────────────────────────────
  {
    id: "r01", category: "regulatory",
    sign: <SignStop />,
    question: "What does this sign mean?",
    options: ["Come to a complete stop and proceed when safe", "Slow down and yield to traffic", "Stop only if there is traffic coming", "Reduce speed to 10 km/h"],
    answer: 0,
    explanation: "A STOP sign requires a complete stop at the stop line. You must only proceed when the way is safe.",
  },
  {
    id: "r02", category: "regulatory",
    sign: <SignYield />,
    question: "What does this sign require you to do?",
    options: ["Stop completely", "Give way to traffic on the major road", "Sound your horn before proceeding", "Flash your headlights"],
    answer: 1,
    explanation: "A YIELD sign means you must give way to traffic already on the major road. You may slow down or stop if necessary, but a full stop is only required if traffic is present.",
  },
  {
    id: "r03", category: "regulatory",
    sign: <SignSpeedLimit speed="60" />,
    question: "What does this sign tell you?",
    options: ["The minimum speed is 60 km/h", "The maximum speed is 60 km/h", "The speed limit applies only at night", "Recommended speed for bends ahead"],
    answer: 1,
    explanation: "A speed limit sign inside a red circle is a regulatory maximum — you must not exceed 60 km/h.",
  },
  {
    id: "r04", category: "regulatory",
    sign: <SignSpeedLimit speed="120" />,
    question: "What does this sign indicate?",
    options: ["Maximum speed 120 km/h", "Minimum speed 120 km/h", "Recommended highway speed", "Speed limit for trucks only"],
    answer: 0,
    explanation: "120 km/h is the maximum speed limit on South African freeways for light motor vehicles.",
  },
  {
    id: "r05", category: "regulatory",
    sign: <SignNoEntry />,
    question: "What does this sign mean?",
    options: ["No stopping", "No U-turn", "No entry — do not drive into this road", "One-way traffic ahead"],
    answer: 2,
    explanation: "The no-entry sign (red circle, white bar) prohibits vehicles from entering that road. You will typically see it at the wrong end of a one-way street.",
  },
  {
    id: "r06", category: "regulatory",
    sign: <SignNoOvertaking />,
    question: "What does this sign prohibit?",
    options: ["Parking on this road", "Overtaking (passing) another vehicle", "U-turns at this point", "Hooting in this area"],
    answer: 1,
    explanation: "The no-overtaking sign means you must not pass the vehicle ahead of you while this restriction applies.",
  },
  {
    id: "r07", category: "regulatory",
    sign: <SignNoParking />,
    question: "What does a blue circle with a P and a red diagonal slash mean?",
    options: ["Parking is permitted here", "No parking allowed", "Parking for disabled only", "Pay parking area"],
    answer: 1,
    explanation: "The diagonal red line through the P means parking is prohibited in this area.",
  },
  {
    id: "r08", category: "regulatory",
    sign: <SignNoStopping />,
    question: "What does this sign prohibit?",
    options: ["No parking during certain hours", "Absolutely no stopping of any vehicle at any time", "No U-turns", "No dropping off passengers"],
    answer: 1,
    explanation: "The no-stopping sign means no vehicle may stop here at any time for any reason.",
  },
  {
    id: "r09", category: "regulatory",
    sign: <SignOneWay direction="right" />,
    question: "What does this sign mean?",
    options: ["Turn right only", "One-way traffic in the direction of the arrow", "Detour to the right", "Right lane closed ahead"],
    answer: 1,
    explanation: "The one-way sign indicates all traffic moves in the direction shown by the arrow. Driving against the arrow is prohibited.",
  },
  {
    id: "r10", category: "regulatory",
    sign: <SignKeepLeft />,
    question: "What does this sign instruct you to do?",
    options: ["Turn left at the next junction", "Keep to the left of an obstruction or island", "No right turn ahead", "Give way to traffic on the left"],
    answer: 1,
    explanation: "Keep left signs are placed at islands, traffic circles, or obstructions — you must pass on the left-hand side.",
  },
  {
    id: "r11", category: "regulatory",
    sign: <SignMiniRoundabout />,
    question: "What does this blue circular sign mean?",
    options: ["U-turns are permitted", "You are approaching a mini-roundabout — give way to traffic in the circle", "Traffic circle — no entry", "Drive around the block"],
    answer: 1,
    explanation: "This sign warns of a mini-roundabout. Traffic in the roundabout has priority and you must give way before entering.",
  },
  {
    id: "r12", category: "regulatory",
    sign: <SignSpeedLimit speed="40" />,
    question: "In a school zone this sign is displayed. What must you do?",
    options: ["Maintain normal speed unless children are present", "Do not exceed 40 km/h", "Stop and wait for the school guard", "Drive at 40 km/h minimum"],
    answer: 1,
    explanation: "40 km/h is a common school zone speed limit in South Africa. You must not exceed this even if no children are visible.",
  },
  {
    id: "r13", category: "regulatory",
    sign: <SignMinimumSpeed speed="60" />,
    question: "What does a blue circle with a number inside mean?",
    options: ["Maximum speed limit", "Recommended speed", "Minimum speed — do not travel slower", "Advisory speed for curves"],
    answer: 2,
    explanation: "A blue circle speed sign means MINIMUM speed. On freeways this ensures traffic flows safely and you must not go slower.",
  },
  {
    id: "r14", category: "regulatory",
    sign: <SignEndOfRestriction />,
    question: "What does a white circle with diagonal grey dashes mean?",
    options: ["Start of speed restriction", "No passing zone begins", "End of a restriction (speed limit, no overtaking, etc.)", "Road ends ahead"],
    answer: 2,
    explanation: "This sign cancels the previous restriction. For example, after a 60 km/h zone it means that restriction no longer applies.",
  },
  {
    id: "r15", category: "regulatory",
    sign: <SignHeightLimit height="4.2" />,
    question: "What does this sign mean for a vehicle that is 4.5 m tall?",
    options: ["The vehicle may proceed with caution", "The vehicle must not enter — it exceeds the height limit", "Proceed only at night", "Sound horn before entering"],
    answer: 1,
    explanation: "A height restriction sign means no vehicle exceeding that height may pass. A 4.5 m vehicle exceeds the 4.2 m limit and must not enter.",
  },
  {
    id: "r16", category: "regulatory",
    sign: <SignMassLimit mass="10" />,
    question: "This sign shows '10t MAX'. What does it mean?",
    options: ["At least 10 tonnes required to use this road", "No vehicle with a gross mass exceeding 10 tonnes", "Speed limit 10 km/h on this road", "Trucks may only carry 10 tonnes"],
    answer: 1,
    explanation: "A mass limit sign prohibits vehicles whose gross vehicle mass (loaded) exceeds the stated limit from using that road.",
  },
  {
    id: "r17", category: "regulatory",
    sign: <SignTurningTrafficYields />,
    question: "What does this sign tell turning vehicles?",
    options: ["Straight-going traffic must yield to turning traffic", "Turning traffic must yield to oncoming straight traffic", "Both must stop at the line", "Traffic lights are ahead"],
    answer: 1,
    explanation: "This sign means turning vehicles must give way to oncoming vehicles proceeding straight ahead.",
  },
  {
    id: "r18", category: "regulatory",
    sign: <SignBusOnly />,
    question: "What does this green sign with 'BUS ONLY' indicate?",
    options: ["Bus stop ahead", "Buses may exceed the speed limit", "This lane or road is reserved exclusively for buses", "Buses must stop here"],
    answer: 2,
    explanation: "A bus-only sign designates a lane or road for public buses only. Private vehicles are not permitted in that lane.",
  },
  {
    id: "r19", category: "regulatory",
    sign: <SignDoNotEnterFreeway />,
    question: "This sign is placed at a freeway on-ramp. What does it mean?",
    options: ["The freeway is closed", "Do not enter the freeway at this point", "Toll road begins", "Speed limit 100 km/h"],
    answer: 1,
    explanation: "This variant of the no-entry sign specifically prohibits vehicles from entering the freeway at that junction.",
  },

  // ── WARNING ─────────────────────────────────────────────────────────────────
  {
    id: "w01", category: "warning",
    sign: <SignDangerousIntersection />,
    question: "A triangle with a cross inside warns of what?",
    options: ["Railway crossing ahead", "A dangerous intersection ahead", "A T-junction ahead", "Roadworks zone"],
    answer: 1,
    explanation: "The cross symbol inside a warning triangle indicates a dangerous or uncontrolled intersection ahead. Reduce speed and be prepared to yield.",
  },
  {
    id: "w02", category: "warning",
    sign: <SignPedestrianCrossing />,
    question: "What does this warning triangle mean?",
    options: ["School zone ahead", "Pedestrian crossing ahead", "Children playing area", "Cycle lane begins"],
    answer: 1,
    explanation: "The pedestrian silhouette inside a triangle warns of a pedestrian crossing ahead. Watch for people crossing the road.",
  },
  {
    id: "w03", category: "warning",
    sign: <SignSchoolCrossing />,
    question: "This yellow triangle with two figures is placed near a school. What must you do?",
    options: ["Stop and wait for the guard's signal", "Reduce speed — children may be crossing", "Sound your horn to warn children", "Proceed normally as children are supervised"],
    answer: 1,
    explanation: "A school crossing sign warns you to reduce speed. Children may be crossing. Be prepared to stop.",
  },
  {
    id: "w04", category: "warning",
    sign: <SignSlipperyRoad />,
    question: "A triangle showing a skidding car means?",
    options: ["Steep decline ahead", "Slippery road surface — reduce speed", "Road ends", "Gravel road begins"],
    answer: 1,
    explanation: "The skidding-car symbol warns of a slippery road — wet, icy, or loose gravel. Reduce speed and avoid sudden braking or sharp steering.",
  },
  {
    id: "w05", category: "warning",
    sign: <SignDipRoad />,
    question: "A triangle with a curved dip line warns of what?",
    options: ["Bridge ahead", "Hump or speed bump ahead", "Dip or low point in the road", "Road bends right"],
    answer: 2,
    explanation: "This sign warns of a dip in the road — a low-lying section where water can collect and where you may lose contact with the surface if going too fast.",
  },
  {
    id: "w06", category: "warning",
    sign: <SignSteepDescent />,
    question: "A triangle with a slope line and '10%' means?",
    options: ["10% discount on toll fees", "Steep descent — engage low gear", "Steep ascent ahead", "Road has a 10% gradient curve"],
    answer: 1,
    explanation: "A steep descent sign warns of a significant downhill gradient. Heavy vehicles must engage a lower gear before descending.",
  },
  {
    id: "w07", category: "warning",
    sign: <SignRoadNarrows />,
    question: "A triangle with a narrowing shape warns you that?",
    options: ["The road becomes one-way", "The road narrows ahead", "A median strip begins", "Lane merges from the left"],
    answer: 1,
    explanation: "The road-narrows sign warns that the road becomes narrower. Reduce speed and be prepared to give way to oncoming vehicles.",
  },
  {
    id: "w08", category: "warning",
    sign: <SignFallingRocks />,
    question: "Rocks falling from a cliff-face symbol warns of?",
    options: ["Steep climb ahead", "Falling rocks or rock slides possible", "Gravel road surface", "Mining area nearby"],
    answer: 1,
    explanation: "This sign warns that rocks may fall from the hillside onto the road. Drive carefully and do not stop in the rockfall zone.",
  },
  {
    id: "w09", category: "warning",
    sign: <SignAnimals />,
    question: "A triangle with an animal silhouette means?",
    options: ["Wildlife reserve — no hooting", "Animals may cross the road ahead", "Farm vehicles permitted", "No livestock transport"],
    answer: 1,
    explanation: "This sign warns that domestic or wild animals may be on or crossing the road ahead. Reduce speed and watch for animals.",
  },
  {
    id: "w10", category: "warning",
    sign: <SignTrafficLights />,
    question: "A triangle containing a set of traffic lights means?",
    options: ["Traffic lights are out of order", "Traffic lights ahead — be prepared to stop", "No traffic lights on this road", "Emergency vehicle signal ahead"],
    answer: 1,
    explanation: "This warning sign alerts you to traffic lights ahead, especially where visibility is limited. Prepare to stop.",
  },
  {
    id: "w11", category: "warning",
    sign: <SignLevelCrossing />,
    question: "A triangle with a large X warns of what?",
    options: ["Dangerous junction", "Level (rail) crossing ahead — watch for trains", "Road closed ahead", "No crossing"],
    answer: 1,
    explanation: "The X symbol in a triangle warns of a level crossing with a railway line. Reduce speed, look both ways, and never cross if a train is approaching.",
  },
  {
    id: "w12", category: "warning",
    sign: <SignRoadWorks />,
    question: "What does a warning triangle with a shovel/pick symbol mean?",
    options: ["Mining activity nearby", "Roadworks ahead — proceed with caution", "Gravel pit on the left", "Construction workers crossing"],
    answer: 1,
    explanation: "Roadworks signs warn of active construction on or near the road. Reduce speed, follow instructions from flagmen, and watch for workers and equipment.",
  },

  // ── GUIDANCE ─────────────────────────────────────────────────────────────────
  {
    id: "g01", category: "guidance",
    sign: <SignParking />,
    question: "A blue square with a white P means?",
    options: ["No parking ahead", "Parking available here", "Police station ahead", "Private road"],
    answer: 1,
    explanation: "The blue P sign indicates a parking area. If accompanied by a time plate it shows the hours during which parking is allowed.",
  },
  {
    id: "g02", category: "guidance",
    sign: <SignHospital />,
    question: "A blue square with a white cross means?",
    options: ["First aid post ahead", "Hospital or medical facility ahead", "Church or cemetery", "Emergency services depot"],
    answer: 1,
    explanation: "The white cross on blue indicates a hospital or clinic is nearby. You must not sound your horn unnecessarily near this sign.",
  },
  {
    id: "g03", category: "guidance",
    sign: <SignFuel />,
    question: "What service does this blue sign indicate?",
    options: ["Vehicle repair workshop", "Fuel or petrol station ahead", "LPG or gas station", "Electric vehicle charging point"],
    answer: 1,
    explanation: "The fuel pump symbol on a blue background indicates a filling/petrol station ahead.",
  },
  {
    id: "g04", category: "guidance",
    sign: <SignTelephone />,
    question: "A blue sign with a phone receiver symbol indicates?",
    options: ["Radio communication tower", "Emergency telephone nearby", "Cell phone coverage zone", "No cell phone use"],
    answer: 1,
    explanation: "This sign points to an emergency telephone — often found on freeways and mountain passes.",
  },
  {
    id: "g05", category: "guidance",
    sign: <SignRestArea />,
    question: "This green sign with a table and benches means?",
    options: ["Restaurant ahead", "Rest or picnic area ahead", "Camping site nearby", "Roadside market"],
    answer: 1,
    explanation: "The rest area sign indicates a designated stopping point with picnic facilities, toilets, or both. Useful on long trips.",
  },
  {
    id: "g06", category: "guidance",
    sign: <SignTollPlaza />,
    question: "A yellow rectangular sign saying 'TOLL' means?",
    options: ["Free road — no charge", "Toll plaza ahead — have payment ready", "Heavy vehicle lane ahead", "Road under construction"],
    answer: 1,
    explanation: "Toll signs warn that a toll barrier is ahead. Have your coins, e-tag, or card ready before you reach the plaza.",
  },
  {
    id: "g07", category: "guidance",
    sign: <SignHighway />,
    question: "A green shield-shaped sign with 'N1' means?",
    options: ["You are on national road number 1", "Speed limit 1 km/h", "North road begins", "No 1 priority road"],
    answer: 0,
    explanation: "National road route markers (green shield) identify the national road. N1 is the main Cape Town–Johannesburg route.",
  },
  {
    id: "g08", category: "guidance",
    sign: <SignEmergencyExit />,
    question: "A green sign with 'EMERGENCY EXIT' and an arrow means?",
    options: ["Freeway on-ramp ahead", "Emergency escape route — for runaway vehicles", "Emergency services exit only", "Short-cut to the next town"],
    answer: 1,
    explanation: "Emergency escape routes (runaway lanes) are provided on steep descents for vehicles whose brakes have failed. They are filled with deep gravel to stop the vehicle safely.",
  },

  // ── ROAD MARKINGS ──────────────────────────────────────────────────────────
  {
    id: "m01", category: "markings",
    sign: <SignDoubleYellow />,
    question: "Two continuous yellow lines in the centre of the road mean?",
    options: ["Both lanes are bus lanes", "Overtaking is prohibited in both directions", "The road is temporarily closed", "Yellow lines mark a school zone"],
    answer: 1,
    explanation: "Double continuous yellow lines (barrier lines) mean absolutely no crossing or overtaking is permitted by traffic in either direction.",
  },
  {
    id: "m02", category: "markings",
    sign: <SignWhiteDashedLine />,
    question: "White dashed lines in the centre of the road mean?",
    options: ["No overtaking at any time", "Lane division — you may cross to overtake when safe", "Bicycle lane ahead", "Edge of the roadway"],
    answer: 1,
    explanation: "Dashed white centre lines indicate lane divisions. You may cross them to overtake when it is safe and legal to do so.",
  },
  {
    id: "m03", category: "markings",
    sign: <SignContinuousWhite />,
    question: "A single continuous white line along the edge of the road marks?",
    options: ["The centre of the road", "The edge of the roadway — do not cross to the right", "A bus stop area", "A no-passing zone"],
    answer: 1,
    explanation: "A solid white edge line marks the boundary of the road. Driving to the right of this line is permitted only to stop safely.",
  },
  {
    id: "m04", category: "markings",
    sign: <SignZigZag />,
    question: "Yellow zig-zag lines on the road mean?",
    options: ["Slippery surface — reduce speed", "No parking or stopping — pedestrian crossing zone", "Speed humps ahead", "Bus bay markings"],
    answer: 1,
    explanation: "Yellow zig-zag lines mark the approach to a pedestrian crossing. No vehicle may park or stop on these lines as they must remain clear.",
  },
  {
    id: "m05", category: "markings",
    sign: <SignWhiteDashedLine />,
    question: "Short white dashes across a lane at a junction indicate?",
    options: ["A STOP line", "A yield/give-way line — slow down and give way if necessary", "A pedestrian crossing", "Lane filtering for motorcycles"],
    answer: 1,
    explanation: "Short dashes across the road at a junction mark a give-way (yield) line. You do not have to stop unless traffic on the major road requires it.",
  },
  {
    id: "m06", category: "markings",
    sign: <SignContinuousWhite />,
    question: "A solid white continuous line across all lanes at a junction marks?",
    options: ["A give-way position", "A STOP line — you must stop here completely", "A pedestrian crossing", "An advanced stop line for cyclists"],
    answer: 1,
    explanation: "A continuous white line across the road at a stop sign or red light is the stop line. Your vehicle must stop with its front wheels behind (before) this line.",
  },
];

// ══════════════════════════════════════════════════════════════════════════════
// UTILITY
// ══════════════════════════════════════════════════════════════════════════════

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ══════════════════════════════════════════════════════════════════════════════
// QUIZ ENGINE
// ══════════════════════════════════════════════════════════════════════════════

function QuizEngine({ questions, onFinish, timed }) {
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(timed ? 30 : null);

  const q = questions[idx];

  const handleAnswer = useCallback((optIdx) => {
    if (revealed) return;
    setSelected(optIdx);
    setRevealed(true);
    if (optIdx === q.answer) setScore(s => s + 1);
  }, [revealed, q]);

  useEffect(() => {
    if (!timed || revealed) return;
    if (timeLeft <= 0) { handleAnswer(-1); return; }
    const t = setTimeout(() => setTimeLeft(s => s - 1), 1000);
    return () => clearTimeout(t);
  }, [timed, timeLeft, revealed, handleAnswer]);

  useEffect(() => {
    setTimeLeft(timed ? 30 : null);
    setSelected(null);
    setRevealed(false);
  }, [idx, timed]);

  function next() {
    if (idx + 1 >= questions.length) {
      onFinish(score + (selected === q.answer ? 1 : 0));
    } else {
      setIdx(i => i + 1);
    }
  }

  const cat = CATEGORIES.find(c => c.id === q.category);
  const accentColor = cat?.color ?? T.gold;

  return (
    <div style={{ maxWidth: 620, margin: "0 auto", padding: "0 16px 40px" }}>
      {/* Progress */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div style={{ color: T.dim, fontSize: 13, fontFamily: T.mono }}>
          Question {idx + 1} / {questions.length}
        </div>
        {timed && !revealed && (
          <div style={{
            color: timeLeft <= 10 ? T.red : T.gold,
            fontSize: 20, fontFamily: T.mono, fontWeight: 700,
          }}>
            {timeLeft}s
          </div>
        )}
        <div style={{ color: T.dim, fontSize: 13, fontFamily: T.mono }}>
          Score: {score}
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ background: T.border, height: 4, borderRadius: 2, marginBottom: 24 }}>
        <div style={{
          width: `${((idx + 1) / questions.length) * 100}%`,
          height: "100%", borderRadius: 2, background: accentColor,
          transition: "width 0.3s",
        }} />
      </div>

      {/* Sign display */}
      <div style={{
        background: T.surface,
        border: `2px solid ${T.border}`,
        borderRadius: 8,
        padding: "28px 20px",
        marginBottom: 20,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 16,
      }}>
        <div style={{
          color: accentColor, fontSize: 11, letterSpacing: 3,
          fontFamily: T.mono, textTransform: "uppercase",
        }}>
          {cat?.label}
        </div>
        <div style={{ display: "flex", justifyContent: "center" }}>
          {q.sign}
        </div>
        <div style={{
          color: T.text, fontSize: 17, fontWeight: 600,
          textAlign: "center", lineHeight: 1.5, fontFamily: T.font,
        }}>
          {q.question}
        </div>
      </div>

      {/* Options */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
        {q.options.map((opt, i) => {
          let bg = T.surface;
          let border = T.border;
          let color = T.text;

          if (revealed) {
            if (i === q.answer) { bg = "#0A2E0F"; border = T.green; color = T.green; }
            else if (i === selected) { bg = "#2E0A0A"; border = T.red; color = T.red; }
            else { color = T.dim; }
          }

          return (
            <button
              key={i}
              onClick={() => handleAnswer(i)}
              disabled={revealed}
              style={{
                background: bg, border: `2px solid ${border}`,
                borderRadius: 6, padding: "13px 16px",
                textAlign: "left", cursor: revealed ? "default" : "pointer",
                color, fontSize: 15, fontFamily: T.font,
                lineHeight: 1.4, transition: "border-color 0.15s, background 0.15s",
              }}
            >
              <span style={{ color: T.dim, fontFamily: T.mono, marginRight: 10 }}>
                {String.fromCharCode(65 + i)}.
              </span>
              {opt}
            </button>
          );
        })}
      </div>

      {/* Explanation + next */}
      {revealed && (
        <div>
          <div style={{
            background: T.surface,
            border: `1px solid ${T.border}`,
            borderLeft: `4px solid ${selected === q.answer ? T.green : T.red}`,
            borderRadius: 4, padding: "14px 16px", marginBottom: 16,
          }}>
            <div style={{
              color: selected === q.answer ? T.green : T.red,
              fontSize: 12, letterSpacing: 1, fontFamily: T.mono, marginBottom: 6,
            }}>
              {selected === q.answer ? "CORRECT" : selected === -1 ? "TIME'S UP" : "INCORRECT"}
            </div>
            <div style={{ color: T.dim, fontSize: 14, lineHeight: 1.7, fontFamily: T.font }}>
              {q.explanation}
            </div>
          </div>
          <button
            onClick={next}
            style={{
              width: "100%", padding: "14px 0",
              background: accentColor, border: "none",
              borderRadius: 6, cursor: "pointer",
              color: "#000", fontSize: 15, fontWeight: 700,
              fontFamily: T.font,
            }}
          >
            {idx + 1 >= questions.length ? "See Results" : "Next Question →"}
          </button>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// RESULT SCREEN
// ══════════════════════════════════════════════════════════════════════════════

function ResultScreen({ score, total, onRetry, onHome }) {
  const pct = Math.round((score / total) * 100);
  const passed = pct >= 70;
  return (
    <div style={{ maxWidth: 500, margin: "0 auto", padding: "40px 16px", textAlign: "center" }}>
      <div style={{
        fontSize: 64, fontWeight: 700,
        color: passed ? T.green : T.red,
        fontFamily: T.mono, marginBottom: 8,
      }}>
        {pct}%
      </div>
      <div style={{ color: T.text, fontSize: 22, fontWeight: 700, marginBottom: 8, fontFamily: T.font }}>
        {score} / {total} correct
      </div>
      <div style={{ color: passed ? T.green : T.red, fontSize: 16, marginBottom: 32, fontFamily: T.font }}>
        {passed ? "Well done — you passed!" : "Keep practising — aim for 70%+"}
      </div>
      <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
        <button onClick={onRetry} style={{
          padding: "12px 28px", background: T.gold, border: "none",
          borderRadius: 6, cursor: "pointer", color: "#000",
          fontSize: 15, fontWeight: 700, fontFamily: T.font,
        }}>
          Try Again
        </button>
        <button onClick={onHome} style={{
          padding: "12px 28px", background: T.surface,
          border: `2px solid ${T.border}`, borderRadius: 6, cursor: "pointer",
          color: T.text, fontSize: 15, fontFamily: T.font,
        }}>
          ← Home
        </button>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// STUDY MODE — browse signs with explanations
// ══════════════════════════════════════════════════════════════════════════════

function StudyMode({ catId, onBack }) {
  const questions = catId === "all"
    ? QUESTIONS
    : QUESTIONS.filter(q => q.category === catId);

  const [idx, setIdx] = useState(0);
  const q = questions[idx];
  const cat = CATEGORIES.find(c => c.id === q.category);

  return (
    <div style={{ maxWidth: 620, margin: "0 auto", padding: "0 16px 40px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <button onClick={onBack} style={{
          background: "none", border: `1px solid ${T.border}`,
          color: T.dim, padding: "6px 14px", borderRadius: 4,
          cursor: "pointer", fontSize: 13, fontFamily: T.font,
        }}>← Back</button>
        <div style={{ color: T.dim, fontSize: 13, fontFamily: T.mono }}>
          {idx + 1} / {questions.length}
        </div>
      </div>

      <div style={{
        background: T.surface, border: `2px solid ${cat?.color ?? T.gold}`,
        borderRadius: 8, padding: "28px 20px", textAlign: "center", marginBottom: 16,
      }}>
        <div style={{
          color: cat?.color ?? T.gold, fontSize: 11, letterSpacing: 3,
          fontFamily: T.mono, textTransform: "uppercase", marginBottom: 16,
        }}>
          {cat?.label}
        </div>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
          {q.sign}
        </div>
        <div style={{ color: T.text, fontSize: 17, fontWeight: 600, fontFamily: T.font, marginBottom: 12 }}>
          {q.question}
        </div>
        <div style={{
          background: T.surfaceAlt, borderRadius: 6, padding: "12px 16px",
          color: T.gold, fontSize: 15, fontFamily: T.font, fontWeight: 700,
          marginBottom: 12,
        }}>
          {q.options[q.answer]}
        </div>
        <div style={{ color: T.dim, fontSize: 14, lineHeight: 1.7, fontFamily: T.font }}>
          {q.explanation}
        </div>
      </div>

      <div style={{ display: "flex", gap: 12 }}>
        <button
          onClick={() => setIdx(i => Math.max(0, i - 1))}
          disabled={idx === 0}
          style={{
            flex: 1, padding: "12px 0", background: T.surface,
            border: `2px solid ${T.border}`, borderRadius: 6,
            cursor: idx === 0 ? "default" : "pointer",
            color: idx === 0 ? T.border : T.text, fontSize: 15, fontFamily: T.font,
          }}
        >← Previous</button>
        <button
          onClick={() => setIdx(i => Math.min(questions.length - 1, i + 1))}
          disabled={idx === questions.length - 1}
          style={{
            flex: 1, padding: "12px 0", background: cat?.color ?? T.gold,
            border: "none", borderRadius: 6,
            cursor: idx === questions.length - 1 ? "default" : "pointer",
            color: "#000", fontSize: 15, fontWeight: 700, fontFamily: T.font,
            opacity: idx === questions.length - 1 ? 0.4 : 1,
          }}
        >Next →</button>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// HOME SCREEN
// ══════════════════════════════════════════════════════════════════════════════

function HomeScreen({ onStart }) {
  const counts = {};
  QUESTIONS.forEach(q => { counts[q.category] = (counts[q.category] ?? 0) + 1; });

  return (
    <div style={{ maxWidth: 680, margin: "0 auto", padding: "32px 20px 40px" }}>
      <div style={{ color: T.dim, fontSize: 11, letterSpacing: 3, marginBottom: 20, fontFamily: T.mono, textTransform: "uppercase" }}>
        Choose a mode
      </div>

      {/* Exam mode */}
      <div style={{
        background: T.surface, border: `2px solid ${T.gold}`,
        borderRadius: 8, padding: "22px 20px", marginBottom: 14,
      }}>
        <div style={{ color: T.gold, fontSize: 11, letterSpacing: 3, fontFamily: T.mono, textTransform: "uppercase", marginBottom: 8 }}>
          EXAM MODE
        </div>
        <div style={{ color: T.text, fontSize: 18, fontWeight: 700, marginBottom: 6, fontFamily: T.font }}>
          All Signs — Mixed Quiz
        </div>
        <div style={{ color: T.dim, fontSize: 14, lineHeight: 1.6, marginBottom: 16, fontFamily: T.font }}>
          {QUESTIONS.length} questions covering all sign categories, shuffled at random. Pass mark: 70%.
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={() => onStart("exam", null, false)} style={{
            padding: "10px 22px", background: T.gold, border: "none",
            borderRadius: 5, cursor: "pointer", color: "#000",
            fontSize: 14, fontWeight: 700, fontFamily: T.font,
          }}>Start Quiz</button>
          <button onClick={() => onStart("exam", null, true)} style={{
            padding: "10px 22px", background: T.surface,
            border: `2px solid ${T.gold}`, borderRadius: 5, cursor: "pointer",
            color: T.gold, fontSize: 14, fontFamily: T.font,
          }}>⏱ Timed (30s)</button>
        </div>
      </div>

      {/* Category drills */}
      <div style={{ color: T.dim, fontSize: 11, letterSpacing: 3, margin: "24px 0 14px", fontFamily: T.mono, textTransform: "uppercase" }}>
        Drill by category
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {CATEGORIES.map(cat => (
          <div key={cat.id} style={{
            background: T.surface, border: `1px solid ${T.border}`,
            borderLeft: `4px solid ${cat.color}`,
            borderRadius: 6, padding: "16px 18px",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
              <div>
                <div style={{ color: cat.color, fontSize: 11, letterSpacing: 2, fontFamily: T.mono, marginBottom: 4 }}>
                  {counts[cat.id] ?? 0} questions
                </div>
                <div style={{ color: T.text, fontSize: 17, fontWeight: 700, fontFamily: T.font }}>
                  {cat.label}
                </div>
                <div style={{ color: T.dim, fontSize: 13, lineHeight: 1.5, marginTop: 4, fontFamily: T.font }}>
                  {cat.desc}
                </div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
              <button onClick={() => onStart("category", cat.id, false)} style={{
                padding: "8px 18px", background: cat.color, border: "none",
                borderRadius: 4, cursor: "pointer", color: "#000",
                fontSize: 13, fontWeight: 700, fontFamily: T.font,
              }}>Quiz</button>
              <button onClick={() => onStart("category", cat.id, true)} style={{
                padding: "8px 18px", background: T.surface,
                border: `1px solid ${cat.color}`, borderRadius: 4,
                cursor: "pointer", color: cat.color, fontSize: 13, fontFamily: T.font,
              }}>⏱ Timed</button>
              <button onClick={() => onStart("study", cat.id, false)} style={{
                padding: "8px 18px", background: T.surfaceAlt,
                border: `1px solid ${T.border}`, borderRadius: 4,
                cursor: "pointer", color: T.dim, fontSize: 13, fontFamily: T.font,
              }}>Study mode</button>
            </div>
          </div>
        ))}
      </div>

      {/* Study all */}
      <div style={{ marginTop: 14 }}>
        <button onClick={() => onStart("study", "all", false)} style={{
          width: "100%", padding: "12px 0",
          background: T.surfaceAlt, border: `1px solid ${T.border}`,
          borderRadius: 6, cursor: "pointer", color: T.dim,
          fontSize: 14, fontFamily: T.font,
        }}>
          Browse all {QUESTIONS.length} signs (Study mode)
        </button>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// ROOT COMPONENT
// ══════════════════════════════════════════════════════════════════════════════

export default function RoadSignsQuiz({ onBack }) {
  // screen: "home" | "quiz" | "result" | "study"
  const [screen, setScreen] = useState("home");
  const [activeQuestions, setActiveQuestions] = useState([]);
  const [isTimed, setIsTimed] = useState(false);
  const [studyCat, setStudyCat] = useState(null);
  const [finalScore, setFinalScore] = useState(null);

  function handleStart(mode, catId, timed) {
    if (mode === "study") {
      setStudyCat(catId);
      setScreen("study");
      return;
    }
    let pool = catId ? QUESTIONS.filter(q => q.category === catId) : QUESTIONS;
    setActiveQuestions(shuffle(pool));
    setIsTimed(timed);
    setFinalScore(null);
    setScreen("quiz");
  }

  function handleFinish(score) {
    setFinalScore(score);
    setScreen("result");
  }

  return (
    <div style={{ minHeight: "100vh", background: T.bg, fontFamily: T.font, color: T.text }}>
      <FlagStripe />

      {/* Header */}
      <div style={{
        background: T.surface,
        borderBottom: `1px solid ${T.border}`,
        padding: "20px 20px 18px",
      }}>
        <div style={{ maxWidth: 680, margin: "0 auto", display: "flex", alignItems: "center", gap: 16 }}>
          <button
            onClick={onBack}
            style={{
              background: "none", border: `1px solid ${T.border}`,
              color: T.dim, padding: "6px 14px", borderRadius: 4,
              cursor: "pointer", fontSize: 13, fontFamily: T.font, flexShrink: 0,
            }}
          >
            ← All Drills
          </button>
          <div>
            <div style={{ color: T.blue, fontSize: 11, letterSpacing: 3, fontFamily: T.mono, marginBottom: 2 }}>
              DRILL 5 · ROAD SIGNS
            </div>
            <div style={{ color: T.white, fontSize: 20, fontWeight: 700, fontFamily: T.font }}>
              Know Your Signs
            </div>
          </div>
        </div>
      </div>

      {/* Screens */}
      {screen === "home" && <HomeScreen onStart={handleStart} />}

      {screen === "study" && (
        <StudyMode
          catId={studyCat}
          onBack={() => setScreen("home")}
        />
      )}

      {screen === "quiz" && (
        <div style={{ paddingTop: 24 }}>
          <QuizEngine
            questions={activeQuestions}
            onFinish={handleFinish}
            timed={isTimed}
          />
        </div>
      )}

      {screen === "result" && (
        <ResultScreen
          score={finalScore}
          total={activeQuestions.length}
          onRetry={() => {
            setFinalScore(null);
            setScreen("quiz");
            setActiveQuestions(q => shuffle([...q]));
          }}
          onHome={() => setScreen("home")}
        />
      )}

      <FlagStripe />
    </div>
  );
}
