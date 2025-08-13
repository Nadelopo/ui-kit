<script lang="ts" setup>
import { useTemplateRef, watchEffect } from 'vue'
import { useEventListener } from '@vueuse/core'
import { createModalContext } from './useModal'

const isOpened = defineModel<boolean>({
  required: true
})

const emit = defineEmits<{
  close: []
}>()

const modalRef = useTemplateRef('modalRef')

const closeModal = () => {
  modalRef.value?.close()
}

watchEffect(() => {
  if (isOpened.value) {
    modalRef.value?.showModal()
  } else {
    console.log('@effect-close')
    closeModal()
  }
})

useEventListener(modalRef, 'close', () => {
  isOpened.value = false
  emit('close')
})

createModalContext({
  close: closeModal
})
</script>

<template>
  <dialog
    ref="modalRef"
    :class="S.modal"
    @click.self="isOpened = false"
  >
    <div :class="S.modal__content">
      <slot />
    </div>
  </dialog>
</template>

<style module="S">
.modal {
  --transition-duration: 0.3s;
  padding: 0;

  border-radius: var(--border-radius-md);
  border: none;
  opacity: 0;
  transition:
    opacity var(--modal-transition-duration, var(--transition-duration)) ease,
    overlay var(--modal-transition-duration, var(--transition-duration)) ease allow-discrete,
    display var(--modal-transition-duration, var(--transition-duration)) ease allow-discrete;

  &[open] {
    opacity: 1;

    @starting-style {
      opacity: 0;
    }
  }
}

.modal::backdrop {
  background-color: transparent;
  backdrop-filter: blur(0);
  transition:
    background-color var(--modal-transition-duration, var(--transition-duration)) ease,
    backdrop-filter var(--modal-transition-duration, var(--transition-duration)) ease,
    display var(--modal-transition-duration, var(--transition-duration)) ease allow-discrete;
}

.modal[open]::backdrop {
  background-color: var(--overlay-color-background, rgba(0, 0, 0, 0.5));
  backdrop-filter: var(--overlay-backdrop-filter);
}

@starting-style {
  .modal[open]::backdrop {
    background-color: transparent;
    backdrop-filter: blur(0);
  }
}

.modal__content {
  padding: 20px;
}
</style>
