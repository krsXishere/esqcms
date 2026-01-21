const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

/**
 * ESQCMS Seed Script for E2E Testing
 * 
 * Flow yang di-simulasikan:
 * 1. Setup master data (users, models, parts, dll)
 * 2. Inspector membuat DIR checksheet dengan measurements
 * 3. Supervisor approve DIR
 * 4. Inspector membuat FI checksheet dengan visual inspections
 * 5. Supervisor approve FI
 */

async function main() {
    console.log('🌱 Starting seed...\n');

    // ============================================
    // 1. USERS - Create 3 users with different roles
    // ============================================
    console.log('👤 Creating users...');

    const hashedPassword = await bcrypt.hash('password123', 10);

    const operator = await prisma.user.create({
        data: {
            role: 'operator',
            fullName: 'Admin Operator',
            email: 'operator@esqcms.com',
            password: hashedPassword,
            profilePicture: null,
        },
    });
    console.log(`   ✓ Operator: ${operator.email}`);

    const inspector = await prisma.user.create({
        data: {
            role: 'inspector',
            fullName: 'John Inspector',
            email: 'inspector@esqcms.com',
            password: hashedPassword,
            profilePicture: null,
        },
    });
    console.log(`   ✓ Inspector: ${inspector.email}`);

    const supervisor = await prisma.user.create({
        data: {
            role: 'supervisor',
            fullName: 'Jane Supervisor',
            email: 'supervisor@esqcms.com',
            password: hashedPassword,
            profilePicture: null,
        },
    });
    console.log(`   ✓ Supervisor: ${supervisor.email}`);

    // ============================================
    // 2. MASTER DATA - Models, Parts, Materials
    // ============================================
    console.log('\n📦 Creating master data...');

    // Model
    const model = await prisma.model.create({
        data: {
            modelName: 'PUMP-A100',
        },
    });
    console.log(`   ✓ Model: ${model.modelName}`);

    // Parts
    const part = await prisma.part.create({
        data: {
            partNumber: 'P-001',
            partName: 'Impeller Assembly',
        },
    });
    console.log(`   ✓ Part: ${part.partNumber} - ${part.partName}`);

    // Customer
    const customer = await prisma.customer.create({
        data: {
            customerName: 'PT Industri Sejahtera',
        },
    });
    console.log(`   ✓ Customer: ${customer.customerName}`);

    // Material
    const material = await prisma.material.create({
        data: {
            materialName: 'Stainless Steel 316',
        },
    });
    console.log(`   ✓ Material: ${material.materialName}`);

    // Type
    const type = await prisma.type.create({
        data: {
            typeName: 'Centrifugal Pump',
        },
    });
    console.log(`   ✓ Type: ${type.typeName}`);

    // Section
    const section = await prisma.section.create({
        data: {
            sectionCode: 'SEC-QC',
            sectionName: 'Quality Control Department',
        },
    });
    console.log(`   ✓ Section: ${section.sectionCode}`);

    // Shifts
    const shiftDay = await prisma.shift.create({
        data: {
            shiftCode: 'SHIFT-1',
            shiftName: 'Day Shift',
            startTime: new Date('1970-01-01T07:00:00'),
            endTime: new Date('1970-01-01T15:00:00'),
        },
    });
    console.log(`   ✓ Shift: ${shiftDay.shiftName}`);

    // Reject Reasons
    const rejectReasonDimensional = await prisma.rejectReason.create({
        data: {
            reasonCode: 'RJ-DIM',
            reasonName: 'Dimensional Out of Tolerance',
            description: 'Measurement value exceeds acceptable tolerance range',
        },
    });

    const rejectReasonSurface = await prisma.rejectReason.create({
        data: {
            reasonCode: 'RJ-SUR',
            reasonName: 'Surface Defect',
            description: 'Surface finish does not meet specification',
        },
    });
    console.log(`   ✓ Reject Reasons: ${rejectReasonDimensional.reasonCode}, ${rejectReasonSurface.reasonCode}`);

    // Delivery Order
    const deliveryOrder = await prisma.deliveryOrder.create({
        data: {
            deliveryOrderCode: 'DO-2026-001',
            attachment: '/uploads/do/do-2026-001.pdf',
        },
    });
    console.log(`   ✓ Delivery Order: ${deliveryOrder.deliveryOrderCode}`);

    // Drawing
    const drawing = await prisma.drawing.create({
        data: {
            modelId: model.id,
            partId: part.id,
            fileName: 'impeller-assembly-v1.pdf',
            filePath: '/uploads/drawings/impeller-assembly-v1.pdf',
            fileType: 'pdf',
            version: '1.0',
        },
    });
    console.log(`   ✓ Drawing: ${drawing.fileName}`);

    // ============================================
    // 3. CHECKSHEET TEMPLATES
    // ============================================
    console.log('\n📋 Creating checksheet templates...');

    // DIR Template
    const dirTemplate = await prisma.checksheetTemplate.create({
        data: {
            templateCode: 'TPL-DIR-001',
            templateName: 'Dimensional Inspection Template',
            type: 'dir',
            modelId: model.id,
            partId: part.id,
            description: 'Standard dimensional inspection template for impeller assembly',
        },
    });

    // Template Items for DIR (3 items)
    const dirTemplateItems = await prisma.templateItem.createMany({
        data: [
            {
                templateId: dirTemplate.id,
                itemName: 'Outer Diameter',
                nominal: 100.0,
                toleranceMin: -0.05,
                toleranceMax: 0.05,
                sequence: 1,
            },
            {
                templateId: dirTemplate.id,
                itemName: 'Inner Diameter',
                nominal: 50.0,
                toleranceMin: -0.03,
                toleranceMax: 0.03,
                sequence: 2,
            },
            {
                templateId: dirTemplate.id,
                itemName: 'Height',
                nominal: 25.0,
                toleranceMin: -0.02,
                toleranceMax: 0.02,
                sequence: 3,
            },
        ],
    });
    console.log(`   ✓ DIR Template: ${dirTemplate.templateCode} with ${dirTemplateItems.count} items`);

    // FI Template
    const fiTemplate = await prisma.checksheetTemplate.create({
        data: {
            templateCode: 'TPL-FI-001',
            templateName: 'Final Inspection Template',
            type: 'fi',
            modelId: model.id,
            partId: part.id,
            description: 'Standard final inspection template for impeller assembly',
        },
    });

    // Template Items for FI (3 items)
    const fiTemplateItems = await prisma.templateItem.createMany({
        data: [
            {
                templateId: fiTemplate.id,
                itemName: 'Surface Finish',
                nominal: null,
                toleranceMin: null,
                toleranceMax: null,
                sequence: 1,
            },
            {
                templateId: fiTemplate.id,
                itemName: 'Visual Appearance',
                nominal: null,
                toleranceMin: null,
                toleranceMax: null,
                sequence: 2,
            },
            {
                templateId: fiTemplate.id,
                itemName: 'Packaging Condition',
                nominal: null,
                toleranceMin: null,
                toleranceMax: null,
                sequence: 3,
            },
        ],
    });
    console.log(`   ✓ FI Template: ${fiTemplate.templateCode} with ${fiTemplateItems.count} items`);

    // ============================================
    // 4. DIR CHECKSHEET - Created by Inspector
    // ============================================
    console.log('\n📝 Creating DIR checksheet (Inspector workflow)...');

    const dir = await prisma.dir.create({
        data: {
            idDir: 'DIR-2026-0001',
            modelId: model.id,
            partId: part.id,
            operatorId: inspector.id, // Inspector creates the DIR
            customerId: customer.id,
            deliveryOrderCode: 'DO-2026-001',
            materialId: material.id,
            shiftId: shiftDay.id,
            sectionId: section.id,
            checksheetTemplateId: dirTemplate.id,
            drawingNo: 'DRW-2026-001',
            recommendation: null,
            generalNote: 'Initial dimensional inspection',
            status: 'pending', // Initial status
        },
    });
    console.log(`   ✓ DIR created: ${dir.idDir} (Status: ${dir.status})`);

    // Create 3 Measurements (2 accepted, 1 reject)
    console.log('   📏 Creating measurements...');

    // Measurement 1: Accepted
    const measurement1 = await prisma.measurement.create({
        data: {
            dirId: dir.id,
            dimensional: 1,
            nominal: 100.0,
            toleranceMin: -0.05,
            toleranceMax: 0.05,
            actual: 100.02, // Within tolerance
            status: 'accepted',
        },
    });
    console.log(`      ✓ Measurement 1: Nominal ${measurement1.nominal}, Actual ${measurement1.actual} - ${measurement1.status.toUpperCase()}`);

    // Measurement 2: Accepted
    const measurement2 = await prisma.measurement.create({
        data: {
            dirId: dir.id,
            dimensional: 2,
            nominal: 50.0,
            toleranceMin: -0.03,
            toleranceMax: 0.03,
            actual: 49.98, // Within tolerance
            status: 'accepted',
        },
    });
    console.log(`      ✓ Measurement 2: Nominal ${measurement2.nominal}, Actual ${measurement2.actual} - ${measurement2.status.toUpperCase()}`);

    // Measurement 3: Reject (Out of tolerance)
    const measurement3 = await prisma.measurement.create({
        data: {
            dirId: dir.id,
            dimensional: 3,
            nominal: 25.0,
            toleranceMin: -0.02,
            toleranceMax: 0.02,
            actual: 25.10, // Out of tolerance!
            status: 'reject',
        },
    });
    console.log(`      ✓ Measurement 3: Nominal ${measurement3.nominal}, Actual ${measurement3.actual} - ${measurement3.status.toUpperCase()} ⚠️`);

    // Create photo for NG measurement
    const measurementPhoto = await prisma.measurementPhoto.create({
        data: {
            measurementId: measurement3.id,
            rejectReasonId: rejectReasonDimensional.id,
            photoPath: '/uploads/photos/measurement-ng-001.jpg',
            remark: 'Height exceeds tolerance by 0.08mm. Requires rework.',
        },
    });
    console.log(`      ✓ Photo attached to NG measurement with reject reason: ${rejectReasonDimensional.reasonName}`);

    // ============================================
    // 5. SUPERVISOR APPROVES DIR
    // ============================================
    console.log('\n✅ Supervisor approval workflow...');

    // First, create revision (supervisor sends back for correction)
    const dirRevision = await prisma.checksheetRevision.create({
        data: {
            referenceType: 'dir',
            referenceId: dir.id,
            revisionNumber: 1,
            revisionNote: 'Please verify measurement #3 and provide corrective action',
            revisedBy: supervisor.id,
        },
    });
    console.log(`   ✓ Revision #${dirRevision.revisionNumber} created by Supervisor`);

    // Update DIR status to revision
    await prisma.dir.update({
        where: { id: dir.id },
        data: { status: 'revision' },
    });
    console.log(`   ✓ DIR status updated to: revision`);

    // After correction, supervisor approves
    const dirApproval = await prisma.checksheetApproval.create({
        data: {
            referenceType: 'dir',
            referenceId: dir.id,
            approvedBy: supervisor.id,
            approvedAt: new Date(),
            note: 'Corrective action accepted. DIR approved.',
        },
    });

    // Update DIR status to approved
    const approvedDir = await prisma.dir.update({
        where: { id: dir.id },
        data: { status: 'approved' },
    });
    console.log(`   ✓ DIR approved by Supervisor (Status: ${approvedDir.status})`);

    // ============================================
    // 6. FI CHECKSHEET - Created by Inspector
    // ============================================
    console.log('\n📝 Creating FI checksheet (Final Inspection workflow)...');

    const fi = await prisma.fi.create({
        data: {
            idFi: 'FI-2026-0001',
            fiNumber: 'FI-001',
            modelId: model.id,
            operatorId: inspector.id,
            customerId: customer.id,
            shiftId: shiftDay.id,
            sectionId: section.id,
            checksheetTemplateId: fiTemplate.id,
            customerSpecification: 'Standard pump specification as per PO-2026-001',
            impellerDiameter: 150.0,
            numericField: 3600, // RPM
            generalNote: 'Final inspection before shipment',
            status: 'pending',
        },
    });
    console.log(`   ✓ FI created: ${fi.idFi} (Status: ${fi.status})`);

    // Create 3 Visual Inspections
    console.log('   👁️ Creating visual inspections...');

    const visualInspection1 = await prisma.visualInspection.create({
        data: {
            fiId: fi.id,
            itemName: 'Surface Finish',
            status: 'good',
            remark: 'Surface finish meets Ra 1.6 specification',
        },
    });
    console.log(`      ✓ ${visualInspection1.itemName}: ${visualInspection1.status}`);

    const visualInspection2 = await prisma.visualInspection.create({
        data: {
            fiId: fi.id,
            itemName: 'Visual Appearance',
            status: 'after_repair',
            remark: 'Minor scratch repaired and buffed',
        },
    });
    console.log(`      ✓ ${visualInspection2.itemName}: ${visualInspection2.status}`);

    const visualInspection3 = await prisma.visualInspection.create({
        data: {
            fiId: fi.id,
            itemName: 'Packaging Condition',
            status: 'good',
            remark: 'Properly packaged with protective foam',
        },
    });
    console.log(`      ✓ ${visualInspection3.itemName}: ${visualInspection3.status}`);

    // ============================================
    // 7. SUPERVISOR APPROVES FI
    // ============================================
    console.log('\n✅ Supervisor approves FI...');

    const fiApproval = await prisma.checksheetApproval.create({
        data: {
            referenceType: 'fi',
            referenceId: fi.id,
            approvedBy: supervisor.id,
            approvedAt: new Date(),
            note: 'Final inspection passed. Ready for shipment.',
        },
    });

    const approvedFi = await prisma.fi.update({
        where: { id: fi.id },
        data: { status: 'approved' },
    });
    console.log(`   ✓ FI approved by Supervisor (Status: ${approvedFi.status})`);

    // ============================================
    // SUMMARY
    // ============================================
    console.log('\n' + '='.repeat(50));
    console.log('🎉 SEED COMPLETED SUCCESSFULLY!');
    console.log('='.repeat(50));
    console.log('\n📊 Summary:');
    console.log('   Users:');
    console.log(`      - Operator: ${operator.email} (password: password123)`);
    console.log(`      - Inspector: ${inspector.email} (password: password123)`);
    console.log(`      - Supervisor: ${supervisor.email} (password: password123)`);
    console.log('\n   Master Data:');
    console.log(`      - 1 Model, 1 Part, 1 Customer, 1 Material`);
    console.log(`      - 1 Section, 1 Shift, 2 Reject Reasons`);
    console.log(`      - 1 Delivery Order, 1 Drawing`);
    console.log(`      - 2 Checksheet Templates (DIR & FI) with 3 items each`);
    console.log('\n   Transactions:');
    console.log(`      - 1 DIR (${approvedDir.idDir}) - Status: ${approvedDir.status}`);
    console.log(`        └─ 3 Measurements (2 OK, 1 NG with photo)`);
    console.log(`        └─ 1 Revision, 1 Approval`);
    console.log(`      - 1 FI (${approvedFi.idFi}) - Status: ${approvedFi.status}`);
    console.log(`        └─ 3 Visual Inspections`);
    console.log(`        └─ 1 Approval`);
    console.log('\n✨ Ready for E2E testing!\n');
}

main()
    .catch((e) => {
        console.error('❌ Seed failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
