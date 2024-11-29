require('dotenv').config();

const Hapi = require('@hapi/hapi');
const routes = require('../server/routes');
const loadModel = require('../services/loadModel');
const InputError = require('../exceptions/InputError');

(async () => {
    try {
        const server = Hapi.server({
            port: 3000,
            host: 'localhost',
            routes: {
                cors: {
                    origin: ['*'],
                },
            },
        });

        // Load the model and attach it to the server's application context
        const model = await loadModel();
        server.app.model = model;

        // Register routes
        server.route(routes);

        // Global error handling (onPreResponse)
        server.ext('onPreResponse', (request, h) => {
            const response = request.response;
        
            console.log('Response Object Type:', response.constructor.name); // Log the type of response
            console.log('Is InputError:', response instanceof InputError);
        
            if (response instanceof InputError || response.name === 'InputError') {
                const newResponse = h.response({
                    status: 'fail',
                    message: `${response.message} Silakan gunakan foto lain.`
                });
                newResponse.code(response.statusCode || 400);
                return newResponse;
            }
        
            if (response.isBoom) {
                const newResponse = h.response({
                    status: 'fail',
                    message: response.output.payload.message || 'Internal Server Error'
                });
                newResponse.code(response.output.statusCode || 500);
                return newResponse;
            }
        
            return h.continue;
        });

        // Start the server
        await server.start();
        console.log(`Server started at: ${server.info.uri}`);
    } catch (error) {
        console.error('Error starting the server:', error.message);
        process.exit(1); // Exit the process if the server fails to start
    }
})();
