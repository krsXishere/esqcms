/**
 * E2E API Tests - Checksheet Templates
 * 
 * Tests for checksheet template endpoints with filtering, stats, and CRUD operations
 * Uses Jest + Supertest for HTTP assertions
 */

const request = require('supertest');
const app = require('../index');

describe('Checksheet Templates API Tests', () => {
    let operatorToken = '';
    let inspectorToken = '';
    let testTemplateId = '';
    let testModelId = '';
    let testPartId = '';

    // ========================================
    // SETUP - Login before all tests
    // ========================================
    beforeAll(async () => {
        // Login as operator (can manage master data)
        const operatorRes = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'operator@esqcms.com',
                password: 'password123',
            });

        if (operatorRes.status === 200 && operatorRes.body.data?.token) {
            operatorToken = operatorRes.body.data.token;
            console.log('✅ Operator login successful');
        } else {
            console.warn('⚠️ Operator login failed');
        }

        // Login as inspector (read-only for templates)
        const inspectorRes = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'inspector@esqcms.com',
                password: 'password123',
            });

        if (inspectorRes.status === 200 && inspectorRes.body.data?.token) {
            inspectorToken = inspectorRes.body.data.token;
            console.log('✅ Inspector login successful');
        }

        // Get existing model and part for template creation
        const modelsRes = await request(app)
            .get('/api/models')
            .set('Authorization', `Bearer ${operatorToken}`);

        if (modelsRes.body.data?.length > 0) {
            testModelId = modelsRes.body.data[0].id;
        }

        const partsRes = await request(app)
            .get('/api/parts')
            .set('Authorization', `Bearer ${operatorToken}`);

        if (partsRes.body.data?.length > 0) {
            testPartId = partsRes.body.data[0].id;
        }

        console.log('📦 Test data loaded:', {
            modelId: testModelId ? '✓' : '✗',
            partId: testPartId ? '✓' : '✗',
        });
    });

    // ========================================
    // GET ALL TEMPLATES
    // ========================================
    describe('GET /api/checksheet-templates', () => {
        it('should get all templates with default pagination', async () => {
            const res = await request(app)
                .get('/api/checksheet-templates')
                .set('Authorization', `Bearer ${operatorToken}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(Array.isArray(res.body.data)).toBe(true);
            expect(res.body.pagination).toBeDefined();
            expect(res.body.pagination.page).toBe(1);
            expect(res.body.pagination.limit).toBe(10);
        });

        it('should support custom pagination', async () => {
            const res = await request(app)
                .get('/api/checksheet-templates?page=1&limit=5')
                .set('Authorization', `Bearer ${operatorToken}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.pagination.page).toBe(1);
            expect(res.body.pagination.limit).toBe(5);
        });

        it('should filter by type (dir)', async () => {
            const res = await request(app)
                .get('/api/checksheet-templates?type=dir')
                .set('Authorization', `Bearer ${operatorToken}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);

            if (res.body.data.length > 0) {
                res.body.data.forEach(template => {
                    expect(template.rawType).toBe('dir');
                    expect(template.type).toBe('In Process');
                });
            }
        });

        it('should filter by type (fi)', async () => {
            const res = await request(app)
                .get('/api/checksheet-templates?type=fi')
                .set('Authorization', `Bearer ${operatorToken}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);

            if (res.body.data.length > 0) {
                res.body.data.forEach(template => {
                    expect(template.rawType).toBe('fi');
                    expect(template.type).toBe('Final');
                });
            }
        });

        it('should filter by status (active)', async () => {
            const res = await request(app)
                .get('/api/checksheet-templates?status=active')
                .set('Authorization', `Bearer ${operatorToken}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);

            if (res.body.data.length > 0) {
                res.body.data.forEach(template => {
                    expect(template.status).toBe('active');
                });
            }
        });

        it('should filter by status (draft)', async () => {
            const res = await request(app)
                .get('/api/checksheet-templates?status=draft')
                .set('Authorization', `Bearer ${operatorToken}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);

            if (res.body.data.length > 0) {
                res.body.data.forEach(template => {
                    expect(template.status).toBe('draft');
                });
            }
        });

        it('should search by template code', async () => {
            const res = await request(app)
                .get('/api/checksheet-templates?search=TPL')
                .set('Authorization', `Bearer ${operatorToken}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
        });

        it('should return correct data structure for frontend', async () => {
            const res = await request(app)
                .get('/api/checksheet-templates?limit=5')
                .set('Authorization', `Bearer ${operatorToken}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);

            if (res.body.data.length > 0) {
                const template = res.body.data[0];

                // Frontend required fields
                expect(template).toHaveProperty('id');
                expect(template).toHaveProperty('name');
                expect(template).toHaveProperty('code');
                expect(template).toHaveProperty('type');
                expect(template).toHaveProperty('fields');
                expect(template).toHaveProperty('lastModified');
                expect(template).toHaveProperty('status');

                // Type should be mapped to display name
                expect(['In Process', 'Final']).toContain(template.type);

                // Status should be valid enum
                expect(['active', 'draft', 'inactive']).toContain(template.status);

                // Fields should be a number
                expect(typeof template.fields).toBe('number');
            }
        });
    });

    // ========================================
    // GET TEMPLATE STATS
    // ========================================
    describe('GET /api/checksheet-templates/stats', () => {
        it('should get template statistics', async () => {
            const res = await request(app)
                .get('/api/checksheet-templates/stats')
                .set('Authorization', `Bearer ${operatorToken}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toBeDefined();

            // Validate stats structure
            expect(res.body.data).toHaveProperty('total');
            expect(res.body.data).toHaveProperty('active');
            expect(res.body.data).toHaveProperty('draft');
            expect(res.body.data).toHaveProperty('inactive');

            // All values should be numbers
            expect(typeof res.body.data.total).toBe('number');
            expect(typeof res.body.data.active).toBe('number');
            expect(typeof res.body.data.draft).toBe('number');
            expect(typeof res.body.data.inactive).toBe('number');

            // Total should equal sum of statuses
            expect(res.body.data.total).toBe(
                res.body.data.active + res.body.data.draft + res.body.data.inactive
            );
        });

        it('should be accessible by inspector', async () => {
            const res = await request(app)
                .get('/api/checksheet-templates/stats')
                .set('Authorization', `Bearer ${inspectorToken}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
        });
    });

    // ========================================
    // CREATE TEMPLATE
    // ========================================
    describe('POST /api/checksheet-templates', () => {
        it('should create a new template with status', async () => {
            if (!testModelId || !testPartId) {
                console.warn('Skipping: No model or part available');
                return;
            }

            const res = await request(app)
                .post('/api/checksheet-templates')
                .set('Authorization', `Bearer ${operatorToken}`)
                .send({
                    templateName: `Test Template ${Date.now()}`,
                    type: 'dir',
                    modelId: testModelId,
                    partId: testPartId,
                    description: 'Test template for E2E testing',
                    status: 'draft',
                });

            expect(res.status).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toHaveProperty('id');
            expect(res.body.data.status).toBe('draft');

            testTemplateId = res.body.data.id;
        });

        it('should default status to draft when not provided', async () => {
            if (!testModelId || !testPartId) {
                return;
            }

            const res = await request(app)
                .post('/api/checksheet-templates')
                .set('Authorization', `Bearer ${operatorToken}`)
                .send({
                    templateName: `Test Template Default ${Date.now()}`,
                    type: 'fi',
                    modelId: testModelId,
                    partId: testPartId,
                    description: 'Test template with default status',
                });

            expect(res.status).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.data.status).toBe('draft');

            // Clean up
            if (res.body.data.id) {
                await request(app)
                    .delete(`/api/checksheet-templates/${res.body.data.id}`)
                    .set('Authorization', `Bearer ${operatorToken}`);
            }
        });

        it('should reject invalid status', async () => {
            if (!testModelId || !testPartId) {
                return;
            }

            const res = await request(app)
                .post('/api/checksheet-templates')
                .set('Authorization', `Bearer ${operatorToken}`)
                .send({
                    templateName: `Test Template Invalid ${Date.now()}`,
                    type: 'dir',
                    modelId: testModelId,
                    partId: testPartId,
                    description: 'Test template with invalid status',
                    status: 'invalid_status',
                });

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
        });

        it('should reject missing required fields', async () => {
            const res = await request(app)
                .post('/api/checksheet-templates')
                .set('Authorization', `Bearer ${operatorToken}`)
                .send({
                    templateName: 'Incomplete Template',
                });

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
        });

        it('should reject creation by inspector (non-operator)', async () => {
            if (!testModelId || !testPartId) {
                return;
            }

            const res = await request(app)
                .post('/api/checksheet-templates')
                .set('Authorization', `Bearer ${inspectorToken}`)
                .send({
                    templateName: `Inspector Template ${Date.now()}`,
                    type: 'dir',
                    modelId: testModelId,
                    partId: testPartId,
                    description: 'Template by inspector',
                });

            expect(res.status).toBe(403);
        });
    });

    // ========================================
    // GET TEMPLATE BY ID
    // ========================================
    describe('GET /api/checksheet-templates/:id', () => {
        it('should get template by ID', async () => {
            if (!testTemplateId) {
                console.warn('Skipping: No test template available');
                return;
            }

            const res = await request(app)
                .get(`/api/checksheet-templates/${testTemplateId}`)
                .set('Authorization', `Bearer ${operatorToken}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.id).toBe(testTemplateId);
        });

        it('should return 404 for non-existent template', async () => {
            const res = await request(app)
                .get('/api/checksheet-templates/00000000-0000-0000-0000-000000000000')
                .set('Authorization', `Bearer ${operatorToken}`);

            expect(res.status).toBe(404);
        });
    });

    // ========================================
    // UPDATE TEMPLATE
    // ========================================
    describe('PUT /api/checksheet-templates/:id', () => {
        it('should update template status', async () => {
            if (!testTemplateId) {
                console.warn('Skipping: No test template available');
                return;
            }

            const res = await request(app)
                .put(`/api/checksheet-templates/${testTemplateId}`)
                .set('Authorization', `Bearer ${operatorToken}`)
                .send({
                    status: 'active',
                });

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.status).toBe('active');
        });

        it('should update template name', async () => {
            if (!testTemplateId) {
                return;
            }

            const newName = `Updated Template ${Date.now()}`;
            const res = await request(app)
                .put(`/api/checksheet-templates/${testTemplateId}`)
                .set('Authorization', `Bearer ${operatorToken}`)
                .send({
                    templateName: newName,
                });

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.templateName).toBe(newName);
        });

        it('should reject invalid status on update', async () => {
            if (!testTemplateId) {
                return;
            }

            const res = await request(app)
                .put(`/api/checksheet-templates/${testTemplateId}`)
                .set('Authorization', `Bearer ${operatorToken}`)
                .send({
                    status: 'invalid_status',
                });

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
        });

        it('should reject update by inspector', async () => {
            if (!testTemplateId) {
                return;
            }

            const res = await request(app)
                .put(`/api/checksheet-templates/${testTemplateId}`)
                .set('Authorization', `Bearer ${inspectorToken}`)
                .send({
                    templateName: 'Inspector Update Attempt',
                });

            expect(res.status).toBe(403);
        });
    });

    // ========================================
    // DELETE TEMPLATE
    // ========================================
    describe('DELETE /api/checksheet-templates/:id', () => {
        it('should soft delete template', async () => {
            if (!testTemplateId) {
                console.warn('Skipping: No test template available');
                return;
            }

            const res = await request(app)
                .delete(`/api/checksheet-templates/${testTemplateId}`)
                .set('Authorization', `Bearer ${operatorToken}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);

            // Verify it's not returned in list
            const listRes = await request(app)
                .get('/api/checksheet-templates')
                .set('Authorization', `Bearer ${operatorToken}`);

            const deleted = listRes.body.data.find(t => t.id === testTemplateId);
            expect(deleted).toBeUndefined();
        });

        it('should reject delete by inspector', async () => {
            // Get a template to try to delete
            const listRes = await request(app)
                .get('/api/checksheet-templates')
                .set('Authorization', `Bearer ${operatorToken}`);

            if (listRes.body.data.length > 0) {
                const templateId = listRes.body.data[0].id;

                const res = await request(app)
                    .delete(`/api/checksheet-templates/${templateId}`)
                    .set('Authorization', `Bearer ${inspectorToken}`);

                expect(res.status).toBe(403);
            }
        });
    });

    // ========================================
    // UNAUTHORIZED ACCESS
    // ========================================
    describe('Unauthorized Access', () => {
        it('should reject request without token', async () => {
            const res = await request(app).get('/api/checksheet-templates');

            expect(res.status).toBe(400);
        });

        it('should reject request with invalid token', async () => {
            const res = await request(app)
                .get('/api/checksheet-templates')
                .set('Authorization', 'Bearer invalid-token');

            expect(res.status).toBe(400);
        });

        it('should reject stats request without token', async () => {
            const res = await request(app).get('/api/checksheet-templates/stats');

            expect(res.status).toBe(400);
        });
    });
});
