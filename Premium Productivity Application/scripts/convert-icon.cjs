/**
 * Convert PNG to ICO format for Windows desktop icon.
 * Uses pure Node.js — no external dependencies needed.
 * Creates a Windows ICO by embedding the supplied 256px PNG.
 */
const fs = require("fs");
const path = require("path");

const SOURCE_PNG = path.join(__dirname, "..", "electron", "icon.png");
const OUTPUT_ICO = path.join(__dirname, "..", "electron", "icon.ico");

function createIcoFromPng(pngBuffer) {
  // ICO format with PNG data embedded (Vista+ ICO format)
  // This is valid for Windows 7+ and works perfectly for Electron
  const sizes = [256]; // Use 256px PNG-in-ICO (Windows scales it)

  // ICO Header: 3 x WORD
  const headerSize = 6;
  const dirEntrySize = 16;
  const numImages = sizes.length;

  const header = Buffer.alloc(headerSize);
  header.writeUInt16LE(0, 0);        // Reserved
  header.writeUInt16LE(1, 2);        // Type: 1 = ICO
  header.writeUInt16LE(numImages, 4); // Number of images

  // Directory entries
  const dirEntries = Buffer.alloc(dirEntrySize * numImages);
  const dataOffset = headerSize + dirEntrySize * numImages;

  for (let i = 0; i < numImages; i++) {
    const offset = i * dirEntrySize;
    const size = sizes[i];
    dirEntries.writeUInt8(size === 256 ? 0 : size, offset);     // Width (0 = 256)
    dirEntries.writeUInt8(size === 256 ? 0 : size, offset + 1); // Height (0 = 256)
    dirEntries.writeUInt8(0, offset + 2);                        // Color palette
    dirEntries.writeUInt8(0, offset + 3);                        // Reserved
    dirEntries.writeUInt16LE(1, offset + 4);                     // Color planes
    dirEntries.writeUInt16LE(32, offset + 6);                    // Bits per pixel
    dirEntries.writeUInt32LE(pngBuffer.length, offset + 8);      // Size of image data
    dirEntries.writeUInt32LE(dataOffset, offset + 12);           // Offset to image data
  }

  return Buffer.concat([header, dirEntries, pngBuffer]);
}

// Main
if (!fs.existsSync(SOURCE_PNG)) {
  console.error(`Source PNG not found: ${SOURCE_PNG}`);
  process.exit(1);
}

const pngData = fs.readFileSync(SOURCE_PNG);
const icoData = createIcoFromPng(pngData);
fs.writeFileSync(OUTPUT_ICO, icoData);
console.log(`ICO created: ${OUTPUT_ICO} (${icoData.length} bytes)`);
