export class BaseValidator {
  static required(value) {
    return !!value || 'Поле обязательно для заполнения'
  }

  static email(value) {
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return !value || pattern.test(value) || 'Некорректный email'
  }

  static minLength(length) {
    return (value) => {
      return !value || value.length >= length || `Минимальная длина ${length} символов`
    }
  }

  static maxLength(length) {
    return (value) => {
      return !value || value.length <= length || `Максимальная длина ${length} символов`
    }
  }

  static url(value) {
    try {
      new URL(value)
      return true
    } catch {
      return 'Некорректный URL'
    }
  }
} 