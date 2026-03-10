// South African flag colour palette + shared UI constants
const FONT_SIZE_KEY = 'k53_font_size';

export function getFontSize() {
  try { return localStorage.getItem(FONT_SIZE_KEY) || 'medium'; } catch { return 'medium'; }
}

export function setFontSize(size) {
  try { localStorage.setItem(FONT_SIZE_KEY, size); } catch {}
}

const FONT_SCALES = {
  small:  { base: 13, lg: 15, xl: 17, xxl: 22, heading: 26 },
  medium: { base: 15, lg: 17, xl: 19, xxl: 24, heading: 28 },
  large:  { base: 17, lg: 19, xl: 21, xxl: 27, heading: 32 },
  xlarge: { base: 20, lg: 22, xl: 24, xxl: 30, heading: 36 },
};

function buildTheme(size = 'medium') {
  const scale = FONT_SCALES[size] || FONT_SCALES.medium;
  return {
    // SA flag colours
    green:       '#007A4D',
    gold:        '#FFB612',
    red:         '#DE3831',
    blue:        '#4472CA',
    white:       '#F5F5F0',
    black:       '#000000',

    // UI surfaces (dark, green-tinted)
    bg:          '#060D07',
    surface:     '#0D1F10',
    surfaceAlt:  '#122116',
    border:      '#1A3020',
    borderBright:'#2A5035',

    // Typography
    text:        '#E8EDE0',
    dim:         '#6B7A62',
    font:        "'Georgia', 'Times New Roman', serif",
    mono:        "'Courier New', monospace",

    // Spacing
    radius:   10,
    radiusLg: 14,

    // Dynamic font sizes
    fontSize:        scale.base,
    fontSizeLg:      scale.lg,
    fontSizeXl:      scale.xl,
    fontSizeXxl:     scale.xxl,
    fontSizeHeading: scale.heading,
  };
}

export const T = buildTheme(getFontSize());
export default T;
