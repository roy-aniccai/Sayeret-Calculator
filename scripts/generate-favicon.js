/**
 * Simple script to create a basic favicon.ico file
 * This creates a minimal 16x16 favicon with the shield logo concept
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create a simple 16x16 ICO file header + bitmap data
// This is a minimal implementation for a basic favicon
const createSimpleFavicon = () => {
  // ICO file header (6 bytes)
  const header = Buffer.from([
    0x00, 0x00, // Reserved (must be 0)
    0x01, 0x00, // Image type (1 = ICO)
    0x01, 0x00  // Number of images (1)
  ]);

  // Image directory entry (16 bytes)
  const imageDir = Buffer.from([
    0x10,       // Width (16 pixels)
    0x10,       // Height (16 pixels)
    0x00,       // Color palette (0 = no palette)
    0x00,       // Reserved (must be 0)
    0x01, 0x00, // Color planes (1)
    0x20, 0x00, // Bits per pixel (32 = RGBA)
    0x00, 0x04, 0x00, 0x00, // Size of image data (1024 bytes)
    0x16, 0x00, 0x00, 0x00  // Offset to image data (22 bytes)
  ]);

  // Create a simple 16x16 RGBA bitmap representing a shield with calculator
  const imageData = Buffer.alloc(1024); // 16x16 * 4 bytes per pixel

  // Fill with a simple pattern representing the logo
  for (let y = 0; y < 16; y++) {
    for (let x = 0; x < 16; x++) {
      const offset = (y * 16 + x) * 4;
      
      // Create a simple shield shape with calculator elements
      const centerX = 8, centerY = 8;
      const distFromCenter = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
      
      if (distFromCenter < 7) {
        // Inside shield - blue color (#5a6b7d)
        imageData[offset] = 0x7d;     // Blue
        imageData[offset + 1] = 0x6b; // Green
        imageData[offset + 2] = 0x5a; // Red
        imageData[offset + 3] = 0xff; // Alpha
      } else {
        // Outside shield - transparent
        imageData[offset] = 0x00;
        imageData[offset + 1] = 0x00;
        imageData[offset + 2] = 0x00;
        imageData[offset + 3] = 0x00;
      }
      
      // Add some white elements for calculator buttons
      if ((x === 5 || x === 7 || x === 9 || x === 11) && (y === 10 || y === 12)) {
        imageData[offset] = 0xff;     // Blue
        imageData[offset + 1] = 0xff; // Green
        imageData[offset + 2] = 0xff; // Red
        imageData[offset + 3] = 0xff; // Alpha
      }
    }
  }

  // Combine all parts
  return Buffer.concat([header, imageDir, imageData]);
};

// Generate and save the favicon
const faviconData = createSimpleFavicon();
const faviconPath = path.join(__dirname, '..', 'public', 'favicon.ico');

fs.writeFileSync(faviconPath, faviconData);
console.log('Generated favicon.ico successfully!');