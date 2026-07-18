import mixpanel from "mixpanel-browser";

let isMixpanelInitialized = false;

export interface MixpanelLogEntry {
  eventName: string;
  properties: Record<string, any>;
  timestamp: string;
}

export const localMixpanelLogs: MixpanelLogEntry[] = [];
let onLogCallbacks: ((log: MixpanelLogEntry) => void)[] = [];

/**
 * Registers a listener that gets notified whenever a Mixpanel event is tracked.
 */
export const registerMixpanelLogListener = (callback: (log: MixpanelLogEntry) => void) => {
  onLogCallbacks.push(callback);
  return () => {
    onLogCallbacks = onLogCallbacks.filter(cb => cb !== callback);
  };
};

/**
 * Returns whether Mixpanel is successfully initialized.
 */
export const getIsMixpanelInitialized = () => isMixpanelInitialized;

/**
 * Initializes Mixpanel with the provided token.
 */
export const initMixpanel = (token: string) => {
  const cleanToken = token?.trim();
  if (!cleanToken || isMixpanelInitialized) return;

  try {
    mixpanel.init(cleanToken, {
      debug: false,
      track_pageview: false, // Explicit page view tracking for control
      persistence: "localStorage",
      ignore_dnt: true // Ensure tracking works for users with Do Not Track
    });
    isMixpanelInitialized = true;
    console.log("[Mixpanel] Inicializado con éxito");
  } catch (err) {
    console.warn("[Mixpanel] Error al inicializar:", err);
  }
};

/**
 * Ensures Mixpanel is initialized before tracking.
 * Checks the provided token or falls back to VITE_MIXPANEL_TOKEN env.
 */
const ensureInitialized = (token?: string) => {
  if (isMixpanelInitialized) return true;

  // Try the provided token
  if (token?.trim()) {
    initMixpanel(token);
    return isMixpanelInitialized;
  }

  // Try the environment variable
  const envToken = (import.meta as any).env?.VITE_MIXPANEL_TOKEN;
  if (envToken?.trim()) {
    initMixpanel(envToken);
    return isMixpanelInitialized;
  }

  return false;
};

/**
 * Tracks a custom event.
 */
export const trackEvent = (eventName: string, properties?: Record<string, any>, token?: string) => {
  const logEntry: MixpanelLogEntry = {
    eventName,
    properties: properties || {},
    timestamp: new Date().toLocaleTimeString()
  };
  
  localMixpanelLogs.unshift(logEntry);
  if (localMixpanelLogs.length > 20) {
    localMixpanelLogs.pop();
  }
  
  onLogCallbacks.forEach(cb => {
    try { cb(logEntry); } catch (e) {}
  });

  if (!ensureInitialized(token)) return;

  try {
    mixpanel.track(eventName, {
      ...properties,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      path: window.location.pathname
    });
  } catch (err) {
    console.warn(`[Mixpanel] Error al registrar evento "${eventName}":`, err);
  }
};

/**
 * Identifies the current user and sets their profile traits.
 */
export const identifyUser = (userId: string, traits?: Record<string, any>, token?: string) => {
  if (!ensureInitialized(token)) return;

  try {
    mixpanel.identify(userId);
    if (traits) {
      mixpanel.people.set({
        ...traits,
        $last_login: new Date().toISOString()
      });
    }
  } catch (err) {
    console.warn("[Mixpanel] Error al identificar usuario:", err);
  }
};

/**
 * Resets the Mixpanel session on sign out.
 */
export const resetMixpanel = () => {
  if (!isMixpanelInitialized) return;

  try {
    mixpanel.reset();
    console.log("[Mixpanel] Sesión reseteada");
  } catch (err) {
    console.warn("[Mixpanel] Error al resetear sesión:", err);
  }
};

