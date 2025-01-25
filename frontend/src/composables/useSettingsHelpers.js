/**
 * Composable для работы с настройками
 * Содержит общие методы для загрузки и обновления настроек
 */

export const useSettingsHelpers = (api, state) => {
  // Загрузка настроек
  const fetchSettings = async () => {
    const settings = await api.getSettings()
    state.settings = settings
    return settings
  }

  // Обновление настроек
  const updateSettings = async (settings) => {
    const updatedSettings = await api.updateSettings(settings)
    state.settings = updatedSettings
    return updatedSettings
  }

  return {
    fetchSettings,
    updateSettings
  }
} 