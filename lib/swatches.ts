/** Swatch fills for the colour names used across the catalogue. */
const SWATCHES: Record<string, string> = {
  "Raw Indigo": "#2a3a6b",
  "Mid Blue": "#5b7fbd",
  "Light Blue": "#9db9dc",
  "Stone Wash": "#a8b7cd",
  Black: "#2b2b31",
  Chocolate: "#6b4a3a",
  Bone: "#e2d9c9",
  Hibiscus: "#c2185b",
  Olive: "#6f7650",
  Champagne: "#dcc39c",
  Emerald: "#2f7a5c",
  Midnight: "#232a52",
  Wine: "#7c2740",
  Navy: "#2b3a63",
  Sage: "#94a691",
  Rust: "#b1633a",
  Grey: "#9a9aa4",
  Camel: "#c39a6b",
};

export function swatchFor(color: string): string {
  return SWATCHES[color] ?? "#8d8d96";
}
