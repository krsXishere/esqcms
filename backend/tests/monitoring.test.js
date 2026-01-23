/**
 * E2E API Tests - Checksheet Monitoring
 * 
 * Tests monitoring endpoint with real database connection (no mocking)
 * Uses Jest + Supertest for HTTP assertions
 */

const request = require('supertest');
const app = require('../index');

describe('Checksheet Monitoring API Tests', () => {
    let operatorToken = '';
    let inspectorToken = '';
    let supervisorToken = '';

    // ========================================
    // SETUP - Login before all tests
    // ========================================
    beforeAll(async () => {
        // Login as operator
        const operatorRes = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'operator@esqcms.com',
                password: 'password123',
            });

        if (operatorRes.status === 200 && operatorRes.body.data?.token) {
            operatorToken = operatorRes.body.data.token;
            console.log('✅ Operator login successful');
        }

        // Login as inspector
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

        // Login as supervisor
        const supervisorRes = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'supervisor@esqcms.com',
                password: 'password123',
            });

        if (supervisorRes.status === 200 && supervisorRes.body.data?.token) {
            supervisorToken = supervisorRes.body.data.token;
            console.log('✅ Supervisor login successful');
        }
    });

    // ========================================
    // CHECKSHEET MONITORING ENDPOINT
    // ========================================
    describe('GET /api/checksheets/monitoring', () => {
        it('should get all checksheets for monitoring', async () => {
            const res = await request(app)
                .get('/api/checksheets/monitoring')
                .set('Authorization', `Bearer ${operatorToken}`);

            expect(res.status).toBe(200);
            expect(res.headers['content-type']).toMatch(/json/);
            expect(res.body).toBeDefined();
            expect(res.body.success).toBe(true);
            expect(Array.isArray(res.body.data)).toBe(true);
            expect(res.body.pagination).toBeDefined();
        });

        it('should support pagination with page and limit', async () => {
            const res = await request(app)
                .get('/api/checksheets/monitoring?page=1&limit=5')
                .set('Authorization', `Bearer ${operatorToken}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.pagination.page).toBe(1);
            expect(res.body.pagination.limit).toBe(5);
            expect(res.body.pagination.total).toBeDefined();
            expect(res.body.pagination.total_pages).toBeDefined();
        });

        it('should filter by type=dir and return only DIRs', async () => {
            const res = await request(app)
                .get('/api/checksheets/monitoring?type=dir')
                .set('Authorization', `Bearer ${operatorToken}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(Array.isArray(res.body.data)).toBe(true);

            // All rows should be type 'dir'
            if (res.body.data.length > 0) {
                res.body.data.forEach(row => {
                    expect(row.type).toBe('dir');
                });
            }
        });

        it('should filter by type=fi and return only FIs', async () => {
            const res = await request(app)
                .get('/api/checksheets/monitoring?type=fi')
                .set('Authorization', `Bearer ${operatorToken}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(Array.isArray(res.body.data)).toBe(true);

            // All rows should be type 'fi'
            if (res.body.data.length > 0) {
                res.body.data.forEach(row => {
                    expect(row.type).toBe('fi');
                });
            }
        });

        it('should filter by status=pending', async () => {
            const res = await request(app)
                .get('/api/checksheets/monitoring?status=pending')
                .set('Authorization', `Bearer ${operatorToken}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);

            if (res.body.data.length > 0) {
                res.body.data.forEach(row => {
                    expect(row.status).toBe('pending');
                });
            }
        });

        it('should filter by status=revision', async () => {
            const res = await request(app)
                .get('/api/checksheets/monitoring?status=revision')
                .set('Authorization', `Bearer ${operatorToken}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);

            if (res.body.data.length > 0) {
                res.body.data.forEach(row => {
                    expect(row.status).toBe('revision');
                });
            }
        });

        it('should filter by status=checked', async () => {
            const res = await request(app)
                .get('/api/checksheets/monitoring?status=checked')
                .set('Authorization', `Bearer ${operatorToken}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);

            if (res.body.data.length > 0) {
                res.body.data.forEach(row => {
                    expect(row.status).toBe('checked');
                });
            }
        });

        it('should filter by status=approved', async () => {
            const res = await request(app)
                .get('/api/checksheets/monitoring?status=approved')
                .set('Authorization', `Bearer ${operatorToken}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);

            if (res.body.data.length > 0) {
                res.body.data.forEach(row => {
                    expect(row.status).toBe('approved');
                });
            }
        });

        it('should search by checksheet_id', async () => {
            // First get some data to search
            const initialRes = await request(app)
                .get('/api/checksheets/monitoring')
                .set('Authorization', `Bearer ${operatorToken}`);

            if (initialRes.body.data.length > 0 && initialRes.body.data[0].checksheet_id) {
                const searchTerm = initialRes.body.data[0].checksheet_id.substring(0, 3);

                const searchRes = await request(app)
                    .get(`/api/checksheets/monitoring?search=${searchTerm}`)
                    .set('Authorization', `Bearer ${operatorToken}`);

                expect(searchRes.status).toBe(200);
                expect(searchRes.body.success).toBe(true);
            }
        });

        it('should support sorting by updatedAt desc', async () => {
            const res = await request(app)
                .get('/api/checksheets/monitoring?sort_field=updatedAt&sort_dir=desc')
                .set('Authorization', `Bearer ${operatorToken}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
        });

        it('should support sorting by updatedAt asc', async () => {
            const res = await request(app)
                .get('/api/checksheets/monitoring?sort_field=updatedAt&sort_dir=asc')
                .set('Authorization', `Bearer ${operatorToken}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
        });

        it('should support combined filters (type + status)', async () => {
            const res = await request(app)
                .get('/api/checksheets/monitoring?type=dir&status=pending')
                .set('Authorization', `Bearer ${operatorToken}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);

            if (res.body.data.length > 0) {
                res.body.data.forEach(row => {
                    expect(row.type).toBe('dir');
                    expect(row.status).toBe('pending');
                });
            }
        });

        it('should return correct data structure for each row', async () => {
            const res = await request(app)
                .get('/api/checksheets/monitoring?limit=5')
                .set('Authorization', `Bearer ${operatorToken}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(Array.isArray(res.body.data)).toBe(true);

            if (res.body.data.length > 0) {
                const item = res.body.data[0];

                // Validate required fields matching frontend page.jsx expectations
                expect(item).toHaveProperty('id');
                expect(item).toHaveProperty('checksheet_id');
                expect(item).toHaveProperty('serial_number');
                expect(item).toHaveProperty('type');
                expect(item).toHaveProperty('model_name');
                expect(item).toHaveProperty('part_name');
                expect(item).toHaveProperty('inspector_name');
                expect(item).toHaveProperty('foreman_name');
                expect(item).toHaveProperty('approver_name');
                expect(item).toHaveProperty('status');
                expect(item).toHaveProperty('final_result');
                expect(item).toHaveProperty('updated_at');

                // Validate type values
                expect(['dir', 'fi']).toContain(item.type);
                expect(['pending', 'revision', 'checked', 'approved']).toContain(item.status);
            }
        });

        it('should return correct pagination structure', async () => {
            const res = await request(app)
                .get('/api/checksheets/monitoring?page=1&limit=10')
                .set('Authorization', `Bearer ${operatorToken}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.pagination).toBeDefined();
            expect(res.body.pagination).toHaveProperty('page');
            expect(res.body.pagination).toHaveProperty('limit');
            expect(res.body.pagination).toHaveProperty('total');
            expect(res.body.pagination).toHaveProperty('total_pages');
            expect(typeof res.body.pagination.page).toBe('number');
            expect(typeof res.body.pagination.limit).toBe('number');
            expect(typeof res.body.pagination.total).toBe('number');
            expect(typeof res.body.pagination.total_pages).toBe('number');
        });
    });

    // ========================================
    // ROLE-BASED ACCESS
    // ========================================
    describe('Role-Based Access', () => {
        it('should allow operator to access monitoring', async () => {
            const res = await request(app)
                .get('/api/checksheets/monitoring')
                .set('Authorization', `Bearer ${operatorToken}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
        });

        it('should allow inspector to access monitoring', async () => {
            const res = await request(app)
                .get('/api/checksheets/monitoring')
                .set('Authorization', `Bearer ${inspectorToken}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
        });

        it('should allow supervisor to access monitoring', async () => {
            const res = await request(app)
                .get('/api/checksheets/monitoring')
                .set('Authorization', `Bearer ${supervisorToken}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
        });
    });

    // ========================================
    // UNAUTHORIZED ACCESS
    // ========================================
    describe('Unauthorized Access', () => {
        it('should reject request without token', async () => {
            const res = await request(app).get('/api/checksheets/monitoring');

            expect(res.status).toBe(400);
            expect(res.headers['content-type']).toMatch(/json/);
            expect(res.body).toBeDefined();
        });

        it('should reject request with invalid token', async () => {
            const res = await request(app)
                .get('/api/checksheets/monitoring')
                .set('Authorization', 'Bearer invalid-token');

            expect(res.status).toBe(400);
            expect(res.headers['content-type']).toMatch(/json/);
            expect(res.body).toBeDefined();
        });
    });
});
