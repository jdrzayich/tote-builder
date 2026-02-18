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

type Rack = { id: string; name: string; size: string; price: number; unitW: number };
const RACKS: Rack[] = [
  { id: "rack-4", name: "Overhead Tote Rack", size: "4 Tote", price: 399, unitW: 48 },
  { id: "rack-6", name: "Overhead Tote Rack", size: "6 Tote", price: 499, unitW: 72 },
  { id: "rack-8", name: "Overhead Tote Rack", size: "8 Tote", price: 599, unitW: 96 },
];

const ADDONS = [
  { id: "install", name: "Include Delivery" },
  { id: "remove", name: "Include Totes" },
];

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
              <div className={`h-2 flex-1 rounded-full ${active ? "bg-emerald-600" : "bg-neutral-200"}`} />
              {idx < items.length - 1 && (
                <div className={`h-2 w-2 rounded-full ${active ? "bg-emerald-600" : "bg-neutral-200"}`} />
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

function Preview({ wallWidthIn, cols }: { wallWidthIn: number; cols: number }) {
  const rows = 2;
  const cellW = 18;
  const cellH = 14;
  const pad = 10;
  const w = pad * 2 + cols * cellW;
  const h = pad * 2 + rows * cellH;
  const W = Math.max(220, w);
  const H = Math.max(140, h);
  return (
    <div className="w-full flex items-center justify-center">
      <svg width={W} height={H} className="drop-shadow-sm">
        <rect x="0" y="0" width={W} height={H} rx="18" fill="white" />
        <g transform={`translate(${(W - w) / 2}, ${(H - h) / 2})`}>
          <rect x="0" y="0" width={w} height={h} rx="14" fill="#0b1220" opacity="0.06" />
          <rect x="0" y="0" width={w} height={h} rx="14" fill="none" stroke="#111827" opacity="0.15" />
          {Array.from({ length: rows }).map((_, r) =>
            Array.from({ length: cols }).map((__, c) => {
              const x = pad + c * cellW;
              const y = pad + r * cellH;
              return (
                <g key={`${r}-${c}`}>
                  <rect x={x} y={y} width={cellW - 2} height={cellH - 2} rx="4" fill="#111827" opacity="0.06" />
                  <rect x={x} y={y} width={cellW - 2} height={cellH - 2} rx="4" fill="none" stroke="#111827" opacity="0.15" />
                </g>
              );
            })
          )}
          <text x={w / 2} y={h + 22} textAnchor="middle" fontSize="12" fill="#111827" opacity="0.65">
            {wallWidthIn}\" run • {cols} across
          </text>
        </g>
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

  const [wallWidthIn, setWallWidthIn] = useState<number>(118);
  const [wallHeightIn, setWallHeightIn] = useState<number>(96);
  
  const [toteType, setToteType] = useState<"hdx27" | "custom">("hdx27");
  const [orientation, setOrientation] = useState<"standard" | "sideways">("standard");
  
  const [rackId, setRackId] = useState<string>("rack-6");
  const [qty, setQty] = useState<number>(1);
  const [addons, setAddons] = useState<Record<string, boolean>>({
    install: true,
    remove: false,
  });

  const [contact, setContact] = useState({ first: "", last: "", email: "", phone: "", zip: "" });
  const [preferredDate, setPreferredDate] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);

  const selected = useMemo(() => RACKS.find((c) => c.id === rackId) || RACKS[0], [rackId]);

  const autoFit = useMemo(() => {
    const unitW = selected.unitW;
    const usable = clamp(Number(wallWidthIn) || 0, 24, 360);
    const cols = clamp(Math.floor(usable / unitW), 1, 10);
    const used = cols * unitW;
    const rem = usable - used;
    return { usable, cols, used, rem };
  }, [wallWidthIn, selected.unitW]);

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


  const estTotal = useMemo(() => (Number(qty) || 0) * selected.price, [qty, selected.price]);

  const [quoteItems, setQuoteItems] = useState<QuoteItem[]>([]);
  const quoteEstTotal = useMemo(() => quoteItems.reduce((a, b) => a + b.estTotal, 0), [quoteItems]);

  function addToQuote() {
    const item: QuoteItem = {
      id: tinyId(),
      title: `${selected.name} — ${selected.size}`,
      estTotal,
      meta: {
        wallWidthIn: autoFit.usable,
        wallHeightIn,
        autoCols: autoFit.cols,
        toteType,
        orientation,
        qty: Number(qty) || 0,
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
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-2xl bg-emerald-600 text-white grid place-items-center font-bold">R</div>
              <div className="leading-tight">
                <div className="text-sm font-semibold">{BRAND.name}</div>
                <div className="text-xs text-neutral-500">{BRAND.product}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="rounded-xl" variant="secondary">
                Est. {money(step === "build" ? estTotal : quoteEstTotal)}
              </Badge>
              <Button size="icon" variant="outline" onClick={() => setStep("quote")} aria-label="Open quote">
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
            <StepShell key="build" title="Configure your tote storage" subtitle="Enter basic dimensions and pick a tote size." icon={LayoutGrid}>
              <Card>
                <CardHeader>
                  <CardTitle>Auto-fit wall</CardTitle>
                  <CardDescription>Enter wall width and height; we’ll suggest how many totes fit.</CardDescription>
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
                        Suggests {autoFit.cols} across • uses {autoFit.used}\" • remainder {Math.max(0, Math.round(autoFit.rem))}\"
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
                      Used to confirm vertical clearance for rack layout.
                  </div>
              </div>

                  </div>

              

                  {/* NEW: Tote details section goes here */}
<div className="space-y-2">
  <div className="text-sm font-semibold">Tote details</div>
  <div className="text-sm text-neutral-600">
    Helps us validate spacing for your quote.
  </div>

  <div className="space-y-2">
    <Label>Tote type</Label>
<select
  className="h-10 w-full rounded-2xl border border-neutral-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-emerald-200"
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
                            ? "border-emerald-600 bg-emerald-50"
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
                            ? "border-emerald-600 bg-emerald-50"
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
                      <div className="text-xs text-neutral-500">Max fit</div>

                      <div className="text-sm font-semibold">
                      {maxFit.cols === 0 || maxFit.rows === 0 ? (
                        <span className="text-red-600">
                          Not enough space for this configuration.
                        </span>
                      ) : (
                        <>
                          {maxFit.cols} totes wide by {maxFit.rows} totes tall
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


                  <div className="space-y-2">
                    <Label>Rack size</Label>
                    <select
                      className="h-10 w-full rounded-2xl border border-neutral-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-emerald-200"
                      value={rackId}
                      onChange={(e) => setRackId(e.target.value)}
                    >
                      {RACKS.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} — {c.size} (Est. {money(c.price)})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>Quantity</Label>
                      <div className="flex items-center gap-2">
                        <Button type="button" variant="outline" size="icon" onClick={() => setQty((q) => clamp((Number(q) || 0) - 1, 1, 99))}>
                          <Minus className="h-4 w-4" />
                        </Button>
                        <Input value={qty} onChange={(e) => setQty(Number(e.target.value))} inputMode="numeric" className="text-center" />
                        <Button type="button" variant="outline" size="icon" onClick={() => setQty((q) => clamp((Number(q) || 0) + 1, 1, 99))}>
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="text-xs text-neutral-500">Unit width: {selected.unitW}\"</div>
                    </div>

                    <div className="space-y-2">
                      <Label>Estimated</Label>
                      <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-3">
                        <div className="text-xs text-neutral-500">Rack estimate (hardware only)</div>
                        <div className="text-lg font-semibold">{money(estTotal)}</div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label>Options (for your quote)</Label>
                    <div className="space-y-2">
                      {ADDONS.map((a) => (
                        <div key={a.id} className="flex items-center justify-between rounded-2xl border border-neutral-200 p-3">
                          <div className="flex items-center gap-2">
                            <Checkbox checked={!!addons[a.id]} onChange={(v) => setAddons((prev) => ({ ...prev, [a.id]: v }))} />
                            <div className="text-sm">{a.name}</div>
                          </div>
                          <div className="text-xs text-neutral-500">priced in final quote</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  <Preview wallWidthIn={autoFit.usable} cols={autoFit.cols} />

                  <div className="sticky bottom-3">
                    <div className="rounded-3xl border border-neutral-200 bg-white/90 p-3 shadow-lg backdrop-blur">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-xs text-neutral-500">Estimated hardware total</div>
                          <div className="text-lg font-semibold">{money(estTotal)}</div>
                        </div>
                        <Button onClick={addToQuote}>
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
                            {it.meta.autoCols} across • qty {it.meta.qty} •{" "}
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
                      className="min-h-[90px] w-full rounded-2xl border border-neutral-200 bg-white p-3 text-sm outline-none focus:ring-2 focus:ring-emerald-200"
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
                  <div className="rounded-3xl border border-neutral-200 bg-emerald-50 p-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-700" />
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
