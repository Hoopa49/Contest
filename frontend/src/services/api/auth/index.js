/**
 * Индексный файл для экспорта сервисов аутентификации
 * Экспортирует сервисы для работы с токенами и аутентификацией
 */

import tokenService from './token.service'
import { authService } from '../auth.api'

export { authService, tokenService } 