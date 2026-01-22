/**
 * E2E Dashboard Tests - ESQCMS Backend
 * 
 * Tests dashboard endpoints for different roles:
 * - Inspector Dashboard: Own checksheets summary
 * - Checker Dashboard: Pending/revision for validation
 * - Approver Dashboard: Checked items + NG metrics
 * - Operator Dashboard: Full system overview
 */

const request = require('supertest');
const app = require('../index');

describe('ESQCMS Dashboard API Tests', () => {
    // Auth tokens for different roles
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
        it('should have all three user roles available', () => {
            expect(operatorToken).toBeTruthy();
            expect(inspectorToken).toBeTruthy();
            expect(supervisorToken).toBeTruthy();
        });
    });

    // ========================================
    // INSPECTOR DASHBOARD
    // ========================================
    describe('Inspector Dashboard', () => {
        it('GET /api/dashboard/inspector - Inspector can access own dashboard', async () => {
            const res = await request(app)
                .get('/api/dashboard/inspector')
                .set('Authorization', `Bearer ${inspectorToken}`);

            expect(res.status).toBe(200);
            expect(res.headers['content-type']).toMatch(/json/);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toHaveProperty('summary');
            expect(res.body.data).toHaveProperty('metrics');
            expect(res.body.data).toHaveProperty('recentActivity');

            // Verify summary structure
            expect(res.body.data.summary).toHaveProperty('totalChecksheets');
            expect(res.body.data.summary).toHaveProperty('totalDir');
            expect(res.body.data.summary).toHaveProperty('totalFi');

            // Verify metrics structure
            expect(res.body.data.metrics).toHaveProperty('dir');
            expect(res.body.data.metrics).toHaveProperty('fi');
            expect(res.body.data.metrics).toHaveProperty('pendingValidation');
            expect(res.body.data.metrics).toHaveProperty('revisionReturned');
            expect(res.body.data.metrics).toHaveProperty('approvedCount');

            console.log('   📊 Inspector Dashboard:', {
                totalChecksheets: res.body.data.summary.totalChecksheets,
                pending: res.body.data.metrics.pendingValidation,
                approved: res.body.data.metrics.approvedCount,
            });
        });

        it('GET /api/dashboard/inspector - Supervisor cannot access inspector dashboard', async () => {
            const res = await request(app)
                .get('/api/dashboard/inspector')
                .set('Authorization', `Bearer ${supervisorToken}`);

            expect(res.status).toBe(403);
            expect(res.headers['content-type']).toMatch(/json/);
            expect(res.body.success).toBe(false);
        });
    });

    // ========================================
    // CHECKER DASHBOARD
    // ========================================
    describe('Checker Dashboard', () => {
        it('GET /api/dashboard/checker - Supervisor can access checker dashboard', async () => {
            const res = await request(app)
                .get('/api/dashboard/checker')
                .set('Authorization', `Bearer ${supervisorToken}`);

            expect(res.status).toBe(200);
            expect(res.headers['content-type']).toMatch(/json/);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toHaveProperty('summary');
            expect(res.body.data).toHaveProperty('metrics');
            expect(res.body.data).toHaveProperty('recentActivity');

            // Verify summary structure
            expect(res.body.data.summary).toHaveProperty('totalPending');
            expect(res.body.data.summary).toHaveProperty('totalRevision');
            expect(res.body.data.summary).toHaveProperty('totalChecked');
            expect(res.body.data.summary).toHaveProperty('totalApproved');

            console.log('   📊 Checker Dashboard:', {
                pending: res.body.data.summary.totalPending,
                revision: res.body.data.summary.totalRevision,
                checked: res.body.data.summary.totalChecked,
            });
        });

        it('GET /api/dashboard/checker - Inspector cannot access checker dashboard', async () => {
            const res = await request(app)
                .get('/api/dashboard/checker')
                .set('Authorization', `Bearer ${inspectorToken}`);

            expect(res.status).toBe(403);
            expect(res.headers['content-type']).toMatch(/json/);
            expect(res.body.success).toBe(false);
        });
    });

    // ========================================
    // APPROVER DASHBOARD
    // ========================================
    describe('Approver Dashboard', () => {
        it('GET /api/dashboard/approver - Supervisor can access approver dashboard', async () => {
            const res = await request(app)
                .get('/api/dashboard/approver')
                .set('Authorization', `Bearer ${supervisorToken}`);

            expect(res.status).toBe(200);
            expect(res.headers['content-type']).toMatch(/json/);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toHaveProperty('summary');
            expect(res.body.data).toHaveProperty('metrics');
            expect(res.body.data).toHaveProperty('recentActivity');

            // Verify summary structure
            expect(res.body.data.summary).toHaveProperty('totalChecksheets');
            expect(res.body.data.summary).toHaveProperty('pendingApproval');
            expect(res.body.data.summary).toHaveProperty('approved');

            // Verify metrics structure
            expect(res.body.data.metrics).toHaveProperty('ngRate');
            expect(res.body.data.metrics).toHaveProperty('afterRepairRate');
            expect(res.body.data.metrics).toHaveProperty('topNgItems');

            console.log('   📊 Approver Dashboard:', {
                totalChecksheets: res.body.data.summary.totalChecksheets,
                pendingApproval: res.body.data.summary.pendingApproval,
                ngRate: res.body.data.metrics.ngRate,
            });
        });

        it('GET /api/dashboard/approver - Inspector cannot access approver dashboard', async () => {
            const res = await request(app)
                .get('/api/dashboard/approver')
                .set('Authorization', `Bearer ${inspectorToken}`);

            expect(res.status).toBe(403);
            expect(res.headers['content-type']).toMatch(/json/);
            expect(res.body.success).toBe(false);
        });
    });

    // ========================================
    // OPERATOR DASHBOARD
    // ========================================
    describe('Operator Dashboard', () => {
        it('GET /api/dashboard/operator - Operator can access operator dashboard', async () => {
            const res = await request(app)
                .get('/api/dashboard/operator')
                .set('Authorization', `Bearer ${operatorToken}`);

            expect(res.status).toBe(200);
            expect(res.headers['content-type']).toMatch(/json/);
            expect(res.body.success).toBe(true);

            // New frontend-optimized structure
            expect(res.body.data).toHaveProperty('kpiCards');
            expect(res.body.data).toHaveProperty('recentChecksheets');
            expect(res.body.data).toHaveProperty('revisionQueue');
            expect(res.body.data).toHaveProperty('quickStats');

            // Original structure (backward compatible)
            expect(res.body.data).toHaveProperty('summary');
            expect(res.body.data).toHaveProperty('metrics');
            expect(res.body.data).toHaveProperty('needAttention');
            expect(res.body.data).toHaveProperty('systemConfiguration');
            expect(res.body.data).toHaveProperty('recentActivity');

            // Verify summary structure
            expect(res.body.data.summary).toHaveProperty('totalChecksheets');
            expect(res.body.data.summary).toHaveProperty('totalDir');
            expect(res.body.data.summary).toHaveProperty('totalFi');
            expect(res.body.data.summary).toHaveProperty('pendingValidation');
            expect(res.body.data.summary).toHaveProperty('revisionNeeded');
            expect(res.body.data.summary).toHaveProperty('completedToday');

            // Verify metrics structure
            expect(res.body.data.metrics).toHaveProperty('overallNgRate');
            expect(res.body.data.metrics).toHaveProperty('qualityRiskIndicator');
            expect(res.body.data.metrics).toHaveProperty('passRate');
            expect(res.body.data.metrics).toHaveProperty('revisionRate');
            expect(res.body.data.metrics).toHaveProperty('dirOverview');
            expect(res.body.data.metrics).toHaveProperty('fiOverview');

            // Verify system configuration
            expect(res.body.data.systemConfiguration).toHaveProperty('templatesConfigured');
            expect(res.body.data.systemConfiguration).toHaveProperty('drawingsUploaded');
            expect(res.body.data.systemConfiguration).toHaveProperty('masterData');
            expect(res.body.data.systemConfiguration).toHaveProperty('completeness');

            console.log('   📊 Operator Dashboard:', {
                totalChecksheets: res.body.data.summary.totalChecksheets,
                overallNgRate: res.body.data.metrics.overallNgRate,
                qualityRisk: res.body.data.metrics.qualityRiskIndicator,
                templates: res.body.data.systemConfiguration.templatesConfigured,
            });
        });

        it('GET /api/dashboard/operator - KPI cards should have correct structure', async () => {
            const res = await request(app)
                .get('/api/dashboard/operator')
                .set('Authorization', `Bearer ${operatorToken}`);

            expect(res.status).toBe(200);
            expect(Array.isArray(res.body.data.kpiCards)).toBe(true);
            expect(res.body.data.kpiCards.length).toBe(4);

            // Verify each KPI card structure
            res.body.data.kpiCards.forEach((card) => {
                expect(card).toHaveProperty('title');
                expect(card).toHaveProperty('value');
                expect(card).toHaveProperty('change');
                expect(card).toHaveProperty('trend');
                expect(card).toHaveProperty('subtitle');
                expect(['up', 'down']).toContain(card.trend);
            });

            // Verify specific KPI titles
            const titles = res.body.data.kpiCards.map(c => c.title);
            expect(titles).toContain('Total Checksheets');
            expect(titles).toContain('Pending Approval');
            expect(titles).toContain('Revision Needed');
            expect(titles).toContain('Completed Today');

            console.log('   📊 KPI Cards:', res.body.data.kpiCards.map(c => `${c.title}: ${c.value} (${c.change})`));
        });

        it('GET /api/dashboard/operator - Recent checksheets should match frontend table structure', async () => {
            const res = await request(app)
                .get('/api/dashboard/operator')
                .set('Authorization', `Bearer ${operatorToken}`);

            expect(res.status).toBe(200);
            expect(Array.isArray(res.body.data.recentChecksheets)).toBe(true);

            // Verify each checksheet has required fields for frontend table
            res.body.data.recentChecksheets.forEach((item) => {
                expect(item).toHaveProperty('id');
                expect(item).toHaveProperty('no');
                expect(item).toHaveProperty('type');
                expect(item).toHaveProperty('model');
                expect(item).toHaveProperty('inspector');
                expect(item).toHaveProperty('status');
                expect(item).toHaveProperty('date');
            });

            console.log('   📊 Recent Checksheets:', res.body.data.recentChecksheets.length, 'items');
        });

        it('GET /api/dashboard/operator - Revision queue should match frontend structure', async () => {
            const res = await request(app)
                .get('/api/dashboard/operator')
                .set('Authorization', `Bearer ${operatorToken}`);

            expect(res.status).toBe(200);
            expect(Array.isArray(res.body.data.revisionQueue)).toBe(true);

            // Verify each revision queue item has required fields
            res.body.data.revisionQueue.forEach((item) => {
                expect(item).toHaveProperty('id');
                expect(item).toHaveProperty('no');
                expect(item).toHaveProperty('type');
                expect(item).toHaveProperty('model');
                expect(item).toHaveProperty('inspector');
                expect(item).toHaveProperty('reason');
                expect(item).toHaveProperty('requestedBy');
                expect(item).toHaveProperty('date');
                expect(item).toHaveProperty('priority');
                expect(['high', 'medium', 'low']).toContain(item.priority);
            });

            console.log('   📊 Revision Queue:', res.body.data.revisionQueue.length, 'items');
        });

        it('GET /api/dashboard/operator - Quick stats should have correct structure', async () => {
            const res = await request(app)
                .get('/api/dashboard/operator')
                .set('Authorization', `Bearer ${operatorToken}`);

            expect(res.status).toBe(200);
            expect(Array.isArray(res.body.data.quickStats)).toBe(true);
            expect(res.body.data.quickStats.length).toBe(3);

            // Verify each quick stat structure
            res.body.data.quickStats.forEach((stat) => {
                expect(stat).toHaveProperty('label');
                expect(stat).toHaveProperty('value');
                expect(stat).toHaveProperty('color');
            });

            // Verify specific stat labels
            const labels = res.body.data.quickStats.map(s => s.label);
            expect(labels).toContain('Pass Rate');
            expect(labels).toContain('On-Time Completion');
            expect(labels).toContain('Revision Rate');

            console.log('   📊 Quick Stats:', res.body.data.quickStats.map(s => `${s.label}: ${s.value}%`));
        });

        it('GET /api/dashboard/operator - Supervisor cannot access operator dashboard', async () => {
            const res = await request(app)
                .get('/api/dashboard/operator')
                .set('Authorization', `Bearer ${supervisorToken}`);

            expect(res.status).toBe(403);
            expect(res.headers['content-type']).toMatch(/json/);
            expect(res.body.success).toBe(false);
        });

        it('GET /api/dashboard/operator - Inspector cannot access operator dashboard', async () => {
            const res = await request(app)
                .get('/api/dashboard/operator')
                .set('Authorization', `Bearer ${inspectorToken}`);

            expect(res.status).toBe(403);
            expect(res.headers['content-type']).toMatch(/json/);
            expect(res.body.success).toBe(false);
        });
    });

    // ========================================
    // UNAUTHORIZED ACCESS
    // ========================================
    describe('Unauthorized Access', () => {
        it('GET /api/dashboard/inspector - Should reject without token', async () => {
            const res = await request(app).get('/api/dashboard/inspector');

            expect(res.status).toBe(400);
            expect(res.headers['content-type']).toMatch(/json/);
        });

        it('GET /api/dashboard/checker - Should reject without token', async () => {
            const res = await request(app).get('/api/dashboard/checker');

            expect(res.status).toBe(400);
            expect(res.headers['content-type']).toMatch(/json/);
        });

        it('GET /api/dashboard/approver - Should reject without token', async () => {
            const res = await request(app).get('/api/dashboard/approver');

            expect(res.status).toBe(400);
            expect(res.headers['content-type']).toMatch(/json/);
        });

        it('GET /api/dashboard/operator - Should reject without token', async () => {
            const res = await request(app).get('/api/dashboard/operator');

            expect(res.status).toBe(400);
            expect(res.headers['content-type']).toMatch(/json/);
        });

        it('GET /api/dashboard/inspector - Should reject with invalid token', async () => {
            const res = await request(app)
                .get('/api/dashboard/inspector')
                .set('Authorization', 'Bearer invalid-token');

            expect(res.status).toBe(400);
            expect(res.headers['content-type']).toMatch(/json/);
        });
    });

    // ========================================
    // DATA STRUCTURE VALIDATION
    // ========================================
    describe('Data Structure Validation', () => {
        it('Inspector dashboard should return numeric values', async () => {
            const res = await request(app)
                .get('/api/dashboard/inspector')
                .set('Authorization', `Bearer ${inspectorToken}`);

            expect(res.status).toBe(200);
            expect(typeof res.body.data.summary.totalChecksheets).toBe('number');
            expect(typeof res.body.data.summary.totalDir).toBe('number');
            expect(typeof res.body.data.summary.totalFi).toBe('number');
            expect(typeof res.body.data.metrics.pendingValidation).toBe('number');
            expect(typeof res.body.data.metrics.revisionReturned).toBe('number');
            expect(typeof res.body.data.metrics.approvedCount).toBe('number');
        });

        it('Operator dashboard should return valid quality risk indicator', async () => {
            const res = await request(app)
                .get('/api/dashboard/operator')
                .set('Authorization', `Bearer ${operatorToken}`);

            expect(res.status).toBe(200);
            expect(['LOW', 'MEDIUM', 'HIGH']).toContain(res.body.data.metrics.qualityRiskIndicator);
        });

        it('Operator dashboard should return valid pass rate and revision rate', async () => {
            const res = await request(app)
                .get('/api/dashboard/operator')
                .set('Authorization', `Bearer ${operatorToken}`);

            expect(res.status).toBe(200);
            expect(typeof res.body.data.metrics.passRate).toBe('number');
            expect(typeof res.body.data.metrics.revisionRate).toBe('number');
            expect(res.body.data.metrics.passRate).toBeGreaterThanOrEqual(0);
            expect(res.body.data.metrics.passRate).toBeLessThanOrEqual(100);
            expect(res.body.data.metrics.revisionRate).toBeGreaterThanOrEqual(0);
            expect(res.body.data.metrics.revisionRate).toBeLessThanOrEqual(100);
        });

        it('Approver dashboard should return array for topNgItems', async () => {
            const res = await request(app)
                .get('/api/dashboard/approver')
                .set('Authorization', `Bearer ${supervisorToken}`);

            expect(res.status).toBe(200);
            expect(Array.isArray(res.body.data.metrics.topNgItems)).toBe(true);
        });

        it('Operator dashboard should return array for needAttention', async () => {
            const res = await request(app)
                .get('/api/dashboard/operator')
                .set('Authorization', `Bearer ${operatorToken}`);

            expect(res.status).toBe(200);
            expect(Array.isArray(res.body.data.needAttention)).toBe(true);
        });

        it('Operator dashboard kpiCards values should be numbers', async () => {
            const res = await request(app)
                .get('/api/dashboard/operator')
                .set('Authorization', `Bearer ${operatorToken}`);

            expect(res.status).toBe(200);
            res.body.data.kpiCards.forEach((card) => {
                expect(typeof card.value).toBe('number');
                expect(typeof card.title).toBe('string');
                expect(typeof card.change).toBe('string');
            });
        });
    });
});
