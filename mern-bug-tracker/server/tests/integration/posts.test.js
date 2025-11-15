// posts.test.js - Integration tests for posts endpoints
const request = require('supertest');
const app = require('../../server');
const { connect, closeDatabase, clearDatabase } = require('../testDb');
const User = require('../../models/User');
const Post = require('../../models/Post');
const Category = require('../../models/Category');

describe('Posts API Integration Tests', () => {
  let authToken;
  let userId;
  let categoryId;
  let testPost;

  // Helper function to create posts
  const createTestPost = async (data) => {
    const slug = data.title
      .toLowerCase()
      .replace(/[^\w ]+/g, '')
      .replace(/ +/g, '-');

    const post = new Post({
      title: data.title,
      slug: slug, // Explicitly set slug
      content: data.content,
      excerpt: data.excerpt,
      author: data.author || userId,
      category: data.category || categoryId,
      isPublished: data.isPublished !== undefined ? data.isPublished : false,
    });
    return await post.save();
  };

  // Setup test database and create test user
  beforeAll(async () => {
    await connect();
  });

  // Setup test data before each test
  beforeEach(async () => {
    await clearDatabase();

    // Create a test user and get auth token
    const registerResponse = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      });

    authToken = registerResponse.body.token;
    userId = registerResponse.body.data._id;

    // Create a test category
    const category = await Category.create({
      name: 'Technology',
      slug: 'technology',
    });
    categoryId = category._id;

    // Create a test post
    testPost = await createTestPost({
      title: 'Test Post',
      content: 'This is test content',
      excerpt: 'Test excerpt',
      isPublished: true,
    });
  });

  // Close database connection after all tests
  afterAll(async () => {
    await closeDatabase();
    await new Promise(resolve => setTimeout(resolve, 500));
  });

  describe('GET /api/posts', () => {
    it('should get all published posts without authentication', async () => {
      const response = await request(app)
        .get('/api/posts')
        .expect(200);

      expect(response.body).toHaveProperty('posts');
      expect(response.body).toHaveProperty('pagination');
      expect(Array.isArray(response.body.posts)).toBe(true);
      expect(response.body.posts.length).toBeGreaterThan(0);
      expect(response.body.posts[0].title).toBe('Test Post');
    });

    it('should not return unpublished posts to unauthenticated users', async () => {
      // Create an unpublished post
      await createTestPost({
        title: 'Draft Post',
        content: 'Draft content',
        excerpt: 'Draft excerpt',
        isPublished: false,
      });

      const response = await request(app)
        .get('/api/posts')
        .expect(200);

      expect(response.body.posts).toHaveLength(1);
      expect(response.body.posts[0].title).toBe('Test Post');
    });

    it('should return user own unpublished posts when authenticated', async () => {
      // Create an unpublished post
      await createTestPost({
        title: 'My Draft',
        content: 'Draft content',
        excerpt: 'Draft excerpt',
        isPublished: false,
      });

      const response = await request(app)
        .get('/api/posts')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.posts.length).toBeGreaterThanOrEqual(2);
      const draftPost = response.body.posts.find(p => p.title === 'My Draft');
      expect(draftPost).toBeDefined();
    });

    it('should support pagination', async () => {
      // Create multiple posts
      for (let i = 0; i < 12; i++) {
        await createTestPost({
          title: `Post ${i}`,
          content: `Content ${i}`,
          excerpt: `Excerpt ${i}`,
          isPublished: true,
        });
      }

      const response = await request(app)
        .get('/api/posts?page=1&limit=10')
        .expect(200);

      expect(response.body.posts).toHaveLength(10);
      expect(response.body.pagination.currentPage).toBe(1);
      expect(response.body.pagination.hasNextPage).toBe(true);
      expect(response.body.pagination.totalPosts).toBeGreaterThanOrEqual(12);
    });

    it('should filter posts by category', async () => {
      // Create another category and post
      const category2 = await Category.create({
        name: 'Sports',
        slug: 'sports',
      });

      await createTestPost({
        title: 'Sports Post',
        content: 'Sports content',
        excerpt: 'Sports excerpt',
        category: category2._id,
        isPublished: true,
      });

      const response = await request(app)
        .get(`/api/posts?category=${categoryId}`)
        .expect(200);

      expect(response.body.posts).toHaveLength(1);
      expect(response.body.posts[0].title).toBe('Test Post');
    });
  });

  describe('GET /api/posts/my-posts', () => {
    it('should return 401 without authentication', async () => {
      await request(app)
        .get('/api/posts/my-posts')
        .expect(401);
    });

    it('should return current user posts when authenticated', async () => {
      const response = await request(app)
        .get('/api/posts/my-posts')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('posts');
      expect(Array.isArray(response.body.posts)).toBe(true);
      expect(response.body.posts.length).toBeGreaterThan(0);
    });

    it('should return both published and unpublished posts for authenticated user', async () => {
      await createTestPost({
        title: 'My Draft Post',
        content: 'Draft content',
        excerpt: 'Draft excerpt',
        isPublished: false,
      });

      const response = await request(app)
        .get('/api/posts/my-posts')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.posts.length).toBeGreaterThanOrEqual(2);
      const foundDraft = response.body.posts.find(p => p.title === 'My Draft Post');
      expect(foundDraft).toBeDefined();
      expect(foundDraft.isPublished).toBe(false);
    });
  });

  describe('GET /api/posts/:id', () => {
    it('should get a single published post by ID', async () => {
      const response = await request(app)
        .get(`/api/posts/${testPost._id}`)
        .expect(200);

      expect(response.body).toHaveProperty('post');
      expect(response.body.post.title).toBe('Test Post');
      expect(response.body.post.content).toBe('This is test content');
    });

    it('should return 404 for non-existent post ID', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      await request(app)
        .get(`/api/posts/${fakeId}`)
        .expect(404);
    });

    it('should not allow unauthenticated access to unpublished posts', async () => {
      const draftPost = await createTestPost({
        title: 'Draft Post',
        content: 'Draft content',
        excerpt: 'Draft excerpt',
        isPublished: false,
      });

      await request(app)
        .get(`/api/posts/${draftPost._id}`)
        .expect(403);
    });

    it('should allow author to view their unpublished posts', async () => {
      const draftPost = await createTestPost({
        title: 'My Draft',
        content: 'Draft content',
        excerpt: 'Draft excerpt',
        isPublished: false,
      });

      const response = await request(app)
        .get(`/api/posts/${draftPost._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.post.title).toBe('My Draft');
    });
  });

  describe('POST /api/posts', () => {
    it('should return 401 without authentication', async () => {
      await request(app)
        .post('/api/posts')
        .send({
          title: 'New Post',
          content: 'New content',
        })
        .expect(401);
    });

    it('should create a new post when authenticated', async () => {
      const newPost = {
        title: 'New Post',
        content: 'This is new content',
        excerpt: 'New excerpt',
        category: categoryId.toString(),
      };

      const response = await request(app)
        .post('/api/posts')
        .set('Authorization', `Bearer ${authToken}`)
        .send(newPost)
        .expect(201);

      expect(response.body).toHaveProperty('message', 'Post created successfully');
      expect(response.body).toHaveProperty('post');
      expect(response.body.post.title).toBe(newPost.title);
      expect(response.body.post.author).toBeDefined();
    });

    it('should return 400 for invalid post data', async () => {
      const response = await request(app)
        .post('/api/posts')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: '', // Invalid empty title
          content: 'Some content',
        })
        .expect(400);

      expect(response.body).toHaveProperty('errors');
    });

    it('should create post as unpublished by default', async () => {
      const newPost = {
        title: 'Draft Post',
        content: 'Draft content',
        excerpt: 'Draft excerpt',
        category: categoryId.toString(),
      };

      const response = await request(app)
        .post('/api/posts')
        .set('Authorization', `Bearer ${authToken}`)
        .send(newPost)
        .expect(201);

      expect(response.body.post.isPublished).toBe(false);
    });
  });

  describe('PUT /api/posts/:id', () => {
    it('should return 401 without authentication', async () => {
      await request(app)
        .put(`/api/posts/${testPost._id}`)
        .send({
          title: 'Updated Title',
        })
        .expect(401);
    });

    it('should update own post when authenticated', async () => {
      const updates = {
        title: 'Updated Title',
        content: 'Updated content',
      };

      const response = await request(app)
        .put(`/api/posts/${testPost._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updates)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Post updated successfully');
      expect(response.body.post.title).toBe(updates.title);
      expect(response.body.post.content).toBe(updates.content);
    });

    it('should return 404 for non-existent post', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      await request(app)
        .put(`/api/posts/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Updated Title',
        })
        .expect(404);
    });

    it('should return 403 when trying to update another user post', async () => {
      // Create another user
      const otherUserResponse = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Other User',
          email: 'other@example.com',
          password: 'password123',
        });

      const otherToken = otherUserResponse.body.token;

      await request(app)
        .put(`/api/posts/${testPost._id}`)
        .set('Authorization', `Bearer ${otherToken}`)
        .send({
          title: 'Hacked Title',
        })
        .expect(403);
    });
  });

  describe('DELETE /api/posts/:id', () => {
    it('should return 401 without authentication', async () => {
      await request(app)
        .delete(`/api/posts/${testPost._id}`)
        .expect(401);
    });

    it('should delete own post when authenticated', async () => {
      const response = await request(app)
        .delete(`/api/posts/${testPost._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Post deleted successfully');

      // Verify post is deleted
      const deletedPost = await Post.findById(testPost._id);
      expect(deletedPost).toBeNull();
    });

    it('should return 404 for non-existent post', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      await request(app)
        .delete(`/api/posts/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });

    it('should return 403 when trying to delete another user post', async () => {
      // Create another user
      const otherUserResponse = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Other User',
          email: 'other@example.com',
          password: 'password123',
        });

      const otherToken = otherUserResponse.body.token;

      await request(app)
        .delete(`/api/posts/${testPost._id}`)
        .set('Authorization', `Bearer ${otherToken}`)
        .expect(403);
    });
  });

  describe('PATCH /api/posts/:id/publish', () => {
    it('should return 401 without authentication', async () => {
      await request(app)
        .patch(`/api/posts/${testPost._id}/publish`)
        .send({ isPublished: false })
        .expect(401);
    });

    it('should toggle publish status of own post', async () => {
      const response = await request(app)
        .patch(`/api/posts/${testPost._id}/publish`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ isPublished: false })
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Post publish status updated');
      expect(response.body.post.isPublished).toBe(false);
    });

    it('should publish an unpublished post', async () => {
      // Create unpublished post
      const draftPost = await createTestPost({
        title: 'Draft',
        content: 'Draft content',
        excerpt: 'Draft excerpt',
        isPublished: false,
      });

      const response = await request(app)
        .patch(`/api/posts/${draftPost._id}/publish`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ isPublished: true })
        .expect(200);

      expect(response.body.post.isPublished).toBe(true);
    });

    it('should return 403 when trying to publish another user post', async () => {
      // Create another user
      const otherUserResponse = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Other User',
          email: 'other@example.com',
          password: 'password123',
        });

      const otherToken = otherUserResponse.body.token;

      await request(app)
        .patch(`/api/posts/${testPost._id}/publish`)
        .set('Authorization', `Bearer ${otherToken}`)
        .send({ isPublished: false })
        .expect(403);
    });
  });
});
