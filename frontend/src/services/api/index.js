/**
 * Индексный файл API
 * Экспортирует все API сервисы приложения
 */

import { notificationService } from './notification.api'
import { platformService } from './platform.api'
import { contestService } from './contest.api'
import { userService } from './user.api'
import { adminService } from './admin.api'
import { authService } from './auth.api'

export {
  notificationService,
  platformService,
  contestService,
  userService,
  adminService,
  authService
} 