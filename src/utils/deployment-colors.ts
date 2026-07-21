// /src/utils/deployment-colors.ts

type DeploymentColors = {
  bg: string;
  dot: string;
  text: string;
};

function hueFromString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash) % 360;
}

// CONSTANTS
const BG_LIGHTNESS = 0.35;
const BG_CHROMA = 0.12;

const DOT_LIGHTNESS = 0.65;
const DOT_CHROMA = 0.18;

const TEXT_LIGHTNESS = 0.92;
const TEXT_CHROMA = 0.04;

export function getDeploymentColors(name: string): DeploymentColors {
  const hue = hueFromString(name);
  return {
    bg: `oklch(${BG_LIGHTNESS} ${BG_CHROMA} ${hue} / 75%)`, // dark, muted background
    dot: `oklch(${DOT_LIGHTNESS} ${DOT_CHROMA} ${hue})`, // full strength indicator
    text: `oklch(${TEXT_LIGHTNESS} ${TEXT_CHROMA} ${hue})`, // light foreground for contrast
  };
}
