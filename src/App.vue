<script setup vapor lang="ts">
import { ref } from 'vue'
import Modal from './ui/Modal/Modal.vue'
import Test from './Test.vue'

const isOpen = ref(false)
const isOpen2 = ref(false)
</script>

<template>
  <div style="padding: 20px">
    <button
      class="btn"
      @click="isOpen = true"
    >
      open modal
    </button>
    <button
      class="btn"
      @click="isOpen = false"
    >
      close modal
    </button>
  </div>

  <Modal
    v-model="isOpen"
    :class="S.modal"
    @close="console.log('close1')"
    @transition-end="console.log('transition-end')"
  >
    <template #title> title </template>
    <Test />
    <div>1</div>
    <button @click="isOpen2 = true">open modal 2</button>
    <button
      class="btn"
      @click="isOpen = false"
    >
      close modal
    </button>
    <!-- <Modal
      v-model="isOpen2"
      @close="console.log('close2')"
    >
      <div>1</div>
    </Modal> -->
  </Modal>
</template>

<style module="S">
.modal {
}
</style>
