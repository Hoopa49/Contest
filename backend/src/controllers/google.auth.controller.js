const { google } = require('googleapis')
const UserModel = require('../models/user.model')
const jwtService = require('../services/jwt.service')
const logger = require('../logging')
const config = require('../config')

class GoogleAuthController {
  constructor() {
    this.oAuth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI || `${process.env.FRONTEND_URL}/auth/google/callback`
    )
  }

  getAuthUrl = async (req, res) => {
    try {
      const url = this.oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: [
          'https://www.googleapis.com/auth/userinfo.profile',
          'https://www.googleapis.com/auth/userinfo.email'
        ]
      })

      res.json({
        success: true,
        data: { url }
      })
    } catch (error) {
      logger.error('Ошибка при получении URL для Google авторизации:', error)
      res.status(500).json({
        success: false,
        error: 'Ошибка при получении URL для авторизации'
      })
    }
  }

  handleCallback = async (req, res) => {
    try {
      const { code } = req.body
      
      if (!code) {
        throw new Error('Код авторизации не предоставлен')
      }

      // Получаем токены
      const { tokens } = await this.oAuth2Client.getToken(code)
      this.oAuth2Client.setCredentials(tokens)

      // Получаем информацию о пользователе
      const oauth2 = google.oauth2({ version: 'v2', auth: this.oAuth2Client })
      const { data } = await oauth2.userinfo.get()

      // Ищем или создаем пользователя
      let user = await UserModel.findOne({ 
        where: { 
          email: data.email 
        }
      })

      if (!user) {
        user = await UserModel.create({
          email: data.email,
          first_name: data.given_name,
          last_name: data.family_name,
          avatar: data.picture,
          auth_provider: 'google',
          is_active: true
        })
      }

      // Генерируем JWT токены
      const accessToken = jwtService.generateAccessToken(user)
      const refreshToken = jwtService.generateRefreshToken(user)

      res.json({
        success: true,
        data: {
          user,
          accessToken,
          refreshToken
        }
      })
    } catch (error) {
      logger.error('Ошибка при обработке Google callback:', error)
      res.status(500).json({
        success: false,
        error: 'Ошибка при обработке авторизации'
      })
    }
  }
}

module.exports = new GoogleAuthController() 