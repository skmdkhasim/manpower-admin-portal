export default () => ({
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3001', 10),
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',

  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    name: process.env.DB_NAME || 'manpower_mgmt',
    ssl: process.env.DB_SSL === 'true',
    synchronize: process.env.DB_SYNCHRONIZE === 'true',
  },

  jwt: {
    accessSecret:
      process.env.JWT_ACCESS_SECRET || 'dev-access-secret-change-me',
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    refreshSecret:
      process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret-change-me',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    refreshExpiresInMs: 7 * 24 * 60 * 60 * 1000,
  },

  storage: {
    provider: process.env.STORAGE_PROVIDER || 's3', // 's3' | 'r2'
    bucket: process.env.STORAGE_BUCKET || '',
    region: process.env.STORAGE_REGION || 'auto',
    endpoint: process.env.STORAGE_ENDPOINT || '', // required for Cloudflare R2
    accessKeyId: process.env.STORAGE_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.STORAGE_SECRET_ACCESS_KEY || '',
    publicUrl: process.env.STORAGE_PUBLIC_URL || '',
  },

  openai: {
    apiKey: process.env.OPENAI_API_KEY || '',
  },

  seedSuperAdmin: {
    email: process.env.SEED_SUPER_ADMIN_EMAIL || 'admin@example.com',
    password: process.env.SEED_SUPER_ADMIN_PASSWORD || 'ChangeMe123!',
    fullName: process.env.SEED_SUPER_ADMIN_NAME || 'Super Admin',
  },
});
