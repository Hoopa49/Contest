/**
 * Store для управления платформами
 * Управление платформами и их интеграциями
 */

import { defineStore } from 'pinia'
import { platformService } from '@/services/api/platform.api'
import { useStoreHelpers } from '@/composables/useStoreHelpers'
import { useCrudHelpers } from '@/composables/useCrudHelpers'
import { useSettingsHelpers } from '@/composables/useSettingsHelpers'

const { baseState, baseGetters, baseActions, withAsync } = useStoreHelpers()

export const usePlatformStore = defineStore('platform', {
  state: () => ({
    ...baseState,
    items: [], // platforms
    current: null, // currentPlatform
    stats: null,
    settings: null // integrationSettings
  }),

  getters: {
    ...baseGetters,
    allPlatforms: (state) => state.items,
    currentPlatform: (state) => state.current,
    platformStats: (state) => state.stats,
    integrationSettings: (state) => state.settings
  },

  actions: {
    ...baseActions,

    // Инициализация helpers
    init() {
      const crud = useCrudHelpers(platformService, this)
      const settings = useSettingsHelpers(platformService, this)
      return { crud, settings }
    },

    // CRUD операции
    async fetchPlatforms() {
      return withAsync(this, async () => {
        const { crud } = this.init()
        return crud.fetchAll()
      })
    },

    async fetchPlatform(id) {
      return withAsync(this, async () => {
        const { crud } = this.init()
        return crud.fetchById(id)
      })
    },

    async createPlatform(platformData) {
      return withAsync(this, async () => {
        const { crud } = this.init()
        return crud.create(platformData)
      })
    },

    async updatePlatform({ id, platformData }) {
      return withAsync(this, async () => {
        const { crud } = this.init()
        return crud.update({ id, data: platformData })
      })
    },

    async deletePlatform(id) {
      return withAsync(this, async () => {
        const { crud } = this.init()
        return crud.remove(id)
      })
    },

    // Специфичные операции
    async fetchStats(id) {
      return withAsync(this, async () => {
        const stats = await platformService.getStats(id)
        this.stats = stats
        return stats
      })
    },

    async checkAvailability(id) {
      return withAsync(this, async () => {
        return await platformService.checkAvailability(id)
      })
    },

    // Операции с настройками
    async fetchIntegrationSettings(id) {
      return withAsync(this, async () => {
        const { settings } = this.init()
        return settings.fetchSettings()
      })
    },

    async updateIntegrationSettings({ id, settings: settingsData }) {
      return withAsync(this, async () => {
        const { settings } = this.init()
        return settings.updateSettings(settingsData)
      })
    }
  }
}) 