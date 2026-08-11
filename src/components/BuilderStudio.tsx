import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "motion/react";
import { useDropzone } from "react-dropzone";
import confetti from "canvas-confetti";
import { toast } from "sonner";
import {
  Check,
  Copy,
  Download,
  Focus,
  ImagePlus,
  RefreshCw,
  Share2,
  Sparkles,
} from "lucide-react";
import {
  BADGE_H,
  BADGE_W,
  FRAME_S,
  defaultAdjustments,
  defaultStamp,
  renderBadge,
  renderFrame,
  type Adjustments,
  type BadgeStyle,
  type CardOptions,
  type CornerStyle,
  type FontKey,
  type PatternKey,
  type StampConfig,
  type StampStyle,
  type ThemeKey,
} from "@/lib/card-renderer";
import { makeBuilderId, pickTitle } from "@/lib/builder-titles";

type Mode = "badge" | "frame";

const GRADIENTS: { label: string; frame: string; accent: string }[] = [
  { label: "Goa Sunset", frame: "#FF7A45", accent: "#FFC94F" },
  { label: "Arabian Sea", frame: "#00D8D5", accent: "#3BE8B0" },
  { label: "Bougainvillea", frame: "#FF5694", accent: "#FFA1C9" },
  { label: "Azulejo", frame: "#2E7BE8", accent: "#8FD3FF" },
  { label: "Feni Gold", frame: "#E0A33A", accent: "#FFE9A8" },
  { label: "Palm Night", frame: "#1FA97F", accent: "#C9F5D9" },
];

