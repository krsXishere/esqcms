const prisma = require('../config/database');
const ResponseHelper = require('../utils/responseHelper');

/**
 * Checksheet Workflow Controller
 * Handles business flow endpoints for DIR and FI checksheets:
 * - submit, request-revision, resubmit, check, approve
 * - audit trail / history
 */
class ChecksheetWorkflowController {
    // ========================
    // 1️⃣ SUBMIT CHECKSHEET
    // ========================

    /**
     * Submit DIR checksheet
     * POST /dirs/:id/submit
     * Role: inspector only
     * Status: pending -> pending (locked)
     */
    async submitDir(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user.id;
            const userRole = req.user.role;

            // Check role - only inspector can submit
            if (userRole !== 'inspector') {
                return ResponseHelper.error(res, 'Only inspectors can submit checksheets', 403);
            }

            // Find DIR
            const dir = await prisma.dir.findFirst({
                where: { id, deletedAt: null },
            });

            if (!dir) {
                return ResponseHelper.notFound(res, 'DIR not found');
            }

            // Check status - must be pending
            if (dir.status !== 'pending') {
                return ResponseHelper.error(res, `Cannot submit DIR with status: ${dir.status}`, 409);
            }

            // Check if user is the owner
            if (dir.operatorId !== userId) {
                return ResponseHelper.error(res, 'You can only submit your own checksheet', 403);
            }

            // Submit = mark as ready for review (status stays pending but now locked)
            // Create approval record to indicate submission
            await prisma.$transaction(async (tx) => {
                await tx.checksheetApproval.create({
                    data: {
                        referenceType: 'dir',
                        referenceId: id,
                        approvedBy: userId,
                        approvedAt: new Date(),
                        note: 'Submitted for review',
                    },
                });
            });

            return ResponseHelper.success(res, { id, status: 'pending', submitted: true }, 'DIR submitted successfully. Awaiting review.');
        } catch (error) {
            console.error('Error submitting DIR:', error);
            return ResponseHelper.error(res, 'Failed to submit DIR');
        }
    }

    /**
     * Submit FI checksheet
     * POST /fis/:id/submit
     * Role: inspector only
     * Status: pending -> pending (locked)
     */
    async submitFi(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user.id;
            const userRole = req.user.role;

            // Check role - only inspector can submit
            if (userRole !== 'inspector') {
                return ResponseHelper.error(res, 'Only inspectors can submit checksheets', 403);
            }

            // Find FI
            const fi = await prisma.fi.findFirst({
                where: { id, deletedAt: null },
            });

            if (!fi) {
                return ResponseHelper.notFound(res, 'FI not found');
            }

            // Check status - must be pending
            if (fi.status !== 'pending') {
                return ResponseHelper.error(res, `Cannot submit FI with status: ${fi.status}`, 409);
            }

            // Check if user is the owner
            if (fi.operatorId !== userId) {
                return ResponseHelper.error(res, 'You can only submit your own checksheet', 403);
            }

            // Submit = mark as ready for review
            await prisma.$transaction(async (tx) => {
                await tx.checksheetApproval.create({
                    data: {
                        referenceType: 'fi',
                        referenceId: id,
                        approvedBy: userId,
                        approvedAt: new Date(),
                        note: 'Submitted for review',
                    },
                });
            });

            return ResponseHelper.success(res, { id, status: 'pending', submitted: true }, 'FI submitted successfully. Awaiting review.');
        } catch (error) {
            console.error('Error submitting FI:', error);
            return ResponseHelper.error(res, 'Failed to submit FI');
        }
    }

    // ========================
    // 2️⃣ REQUEST REVISION
    // ========================

    /**
     * Request revision for DIR
     * POST /dirs/:id/request-revision
     * Role: supervisor only (checker/approver)
     * Status: pending or checked -> revision
     */
    async requestRevisionDir(req, res) {
        try {
            const { id } = req.params;
            const { revisionNote } = req.body;
            const userId = req.user.id;
            const userRole = req.user.role;

            // Check role - only supervisor can request revision
            if (userRole !== 'supervisor') {
                return ResponseHelper.error(res, 'Only supervisors can request revision', 403);
            }

            // Validate revision note
            if (!revisionNote || revisionNote.trim() === '') {
                return ResponseHelper.badRequest(res, 'Revision note is required');
            }

            // Find DIR
            const dir = await prisma.dir.findFirst({
                where: { id, deletedAt: null },
            });

            if (!dir) {
                return ResponseHelper.notFound(res, 'DIR not found');
            }

            // Check status - must be pending or checked
            if (!['pending', 'checked'].includes(dir.status)) {
                return ResponseHelper.error(res, `Cannot request revision for DIR with status: ${dir.status}`, 409);
            }

            // Get current revision count
            const revisionCount = await prisma.checksheetRevision.count({
                where: { referenceType: 'dir', referenceId: id },
            });

            // Create revision record and update status
            await prisma.$transaction(async (tx) => {
                await tx.checksheetRevision.create({
                    data: {
                        referenceType: 'dir',
                        referenceId: id,
                        revisionNumber: revisionCount + 1,
                        revisionNote: revisionNote.trim(),
                        revisedBy: userId,
                    },
                });

                await tx.dir.update({
                    where: { id },
                    data: { status: 'revision' },
                });
            });

            return ResponseHelper.success(res, { id, status: 'revision', revisionNumber: revisionCount + 1 }, 'Revision requested successfully');
        } catch (error) {
            console.error('Error requesting revision for DIR:', error);
            return ResponseHelper.error(res, 'Failed to request revision');
        }
    }

    /**
     * Request revision for FI
     * POST /fis/:id/request-revision
     * Role: supervisor only (checker/approver)
     * Status: pending or checked -> revision
     */
    async requestRevisionFi(req, res) {
        try {
            const { id } = req.params;
            const { revisionNote } = req.body;
            const userId = req.user.id;
            const userRole = req.user.role;

            // Check role - only supervisor can request revision
            if (userRole !== 'supervisor') {
                return ResponseHelper.error(res, 'Only supervisors can request revision', 403);
            }

            // Validate revision note
            if (!revisionNote || revisionNote.trim() === '') {
                return ResponseHelper.badRequest(res, 'Revision note is required');
            }

            // Find FI
            const fi = await prisma.fi.findFirst({
                where: { id, deletedAt: null },
            });

            if (!fi) {
                return ResponseHelper.notFound(res, 'FI not found');
            }

            // Check status - must be pending or checked
            if (!['pending', 'checked'].includes(fi.status)) {
                return ResponseHelper.error(res, `Cannot request revision for FI with status: ${fi.status}`, 409);
            }

            // Get current revision count
            const revisionCount = await prisma.checksheetRevision.count({
                where: { referenceType: 'fi', referenceId: id },
            });

            // Create revision record and update status
            await prisma.$transaction(async (tx) => {
                await tx.checksheetRevision.create({
                    data: {
                        referenceType: 'fi',
                        referenceId: id,
                        revisionNumber: revisionCount + 1,
                        revisionNote: revisionNote.trim(),
                        revisedBy: userId,
                    },
                });

                await tx.fi.update({
                    where: { id },
                    data: { status: 'revision' },
                });
            });

            return ResponseHelper.success(res, { id, status: 'revision', revisionNumber: revisionCount + 1 }, 'Revision requested successfully');
        } catch (error) {
            console.error('Error requesting revision for FI:', error);
            return ResponseHelper.error(res, 'Failed to request revision');
        }
    }

    // ========================
    // 3️⃣ EDIT SAAT REVISION (SUPER ADMIN)
    // ========================

    /**
     * Edit DIR during revision
     * PUT /revision/dirs/:id
     * Role: operator (super admin) only
     * Status: must be revision
     */
    async editRevisionDir(req, res) {
        try {
            const { id } = req.params;
            const userRole = req.user.role;

            // Check role - only operator (super admin) can edit during revision
            if (userRole !== 'operator') {
                return ResponseHelper.error(res, 'Only administrators can edit checksheets during revision', 403);
            }

            // Find DIR
            const dir = await prisma.dir.findFirst({
                where: { id, deletedAt: null },
            });

            if (!dir) {
                return ResponseHelper.notFound(res, 'DIR not found');
            }

            // Check status - must be revision
            if (dir.status !== 'revision') {
                return ResponseHelper.error(res, `Can only edit DIR in revision status. Current: ${dir.status}`, 409);
            }

            // Extract editable fields from body
            const {
                serialNumber,
                recommendation,
                generalNote,
                modelId,
                partId,
                customerId,
                deliveryOrderId,
                materialId,
                shiftId,
                sectionId,
                checksheetTemplateId,
            } = req.body;

            // Build update data
            const updateData = {};
            if (serialNumber !== undefined) updateData.serialNumber = serialNumber;
            if (recommendation !== undefined) updateData.recommendation = recommendation;
            if (generalNote !== undefined) updateData.generalNote = generalNote;
            if (modelId !== undefined) updateData.modelId = modelId;
            if (partId !== undefined) updateData.partId = partId;
            if (customerId !== undefined) updateData.customerId = customerId;
            if (deliveryOrderId !== undefined) updateData.deliveryOrderId = deliveryOrderId;
            if (materialId !== undefined) updateData.materialId = materialId;
            if (shiftId !== undefined) updateData.shiftId = shiftId;
            if (sectionId !== undefined) updateData.sectionId = sectionId;
            if (checksheetTemplateId !== undefined) updateData.checksheetTemplateId = checksheetTemplateId;

            // Update DIR (status stays revision)
            const updatedDir = await prisma.dir.update({
                where: { id },
                data: updateData,
                select: {
                    id: true,
                    idDir: true,
                    serialNumber: true,
                    status: true,
                    recommendation: true,
                    generalNote: true,
                    updatedAt: true,
                },
            });

            return ResponseHelper.success(res, updatedDir, 'DIR updated during revision');
        } catch (error) {
            console.error('Error editing DIR during revision:', error);
            if (error.code === 'P2002') {
                return ResponseHelper.badRequest(res, 'Serial number already exists');
            }
            return ResponseHelper.error(res, 'Failed to edit DIR during revision');
        }
    }

    /**
     * Edit FI during revision
     * PUT /revision/fis/:id
     * Role: operator (super admin) only
     * Status: must be revision
     */
    async editRevisionFi(req, res) {
        try {
            const { id } = req.params;
            const userRole = req.user.role;

            // Check role - only operator (super admin) can edit during revision
            if (userRole !== 'operator') {
                return ResponseHelper.error(res, 'Only administrators can edit checksheets during revision', 403);
            }

            // Find FI
            const fi = await prisma.fi.findFirst({
                where: { id, deletedAt: null },
            });

            if (!fi) {
                return ResponseHelper.notFound(res, 'FI not found');
            }

            // Check status - must be revision
            if (fi.status !== 'revision') {
                return ResponseHelper.error(res, `Can only edit FI in revision status. Current: ${fi.status}`, 409);
            }

            // Extract editable fields from body
            const {
                fiNumber,
                customerSpecification,
                impellerDiameter,
                numericField,
                generalNote,
                modelId,
                customerId,
                shiftId,
                sectionId,
                checksheetTemplateId,
            } = req.body;

            // Build update data
            const updateData = {};
            if (fiNumber !== undefined) updateData.fiNumber = fiNumber;
            if (customerSpecification !== undefined) updateData.customerSpecification = customerSpecification;
            if (impellerDiameter !== undefined) updateData.impellerDiameter = impellerDiameter;
            if (numericField !== undefined) updateData.numericField = numericField;
            if (generalNote !== undefined) updateData.generalNote = generalNote;
            if (modelId !== undefined) updateData.modelId = modelId;
            if (customerId !== undefined) updateData.customerId = customerId;
            if (shiftId !== undefined) updateData.shiftId = shiftId;
            if (sectionId !== undefined) updateData.sectionId = sectionId;
            if (checksheetTemplateId !== undefined) updateData.checksheetTemplateId = checksheetTemplateId;

            // Update FI (status stays revision)
            const updatedFi = await prisma.fi.update({
                where: { id },
                data: updateData,
                select: {
                    id: true,
                    idFi: true,
                    fiNumber: true,
                    status: true,
                    customerSpecification: true,
                    generalNote: true,
                    updatedAt: true,
                },
            });

            return ResponseHelper.success(res, updatedFi, 'FI updated during revision');
        } catch (error) {
            console.error('Error editing FI during revision:', error);
            return ResponseHelper.error(res, 'Failed to edit FI during revision');
        }
    }

    // ========================
    // 4️⃣ RESUBMIT AFTER REVISION
    // ========================

    /**
     * Resubmit DIR after revision
     * POST /dirs/:id/resubmit
     * Role: inspector only
     * Status: revision -> pending
     */
    async resubmitDir(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user.id;
            const userRole = req.user.role;

            // Check role - only inspector can resubmit
            if (userRole !== 'inspector') {
                return ResponseHelper.error(res, 'Only inspectors can resubmit checksheets', 403);
            }

            // Find DIR
            const dir = await prisma.dir.findFirst({
                where: { id, deletedAt: null },
            });

            if (!dir) {
                return ResponseHelper.notFound(res, 'DIR not found');
            }

            // Check status - must be revision
            if (dir.status !== 'revision') {
                return ResponseHelper.error(res, `Cannot resubmit DIR with status: ${dir.status}. Must be in revision.`, 409);
            }

            // Check if user is the owner
            if (dir.operatorId !== userId) {
                return ResponseHelper.error(res, 'You can only resubmit your own checksheet', 403);
            }

            // Update status to pending and create approval record
            await prisma.$transaction(async (tx) => {
                await tx.dir.update({
                    where: { id },
                    data: { status: 'pending' },
                });

                await tx.checksheetApproval.create({
                    data: {
                        referenceType: 'dir',
                        referenceId: id,
                        approvedBy: userId,
                        approvedAt: new Date(),
                        note: 'Resubmitted after revision',
                    },
                });
            });

            return ResponseHelper.success(res, { id, status: 'pending' }, 'DIR resubmitted successfully. Awaiting review.');
        } catch (error) {
            console.error('Error resubmitting DIR:', error);
            return ResponseHelper.error(res, 'Failed to resubmit DIR');
        }
    }

    /**
     * Resubmit FI after revision
     * POST /fis/:id/resubmit
     * Role: inspector only
     * Status: revision -> pending
     */
    async resubmitFi(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user.id;
            const userRole = req.user.role;

            // Check role - only inspector can resubmit
            if (userRole !== 'inspector') {
                return ResponseHelper.error(res, 'Only inspectors can resubmit checksheets', 403);
            }

            // Find FI
            const fi = await prisma.fi.findFirst({
                where: { id, deletedAt: null },
            });

            if (!fi) {
                return ResponseHelper.notFound(res, 'FI not found');
            }

            // Check status - must be revision
            if (fi.status !== 'revision') {
                return ResponseHelper.error(res, `Cannot resubmit FI with status: ${fi.status}. Must be in revision.`, 409);
            }

            // Check if user is the owner
            if (fi.operatorId !== userId) {
                return ResponseHelper.error(res, 'You can only resubmit your own checksheet', 403);
            }

            // Update status to pending and create approval record
            await prisma.$transaction(async (tx) => {
                await tx.fi.update({
                    where: { id },
                    data: { status: 'pending' },
                });

                await tx.checksheetApproval.create({
                    data: {
                        referenceType: 'fi',
                        referenceId: id,
                        approvedBy: userId,
                        approvedAt: new Date(),
                        note: 'Resubmitted after revision',
                    },
                });
            });

            return ResponseHelper.success(res, { id, status: 'pending' }, 'FI resubmitted successfully. Awaiting review.');
        } catch (error) {
            console.error('Error resubmitting FI:', error);
            return ResponseHelper.error(res, 'Failed to resubmit FI');
        }
    }

    // ========================
    // 5️⃣ CHECK (LEVEL 1 APPROVAL)
    // ========================

    /**
     * Check DIR (level 1 approval)
     * POST /dirs/:id/check
     * Role: supervisor only
     * Status: pending -> checked
     */
    async checkDir(req, res) {
        try {
            const { id } = req.params;
            const { note } = req.body;
            const userId = req.user.id;
            const userRole = req.user.role;

            // Check role - only supervisor can check
            if (userRole !== 'supervisor') {
                return ResponseHelper.error(res, 'Only supervisors can check checksheets', 403);
            }

            // Find DIR
            const dir = await prisma.dir.findFirst({
                where: { id, deletedAt: null },
            });

            if (!dir) {
                return ResponseHelper.notFound(res, 'DIR not found');
            }

            // Check status - must be pending
            if (dir.status !== 'pending') {
                return ResponseHelper.error(res, `Cannot check DIR with status: ${dir.status}. Must be pending.`, 409);
            }

            // Create approval record and update status
            await prisma.$transaction(async (tx) => {
                await tx.checksheetApproval.create({
                    data: {
                        referenceType: 'dir',
                        referenceId: id,
                        approvedBy: userId,
                        approvedAt: new Date(),
                        note: note || 'Checked by supervisor',
                    },
                });

                await tx.dir.update({
                    where: { id },
                    data: { status: 'checked' },
                });
            });

            return ResponseHelper.success(res, { id, status: 'checked' }, 'DIR checked successfully. Awaiting final approval.');
        } catch (error) {
            console.error('Error checking DIR:', error);
            return ResponseHelper.error(res, 'Failed to check DIR');
        }
    }

    /**
     * Check FI (level 1 approval)
     * POST /fis/:id/check
     * Role: supervisor only
     * Status: pending -> checked
     */
    async checkFi(req, res) {
        try {
            const { id } = req.params;
            const { note } = req.body;
            const userId = req.user.id;
            const userRole = req.user.role;

            // Check role - only supervisor can check
            if (userRole !== 'supervisor') {
                return ResponseHelper.error(res, 'Only supervisors can check checksheets', 403);
            }

            // Find FI
            const fi = await prisma.fi.findFirst({
                where: { id, deletedAt: null },
            });

            if (!fi) {
                return ResponseHelper.notFound(res, 'FI not found');
            }

            // Check status - must be pending
            if (fi.status !== 'pending') {
                return ResponseHelper.error(res, `Cannot check FI with status: ${fi.status}. Must be pending.`, 409);
            }

            // Create approval record and update status
            await prisma.$transaction(async (tx) => {
                await tx.checksheetApproval.create({
                    data: {
                        referenceType: 'fi',
                        referenceId: id,
                        approvedBy: userId,
                        approvedAt: new Date(),
                        note: note || 'Checked by supervisor',
                    },
                });

                await tx.fi.update({
                    where: { id },
                    data: { status: 'checked' },
                });
            });

            return ResponseHelper.success(res, { id, status: 'checked' }, 'FI checked successfully. Awaiting final approval.');
        } catch (error) {
            console.error('Error checking FI:', error);
            return ResponseHelper.error(res, 'Failed to check FI');
        }
    }

    // ========================
    // 6️⃣ FINAL APPROVAL
    // ========================

    /**
     * Approve DIR (final approval)
     * POST /dirs/:id/approve
     * Role: supervisor only (approver)
     * Status: checked -> approved
     */
    async approveDir(req, res) {
        try {
            const { id } = req.params;
            const { note } = req.body;
            const userId = req.user.id;
            const userRole = req.user.role;

            // Check role - only supervisor can approve
            // Operator (super admin) CANNOT approve
            if (userRole !== 'supervisor') {
                return ResponseHelper.error(res, 'Only supervisors can approve checksheets', 403);
            }

            // Find DIR
            const dir = await prisma.dir.findFirst({
                where: { id, deletedAt: null },
            });

            if (!dir) {
                return ResponseHelper.notFound(res, 'DIR not found');
            }

            // Check status - must be checked
            if (dir.status !== 'checked') {
                return ResponseHelper.error(res, `Cannot approve DIR with status: ${dir.status}. Must be checked first.`, 409);
            }

            // Create approval record and update status
            await prisma.$transaction(async (tx) => {
                await tx.checksheetApproval.create({
                    data: {
                        referenceType: 'dir',
                        referenceId: id,
                        approvedBy: userId,
                        approvedAt: new Date(),
                        note: note || 'Approved by supervisor',
                    },
                });

                await tx.dir.update({
                    where: { id },
                    data: { status: 'approved' },
                });
            });

            return ResponseHelper.success(res, { id, status: 'approved' }, 'DIR approved successfully. Data is now final and locked.');
        } catch (error) {
            console.error('Error approving DIR:', error);
            return ResponseHelper.error(res, 'Failed to approve DIR');
        }
    }

    /**
     * Approve FI (final approval)
     * POST /fis/:id/approve
     * Role: supervisor only (approver)
     * Status: checked -> approved
     */
    async approveFi(req, res) {
        try {
            const { id } = req.params;
            const { note } = req.body;
            const userId = req.user.id;
            const userRole = req.user.role;

            // Check role - only supervisor can approve
            // Operator (super admin) CANNOT approve
            if (userRole !== 'supervisor') {
                return ResponseHelper.error(res, 'Only supervisors can approve checksheets', 403);
            }

            // Find FI
            const fi = await prisma.fi.findFirst({
                where: { id, deletedAt: null },
            });

            if (!fi) {
                return ResponseHelper.notFound(res, 'FI not found');
            }

            // Check status - must be checked
            if (fi.status !== 'checked') {
                return ResponseHelper.error(res, `Cannot approve FI with status: ${fi.status}. Must be checked first.`, 409);
            }

            // Create approval record and update status
            await prisma.$transaction(async (tx) => {
                await tx.checksheetApproval.create({
                    data: {
                        referenceType: 'fi',
                        referenceId: id,
                        approvedBy: userId,
                        approvedAt: new Date(),
                        note: note || 'Approved by supervisor',
                    },
                });

                await tx.fi.update({
                    where: { id },
                    data: { status: 'approved' },
                });
            });

            return ResponseHelper.success(res, { id, status: 'approved' }, 'FI approved successfully. Data is now final and locked.');
        } catch (error) {
            console.error('Error approving FI:', error);
            return ResponseHelper.error(res, 'Failed to approve FI');
        }
    }

    // ========================
    // 7️⃣ AUDIT TRAIL / HISTORY
    // ========================

    /**
     * Get DIR history (audit trail)
     * GET /dirs/:id/history
     * Returns: checksheet detail + revision history + approval history
     */
    async getDirHistory(req, res) {
        try {
            const { id } = req.params;

            // Find DIR with relations
            const dir = await prisma.dir.findFirst({
                where: { id, deletedAt: null },
                include: {
                    model: { select: { id: true, modelName: true } },
                    part: { select: { id: true, partNumber: true, partName: true } },
                    operator: { select: { id: true, fullName: true, email: true, role: true } },
                    customer: { select: { id: true, customerName: true } },
                    deliveryOrder: { select: { id: true, deliveryOrderCode: true } },
                    material: { select: { id: true, materialName: true } },
                    shift: { select: { id: true, shiftName: true } },
                    section: { select: { id: true, sectionName: true } },
                    checksheetTemplate: { select: { id: true, templateCode: true, templateName: true } },
                    measurements: {
                        where: { deletedAt: null },
                        select: {
                            id: true,
                            dimensional: true,
                            nominal: true,
                            toleranceMin: true,
                            toleranceMax: true,
                            actual: true,
                            status: true,
                        },
                    },
                },
            });

            if (!dir) {
                return ResponseHelper.notFound(res, 'DIR not found');
            }

            // Get revision history
            const revisions = await prisma.checksheetRevision.findMany({
                where: { referenceType: 'dir', referenceId: id, deletedAt: null },
                include: {
                    revisedByUser: { select: { id: true, fullName: true, email: true, role: true } },
                },
                orderBy: { createdAt: 'asc' },
            });

            // Get approval history
            const approvals = await prisma.checksheetApproval.findMany({
                where: { referenceType: 'dir', referenceId: id, deletedAt: null },
                include: {
                    approvedByUser: { select: { id: true, fullName: true, email: true, role: true } },
                },
                orderBy: { approvedAt: 'asc' },
            });

            return ResponseHelper.success(res, {
                checksheet: dir,
                revisionHistory: revisions,
                approvalHistory: approvals,
            }, 'DIR history retrieved successfully');
        } catch (error) {
            console.error('Error getting DIR history:', error);
            return ResponseHelper.error(res, 'Failed to get DIR history');
        }
    }

    /**
     * Get FI history (audit trail)
     * GET /fis/:id/history
     * Returns: checksheet detail + revision history + approval history
     */
    async getFiHistory(req, res) {
        try {
            const { id } = req.params;

            // Find FI with relations
            const fi = await prisma.fi.findFirst({
                where: { id, deletedAt: null },
                include: {
                    model: { select: { id: true, modelName: true } },
                    operator: { select: { id: true, fullName: true, email: true, role: true } },
                    customer: { select: { id: true, customerName: true } },
                    shift: { select: { id: true, shiftName: true } },
                    section: { select: { id: true, sectionName: true } },
                    checksheetTemplate: { select: { id: true, templateCode: true, templateName: true } },
                    visualInspections: {
                        where: { deletedAt: null },
                        select: {
                            id: true,
                            itemName: true,
                            status: true,
                            remark: true,
                        },
                    },
                },
            });

            if (!fi) {
                return ResponseHelper.notFound(res, 'FI not found');
            }

            // Get revision history
            const revisions = await prisma.checksheetRevision.findMany({
                where: { referenceType: 'fi', referenceId: id, deletedAt: null },
                include: {
                    revisedByUser: { select: { id: true, fullName: true, email: true, role: true } },
                },
                orderBy: { createdAt: 'asc' },
            });

            // Get approval history
            const approvals = await prisma.checksheetApproval.findMany({
                where: { referenceType: 'fi', referenceId: id, deletedAt: null },
                include: {
                    approvedByUser: { select: { id: true, fullName: true, email: true, role: true } },
                },
                orderBy: { approvedAt: 'asc' },
            });

            return ResponseHelper.success(res, {
                checksheet: fi,
                revisionHistory: revisions,
                approvalHistory: approvals,
            }, 'FI history retrieved successfully');
        } catch (error) {
            console.error('Error getting FI history:', error);
            return ResponseHelper.error(res, 'Failed to get FI history');
        }
    }
}

module.exports = new ChecksheetWorkflowController();
