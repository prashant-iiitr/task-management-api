const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Task Management REST API",
      version: "1.0.0",
      description:
        "A complete REST API for managing tasks with JWT authentication, filtering, and pagination.",
      contact: {
        name: "Backend Intern Assignment",
      },
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Development Server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },
  apis: ["./src/routes/*.js"], // Reads JSDoc comments from route files
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
