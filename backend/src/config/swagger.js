const swaggerJsdoc = require('swagger-jsdoc');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'ESQCMS API Documentation',
            version: '1.0.0',
            description: 'API documentation for Equipment & Service Quality Control Management System',
            contact: {
                name: 'ESQCMS Team'
            }
        },
        servers: [
            {
                url: '/api',
                description: 'API Server'
            }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT'
                }
            },
            schemas: {
                // Enums
                Role: {
                    type: 'string',
                    enum: ['inspector', 'supervisor', 'operator'],
                    description: 'User role'
                },
                DirStatus: {
                    type: 'string',
                    enum: ['pending', 'revision', 'approved'],
                    description: 'DIR status'
                },
                MeasurementStatus: {
                    type: 'string',
                    enum: ['ok', 'ng'],
                    description: 'Measurement status'
                },
                VisualInspectionStatus: {
                    type: 'string',
                    enum: ['good', 'after-repair', 'n/a'],
                    description: 'Visual inspection status'
                },
                TemplateType: {
                    type: 'string',
                    enum: ['dir', 'fi'],
                    description: 'Template type'
                },
                ReferenceType: {
                    type: 'string',
                    enum: ['dir', 'fi'],
                    description: 'Reference type'
                },

                // Models
                User: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', format: 'uuid' },
                        role: { $ref: '#/components/schemas/Role' },
                        fullName: { type: 'string' },
                        email: { type: 'string', format: 'email' },
                        profilePicture: { type: 'string', nullable: true },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time', nullable: true }
                    }
                },
                UserInput: {
                    type: 'object',
                    required: ['role', 'fullName', 'email', 'password'],
                    properties: {
                        role: { $ref: '#/components/schemas/Role' },
                        fullName: { type: 'string', maxLength: 50 },
                        email: { type: 'string', format: 'email', maxLength: 100 },
                        password: { type: 'string', minLength: 6 },
                        profilePicture: { type: 'string', nullable: true }
                    }
                },

                Model: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', format: 'uuid' },
                        modelName: { type: 'string' },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time', nullable: true }
                    }
                },
                ModelInput: {
                    type: 'object',
                    required: ['modelName'],
                    properties: {
                        modelName: { type: 'string', maxLength: 30 }
                    }
                },

                Part: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', format: 'uuid' },
                        partNumber: { type: 'string' },
                        partName: { type: 'string' },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time', nullable: true }
                    }
                },
                PartInput: {
                    type: 'object',
                    required: ['partNumber', 'partName'],
                    properties: {
                        partNumber: { type: 'string', maxLength: 20 },
                        partName: { type: 'string', maxLength: 30 }
                    }
                },

                Customer: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', format: 'uuid' },
                        customerName: { type: 'string' },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time', nullable: true }
                    }
                },
                CustomerInput: {
                    type: 'object',
                    required: ['customerName'],
                    properties: {
                        customerName: { type: 'string', maxLength: 30 }
                    }
                },

                Material: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', format: 'uuid' },
                        materialName: { type: 'string' },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time', nullable: true }
                    }
                },
                MaterialInput: {
                    type: 'object',
                    required: ['materialName'],
                    properties: {
                        materialName: { type: 'string', maxLength: 30 }
                    }
                },

                Type: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', format: 'uuid' },
                        typeName: { type: 'string' },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time', nullable: true }
                    }
                },
                TypeInput: {
                    type: 'object',
                    required: ['typeName'],
                    properties: {
                        typeName: { type: 'string', maxLength: 30 }
                    }
                },

                DeliveryOrder: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', format: 'uuid' },
                        deliveryOrderCode: { type: 'string' },
                        attachment: { type: 'string' },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time', nullable: true }
                    }
                },
                DeliveryOrderInput: {
                    type: 'object',
                    required: ['deliveryOrderCode', 'attachment'],
                    properties: {
                        deliveryOrderCode: { type: 'string', maxLength: 20 },
                        attachment: { type: 'string' }
                    }
                },

                Section: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', format: 'uuid' },
                        sectionCode: { type: 'string' },
                        sectionName: { type: 'string' },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time', nullable: true }
                    }
                },
                SectionInput: {
                    type: 'object',
                    required: ['sectionName'],
                    properties: {
                        sectionName: { type: 'string', maxLength: 50 }
                    }
                },

                Shift: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', format: 'uuid' },
                        shiftCode: { type: 'string' },
                        shiftName: { type: 'string' },
                        startTime: { type: 'string', format: 'time' },
                        endTime: { type: 'string', format: 'time' },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time', nullable: true }
                    }
                },
                ShiftInput: {
                    type: 'object',
                    required: ['shiftName', 'startTime', 'endTime'],
                    properties: {
                        shiftName: { type: 'string', maxLength: 30 },
                        startTime: { type: 'string', format: 'time' },
                        endTime: { type: 'string', format: 'time' }
                    }
                },

                RejectReason: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', format: 'uuid' },
                        reasonCode: { type: 'string' },
                        reasonName: { type: 'string' },
                        description: { type: 'string' },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time', nullable: true }
                    }
                },
                RejectReasonInput: {
                    type: 'object',
                    required: ['reasonName', 'description'],
                    properties: {
                        reasonName: { type: 'string', maxLength: 100 },
                        description: { type: 'string' }
                    }
                },

                Dir: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', format: 'uuid' },
                        idDir: { type: 'string' },
                        modelId: { type: 'string', format: 'uuid' },
                        partId: { type: 'string', format: 'uuid' },
                        operatorId: { type: 'string', format: 'uuid' },
                        customerId: { type: 'string', format: 'uuid' },
                        deliveryOrderId: { type: 'string', format: 'uuid' },
                        materialId: { type: 'string', format: 'uuid' },
                        shiftId: { type: 'string', format: 'uuid' },
                        sectionId: { type: 'string', format: 'uuid' },
                        checksheetTemplateId: { type: 'string', format: 'uuid', nullable: true },
                        serialNumber: { type: 'string' },
                        recommendation: { type: 'string', nullable: true },
                        generalNote: { type: 'string', nullable: true },
                        status: { $ref: '#/components/schemas/DirStatus' },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time', nullable: true }
                    }
                },
                DirInput: {
                    type: 'object',
                    required: ['idDir', 'modelId', 'partId', 'customerId', 'deliveryOrderId', 'materialId', 'shiftId', 'sectionId', 'serialNumber'],
                    properties: {
                        idDir: { type: 'string', maxLength: 30 },
                        modelId: { type: 'string', format: 'uuid' },
                        partId: { type: 'string', format: 'uuid' },
                        customerId: { type: 'string', format: 'uuid' },
                        deliveryOrderId: { type: 'string', format: 'uuid' },
                        materialId: { type: 'string', format: 'uuid' },
                        shiftId: { type: 'string', format: 'uuid' },
                        sectionId: { type: 'string', format: 'uuid' },
                        checksheetTemplateId: { type: 'string', format: 'uuid', nullable: true },
                        serialNumber: { type: 'string', maxLength: 20 },
                        recommendation: { type: 'string', nullable: true },
                        generalNote: { type: 'string', nullable: true }
                    }
                },

                Measurement: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', format: 'uuid' },
                        dirId: { type: 'string', format: 'uuid' },
                        dimensional: { type: 'number' },
                        nominal: { type: 'number' },
                        toleranceMin: { type: 'number' },
                        toleranceMax: { type: 'number' },
                        actual: { type: 'number' },
                        status: { $ref: '#/components/schemas/MeasurementStatus' },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time', nullable: true }
                    }
                },
                MeasurementInput: {
                    type: 'object',
                    required: ['dirId', 'dimensional', 'nominal', 'toleranceMin', 'toleranceMax', 'actual'],
                    properties: {
                        dirId: { type: 'string', format: 'uuid' },
                        dimensional: { type: 'number' },
                        nominal: { type: 'number' },
                        toleranceMin: { type: 'number' },
                        toleranceMax: { type: 'number' },
                        actual: { type: 'number' },
                        status: { $ref: '#/components/schemas/MeasurementStatus' }
                    }
                },

                MeasurementPhoto: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', format: 'uuid' },
                        measurementId: { type: 'string', format: 'uuid' },
                        rejectReasonId: { type: 'string', format: 'uuid' },
                        photoPath: { type: 'string' },
                        remark: { type: 'string', nullable: true },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time', nullable: true }
                    }
                },
                MeasurementPhotoInput: {
                    type: 'object',
                    required: ['measurementId', 'rejectReasonId', 'photoPath'],
                    properties: {
                        measurementId: { type: 'string', format: 'uuid' },
                        rejectReasonId: { type: 'string', format: 'uuid' },
                        photoPath: { type: 'string' },
                        remark: { type: 'string', nullable: true }
                    }
                },

                Fi: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', format: 'uuid' },
                        idFi: { type: 'string' },
                        fiNumber: { type: 'string' },
                        modelId: { type: 'string', format: 'uuid' },
                        operatorId: { type: 'string', format: 'uuid' },
                        customerId: { type: 'string', format: 'uuid' },
                        shiftId: { type: 'string', format: 'uuid' },
                        sectionId: { type: 'string', format: 'uuid' },
                        checksheetTemplateId: { type: 'string', format: 'uuid', nullable: true },
                        customerSpecification: { type: 'string' },
                        impellerDiameter: { type: 'number' },
                        numericField: { type: 'number' },
                        generalNote: { type: 'string' },
                        status: { $ref: '#/components/schemas/DirStatus' },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time', nullable: true }
                    }
                },
                FiInput: {
                    type: 'object',
                    required: ['idFi', 'fiNumber', 'modelId', 'customerId', 'shiftId', 'sectionId', 'customerSpecification', 'impellerDiameter', 'numericField', 'generalNote'],
                    properties: {
                        idFi: { type: 'string', maxLength: 30 },
                        fiNumber: { type: 'string', maxLength: 20 },
                        modelId: { type: 'string', format: 'uuid' },
                        customerId: { type: 'string', format: 'uuid' },
                        shiftId: { type: 'string', format: 'uuid' },
                        sectionId: { type: 'string', format: 'uuid' },
                        checksheetTemplateId: { type: 'string', format: 'uuid', nullable: true },
                        customerSpecification: { type: 'string' },
                        impellerDiameter: { type: 'number' },
                        numericField: { type: 'number' },
                        generalNote: { type: 'string' }
                    }
                },

                VisualInspection: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', format: 'uuid' },
                        fiId: { type: 'string', format: 'uuid' },
                        itemName: { type: 'string' },
                        status: { $ref: '#/components/schemas/VisualInspectionStatus' },
                        remark: { type: 'string', nullable: true },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time', nullable: true }
                    }
                },
                VisualInspectionInput: {
                    type: 'object',
                    required: ['fiId', 'itemName'],
                    properties: {
                        fiId: { type: 'string', format: 'uuid' },
                        itemName: { type: 'string', maxLength: 100 },
                        status: { $ref: '#/components/schemas/VisualInspectionStatus' },
                        remark: { type: 'string', nullable: true }
                    }
                },

                Drawing: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', format: 'uuid' },
                        modelId: { type: 'string', format: 'uuid' },
                        partId: { type: 'string', format: 'uuid' },
                        fileName: { type: 'string' },
                        filePath: { type: 'string' },
                        fileType: { type: 'string' },
                        version: { type: 'string' },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time', nullable: true }
                    }
                },
                DrawingInput: {
                    type: 'object',
                    required: ['modelId', 'partId', 'version', 'file'],
                    properties: {
                        modelId: { type: 'string', format: 'uuid' },
                        partId: { type: 'string', format: 'uuid' },
                        version: { type: 'string', maxLength: 20 },
                        file: { type: 'string', format: 'binary' }
                    }
                },

                ChecksheetTemplate: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', format: 'uuid' },
                        templateCode: { type: 'string' },
                        templateName: { type: 'string' },
                        type: { $ref: '#/components/schemas/TemplateType' },
                        modelId: { type: 'string', format: 'uuid' },
                        partId: { type: 'string', format: 'uuid' },
                        description: { type: 'string' },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time', nullable: true }
                    }
                },
                ChecksheetTemplateInput: {
                    type: 'object',
                    required: ['templateName', 'type', 'modelId', 'partId', 'description'],
                    properties: {
                        templateName: { type: 'string', maxLength: 100 },
                        type: { $ref: '#/components/schemas/TemplateType' },
                        modelId: { type: 'string', format: 'uuid' },
                        partId: { type: 'string', format: 'uuid' },
                        description: { type: 'string' }
                    }
                },

                TemplateItem: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', format: 'uuid' },
                        templateId: { type: 'string', format: 'uuid' },
                        itemName: { type: 'string' },
                        nominal: { type: 'number', nullable: true },
                        toleranceMin: { type: 'number', nullable: true },
                        toleranceMax: { type: 'number', nullable: true },
                        sequence: { type: 'integer' },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time', nullable: true }
                    }
                },
                TemplateItemInput: {
                    type: 'object',
                    required: ['templateId', 'itemName', 'sequence'],
                    properties: {
                        templateId: { type: 'string', format: 'uuid' },
                        itemName: { type: 'string', maxLength: 100 },
                        nominal: { type: 'number', nullable: true },
                        toleranceMin: { type: 'number', nullable: true },
                        toleranceMax: { type: 'number', nullable: true },
                        sequence: { type: 'integer' }
                    }
                },

                ChecksheetRevision: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', format: 'uuid' },
                        referenceType: { $ref: '#/components/schemas/ReferenceType' },
                        referenceId: { type: 'string', format: 'uuid' },
                        revisionNumber: { type: 'integer' },
                        revisionNote: { type: 'string' },
                        revisedBy: { type: 'string', format: 'uuid' },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time', nullable: true }
                    }
                },
                ChecksheetRevisionInput: {
                    type: 'object',
                    required: ['referenceType', 'referenceId', 'revisionNumber', 'revisionNote'],
                    properties: {
                        referenceType: { $ref: '#/components/schemas/ReferenceType' },
                        referenceId: { type: 'string', format: 'uuid' },
                        revisionNumber: { type: 'integer' },
                        revisionNote: { type: 'string' }
                    }
                },

                ChecksheetApproval: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', format: 'uuid' },
                        referenceType: { $ref: '#/components/schemas/ReferenceType' },
                        referenceId: { type: 'string', format: 'uuid' },
                        approvedBy: { type: 'string', format: 'uuid' },
                        approvedAt: { type: 'string', format: 'date-time' },
                        note: { type: 'string', nullable: true },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time', nullable: true }
                    }
                },
                ChecksheetApprovalInput: {
                    type: 'object',
                    required: ['referenceType', 'referenceId', 'approvedAt'],
                    properties: {
                        referenceType: { $ref: '#/components/schemas/ReferenceType' },
                        referenceId: { type: 'string', format: 'uuid' },
                        approvedAt: { type: 'string', format: 'date-time' },
                        note: { type: 'string', nullable: true }
                    }
                },

                // Common Responses
                SuccessResponse: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean', example: true },
                        data: { type: 'object' }
                    }
                },
                ErrorResponse: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean', example: false },
                        message: { type: 'string' }
                    }
                },
                LoginRequest: {
                    type: 'object',
                    required: ['email', 'password'],
                    properties: {
                        email: { type: 'string', format: 'email' },
                        password: { type: 'string' }
                    }
                },
                LoginResponse: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean' },
                        message: { type: 'string' },
                        data: {
                            type: 'object',
                            properties: {
                                token: { type: 'string' },
                                user: { $ref: '#/components/schemas/User' }
                            }
                        }
                    }
                }
            }
        },
        tags: [
            { name: 'Auth', description: 'Authentication endpoints' },
            { name: 'Users', description: 'User management (Operator only)' },
            { name: 'Types', description: 'Type master data' },
            { name: 'Models', description: 'Model master data' },
            { name: 'Parts', description: 'Part master data' },
            { name: 'Customers', description: 'Customer master data' },
            { name: 'Materials', description: 'Material master data' },
            { name: 'Delivery Orders', description: 'Delivery order master data' },
            { name: 'Sections', description: 'Section master data' },
            { name: 'Shifts', description: 'Shift master data' },
            { name: 'Reject Reasons', description: 'Reject reason master data' },
            { name: 'Drawings', description: 'Drawing master data' },
            { name: 'Checksheet Templates', description: 'Checksheet template master data' },
            { name: 'Template Items', description: 'Template item master data' },
            { name: 'DIRs', description: 'Dimensional Inspection Report' },
            { name: 'Measurements', description: 'Measurement records' },
            { name: 'Measurement Photos', description: 'Measurement photo records' },
            { name: 'FIs', description: 'Final Inspection' },
            { name: 'Visual Inspections', description: 'Visual inspection records' },
            { name: 'Checksheet Revisions', description: 'Checksheet revision history' },
            { name: 'Checksheet Approvals', description: 'Checksheet approval records' }
        ]
    },
    apis: ['./src/routes/*.js']
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
