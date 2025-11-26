<script setup lang="ts">
import { computed } from 'vue'
import { Primitive } from 'reka-ui'
import { cn } from '~/lib/utils'
import type { HTMLAttributes } from 'vue'
import type { PrimitiveProps } from 'reka-ui'

interface Props extends PrimitiveProps {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  class?: HTMLAttributes['class']
}

const props = withDefaults(defineProps<Props>(), {
  as: 'button',
  variant: 'default',
  size: 'default',
})

const buttonClass = computed(() => cn(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium !cursor-pointer transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 active:scale-95',
  {
    'default': 'bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 hover:shadow-xl',
    'destructive': 'bg-destructive text-destructive-foreground shadow-lg hover:bg-destructive/90 hover:shadow-xl',
    'outline': 'border border-zinc-700 bg-zinc-800/50 text-foreground hover:bg-zinc-700/50 hover:border-zinc-600',
    'secondary': 'bg-secondary text-secondary-foreground shadow-lg hover:bg-secondary/80 hover:shadow-xl',
    'ghost': 'hover:bg-accent hover:text-accent-foreground',
    'link': 'text-primary underline-offset-4 hover:underline',
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
  <Primitive :as="as" :as-child="asChild" :class="buttonClass">
    <slot />
  </Primitive>
</template>
