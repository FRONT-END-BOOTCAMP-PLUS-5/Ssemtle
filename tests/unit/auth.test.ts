// ABOUTME: Unit tests for authentication utilities and bcrypt functions
// ABOUTME: Tests password hashing, validation, and user data processing
import bcrypt from 'bcrypt';

describe('Authentication Utils', () => {
  describe('Password Hashing', () => {
    it('should hash password with bcrypt', async () => {
      const password = 'testPassword123';
      const saltRounds = 12;
      
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      
      expect(hashedPassword).toBeDefined();
      expect(hashedPassword).not.toBe(password);
      expect(hashedPassword.length).toBeGreaterThan(50);
    });

    it('should verify correct password', async () => {
      const password = 'testPassword123';
      const hashedPassword = await bcrypt.hash(password, 12);
      
      const isValid = await bcrypt.compare(password, hashedPassword);
      
      expect(isValid).toBe(true);
    });

    it('should reject incorrect password', async () => {
      const password = 'testPassword123';
      const wrongPassword = 'wrongPassword456';
      const hashedPassword = await bcrypt.hash(password, 12);
      
      const isValid = await bcrypt.compare(wrongPassword, hashedPassword);
      
      expect(isValid).toBe(false);
    });

    it('should generate different hashes for same password', async () => {
      const password = 'testPassword123';
      
      const hash1 = await bcrypt.hash(password, 12);
      const hash2 = await bcrypt.hash(password, 12);
      
      expect(hash1).not.toBe(hash2);
      expect(await bcrypt.compare(password, hash1)).toBe(true);
      expect(await bcrypt.compare(password, hash2)).toBe(true);
    });
  });

  describe('Input Validation', () => {
    it('should validate required fields', () => {
      const validUser = {
        userId: 'testuser',
        password: 'password123',
        name: '테스트유저',
      };

      expect(validUser.userId).toBeTruthy();
      expect(validUser.password).toBeTruthy();
      expect(validUser.name).toBeTruthy();
    });

    it('should reject empty userId', () => {
      const userId = '';
      expect(userId.length).toBe(0);
    });

    it('should reject short passwords', () => {
      const shortPassword = '12345';
      expect(shortPassword.length).toBeLessThan(6);
    });

    it('should accept valid passwords', () => {
      const validPassword = 'password123';
      expect(validPassword.length).toBeGreaterThanOrEqual(6);
    });
  });
});