const THEME_KEYS: ThemeKey[] = [
  "palmnight", "sunset", "seaside", "azulejo", "sand", "beach", "monsoon", "neon", "terracotta",
];
const THEME_LABELS: Record<ThemeKey, string> = {
  palmnight: "Carbon black",
  sunset: "Sunset plum",
  seaside: "Midnight sea",
  azulejo: "Azulejo white",
  sand: "Palolem sand",
  beach: "Beach shack",
  monsoon: "Monsoon green",
  neon: "Vagator neon",
  terracotta: "Terracotta",
};
const CORNERS: CornerStyle[] = ["rounded", "soft", "sharp", "cut"];
const PATTERNS: PatternKey[] = ["tiles", "dots", "waves", "palms", "none"];
const BADGE_STYLES: BadgeStyle[] = ["glass", "solid", "outline"];
const FONTS: FontKey[] = ["display", "mono", "serif"];
const STAMP_STYLES: StampStyle[] = ["round", "double", "square", "none"];
const STAMP_STYLE_LABELS: Record<StampStyle, string> = {
  round: "Classic ring",
  double: "Double ring",
  square: "Boxed seal",
  none: "No stamp",
};

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`label-caps rounded-full px-3.5 py-2 text-[9px] transition-all duration-300 ${
        active
          ? "bg-gradient-to-r from-sunset to-primary text-primary-foreground shadow-[0_8px_24px_-10px_rgba(255,122,69,0.9)]"
          : "glass text-muted-foreground hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <label className="block">
      <span className="label-caps text-[9px] text-muted-foreground">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="glass mt-2 w-full rounded-xl px-4 py-3 font-display text-sm outline-none transition-shadow placeholder:font-mono placeholder:text-xs placeholder:text-muted-foreground/60 focus:ring-2 focus:ring-primary/60"
      />
    </label>
  );
}

function Range({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  suffix,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
  suffix?: string;
}) {
  return (
    <label className="block">
      <span className="flex items-center justify-between">
        <span className="label-caps text-[9px] text-muted-foreground">{label}</span>
        <span className="font-mono text-[10px] text-cyan">
          {value}
          {suffix ?? ""}
        </span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-2 h-1.5 w-full cursor-pointer appearance-none rounded-full bg-white/15 accent-[oklch(0.71_0.185_40)]"
      />
    </label>
  );
}

export function BuilderStudio() {
  const previewRef = useRef<HTMLCanvasElement>(null);
  const [mode, setMode] = useState<Mode>("badge");
  const [photo, setPhoto] = useState<HTMLImageElement | null>(null);
  const [qr, setQr] = useState<HTMLImageElement | null>(null);
  const [copied, setCopied] = useState(false);
  const [fontsReady, setFontsReady] = useState(false);

  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [title, setTitle] = useState<string>(() => pickTitle());
  const [builderId] = useState(() => makeBuilderId());

  const [gradient, setGradient] = useState(0);
  const [theme, setTheme] = useState<ThemeKey>("palmnight");
  const [glow, setGlow] = useState(65);
  const [corner, setCorner] = useState<CornerStyle>("rounded");
  const [pattern, setPattern] = useState<PatternKey>("tiles");
  const [badgeStyle, setBadgeStyle] = useState<BadgeStyle>("glass");
  const [font, setFont] = useState<FontKey>("display");
  const [adj, setAdj] = useState<Adjustments>(defaultAdjustments);
  const [blurBackdrop, setBlurBackdrop] = useState(true);
  const [transparent, setTransparent] = useState(false);
  const [stamp, setStamp] = useState<StampConfig>(defaultStamp);

  useEffect(() => {
    document.fonts?.ready.then(() => setFontsReady(true));
  }, []);

  const options: CardOptions = useMemo(
    () => ({
      name,
      role,
      title,
      builderId,
      photo,
      theme,
      frameColor: (GRADIENTS[gradient] ?? GRADIENTS[0]!).frame,
      accentColor: (GRADIENTS[gradient] ?? GRADIENTS[0]!).accent,
      glow,
      corner,
      pattern,
      badgeStyle,
      font,
      adjustments: adj,
      blurBackdrop,
      transparent,
      stamp,
    }),
    [
      name, role, title, builderId, photo, theme, gradient, glow, corner,
      pattern, badgeStyle, font, adj, blurBackdrop, transparent, stamp,
    ],
  );


  useEffect(() => {
    const c = previewRef.current;
    if (!c) return;
    const id = requestAnimationFrame(() => {
      mode === "badge" ? renderBadge(c, options) : renderFrame(c, options);
    });
    return () => cancelAnimationFrame(id);
  }, [options, mode, fontsReady]);

  const smartCenter = useCallback(async (img: HTMLImageElement) => {
    const Detector = (window as unknown as { FaceDetector?: new (o?: unknown) => { detect: (i: HTMLImageElement) => Promise<{ boundingBox: DOMRectReadOnly }[]> } }).FaceDetector;
    if (!Detector) return;
    try {
      const faces = await new Detector({ fastMode: true }).detect(img);
      if (!faces?.length) return;
      const b = faces[0]!.boundingBox;
      const fx = (b.x + b.width / 2) / img.width - 0.5;
      const fy = (b.y + b.height / 2) / img.height - 0.5;
      const ar = img.width / img.height;
      setAdj((a) => ({
        ...a,
        offsetX: -fx * (ar >= 1 ? ar : 1) * 2,
        offsetY: -fy * (ar < 1 ? 1 / ar : 1) * 2,
      }));
      toast.success("Face detected — photo auto-centered");
    } catch {
      /* detection unavailable */
    }
  }, []);

  const loadFile = useCallback(
    (file: File) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        setPhoto(img);
        setAdj(defaultAdjustments);
        void smartCenter(img);
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        toast.error("That format couldn't be decoded. Try a JPG or PNG export.");
      };
      img.src = url;
    },
    [smartCenter],
  );

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    accept: {
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
      "image/heic": [".heic"],
      "image/heif": [".heif"],
      "image/webp": [".webp"],
    },
    maxFiles: 1,
    noClick: true,
    noKeyboard: true,
    onDrop: (files) => files[0] && loadFile(files[0]),
  });

  const exportCanvas = () => {
    const c = document.createElement("canvas");
    mode === "badge" ? renderBadge(c, options) : renderFrame(c, options);
    return c;
  };

  const download = () => {
    const url = exportCanvas().toDataURL("image/png");
    const a = document.createElement("a");
    a.download = `hhgoa-2026-${mode}-${(name || "builder").toLowerCase().replace(/\s+/g, "-")}.png`;
    a.href = url;
    a.click();
    confetti({
      particleCount: 140,
      spread: 80,
      origin: { y: 0.7 },
      colors: ["#FF7A45", "#FFC94F", "#00D8D5", "#FF5694"],
    });
    toast.success(
      `Exported at ${mode === "badge" ? `${BADGE_W}×${BADGE_H}` : `${FRAME_S}×${FRAME_S}`}`,
    );
  };

  const shareOnX = () => {
    const text = `🚀 Just created my HH Goa 2026 Builder ID!\n\nReady to build.\n\n#FrameInGoa`;
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`,
      "_blank",
      "noopener",
    );
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Clipboard unavailable");
    }
  };

  const reroll = () => {
    setTitle(pickTitle());
    confetti({
      particleCount: 60,
      spread: 55,
      startVelocity: 22,
      origin: { y: 0.6 },
      colors: ["#FFC94F", "#FF7A45"],
    });
  };

  return (
    <section id="studio" className="mx-auto max-w-6xl scroll-mt-8 px-5 py-16">
      <div className="mb-10 text-center">
        <p className="label-caps text-cyan">The Studio</p>
        <h2 className="mt-3 text-4xl sm:text-5xl">Craft your identity</h2>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
        {/* LEFT */}
        <div className="space-y-4">
          <div
            {...getRootProps()}
            className={`glass relative overflow-hidden rounded-3xl p-6 transition-all duration-300 ${
              isDragActive ? "ring-2 ring-cyan" : ""
            }`}
          >
            <input {...getInputProps()} />
            <button
              type="button"
              onClick={open}
              className="flex w-full flex-col items-center gap-4 rounded-2xl border border-dashed border-white/20 px-6 py-10 text-center transition-colors hover:border-cyan/70"
            >
              {photo ? (
                <img
                  src={photo.src}
                  alt="Your uploaded portrait"
                  className="size-24 rounded-full object-cover ring-2 ring-cyan/60"
                />
              ) : (
                <span className="grid size-16 place-items-center rounded-2xl bg-gradient-to-br from-primary/30 to-violet/30 text-cyan">
                  <ImagePlus className="size-7" />
                </span>
              )}
              <span className="font-display text-sm font-semibold">
                {photo ? "Replace photo" : isDragActive ? "Drop it right here" : "Drag & drop your photo"}
              </span>
              <span className="label-caps text-[9px] text-muted-foreground">
                JPG · JPEG · PNG · HEIC
              </span>
            </button>
          </div>

          <div className="glass space-y-4 rounded-3xl p-6">
            <Field label="Full name" value={name} onChange={setName} placeholder="Aarav Sharma" />
            <Field label="Role / Stack" value={role} onChange={setRole} placeholder="Full Stack · React + Go" />
            <div>
              <span className="label-caps text-[9px] text-muted-foreground">Builder title</span>
              <div className="mt-2 flex gap-2">
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="glass min-w-0 flex-1 rounded-xl px-4 py-3 font-display text-sm outline-none focus:ring-2 focus:ring-primary/60"
                />
                <button
                  type="button"
                  onClick={reroll}
                  className="glass shrink-0 rounded-xl px-4 text-cyan transition-colors hover:text-foreground"
                  aria-label="Generate a new builder title"
                >
                  <RefreshCw className="size-4" />
                </button>
              </div>
              <p className="mt-2 font-mono text-[10px] text-muted-foreground">
                ID · <span className="text-cyan">{builderId}</span>
              </p>
            </div>
          </div>

          <div className="glass space-y-5 rounded-3xl p-6">
            <p className="label-caps text-[9px] text-cyan">Image enhancement</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <Range label="Brightness" value={adj.brightness} min={50} max={160} onChange={(v) => setAdj((a) => ({ ...a, brightness: v }))} suffix="%" />
              <Range label="Contrast" value={adj.contrast} min={50} max={180} onChange={(v) => setAdj((a) => ({ ...a, contrast: v }))} suffix="%" />
              <Range label="Saturation" value={adj.saturation} min={0} max={200} onChange={(v) => setAdj((a) => ({ ...a, saturation: v }))} suffix="%" />
              <Range label="Zoom" value={adj.zoom} min={1} max={2.5} step={0.01} onChange={(v) => setAdj((a) => ({ ...a, zoom: v }))} suffix="×" />
              <Range label="Rotate" value={adj.rotate} min={-180} max={180} onChange={(v) => setAdj((a) => ({ ...a, rotate: v }))} suffix="°" />
              <Range label="Vertical nudge" value={Math.round(adj.offsetY * 100)} min={-60} max={60} onChange={(v) => setAdj((a) => ({ ...a, offsetY: v / 100 }))} />
            </div>
            <div className="flex flex-wrap gap-2">
              <Chip active={blurBackdrop} onClick={() => setBlurBackdrop((b) => !b)}>
                Background blur
              </Chip>
              <Chip active={transparent} onClick={() => setTransparent((t) => !t)}>
                Transparent export
              </Chip>
              <button
                type="button"
                onClick={() => photo && smartCenter(photo)}
                className="glass label-caps inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-[9px] text-muted-foreground transition-colors hover:text-foreground"
              >
                <Focus className="size-3" /> Smart center
              </button>
            </div>
          </div>

          <div className="glass space-y-5 rounded-3xl p-6">
            <p className="label-caps text-[9px] text-cyan">Stamp</p>
            <div>
              <span className="label-caps text-[9px] text-muted-foreground">Stamp style</span>
              <div className="mt-2 flex flex-wrap gap-2">
                {STAMP_STYLES.map((s) => (
                  <Chip
                    key={s}
                    active={stamp.style === s}
                    onClick={() => setStamp((p) => ({ ...p, style: s }))}
                  >
                    {STAMP_STYLE_LABELS[s]}
                  </Chip>
                ))}
              </div>
            </div>
            {stamp.style !== "none" && (
              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  label="Top text"
                  value={stamp.top}
                  onChange={(v) => setStamp((p) => ({ ...p, top: v }))}
                  placeholder="HACKER HOUSE"
                />
                <Field
                  label="Bottom text"
                  value={stamp.bottom}
                  onChange={(v) => setStamp((p) => ({ ...p, bottom: v }))}
                  placeholder="GOA 2026"
                />
                <Field
                  label="Center mark"
                  value={stamp.core}
                  onChange={(v) => setStamp((p) => ({ ...p, core: v }))}
                  placeholder="HH"
                />
                <Field
                  label="Sub line"
                  value={stamp.sub}
                  onChange={(v) => setStamp((p) => ({ ...p, sub: v }))}
                  placeholder="VERIFIED"
                />
              </div>
            )}
          </div>

          <div className="glass space-y-5 rounded-3xl p-6">
            <p className="label-caps text-[9px] text-cyan">Customization</p>

            <div>
              <span className="label-caps text-[9px] text-muted-foreground">Gradient</span>
              <div className="mt-2 flex flex-wrap gap-2">
                {GRADIENTS.map((g, i) => (
                  <button
                    key={g.label}
                    type="button"
                    onClick={() => setGradient(i)}
                    aria-label={g.label}
                    className={`size-9 rounded-full transition-transform duration-300 hover:scale-110 ${
                      gradient === i ? "ring-2 ring-white ring-offset-2 ring-offset-background" : ""
                    }`}
                    style={{ background: `linear-gradient(135deg, ${g.frame}, ${g.accent})` }}
                  />
                ))}
              </div>
            </div>

            <Range label="Glow intensity" value={glow} min={0} max={100} onChange={setGlow} suffix="%" />

            {[
              { label: "Card theme", items: THEME_KEYS, value: theme, set: setTheme as (v: string) => void, labels: THEME_LABELS as Record<string, string> },
              { label: "Corner style", items: CORNERS, value: corner, set: setCorner as (v: string) => void },
              { label: "Background pattern", items: PATTERNS, value: pattern, set: setPattern as (v: string) => void },
              { label: "Badge style", items: BADGE_STYLES, value: badgeStyle, set: setBadgeStyle as (v: string) => void },
              { label: "Font style", items: FONTS, value: font, set: setFont as (v: string) => void },
            ].map((row) => (
              <div key={row.label}>
                <span className="label-caps text-[9px] text-muted-foreground">{row.label}</span>
                <div className="mt-2 flex flex-wrap gap-2">
                  {row.items.map((it) => (
                    <Chip key={it} active={row.value === it} onClick={() => row.set(it)}>
                      {("labels" in row ? row.labels?.[it] : undefined) ?? it}
                    </Chip>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT */}
        <div className="lg:sticky lg:top-6 lg:self-start">
          <div className="glass-strong rounded-3xl p-5">
            <div className="glass relative flex rounded-full p-1">
              {(["badge", "frame"] as Mode[]).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMode(m)}
                  className="label-caps relative flex-1 rounded-full py-3 text-[10px] transition-colors"
                >
                  {mode === m && (
                    <motion.span
                      layoutId="tab-pill"
                      transition={{ type: "spring", stiffness: 380, damping: 32 }}
                      className="absolute inset-0 rounded-full bg-gradient-to-r from-primary to-cyan"
                    />
                  )}
                  <span
                    className={`relative ${mode === m ? "text-primary-foreground" : "text-muted-foreground"}`}
                  >
                    {m === "badge" ? "Builder ID" : "Profile Frame"}
                  </span>
                </button>
              ))}
            </div>

            <div className="relative mt-5">
              <div
                className="pointer-events-none absolute -inset-6 rounded-[2.5rem] opacity-60 blur-3xl"
                style={{
                  background: `radial-gradient(circle at 50% 40%, ${(GRADIENTS[gradient] ?? GRADIENTS[0]!).accent}55, transparent 70%)`,
                }}
              />
              <div className="relative">
                  <canvas
                    ref={previewRef}
                    width={mode === "badge" ? BADGE_W : FRAME_S}
                    height={mode === "badge" ? BADGE_H : FRAME_S}
                    aria-label={`Live preview of your HH Goa 2026 ${mode === "badge" ? "builder ID" : "profile frame"}`}
                    className="block h-auto w-full rounded-2xl"
                  />
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <motion.button
                whileHover={{ y: -3 }}
                whileTap={{ scale: 0.98 }}
                onClick={download}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-primary via-cyan to-violet px-6 py-4 font-display text-sm font-semibold text-primary-foreground shadow-[0_18px_50px_-20px_rgba(79,140,255,0.95)] sm:col-span-2"
              >
                <Download className="size-4" /> Download PNG
              </motion.button>
              <motion.button
                whileHover={{ y: -3 }}
                whileTap={{ scale: 0.98 }}
                onClick={shareOnX}
                className="glass inline-flex items-center justify-center gap-2 rounded-2xl px-6 py-4 text-sm font-semibold transition-colors hover:text-cyan"
              >
                <Share2 className="size-4" /> Share to X
              </motion.button>
              <motion.button
                whileHover={{ y: -3 }}
                whileTap={{ scale: 0.98 }}
                onClick={copyLink}
                className="glass inline-flex items-center justify-center gap-2 rounded-2xl px-6 py-4 text-sm font-semibold transition-colors hover:text-cyan"
              >
                {copied ? <Check className="size-4 text-cyan" /> : <Copy className="size-4" />}
                {copied ? "Copied" : "Copy link"}
              </motion.button>
            </div>

            <p className="mt-4 flex items-start gap-2 text-[11px] leading-relaxed text-muted-foreground">
              <Sparkles className="mt-0.5 size-3.5 shrink-0 text-cyan" />
              Rendered entirely in your browser at {mode === "badge" ? `${BADGE_W}×${BADGE_H}` : `${FRAME_S}×${FRAME_S}`} — your photo never leaves this device.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
