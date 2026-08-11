export type ThemeKey =
  | "sunset"
  | "seaside"
  | "azulejo"
  | "palmnight"
  | "sand"
  | "beach"
  | "monsoon"
  | "neon"
  | "terracotta";
export type CornerStyle = "rounded" | "soft" | "sharp" | "cut";
export type PatternKey = "tiles" | "dots" | "waves" | "palms" | "none";
export type BadgeStyle = "glass" | "solid" | "outline";
export type FontKey = "display" | "mono" | "serif";

export type Adjustments = {
  brightness: number;
  contrast: number;
  saturation: number;
  zoom: number;
  rotate: number;
  offsetX: number;
  offsetY: number;
};

export const defaultAdjustments: Adjustments = {
  brightness: 100,
  contrast: 100,
  saturation: 100,
  zoom: 1,
  rotate: 0,
  offsetX: 0,
  offsetY: 0,
};

export type CardOptions = {
  name: string;
  role: string;
  title: string;
  builderId: string;
  photo: HTMLImageElement | null;

  theme: ThemeKey;
  frameColor: string;
  accentColor: string;
  glow: number; // 0..100
  corner: CornerStyle;
  pattern: PatternKey;
  badgeStyle: BadgeStyle;
  font: FontKey;
  adjustments: Adjustments;
  blurBackdrop: boolean;
  transparent: boolean;
  stamp?: StampConfig;
};

export const THEMES: Record<
  ThemeKey,
  { bg: [string, string, string]; text: string; sub: string; panel: string; label: string }
> = {
  sunset: {
    bg: ["#2A0A22", "#57163B", "#170518"],
    text: "#FFF6E9",
    sub: "rgba(255,246,233,0.66)",
    panel: "rgba(255,246,233,0.07)",
    label: "rgba(255,246,233,0.5)",
  },
  seaside: {
    bg: ["#032430", "#064A56", "#01161F"],
    text: "#EAFDFF",
    sub: "rgba(234,253,255,0.66)",
    panel: "rgba(255,255,255,0.07)",
    label: "rgba(234,253,255,0.5)",
  },
  azulejo: {
    bg: ["#F3F7FF", "#E2ECFB", "#FAFCFF"],
    text: "#0E2A52",
    sub: "rgba(14,42,82,0.62)",
    panel: "rgba(14,42,82,0.05)",
    label: "rgba(14,42,82,0.45)",
  },
  palmnight: {
    bg: ["#06170F", "#0B2E1F", "#020C08"],
    text: "#F0FFF6",
    sub: "rgba(240,255,246,0.66)",
    panel: "rgba(255,255,255,0.07)",
    label: "rgba(240,255,246,0.5)",
  },
  sand: {
    bg: ["#FDF6E8", "#F3E4C9", "#FFFBF2"],
    text: "#3B2312",
    sub: "rgba(59,35,18,0.62)",
    panel: "rgba(59,35,18,0.05)",
    label: "rgba(59,35,18,0.45)",
  },
  beach: {
    bg: ["#E9FBFF", "#BFEFF5", "#FFF7E4"],
    text: "#073B47",
    sub: "rgba(7,59,71,0.62)",
    panel: "rgba(7,59,71,0.06)",
    label: "rgba(7,59,71,0.45)",
  },
  monsoon: {
    bg: ["#0B1618", "#12333A", "#050D0F"],
    text: "#E6F5F3",
    sub: "rgba(230,245,243,0.64)",
    panel: "rgba(255,255,255,0.06)",
    label: "rgba(230,245,243,0.48)",
  },
  neon: {
    bg: ["#08040F", "#1A0A2E", "#04020A"],
    text: "#F3EBFF",
    sub: "rgba(243,235,255,0.64)",
    panel: "rgba(255,255,255,0.07)",
    label: "rgba(243,235,255,0.48)",
  },
  terracotta: {
    bg: ["#2A100A", "#4A1E12", "#180806"],
    text: "#FFEEDD",
    sub: "rgba(255,238,221,0.64)",
    panel: "rgba(255,255,255,0.06)",
    label: "rgba(255,238,221,0.48)",
  },
};

export const BADGE_W = 1638;
export const BADGE_H = 2048;
export const FRAME_S = 2048;

const FONTS: Record<FontKey, { head: string; body: string }> = {
  display: { head: "Sora, system-ui, sans-serif", body: "'JetBrains Mono', monospace" },
  mono: { head: "'JetBrains Mono', monospace", body: "'JetBrains Mono', monospace" },
  serif: { head: "'Bodoni Moda', Georgia, serif", body: "'JetBrains Mono', monospace" },
};

function hexA(hex: string, a: number) {
  const h = hex.replace("#", "");
  const n = parseInt(
    h.length === 3
      ? h
          .split("")
          .map((c) => c + c)
          .join("")
      : h,
    16,
  );
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
}

function cornerRadius(style: CornerStyle, base: number) {
  if (style === "sharp") return 0;
  if (style === "soft") return base * 0.55;
  if (style === "cut") return base * 0.28;
  return base;
}

