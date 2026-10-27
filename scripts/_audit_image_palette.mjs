import sharp from 'sharp';
import { ROAD_SIGNS } from '../src/data/roadSigns.js';
import path from 'path';

const DIR = path.resolve('public/signs');
const seen = new Set();
const flagged = [];

for (const s of ROAD_SIGNS) {
  if (!s.img || seen.has(s.img)) continue;
  seen.add(s.img);
  const file = path.join(DIR, s.img);
  try {
    const { data, info } = await sharp(file).resize(40, 40, { fit: 'fill' }).raw().toBuffer({ resolveWithObject: true });
    const channels = info.channels;
    let blueish = 0, total = 0;
    for (let i = 0; i < data.length; i += channels) {
      const r = data[i], g = data[i + 1], b = data[i + 2];
      total++;
      // SA warning/regulatory signs never use a dark navy/blue fill as the dominant triangle colour
      // (command signs are blue CIRCLES, but warning triangles are white with red border & black icon).
      if (b > r + 25 && b > g + 10 && b > 60) blueish++;
    }
    const frac = blueish / total;
    if ((s.shape || '').includes('triangle') && frac > 0.15) {
      flagged.push(`${s.code}  ${s.name}  img=${s.img}  blueFraction=${frac.toFixed(2)}`);
    }
  } catch (e) {
    flagged.push(`${s.code}  ${s.name}  img=${s.img}  ERROR: ${e.message}`);
  }
}
console.log(`Scanned ${seen.size} unique images. ${flagged.length} suspicious (non-SA palette on a triangle sign):\n`);
flagged.forEach(f => console.log(f));
