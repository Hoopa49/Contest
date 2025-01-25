/**
 * Composable для CRUD операций
 * Содержит общие методы для работы с сущностями
 */

export const useCrudHelpers = (api, state) => {
  // Получение всех записей
  const fetchAll = async () => {
    const items = await api.getAll()
    state.items = items
    return items
  }

  // Получение записи по ID
  const fetchById = async (id) => {
    const item = await api.getById(id)
    state.current = item
    return item
  }

  // Создание записи
  const create = async (data) => {
    const item = await api.create(data)
    state.items.push(item)
    return item
  }

  // Обновление записи
  const update = async ({ id, data }) => {
    const item = await api.update(id, data)
    const index = state.items.findIndex(i => i.id === item.id)
    if (index !== -1) {
      state.items[index] = item
      if (state.current?.id === item.id) {
        state.current = item
      }
    }
    return item
  }

  // Удаление записи
  const remove = async (id) => {
    await api.delete(id)
    state.items = state.items.filter(i => i.id !== id)
    if (state.current?.id === id) {
      state.current = null
    }
  }

  return {
    fetchAll,
    fetchById,
    create,
    update,
    remove
  }
} 