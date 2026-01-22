/**
 * E2E API Tests - Revision Endpoints
 * 
 * Tests the revision queue and history endpoints
 * GET /api/checksheet-revisions/current
 * GET /api/checksheet-revisions/history
 */

const request = require('supertest');
const app = require('../index');

describe('ESQCMS Revision API Tests', () => {
    let operatorToken = '';
    let inspectorToken = '';
    let supervisorToken = '';

    // ========================================
    // SETUP - Login all users before tests
    // ========================================
    beforeAll(async () => {
        // Login as operator (admin)
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
            console.warn('⚠️ Operator login failed:', operatorRes.body);
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
        } else {
            console.warn('⚠️ Inspector login failed:', inspectorRes.body);
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
        } else {
            console.warn('⚠️ Supervisor login failed:', supervisorRes.body);
        }
    });

    // ========================================
    // ROLE VERIFICATION
    // ========================================
    describe('Role Verification', () => {
        it('should have all user tokens available', () => {
            expect(operatorToken).toBeTruthy();
            expect(inspectorToken).toBeTruthy();
            expect(supervisorToken).toBeTruthy();
        });
    });

    // ========================================
    // GET /api/checksheet-revisions/current
    // ========================================
    describe('Current Revisions Endpoint', () => {
        it('GET /api/checksheet-revisions/current - Operator can access current revisions', async () => {
            const res = await request(app)
                .get('/api/checksheet-revisions/current')
                .set('Authorization', `Bearer ${operatorToken}`);

            expect(res.status).toBe(200);
            expect(res.headers['content-type']).toMatch(/json/);
            expect(res.body.success).toBe(true);
            expect(Array.isArray(res.body.data)).toBe(true);
            expect(res.body).toHaveProperty('pagination');
            expect(res.body.pagination).toHaveProperty('page');
            expect(res.body.pagination).toHaveProperty('limit');
            expect(res.body.pagination).toHaveProperty('total');
            expect(res.body.pagination).toHaveProperty('totalPages');

            console.log('   📋 Current Revisions:', {
                total: res.body.pagination.total,
                page: res.body.pagination.page,
            });
        });

        it('GET /api/checksheet-revisions/current - Inspector can access current revisions', async () => {
            const res = await request(app)
                .get('/api/checksheet-revisions/current')
                .set('Authorization', `Bearer ${inspectorToken}`);

            expect(res.status).toBe(200);
            expect(res.headers['content-type']).toMatch(/json/);
            expect(res.body.success).toBe(true);
            expect(Array.isArray(res.body.data)).toBe(true);
        });

        it('GET /api/checksheet-revisions/current - Supervisor can access current revisions', async () => {
            const res = await request(app)
                .get('/api/checksheet-revisions/current')
                .set('Authorization', `Bearer ${supervisorToken}`);

            expect(res.status).toBe(200);
            expect(res.headers['content-type']).toMatch(/json/);
            expect(res.body.success).toBe(true);
            expect(Array.isArray(res.body.data)).toBe(true);
        });

        it('GET /api/checksheet-revisions/current - Should support pagination', async () => {
            const res = await request(app)
                .get('/api/checksheet-revisions/current?page=1&limit=5')
                .set('Authorization', `Bearer ${operatorToken}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.pagination.page).toBe(1);
            expect(res.body.pagination.limit).toBe(5);
        });

        it('GET /api/checksheet-revisions/current - Should support search filter', async () => {
            const res = await request(app)
                .get('/api/checksheet-revisions/current?search=DIR')
                .set('Authorization', `Bearer ${operatorToken}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(Array.isArray(res.body.data)).toBe(true);
        });

        it('GET /api/checksheet-revisions/current - Should support inspector filter', async () => {
            const res = await request(app)
                .get('/api/checksheet-revisions/current?inspector=Inspector')
                .set('Authorization', `Bearer ${operatorToken}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(Array.isArray(res.body.data)).toBe(true);
        });

        it('GET /api/checksheet-revisions/current - Should support requestedBy filter', async () => {
            const res = await request(app)
                .get('/api/checksheet-revisions/current?requestedBy=Supervisor')
                .set('Authorization', `Bearer ${operatorToken}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(Array.isArray(res.body.data)).toBe(true);
        });

        it('GET /api/checksheet-revisions/current - Should support referenceType filter (dir)', async () => {
            const res = await request(app)
                .get('/api/checksheet-revisions/current?referenceType=dir')
                .set('Authorization', `Bearer ${operatorToken}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(Array.isArray(res.body.data)).toBe(true);

            // All items should be DIR type if any exist
            res.body.data.forEach(item => {
                expect(item.type).toBe('DIR');
            });
        });

        it('GET /api/checksheet-revisions/current - Should support referenceType filter (fi)', async () => {
            const res = await request(app)
                .get('/api/checksheet-revisions/current?referenceType=fi')
                .set('Authorization', `Bearer ${operatorToken}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(Array.isArray(res.body.data)).toBe(true);

            // All items should be FI type if any exist
            res.body.data.forEach(item => {
                expect(item.type).toBe('FI');
            });
        });

        it('GET /api/checksheet-revisions/current - Should return correct data structure', async () => {
            const res = await request(app)
                .get('/api/checksheet-revisions/current')
                .set('Authorization', `Bearer ${operatorToken}`);

            expect(res.status).toBe(200);

            if (res.body.data.length > 0) {
                const item = res.body.data[0];
                expect(item).toHaveProperty('id');
                expect(item).toHaveProperty('no');
                expect(item).toHaveProperty('type');
                expect(item).toHaveProperty('model');
                expect(item).toHaveProperty('inspector');
                expect(item).toHaveProperty('reason');
                expect(item).toHaveProperty('requestedBy');
                expect(item).toHaveProperty('status');
                expect(item).toHaveProperty('date');
                expect(item).toHaveProperty('priority');
            }
        });
    });

    // ========================================
    // GET /api/checksheet-revisions/history
    // ========================================
    describe('Revision History Endpoint', () => {
        it('GET /api/checksheet-revisions/history - Operator can access revision history', async () => {
            const res = await request(app)
                .get('/api/checksheet-revisions/history')
                .set('Authorization', `Bearer ${operatorToken}`);

            expect(res.status).toBe(200);
            expect(res.headers['content-type']).toMatch(/json/);
            expect(res.body.success).toBe(true);
            expect(Array.isArray(res.body.data)).toBe(true);
            expect(res.body).toHaveProperty('pagination');

            console.log('   📜 Revision History:', {
                total: res.body.pagination.total,
                page: res.body.pagination.page,
            });
        });

        it('GET /api/checksheet-revisions/history - Inspector can access revision history', async () => {
            const res = await request(app)
                .get('/api/checksheet-revisions/history')
                .set('Authorization', `Bearer ${inspectorToken}`);

            expect(res.status).toBe(200);
            expect(res.headers['content-type']).toMatch(/json/);
            expect(res.body.success).toBe(true);
            expect(Array.isArray(res.body.data)).toBe(true);
        });

        it('GET /api/checksheet-revisions/history - Supervisor can access revision history', async () => {
            const res = await request(app)
                .get('/api/checksheet-revisions/history')
                .set('Authorization', `Bearer ${supervisorToken}`);

            expect(res.status).toBe(200);
            expect(res.headers['content-type']).toMatch(/json/);
            expect(res.body.success).toBe(true);
            expect(Array.isArray(res.body.data)).toBe(true);
        });

        it('GET /api/checksheet-revisions/history - Should support pagination', async () => {
            const res = await request(app)
                .get('/api/checksheet-revisions/history?page=1&limit=5')
                .set('Authorization', `Bearer ${operatorToken}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.pagination.page).toBe(1);
            expect(res.body.pagination.limit).toBe(5);
        });

        it('GET /api/checksheet-revisions/history - Should support search filter', async () => {
            const res = await request(app)
                .get('/api/checksheet-revisions/history?search=DIR')
                .set('Authorization', `Bearer ${operatorToken}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(Array.isArray(res.body.data)).toBe(true);
        });

        it('GET /api/checksheet-revisions/history - Should support referenceType filter', async () => {
            const res = await request(app)
                .get('/api/checksheet-revisions/history?referenceType=dir')
                .set('Authorization', `Bearer ${operatorToken}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(Array.isArray(res.body.data)).toBe(true);
        });

        it('GET /api/checksheet-revisions/history - Should return correct data structure', async () => {
            const res = await request(app)
                .get('/api/checksheet-revisions/history')
                .set('Authorization', `Bearer ${operatorToken}`);

            expect(res.status).toBe(200);

            if (res.body.data.length > 0) {
                const item = res.body.data[0];
                expect(item).toHaveProperty('id');
                expect(item).toHaveProperty('no');
                expect(item).toHaveProperty('type');
                expect(item).toHaveProperty('model');
                expect(item).toHaveProperty('inspector');
                expect(item).toHaveProperty('reason');
                expect(item).toHaveProperty('requestedBy');
                expect(item).toHaveProperty('revisedAt');
                expect(item).toHaveProperty('completedAt');
                expect(item).toHaveProperty('duration');

                console.log('   📊 Sample History Item:', {
                    no: item.no,
                    type: item.type,
                    duration: item.duration,
                });
            }
        });
    });

    // ========================================
    // UNAUTHORIZED ACCESS
    // ========================================
    describe('Unauthorized Access', () => {
        it('GET /api/checksheet-revisions/current - Should reject without token', async () => {
            const res = await request(app)
                .get('/api/checksheet-revisions/current');

            expect(res.status).toBe(400);
            expect(res.headers['content-type']).toMatch(/json/);
        });

        it('GET /api/checksheet-revisions/history - Should reject without token', async () => {
            const res = await request(app)
                .get('/api/checksheet-revisions/history');

            expect(res.status).toBe(400);
            expect(res.headers['content-type']).toMatch(/json/);
        });

        it('GET /api/checksheet-revisions/current - Should reject with invalid token', async () => {
            const res = await request(app)
                .get('/api/checksheet-revisions/current')
                .set('Authorization', 'Bearer invalid-token');

            expect(res.status).toBe(400);
            expect(res.headers['content-type']).toMatch(/json/);
        });

        it('GET /api/checksheet-revisions/history - Should reject with invalid token', async () => {
            const res = await request(app)
                .get('/api/checksheet-revisions/history')
                .set('Authorization', 'Bearer invalid-token');

            expect(res.status).toBe(400);
            expect(res.headers['content-type']).toMatch(/json/);
        });
    });

    // ========================================
    // EXISTING ENDPOINTS STILL WORK
    // ========================================
    describe('Existing Revision Endpoints', () => {
        it('GET /api/checksheet-revisions - Should still work', async () => {
            const res = await request(app)
                .get('/api/checksheet-revisions')
                .set('Authorization', `Bearer ${operatorToken}`);

            expect(res.status).toBe(200);
            expect(res.headers['content-type']).toMatch(/json/);
            expect(res.body.success).toBe(true);
        });
    });
});
