require('dotenv').config()

module.exports = {
  accessSecret: process.env.JWT_ACCESS_SECRET || 'your-access-secret',
  refreshSecret: process.env.JWT_REFRESH_SECRET || 'your-refresh-secret',
  accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
  refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d'
} 