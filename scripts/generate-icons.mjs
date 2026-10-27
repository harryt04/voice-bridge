import { readFile, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const source = new URL('../public/icon.svg', import.meta.url)
const assets = [
  ['favicon-16x16.png', 16],
  ['favicon-32x32.png', 32],
  ['apple-touch-icon.png', 180],
  ['android-chrome-192x192.png', 192],
  ['android-chrome-512x512.png', 512],
]

for (const [name, size] of assets) {
  await sharp(await readFile(source), { density: 384 })
    .resize(size, size)
    .png()
    .toFile(fileURLToPath(new URL(`../public/${name}`, import.meta.url)))
}

const sizes = [16, 32, 48]
const images = await Promise.all(
  sizes.map((size) =>
    sharp(fileURLToPath(source), { density: 384 })
      .resize(size, size)
      .png()
      .toBuffer(),
  ),
)
const header = Buffer.alloc(6 + images.length * 16)
header.writeUInt16LE(1, 2)
header.writeUInt16LE(images.length, 4)
let offset = header.length
for (const [index, image] of images.entries()) {
  const entry = 6 + index * 16
  header[entry] = sizes[index]
  header[entry + 1] = sizes[index]
  header.writeUInt16LE(1, entry + 4)
  header.writeUInt16LE(32, entry + 6)
  header.writeUInt32LE(image.length, entry + 8)
  header.writeUInt32LE(offset, entry + 12)
  offset += image.length
}
await writeFile(
  new URL('../public/favicon.ico', import.meta.url),
  Buffer.concat([header, ...images]),
)
