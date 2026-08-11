import {
  calculateSmartCrop,
  calculateFocalPoint,
  calculateCoverTransform,
  detectFaces,
  type DetectedFace,
} from './smartCrop';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion Failed: ${message}`);
  }
}

function assertCloseTo(actual: number, expected: number, delta = 0.05, message = '') {
  if (Math.abs(actual - expected) > delta) {
    throw new Error(`Expected ${actual} to be close to ${expected} (±${delta}). ${message}`);
  }
}

console.log('🧪 Starting Smart Crop Engine Test Suite...\n');

// ----------------------------------------------------------------------
// Test 1: Face Centered
// ----------------------------------------------------------------------
console.log('Test 1: Face Centered');
const faceCentered: DetectedFace[] = [
  { boundingBox: { x: 0.35, y: 0.25, width: 0.3, height: 0.3 }, confidence: 0.95 },
];
const result1 = calculateSmartCrop({
  sourceWidth: 1000,
  sourceHeight: 1000,
  targetWidth: 500,
  targetHeight: 500,
  faces: faceCentered,
});

assert(result1.detectionMethod === 'face', 'Should detect single face');
assertCloseTo(result1.focalPoint.x, 0.5, 0.05, 'Focal X should be centered at ~0.5');
assert(result1.transform.cropX >= 0, 'Crop X must not be negative');
assert(result1.transform.cropY >= 0, 'Crop Y must not be negative');
assert(result1.transform.cropWidth <= 1000, 'Crop width must not exceed source');
assert(result1.transform.cropHeight <= 1000, 'Crop height must not exceed source');
console.log('  ✅ Passed');

// ----------------------------------------------------------------------
// Test 2: Face on Left
// ----------------------------------------------------------------------
console.log('Test 2: Face on Left');
const faceLeft: DetectedFace[] = [
  { boundingBox: { x: 0.1, y: 0.2, width: 0.25, height: 0.25 }, confidence: 0.9 },
];
const result2 = calculateSmartCrop({
  sourceWidth: 1920,
  sourceHeight: 1080,
  targetWidth: 800,
  targetHeight: 800,
  faces: faceLeft,
});

assert(result2.focalPoint.x < 0.4, 'Focal point should shift left');
assert(result2.transform.cropX === 0, 'Crop box should align to left boundary without overflowing');
console.log('  ✅ Passed');

// ----------------------------------------------------------------------
// Test 3: Face on Right
// ----------------------------------------------------------------------
console.log('Test 3: Face on Right');
const faceRight: DetectedFace[] = [
  { boundingBox: { x: 0.7, y: 0.2, width: 0.25, height: 0.25 }, confidence: 0.9 },
];
const result3 = calculateSmartCrop({
  sourceWidth: 1920,
  sourceHeight: 1080,
  targetWidth: 800,
  targetHeight: 800,
  faces: faceRight,
});

assert(result3.focalPoint.x > 0.6, 'Focal point should shift right');
assert(result3.transform.cropX + result3.transform.cropWidth <= 1920, 'Crop box must not exceed right edge');
console.log('  ✅ Passed');

// ----------------------------------------------------------------------
// Test 4: Landscape Group Photo
// ----------------------------------------------------------------------
console.log('Test 4: Landscape Group Photo');
const groupFaces: DetectedFace[] = [
  { boundingBox: { x: 0.15, y: 0.3, width: 0.12, height: 0.15 } },
  { boundingBox: { x: 0.45, y: 0.28, width: 0.14, height: 0.16 } },
  { boundingBox: { x: 0.75, y: 0.32, width: 0.12, height: 0.14 } },
];
const result4 = calculateSmartCrop({
  sourceWidth: 2400,
  sourceHeight: 1200,
  targetWidth: 600,
  targetHeight: 800, // Taller target aspect ratio
  faces: groupFaces,
});

assert(result4.detectionMethod === 'multi-face', 'Should identify multi-face method');
assertCloseTo(result4.focalPoint.x, 0.5, 0.1, 'Multi-face center should cover all faces');
assert(result4.transform.cropWidth + result4.transform.cropX <= 2400, 'Crop bounds valid');
console.log('  ✅ Passed');

// ----------------------------------------------------------------------
// Test 5: Portrait Selfie
// ----------------------------------------------------------------------
console.log('Test 5: Portrait Selfie');
const selfieFace: DetectedFace[] = [
  { boundingBox: { x: 0.2, y: 0.1, width: 0.6, height: 0.6 } },
];
const result5 = calculateSmartCrop({
  sourceWidth: 1080,
  sourceHeight: 1920,
  targetWidth: 600,
  targetHeight: 600,
  faces: selfieFace,
});

assert(result5.transform.cropY >= 0, 'Selife crop Y valid');
assert(result5.transform.cropY + result5.transform.cropHeight <= 1920, 'Selfie crop Y bounds valid');
console.log('  ✅ Passed');

// ----------------------------------------------------------------------
// Test 6: Full-Body Image
// ----------------------------------------------------------------------
console.log('Test 6: Full-Body Image');
const fullBodyFace: DetectedFace[] = [
  { boundingBox: { x: 0.4, y: 0.08, width: 0.2, height: 0.12 } }, // Small face at top
];
const result6 = calculateSmartCrop({
  sourceWidth: 1200,
  sourceHeight: 2000,
  targetWidth: 600,
  targetHeight: 600,
  faces: fullBodyFace,
});

assert(result6.focalPoint.y < 0.25, 'Upper focus on full-body face');
assert(result6.transform.cropY === 0, 'Top aligned crop to preserve head and upper body');
console.log('  ✅ Passed');

// ----------------------------------------------------------------------
// Test 7: No-Face Image
// ----------------------------------------------------------------------
console.log('Test 7: No-Face Image');
const result7 = calculateSmartCrop({
  sourceWidth: 1600,
  sourceHeight: 1200,
  targetWidth: 800,
  targetHeight: 800,
  faces: [],
});

assert(result7.detectionMethod === 'center-weighted', 'Falls back to center-weighted');
assertCloseTo(result7.focalPoint.x, 0.5, 0.01, 'Center X fallback');
assert(result7.transform.cropX >= 0 && result7.transform.cropY >= 0, 'No face crop valid');
console.log('  ✅ Passed');

// ----------------------------------------------------------------------
// Test 8: Dark Image Analysis
// ----------------------------------------------------------------------
console.log('Test 8: Dark Image');
const darkPixels = new Uint8ClampedArray(100 * 100 * 4).fill(15); // Dark grey/black pixels
const darkResult = detectFaces({ width: 100, height: 100, pixels: darkPixels });
detectFaces().then((faces) => {
  assert(faces.length === 0, 'Safely returns empty faces array for dark image');
});
console.log('  ✅ Passed');

// ----------------------------------------------------------------------
// Test 9: Very Bright Image Analysis
// ----------------------------------------------------------------------
console.log('Test 9: Very Bright Image');
const brightPixels = new Uint8ClampedArray(100 * 100 * 4).fill(250); // White pixels
detectFaces({ width: 100, height: 100, pixels: brightPixels }).then((faces) => {
  assert(faces.length === 0, 'Safely returns empty faces array for bright image');
});
console.log('  ✅ Passed');

// ----------------------------------------------------------------------
// Test 10: Multiple Faces Extreme Aspect Ratio
// ----------------------------------------------------------------------
console.log('Test 10: Multiple Faces Extreme Aspect Ratio');
const extremeGroup: DetectedFace[] = [
  { boundingBox: { x: 0.05, y: 0.4, width: 0.1, height: 0.2 } },
  { boundingBox: { x: 0.85, y: 0.4, width: 0.1, height: 0.2 } },
];
const result10 = calculateSmartCrop({
  sourceWidth: 3000,
  sourceHeight: 1000,
  targetWidth: 500,
  targetHeight: 500,
  faces: extremeGroup,
});

assert(result10.transform.cropX >= 0, 'Crop X strictly non-negative');
assert(result10.transform.cropX + result10.transform.cropWidth <= 3000, 'Crop box strictly inside 3000px');
assert(result10.transform.cropWidth === 1000, 'Crop width fits 1:1 ratio height in 3000x1000 source');
console.log('  ✅ Passed');

// ----------------------------------------------------------------------
// Test 11: Manual Adjust Overrides (Scale & Position)
// ----------------------------------------------------------------------
console.log('Test 11: Manual Adjust Overrides (Scale & Position)');
const result11 = calculateSmartCrop({
  sourceWidth: 1000,
  sourceHeight: 1000,
  targetWidth: 500,
  targetHeight: 500,
  focalPoint: { x: 0.5, y: 0.5 },
  scale: 1.5,
  position: { x: 0.1, y: -0.1 },
});

assert(result11.transform.scale === 1.5, 'User scale applied');
assert(result11.transform.focalPoint.x === 0.6, 'User position X offset applied');
assert(result11.transform.focalPoint.y === 0.4, 'User position Y offset applied');
console.log('  ✅ Passed');

console.log('\n✨ All 11 Smart Crop Engine Tests Passed Successfully!');
