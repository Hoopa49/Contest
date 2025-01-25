<template>
  <v-container>
    <!-- Текущая подписка -->
    <v-card class="mb-4">
      <v-card-title>
        <v-icon start color="primary">mdi-crown</v-icon>
        Текущая подписка
      </v-card-title>

      <v-card-text>
        <v-row align="center">
          <v-col cols="12" md="6">
            <div class="text-h6">{{ subscription.plan.name }}</div>
            <div class="text-subtitle-1 text-grey">
              {{ formatPrice(subscription.plan.price) }} / месяц
            </div>
            <div class="mt-2">
              <v-chip
                :color="subscription.status === 'active' ? 'success' : 'error'"
                size="small"
              >
                {{ getStatusText(subscription.status) }}
              </v-chip>
              <span class="text-caption ml-2" v-if="subscription.status === 'active'">
                до {{ formatDate(subscription.expiresAt) }}
              </span>
            </div>
          </v-col>

          <v-col cols="12" md="6" class="text-right">
            <template v-if="subscription.status === 'active'">
              <v-btn
                variant="outlined"
                color="error"
                class="mr-2"
                @click="confirmCancelDialog = true"
                :disabled="cancelling"
              >
                Отменить подписку
              </v-btn>
              <v-btn
                color="primary"
                @click="upgradePlanDialog = true"
              >
                Улучшить план
              </v-btn>
            </template>
            <template v-else>
              <v-btn
                color="primary"
                @click="renewSubscription"
                :loading="renewing"
              >
                Возобновить подписку
              </v-btn>
            </template>
          </v-col>
        </v-row>

        <!-- Прогресс использования -->
        <v-divider class="my-4"></v-divider>
        
        <div class="text-subtitle-1 mb-2">Использование ресурсов</div>
        <v-row>
          <v-col 
            cols="12" 
            md="4" 
            v-for="resource in subscription.resources" 
            :key="resource.name"
          >
            <div class="d-flex align-center mb-2">
              <span class="text-body-2">{{ resource.name }}</span>
              <v-spacer></v-spacer>
              <span class="text-caption">
                {{ resource.used }} / {{ resource.limit }}
              </span>
            </div>
            <v-progress-linear
              :model-value="(resource.used / resource.limit) * 100"
              :color="getResourceColor(resource)"
              height="8"
              rounded
            ></v-progress-linear>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- История платежей -->
    <v-card>
      <v-card-title>
        <v-icon start color="primary">mdi-receipt</v-icon>
        История платежей
      </v-card-title>

      <v-card-text>
        <v-data-table
          :headers="paymentHeaders"
          :items="payments"
          :loading="loadingPayments"
        >
          <template v-slot:item.amount="{ item }">
            {{ formatPrice(item.amount) }}
          </template>
          <template v-slot:item.status="{ item }">
            <v-chip
              :color="getPaymentStatusColor(item.status)"
              size="small"
            >
              {{ item.status }}
            </v-chip>
          </template>
          <template v-slot:item.createdAt="{ item }">
            {{ formatDate(item.createdAt) }}
          </template>
          <template v-slot:item.actions="{ item }">
            <v-btn
              icon="mdi-download"
              variant="text"
              size="small"
              @click="downloadInvoice(item.id)"
              :loading="item.downloading"
            ></v-btn>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>

    <!-- Диалог подтверждения отмены -->
    <v-dialog v-model="confirmCancelDialog" max-width="400">
      <v-card>
        <v-card-title>Подтверждение отмены</v-card-title>
        <v-card-text>
          Вы уверены, что хотите отменить подписку? Вы потеряете доступ к премиум функциям после окончания текущего периода.
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            variant="text"
            @click="confirmCancelDialog = false"
          >
            Отмена
          </v-btn>
          <v-btn
            color="error"
            @click="cancelSubscription"
            :loading="cancelling"
          >
            Подтвердить
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Диалог улучшения плана -->
    <v-dialog v-model="upgradePlanDialog" max-width="600">
      <v-card>
        <v-card-title>Выберите новый план</v-card-title>
        <v-card-text>
          <v-row>
            <v-col
              cols="12"
              md="6"
              v-for="plan in availablePlans"
              :key="plan.id"
            >
              <v-card
                :class="{ 'selected-plan': selectedPlan?.id === plan.id }"
                @click="selectedPlan = plan"
                variant="outlined"
              >
                <v-card-title>{{ plan.name }}</v-card-title>
                <v-card-text>
                  <div class="text-h6 mb-2">
                    {{ formatPrice(plan.price) }} / месяц
                  </div>
                  <v-list density="compact">
                    <v-list-item
                      v-for="feature in plan.features"
                      :key="feature"
                      :title="feature"
                      prepend-icon="mdi-check"
                    ></v-list-item>
                  </v-list>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            variant="text"
            @click="upgradePlanDialog = false"
          >
            Отмена
          </v-btn>
          <v-btn
            color="primary"
            @click="upgradePlan"
            :disabled="!selectedPlan"
            :loading="upgrading"
          >
            Подтвердить
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import { ref, reactive, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'

export default {
  name: 'SubscriptionManager',
  
  setup() {
    const userStore = useUserStore()
    
    // Состояние
    const subscription = ref({
      plan: {
        name: '',
        price: 0
      },
      status: '',
      expiresAt: null,
      resources: []
    })
    
    const payments = ref([])
    const availablePlans = ref([])
    const selectedPlan = ref(null)
    
    // Флаги загрузки
    const loadingPayments = ref(false)
    const renewing = ref(false)
    const cancelling = ref(false)
    const upgrading = ref(false)
    
    // Диалоги
    const confirmCancelDialog = ref(false)
    const upgradePlanDialog = ref(false)

    // Заголовки таблицы платежей
    const paymentHeaders = [
      { title: 'ID', key: 'id' },
      { title: 'Дата', key: 'createdAt' },
      { title: 'Сумма', key: 'amount' },
      { title: 'Статус', key: 'status' },
      { title: 'Действия', key: 'actions', sortable: false }
    ]

    // Методы
    const loadSubscription = async () => {
      try {
        const data = await userStore.getSubscription()
        subscription.value = data
      } catch (error) {
        console.error('Failed to load subscription:', error)
      }
    }

    const loadPayments = async () => {
      loadingPayments.value = true
      try {
        const response = await api.get('/user/payments')
        payments.value = response.data
      } catch (error) {
        console.error('Failed to load payments:', error)
      } finally {
        loadingPayments.value = false
      }
    }

    const loadAvailablePlans = async () => {
      try {
        const response = await api.get('/subscription/plans')
        availablePlans.value = response.data
      } catch (error) {
        console.error('Failed to load plans:', error)
      }
    }

    const renewSubscription = async () => {
      renewing.value = true
      try {
        await userStore.updateSubscription(subscription.value.plan.id)
        await loadSubscription()
      } catch (error) {
        console.error('Failed to renew subscription:', error)
      } finally {
        renewing.value = false
      }
    }

    const cancelSubscription = async () => {
      cancelling.value = true
      try {
        await userStore.cancelSubscription()
        await loadSubscription()
        confirmCancelDialog.value = false
      } catch (error) {
        console.error('Failed to cancel subscription:', error)
      } finally {
        cancelling.value = false
      }
    }

    const upgradePlan = async () => {
      if (!selectedPlan.value) return

      upgrading.value = true
      try {
        await userStore.updateSubscription(selectedPlan.value.id)
        await loadSubscription()
        upgradePlanDialog.value = false
      } catch (error) {
        console.error('Failed to upgrade plan:', error)
      } finally {
        upgrading.value = false
      }
    }

    const downloadInvoice = async (paymentId) => {
      const payment = payments.value.find(p => p.id === paymentId)
      if (!payment) return

      payment.downloading = true
      try {
        const response = await api.get(`/user/payments/${paymentId}/invoice`, {
          responseType: 'blob'
        })
        
        const url = window.URL.createObjectURL(response.data)
        const link = document.createElement('a')
        link.href = url
        link.download = `invoice-${paymentId}.pdf`
        link.click()
        window.URL.revokeObjectURL(url)
      } catch (error) {
        console.error('Failed to download invoice:', error)
      } finally {
        payment.downloading = false
      }
    }

    // Вспомогательные методы
    const formatPrice = (price) => {
      return new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB'
      }).format(price)
    }

    const formatDate = (date) => {
      return new Date(date).toLocaleDateString('ru-RU', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    }

    const getStatusText = (status) => {
      const statuses = {
        active: 'Активна',
        cancelled: 'Отменена',
        expired: 'Истекла'
      }
      return statuses[status] || status
    }

    const getResourceColor = (resource) => {
      const usage = (resource.used / resource.limit) * 100
      if (usage >= 90) return 'error'
      if (usage >= 70) return 'warning'
      return 'success'
    }

    const getPaymentStatusColor = (status) => {
      const colors = {
        success: 'success',
        pending: 'warning',
        failed: 'error'
      }
      return colors[status] || 'grey'
    }

    // Жизненный цикл
    onMounted(() => {
      loadSubscription()
      loadPayments()
      loadAvailablePlans()
    })

    return {
      subscription,
      payments,
      availablePlans,
      selectedPlan,
      loadingPayments,
      renewing,
      cancelling,
      upgrading,
      confirmCancelDialog,
      upgradePlanDialog,
      paymentHeaders,
      renewSubscription,
      cancelSubscription,
      upgradePlan,
      downloadInvoice,
      formatPrice,
      formatDate,
      getStatusText,
      getResourceColor,
      getPaymentStatusColor
    }
  }
}
</script>

<style scoped>
.selected-plan {
  border: 2px solid var(--v-primary-base) !important;
}

.v-card.selected-plan:hover {
  border-color: var(--v-primary-darken1) !important;
}

.v-card {
  cursor: pointer;
  transition: all 0.2s ease;
}

.v-card:hover {
  transform: translateY(-2px);
}
</style> 