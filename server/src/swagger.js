import swaggerJsdoc from 'swagger-jsdoc'

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'MoovXperience API',
      version: '1.0.0',
      description: 'API REST pour la marketplace MoovXperience — Solutions interactives pour événements par Maker Skills.',
      contact: {
        name: 'Maker Skills',
        email: 'contact@makerskills.tn',
      },
    },
    servers: [
      { url: 'http://localhost:3001', description: 'Développement local' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        Product: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string', example: 'Photobooth 360' },
            description: { type: 'string' },
            price_per_day: { type: 'number', example: 450.00 },
            price_purchase: { type: 'number', nullable: true, example: 8500.00 },
            deposit: { type: 'number', example: 1000.00 },
            stock: { type: 'integer', example: 3 },
            is_available: { type: 'boolean' },
            images: { type: 'array', items: { type: 'string' } },
            video_url: { type: 'string', nullable: true },
            location: { type: 'string', example: 'Tunis' },
            mode: { type: 'string', enum: ['rental', 'sale', 'both'] },
            options: { type: 'array', items: { $ref: '#/components/schemas/ProductOption' } },
            min_duration: { type: 'integer', example: 1 },
            category_id: { type: 'string', format: 'uuid' },
            created_at: { type: 'string', format: 'date-time' },
          },
        },
        ProductOption: {
          type: 'object',
          properties: {
            name: { type: 'string', example: 'Personnalisation branding' },
            price: { type: 'number', example: 200 },
            description: { type: 'string' },
          },
        },
        Rental: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            client_id: { type: 'string', format: 'uuid' },
            status: { type: 'string', enum: ['pending', 'confirmed', 'delivered', 'returned', 'completed', 'cancelled'] },
            start_date: { type: 'string', format: 'date' },
            end_date: { type: 'string', format: 'date' },
            total_price: { type: 'number' },
            notes: { type: 'string' },
            delivery_address: { type: 'object' },
            created_at: { type: 'string', format: 'date-time' },
          },
        },
        Quote: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            product_id: { type: 'string', format: 'uuid' },
            client_name: { type: 'string' },
            client_email: { type: 'string' },
            mode: { type: 'string', enum: ['rental', 'purchase'] },
            duration_days: { type: 'integer', nullable: true },
            options: { type: 'array', items: { $ref: '#/components/schemas/ProductOption' } },
            event_date: { type: 'string', format: 'date', nullable: true },
            event_location: { type: 'string' },
            estimated_total: { type: 'number' },
            status: { type: 'string', enum: ['pending', 'sent', 'accepted', 'rejected', 'expired'] },
            created_at: { type: 'string', format: 'date-time' },
          },
        },
        Review: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            product_id: { type: 'string', format: 'uuid' },
            rating: { type: 'integer', minimum: 1, maximum: 5 },
            comment: { type: 'string' },
            created_at: { type: 'string', format: 'date-time' },
          },
        },
        Profile: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            role: { type: 'string', enum: ['client', 'supplier', 'admin'] },
            full_name: { type: 'string' },
            phone: { type: 'string' },
            avatar_url: { type: 'string', nullable: true },
          },
        },
        Error: {
          type: 'object',
          properties: {
            error: { type: 'string' },
          },
        },
      },
    },
  },
  apis: ['./src/routes/*.js'],
}

export const swaggerSpec = swaggerJsdoc(options)