function shapePath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
  cut: boolean,
) {
  ctx.beginPath();
  if (cut) {
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.lineTo(x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.lineTo(x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.lineTo(x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.closePath();
    return;
  }
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function tracked(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  spacing: number,
  align: "left" | "center" = "left",
) {
  const chars = [...text];
  const width =
    chars.reduce((a, c) => a + ctx.measureText(c).width + spacing, 0) - spacing;
  let cur = align === "center" ? x - width / 2 : x;
  const prev = ctx.textAlign;
  ctx.textAlign = "left";
  for (const c of chars) {
    ctx.fillText(c, cur, y);
    cur += ctx.measureText(c).width + spacing;
  }
  ctx.textAlign = prev;
  return width;
}

function fitText(
  ctx: CanvasRenderingContext2D,
  text: string,
  max: number,
  size: number,
  weight: string,
  family: string,
) {
  let s = size;
  ctx.font = `${weight} ${s}px ${family}`;
  while (ctx.measureText(text).width > max && s > 18) {
    s -= 2;
    ctx.font = `${weight} ${s}px ${family}`;
  }
  return s;
}

function drawPattern(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  kind: PatternKey,
  color: string,
) {
  if (kind === "none") return;
  ctx.save();
  ctx.strokeStyle = hexA(color, 0.14);
  ctx.fillStyle = hexA(color, 0.16);
  ctx.lineWidth = 2;
  if (kind === "tiles") {
    // Portuguese azulejo: quatrefoil lattice on a 96px grid
    const s = 96;
    for (let y = 0; y <= h + s; y += s) {
      for (let x = 0; x <= w + s; x += s) {
        ctx.beginPath();
        ctx.arc(x, y, s * 0.42, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x, y - s * 0.5);
        ctx.lineTo(x + s * 0.5, y);
        ctx.lineTo(x, y + s * 0.5);
        ctx.lineTo(x - s * 0.5, y);
        ctx.closePath();
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(x + s / 2, y + s / 2, 4, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  } else if (kind === "dots") {
    for (let y = 40; y < h; y += 46)
      for (let x = 40; x < w; x += 46) {
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fill();
      }
  } else if (kind === "waves") {
    for (let y = 60; y < h; y += 86) {
      ctx.beginPath();
      for (let x = 0; x <= w; x += 12) {
        const yy = y + Math.sin((x / w) * Math.PI * 6 + y) * 14;
        x === 0 ? ctx.moveTo(x, yy) : ctx.lineTo(x, yy);
      }
      ctx.stroke();
    }
  } else if (kind === "palms") {
    // scattered coconut fronds
    let seed = 7;
    const rnd = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);
    ctx.lineWidth = 3;
    for (let i = 0; i < 26; i++) {
      const x = rnd() * w;
      const y = rnd() * h;
      const sc = 0.5 + rnd() * 0.8;
      const rot = rnd() * Math.PI * 2;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rot);
      ctx.scale(sc, sc);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(40, -18, 96, -6);
      ctx.stroke();
      for (let k = 1; k <= 7; k++) {
        const px = k * 12;
        const py = -Math.sin(k / 7) * 12;
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.quadraticCurveTo(px + 10, py - 20, px + 4, py - 32);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.quadraticCurveTo(px + 10, py + 20, px + 4, py + 32);
        ctx.stroke();
      }
      ctx.restore();
    }
  }
  ctx.restore();
}

/** Goa palm + sun silhouette, drawn as vectors. */
function drawGoaScene(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale: number,
  color: string,
  alpha: number,
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  ctx.strokeStyle = color;

  // sun
  ctx.beginPath();
  ctx.arc(0, -120, 92, 0, Math.PI * 2);
  ctx.fill();

  // sea lines
  ctx.lineWidth = 7;
  for (let i = 0; i < 4; i++) {
    ctx.beginPath();
    const yy = 30 + i * 26;
    for (let px = -260; px <= 260; px += 10) {
      const py = yy + Math.sin(px / 34 + i) * 5;
      px === -260 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
    }
    ctx.stroke();
  }

  // palm trunk
  ctx.lineWidth = 12;
  ctx.beginPath();
  ctx.moveTo(-190, 40);
  ctx.quadraticCurveTo(-205, -70, -170, -160);
  ctx.stroke();
  // fronds
  for (let i = 0; i < 6; i++) {
    const a = -Math.PI / 2 + (i - 2.5) * 0.5;
    ctx.beginPath();
    ctx.moveTo(-170, -160);
    ctx.quadraticCurveTo(
      -170 + Math.cos(a) * 70,
      -160 + Math.sin(a) * 70 - 20,
      -170 + Math.cos(a) * 130,
      -160 + Math.sin(a) * 130 + 30,
    );
    ctx.lineWidth = 9;
    ctx.stroke();
  }
  ctx.restore();
}

/** Warm Goa beach band: sun over the Arabian Sea, surf lines, sand and palms. */
function drawBeachBand(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  sun: string,
  sea: string,
  sand: string,
  ink: string,
  alpha = 1,
) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();

  const horizon = y + h * 0.42;

  // sky wash
  const sky = ctx.createLinearGradient(0, y, 0, horizon);
  sky.addColorStop(0, hexA(sun, 0.0));
  sky.addColorStop(1, hexA(sun, 0.5));
  ctx.fillStyle = sky;
  ctx.fillRect(x, y, w, horizon - y);

  // sun
  const sunX = x + w * 0.72;
  const sunR = h * 0.2;
  const halo = ctx.createRadialGradient(sunX, horizon - sunR * 0.35, 0, sunX, horizon - sunR * 0.35, sunR * 1.9);
  halo.addColorStop(0, hexA(sun, 0.6));
  halo.addColorStop(1, hexA(sun, 0));
  ctx.fillStyle = halo;
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = hexA(sun, 0.85);
  ctx.beginPath();
  ctx.arc(sunX, horizon - sunR * 0.35, sunR, 0, Math.PI * 2);
  ctx.fill();

  // sea
  const seaG = ctx.createLinearGradient(0, horizon, 0, y + h * 0.78);
  seaG.addColorStop(0, hexA(sea, 0.75));
  seaG.addColorStop(1, hexA(sea, 0.3));
  ctx.fillStyle = seaG;
  ctx.fillRect(x, horizon, w, h * 0.36);

  // sun glitter on water
  ctx.fillStyle = hexA(sun, 0.5);
  for (let i = 0; i < 9; i++) {
    const yy = horizon + i * (h * 0.036) + 4;
    const ww = sunR * (1.7 - i * 0.14);
    ctx.fillRect(sunX - ww / 2, yy, Math.max(10, ww), 4);
  }

  // surf lines
  ctx.strokeStyle = hexA("#FFFFFF", 0.5);
  ctx.lineWidth = 4;
  for (let i = 0; i < 3; i++) {
    const base = y + h * (0.66 + i * 0.05);
    ctx.beginPath();
    for (let px = x; px <= x + w; px += 10) {
      const py = base + Math.sin((px / w) * Math.PI * 5 + i * 1.4) * (h * 0.014);
      px === x ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
    }
    ctx.stroke();
  }

  // sand
  const sandG = ctx.createLinearGradient(0, y + h * 0.76, 0, y + h);
  sandG.addColorStop(0, hexA(sand, 0.65));
  sandG.addColorStop(1, hexA(sand, 0.95));
  ctx.fillStyle = sandG;
  ctx.beginPath();
  ctx.moveTo(x, y + h * 0.79);
  for (let px = x; px <= x + w; px += 12) {
    ctx.lineTo(px, y + h * 0.79 + Math.sin((px / w) * Math.PI * 3) * (h * 0.02));
  }
  ctx.lineTo(x + w, y + h);
  ctx.lineTo(x, y + h);
  ctx.closePath();
  ctx.fill();

  // palm silhouettes
  const palm = (px: number, py: number, s: number, lean: number) => {
    ctx.save();
    ctx.translate(px, py);
    ctx.scale(s, s);
    ctx.strokeStyle = hexA(ink, 0.85);
    ctx.lineCap = "round";
    ctx.lineWidth = 9;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(lean * 16, -80, lean * 34, -150);
    ctx.stroke();
    ctx.lineWidth = 7;
    for (let i = 0; i < 6; i++) {
      const a = -Math.PI / 2 + (i - 2.5) * 0.52;
      ctx.beginPath();
      ctx.moveTo(lean * 34, -150);
      ctx.quadraticCurveTo(
        lean * 34 + Math.cos(a) * 60,
        -150 + Math.sin(a) * 60 - 26,
        lean * 34 + Math.cos(a) * 108,
        -150 + Math.sin(a) * 108 + 34,
      );
      ctx.stroke();
    }
    ctx.restore();
  };
  palm(x + w * 0.11, y + h * 0.95, 0.9, -1);
  palm(x + w * 0.22, y + h * 1.0, 0.6, 1);
  palm(x + w * 0.9, y + h * 0.97, 0.7, 1);

  // gulls
  ctx.strokeStyle = hexA(ink, 0.6);
  ctx.lineWidth = 4;
  const gull = (gx: number, gy: number, s: number) => {
    ctx.beginPath();
    ctx.moveTo(gx - 14 * s, gy);
    ctx.quadraticCurveTo(gx - 7 * s, gy - 9 * s, gx, gy);
    ctx.quadraticCurveTo(gx + 7 * s, gy - 9 * s, gx + 14 * s, gy);
    ctx.stroke();
  };
  gull(x + w * 0.33, y + h * 0.16, 1.1);
  gull(x + w * 0.42, y + h * 0.24, 0.8);
  gull(x + w * 0.26, y + h * 0.27, 0.7);

  ctx.restore();
}


function starField(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  color: string,
  count = 90,
) {
  let seed = 42;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  ctx.save();
  for (let i = 0; i < count; i++) {
    const x = rnd() * w;
    const y = rnd() * h;
    const r = rnd() * 3 + 0.8;
    ctx.globalAlpha = 0.2 + rnd() * 0.55;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function photoFilter(a: Adjustments, blur = 0) {
  return `brightness(${a.brightness}%) contrast(${a.contrast}%) saturate(${a.saturation}%)${
    blur ? ` blur(${blur}px)` : ""
  }`;
}

function drawCirclePhoto(
  ctx: CanvasRenderingContext2D,
  o: CardOptions,
  cx: number,
  cy: number,
  r: number,
) {
  const a = o.adjustments;
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.clip();

  const grad = ctx.createLinearGradient(cx - r, cy - r, cx + r, cy + r);
  grad.addColorStop(0, hexA(o.frameColor, 0.55));
  grad.addColorStop(1, hexA(o.accentColor, 0.45));
  ctx.fillStyle = grad;
  ctx.fillRect(cx - r, cy - r, r * 2, r * 2);

  if (o.photo) {
    const img = o.photo;
    const drawImg = (scale: number, blur: number, alpha: number) => {
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.filter = photoFilter(a, blur);
      ctx.translate(cx + a.offsetX * r, cy + a.offsetY * r);
      ctx.rotate((a.rotate * Math.PI) / 180);
      const base = Math.max((r * 2) / img.width, (r * 2) / img.height) * scale;
      const w = img.width * base;
      const h = img.height * base;
      ctx.drawImage(img, -w / 2, -h / 2, w, h);
      ctx.restore();
    };
    if (o.blurBackdrop) drawImg(a.zoom * 1.9, 40, 1);
    drawImg(a.zoom, 0, 1);
  } else {
    ctx.fillStyle = hexA("#ffffff", 0.5);
    ctx.beginPath();
    ctx.arc(cx, cy - r * 0.2, r * 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx, cy + r * 0.62, r * 0.52, Math.PI, 0);
    ctx.fill();
  }
  ctx.restore();
}

function gradientRing(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
  width: number,
  c1: string,
  c2: string,
  glow: number,
) {
  ctx.save();
  const g = ctx.createLinearGradient(cx - r, cy - r, cx + r, cy + r);
  g.addColorStop(0, c1);
  g.addColorStop(0.5, c2);
  g.addColorStop(1, c1);
  ctx.strokeStyle = g;
  ctx.lineWidth = width;
  ctx.shadowColor = hexA(c2, Math.min(0.9, glow / 100));
  ctx.shadowBlur = (glow / 100) * 70;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

/* ------------------------------- INK STAMP -------------------------------- */

export type StampStyle = "round" | "double" | "square" | "none";

export type StampConfig = {
  style: StampStyle;
  top: string;
  bottom: string;
  core: string;
  sub: string;
};

export const defaultStamp: StampConfig = {
  style: "round",
  top: "HACKER HOUSE",
  bottom: "GOA 2026",
  core: "HH",
  sub: "VERIFIED",
};

/**
 * Authentic-looking rubber stamp. Text and frame style are fully configurable
 * so each badge can carry its own seal.
 */
export function drawGoaStamp(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
  color: string,
  rotation = -0.22,
  stamp: StampConfig = defaultStamp,
) {
  if (stamp.style === "none") return;

  const size = Math.ceil(r * 2.4);
  const off = document.createElement("canvas");
  off.width = off.height = size;
  const c = off.getContext("2d");
  if (!c) return;
  const m = size / 2;

  c.translate(m, m);
  c.strokeStyle = color;
  c.fillStyle = color;
  c.lineCap = "round";
  c.lineJoin = "round";

  const round = (x: number, y: number, w: number, h: number, rad: number) => {
    c.beginPath();
    c.moveTo(x + rad, y);
    c.arcTo(x + w, y, x + w, y + h, rad);
    c.arcTo(x + w, y + h, x, y + h, rad);
    c.arcTo(x, y + h, x, y, rad);
    c.arcTo(x, y, x + w, y, rad);
    c.closePath();
  };

  if (stamp.style === "square") {
    const s = r * 1.72;
    c.lineWidth = r * 0.055;
    round(-s / 2, -s / 2, s, s, r * 0.14);
    c.stroke();
    c.lineWidth = r * 0.016;
    round(-s / 2 + r * 0.11, -s / 2 + r * 0.11, s - r * 0.22, s - r * 0.22, r * 0.09);
    c.stroke();
  } else {
    c.lineWidth = r * 0.05;
    c.beginPath();
    c.arc(0, 0, r, 0, Math.PI * 2);
    c.stroke();
    c.lineWidth = stamp.style === "double" ? r * 0.03 : r * 0.016;
    c.beginPath();
    c.arc(0, 0, r * 0.74, 0, Math.PI * 2);
    c.stroke();
    if (stamp.style === "double") {
      c.lineWidth = r * 0.02;
      c.beginPath();
      c.arc(0, 0, r * 0.92, 0, Math.PI * 2);
      c.stroke();
    }
  }

  /** Lay text along a circle using measured widths so glyphs never collide. */
  const arcText = (
    text: string,
    radius: number,
    fontSize: number,
    centerAngle: number,
    flip: boolean,
    extra = 0.55,
  ) => {
    const chars = [...text];
    c.save();
    c.font = `800 ${fontSize}px Sora, system-ui, sans-serif`;
    c.textAlign = "center";
    c.textBaseline = "middle";
    const advances = chars.map(
      (ch) => (c.measureText(ch).width + (ch === " " ? 0 : fontSize * extra * 0.18)) / radius,
    );
    const total = advances.reduce((a, b) => a + b, 0);
    let angle = centerAngle - total / 2;
    chars.forEach((ch, i) => {
      const a = advances[i]!;
      const mid = angle + a / 2;
      c.save();
      c.rotate(flip ? -mid : mid);
      c.translate(0, flip ? radius : -radius);
      c.fillText(ch, 0, 0);
      c.restore();
      angle += a;
    });
    c.restore();
  };

  const top = stamp.top.trim();
  const bottom = stamp.bottom.trim();
  const core = stamp.core.trim();
  const sub = stamp.sub.trim();

  c.textAlign = "center";
  c.textBaseline = "middle";

  if (stamp.style === "square") {
    // straight-set type for the boxed seal
    if (top) {
      c.font = `800 ${r * 0.15}px Sora, system-ui, sans-serif`;
      c.fillText(top, 0, -r * 0.6);
    }
    if (bottom) {
      c.font = `700 ${r * 0.12}px Sora, system-ui, sans-serif`;
      c.fillText(bottom, 0, r * 0.62);
    }
  } else {
    if (top) arcText(top, r * 0.86, r * 0.155, 0, false);
    if (bottom) arcText(bottom, r * 0.87, r * 0.14, 0, true);
  }

  // core lockup — kept minimal
  if (core) {
    const fit = Math.min(r * 0.4, (r * 1.05) / Math.max(1, core.length * 0.58));
    c.font = `800 ${fit}px Sora, system-ui, sans-serif`;
    c.fillText(core, 0, -r * 0.12);
  }
  if (core && sub) {
    c.lineWidth = r * 0.022;
    c.beginPath();
    c.moveTo(-r * 0.28, r * 0.12);
    c.lineTo(r * 0.28, r * 0.12);
    c.stroke();
  }
  if (sub) {
    c.font = `700 ${r * 0.12}px Sora, system-ui, sans-serif`;
    c.fillText(sub, 0, core ? r * 0.32 : r * 0.05);
  }

  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(rotation);
  ctx.globalAlpha = 1;
  ctx.drawImage(off, -m, -m);
  ctx.restore();
}


const HH = {
  green: "#0B5C33",
  greenDeep: "#073F23",
  yellow: "#F5D423",
  pink: "#F0246A",
  cream: "#FFF7E2",
};

/** Badge skins. Same high-contrast layout, five different card finishes. */
export type Skin = {
  black: string; // shell / darkest
  carbon: string; // field
  hair: string; // keyline
  paper: string; // primary text + ribbon fill
  mute: string; // secondary text
  amber: string; // primary accent
  surf: string; // secondary accent
  onRibbon: string; // text sitting on the ribbon
  scrim: string; // photo scrim colour
};

export const SKINS: Record<ThemeKey, Skin> = {
  // Blacked-out carbon — the default
  palmnight: {
    black: "#0A0A0B", carbon: "#141417", hair: "#2A2A30", paper: "#F6F5F1",
    mute: "#9B9BA4", amber: "#FFC53D", surf: "#39E0C8", onRibbon: "#0A0A0B", scrim: "#000000",
  },
  // Ink plum with coral heat
  sunset: {
    black: "#140309", carbon: "#25060F", hair: "#4A1226", paper: "#FFF1E6",
    mute: "#C09A94", amber: "#FF7A45", surf: "#FFC94F", onRibbon: "#140309", scrim: "#0B0206",
  },
  // Midnight navy with turquoise
  seaside: {
    black: "#04121A", carbon: "#0A2331", hair: "#154458", paper: "#EAFDFF",
    mute: "#8FB6C2", amber: "#00D8D5", surf: "#FFD166", onRibbon: "#04121A", scrim: "#01090F",
  },
  // Bright azulejo tile — light card
  azulejo: {
    black: "#F4F7FD", carbon: "#FFFFFF", hair: "#C9D8F0", paper: "#0E2A52",
    mute: "#5B7196", amber: "#1D5BD6", surf: "#D6296B", onRibbon: "#FFFFFF", scrim: "#0E2A52",
  },
  // Warm Palolem sand — light card
  sand: {
    black: "#F6EAD4", carbon: "#FFF9EE", hair: "#DCC6A0", paper: "#3B2312",
    mute: "#8A6B4C", amber: "#C4562A", surf: "#1F7A5A", onRibbon: "#FFF9EE", scrim: "#3B2312",
  },
  // Beach shack — pale aqua card, sun-gold accents
  beach: {
    black: "#DFF6FA", carbon: "#F4FEFF", hair: "#9FD9E4", paper: "#073B47",
    mute: "#4E8391", amber: "#F29B1D", surf: "#0FB5C9", onRibbon: "#F4FEFF", scrim: "#073B47",
  },
  // Monsoon — wet slate green with lime
  monsoon: {
    black: "#081113", carbon: "#122A2E", hair: "#20464D", paper: "#E6F5F3",
    mute: "#89A9A7", amber: "#B6F24A", surf: "#5FD6C4", onRibbon: "#081113", scrim: "#040A0C",
  },
  // Neon trance — Vagator after dark
  neon: {
    black: "#07030D", carbon: "#160A28", hair: "#3A1E63", paper: "#F3EBFF",
    mute: "#A08CC4", amber: "#C6FF3D", surf: "#FF3DEB", onRibbon: "#07030D", scrim: "#050210",
  },
  // Terracotta — Latin quarter clay
  terracotta: {
    black: "#200C07", carbon: "#3A1710", hair: "#632C1C", paper: "#FFEEDD",
    mute: "#C79A82", amber: "#FF8A3D", surf: "#5FC9A0", onRibbon: "#200C07", scrim: "#150703",
  },
};

const INK = SKINS.palmnight;


const SANS = "Sora, system-ui, sans-serif";

/** Woven dash ticker used on HH GOA print collateral. */
function ticker(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  ctx.save();
  ctx.fillStyle = HH.pink;
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = HH.yellow;
  for (let i = 0; i < w; i += 26) ctx.fillRect(x + i, y, 13, h);
  ctx.restore();
}

/** Two-tone rule used on the black badge. */
function rule(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, a = INK.amber, b = INK.hair) {
  ctx.save();
  ctx.fillStyle = b;
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = a;
  ctx.fillRect(x, y, w * 0.28, h);
  ctx.restore();
}

/** Low-key coastline: sun, sea rules, palms — pure line art, no washes. */
function coastLine(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, color: string, alpha: number) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineCap = "round";

  const sunX = x + w * 0.78;
  const sunR = 92;
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.arc(sunX, y - 60, sunR, Math.PI, Math.PI * 2);
  ctx.stroke();
  for (let i = 0; i < 6; i++) {
    ctx.globalAlpha = alpha * (1 - i * 0.12);
    ctx.fillRect(sunX - sunR + i * 3, y - 56 + i * 14, sunR * 2 - i * 6, 6);
  }
  ctx.globalAlpha = alpha;

  ctx.lineWidth = 4;
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    for (let px = x; px <= x + w; px += 10) {
      const py = y + 42 + i * 30 + Math.sin((px / w) * Math.PI * 6 + i) * 7;
      px === x ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
    }
    ctx.stroke();
  }

  const palm = (px: number, py: number, s: number, lean: number) => {
    ctx.save();
    ctx.translate(px, py);
    ctx.scale(s, s);
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(lean * 18, -84, lean * 38, -158);
    ctx.stroke();
    ctx.lineWidth = 7;
    for (let i = 0; i < 6; i++) {
      const a = -Math.PI / 2 + (i - 2.5) * 0.5;
      ctx.beginPath();
      ctx.moveTo(lean * 38, -158);
      ctx.quadraticCurveTo(
        lean * 38 + Math.cos(a) * 62,
        -158 + Math.sin(a) * 62 - 28,
        lean * 38 + Math.cos(a) * 112,
        -158 + Math.sin(a) * 112 + 36,
      );
      ctx.stroke();
    }
    ctx.restore();
  };
  palm(x + w * 0.08, y + 120, 0.95, -1);
  palm(x + w * 0.2, y + 128, 0.62, 1);
  ctx.restore();
}

/** The pink गोवा sticker from the HH GOA masthead. */
function goaSticker(ctx: CanvasRenderingContext2D, cx: number, cy: number, s: number, rot: number) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(rot);
  ctx.scale(s, s);
  ctx.fillStyle = HH.pink;
  shapePath(ctx, -108, -74, 216, 148, 68, false);
  ctx.fill();
  ctx.strokeStyle = HH.cream;
  ctx.lineWidth = 7;
  shapePath(ctx, -108, -74, 216, 148, 68, false);
  ctx.stroke();
  ctx.fillStyle = HH.cream;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = `700 74px 'Noto Sans Devanagari', 'Sora', sans-serif`;
  ctx.fillText("गोवा", 0, 6);
  ctx.textBaseline = "alphabetic";
  ctx.restore();
}

/* ---------------------------------- BADGE --------------------------------- */

export function renderBadge(canvas: HTMLCanvasElement, o: CardOptions) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const W = (canvas.width = BADGE_W);
  const H = (canvas.height = BADGE_H);
  const f = FONTS[o.font];
  const S = SKINS[o.theme] ?? INK;
  ctx.clearRect(0, 0, W, H);

  const pad = 44;
  const r = cornerRadius(o.corner, 72);
  const cut = o.corner === "cut";

  // outer shell
  ctx.save();
  ctx.shadowColor = hexA(S.amber, (o.glow / 100) * 0.55);
  ctx.shadowBlur = (o.glow / 100) * 80;
  ctx.fillStyle = S.black;
  shapePath(ctx, pad, pad, W - pad * 2, H - pad * 2, r, cut);
  ctx.fill();
  ctx.restore();

  const ip = pad + 14;
  const ir = Math.max(0, r - 14);
  ctx.save();
  shapePath(ctx, ip, ip, W - ip * 2, H - ip * 2, ir, cut);
  ctx.clip();

  // carbon field
  const g = ctx.createLinearGradient(ip, ip, W - ip, H - ip);
  g.addColorStop(0, S.carbon);
  g.addColorStop(0.6, S.black);
  g.addColorStop(1, S.black);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  drawPattern(ctx, W, H, o.pattern, S.paper);

  // hairline inner keyline
  ctx.strokeStyle = S.hair;
  ctx.lineWidth = 3;
  shapePath(ctx, ip + 18, ip + 18, W - (ip + 18) * 2, H - (ip + 18) * 2, Math.max(0, ir - 14), cut);
  ctx.stroke();

  const M = ip + 74; // content margin
  const CW = W - M * 2;

  /* ------------------------------- masthead ------------------------------- */
  // Poster-style didone wordmark, two lines, with the pink गोवा sticker.
  const SERIF = `'Archivo Black', 'Sora', system-ui, sans-serif`;
  const topY = ip + 96;

  ctx.textAlign = "left";
  ctx.fillStyle = S.mute;
  ctx.font = `700 26px ${f.body}`;
  tracked(ctx, "GOA, INDIA", M, topY, 5);
  ctx.textAlign = "right";
  ctx.fillStyle = S.surf;
  ctx.fillText("28–31 OCT 2026", W - M, topY);
  ctx.textAlign = "left";

  const wmSize = Math.min(
    fitText(ctx, "HACKER", CW, 240, "700", SERIF),
    fitText(ctx, "HOUSE", CW, 240, "700", SERIF),
  );
  ctx.font = `700 ${wmSize}px ${SERIF}`;
  ctx.fillStyle = S.amber;
  const l1Y = topY + wmSize * 0.92;
  const l2Y = l1Y + wmSize * 0.86;
  ctx.fillText("HACKER", M, l1Y);
  ctx.fillText("HOUSE", M, l2Y);

  // sticker sits clear of the letters, at the right of the second line
  goaSticker(ctx, W - M - 92, l2Y - wmSize * 0.32, 0.74, -0.1);

  const mastY = l2Y - 96; // keeps downstream offsets intact

  rule(ctx, M, mastY + 148, CW, 8, S.amber, S.hair);


  /* --------------------------------- photo -------------------------------- */
  const phX = M;
  const phY = mastY + 200;
  const phW = CW;
  const phH = 930;
  const prad = cornerRadius(o.corner, 36);

  ctx.fillStyle = S.carbon;
  shapePath(ctx, phX, phY, phW, phH, prad, cut);
  ctx.fill();
  ctx.strokeStyle = S.hair;
  ctx.lineWidth = 3;
  shapePath(ctx, phX, phY, phW, phH, prad, cut);
  ctx.stroke();

  const inX = phX + 14;
  const inY = phY + 14;
  const inW = phW - 28;
  const inH = phH - 28;
  ctx.save();
  shapePath(ctx, inX, inY, inW, inH, Math.max(0, prad - 10), cut);
  ctx.clip();
  const a = o.adjustments;
  if (o.photo) {
    const img = o.photo;
    const draw = (scale: number, blur: number) => {
      ctx.save();
      ctx.filter = photoFilter(a, blur);
      ctx.translate(inX + inW / 2 + a.offsetX * inW * 0.5, inY + inH / 2 + a.offsetY * inH * 0.5);
      ctx.rotate((a.rotate * Math.PI) / 180);
      const base = Math.max(inW / img.width, inH / img.height) * scale;
      ctx.drawImage(img, (-img.width * base) / 2, (-img.height * base) / 2, img.width * base, img.height * base);
      ctx.restore();
    };
    if (o.blurBackdrop) draw(a.zoom * 1.8, 36);
    draw(a.zoom, 0);
  } else {
    ctx.fillStyle = hexA(S.paper, 0.06);
    ctx.fillRect(inX, inY, inW, inH);
    ctx.fillStyle = hexA(S.paper, 0.18);
    ctx.beginPath();
    ctx.arc(inX + inW / 2, inY + inH * 0.42, inW * 0.13, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(inX + inW / 2, inY + inH * 0.92, inW * 0.24, Math.PI, 0);
    ctx.fill();
  }
  // bottom scrim so the ID pill always reads
  const scrim = ctx.createLinearGradient(0, inY + inH - 300, 0, inY + inH);
  scrim.addColorStop(0, hexA(S.scrim, 0));
  scrim.addColorStop(1, hexA(S.scrim, 0.9));
  ctx.fillStyle = scrim;
  ctx.fillRect(inX, inY + inH - 300, inW, 300);
  ctx.restore();

  // builder id pill
  const idText = `BUILDER ID / ${o.builderId}`;
  ctx.font = `800 30px ${f.body}`;
  const pillW = ctx.measureText(idText).width + idText.length * 4 + 68;
  const pillY = inY + inH - 104;
  ctx.fillStyle = S.amber;
  shapePath(ctx, inX + 34, pillY, pillW, 70, 35, false);
  ctx.fill();
  ctx.fillStyle = S.onRibbon;
  tracked(ctx, idText, inX + 68, pillY + 47, 4);

  // authenticity stamp, pressed over the photo corner
  drawGoaStamp(ctx, inX + inW - 176, inY + 190, 172, S.amber, -0.16, o.stamp ?? defaultStamp);

  /* ------------------------------- identity ------------------------------- */
  let y = phY + phH + 132;
  const name = (o.name || "Your Name").toUpperCase();
  const ns = fitText(ctx, name, CW, 132, "800", SANS);
  ctx.fillStyle = S.paper;
  ctx.font = `800 ${ns}px ${SANS}`;
  ctx.textAlign = "left";
  ctx.fillText(name, M, y);

  // role chip
  y += 52;
  const roleText = (o.role || "Builder · Full Stack").toUpperCase();
  ctx.font = `800 28px ${f.body}`;
  const rw = ctx.measureText(roleText).width + roleText.length * 3 + 60;
  ctx.fillStyle = hexA(S.paper, 0.08);
  shapePath(ctx, M, y, Math.min(rw, CW), 68, 34, false);
  ctx.fill();
  ctx.strokeStyle = S.surf;
  ctx.lineWidth = 3;
  shapePath(ctx, M, y, Math.min(rw, CW), 68, 34, false);
  ctx.stroke();
  ctx.fillStyle = S.surf;
  tracked(ctx, roleText, M + 30, y + 45, 3);

  // builder class
  y += 156;
  ctx.fillStyle = S.surf;
  ctx.font = `800 26px ${f.body}`;
  tracked(ctx, "BUILDER CLASS", M, y, 8);
  const cls = (o.title || "Future Builder").toUpperCase();
  const cs = fitText(ctx, cls, CW, 78, "800", SANS);
  ctx.fillStyle = S.amber;
  ctx.font = `800 ${cs}px ${SANS}`;
  ctx.fillText(cls, M, y + 108);

  /* -------------------------------- coast --------------------------------- */
  const rbH = 104;
  const rbY = H - ip - rbH;
  coastLine(ctx, ip, rbY - 150, W - ip * 2, S.paper, 0.07);

  /* -------------------------------- ribbon -------------------------------- */
  rule(ctx, ip + 18, rbY - 22, W - (ip + 18) * 2, 6, S.surf);
  ctx.fillStyle = S.paper;
  ctx.fillRect(ip, rbY, W - ip * 2, rbH);
  ctx.fillStyle = S.onRibbon;
  ctx.font = `800 44px ${SANS}`;
  ctx.textAlign = "left";
  tracked(ctx, "HH GOA 2026", M, rbY + 68, 6);
  ctx.textAlign = "right";
  ctx.font = `700 26px ${f.body}`;
  ctx.fillText("15.57°N 73.74°E", W - M, rbY + 66);
  ctx.textAlign = "left";

  ctx.restore();
}



/* ---------------------------------- FRAME --------------------------------- */

export function renderFrame(canvas: HTMLCanvasElement, o: CardOptions) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const S = (canvas.width = canvas.height = FRAME_S);
  const t = THEMES[o.theme];
  const f = FONTS[o.font];
  ctx.clearRect(0, 0, S, S);

  const cx = S / 2;
  const cy = S / 2;
  const outer = S / 2 - 40;

  if (!o.transparent) {
    const g = ctx.createLinearGradient(0, 0, S, S);
    g.addColorStop(0, t.bg[0]);
    g.addColorStop(0.5, t.bg[1]);
    g.addColorStop(1, t.bg[2]);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, S, S);
    drawPattern(ctx, S, S, o.pattern, t.text);
    if (o.theme === "palmnight" || o.theme === "neon" || o.theme === "monsoon")
      starField(ctx, S, S, "#ffffff", 160);
    drawGoaScene(ctx, cx, S * 0.86, 1.4, t.text, 0.08);
  }

  // outer glow halo
  ctx.save();
  const halo = ctx.createRadialGradient(cx, cy, outer * 0.7, cx, cy, outer * 1.05);
  halo.addColorStop(0, hexA(o.accentColor, (o.glow / 100) * 0.45));
  halo.addColorStop(1, hexA(o.accentColor, 0));
  ctx.fillStyle = halo;
  ctx.fillRect(0, 0, S, S);
  ctx.restore();

  const photoR = outer - 130;
  drawCirclePhoto(ctx, o, cx, cy, photoR);

  // rings
  gradientRing(ctx, cx, cy, photoR + 22, 26, o.frameColor, o.accentColor, o.glow);
  gradientRing(ctx, cx, cy, photoR + 62, 4, o.accentColor, "#8B5CF6", o.glow * 0.6);

  // tick marks
  ctx.save();
  ctx.translate(cx, cy);
  for (let i = 0; i < 72; i++) {
    ctx.rotate((Math.PI * 2) / 72);
    ctx.strokeStyle = hexA(o.accentColor, i % 6 === 0 ? 0.85 : 0.3);
    ctx.lineWidth = i % 6 === 0 ? 6 : 3;
    ctx.beginPath();
    ctx.moveTo(0, -(photoR + 86));
    ctx.lineTo(0, -(photoR + (i % 6 === 0 ? 116 : 102)));
    ctx.stroke();
  }
  ctx.restore();

  // floating stars around ring
  let seed = 11;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < 34; i++) {
    const a = rnd() * Math.PI * 2;
    const rad = photoR + 130 + rnd() * 90;
    const x = cx + Math.cos(a) * rad;
    const y = cy + Math.sin(a) * rad;
    const size = 6 + rnd() * 16;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rnd() * Math.PI);
    ctx.fillStyle = hexA(rnd() > 0.5 ? o.accentColor : o.frameColor, 0.35 + rnd() * 0.5);
    ctx.beginPath();
    ctx.moveTo(0, -size);
    ctx.quadraticCurveTo(0, 0, size, 0);
    ctx.quadraticCurveTo(0, 0, 0, size);
    ctx.quadraticCurveTo(0, 0, -size, 0);
    ctx.quadraticCurveTo(0, 0, 0, -size);
    ctx.fill();
    ctx.restore();
  }

  // curved top text: HH GOA 2026
  const arc = (text: string, radius: number, startAngle: number, size: number, color: string, spread: number) => {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(startAngle);
    ctx.fillStyle = color;
    ctx.font = `700 ${size}px ${f.head}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const chars = [...text];
    const step = spread / Math.max(1, chars.length - 1);
    ctx.rotate(-(spread / 2));
    for (const c of chars) {
      ctx.save();
      ctx.translate(0, -radius);
      ctx.fillText(c, 0, 0);
      ctx.restore();
      ctx.rotate(step);
    }
    ctx.restore();
    ctx.textBaseline = "alphabetic";
  };
  arc("HACKER HOUSE GOA", photoR + 96, 0, 62, t.text, 1.15);
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(Math.PI);
  ctx.translate(-cx, -cy);
  arc("2026 · #FRAMEINGOA", photoR + 96, 0, 58, o.accentColor, 1.05);
  ctx.restore();
}

export function renderCard(canvas: HTMLCanvasElement, o: CardOptions, mode: "badge" | "frame") {
  mode === "badge" ? renderBadge(canvas, o) : renderFrame(canvas, o);
}
