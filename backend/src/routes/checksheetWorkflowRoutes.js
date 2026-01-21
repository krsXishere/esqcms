const express = require('express');
const router = express.Router();
const checksheetWorkflowController = require('../controllers/checksheetWorkflowController');
const authMiddleware = require('../middleware/authMiddleware');

// All routes require authentication
router.use(authMiddleware);

/**
 * @swagger
 * tags:
 *   name: Checksheet Workflow
 *   description: Business flow endpoints for checksheet lifecycle (submit, revision, check, approve)
 */

// ========================
// DIR WORKFLOW ROUTES
// ========================

/**
 * @swagger
 * /dirs/{id}/submit:
 *   post:
 *     summary: Submit DIR checksheet for review
 *     description: Inspector submits their checksheet. After submission, data is locked.
 *     tags: [Checksheet Workflow]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: DIR ID
 *     responses:
 *       200:
 *         description: DIR submitted successfully
 *       403:
 *         description: Forbidden - Only inspectors can submit
 *       404:
 *         description: DIR not found
 *       409:
 *         description: Invalid status for submission
 */
router.post('/dirs/:id/submit', (req, res) => checksheetWorkflowController.submitDir(req, res));

/**
 * @swagger
 * /dirs/{id}/request-revision:
 *   post:
 *     summary: Request revision for DIR
 *     description: Supervisor requests revision. Status changes to 'revision'.
 *     tags: [Checksheet Workflow]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: DIR ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - revisionNote
 *             properties:
 *               revisionNote:
 *                 type: string
 *                 description: Reason for revision request
 *     responses:
 *       200:
 *         description: Revision requested successfully
 *       403:
 *         description: Forbidden - Only supervisors can request revision
 *       404:
 *         description: DIR not found
 *       409:
 *         description: Invalid status for revision request
 */
router.post('/dirs/:id/request-revision', (req, res) => checksheetWorkflowController.requestRevisionDir(req, res));

/**
 * @swagger
 * /dirs/{id}/resubmit:
 *   post:
 *     summary: Resubmit DIR after revision
 *     description: Inspector resubmits after revision. Status changes to 'pending'.
 *     tags: [Checksheet Workflow]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: DIR ID
 *     responses:
 *       200:
 *         description: DIR resubmitted successfully
 *       403:
 *         description: Forbidden - Only inspectors can resubmit
 *       404:
 *         description: DIR not found
 *       409:
 *         description: Invalid status for resubmission
 */
router.post('/dirs/:id/resubmit', (req, res) => checksheetWorkflowController.resubmitDir(req, res));

/**
 * @swagger
 * /dirs/{id}/check:
 *   post:
 *     summary: Check DIR (Level 1 approval)
 *     description: Supervisor checks/verifies the DIR. Status changes to 'checked'.
 *     tags: [Checksheet Workflow]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: DIR ID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               note:
 *                 type: string
 *                 description: Optional note for the check
 *     responses:
 *       200:
 *         description: DIR checked successfully
 *       403:
 *         description: Forbidden - Only supervisors can check
 *       404:
 *         description: DIR not found
 *       409:
 *         description: Invalid status for checking
 */
router.post('/dirs/:id/check', (req, res) => checksheetWorkflowController.checkDir(req, res));

/**
 * @swagger
 * /dirs/{id}/approve:
 *   post:
 *     summary: Approve DIR (Final approval)
 *     description: Supervisor gives final approval. Status changes to 'approved'. Data is locked.
 *     tags: [Checksheet Workflow]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: DIR ID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               note:
 *                 type: string
 *                 description: Optional note for the approval
 *     responses:
 *       200:
 *         description: DIR approved successfully
 *       403:
 *         description: Forbidden - Only supervisors can approve
 *       404:
 *         description: DIR not found
 *       409:
 *         description: Invalid status for approval
 */
router.post('/dirs/:id/approve', (req, res) => checksheetWorkflowController.approveDir(req, res));

/**
 * @swagger
 * /dirs/{id}/history:
 *   get:
 *     summary: Get DIR audit trail / history
 *     description: Returns checksheet detail, revision history, and approval history
 *     tags: [Checksheet Workflow]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: DIR ID
 *     responses:
 *       200:
 *         description: DIR history retrieved successfully
 *       404:
 *         description: DIR not found
 */
router.get('/dirs/:id/history', (req, res) => checksheetWorkflowController.getDirHistory(req, res));

// ========================
// FI WORKFLOW ROUTES
// ========================

/**
 * @swagger
 * /fis/{id}/submit:
 *   post:
 *     summary: Submit FI checksheet for review
 *     description: Inspector submits their checksheet. After submission, data is locked.
 *     tags: [Checksheet Workflow]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: FI ID
 *     responses:
 *       200:
 *         description: FI submitted successfully
 *       403:
 *         description: Forbidden - Only inspectors can submit
 *       404:
 *         description: FI not found
 *       409:
 *         description: Invalid status for submission
 */
router.post('/fis/:id/submit', (req, res) => checksheetWorkflowController.submitFi(req, res));

