/**
 * Pure TypeScript QR Code SVG generator (Byte mode, Error Correction L/M, Versions 1-6)
 * Produces scannable ISO/IEC 18004 QR codes with zero external dependencies.
 */

const GF_EXP = new Uint8Array(512);
const GF_LOG = new Uint8Array(256);

(() => {
  let x = 1;
  for (let i = 0; i < 255; i++) {
    GF_EXP[i] = x;
    GF_LOG[x] = i;
    x <<= 1;
    if (x & 0x100) x ^= 0x11d;
  }
  for (let i = 255; i < 512; i++) {
    GF_EXP[i] = GF_EXP[i - 255];
  }
})();

function gfMul(a: number, b: number): number {
  if (a === 0 || b === 0) return 0;
  return GF_EXP[GF_LOG[a] + GF_LOG[b]];
}

function polyMul(p: number[], q: number[]): number[] {
  const res = new Array(p.length + q.length - 1).fill(0);
  for (let i = 0; i < p.length; i++) {
    for (let j = 0; j < q.length; j++) {
      res[i + j] ^= gfMul(p[i], q[j]);
    }
  }
  return res;
}

function rsGeneratorPoly(ecLen: number): number[] {
  let poly = [1];
  for (let i = 0; i < ecLen; i++) {
    poly = polyMul(poly, [1, GF_EXP[i]]);
  }
  return poly;
}

function rsEncode(data: number[], ecLen: number): number[] {
  const gen = rsGeneratorPoly(ecLen);
  const res = new Array(data.length + ecLen).fill(0);
  for (let i = 0; i < data.length; i++) res[i] = data[i];
  for (let i = 0; i < data.length; i++) {
    const coef = res[i];
    if (coef !== 0) {
      for (let j = 0; j < gen.length; j++) {
        res[i + j] ^= gfMul(gen[j], coef);
      }
    }
  }
  return res.slice(data.length);
}

interface VersionSpec {
  version: number;
  size: number;
  dataCodewords: number;
  ecCodewordsPerBlock: number;
  blocks: number;
  alignPos: number[];
}

// Level L specs for versions 1 to 8 (single block or uniform blocks)
const VERSIONS: VersionSpec[] = [
  { version: 1, size: 21, dataCodewords: 19, ecCodewordsPerBlock: 7, blocks: 1, alignPos: [] },
  { version: 2, size: 25, dataCodewords: 34, ecCodewordsPerBlock: 10, blocks: 1, alignPos: [6, 18] },
  { version: 3, size: 29, dataCodewords: 55, ecCodewordsPerBlock: 15, blocks: 1, alignPos: [6, 22] },
  { version: 4, size: 33, dataCodewords: 80, ecCodewordsPerBlock: 20, blocks: 1, alignPos: [6, 26] },
  { version: 5, size: 37, dataCodewords: 108, ecCodewordsPerBlock: 26, blocks: 1, alignPos: [6, 30] },
  { version: 6, size: 41, dataCodewords: 136, ecCodewordsPerBlock: 18, blocks: 2, alignPos: [6, 34] },
  { version: 7, size: 45, dataCodewords: 156, ecCodewordsPerBlock: 20, blocks: 2, alignPos: [6, 22, 38] },
  { version: 8, size: 49, dataCodewords: 194, ecCodewordsPerBlock: 24, blocks: 2, alignPos: [6, 24, 42] },
];

