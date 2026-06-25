import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/lib/utils";
import { ArrowRight, Flame, Menu, X } from "lucide-react";

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    { href: "#beneficios", label: "Benefícios" },
    { href: "#estrutura", label: "Estrutura" },
    { href: "#resultados", label: "Resultados" },
    { href: "#planos", label: "Planos" },
    { href: "#depoimentos", label: "Depoimentos" },
  ];

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-all duration-500",
        scrolled ? "backdrop-blur-xl bg-background/70 border-b border-white/5" : "bg-transparent",
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 md:px-8">
        <a href="#top" className="flex items-center gap-2.5 group">
          <span className="grid h-9 w-9 place-items-center rounded-lg gradient-ember ember-glow transition-transform group-hover:scale-105">
            <Flame className="h-4 w-4 text-white" strokeWidth={2.5} />
          </span>
          <span className="font-display text-xl tracking-[0.12em]">
            IRON <span className="text-primary">FORGE</span>
          </span>
        </a>

        <nav aria-label="Principal" className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="relative text-sm text-white/70 transition-colors hover:text-white"
            >
              {l.label}
              <span className="absolute -bottom-1 left-0 h-px w-0 bg-primary transition-all duration-300 group-hover:w-full" />
            </a>
          ))}
        </nav>

        <a
          href="#cadastro"
          className="hidden md:inline-flex items-center gap-2 rounded-full gradient-ember px-5 py-2.5 text-sm font-semibold text-white ember-glow transition-transform hover:scale-[1.03]"
        >
          Matricule-se
          <ArrowRight className="h-3.5 w-3.5" />
        </a>

        <button
          className="md:hidden grid h-10 w-10 place-items-center rounded-lg border border-white/10"
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? "Fechar menu" : "Abrir menu"}
          aria-expanded={open}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden border-t border-white/5 bg-background/95 backdrop-blur-xl"
          >
            <div className="mx-auto flex max-w-7xl flex-col gap-1 px-5 py-4">
              {links.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-3 text-base text-white/80 hover:bg-white/5"
                >
                  {l.label}
                </a>
              ))}
              <a
                href="#cadastro"
                onClick={() => setOpen(false)}
                className="mt-2 inline-flex items-center justify-center gap-2 rounded-full gradient-ember px-5 py-3 text-sm font-semibold text-white"
              >
                Matricule-se <ArrowRight className="h-3.5 w-3.5" />
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
