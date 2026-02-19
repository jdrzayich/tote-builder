"use client";

import React, { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  LayoutGrid,
  Minus,
  Plus,
  Ruler,
  ShoppingCart,
  Trash2,
  Wrench,
  CheckCircle2,
  Mail,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ToastProvider, useToast } from "@/components/ui/toast";
import { clamp, money } from "@/components/ui/utils";

const BRAND = { name: "Rack Your Garage", product: "Tote Storage Builder" };

const ADDONS = [
  { id: "delivery", name: "Include Delivery" },
  { id: "totes", name: "Include Totes" },
  { id: "wheels", name: "Include Wheels" },
];


const PRICE_PER_BAY = 35; // <-- set your real $ per tote bay

const ADDON_PRICES = {
  delivery: 75,      // flat per rack
  wheels: 75,        // flat per rack
  totesPerBay: 12,   // per bay (this is the key change)
} as const;

const TOTES = {
  hdx27: {
    wStandard: 19.6, // along the wall when tote is "standard"
    wSideways: 28.5, // along the wall when tote is "sideways"
    h: 15.2,         // tote height
  },
  custom: {
    wStandard: 19.6,
    wSideways: 28.5,
    h: 15.2,
  },
} as const;

// --- Rack structure assumptions (inches) ---
// Tune these to match your actual rack design.
 
  const STRUCTURE = {
  postW: 1.5,        // vertical post/upright between columns
  outerSideW: 1.5,   // optional (not used yet)
  shelfH: 1.5,
  outerTopH: 1.5,    // optional (not used yet)
  outerBottomH: 1.5, // optional (not used yet)
  gapW: 1,
  gapH: 2,
} as const;

const CLEARANCE = {
  w: 1, // extra inches per tote horizontally
  h: 1, // extra inches per tote vertically
};


function tinyId() {
  return Math.random().toString(16).slice(2, 10);
}

function Progress({ step }: { step: "build" | "quote" | "request" }) {
  const items = [
    { k: "build", label: "Build" },
    { k: "quote", label: "Review" },
    { k: "request", label: "Request" },
  ] as const;
  return (
    <div className="flex items-center justify-between gap-2 text-xs">
      {items.map((it, idx) => {
        const active = items.findIndex((x) => x.k === step) >= idx;
        return (
          <div key={it.k} className="flex-1">
            <div className="flex items-center gap-2">
              <div className={`h-2 flex-1 rounded-full ${active ? "bg-ryg-navy" : "bg-neutral-200"}`} />
              {idx < items.length - 1 && (
                <div className={`h-2 w-2 rounded-full ${active ? "bg-ryg-navy" : "bg-neutral-200"}`} />
              )}
            </div>
            <div className={`mt-1 ${step === it.k ? "text-neutral-900" : "text-neutral-500"}`}>{it.label}</div>
          </div>
        );
      })}
    </div>
  );
}

function StepShell({
  title,
  subtitle,
  icon: Icon,
  children,
}: {
  title: string;
  subtitle?: string;
  icon: any;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.18 }}
      className="space-y-4"
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5 rounded-2xl border border-neutral-200 bg-white p-2 shadow-sm">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <div className="text-lg font-semibold leading-tight">{title}</div>
          {subtitle ? <div className="text-sm text-neutral-500">{subtitle}</div> : null}
        </div>
      </div>
      {children}
    </motion.div>
  );
}

