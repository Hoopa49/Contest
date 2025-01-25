// Re-export all components
export * from './common'
export * from './layout'
export * from './features'

// Register all components globally
import { defineAsyncComponent } from 'vue'

export function registerGlobalComponents(app) {
  // Common Components
  app.component('ErrorAlert', defineAsyncComponent(() => import('./common/ErrorAlert.vue')))
  app.component('LoadingSpinner', defineAsyncComponent(() => import('./common/LoadingSpinner.vue')))
  app.component('UserAvatar', defineAsyncComponent(() => import('./common/UserAvatar.vue')))
  app.component('SocialNetworks', defineAsyncComponent(() => import('./common/SocialNetworks.vue')))
  app.component('RatingStars', defineAsyncComponent(() => import('./common/RatingStars.vue')))
  app.component('ConfirmDialog', defineAsyncComponent(() => import('./common/ConfirmDialog.vue')))

  // Layout Components
  app.component('AppHeader', defineAsyncComponent(() => import('./layout/Header.vue')))
  app.component('AppFooter', defineAsyncComponent(() => import('./layout/Footer.vue')))
  app.component('AppSidebar', defineAsyncComponent(() => import('./layout/Sidebar.vue')))
  app.component('NavigationMenu', defineAsyncComponent(() => import('./layout/NavigationMenu.vue')))
  app.component('NavigationDrawer', defineAsyncComponent(() => import('./layout/NavigationDrawer.vue')))
  app.component('UserMenu', defineAsyncComponent(() => import('./layout/UserMenu.vue')))
} 