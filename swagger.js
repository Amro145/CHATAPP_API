import swaggerJSDoc from 'swagger-jsdoc';

const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Chat App API',
            version: '1.0.0',
            description: 'API Documentation for the Video Call Chat Application',
            contact: {
                name: 'API Support',
                email: 'support@example.com'
            },
        },
        servers: [
            {
                url: process.env.CLIENT_URL || 'http://localhost:3000',
                description: 'API Server'
            },
            {
                url: 'https://chatapp-api-ecru.vercel.app',
                description: 'Production Server'
            }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
                cookieAuth: {
                    type: 'apiKey',
                    in: 'cookie',
                    name: 'token'
                }
            },
            schemas: {
                User: {
                    type: 'object',
                    properties: {
                        _id: { type: 'string' },
                        email: { type: 'string', format: 'email' },
                        name: { type: 'string' },
                        profilePic: { type: 'string' },
                        bio: { type: 'string' },
                        isVerified: { type: 'boolean' },
                        onboarding: { type: 'boolean' },
                        friends: {
                            type: 'array',
                            items: { type: 'string' } // Or refer to User object recursively if needed, simpler to use ID strings here or partial user objects
                        }
                    }
                },
                FriendRequest: {
                    type: 'object',
                    properties: {
                        _id: { type: 'string' },
                        sender: { type: 'string' },
                        receiver: { type: 'string' },
                        status: { type: 'string', enum: ['pending', 'accepted'] },
                        message: { type: 'string' },
                        createdAt: { type: 'string', format: 'date-time' }
                    }
                }
            }
        },
        security: [{
            bearerAuth: []
        }, {
            cookieAuth: []
        }]
    },
    apis: ['./src/routes/*.js'], // Path to the API docs
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);

export default swaggerSpec;
