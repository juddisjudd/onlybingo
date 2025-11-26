<script setup lang="ts">
import { Primitive } from 'reka-ui'
import { cn } from '~/lib/utils'
import type { HTMLAttributes } from 'vue'
import type { PrimitiveProps } from 'reka-ui'

interface Props extends PrimitiveProps {
  class?: HTMLAttributes['class']
}

const props = withDefaults(defineProps<Props>(), {
  as: 'div',
})
</script>

<template>
  <Primitive
    :as="as"
    :as-child="asChild"
    :class="cn('rounded-xl border border-zinc-800 bg-zinc-900/50 text-card-foreground backdrop-blur-sm', props.class)"
  >
    <slot />
  </Primitive>
</template>
