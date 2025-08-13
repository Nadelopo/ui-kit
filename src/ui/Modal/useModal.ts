import { inject, provide, type InjectionKey } from 'vue'

const MODAL_CONTENT_KEY: InjectionKey<ModalContent> = Symbol('MODAL_CONTENT_KEY')

type ModalContent = {
  close: () => void
}

export const createModalContext = (options: ModalContent) => {
  const modalContext: ModalContent = {
    ...options
  }

  provide(MODAL_CONTENT_KEY, modalContext)

  return modalContext
}

export const useModalContext = () => {
  const modalContext = inject(MODAL_CONTENT_KEY)

  if (!modalContext) {
    throw new Error('useModalContext must be used within a ModalProvider')
  }

  return modalContext
}