function Preview({
  wallWidthIn,
  cols,
  rows,
}: {
  wallWidthIn: number;
  cols: number;
  rows: number;
}) {
  const pad = 18;

  // cell sizing (tote “bay”)
  const cellW = 34;
  const cellH = 26;

  // rack frame sizing
  const postW = 10;
  const beamH = 10;
  const shelfGap = 10;

  // inner area for totes
  const innerW = cols * cellW + (cols - 1) * shelfGap;
  const innerH = rows * cellH + (rows - 1) * shelfGap;

  // overall rack
  const rackW = innerW + postW * 2 + 20;
  const rackH = innerH + beamH * 2 + 20;

  // svg
  const W = Math.max(260, rackW + pad * 2);
  const H = Math.max(180, rackH + pad * 2 + 28);

  const x0 = (W - rackW) / 2;
  const y0 = (H - rackH) / 2 - 6;

  // helper: tote position (top-left)
  const toteX = (c: number) => x0 + postW + 10 + c * (cellW + shelfGap);
  const toteY = (r: number) => y0 + beamH + 10 + r * (cellH + shelfGap);

  return (
    <div className="w-full flex items-center justify-center">
      <svg width={W} height={H} className="drop-shadow-sm">
        <defs>
          {/* subtle background */}
          <radialGradient id="bgGlow" cx="50%" cy="35%" r="70%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#f4f4f5" />
          </radialGradient>

          {/* rack wood */}
          <linearGradient id="rackWood" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#c78a4a" />
          <stop offset="45%" stopColor="#a96c2d" />
          <stop offset="100%" stopColor="#7a4b1f" />
          </linearGradient>

          {/* rack highlight */}
          <linearGradient id="rackEdge" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.20" />
            <stop offset="35%" stopColor="#ffffff" stopOpacity="0.06" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0.25" />
          </linearGradient>

          {/* tote body */}
          <linearGradient id="toteBody" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1b1f24" />
            <stop offset="55%" stopColor="#111418" />
            <stop offset="100%" stopColor="#0b0d10" />
          </linearGradient>

          {/* lid */}
          <linearGradient id="lidYellow" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ffe45c" />
            <stop offset="55%" stopColor="#ffd21f" />
            <stop offset="100%" stopColor="#e6b800" />
          </linearGradient>

          {/* shadow */}
          <filter id="softShadow" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy="6" stdDeviation="6" floodColor="#000" floodOpacity="0.22" />
          </filter>

          {/* inner shadow-ish */}
          <filter id="innerGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy="1" stdDeviation="2" floodColor="#fff" floodOpacity="0.10" />
          </filter>
        </defs>

        {/* card */}
        <rect x="0" y="0" width={W} height={H} rx="18" fill="url(#bgGlow)" />
        <rect x="0" y="0" width={W} height={H} rx="18" fill="none" stroke="#111827" opacity="0.08" />

        {/* rack */}
        <g filter="url(#softShadow)">
          {/* outer rack body */}
          <rect x={x0} y={y0} width={rackW} height={rackH} rx="20" fill="url(#rackWood)" />
          {/* rack edge sheen */}
          <rect x={x0} y={y0} width={rackW} height={rackH} rx="20" fill="url(#rackEdge)" opacity="0.9" />

          {/* beams (top & bottom) */}
          <rect x={x0 + 10} y={y0 + 8} width={rackW - 20} height={beamH} rx="6" fill="#8b5a2b" />
          <rect x={x0 + 10} y={y0 + rackH - beamH - 8} width={rackW - 20} height={beamH} rx="6" fill="#8b5a2b" />

          {/* side posts */}
          <rect x={x0 + 10} y={y0 + 10} width={postW} height={rackH - 20} rx="6" fill="#8b5a2b" />
          <rect x={x0 + rackW - postW - 10} y={y0 + 10} width={postW} height={rackH - 20} rx="6" fill="#8b5a2b" />

          {/* shelves (one per row, under each row of totes) */}
          {Array.from({ length: rows }).map((_, r) => {
            const shelfY = toteY(r) + cellH + 6;
            return (
              <g key={`shelf-${r}`} opacity="0.65">
                <rect
                  x={x0 + postW + 10}
                  y={shelfY}
                  width={rackW - (postW + 10) * 2}
                  height={8}
                  rx="4"
                  fill="#0b0d10"
                />
                <rect
                  x={x0 + postW + 10}
                  y={shelfY}
                  width={rackW - (postW + 10) * 2}
                  height={2}
                  rx="2"
                  fill="#ffffff"
                  opacity="0.08"
                />
              </g>
            );
          })}

          {/* totes */}
          {Array.from({ length: rows }).map((_, r) =>
            Array.from({ length: cols }).map((__, c) => {
              const x = toteX(c);
              const y = toteY(r);

              return (
                <g key={`t-${r}-${c}`} filter="url(#innerGlow)">
                  {/* lid (slightly wider than body) */}
                  <rect x={x - 1} y={y - 2} width={cellW + 2} height={8} rx="4" fill="url(#lidYellow)" />
                  {/* lid lip */}
                  <rect x={x - 1} y={y + 4} width={cellW + 2} height={2} rx="2" fill="#000" opacity="0.18" />

                  {/* body */}
                  <rect x={x} y={y + 6} width={cellW} height={cellH - 6} rx="7" fill="url(#toteBody)" />

                  {/* subtle front highlight */}
                  <rect x={x + 2} y={y + 8} width={cellW - 4} height={3} rx="2" fill="#fff" opacity="0.05" />

                  {/* handle hint */}
                  <rect x={x + cellW * 0.25} y={y + cellH * 0.55} width={cellW * 0.5} height={4} rx="2" fill="#000" opacity="0.25" />
                </g>
              );
            })
          )}
        </g>

        {/* caption */}
      <text
        x={W / 2}
        y={H - 8}
        textAnchor="middle"
        fontSize="12"
        fill="#111827"
        opacity="0.65"
      >
        {cols} across • {rows} tall
      </text>
      </svg>
    </div>
  );
}



