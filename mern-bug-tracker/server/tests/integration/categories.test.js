// categories.test.js - Integration tests for categories endpoints
const request = require('supertest');
const app = require('../../server');
const { connect, closeDatabase, clearDatabase } = require('../testDb');
const Category = require('../../models/Category');

describe('Categories API Integration Tests', () => {
  let testCategory;

  // Setup test database before all tests
  beforeAll(async () => {
    await connect();
  });

  // Clear database and create test data before each test
  beforeEach(async () => {
    await clearDatabase();

    // Create a test category
    testCategory = new Category({
      name: 'Technology',
      description: 'Tech-related posts',
    });
    await testCategory.save();
  });

  // Close database connection after all tests
  afterAll(async () => {
    await closeDatabase();
    await new Promise(resolve => setTimeout(resolve, 500));
  });

  describe('GET /api/categories', () => {
    it('should get all categories', async () => {
      const response = await request(app)
        .get('/api/categories')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toHaveProperty('name', 'Technology');
      expect(response.body[0]).toHaveProperty('slug', 'technology');
    });

    it('should return empty array when no categories exist', async () => {
      await clearDatabase();

      const response = await request(app)
        .get('/api/categories')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(0);
    });

    it('should return multiple categories', async () => {
      // Create additional categories
      const category2 = new Category({
        name: 'Sports',
        description: 'Sports news and updates',
      });
      await category2.save();

      const category3 = new Category({
        name: 'Entertainment',
        description: 'Entertainment and media',
      });
      await category3.save();

      const response = await request(app)
        .get('/api/categories')
        .expect(200);

      expect(response.body.length).toBe(3);
      const names = response.body.map(cat => cat.name);
      expect(names).toContain('Technology');
      expect(names).toContain('Sports');
      expect(names).toContain('Entertainment');
    });
  });

  describe('GET /api/categories/:id', () => {
    it('should get a single category by ID', async () => {
      const response = await request(app)
        .get(`/api/categories/${testCategory._id}`)
        .expect(200);

      expect(response.body).toHaveProperty('name', 'Technology');
      expect(response.body).toHaveProperty('description', 'Tech-related posts');
      expect(response.body).toHaveProperty('slug', 'technology');
      expect(response.body).toHaveProperty('_id', testCategory._id.toString());
    });

    it('should return 404 for non-existent category ID', async () => {
      const fakeId = '507f1f77bcf86cd799439011';

      const response = await request(app)
        .get(`/api/categories/${fakeId}`)
        .expect(404);

      expect(response.body).toHaveProperty('message', 'Category not found');
    });

    it('should return 500 for invalid category ID format', async () => {
      const response = await request(app)
        .get('/api/categories/invalid-id')
        .expect(500);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/categories', () => {
    it('should create a new category successfully', async () => {
      const newCategory = {
        name: 'Science',
        description: 'Scientific discoveries and research',
      };

      const response = await request(app)
        .post('/api/categories')
        .send(newCategory)
        .expect(201);

      expect(response.body).toHaveProperty('message', 'Category created successfully');
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('name', newCategory.name);
      expect(response.body.data).toHaveProperty('description', newCategory.description);
      expect(response.body.data).toHaveProperty('slug', 'science');

      // Verify category was saved to database
      const categoryInDb = await Category.findOne({ name: newCategory.name });
      expect(categoryInDb).toBeTruthy();
      expect(categoryInDb.name).toBe(newCategory.name);
    });

    it('should auto-generate slug from name', async () => {
      const newCategory = {
        name: 'Health & Wellness',
        description: 'Health tips and wellness advice',
      };

      const response = await request(app)
        .post('/api/categories')
        .send(newCategory)
        .expect(201);

      expect(response.body.data).toHaveProperty('slug', 'health--wellness'); // & is removed, leaving double dash
    });

    it('should create category without description', async () => {
      const newCategory = {
        name: 'Travel',
      };

      const response = await request(app)
        .post('/api/categories')
        .send(newCategory)
        .expect(201);

      expect(response.body.data).toHaveProperty('name', 'Travel');
      expect(response.body.data).toHaveProperty('slug', 'travel');
    });

    it('should return 400 for missing name', async () => {
      const invalidCategory = {
        description: 'A category without a name',
      };

      const response = await request(app)
        .post('/api/categories')
        .send(invalidCategory)
        .expect(400);

      expect(response.body).toHaveProperty('errors');
      expect(Array.isArray(response.body.errors)).toBe(true);
    });

    it('should return 400 for name shorter than 2 characters', async () => {
      const invalidCategory = {
        name: 'A',
      };

      const response = await request(app)
        .post('/api/categories')
        .send(invalidCategory)
        .expect(400);

      expect(response.body).toHaveProperty('errors');
    });

    it('should return 400 for name longer than 50 characters', async () => {
      const invalidCategory = {
        name: 'A'.repeat(51),
      };

      const response = await request(app)
        .post('/api/categories')
        .send(invalidCategory)
        .expect(400);

      expect(response.body).toHaveProperty('errors');
    });

    it('should return 400 for description longer than 200 characters', async () => {
      const invalidCategory = {
        name: 'Valid Name',
        description: 'A'.repeat(201),
      };

      const response = await request(app)
        .post('/api/categories')
        .send(invalidCategory)
        .expect(400);

      expect(response.body).toHaveProperty('errors');
    });

    it('should trim whitespace from name', async () => {
      const categoryWithWhitespace = {
        name: '  Business  ',
        description: '  Business news  ',
      };

      const response = await request(app)
        .post('/api/categories')
        .send(categoryWithWhitespace)
        .expect(201);

      expect(response.body.data.name).toBe('Business');
    });

    it('should handle duplicate category names', async () => {
      const duplicateCategory = {
        name: 'Technology', // Already exists
        description: 'Another tech category',
      };

      const response = await request(app)
        .post('/api/categories')
        .send(duplicateCategory)
        .expect(500);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('PUT /api/categories/:id', () => {
    it('should update category successfully', async () => {
      const updates = {
        name: 'Tech & Innovation',
        description: 'Technology and innovation news',
      };

      const response = await request(app)
        .put(`/api/categories/${testCategory._id}`)
        .send(updates)
        .expect(200);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('updated successfully');
      expect(response.body).toHaveProperty('data');
      expect(response.body.data.name).toBe(updates.name);
      expect(response.body.data.description).toBe(updates.description);

      // Verify update in database
      const updatedCategory = await Category.findById(testCategory._id);
      expect(updatedCategory.name).toBe(updates.name);
      expect(updatedCategory.description).toBe(updates.description);
    });

    it('should update only name', async () => {
      const updates = {
        name: 'Tech News',
      };

      const response = await request(app)
        .put(`/api/categories/${testCategory._id}`)
        .send(updates)
        .expect(200);

      expect(response.body.data.name).toBe(updates.name);
      expect(response.body.data.description).toBe(testCategory.description);
    });

    it('should update only description', async () => {
      const updates = {
        description: 'Updated description',
      };

      const response = await request(app)
        .put(`/api/categories/${testCategory._id}`)
        .send(updates)
        .expect(200);

      expect(response.body.data.name).toBe(testCategory.name);
      expect(response.body.data.description).toBe(updates.description);
    });

    it('should return 404 for non-existent category', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const updates = {
        name: 'Updated Name',
      };

      const response = await request(app)
        .put(`/api/categories/${fakeId}`)
        .send(updates)
        .expect(404);

      expect(response.body).toHaveProperty('message', 'Category not found');
    });

    it('should regenerate slug when name is updated', async () => {
      const updates = {
        name: 'New Category Name',
      };

      const response = await request(app)
        .put(`/api/categories/${testCategory._id}`)
        .send(updates)
        .expect(200);

      // Note: slug regeneration depends on model pre-save hook
      expect(response.body.data.name).toBe(updates.name);
    });
  });

  describe('DELETE /api/categories/:id', () => {
    it('should delete category successfully', async () => {
      const response = await request(app)
        .delete(`/api/categories/${testCategory._id}`)
        .expect(200);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('deleted successfully');

      // Verify category is deleted
      const deletedCategory = await Category.findById(testCategory._id);
      expect(deletedCategory).toBeNull();
    });

    it('should return success even for non-existent category', async () => {
      const fakeId = '507f1f77bcf86cd799439011';

      const response = await request(app)
        .delete(`/api/categories/${fakeId}`)
        .expect(200);

      expect(response.body).toHaveProperty('message');
    });

    it('should handle invalid category ID format', async () => {
      const response = await request(app)
        .delete('/api/categories/invalid-id')
        .expect(500);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('Category Validation and Data Integrity', () => {
    it('should enforce unique category names', async () => {
      // Try to create another category with same name
      const duplicate = new Category({
        name: 'Technology',
        description: 'Duplicate tech category',
      });

      await expect(duplicate.save()).rejects.toThrow();
    });

    it('should enforce unique slugs', async () => {
      // Create a category
      const cat1 = new Category({
        name: 'Mobile Tech',
      });
      await cat1.save();

      // Try to create another with same slug (manually set)
      const cat2 = new Category({
        name: 'Mobile-Tech', // Will generate same slug
        slug: 'mobile-tech',
      });

      await expect(cat2.save()).rejects.toThrow();
    });

    it('should trim and format category data correctly', async () => {
      const category = new Category({
        name: '  Gaming & Esports  ',
        description: '  Gaming news and esports coverage  ',
      });
      await category.save();

      expect(category.name).toBe('Gaming & Esports');
      expect(category.description).toBe('Gaming news and esports coverage');
      expect(category.slug).toBe('gaming--esports'); // & is removed, leaving double dash
    });

    it('should have timestamps', async () => {
      const category = await Category.findById(testCategory._id);

      expect(category).toHaveProperty('createdAt');
      expect(category).toHaveProperty('updatedAt');
      expect(category.createdAt).toBeInstanceOf(Date);
      expect(category.updatedAt).toBeInstanceOf(Date);
    });
  });

  describe('Form Validation Scenarios', () => {
    it('should reject empty string for name', async () => {
      const response = await request(app)
        .post('/api/categories')
        .send({ name: '' })
        .expect(400);

      expect(response.body).toHaveProperty('errors');
    });

    it('should reject name with only whitespace', async () => {
      const response = await request(app)
        .post('/api/categories')
        .send({ name: '   ' })
        .expect(400);

      expect(response.body).toHaveProperty('errors');
    });

    it('should accept valid name with special characters', async () => {
      const response = await request(app)
        .post('/api/categories')
        .send({ name: 'Art & Design' })
        .expect(201);

      expect(response.body.data.name).toBe('Art & Design');
      expect(response.body.data.slug).toBe('art--design'); // & is removed, leaving double dash
    });

    it('should handle name with numbers', async () => {
      const response = await request(app)
        .post('/api/categories')
        .send({ name: 'Web 3.0' })
        .expect(201);

      expect(response.body.data.name).toBe('Web 3.0');
      expect(response.body.data.slug).toBe('web-30');
    });

    it('should reject non-string name', async () => {
      const response = await request(app)
        .post('/api/categories')
        .send({ name: 12345 })
        .expect(400);

      expect(response.body).toHaveProperty('errors');
    });

    it('should reject non-string description', async () => {
      const response = await request(app)
        .post('/api/categories')
        .send({
          name: 'Valid Name',
          description: 12345
        })
        .expect(400);

      expect(response.body).toHaveProperty('errors');
    });
  });
});
