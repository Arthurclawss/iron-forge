import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { siteConfig } from "../../config/site";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";
import "@fontsource/inter/800.css";
import "@fontsource/inter/900.css";
import "@fontsource/bebas-neue/400.css";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Iron Forge — Forjando Físicos Extraordinários" },
      {
        name: "description",
        content:
          "A academia mais premium do Brasil. Treinos personalizados, equipamentos de última geração e resultados comprovados.",
      },
      { name: "author", content: "Iron Forge" },
      { name: "theme-color", content: "#0a0606" },
      { property: "og:title", content: "Iron Forge — Forjando Físicos Extraordinários" },
      {
        property: "og:description",
        content: "Junte-se a mais de 2.400 atletas que transformaram seus corpos na Iron Forge.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:title", content: "Iron Forge — Forjando Físicos Extraordinários" },
      { name: "description", content: "Iron Forge is a premium fitness landing page designed to deliver a high-conversion user experience. Built with modern web technologies, it features cinematic an" },
      { property: "og:description", content: "Iron Forge is a premium fitness landing page designed to deliver a high-conversion user experience. Built with modern web technologies, it features cinematic an" },
      { name: "twitter:description", content: "Iron Forge is a premium fitness landing page designed to deliver a high-conversion user experience. Built with modern web technologies, it features cinematic an" },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/e6e260be-d10b-4312-ab6b-30a9d253d77c/id-preview-b87df11f--c7df417a-e102-4e16-b639-5d85339d603d.lovable.app-1781819293696.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/e6e260be-d10b-4312-ab6b-30a9d253d77c/id-preview-b87df11f--c7df417a-e102-4e16-b639-5d85339d603d.lovable.app-1781819293696.png" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  const ga4 = siteConfig.analytics.ga4;
  const pixel = siteConfig.analytics.metaPixel;
  
  // Custom Analytics configured via environment variables
  const gtmId = typeof process !== "undefined" ? process.env.GTM_ID : undefined;
  const tiktokId = typeof process !== "undefined" ? process.env.TIKTOK_PIXEL_ID : undefined;
  const hotjarId = typeof process !== "undefined" ? process.env.HOTJAR_ID : undefined;

  return (
    <html lang="pt-BR">
      <head>
        <HeadContent />
        
        {/* Google Analytics 4 */}
        {ga4 && (
          <>
            <script async src={`https://www.googletagmanager.com/gtag/js?id=${ga4}`} />
            <script
              dangerouslySetInnerHTML={{
                __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${ga4}');`,
              }}
            />
          </>
        )}

        {/* Google Tag Manager (GTM) */}
        {gtmId && (
          <script
            dangerouslySetInnerHTML={{
              __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','${gtmId}');`,
            }}
          />
        )}

        {/* Meta Pixel (Facebook) */}
        {pixel && (
          <script
            dangerouslySetInnerHTML={{
              __html: `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${pixel}');fbq('track','PageView');`,
            }}
          />
        )}

        {/* TikTok Pixel */}
        {tiktokId && (
          <script
            dangerouslySetInnerHTML={{
              __html: `!function (w, d, t) { w.TiktokAnalyticsObject=t; var ttq=w[t]=w[t]||[]; ttq.methods=["page", "track", "identify", "instances", "debug", "on", "off", "once", "ready", "alias", "group", "enableCookie", "disableCookie"], ttq.setAndDefer=function(t, e){ t[e]=function(){ t.push([e].concat(Array.prototype.slice.call(arguments, 0))) } }; for (var e=0; e<ttq.methods.length; e++)ttq.setAndDefer(ttq, ttq.methods[e]); ttq.instance=function(t){ for (var e=ttq._i[t]||[], n=0; n<ttq.methods.length; n++)ttq.setAndDefer(e, ttq.methods[n]); return e }; ttq.load=function(e, n){ var i="https://analytics.tiktok.com/i18n/pixel/events.js"; ttq._i=ttq._i||{}, ttq._i[e]=[], ttq._i[e]._u=i, ttq._t=ttq._t||{}, ttq._t[e]=+new Date, ttq._o=ttq._o||{}, ttq._o[e]=n||{}; var o=d.createElement("script"); o.type="text/javascript", o.async=!0, o.src=i; var a=d.getElementsByTagName("script")[0]; a.parentNode.insertBefore(o, a) }; ttq.load('${tiktokId}'); ttq.page(); }(window, document, 'ttq');`,
            }}
          />
        )}

        {/* Hotjar Tracking Code */}
        {hotjarId && (
          <script
            dangerouslySetInnerHTML={{
              __html: `(function(h,o,t,j,a,r){h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};h._hjSettings={hjid:${hotjarId},hjsv:6};a=o.getElementsByTagName('head')[0];r=o.createElement('script');r.async=1;r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;a.appendChild(r);})(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');`,
            }}
          />
        )}

        {/* Structured LocalBusiness Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SportsActivityLocation",
              "name": "Iron Forge Premium Strength Club",
              "image": "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/e6e260be-d10b-4312-ab6b-30a9d253d77c/id-preview-b87df11f--c7df417a-e102-4e16-b639-5d85339d603d.lovable.app-1781819293696.png",
              "url": "https://ironforge.com.br",
              "telephone": "+5584991234567",
              "address": {
                "@type": "PostalAddress",
                "streetAddress": "Av. Eng. Roberto Freire, 3100",
                "addressLocality": "Natal",
                "addressRegion": "RN",
                "postalCode": "59090-000",
                "addressCountry": "BR"
              },
              "geo": {
                "@type": "GeoCoordinates",
                "latitude": -5.8860,
                "longitude": -35.1843
              },
              "openingHoursSpecification": [
                {
                  "@type": "OpeningHoursSpecification",
                  "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
                  "opens": "05:00",
                  "closes": "23:00"
                },
                {
                  "@type": "OpeningHoursSpecification",
                  "dayOfWeek": "Saturday",
                  "opens": "07:00",
                  "closes": "20:00"
                },
                {
                  "@type": "OpeningHoursSpecification",
                  "dayOfWeek": "Sunday",
                  "opens": "08:00",
                  "closes": "14:00"
                }
              ],
              "sameAs": [
                "https://instagram.com/ironforge",
                "https://youtube.com/@ironforge"
              ]
            })
          }}
        />
      </head>
      <body>
        {/* Google Tag Manager (noscript fallback) */}
        {gtmId && (
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
              height="0"
              width="0"
              style={{ display: "none", visibility: "hidden" }}
            />
          </noscript>
        )}
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
      <Outlet />
    </QueryClientProvider>
  );
}
