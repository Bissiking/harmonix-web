// Les anciennes versions de Sonora exposent les métadonnées Kyros sans hasClientId.
export function loginAvailability(config) {
  if (!config || config.provider !== "kyros") return "incompatible";
  if (typeof config.hasClientId === "boolean") return config.hasClientId ? "available" : "unconfigured";
  if (typeof config.issuer === "string" && config.issuer.trim()) return "available";
  return "incompatible";
}
