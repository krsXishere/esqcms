const express = require('express');
const cors = require('cors');
const routes = require('./src/routes');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api', routes);

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        message: 'Welcome to ESQCMS API',
        version: '1.0.0',
        endpoints: {
            types: '/api/types',
            models: '/api/models',
            parts: '/api/parts',
            deliveryOrders: '/api/delivery-orders',
            materials: '/api/materials',
            users: '/api/users',
            customers: '/api/customers',
            health: '/api/health',
        },
    });
});

// 404 Handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Endpoint not found',
    });
});

// Error Handler
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({
        success: false,
        message: 'Internal server error',
    });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
    console.log(`API available at http://localhost:${port}/api`);
});