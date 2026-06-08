export function isValidEnvKey(key: string): boolean {
  return /^[A-Z_][A-Z0-9_]*$/.test(key);
}

export function isValidPath(path: string): boolean {
  if (!path) return false;
  if (path.includes("\0")) return false;
  if (path.includes("../") || path.includes("..\\")) return false;
  return true;
}

export function isAbsolutePath(path: string): boolean {
  return /^([A-Za-z]:[\\/]|\/)/.test(path);
}