/**
 * @swagger
 * /fis/{id}/request-revision:
 *   post:
 *     summary: Request revision for FI
 *     description: Supervisor requests revision. Status changes to 'revision'.
 *     tags: [Checksheet Workflow]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: FI ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - revisionNote
 *             properties:
 *               revisionNote:
 *                 type: string
 *                 description: Reason for revision request
 *     responses:
 *       200:
 *         description: Revision requested successfully
 *       403:
 *         description: Forbidden - Only supervisors can request revision
 *       404:
 *         description: FI not found
 *       409:
 *         description: Invalid status for revision request
 */
router.post('/fis/:id/request-revision', (req, res) => checksheetWorkflowController.requestRevisionFi(req, res));

/**
 * @swagger
 * /fis/{id}/resubmit:
 *   post:
 *     summary: Resubmit FI after revision
 *     description: Inspector resubmits after revision. Status changes to 'pending'.
 *     tags: [Checksheet Workflow]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: FI ID
 *     responses:
 *       200:
 *         description: FI resubmitted successfully
 *       403:
 *         description: Forbidden - Only inspectors can resubmit
 *       404:
 *         description: FI not found
 *       409:
 *         description: Invalid status for resubmission
 */
router.post('/fis/:id/resubmit', (req, res) => checksheetWorkflowController.resubmitFi(req, res));

/**
 * @swagger
 * /fis/{id}/check:
 *   post:
 *     summary: Check FI (Level 1 approval)
 *     description: Supervisor checks/verifies the FI. Status changes to 'checked'.
 *     tags: [Checksheet Workflow]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: FI ID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               note:
 *                 type: string
 *                 description: Optional note for the check
 *     responses:
 *       200:
 *         description: FI checked successfully
 *       403:
 *         description: Forbidden - Only supervisors can check
 *       404:
 *         description: FI not found
 *       409:
 *         description: Invalid status for checking
 */
router.post('/fis/:id/check', (req, res) => checksheetWorkflowController.checkFi(req, res));

/**
 * @swagger
 * /fis/{id}/approve:
 *   post:
 *     summary: Approve FI (Final approval)
 *     description: Supervisor gives final approval. Status changes to 'approved'. Data is locked.
 *     tags: [Checksheet Workflow]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: FI ID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               note:
 *                 type: string
 *                 description: Optional note for the approval
 *     responses:
 *       200:
 *         description: FI approved successfully
 *       403:
 *         description: Forbidden - Only supervisors can approve
 *       404:
 *         description: FI not found
 *       409:
 *         description: Invalid status for approval
 */
router.post('/fis/:id/approve', (req, res) => checksheetWorkflowController.approveFi(req, res));

/**
 * @swagger
 * /fis/{id}/history:
 *   get:
 *     summary: Get FI audit trail / history
 *     description: Returns checksheet detail, revision history, and approval history
 *     tags: [Checksheet Workflow]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: FI ID
 *     responses:
 *       200:
 *         description: FI history retrieved successfully
 *       404:
 *         description: FI not found
 */
router.get('/fis/:id/history', (req, res) => checksheetWorkflowController.getFiHistory(req, res));

// ========================
// REVISION EDIT ROUTES (SUPER ADMIN ONLY)
// ========================

/**
 * @swagger
 * /revision/dirs/{id}:
 *   put:
 *     summary: Edit DIR during revision (Super Admin only)
 *     description: Only operator (super admin) can edit checksheet data during revision status. Cannot approve.
 *     tags: [Checksheet Workflow]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: DIR ID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               drawingNo:
 *                 type: string
 *               recommendation:
 *                 type: string
 *               generalNote:
 *                 type: string
 *               modelId:
 *                 type: string
 *                 format: uuid
 *               partId:
 *                 type: string
 *                 format: uuid
 *               customerId:
 *                 type: string
 *                 format: uuid
 *               deliveryOrderCode:
 *                 type: string
 *               materialId:
 *                 type: string
 *                 format: uuid
 *               shiftId:
 *                 type: string
 *                 format: uuid
 *               sectionId:
 *                 type: string
 *                 format: uuid
 *               checksheetTemplateId:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       200:
 *         description: DIR updated during revision
 *       403:
 *         description: Forbidden - Only administrators can edit during revision
 *       404:
 *         description: DIR not found
 *       409:
 *         description: DIR is not in revision status
 */
router.put('/revision/dirs/:id', (req, res) => checksheetWorkflowController.editRevisionDir(req, res));

/**
 * @swagger
 * /revision/fis/{id}:
 *   put:
 *     summary: Edit FI during revision (Super Admin only)
 *     description: Only operator (super admin) can edit checksheet data during revision status. Cannot approve.
 *     tags: [Checksheet Workflow]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: FI ID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fiNumber:
 *                 type: string
 *               customerSpecification:
 *                 type: string
 *               impellerDiameter:
 *                 type: number
 *               numericField:
 *                 type: number
 *               generalNote:
 *                 type: string
 *               modelId:
 *                 type: string
 *                 format: uuid
 *               customerId:
 *                 type: string
 *                 format: uuid
 *               shiftId:
 *                 type: string
 *                 format: uuid
 *               sectionId:
 *                 type: string
 *                 format: uuid
 *               checksheetTemplateId:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       200:
 *         description: FI updated during revision
 *       403:
 *         description: Forbidden - Only administrators can edit during revision
 *       404:
 *         description: FI not found
 *       409:
 *         description: FI is not in revision status
 */
router.put('/revision/fis/:id', (req, res) => checksheetWorkflowController.editRevisionFi(req, res));

module.exports = router;