type QuoteItem = {
  id: string;
  title: string;
  meta: any;
  estTotal: number;
};

function BuilderApp() {
  const { toast } = useToast();
  const [step, setStep] = useState<"build" | "quote" | "request">("build");

  const [sizeMode, setSizeMode] = useState<"max" | "manual">("max");
  const [manualCols, setManualCols] = useState(1);
  const [manualRows, setManualRows] = useState(1);

  const [wallWidthIn, setWallWidthIn] = useState<number>(118);
  const [wallHeightIn, setWallHeightIn] = useState<number>(96);
  
  const [toteType, setToteType] = useState<"hdx27" | "custom">("hdx27");
  const [orientation, setOrientation] = useState<"standard" | "sideways">("standard");
  
  const [addons, setAddons] = useState<Record<string, boolean>>({
  delivery: true,  // default on/off — your choice
  totes: false,
  wheels: false,
});

  const [contact, setContact] = useState({ first: "", last: "", email: "", phone: "", zip: "" });
  const [preferredDate, setPreferredDate] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);

  const maxFit = useMemo(() => {
  const tote = toteType === "custom" ? TOTES.custom : TOTES.hdx27;

  // orientation changes the tote width-along-wall
  const toteW = orientation === "standard" ? tote.wStandard : tote.wSideways;
  const toteH = tote.h;

  const usableW = clamp(Number(wallWidthIn) || 0, 24, 360);
  const usableH = clamp(Number(wallHeightIn) || 0, 24, 180); // tune max as you want

  // Per-tote "cell" size including structure + gaps
  // Width: tote + gap + (structure share)
  // If you have posts between each tote column, you can model like:
  // cols * toteW + (cols-1)*gapW + (cols+1)*postW <= usableW
  // We'll compute cols by brute force so it's accurate and simple.

  let bestCols = 0;
  for (let cols = 1; cols <= 20; cols++) {
    const neededW = cols * toteW + (cols - 1) * STRUCTURE.gapW + (cols + 1) * STRUCTURE.postW;
    if (neededW <= usableW) bestCols = cols;
  }

  // Height: rows * toteH + rows*shelfH + (rows+1)*gapH <= usableH
  // (gapH as top/bottom clearance between tote and rails)
  let bestRows = 0;
  for (let rows = 1; rows <= 20; rows++) {
    const neededH = rows * toteH + rows * STRUCTURE.shelfH + (rows + 1) * STRUCTURE.gapH;
    if (neededH <= usableH) bestRows = rows;
  }

 // HARD CAP: 8' vertical framing limit
  const MAX_ROWS = 5;

  return {
    cols: bestCols,
    rows: Math.min(bestRows, MAX_ROWS),
    toteW,
    toteH,
  };
}, [wallWidthIn, wallHeightIn, toteType, orientation]);

  const selectedCols =
  sizeMode === "manual" ? clamp(manualCols, 1, maxFit.cols || 1) : maxFit.cols;

  const selectedRows =
  sizeMode === "manual" ? clamp(manualRows, 1, maxFit.rows || 1) : maxFit.rows;

  const totalBays = selectedCols * selectedRows;

  const rackDimensions = useMemo(() => {
  if (selectedCols === 0 || selectedRows === 0) {
    return { width: 0, height: 0 };
  }

  const tote = toteType === "custom" ? TOTES.custom : TOTES.hdx27;
  const toteW = orientation === "standard" ? tote.wStandard : tote.wSideways;
  const toteH = tote.h;

  const width =
    selectedCols * toteW +
    (selectedCols - 1) * STRUCTURE.gapW +
    (selectedCols + 1) * STRUCTURE.postW;

  const height =
    selectedRows * toteH +
    selectedRows * STRUCTURE.shelfH +
    (selectedRows + 1) * STRUCTURE.gapH;

  return {
    width: Math.round(width),
    height: Math.round(height),
  };
}, [selectedCols, selectedRows, toteType, orientation]);

  const addonTotal = useMemo(() => {
  let total = 0;

  if (addons.delivery) total += ADDON_PRICES.delivery;
  if (addons.wheels) total += ADDON_PRICES.wheels;

  // totes is priced per bay
  if (addons.totes) total += totalBays * ADDON_PRICES.totesPerBay;

  return total;
}, [addons.delivery, addons.wheels, addons.totes, totalBays]);

  const estTotal = useMemo(() => {
  const base = totalBays * PRICE_PER_BAY;
  return base + addonTotal;
}, [totalBays, addonTotal]);

  

  const [quoteItems, setQuoteItems] = useState<QuoteItem[]>([]);
  const quoteEstTotal = useMemo(() => quoteItems.reduce((a, b) => a + b.estTotal, 0), [quoteItems]);

  function addToQuote() {
  const item: QuoteItem = {
    id: tinyId(),
    title: `Tote rack — ${selectedCols} × ${selectedRows} bays`,
    estTotal,
    meta: {
      wallWidthIn,
      wallHeightIn,
      toteType,
      orientation,
      cols: selectedCols,
      rows: selectedRows,
      totalBays,
      addons: Object.keys(addons).filter((k) => addons[k]),
    },
  };

  setQuoteItems((prev) => [item, ...prev]);
  toast({ title: "Added to quote", description: `${item.title} • Est. ${money(estTotal)}` });
  setStep("quote");
}

  function removeItem(id: string) {
    setQuoteItems((prev) => prev.filter((x) => x.id !== id));
  }

  async function submitQuoteRequest() {
    if (!contact.first || !contact.last || !contact.email || !contact.phone || !contact.zip) {
      toast({ title: "Missing info", description: "Please add name, email, phone, and ZIP." });
      return;
    }
    if (quoteItems.length === 0) {
      toast({ title: "No items", description: "Add at least one configuration to your quote." });
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        source: "tote-builder-v1",
        createdAt: new Date().toISOString(),
        contact,
        preferredDate: preferredDate || null,
        notes,
        estimate: quoteEstTotal,
        items: quoteItems,
      };

      const webhook = process.env.NEXT_PUBLIC_QUOTE_WEBHOOK_URL;

      if (webhook) {
        const res = await fetch(webhook, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error(`Webhook error ${res.status}`);
      } else {
        console.log("QUOTE_REQUEST_PAYLOAD", payload);
      }

      toast({ title: "Request sent", description: "We got it. We'll follow up with a custom quote." });
    } catch (e: any) {
      toast({ title: "Submit failed", description: e?.message || "Please try again." });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen">
      <div className="mx-auto w-full max-w-md px-4 py-5">
        <div className="sticky top-0 z-40 -mx-4 mb-4 border-b border-neutral-200 bg-white/85 px-4 py-3 backdrop-blur">
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-3">
      <img
        src="/logo.png"
        alt="Rack Your Garage"
        className="h-8 object-contain"
      />
      <div className="leading-tight">
        <div className="text-sm font-semibold text-ryg-navy">{BRAND.name}</div>
        <div className="text-xs text-neutral-500">{BRAND.product}</div>
      </div>
    </div>

    <div className="flex items-center gap-2">
      <Badge className="rounded-xl" variant="secondary">
        Est. {money(step === "build" ? estTotal : quoteEstTotal)}
      </Badge>
      <Button
        size="icon"
        variant="outline"
        onClick={() => setStep("quote")}
        aria-label="Open quote"
      >
        <ShoppingCart className="h-4 w-4" />
      </Button>
    </div>
  </div>

  <div className="mt-3">
    <Progress step={step} />
  </div>
</div>


        <AnimatePresence mode="wait">
          {step === "build" && (
            <StepShell key="build" title="Configure Your Tote Storage" icon={LayoutGrid}>
              <Card>
                <CardHeader>
                  <CardTitle>Wall Dimensions</CardTitle>
                  <CardDescription>Enter the width and height of the area you would like your shelving and we’ll suggest how many totes fit.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>Wall width (in)</Label>
                      <div className="relative">
                        <Ruler className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                        <Input className="pl-9" value={wallWidthIn} onChange={(e) => setWallWidthIn(Number(e.target.value))} inputMode="numeric" />
                      </div>
                      <div className="text-xs text-neutral-500">
                        <div className="text-xs text-neutral-500">
                          Max fit suggests {maxFit.cols} across
                          {sizeMode === "manual" ? (
                            <div className="mt-1 text-xs text-neutral-500">
                              Using manual size: {selectedCols} across
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </div>
                   <div className="space-y-2">
                    <Label>Wall height (in)</Label>
                    <Input
                    type="number"
                    value={wallHeightIn}
                    onChange={(e) => setWallHeightIn(Number(e.target.value))}
                     />
                    <div className="text-xs text-neutral-500">
                  </div>
              </div>

                  </div>

              

                  {/* NEW: Tote details section goes here */}
<div className="space-y-2">
  <div className="text-sm font-semibold">Tote details</div>
  <div className="text-sm text-neutral-600">
  </div>

  <div className="space-y-2">
    <Label>Tote type</Label>
<select
  className="h-10 w-full rounded-2xl border border-neutral-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-ryg-blue/30"
  value={toteType}
  onChange={(e) => setToteType(e.target.value as "hdx27" | "custom")}
>
  <option value="hdx27">HDX 27-gallon totes</option>
  <option value="custom">Custom size / brand</option>
    </select>
  </div>
</div>
                  <Separator />

                  
                  {/* NEW: Tote Orientation section */}
                  <div className="space-y-2">
                    <div className="text-sm font-semibold">Tote orientation</div>
                    <div className="text-sm text-neutral-600">
                      Choose how your totes will face on the rack.
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                     <button
                      type="button"
                      onClick={() => setOrientation("standard")}
                      className={`rounded-2xl border p-3 text-left ${
                        orientation === "standard"
                          ? "border-ryg-navy bg-ryg-blue/15"
                          : "border-neutral-200 bg-white"
                      }`}
                    >
                        <div className="text-sm font-semibold">Standard</div>
                        <div className="text-xs text-neutral-600">30&quot; deep</div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setOrientation("sideways")}
                        className={`rounded-2xl border p-3 text-left ${
                          orientation === "sideways"
                            ? "border-ryg-navy bg-ryg-blue/15"
                          : "border-neutral-200 bg-white"
                         }`}
                        >

                        <div className="text-sm font-semibold">Sideways</div>
                        <div className="text-xs text-neutral-600">20&quot; deep</div>
                      </button>
                    </div>
                  </div>

                  <Separator />

                     {/* MAX FIT RESULT */}
                    <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-3">
                      <div className="text-xs text-neutral-500">Maximum Tote Capacity</div>

                      <div className="text-sm font-semibold">
                      {maxFit.cols === 0 || maxFit.rows === 0 ? (
                        <span className="text-red-600">
                          Not enough space for this configuration.
                        </span>
                      ) : (
                        <>
                          {selectedCols} totes wide by {selectedRows} totes tall
                        </>
)}
                  </div>

  {maxFit.cols === 0 || maxFit.rows === 0 ? null : (
    <div className="mt-1 text-xs text-neutral-500">
      Based on{" "}
      {orientation === "standard"
        ? `${maxFit.toteW}" width (30" deep)`
        : `${maxFit.toteW}" width (20" deep)`}{" "}
      and {maxFit.toteH}" height
    </div>
  )}
</div>

                  <Separator />

                  {/* SIZE MODE: Max vs Manual */}
<div className="space-y-2">
  <div className="text-sm font-semibold">Rack size</div>
  <div className="text-sm text-neutral-600">
    Choose max capacity, or set a smaller rack size.
  </div>

  <div className="grid grid-cols-2 gap-2">
    <button
      type="button"
      onClick={() => setSizeMode("max")}
      className={`rounded-2xl border p-3 text-left ${
        sizeMode === "max"
            ? "border-ryg-navy bg-ryg-blue/15"
            : "border-neutral-200 bg-white"
      }`}
    >
      <div className="text-sm font-semibold">Max fit</div>
      <div className="text-xs text-neutral-600">
        {maxFit.cols} wide × {maxFit.rows} tall
      </div>
    </button>

    <button
      type="button"
      onClick={() => setSizeMode("manual")}
      className={`rounded-2xl border p-3 text-left ${
        sizeMode === "manual"
          ? "border-ryg-navy"
          : "border-neutral-200 bg-white"
      }`}
    >
      <div className="text-sm font-semibold">Manual</div>
      <div className="text-xs text-neutral-600">
        Pick your size
      </div>
    </button>
  </div>

  {sizeMode === "manual" && (
    <div className="grid grid-cols-2 gap-3">
      <div className="space-y-2">
        <Label>Totes wide</Label>
        <Input
          type="number"
          value={manualCols}
          min={1}
          max={maxFit.cols || 1}
          onChange={(e) => setManualCols(Number(e.target.value))}
        />
        <div className="text-xs text-neutral-500">
          Max: {maxFit.cols}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Totes tall</Label>
        <Input
          type="number"
          value={manualRows}
          min={1}
          max={maxFit.rows || 1}
          onChange={(e) => setManualRows(Number(e.target.value))}
        />
        <div className="text-xs text-neutral-500">
          Max: {maxFit.rows}
        </div>
      </div>
    </div>
  )}

  {maxFit.cols > 0 && maxFit.rows > 0 ? (
    <div className="text-xs text-neutral-500">
      Selected: {selectedCols} wide × {selectedRows} tall ({totalBays} bays)
    </div>
  ) : null}
</div>

<Separator />


                 {/* OPTIONS */}
<div className="space-y-2">
  <Label>Options (for your quote)</Label>
  <div className="space-y-2">
    {ADDONS.map((a) => (
      <div key={a.id} className="flex items-center justify-between rounded-2xl border border-neutral-200 p-3">
        <div className="flex items-center gap-2">
          <Checkbox
            checked={!!addons[a.id]}
            onChange={(v) => setAddons((prev) => ({ ...prev, [a.id]: v }))}
          />
          <div className="text-sm">{a.name}</div>
        </div>
        {a.id === "totes" ? (
          <div className="text-xs text-neutral-500">
            {totalBays} totes × ${ADDON_PRICES.totesPerBay}
          </div>
) : (
  <div className="text-xs text-neutral-500">flat add-on</div>
)}

      </div>
    ))}
  </div>
</div>

<Separator />

{/* PRICE ESTIMATE (LAST) */}
<div className="space-y-2">
  <Label>Price estimate</Label>
  <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-3">
    <div className="text-xs text-neutral-500">Estimated total</div>
    <div className="text-lg font-semibold">{money(estTotal)}</div>
    <div className="mt-1 text-xs text-neutral-500">
      {selectedRows} totes tall × {selectedCols} totes wide
    </div>
  </div>
</div>


                  <Separator />

                    <Preview wallWidthIn={wallWidthIn} cols={selectedCols} rows={selectedRows} />

                  <div className="mt-2 text-center text-sm text-neutral-600">
                    Approx. {rackDimensions.width}" W × {rackDimensions.height}" H
                  </div>

                  <div className="sticky bottom-3">
                    <div className="rounded-3xl border border-neutral-200 bg-white/90 p-3 shadow-lg backdrop-blur">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-xs text-neutral-500">Estimated Total</div>
                          <div className="text-lg font-semibold">{money(estTotal)}</div>
                        </div>
                       <Button
                          onClick={addToQuote}
                          className="bg-ryg-orange text-white hover:opacity-90"
                        >
                          Add to quote <ArrowRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </StepShell>
          )}

          {step === "quote" && (
            <StepShell key="quote" title="Review your quote" subtitle="Remove items or add another configuration." icon={Wrench}>
              <div className="flex items-center justify-between gap-2">
                <Button variant="outline" onClick={() => setStep("build")}>
                  <ArrowLeft className="h-4 w-4" /> Back
                </Button>
                <Button onClick={() => setStep("request")} disabled={quoteItems.length === 0}>
                  Request quote <ArrowRight className="h-4 w-4" />
                </Button>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Items</CardTitle>
                  <CardDescription>{quoteItems.length ? `${quoteItems.length} item(s)` : "No items yet — add one first."}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {quoteItems.map((it) => (
                    <div key={it.id} className="rounded-3xl border border-neutral-200 p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="font-semibold leading-tight">{it.title}</div>
                          <div className="mt-1 text-xs text-neutral-500">
                            {it.meta.wallWidthIn}" wide • {it.meta.wallHeightIn}" high •{" "}
                            {it.meta.cols} across • {it.meta.rows} tall • {it.meta.totalBays} bays
                            {it.meta.toteType === "custom" ? "Custom tote" : "HDX 27-gal"} •{" "}
                            {it.meta.orientation === "standard"
                              ? 'Standard (30")'
                              : 'Sideways (20")'}
                          </div>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {it.meta.addons.map((a: string) => (
                              <Badge key={a} variant="outline">
                                {ADDONS.find((x) => x.id === a)?.name || a}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <div className="text-sm font-semibold">Est. {money(it.estTotal)}</div>
                          <Button size="icon" variant="ghost" onClick={() => removeItem(it.id)} aria-label="Remove">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="text-sm text-neutral-500">Estimated hardware total</div>
                    <div className="text-xl font-semibold">{money(quoteEstTotal)}</div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" onClick={() => setStep("build")}>Add more</Button>
                    <Button onClick={() => setStep("request")} disabled={quoteItems.length === 0}>Request quote</Button>
                  </div>
                </CardContent>
              </Card>
            </StepShell>
          )}

          {step === "request" && (
            <StepShell key="request" title="Request your custom quote" subtitle="We’ll confirm fit and send a final price." icon={Mail}>
              <div className="flex items-center justify-between gap-2">
                <Button variant="outline" onClick={() => setStep("quote")}>
                  <ArrowLeft className="h-4 w-4" /> Back
                </Button>
                <Badge variant="secondary">Est. {money(quoteEstTotal)}</Badge>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Your info</CardTitle>
                  <CardDescription>So we can send your quote.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>First name</Label>
                      <Input value={contact.first} onChange={(e) => setContact((c) => ({ ...c, first: e.target.value }))} />
                    </div>
                    <div className="space-y-2">
                      <Label>Last name</Label>
                      <Input value={contact.last} onChange={(e) => setContact((c) => ({ ...c, last: e.target.value }))} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input type="email" value={contact.email} onChange={(e) => setContact((c) => ({ ...c, email: e.target.value }))} />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>Phone</Label>
                      <Input value={contact.phone} onChange={(e) => setContact((c) => ({ ...c, phone: e.target.value }))} />
                    </div>
                    <div className="space-y-2">
                      <Label>ZIP</Label>
                      <Input value={contact.zip} onChange={(e) => setContact((c) => ({ ...c, zip: e.target.value }))} />
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <CalendarDays className="h-4 w-4" /> Preferred install date (optional)
                    </Label>
                    <Input type="date" value={preferredDate} onChange={(e) => setPreferredDate(e.target.value)} />
                    <div className="text-xs text-neutral-500">We’ll confirm availability after we review your garage.</div>
                  </div>

                  <div className="space-y-2">
                    <Label>Notes (optional)</Label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="min-h-[90px] w-full rounded-2xl border border-neutral-200 bg-white p-3 text-sm outline-none focus:ring-2 focus:ring-ryg-blue/30"
                      placeholder="Anything we should know? Garage door tracks, sprinklers, lighting, etc."
                    />
                  </div>

                  <Button className="w-full" size="lg" onClick={submitQuoteRequest} disabled={submitting}>
                    {submitting ? "Sending..." : "Request Quote"} <ArrowRight className="h-4 w-4" />
                  </Button>

                  <div className="text-xs text-neutral-500">
                    To connect submissions, set{" "}
                    <span className="font-mono">NEXT_PUBLIC_QUOTE_WEBHOOK_URL</span> in Vercel → Settings → Environment Variables.
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-4 space-y-3">
                  <div className="rounded-3xl border border-ryg-navy">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="mt-0.5 h-5 w-5 text-ryg-navy" />
                      <div>
                        <div className="font-semibold">What happens next</div>
                        <div className="mt-1 text-sm text-neutral-600">
                          We’ll review your info, confirm the right rack sizing for your tote type, and send a final quote.
                        </div>
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full" onClick={() => setStep("build")}>Start a new build</Button>
                </CardContent>
              </Card>
            </StepShell>
          )}
        </AnimatePresence>

        <div className="mt-6 text-center text-xs text-neutral-500">v1 prototype • hosted on Vercel • embedded in WordPress via iframe</div>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <ToastProvider>
      <BuilderApp />
    </ToastProvider>
  );
}
