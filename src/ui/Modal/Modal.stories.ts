import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'
import { fn } from 'storybook/test'
import Modal from './Modal.vue'

const ModalWrapper = (args: any, content: string, titleSlot?: string) => ({
  components: { Modal },
  setup() {
    const isOpen = ref(false)

    const openModal = () => {
      isOpen.value = true
    }

    const closeModal = () => {
      isOpen.value = false
      args.onClose?.()
    }

    return {
      args,
      isOpen,
      openModal,
      closeModal,
      content,
      titleSlot
    }
  },
  template: `
    <div>
      <button @click="openModal" style="padding: 8px 16px; background: #007acc; color: white; border: none; border-radius: 4px;">
        Open Modal
      </button>
      
      <Modal 
        v-model="isOpen"
        :fullScreen="args.fullScreen"
        :closeOnClickOutside="args.closeOnClickOutside"
        @close="closeModal"
        @transitionEnd="args.onTransitionEnd"
      >
        <template v-if="titleSlot" #title>{{ titleSlot }}</template>
        {{ content }}
      </Modal>
    </div>
  `
})

const meta = {
  title: 'UI/Modal',
  component: Modal,
  tags: ['autodocs'],
  argTypes: {
    fullScreen: { control: 'boolean' },
    closeOnClickOutside: { control: 'boolean' },
    modelValue: { control: false }
  },
  args: {
    closeOnClickOutside: true,
    modelValue: false,
    onClose: fn(),
    onTransitionEnd: fn()
  }
} satisfies Meta<typeof Modal>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    fullScreen: false,
    closeOnClickOutside: true
  },
  render: (args) => ModalWrapper(args, 'Default modal content')
}

export const FullScreen: Story = {
  args: {
    fullScreen: true,
    closeOnClickOutside: true
  },
  render: (args) => ModalWrapper(args, 'Full screen modal content')
}

export const NoOutsideClose: Story = {
  args: {
    fullScreen: false,
    closeOnClickOutside: false
  },
  render: (args) => ModalWrapper(args, 'Modal that cannot be closed by clicking outside')
}

export const WithTitle: Story = {
  args: {
    fullScreen: false,
    closeOnClickOutside: true
  },
  render: (args) => ModalWrapper(args, 'Modal content with title slot', 'Modal Title')
}
