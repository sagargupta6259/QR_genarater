import QRCode from 'qrcode';
import jsQR from 'jsqr';

// Validation function replica matching src/main.js
function isValidUrl(urlString) {
  if (!urlString || typeof urlString !== 'string') return false;
  const trimmed = urlString.trim();
  if (trimmed.length === 0) return false;

  if (!/^https?:\/\//i.test(trimmed)) {
    return false;
  }

  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return false;
    }
    const host = parsed.hostname;
    if (!host) return false;
    if (host !== 'localhost' && !host.includes('.')) {
      return false;
    }
    if (host.endsWith('.')) return false;
    return true;
  } catch (err) {
    return false;
  }
}

async function runTests() {
  console.log('==================================================');
  console.log('🧪 RUNNING COMPREHENSIVE QR CODE GENERATOR TESTS');
  console.log('==================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, testName) {
    if (condition) {
      console.log(`✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${testName}`);
      failed++;
    }
  }

  // 1. URL Validation Tests
  console.log('--- 1. Testing URL Validation Rules ---');
  
  // Valid Cases
  assert(isValidUrl('https://google.com') === true, 'Valid: https://google.com');
  assert(isValidUrl('https://github.com') === true, 'Valid: https://github.com');
  assert(isValidUrl('https://github.com/sagargupta6259') === true, 'Valid: https://github.com/sagargupta6259');
  assert(isValidUrl('https://youtube.com') === true, 'Valid: https://youtube.com');
  assert(isValidUrl('http://example.com') === true, 'Valid: http://example.com');
  assert(isValidUrl('https://sub.domain.co.uk/test?param=1#top') === true, 'Valid: complex URL with query and hash');

  // Invalid Cases
  assert(isValidUrl('') === false, 'Invalid: empty string');
  assert(isValidUrl('   ') === false, 'Invalid: whitespace string');
  assert(isValidUrl('google') === false, 'Invalid: "google" without protocol/domain');
  assert(isValidUrl('hello') === false, 'Invalid: "hello"');
  assert(isValidUrl('abc') === false, 'Invalid: "abc"');
  assert(isValidUrl('ftp://example.com') === false, 'Invalid: non http/https protocol (ftp)');
  assert(isValidUrl('javascript:alert(1)') === false, 'Invalid: javascript scheme');
  assert(isValidUrl('http://') === false, 'Invalid: incomplete protocol only');

  console.log('\n--- 2. Testing Exact QR Payload Preservation ---');
  
  const testUrls = [
    'https://google.com',
    'https://github.com/sagargupta6259',
    'https://youtube.com',
    'http://example.com',
    'https://example.com/path?foo=bar&baz=123'
  ];

  for (const url of testUrls) {
    // Generate QR using QRCode.toDataURL
    const dataUrl = await QRCode.toDataURL(url, {
      errorCorrectionLevel: 'H',
      margin: 2
    });

    // Check that data URL is valid PNG
    assert(dataUrl.startsWith('data:image/png;base64,'), `DataURL is PNG for ${url}`);

    // Verify SVG generation as well
    const svgStr = await QRCode.toString(url, {
      type: 'svg',
      errorCorrectionLevel: 'H'
    });
    assert(svgStr.startsWith('<svg') && svgStr.includes('</svg>'), `SVG generated correctly for ${url}`);

    // Test raw QR Matrix decode with jsQR
    const qrObj = QRCode.create(url, { errorCorrectionLevel: 'H' });
    const size = qrObj.modules.size;
    const data = qrObj.modules.data;
    
    // Convert 1-bit module array to RGBA Uint8ClampedArray for jsQR
    const scale = 4;
    const margin = 2;
    const totalSize = (size + margin * 2) * scale;
    const rgba = new Uint8ClampedArray(totalSize * totalSize * 4);
    
    // Fill background white (255, 255, 255, 255)
    rgba.fill(255);

    // Fill dark modules (0, 0, 0, 255)
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (data[r * size + c]) {
          const startX = (c + margin) * scale;
          const startY = (r + margin) * scale;
          for (let py = 0; py < scale; py++) {
            for (let px = 0; px < scale; px++) {
              const idx = ((startY + py) * totalSize + (startX + px)) * 4;
              rgba[idx] = 0;     // R
              rgba[idx + 1] = 0; // G
              rgba[idx + 2] = 0; // B
              rgba[idx + 3] = 255; // A
            }
          }
        }
      }
    }

    const decoded = jsQR(rgba, totalSize, totalSize);
    assert(decoded !== null, `jsQR successfully detected QR code for: ${url}`);
    assert(decoded && decoded.data === url, `Decoded payload EXACT MATCH [${decoded?.data}] === [${url}]`);
  }

  console.log('\n==================================================');
  console.log(`Summary: ${passed} Passed, ${failed} Failed`);
  console.log('==================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
