// /src/utils/group-colors.ts

const PASTEL_HUES = [30, 80, 140, 200, 260, 320, 10, 100, 170, 230, 290, 350];

export function groupIndexToColor(index: number): string {
  const hue = PASTEL_HUES[index % PASTEL_HUES.length];
  return `oklch(88% 0.07 ${hue})`;
}

export function groupIndexToColorDark(index: number): string {
  const hue = PASTEL_HUES[index % PASTEL_HUES.length];
  return `oklch(30% 0.07 ${hue})`;
}
