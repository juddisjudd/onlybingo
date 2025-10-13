<script setup lang="ts">
import { computed } from 'vue'
import { cn } from '~/lib/utils'
import type { HTMLAttributes } from 'vue'

interface Props {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  class?: HTMLAttributes['class']
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
  size: 'default',
})

const buttonClass = computed(() => cn(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-95 shadow-lg hover:shadow-xl',
  {
    'default': 'bg-primary text-primary-foreground hover:bg-primary/90',
    'destructive': 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
    'outline': 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
    'secondary': 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
    'ghost': 'hover:bg-accent hover:text-accent-foreground shadow-none hover:shadow-none',
    'link': 'text-primary underline-offset-4 hover:underline shadow-none hover:shadow-none',
  }[props.variant],
  {
    'default': 'h-10 px-6 py-2',
    'sm': 'h-8 rounded-lg px-3 text-xs',
    'lg': 'h-12 rounded-xl px-8',
    'icon': 'h-10 w-10',
  }[props.size],
  props.class,
))
</script>

<template>
  <button :class="buttonClass">
    <slot />
  </button>
</template>
