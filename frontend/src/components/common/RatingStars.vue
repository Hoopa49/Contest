<template>
  <div class="rating-stars">
    <v-rating
      v-model="localRating"
      :readonly="readonly"
      :hover="!readonly"
      :length="5"
      color="warning"
      density="comfortable"
      half-increments
      @update:model-value="handleRatingChange"
    >
      <template v-slot:item="props">
        <v-icon
          :size="size"
          :color="props.isFilled ? 'warning' : 'grey-lighten-1'"
          :class="{ 'rating-star-hover': !readonly && props.isHovered }"
        >
          {{ props.isFilled ? 'mdi-star' : 'mdi-star-outline' }}
        </v-icon>
      </template>
    </v-rating>
    
    <span v-if="showValue" class="text-body-2 ml-2">
      {{ localRating.toFixed(1) }}
    </span>
  </div>
</template>

<script>
export default {
  name: 'RatingStars',
  
  props: {
    modelValue: {
      type: Number,
      default: 0
    },
    readonly: {
      type: Boolean,
      default: false
    },
    size: {
      type: String,
      default: 'small'
    },
    showValue: {
      type: Boolean,
      default: true
    }
  },

  data() {
    return {
      localRating: this.modelValue
    }
  },

  watch: {
    modelValue(newValue) {
      this.localRating = newValue
    }
  },

  methods: {
    handleRatingChange(value) {
      this.$emit('update:modelValue', value)
      this.$emit('change', value)
    }
  }
}
</script>

<style scoped>
.rating-stars {
  display: inline-flex;
  align-items: center;
}

.rating-star-hover {
  transform: scale(1.2);
  transition: transform 0.2s ease;
}
</style> 