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
    // SA flag palette
    green:       '#007A4D',
    gold:        '#FFB612',
    red:         '#DE3831',
    blue:        '#4472CA',
    white:       '#F5F5F0',
    black:       '#000000',

    // Dark surfaces — deep navy-black (more premium than green-tinted)
    bg:          '#0a0a0f',
    surface:     '#111118',
    surfaceAlt:  '#18181f',
    surfaceGlass:'rgba(24,24,31,0.7)',
    border:      '#2a2a3a',
    borderBright:'#3a3a4a',

    // Text
    text:        '#eeeef5',
    dim:         '#6b6b82',

    // Typography — Inter for modern SaaS feel
    font:        "'Inter','Segoe UI',system-ui,sans-serif",
    mono:        "'Courier New',monospace",

    // Spacing
    radius:   12,
    radiusLg: 18,
    radiusXl: 24,

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