export function generateQrMatrix(text: string): boolean[][] {
  const bytes = new TextEncoder().encode(text);
  const spec =
    VERSIONS.find((v) => v.dataCodewords >= bytes.length + 3) || VERSIONS[VERSIONS.length - 1];
  const maxBytes = spec.dataCodewords - 2;
  const payload = bytes.slice(0, maxBytes);

  // Bit buffer: Mode (0100 = Byte), Length (8 bits for v1-v9), Data, Terminator
  const bits: number[] = [];
  const pushBits = (val: number, len: number) => {
    for (let i = len - 1; i >= 0; i--) {
      bits.push((val >> i) & 1);
    }
  };

  pushBits(0b0100, 4);
  pushBits(payload.length, 8);
  for (let i = 0; i < payload.length; i++) {
    pushBits(payload[i], 8);
  }
  pushBits(0, Math.min(4, spec.dataCodewords * 8 - bits.length));
  while (bits.length % 8 !== 0) bits.push(0);

  const codewords: number[] = [];
  for (let i = 0; i < bits.length; i += 8) {
    let b = 0;
    for (let j = 0; j < 8; j++) b = (b << 1) | bits[i + j];
    codewords.push(b);
  }

  let padIdx = 0;
  while (codewords.length < spec.dataCodewords) {
    codewords.push(padIdx % 2 === 0 ? 0xec : 0x11);
    padIdx++;
  }

  // Split into blocks and compute ECC
  const blockSize = Math.floor(spec.dataCodewords / spec.blocks);
  const dataBlocks: number[][] = [];
  const ecBlocks: number[][] = [];
  let offset = 0;
  for (let b = 0; b < spec.blocks; b++) {
    const chunk = codewords.slice(offset, offset + blockSize);
    offset += blockSize;
    dataBlocks.push(chunk);
    ecBlocks.push(rsEncode(chunk, spec.ecCodewordsPerBlock));
  }

  const finalCodewords: number[] = [];
  for (let i = 0; i < blockSize; i++) {
    for (let b = 0; b < spec.blocks; b++) finalCodewords.push(dataBlocks[b][i]);
  }
  for (let i = 0; i < spec.ecCodewordsPerBlock; i++) {
    for (let b = 0; b < spec.blocks; b++) finalCodewords.push(ecBlocks[b][i]);
  }

  const size = spec.size;
  const grid: (boolean | null)[][] = Array.from({ length: size }, () => Array(size).fill(null));
  const reserved: boolean[][] = Array.from({ length: size }, () => Array(size).fill(false));

  const setModule = (r: number, c: number, dark: boolean, isFunc = true) => {
    if (r >= 0 && r < size && c >= 0 && c < size) {
      grid[r][c] = dark;
      if (isFunc) reserved[r][c] = true;
    }
  };

  // Finder patterns + separators
  const placeFinder = (row: number, col: number) => {
    for (let r = -1; r <= 7; r++) {
      for (let c = -1; c <= 7; c++) {
        if (r === -1 || r === 7 || c === -1 || c === 7) {
          setModule(row + r, col + c, false);
        } else {
          const dark =
            r === 0 || r === 6 || c === 0 || c === 6 || (r >= 2 && r <= 4 && c >= 2 && c <= 4);
          setModule(row + r, col + c, dark);
        }
      }
    }
  };

  placeFinder(0, 0);
  placeFinder(0, size - 7);
  placeFinder(size - 7, 0);

  // Timing patterns
  for (let i = 8; i < size - 8; i++) {
    const dark = i % 2 === 0;
    setModule(6, i, dark);
    setModule(i, 6, dark);
  }

  // Alignment patterns
  for (const r of spec.alignPos) {
    for (const c of spec.alignPos) {
      if (reserved[r][c]) continue;
      for (let dr = -2; dr <= 2; dr++) {
        for (let dc = -2; dc <= 2; dc++) {
          const dark = Math.max(Math.abs(dr), Math.abs(dc)) === 2 || (dr === 0 && dc === 0);
          setModule(r + dr, c + dc, dark);
        }
      }
    }
  }

  // Dark module
  setModule(size - 8, 8, true);

  // Reserve format info cells
  for (let i = 0; i < 9; i++) {
    if (!reserved[8][i]) reserved[8][i] = true;
    if (!reserved[i][8]) reserved[i][8] = true;
  }
  for (let i = size - 8; i < size; i++) {
    reserved[8][i] = true;
    reserved[i][8] = true;
  }

  // Reserve version info for v7+
  if (spec.version >= 7) {
    for (let i = 0; i < 6; i++) {
      for (let j = 0; j < 3; j++) {
        reserved[i][size - 11 + j] = true;
        reserved[size - 11 + j][i] = true;
      }
    }
  }

  // Place data bits with mask 0 ((r + c) % 2 === 0)
  const finalBits: number[] = [];
  for (const cw of finalCodewords) {
    for (let i = 7; i >= 0; i--) finalBits.push((cw >> i) & 1);
  }

  let bitIdx = 0;
  let up = true;
  for (let col = size - 1; col >= 1; col -= 2) {
    if (col === 6) col--;
    for (let i = 0; i < size; i++) {
      const r = up ? size - 1 - i : i;
      for (const c of [col, col - 1]) {
        if (!reserved[r][c]) {
          const bit = bitIdx < finalBits.length ? finalBits[bitIdx++] : 0;
          const masked = (r + c) % 2 === 0 ? bit ^ 1 : bit;
          grid[r][c] = masked === 1;
        }
      }
    }
    up = !up;
  }

  // Format information for EC Level L (01) + Mask 0 (000) -> 15-bit BCH + mask 101010000010010 = 0x77C4
  const FORMAT_L_MASK0 = 0x77c4;
  for (let i = 0; i < 15; i++) {
    const bit = ((FORMAT_L_MASK0 >> i) & 1) === 1;
    // Vertical
    if (i < 6) grid[i][8] = bit;
    else if (i < 8) grid[i + 1][8] = bit;
    else grid[size - 15 + i][8] = bit;
    // Horizontal
    if (i < 8) grid[8][size - 1 - i] = bit;
    else if (i < 9) grid[8][15 - i] = bit;
    else grid[8][15 - i - 1] = bit;
  }

  return grid.map((row) => row.map((cell) => Boolean(cell)));
}

export function generateQrSvg(text: string, pxSize = 112): string {
  const matrix = generateQrMatrix(text);
  const count = matrix.length;
  const quiet = 2;
  const total = count + quiet * 2;
  const rects: string[] = [];

  for (let r = 0; r < count; r++) {
    for (let c = 0; c < count; c++) {
      if (matrix[r][c]) {
        rects.push(`<rect x="${c + quiet}" y="${r + quiet}" width="1" height="1"/>`);
      }
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${total} ${total}" width="${pxSize}" height="${pxSize}" shape-rendering="crispEdges"><rect width="100%" height="100%" fill="#ffffff"/><g fill="#111827">${rects.join('')}</g></svg>`;
}
