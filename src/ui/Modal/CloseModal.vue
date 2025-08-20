<script setup lang="ts">
import { X } from 'lucide-vue-next'
import { useModalContext } from './useModal'

const { close } = useModalContext()
</script>

<template>
  <button
    :class="S.close"
    @click="close"
  >
    <X />
  </button>
</template>

<style module="S">
.close {
  right: 6px;
  display: flex;
  background: transparent;
  border: none;
  transition: background 0.3s ease;
  padding: 4px;
  border-radius: var(--border-radius-md);
  color: var(--gray);
  margin-left: auto;
  &:hover {
    background: var(--light-gray);
  }
}
</style>
