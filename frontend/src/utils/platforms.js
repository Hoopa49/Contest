/**
 * Утилиты для работы с платформами
 * Содержит конфигурацию и методы для работы с различными платформами
 */

// Конфигурация платформ
export const platformConfig = {
  youtube: {
    name: 'YouTube',
    icon: 'mdi-youtube',
    color: '#FF0000',
    defaultImage: '/images/platforms/youtube.png',
    urlPattern: /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/
  },
  instagram: {
    name: 'Instagram',
    icon: 'mdi-instagram',
    color: '#E4405F',
    defaultImage: '/images/platforms/instagram.png',
    urlPattern: /^(https?:\/\/)?(www\.)?instagram\.com\/.+$/
  },
  vk: {
    name: 'VKontakte',
    icon: 'mdi-vk',
    color: '#4A76A8',
    defaultImage: '/images/platforms/vk.png',
    urlPattern: /^(https?:\/\/)?(www\.)?vk\.com\/.+$/
  },
  telegram: {
    name: 'Telegram',
    icon: 'mdi-telegram',
    color: '#26A5E4',
    defaultImage: '/images/platforms/telegram.png',
    urlPattern: /^(https?:\/\/)?(www\.)?(t\.me|telegram\.me)\/.+$/
  }
}

// Получение информации о платформе
export const getPlatformInfo = (platform) => {
  return platformConfig[platform] || {
    name: 'Другое',
    icon: 'mdi-web',
    color: '#9E9E9E',
    defaultImage: '/images/platforms/default.png',
    urlPattern: /.*/
  }
}

// Получение цвета платформы
export const getPlatformColor = (platform) => {
  return getPlatformInfo(platform).color
}

// Получение иконки платформы
export const getPlatformIcon = (platform) => {
  return getPlatformInfo(platform).icon
}

// Получение дефолтного изображения платформы
export const getDefaultImage = (platform) => {
  return getPlatformInfo(platform).defaultImage
}

// Валидация URL платформы
export const validatePlatformUrl = (platform, url) => {
  const config = getPlatformInfo(platform)
  return config.urlPattern.test(url)
} 