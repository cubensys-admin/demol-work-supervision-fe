const DEFAULT_DEV_API = "http://localhost:8080";
const DEFAULT_PROD_API = "http://115.68.223.95:8080";

const nodeEnv = process.env.NODE_ENV ?? "development";
const configuredAppEnv = process.env.NEXT_PUBLIC_APP_ENV;
const appEnv = nodeEnv === "production" ? "production" : configuredAppEnv ?? nodeEnv;

const shouldForceProdApi = nodeEnv === "production";

const apiBaseUrl = shouldForceProdApi
  ? DEFAULT_PROD_API
  : process.env.NEXT_PUBLIC_API_BASE_URL ??
    (appEnv === "production" ? DEFAULT_PROD_API : DEFAULT_DEV_API);

export const env = {
  appEnv,
  apiBaseUrl,
  isDevelopment: appEnv !== "production",
  isProduction: appEnv === "production",
};

export type AppEnvironment = typeof env.appEnv;
