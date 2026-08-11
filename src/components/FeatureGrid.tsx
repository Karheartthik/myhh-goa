import { motion } from "motion/react";
import { Palette, Smartphone, Twitter, Zap } from "lucide-react";

const features = [
  {
    icon: Zap,
    title: "Instant Generation",
    body: "Every tweak renders live on canvas. Faster than a Baga beach shack chai order.",
    tint: "from-primary/30",
  },
  {
    icon: Palette,
    title: "Premium Design",
    body: "Sunset gradients, azulejo tilework and Arabian Sea light baked into every single export.",
    tint: "from-violet/30",
  },
  {
    icon: Smartphone,
    title: "Mobile Ready",
    body: "One-handed studio controls, zero overflow, full resolution export straight from your phone.",
    tint: "from-cyan/30",
  },
  {
    icon: Twitter,
    title: "Share on X",
    body: "Download the PNG or fire off a pre-filled post with #FrameInGoa in a single tap.",
    tint: "from-sunset/30",
  },
];

export function FeatureGrid() {
  return (
    <section className="mx-auto max-w-6xl px-5 py-16">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {features.map((f, i) => (
          <motion.article
            key={f.title}
            initial={{ opacity: 0, y: 26 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ delay: i * 0.07, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            whileHover={{ y: -8 }}
            className="glass group relative overflow-hidden rounded-3xl p-6"
          >
            <div
              className={`absolute inset-x-0 -top-24 h-40 bg-gradient-to-b ${f.tint} to-transparent opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100`}
            />
            <div className="relative">
              <div className="grid size-11 place-items-center rounded-2xl bg-gradient-to-br from-sunset/25 to-primary/25 text-cyan ring-1 ring-white/10 transition-transform duration-500 group-hover:scale-110">
                <f.icon className="size-5" />
              </div>
              <h3 className="mt-5 font-display text-lg">{f.title}</h3>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{f.body}</p>
            </div>
          </motion.article>
        ))}
      </div>
    </section>
  );
}
