import { Flame, Instagram, Youtube, MessageCircle, MapPin, Clock, Phone } from "lucide-react";
import Reveal from "./shared/Reveal";
import { siteConfig, buildWhatsAppUrl } from "../../../../config/site";

export default function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-white/5 bg-[oklch(0.1_0.005_20)] pt-24 pb-10">
      {/* CTA final */}
      <div className="mx-auto max-w-5xl px-5 text-center md:px-8">
        <Reveal>
          <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.04] to-transparent p-10 md:p-16">
            <Flame className="mx-auto h-8 w-8 text-primary" />
            <h2 className="mt-5 font-display text-balance text-[clamp(2rem,5vw,3.5rem)] leading-[1] tracking-tight">
              Pronto para <span className="gradient-text-ember">forjar</span> a sua melhor versão?
            </h2>
            <p className="mx-auto mt-4 max-w-md text-white/60">
              Comece com 7 dias grátis. Sem cartão. Sem compromisso. Só resultado.
            </p>
            <a
              href="#cadastro"
              className="mt-8 inline-flex items-center gap-3 rounded-full gradient-ember px-7 py-3.5 text-sm font-semibold text-white ember-glow animate-pulse-glow"
            >
              Quero meu acesso <ArrowRightIcon className="h-4 w-4" />
            </a>
          </div>
        </Reveal>
      </div>

      <div className="mx-auto mt-20 grid max-w-7xl gap-12 px-5 md:grid-cols-4 md:px-8">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-lg gradient-ember ember-glow">
              <Flame className="h-4 w-4 text-white" strokeWidth={2.5} />
            </span>
            <span className="font-display text-xl tracking-[0.12em]">
              IRON <span className="text-primary">FORGE</span>
            </span>
          </div>
          <p className="mt-4 text-sm text-white/55">
            Forjando físicos extraordinários desde 2019.
          </p>
          <div className="mt-5 flex gap-3">
            {[
              { Icon: Instagram, label: "Acessar o Instagram da Iron Forge", href: siteConfig.social.instagram },
              { Icon: Youtube, label: "Acessar o canal do YouTube da Iron Forge", href: siteConfig.social.youtube },
              { Icon: MessageCircle, label: "Falar com a Iron Forge no WhatsApp", href: buildWhatsAppUrl() }
            ].map(({ Icon, label, href }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="grid h-9 w-9 place-items-center rounded-full border border-white/10 text-white/70 transition-colors hover:border-primary hover:text-primary"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>

        <div>
          <div className="text-xs uppercase tracking-[0.25em] text-white/40">Endereço</div>
          <p className="mt-3 flex items-start gap-2 text-sm text-white/75">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            {siteConfig.address.full}
          </p>
        </div>
        <div>
          <div className="text-xs uppercase tracking-[0.25em] text-white/40">Horário</div>
          <p className="mt-3 flex items-start gap-2 text-sm text-white/75">
            <Clock className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            {siteConfig.hours}
          </p>
        </div>
        <div>
          <div className="text-xs uppercase tracking-[0.25em] text-white/40">Contato</div>
          <p className="mt-3 flex items-start gap-2 text-sm text-white/75">
            <Phone className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            (84) 99123-4567
          </p>
        </div>
      </div>

      {/* Google Maps Embed */}
      <div className="mx-auto mt-12 max-w-7xl px-5 md:px-8">
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[oklch(0.14_0.005_20)] p-1 h-80 shadow-2xl">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15876.541416972007!2d-35.1843231!3d-5.8860714!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x7b2fc20054fffff%3A0xc3cbcfd1f67f5df5!2sPonta+Negra%2C+Natal+-+RN!5e0!3m2!1spt-BR!2sbr!4v1700000000000!5m2!1spt-BR!2sbr"
            width="100%"
            height="100%"
            style={{ 
              border: 0 
            }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="w-full h-full rounded-xl"
            title="Localização da Iron Forge"
          />
        </div>
      </div>

      <div className="mx-auto mt-10 max-w-7xl px-5 text-xs text-white/40 md:flex md:items-center md:justify-between md:px-8">
        <span>© {new Date().getFullYear()} Iron Forge. Todos os direitos reservados.</span>
        <span className="mt-2 block md:mt-0">Forjado em {siteConfig.address.city}.</span>
      </div>
    </footer>
  );
}

// ArrowRightIcon defined here to avoid importing ArrowRight from different lucide set since Lucide-react is imported
function ArrowRightIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}
