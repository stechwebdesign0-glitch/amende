import sharp from "sharp";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

const svgPath = fileURLToPath(new URL("./icon.svg", import.meta.url));
const outDir = fileURLToPath(new URL("../public/", import.meta.url));

const sizes = [
  { file: "icon-192.png", size: 192 },
  { file: "icon-512.png", size: 512 },
  { file: "icon-maskable-512.png", size: 512, padding: 0.2 },
  { file: "apple-touch-icon.png", size: 180 },
];

for (const { file, size, padding = 0 } of sizes) {
  const content = padding
    ? Buffer.from(
        `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">` +
          `<rect width="${size}" height="${size}" fill="#18181b"/>` +
          `<image href="data:image/svg+xml;base64,${Buffer.from(fs.readFileSync(svgPath)).toString("base64")}" ` +
          `x="${size * padding}" y="${size * padding}" width="${size * (1 - 2 * padding)}" height="${size * (1 - 2 * padding)}"/>` +
          `</svg>`,
      )
    : fs.readFileSync(svgPath);

  await sharp(content, { density: 384 })
    .resize(size, size)
    .png()
    .toFile(outDir + file);
  console.log(`wrote ${file} (${size}x${size})`);
}
