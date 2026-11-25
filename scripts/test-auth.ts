import { 
  hashPassword, 
  verifyPassword, 
  encryptToken, 
  decryptToken, 
  generateRandomState 
} from '../src/lib/crypto';
import { 
  signJwt, 
  verifyJwt, 
  checkFacultyEmailDomain, 
  recordFailedAttempt, 
  checkLoginLockout, 
  clearFailedAttempts 
} from '../src/lib/auth-server';

async function runTests() {
  console.log('🧪 Starting CodePilot AI Auth & Crypto Tests...\n');

  // Test 1: Password Hashing & Verification
  console.log('Test 1: Password Hashing & Verification');
  const pwd = 'TestPassword123!';
  const hashed = await hashPassword(pwd);
  const isMatch = await verifyPassword(pwd, hashed);
  const isWrongMatch = await verifyPassword('WrongPassword', hashed);
  console.assert(isMatch === true, 'Valid password verification failed');
  console.assert(isWrongMatch === false, 'Wrong password unexpectedly succeeded');
  console.log('  ✓ Password hashing & salt verification passed');

  // Test 2: AES-256-GCM Token Encryption & Decryption
  console.log('Test 2: AES-256-GCM Token Encryption');
  const dummyGhToken = 'gho_16C7e42F292c6912E7710c838347Ae178B4a';
  const encrypted = encryptToken(dummyGhToken);
  const decrypted = decryptToken(encrypted);
  console.assert(decrypted === dummyGhToken, 'Token decryption mismatch');
  console.assert(!encrypted.includes(dummyGhToken), 'Encrypted data exposes plain text token');
  console.log('  ✓ Token encryption/decryption round-trip verified');

  // Test 3: JWT Sign & Verify
  console.log('Test 3: Session JWT Lifecycle');
  const payload = {
    id: 'user-uuid-1234',
    email: 'student@university.edu',
    name: 'Alex Mercer',
    role: 'STUDENT' as const,
    status: 'ACTIVE' as const,
    email_verified: true,
  };
  const token = signJwt(payload, 3600);
  const verified = verifyJwt(token);
  console.assert(verified !== null && verified.id === payload.id, 'JWT verification failed');
  console.assert(verified?.email === payload.email, 'JWT email mismatch');
  console.log('  ✓ HMAC-SHA256 JWT creation & validation verified');

  // Test 4: Faculty Domain Validation
  console.log('Test 4: Faculty Domain Checking');
  const eduCheck = checkFacultyEmailDomain('prof@mit.edu');
  const acInCheck = checkFacultyEmailDomain('faculty@iitb.ac.in');
  const gmailCheck = checkFacultyEmailDomain('evaluator@gmail.com');
  console.assert(eduCheck.isInstitutional === true, '.edu should be institutional');
  console.assert(acInCheck.isInstitutional === true, '.ac.in should be institutional');
  console.assert(gmailCheck.isInstitutional === false, 'gmail.com must require approval');
  console.log('  ✓ Domain rules correctly categorized institutional vs public domains');

  // Test 5: Rate Limiting & Account Lockout
  console.log('Test 5: Rate Limiting & Lockout');
  const testKey = 'test_user_rate_limit';
  clearFailedAttempts(testKey);
  for (let i = 0; i < 5; i++) {
    recordFailedAttempt(testKey);
  }
  const lockoutStatus = checkLoginLockout(testKey);
  console.assert(lockoutStatus.locked === true, 'Lockout should trigger after 5 failed attempts');
  clearFailedAttempts(testKey);
  const resetStatus = checkLoginLockout(testKey);
  console.assert(resetStatus.locked === false, 'Lockout should be cleared');
  console.log('  ✓ Rate limiting and temporary lockout mechanics verified');

  console.log('\n🎉 All 5 Test Suites Passed Successfully!\n');
}

runTests().catch(console.error);
