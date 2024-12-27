// frontend/src/plugins/vuetify.js
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import '@mdi/font/css/materialdesignicons.css' // Иконки
import 'vuetify/styles' // Основные стили

export default createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: 'light',
  },
})
