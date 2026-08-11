import { useEffect, useState } from "react";
import { Slider } from "@/components/ui/slider";

const KEY = "hh-goa-tint";
const DEFAULT = 60;

/**
 * Theme intensity: scales how green the surfaces read (--tint) while the
 * mango + bougainvillea accents stay fully vibrant at every setting.
 */
export function ThemeIntensity() {
  const [value, setValue] = useState(DEFAULT);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const stored = Number(window.localStorage.getItem(KEY));
    if (Number.isFinite(stored) && stored > 0) setValue(stored);
  }, []);

  useEffect(() => {
    document.documentElement.style.setProperty("--tint", String(value / 100));
    window.localStorage.setItem(KEY, String(value));
  }, [value]);

  return (
    <div className="fixed right-4 top-4 z-50 flex flex-col items-end gap-2">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="label-caps rounded-full border border-primary/50 bg-surface-deep/90 px-4 py-2 text-[9px] text-primary backdrop-blur transition-colors hover:bg-primary hover:text-primary-foreground"
      >
        Theme {value}%
      </button>

      {open && (
        <div className="w-64 rounded-2xl border border-border bg-popover/95 p-4 shadow-xl backdrop-blur">
          <p className="label-caps text-[9px] text-muted-foreground">Theme intensity</p>
          <p className="mt-1 font-mono text-xs text-foreground">
            Dial the green down without dulling the mango and pink.
          </p>
          <Slider
            className="mt-4"
            min={10}
            max={100}
            step={5}
            value={[value]}
            onValueChange={([v]) => setValue(v ?? DEFAULT)}
            aria-label="Theme intensity"
          />
          <div className="mt-2 flex justify-between">
            <span className="label-caps text-[8px] text-muted-foreground">Muted</span>
            <span className="label-caps text-[8px] text-primary">Full Goa</span>
          </div>
        </div>
      )}
    </div>
  );
}
