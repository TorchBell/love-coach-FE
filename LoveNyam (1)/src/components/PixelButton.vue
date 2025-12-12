<script setup>
defineProps({
  variant: {
    type: String,
    default: 'primary', // primary, secondary, danger
    validator: (value) => ['primary', 'secondary', 'danger'].includes(value)
  }
})

const variants = {
  primary: 'bg-vivid-red text-white hover:bg-red-600',
  secondary: 'bg-white text-dark hover:bg-gray-100',
  danger: 'bg-dark text-white hover:bg-black'
}
</script>

<template>
  <button 
    class="font-pixel px-4 py-2 border-4 border-dark shadow-[4px_4px_0px_0px_rgba(34,34,34,1)] active:shadow-none active:translate-x-[4px] active:translate-y-[4px] transition-all"
    :class="variants[variant]"
  >
    <slot></slot>
  </button>
</template>
