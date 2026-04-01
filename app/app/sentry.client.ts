import { useLocation, useMatches } from "@remix-run/react";
import * as Sentry from "@sentry/remix";
import { useEffect } from "react";

/** Same pattern as WoofiPro: DSN in source. */
const SENTRY_DSN =
  "https://474e94616f17ffbaa5f1e2c001f85a5e@o4510468552654848.ingest.us.sentry.io/4511035406745600";

export function initSentryBrowser() {
  Sentry.init({
    dsn: SENTRY_DSN,
    environment: import.meta.env.VITE_DEPLOYMENT_ENV || import.meta.env.MODE,
    sendDefaultPii: true,
    tracesSampleRate: import.meta.env.PROD ? 0.2 : 1,
    integrations: [
      Sentry.browserTracingIntegration({
        useEffect,
        useLocation,
        useMatches,
      }),
    ],
  });
}
