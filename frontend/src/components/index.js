// Re-export all components
export * from './common'
export * from './layout'
export * from './features'

// Register all components globally
import { defineAsyncComponent } from 'vue'

export function registerGlobalComponents(app) {
  // Common Components
  app.component('UserAvatar', defineAsyncComponent(() => import('./common/UserAvatar.vue')))
  app.component('RatingStars', defineAsyncComponent(() => import('./common/RatingStars.vue')))
  app.component('ConfirmDialog', defineAsyncComponent(() => import('./common/ConfirmDialog.vue')))

  // Layout Components
  app.component('AppFooter', defineAsyncComponent(() => import('../layouts/default/AppFooter.vue')))

  // New components
  app.component('Loader', Loader)
  app.component('Logo', Logo)
  app.component('PageTitle', PageTitle)
  app.component('SearchField', SearchField)
} 