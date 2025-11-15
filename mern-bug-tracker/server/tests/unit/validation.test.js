const {
  validateEmail,
  validatePassword,
  validateUsername,
  validatePostTitle,
  validatePostContent,
  validateCategoryName,
  sanitizeInput,
} = require('../../utils/validation');

describe('Validation Utilities', () => {
  describe('validateEmail', () => {
    it('should validate correct email addresses', () => {
      const validEmails = [
        'user@example.com',
        'test.user@domain.co.uk',
        'firstname.lastname@example.com',
      ];
      validEmails.forEach(email => {
        expect(validateEmail(email)).toBe(true);
      });
    });

    it('should reject invalid email addresses', () => {
      const invalidEmails = [
        'invalid.email',
        '@example.com',
        'user@',
        'user @example.com',
        'user@example',
      ];
      invalidEmails.forEach(email => {
        expect(validateEmail(email)).toBe(false);
      });
    });
  });

  describe('validatePassword', () => {
    it('should validate strong passwords', () => {
      const strongPasswords = [
        'StrongPass123!',
        'MyPassword@2024',
        'SecureP@ss1',
      ];
      strongPasswords.forEach(password => {
        expect(validatePassword(password)).toBe(true);
      });
    });

    it('should reject weak passwords', () => {
      const weakPasswords = [
        'short1!',
        'NoNumbers!',
        'noupppercase123!',
        'NOLOWERCASE123!',
        'NoSpecial123',
      ];
      weakPasswords.forEach(password => {
        expect(validatePassword(password)).toBe(false);
      });
    });
  });

  describe('validateUsername', () => {
    it('should validate correct usernames', () => {
      const validUsernames = [
        'user123',
        'john_doe',
        'test_user_2024',
      ];
      validUsernames.forEach(username => {
        expect(validateUsername(username)).toBe(true);
      });
    });

    it('should reject invalid usernames', () => {
      const invalidUsernames = [
        'ab',
        'user-name',
        'user@name',
        'a'.repeat(21),
      ];
      invalidUsernames.forEach(username => {
        expect(validateUsername(username)).toBe(false);
      });
    });
  });

  describe('validatePostTitle', () => {
    it('should validate valid post titles', () => {
      expect(validatePostTitle('My First Post')).toBe(true);
      expect(validatePostTitle('A')).toBe(true);
      expect(validatePostTitle('x'.repeat(200))).toBe(true);
    });

    it('should reject invalid post titles', () => {
      expect(validatePostTitle('')).toBe(false);
      expect(validatePostTitle('   ')).toBe(false);
      expect(validatePostTitle(null)).toBe(false);
      expect(validatePostTitle('x'.repeat(201))).toBe(false);
    });
  });

  describe('validatePostContent', () => {
    it('should validate valid post content', () => {
      expect(validatePostContent('This is a valid post content')).toBe(true);
      expect(validatePostContent('x'.repeat(100))).toBe(true);
    });

    it('should reject short post content', () => {
      expect(validatePostContent('short')).toBe(false);
      expect(validatePostContent('x'.repeat(9))).toBe(false);
      expect(validatePostContent('')).toBe(false);
    });
  });

  describe('validateCategoryName', () => {
    it('should validate valid category names', () => {
      expect(validateCategoryName('Technology')).toBe(true);
      expect(validateCategoryName('Web Development')).toBe(true);
    });

    it('should reject invalid category names', () => {
      expect(validateCategoryName('')).toBe(false);
      expect(validateCategoryName('   ')).toBe(false);
      expect(validateCategoryName('x'.repeat(51))).toBe(false);
    });
  });

  describe('sanitizeInput', () => {
    it('should remove leading/trailing whitespace', () => {
      expect(sanitizeInput('  test  ')).toBe('test');
    });

    it('should remove HTML tags', () => {
      const result1 = sanitizeInput('<script>alert("xss")</script>');
      expect(result1).not.toContain('<');
      expect(result1).not.toContain('>');
      const result2 = sanitizeInput('Hello<br>World');
      expect(result2).not.toContain('<');
      expect(result2).not.toContain('>');
    });

    it('should return non-string input unchanged', () => {
      expect(sanitizeInput(123)).toBe(123);
      expect(sanitizeInput(null)).toBe(null);
      expect(sanitizeInput(true)).toBe(true);
    });
  });
});
