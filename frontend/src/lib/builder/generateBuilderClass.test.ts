import { generateBuilderClass } from './generateBuilderClass';

function assertEqual(actual: string, expected: string, label: string) {
  if (actual !== expected) {
    throw new Error(`[${label}] Failed: Expected "${expected}", got "${actual}"`);
  }
}

console.log('🧪 Testing Builder Class Generator Mappings...');

assertEqual(generateBuilderClass({ stack: 'AI / ML' }), 'NEURAL ARCHITECT', 'Test 1: AI');
assertEqual(generateBuilderClass({ stack: 'Frontend' }), 'INTERFACE BUILDER', 'Test 2: Frontend');
assertEqual(generateBuilderClass({ stack: 'Backend' }), 'SYSTEMS ARCHITECT', 'Test 3: Backend');
assertEqual(generateBuilderClass({ stack: 'Full Stack' }), 'PRODUCT SHIPPER', 'Test 4: Full Stack');
assertEqual(generateBuilderClass({ stack: 'Hardware' }), 'EDGE BUILDER', 'Test 5: Hardware');
assertEqual(generateBuilderClass({ stack: 'Data' }), 'DATA EXPLORER', 'Test 6: Data');
assertEqual(generateBuilderClass({ stack: 'Cybersecurity' }), 'DIGITAL GUARDIAN', 'Test 7: Cybersecurity');
assertEqual(generateBuilderClass({ stack: 'Designer' }), 'VISUAL ENGINEER', 'Test 8: Designer');
assertEqual(generateBuilderClass({ stack: 'Product' }), 'PRODUCT BUILDER', 'Test 9: Product');

// Combo Tests
assertEqual(generateBuilderClass({ stack: 'AI + Hardware' }), 'EDGE INTELLIGENCE ARCHITECT', 'Test 10: AI + Hardware');
assertEqual(generateBuilderClass({ stack: 'Frontend + AI' }), 'INTELLIGENT INTERFACE BUILDER', 'Test 11: Frontend + AI');
assertEqual(generateBuilderClass({ stack: 'Backend + Data' }), 'DATA SYSTEMS ARCHITECT', 'Test 12: Backend + Data');
assertEqual(generateBuilderClass({ stack: 'Design + Product' }), 'DESIGN-LED FOUNDER', 'Test 13: Design + Product');
assertEqual(generateBuilderClass({ stack: 'DevOps + Cloud' }), 'CLOUD INFRASTRUCTURE ENGINEER', 'Test 14: DevOps');

console.log('✨ All Builder Class Generator Tests Passed Successfully!');
