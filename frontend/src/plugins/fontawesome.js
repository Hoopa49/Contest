import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { 
  faGoogle,
  faVk, 
  faTelegram 
} from '@fortawesome/free-brands-svg-icons'
import { 
  faEye, 
  faEyeSlash,
  faTrophy,
  faUsers,
  faChartLine,
  faGift,
  faMoon,
  faSun,
  faSpinner
} from '@fortawesome/free-solid-svg-icons'

library.add(
  faGoogle,
  faVk,
  faTelegram,
  faEye, 
  faEyeSlash,
  faTrophy,
  faUsers,
  faChartLine,
  faGift,
  faMoon,
  faSun,
  faSpinner
)

export function setupFontAwesome(app) {
  app.component('font-awesome-icon', FontAwesomeIcon)
} 