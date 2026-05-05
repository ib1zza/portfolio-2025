const ABSOLUTE_ASSET_PATTERN = /^(?:[a-z]+:)?\/\//i;
const PROTOCOL_ASSET_PATTERN = /^(?:mailto:|tel:|data:|blob:)/i;

export const getAssetPath = (path: string) => {
  if (ABSOLUTE_ASSET_PATTERN.test(path) || PROTOCOL_ASSET_PATTERN.test(path)) {
    return path;
  }

  const base = import.meta.env.BASE_URL.endsWith("/")
    ? import.meta.env.BASE_URL
    : `${import.meta.env.BASE_URL}/`;
  const normalizedPath = path.startsWith("/") ? path.slice(1) : path;

  return `${base}${normalizedPath}`;
};
