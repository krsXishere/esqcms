/**
 * E2E API Tests - ESQCMS Backend
 * 
 * Tests all endpoints with real database connection (no mocking)
 * Uses Jest + Supertest for HTTP assertions
 */

const request = require('supertest');
const app = require('../index');

describe('ESQCMS API E2E Tests', () => {
    let authToken = '';
    let testUserId = '';
    let testModelId = '';
    let testPartId = '';
    let testCustomerId = '';
    let testMaterialId = '';
    let testSectionId = '';
    let testShiftId = '';
    let testRejectReasonId = '';

    // ========================================
    // SETUP - Login before all tests
    // ========================================
    beforeAll(async () => {
        // Login with existing operator user from seed.js
        const loginRes = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'operator@esqcms.com',
                password: 'password123',
            });

        // Store token if login successful
        if (loginRes.status === 200 && loginRes.body.data?.token) {
            authToken = loginRes.body.data.token;
            console.log('✅ Login successful, token obtained');
        } else {
            console.warn('⚠️ Login failed, some tests may fail:', loginRes.body);
        }
    });

    // ========================================
    // HEALTH CHECK
    // ========================================
    describe('Health Check', () => {
        it('GET /api/health - should return health status', async () => {
            const res = await request(app)
                .get('/api/health')
                .set('Authorization', `Bearer ${authToken}`);

            expect(res.status).toBe(200);
            expect(res.headers['content-type']).toMatch(/json/);
            expect(res.body).toBeDefined();
            expect(res.body.status).toBe('OK');
        });
    });

    // ========================================
    // AUTH ENDPOINTS
    // ========================================
    describe('Auth Endpoints', () => {
        it('POST /api/auth/login - should login successfully', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'operator@esqcms.com',
                    password: 'password123',
                });

            expect(res.status).toBe(200);
            expect(res.headers['content-type']).toMatch(/json/);
            expect(res.body).toBeDefined();
            expect(res.body.success).toBe(true);
            expect(res.body.data).toHaveProperty('token');
        });

        it('POST /api/auth/login - should reject invalid credentials', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'invalid@email.com',
                    password: 'wrongpassword',
                });

            // API returns 400 (Bad Request) for invalid credentials
            expect(res.status).toBe(400);
            expect(res.headers['content-type']).toMatch(/json/);
            expect(res.body).toBeDefined();
            expect(res.body.success).toBe(false);
        });

        it('GET /api/auth/me - should return current user with token', async () => {
            const res = await request(app)
                .get('/api/auth/me')
                .set('Authorization', `Bearer ${authToken}`);

            expect(res.status).toBe(200);
            expect(res.headers['content-type']).toMatch(/json/);
            expect(res.body).toBeDefined();
            expect(res.body.success).toBe(true);
            expect(res.body.data).toHaveProperty('id');
            expect(res.body.data).toHaveProperty('email');
        });

        it('GET /api/auth/me - should reject without token', async () => {
            const res = await request(app).get('/api/auth/me');

            // API returns 400 when no token provided
            expect(res.status).toBe(400);
            expect(res.headers['content-type']).toMatch(/json/);
            expect(res.body).toBeDefined();
        });
    });

    // ========================================
    // MODELS CRUD
    // ========================================
    describe('Models CRUD', () => {
        it('POST /api/models - should create a model', async () => {
            const res = await request(app)
                .post('/api/models')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    modelName: `Test Model ${Date.now()}`,
                });

            expect(res.status).toBe(201);
            expect(res.headers['content-type']).toMatch(/json/);
            expect(res.body).toBeDefined();
            expect(res.body.success).toBe(true);
            expect(res.body.data).toHaveProperty('id');

            testModelId = res.body.data.id;
        });

        it('GET /api/models - should get all models', async () => {
            const res = await request(app)
                .get('/api/models')
                .set('Authorization', `Bearer ${authToken}`);

            expect(res.status).toBe(200);
            expect(res.headers['content-type']).toMatch(/json/);
            expect(res.body).toBeDefined();
            expect(res.body.success).toBe(true);
            expect(Array.isArray(res.body.data)).toBe(true);
        });

        it('GET /api/models/:id - should get model by ID', async () => {
            if (!testModelId) {
                console.warn('Skipping: No test model ID');
                return;
            }

            const res = await request(app)
                .get(`/api/models/${testModelId}`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(res.status).toBe(200);
            expect(res.headers['content-type']).toMatch(/json/);
            expect(res.body).toBeDefined();
            expect(res.body.success).toBe(true);
            expect(res.body.data).toHaveProperty('id', testModelId);
        });

        it('PUT /api/models/:id - should update model', async () => {
            if (!testModelId) {
                console.warn('Skipping: No test model ID');
                return;
            }

            const res = await request(app)
                .put(`/api/models/${testModelId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    modelName: `Updated Model ${Date.now()}`,
                });

            expect(res.status).toBe(200);
            expect(res.headers['content-type']).toMatch(/json/);
            expect(res.body).toBeDefined();
            expect(res.body.success).toBe(true);
        });

        it('DELETE /api/models/:id - should soft delete model', async () => {
            if (!testModelId) {
                console.warn('Skipping: No test model ID');
                return;
            }

            const res = await request(app)
                .delete(`/api/models/${testModelId}`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(res.status).toBe(200);
            expect(res.headers['content-type']).toMatch(/json/);
            expect(res.body).toBeDefined();
            expect(res.body.success).toBe(true);
        });
    });

    // ========================================
    // PARTS CRUD
    // ========================================
    describe('Parts CRUD', () => {
        it('POST /api/parts - should create a part', async () => {
            const res = await request(app)
                .post('/api/parts')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    partNumber: `PN-${Date.now()}`,
                    partName: `Test Part ${Date.now()}`,
                });

            expect(res.status).toBe(201);
            expect(res.headers['content-type']).toMatch(/json/);
            expect(res.body).toBeDefined();
            expect(res.body.success).toBe(true);

            testPartId = res.body.data?.id;
        });

        it('GET /api/parts - should get all parts', async () => {
            const res = await request(app)
                .get('/api/parts')
                .set('Authorization', `Bearer ${authToken}`);

            expect(res.status).toBe(200);
            expect(res.headers['content-type']).toMatch(/json/);
            expect(res.body).toBeDefined();
            expect(res.body.success).toBe(true);
        });

        it('GET /api/parts/:id - should get part by ID', async () => {
            if (!testPartId) return;

            const res = await request(app)
                .get(`/api/parts/${testPartId}`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(res.status).toBe(200);
            expect(res.headers['content-type']).toMatch(/json/);
            expect(res.body).toBeDefined();
        });

        it('DELETE /api/parts/:id - should soft delete part', async () => {
            if (!testPartId) return;

            const res = await request(app)
                .delete(`/api/parts/${testPartId}`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(res.status).toBe(200);
            expect(res.headers['content-type']).toMatch(/json/);
        });
    });

    // ========================================
    // CUSTOMERS CRUD
    // ========================================
    describe('Customers CRUD', () => {
        it('POST /api/customers - should create a customer', async () => {
            const res = await request(app)
                .post('/api/customers')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    customerName: `Test Customer ${Date.now()}`,
                });

            expect(res.status).toBe(201);
            expect(res.headers['content-type']).toMatch(/json/);
            expect(res.body).toBeDefined();
            expect(res.body.success).toBe(true);

            testCustomerId = res.body.data?.id;
        });

        it('GET /api/customers - should get all customers', async () => {
            const res = await request(app)
                .get('/api/customers')
                .set('Authorization', `Bearer ${authToken}`);

            expect(res.status).toBe(200);
            expect(res.headers['content-type']).toMatch(/json/);
            expect(res.body).toBeDefined();
        });

        it('DELETE /api/customers/:id - should soft delete customer', async () => {
            if (!testCustomerId) return;

            const res = await request(app)
                .delete(`/api/customers/${testCustomerId}`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(res.status).toBe(200);
            expect(res.headers['content-type']).toMatch(/json/);
        });
    });

    // ========================================
    // MATERIALS CRUD
    // ========================================
    describe('Materials CRUD', () => {
        it('POST /api/materials - should create a material', async () => {
            const res = await request(app)
                .post('/api/materials')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    materialName: `Test Material ${Date.now()}`,
                });

            expect(res.status).toBe(201);
            expect(res.headers['content-type']).toMatch(/json/);
            expect(res.body).toBeDefined();
            expect(res.body.success).toBe(true);

            testMaterialId = res.body.data?.id;
        });

        it('GET /api/materials - should get all materials', async () => {
            const res = await request(app)
                .get('/api/materials')
                .set('Authorization', `Bearer ${authToken}`);

            expect(res.status).toBe(200);
            expect(res.headers['content-type']).toMatch(/json/);
            expect(res.body).toBeDefined();
        });

        it('DELETE /api/materials/:id - should soft delete material', async () => {
            if (!testMaterialId) return;

            const res = await request(app)
                .delete(`/api/materials/${testMaterialId}`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(res.status).toBe(200);
            expect(res.headers['content-type']).toMatch(/json/);
        });
    });

    // ========================================
    // SECTIONS CRUD
    // ========================================
    describe('Sections CRUD', () => {
        it('POST /api/sections - should create a section', async () => {
            const res = await request(app)
                .post('/api/sections')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    sectionName: `Test Section ${Date.now()}`,
                });

            expect(res.status).toBe(201);
            expect(res.headers['content-type']).toMatch(/json/);
            expect(res.body).toBeDefined();
            expect(res.body.success).toBe(true);

            testSectionId = res.body.data?.id;
        });

        it('GET /api/sections - should get all sections', async () => {
            const res = await request(app)
                .get('/api/sections')
                .set('Authorization', `Bearer ${authToken}`);

            expect(res.status).toBe(200);
            expect(res.headers['content-type']).toMatch(/json/);
            expect(res.body).toBeDefined();
        });

        it('DELETE /api/sections/:id - should soft delete section', async () => {
            if (!testSectionId) return;

            const res = await request(app)
                .delete(`/api/sections/${testSectionId}`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(res.status).toBe(200);
            expect(res.headers['content-type']).toMatch(/json/);
        });
    });

    // ========================================
    // SHIFTS CRUD
    // ========================================
    describe('Shifts CRUD', () => {
        it('POST /api/shifts - should create a shift', async () => {
            const res = await request(app)
                .post('/api/shifts')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    shiftName: `Test Shift ${Date.now()}`,
                    startTime: '08:00',
                    endTime: '16:00',
                });

            expect(res.status).toBe(201);
            expect(res.headers['content-type']).toMatch(/json/);
            expect(res.body).toBeDefined();
            expect(res.body.success).toBe(true);

            testShiftId = res.body.data?.id;
        });

        it('GET /api/shifts - should get all shifts', async () => {
            const res = await request(app)
                .get('/api/shifts')
                .set('Authorization', `Bearer ${authToken}`);

            expect(res.status).toBe(200);
            expect(res.headers['content-type']).toMatch(/json/);
            expect(res.body).toBeDefined();
        });

        it('DELETE /api/shifts/:id - should soft delete shift', async () => {
            if (!testShiftId) return;

            const res = await request(app)
                .delete(`/api/shifts/${testShiftId}`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(res.status).toBe(200);
            expect(res.headers['content-type']).toMatch(/json/);
        });
    });

    // ========================================
    // REJECT REASONS CRUD
    // ========================================
    describe('Reject Reasons CRUD', () => {
        it('POST /api/reject-reasons - should create a reject reason', async () => {
            const res = await request(app)
                .post('/api/reject-reasons')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    reasonName: `Test Reason ${Date.now()}`,
                    description: 'Test description for reject reason',
                });

            expect(res.status).toBe(201);
            expect(res.headers['content-type']).toMatch(/json/);
            expect(res.body).toBeDefined();
            expect(res.body.success).toBe(true);

            testRejectReasonId = res.body.data?.id;
        });

        it('GET /api/reject-reasons - should get all reject reasons', async () => {
            const res = await request(app)
                .get('/api/reject-reasons')
                .set('Authorization', `Bearer ${authToken}`);

            expect(res.status).toBe(200);
            expect(res.headers['content-type']).toMatch(/json/);
            expect(res.body).toBeDefined();
        });

        it('DELETE /api/reject-reasons/:id - should soft delete reject reason', async () => {
            if (!testRejectReasonId) return;

            const res = await request(app)
                .delete(`/api/reject-reasons/${testRejectReasonId}`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(res.status).toBe(200);
            expect(res.headers['content-type']).toMatch(/json/);
        });
    });

    // ========================================
    // TYPES CRUD
    // ========================================
    describe('Types CRUD', () => {
        let testTypeId = '';

        it('POST /api/types - should create a type', async () => {
            const res = await request(app)
                .post('/api/types')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    typeName: `Test Type ${Date.now()}`,
                });

            expect(res.status).toBe(201);
            expect(res.headers['content-type']).toMatch(/json/);
            expect(res.body).toBeDefined();
            expect(res.body.success).toBe(true);

            testTypeId = res.body.data?.id;
        });

        it('GET /api/types - should get all types', async () => {
            const res = await request(app)
                .get('/api/types')
                .set('Authorization', `Bearer ${authToken}`);

            expect(res.status).toBe(200);
            expect(res.headers['content-type']).toMatch(/json/);
            expect(res.body).toBeDefined();
        });

        it('DELETE /api/types/:id - should soft delete type', async () => {
            if (!testTypeId) return;

            const res = await request(app)
                .delete(`/api/types/${testTypeId}`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(res.status).toBe(200);
            expect(res.headers['content-type']).toMatch(/json/);
        });
    });

    // ========================================
    // USERS CRUD
    // ========================================
    describe('Users CRUD', () => {
        it('GET /api/users - should get all users', async () => {
            const res = await request(app)
                .get('/api/users')
                .set('Authorization', `Bearer ${authToken}`);

            expect(res.status).toBe(200);
            expect(res.headers['content-type']).toMatch(/json/);
            expect(res.body).toBeDefined();
            expect(res.body.success).toBe(true);
        });
    });

    // ========================================
    // CHECKSHEET TEMPLATES CRUD
    // ========================================
    describe('Checksheet Templates CRUD', () => {
        it('GET /api/checksheet-templates - should get all templates', async () => {
            const res = await request(app)
                .get('/api/checksheet-templates')
                .set('Authorization', `Bearer ${authToken}`);

            expect(res.status).toBe(200);
            expect(res.headers['content-type']).toMatch(/json/);
            expect(res.body).toBeDefined();
        });
    });

    // ========================================
    // DIRS (Checksheet) CRUD
    // ========================================
    describe('DIRs CRUD', () => {
        it('GET /api/dirs - should get all DIRs', async () => {
            const res = await request(app)
                .get('/api/dirs')
                .set('Authorization', `Bearer ${authToken}`);

            expect(res.status).toBe(200);
            expect(res.headers['content-type']).toMatch(/json/);
            expect(res.body).toBeDefined();
        });
    });

    // ========================================
    // FIs (Checksheet) CRUD
    // ========================================
    describe('FIs CRUD', () => {
        it('GET /api/fis - should get all FIs', async () => {
            const res = await request(app)
                .get('/api/fis')
                .set('Authorization', `Bearer ${authToken}`);

            expect(res.status).toBe(200);
            expect(res.headers['content-type']).toMatch(/json/);
            expect(res.body).toBeDefined();
        });
    });

    // ========================================
    // CHECKSHEET WORKFLOW
    // ========================================
    describe('Checksheet Workflow', () => {
        it('should handle DIR workflow endpoints', async () => {
            // Just test that endpoints exist and respond
            // Actual workflow testing needs specific test data

            // Get an existing DIR to test with
            const dirsRes = await request(app)
                .get('/api/dirs')
                .set('Authorization', `Bearer ${authToken}`);

            expect(dirsRes.status).toBe(200);
            expect(dirsRes.headers['content-type']).toMatch(/json/);
        });
    });

    // ========================================
    // 404 NOT FOUND
    // ========================================
    describe('404 Handling', () => {
        it('should return 404 for unknown endpoint', async () => {
            const res = await request(app)
                .get('/api/unknown-endpoint')
                .set('Authorization', `Bearer ${authToken}`);

            expect(res.status).toBe(404);
            expect(res.headers['content-type']).toMatch(/json/);
            expect(res.body).toBeDefined();
        });
    });

    // ========================================
    // UNAUTHORIZED ACCESS
    // ========================================
    describe('Unauthorized Access', () => {
        it('should reject request without token', async () => {
            const res = await request(app).get('/api/models');

            // API returns 400 when no token provided
            expect(res.status).toBe(400);
            expect(res.headers['content-type']).toMatch(/json/);
            expect(res.body).toBeDefined();
        });

        it('should reject request with invalid token', async () => {
            const res = await request(app)
                .get('/api/models')
                .set('Authorization', 'Bearer invalid-token');

            // API returns 400 for invalid token
            expect(res.status).toBe(400);
            expect(res.headers['content-type']).toMatch(/json/);
            expect(res.body).toBeDefined();
        });
    });
});
