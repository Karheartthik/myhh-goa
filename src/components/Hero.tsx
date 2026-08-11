import { motion } from "motion/react";
import { ArrowDown, Upload } from "lucide-react";

const serif = { fontFamily: "'Archivo Black', 'Sora', system-ui, sans-serif" } as const;
const deva = { fontFamily: "'Noto Sans Devanagari', 'Sora', sans-serif" } as const;

export function Hero({ onStart }: { onStart: () => void }) {
  return (
    <section className="relative mx-auto flex min-h-[92svh] w-full max-w-[1500px] flex-col justify-center px-6 py-20 sm:px-10">
      {/* top bar */}
      <div className="flex items-start justify-between">
        <div className="leading-none text-primary">
          <p className="font-display text-2xl font-extrabold tracking-tight sm:text-3xl">
            2:47<span className="ml-0.5 text-sm align-top">PM</span>
          </p>
          <p className="label-caps text-[10px] font-bold tracking-[0.28em]">Studio</p>
        </div>
        <div className="flex items-center gap-5">
          <span className="label-caps hidden text-[11px] tracking-[0.24em] text-foreground sm:inline">
            Check hype
          </span>
          <button
            onClick={onStart}
            className="label-caps rounded-[2px] bg-primary px-6 py-2.5 text-[12px] font-bold tracking-[0.22em] text-primary-foreground ring-2 ring-accent ring-offset-2 ring-offset-background transition-transform hover:-translate-y-0.5"
          >
            Apply
          </button>
        </div>
      </div>

      {/* wordmark */}
      <motion.div
        initial={{ opacity: 0, y: 26 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="mt-16 sm:mt-24"
      >
        <h1
          style={serif}
          className="flex flex-wrap items-center gap-x-[0.14em] gap-y-2 text-primary text-[15vw] font-normal uppercase leading-[0.88] tracking-[-0.01em] sm:text-[13.5vw]"
        >
          <span>HACKER</span>
          <span className="relative inline-flex items-center">
            HOUSE
            <span
              style={deva}
              className="ml-[0.16em] inline-block -rotate-6 rounded-[14px] bg-accent px-[0.24em] pb-[0.14em] pt-[0.06em] align-middle text-[0.26em] font-bold leading-none text-primary-foreground shadow-[0_6px_0_0_rgba(0,0,0,0.25)]"
              lang="hi"
            >
              गोवा
            </span>
          </span>
        </h1>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t-2 border-primary/40 pt-4">
          <p className="label-caps text-[11px] tracking-[0.3em] text-primary sm:text-[13px]">
            Goa, India · 28–31 Oct 2026
          </p>
          <p className="label-caps text-[11px] tracking-[0.3em] text-primary sm:text-[13px]">
            2:47 PM Studio
          </p>
        </div>
      </motion.div>

      {/* pitch + CTA */}
      <div className="mt-14 grid gap-10 md:grid-cols-[1.1fr_1fr] md:items-end">
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.7 }}
          className="max-w-xl font-display text-xl font-medium leading-snug text-foreground sm:text-2xl"
        >
          Sun, surf and shipping code. Upload your photo and mint your{" "}
          <span className="text-accent">Builder Identity</span>, stamped in Goa.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.7 }}
          className="flex flex-col items-start gap-4 md:items-end"
        >
          <button
            onClick={onStart}
            className="group inline-flex items-center gap-3 rounded-[2px] bg-primary px-8 py-4 font-display text-sm font-bold uppercase tracking-[0.2em] text-primary-foreground ring-2 ring-accent ring-offset-4 ring-offset-background transition-transform hover:-translate-y-1"
          >
            <Upload className="size-4" />
            Upload your photo
          </button>
          <span className="label-caps text-[10px] tracking-[0.26em] text-accent">
            #FrameInGoa · 001 of 2026
          </span>
        </motion.div>
      </div>

      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2.4, repeat: Infinity }}
        className="mt-16 text-primary/70"
      >
        <ArrowDown className="size-5" />
      </motion.div>
    </section>
  );
}
