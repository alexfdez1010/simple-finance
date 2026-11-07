import { readFile, writeFile } from 'node:fs/promises';
import sharp from 'sharp';

/** Renders the owned SVG source into opaque install icons and a PNG-backed favicon; run from the repo root. */
async function generateIcons(): Promise<void> {
  const source = await readFile('public/icons/app.svg');
  for (const [name, size] of [
    ['icon-192.png', 192],
    ['icon-512.png', 512],
    ['maskable-512.png', 512],
    ['apple-touch-icon.png', 180],
  ] as const) {
    await sharp(source)
      .resize(size, size)
      .flatten({ background: '#1d1d1f' })
      .png()
      .toFile(`public/icons/${name}`);
  }
  const png = await sharp(source)
    .resize(48, 48)
    .flatten({ background: '#1d1d1f' })
    .ensureAlpha()
    .png()
    .toBuffer();
  const header = Buffer.alloc(22);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(1, 4);
  header[6] = 48;
  header[7] = 48;
  header.writeUInt16LE(1, 10);
  header.writeUInt16LE(32, 12);
  header.writeUInt32LE(png.length, 14);
  header.writeUInt32LE(22, 18);
  await writeFile('src/app/favicon.ico', Buffer.concat([header, png]));
}

await generateIcons();
