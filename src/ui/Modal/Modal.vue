<script lang="ts" setup>
import { onWatcherCleanup, ref, useSlots, useTemplateRef, watch, watchEffect } from 'vue'
import { useCssVar, useEventListener } from '@vueuse/core'
import { createModalContext } from './useModal'

type ModalProps = {
  fullScreen?: boolean
  closeOnClickOutside?: boolean
}

withDefaults(defineProps<ModalProps>(), {
  closeOnClickOutside: true
})

const isOpened = defineModel<boolean>({
  required: true
})

const emit = defineEmits<{
  close: []
  transitionEnd: []
}>()

const slots = useSlots()

const modalRef = useTemplateRef('modalRef')

const transitionDurationVariable = useCssVar('--transition-duration', modalRef)

const isVisible = ref(isOpened.value)

watch(isOpened, (value) => {
  let timeout = 0

  if (value) {
    isVisible.value = true
  } else {
    const duration = parseFloat(transitionDurationVariable.value ?? '0') * 1000
    timeout = window.setTimeout(() => {
      isVisible.value = false
      emit('transitionEnd')
    }, duration)
  }

  onWatcherCleanup(() => {
    clearTimeout(timeout)
  })
})

const closeModal = () => {
  modalRef.value?.close()
}

watchEffect(() => {
  if (isOpened.value) {
    modalRef.value?.showModal()
  } else if (modalRef.value?.open) {
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
    v-if="isVisible"
    ref="modalRef"
    :class="[S.modal, fullScreen && S.full_screen]"
    @click.self="closeOnClickOutside && closeModal()"
  >
    <div :class="S.content">
      <h2
        v-if="slots.title"
        :class="S.title"
      >
        <slot name="title" />
      </h2>
      <slot />
    </div>
  </dialog>
</template>

<style module="S">
.modal {
  --transition-duration: var(--modal-transition-duration, 0.3s);
  padding: 0;

  border-radius: var(--modal-border-radius, var(--border-radius-md));
  border: none;
  opacity: 0;
  transition:
    opacity var(--transition-duration) ease,
    overlay var(--transition-duration) ease allow-discrete,
    display var(--transition-duration) ease allow-discrete;

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
    background-color var(--transition-duration) ease,
    backdrop-filter var(--transition-duration) ease,
    display var(--transition-duration) ease allow-discrete;
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

.content {
  padding: var(--modal-content-padding, 20px);
  height: 100%;
}

.full_screen {
  width: 100%;
  height: 100%;
  max-width: 100%;
  max-height: 100%;
  border-radius: 0;
}

.title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 16px;
}
</style>
