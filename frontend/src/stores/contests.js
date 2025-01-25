/**
 * Store для управления конкурсами
 */

import { defineStore } from 'pinia'
import { useStoreHelpers } from '@/composables/useStoreHelpers'
import { useCrudHelpers } from '@/composables/useCrudHelpers'
import { useSettingsHelpers } from '@/composables/useSettingsHelpers'
import { contestService } from '@/services'

const { baseState, withAsync } = useStoreHelpers()

export const useContestsStore = defineStore('contests', {
  state: () => ({
    ...baseState(),
    contests: [],
    currentContest: null,
    favoriteContests: new Set(),
    isInitialized: false,
    filters: {
      search: '',
      sortBy: 'created_at_desc',
      platform_type: [],
      status: '',
      category: '',
      prizeType: ''
    },
    pagination: {
      currentPage: 1,
      totalPages: 1,
      totalItems: 0,
      perPage: 12
    }
  }),

  getters: {
    /**
     * Получение списка конкурсов
     */
    getContests: (state) => state.contests,

    /**
     * Получение текущих фильтров
     */
    getFilters: (state) => state.filters,

    /**
     * Получение состояния пагинации
     */
    getPagination: (state) => state.pagination,

    /**
     * Проверка, является ли конкурс избранным
     */
    isContestFavorite: (state) => (contestId) => {
      return state.favoriteContests.has(contestId)
    },

    /**
     * Получение текущего конкурса
     */
    getCurrentContest: (state) => state.currentContest
  },

  actions: {
    async init() {
      return withAsync(this, async () => {
        try {
          // Инициализируем состояние
          this.contests = []
          this.currentContest = null
          this.favoriteContests = new Set()
          
          // Инициализируем хелперы
          const crud = useCrudHelpers(contestService, this)
          const settings = useSettingsHelpers(contestService, this)
          
          // Устанавливаем флаг инициализации
          this.isInitialized = true
          
          // Возвращаем результат
          return {
            crud,
            settings,
            isInitialized: true,
            success: true
          }
        } catch (error) {
          console.error('Error initializing contests store:', error)
          this.isInitialized = true // Устанавливаем флаг даже при ошибке
          return {
            success: false,
            error: error.message,
            isInitialized: true
          }
        }
      })
    },

    /**
     * Получение конкурса по ID
     */
    async fetchContest(contestId) {
      return withAsync(this, async () => {
        try {
          // Сначала загружаем избранные конкурсы, если они еще не загружены
          if (this.favoriteContests.size === 0) {
            await this.loadFavoriteContests()
          }

          const response = await contestService.getContest(contestId)
          if (response?.data) {
            // Применяем статус избранного к загруженному конкурсу
            this.currentContest = {
              ...response.data,
              is_favorite: this.favoriteContests.has(contestId),
              hasUserParticipated: response.data.has_user_participated
            }
            
            console.debug('Fetched contest details:', {
              contestId,
              isFavorite: this.currentContest.is_favorite,
              hasUserParticipated: this.currentContest.hasUserParticipated,
              favoriteContests: Array.from(this.favoriteContests)
            })
            
            return this.currentContest
          }
          throw new Error('Не удалось загрузить данные конкурса')
        } catch (error) {
          console.error('Error fetching contest:', error)
          throw error
        }
      })
    },

    async updateFilters(filters) {
      return withAsync(this, async () => {
        console.debug('Updating filters:', filters)
        
        // Обновляем состояние фильтров
        this.filters = {
          ...this.filters,
          ...filters
        }
        
        this.pagination.currentPage = 1
        
        // Формируем параметры запроса
        const params = {
          search: this.filters.search || '',
          sortBy: this.filters.sortBy || 'created_at_desc',
          platform_type: Array.isArray(this.filters.platform_type) ? this.filters.platform_type : [],
          status: this.filters.status || '',
          category: this.filters.category || '',
          prizeType: this.filters.prizeType || '',
          page: this.pagination.currentPage,
          perPage: this.pagination.perPage
        }
        
        // Загружаем конкурсы с новыми фильтрами
        const response = await contestService.getContests(params)
        
        // Обновляем состояние
        if (response.data) {
          // Применяем статус избранного к загруженным конкурсам
          const contests = response.data.map(contest => ({
            ...contest,
            is_favorite: this.favoriteContests.has(contest.id)
          }))
          
          this.contests = contests
          
          if (response.pagination) {
            this.pagination = {
              currentPage: response.pagination.page || 1,
              totalPages: response.pagination.totalPages || 1,
              totalItems: response.pagination.total || 0,
              perPage: response.pagination.perPage || this.pagination.perPage
            }
          }
          
          return {
            success: true,
            data: contests,
            pagination: this.pagination
          }
        }
        
        return {
          success: false,
          error: 'Не удалось загрузить конкурсы'
        }
      })
    },

    async loadMore() {
      if (this.pagination.currentPage >= this.pagination.totalPages) {
        return {
          success: true,
          noMoreData: true
        }
      }

      return withAsync(this, async () => {
        const nextPage = this.pagination.currentPage + 1
        
        const params = {
          ...this.filters,
          page: nextPage,
          perPage: this.pagination.perPage
        }
        
        const response = await contestService.getContests(params)
        
        if (response.data) {
          // Применяем статус избранного к новым конкурсам
          const newContests = response.data.map(contest => ({
            ...contest,
            is_favorite: this.favoriteContests.has(contest.id)
          }))
          
          this.contests = [...this.contests, ...newContests]
          
          if (response.pagination) {
            this.pagination = {
              currentPage: response.pagination.page || nextPage,
              totalPages: response.pagination.totalPages || this.pagination.totalPages,
              totalItems: response.pagination.total || this.pagination.totalItems,
              perPage: response.pagination.perPage || this.pagination.perPage
            }
          }
          
          return {
            success: true,
            data: newContests,
            pagination: this.pagination
          }
        }
        
        return {
          success: false,
          error: 'Не удалось загрузить дополнительные конкурсы'
        }
      })
    },

    async loadFavoriteContests() {
      return withAsync(this, async () => {
        try {
          const response = await contestService.getFavoriteContests()
          console.debug('Loading favorite contests response:', response)

          if (response?.success) {
            const favoriteContests = response.data || []
            console.debug('Received favorite contests:', favoriteContests)

            // Обновляем Set избранных конкурсов
            this.favoriteContests = new Set(favoriteContests.map(contest => contest.id))

            // Обновляем статус в текущем списке конкурсов
            this.contests.forEach(contest => {
              contest.is_favorite = this.favoriteContests.has(contest.id)
            })

            // Обновляем статус текущего конкурса, если он открыт
            if (this.currentContest) {
              this.currentContest.is_favorite = this.favoriteContests.has(this.currentContest.id)
            }

            console.debug('Updated favorite contests state:', {
              totalFavorites: this.favoriteContests.size,
              favoriteIds: Array.from(this.favoriteContests)
            })
            
            return {
              success: true,
              data: favoriteContests
            }
          }
          
          return {
            success: false,
            error: 'Неверный формат ответа'
          }
        } catch (error) {
          console.error('Error loading favorite contests:', error)
          this.favoriteContests = new Set()
          return {
            success: false,
            error: error.message
          }
        }
      })
    },

    updateFavoriteStatus(contestId, isFavorite) {
      if (isFavorite) {
        this.favoriteContests.add(contestId)
      } else {
        this.favoriteContests.delete(contestId)
      }
      
      return {
        success: true,
        contestId,
        isFavorite
      }
    },

    /**
     * Переключение избранного статуса конкурса
     */
    async toggleFavorite(contestId) {
      return withAsync(this, async () => {
        try {
          const response = await contestService.toggleFavorite(contestId)
          console.debug('Store received response:', response)
          
          if (response?.success) {
            // Проверяем наличие данных
            console.debug('Checking response data:', {
              contestId,
              responseData: response.data,
              isFavorite: response.data?.isFavorite
            })
            
            const isFavorite = response.data?.isFavorite
            
            if (typeof isFavorite !== 'boolean') {
              console.error('Invalid isFavorite value:', response.data)
              return {
                success: false,
                error: 'Неверный формат данных'
              }
            }
            
            // Обновляем состояние в Set
            this.updateFavoriteStatus(contestId, isFavorite)
            
            // Обновляем состояние в текущем списке конкурсов
            const contest = this.contests.find(c => c.id === contestId)
            if (contest) {
              contest.is_favorite = isFavorite
              console.debug('Updated contest in list:', {
                contestId,
                newState: contest.is_favorite
              })
            }
            
            // Обновляем состояние в текущем конкурсе, если он открыт
            if (this.currentContest?.id === contestId) {
              this.currentContest.is_favorite = isFavorite
              console.debug('Updated current contest:', {
                contestId,
                newState: this.currentContest.is_favorite
              })
            }
            
            return {
              success: true,
              isFavorite
            }
          }
          
          return {
            success: false,
            error: 'Не удалось обновить статус избранного'
          }
        } catch (error) {
          console.error('Error toggling favorite:', error)
          return {
            success: false,
            error: error.message
          }
        }
      })
    },

    /**
     * Участие в конкурсе
     */
    async participateInContest(contestId) {
      return withAsync(this, async () => {
        try {
          const response = await contestService.participate(contestId)
          console.debug('Participation response:', response)
          
          if (!response?.success) {
            return {
              success: false,
              error: 'Неверный формат ответа'
            }
          }
          
          // Обновляем статус участия в текущем конкурсе
          if (this.currentContest && this.currentContest.id === contestId) {
            this.currentContest.hasUserParticipated = true
            this.currentContest.participationStatus = response.data.status
          }
          
          return {
            success: true,
            data: response.data
          }
        } catch (error) {
          console.error('Error participating in contest:', error)
          if (error.message === 'Вы уже участвуете в этом конкурсе') {
            return {
              success: false,
              error: 'Вы уже участвуете'
            }
          }
          return {
            success: false,
            error: error.message
          }
        }
      })
    }
  }
}) 