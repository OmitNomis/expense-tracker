import { execSync } from 'child_process';

// Generate PNG files from SVG
console.log('Generating icon files...');

try {
  // Generate 192x192 icon
  execSync('svgexport public/icon.svg public/icon-192.png 192:192');
  console.log('Generated icon-192.png');
  
  // Generate 512x512 icon
  execSync('svgexport public/icon.svg public/icon-512.png 512:512');
  console.log('Generated icon-512.png');
  
  console.log('All icons generated successfully!');
} catch (error) {
  console.error('Error generating icons:', error.message);
  process.exit(1);
}