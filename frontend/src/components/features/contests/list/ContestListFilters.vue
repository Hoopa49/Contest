<template>
  <v-row>
    <v-col cols="12" sm="6" md="4">
      <v-text-field
        v-model="filters.search"
        label="Поиск по названию"
        prepend-inner-icon="mdi-magnify"
        clearable
        autocomplete="off"
        @update:model-value="handleFilterChange"
      />
    </v-col>

    <v-col cols="12" sm="6" md="4">
      <form autocomplete="off">
        <v-select
          v-model="filters.platform_type"
          :items="platformOptions"
          item-title="title"
          item-value="value"
          label="Платформа"
          clearable
          multiple
          chips
          closable-chips
          variant="outlined"
          autocomplete="off"
          data-autocomplete="off"
          @update:model-value="handleFilterChange"
        />
      </form>
    </v-col>

    <v-col cols="12" sm="6" md="4">
      <v-select
        v-model="filters.sortBy"
        :items="sortOptions"
        item-title="title"
        item-value="value"
        label="Сортировка"
        @update:model-value="handleFilterChange"
      />
    </v-col>
  </v-row>
</template>

<script setup>
const props = defineProps({
  filters: {
    type: Object,
    required: true,
    default: () => ({
      search: '',
      platform_type: [],
      sortBy: 'created_at_desc'
    })
  }
})

const emit = defineEmits(['filter-change'])

const platformOptions = [
  { title: 'YouTube', value: 'youtube' },
  { title: 'Instagram', value: 'instagram' },
  { title: 'Telegram', value: 'telegram' },
  { title: 'VK', value: 'vk' }
]

const sortOptions = [
  { title: 'По дате создания (сначала новые)', value: 'created_at_desc' },
  { title: 'По дате создания (сначала старые)', value: 'created_at_asc' },
  { title: 'По призовому фонду (по убыванию)', value: 'prize_pool_desc' },
  { title: 'По призовому фонду (по возрастанию)', value: 'prize_pool_asc' }
]

const handleFilterChange = () => {
  emit('filter-change', { ...props.filters })
}
</script>

<style scoped>
input:-webkit-autofill,
input:-webkit-autofill:hover,
input:-webkit-autofill:focus,
input:-webkit-autofill:active {
  box-shadow: 0 0 0 30px transparent inset !important;
}
</style> 