import { mount } from '@vue/test-utils'
import { test, expect, describe, vi, beforeEach, beforeAll } from 'vitest'
import { nextTick } from 'vue'
import Modal from './Modal.vue'
import { useModalContext } from './useModal'

const eventHandlers = new Map()

vi.mock('@vueuse/core', () => ({
  useCssVar: vi.fn(() => ({ value: '0.3' })),
  useEventListener: vi.fn((_target, event, handler) => {
    eventHandlers.set(event, handler)
  })
}))

const originalSetTimeout = globalThis.setTimeout
vi.stubGlobal(
  'setTimeout',
  vi.fn((fn) => {
    const id = Math.random()
    originalSetTimeout(() => fn(), 0)
    return id
  })
)
vi.stubGlobal('clearTimeout', vi.fn())

beforeAll(() => {
  HTMLDialogElement.prototype.show = vi.fn()
  HTMLDialogElement.prototype.showModal = vi.fn()
  HTMLDialogElement.prototype.close = vi.fn(() => {
    if (eventHandlers.has('close')) {
      eventHandlers.get('close')()
    }
  })
})

beforeEach(() => {
  vi.clearAllMocks()
  eventHandlers.clear()
})

describe('Rendering', () => {
  test('renders when modelValue is true', async () => {
    const wrapper = mount(Modal, {
      props: {
        modelValue: true
      }
    })

    await nextTick()

    const dialog = wrapper.find('dialog')
    expect(dialog.exists()).toBe(true)
    expect(dialog.classes().some((cls) => cls.includes('modal'))).toBe(true)
  })

  test('does not render when modelValue is false', async () => {
    const wrapper = mount(Modal, {
      props: {
        modelValue: false
      }
    })

    await nextTick()

    const dialog = wrapper.find('dialog')
    expect(dialog.exists()).toBe(false)
  })

  test('applies full_screen class when fullScreen prop is true', async () => {
    const wrapper = mount(Modal, {
      props: {
        modelValue: true,
        fullScreen: true
      }
    })

    await nextTick()

    const dialog = wrapper.find('dialog')
    expect(dialog.classes().some((cls) => cls.includes('full_screen'))).toBe(true)
  })

  describe('Slots', () => {
    test('renders default slot content', async () => {
      const wrapper = mount(Modal, {
        props: {
          modelValue: true
        },
        slots: {
          default: '<p>Modal content</p>'
        }
      })

      await nextTick()

      expect(wrapper.text()).toContain('Modal content')
    })

    test('renders title slot when provided', async () => {
      const wrapper = mount(Modal, {
        props: {
          modelValue: true
        },
        slots: {
          title: 'Modal Title',
          default: '<p>Modal content</p>'
        }
      })

      await nextTick()

      const title = wrapper.find('h2')
      expect(title.exists()).toBe(true)
      expect(title.text()).toBe('Modal Title')
      expect(title.classes().some((cls) => cls.includes('title'))).toBe(true)
    })

    test('does not render title element when title slot is not provided', async () => {
      const wrapper = mount(Modal, {
        props: {
          modelValue: true
        },
        slots: {
          default: '<p>Modal content</p>'
        }
      })

      await nextTick()

      const title = wrapper.find('h2')
      expect(title.exists()).toBe(false)
    })
  })
})

describe('Interactions and Events', () => {
  test('emits events when closed programmatically via closeModal', async () => {
    const wrapper = mount(Modal, {
      props: {
        modelValue: true
      }
    })

    await nextTick()

    const vm = wrapper.vm as any
    vm.closeModal()

    await nextTick()

    expect(wrapper.emitted('close')).toBeTruthy()
    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    expect(wrapper.emitted('update:modelValue')![0]).toEqual([false])
  })

  test('closes and emits events on outside click when closeOnClickOutside is true', async () => {
    const wrapper = mount(Modal, {
      props: {
        modelValue: true,
        closeOnClickOutside: true
      }
    })

    await nextTick()

    const dialog = wrapper.find('dialog')
    await dialog.trigger('click.self')

    expect(wrapper.emitted('close')).toBeTruthy()
    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    expect(wrapper.emitted('update:modelValue')![0]).toEqual([false])
  })

  test('does not close on outside click when closeOnClickOutside is false', async () => {
    const wrapper = mount(Modal, {
      props: {
        modelValue: true,
        closeOnClickOutside: false
      }
    })

    await nextTick()

    const dialog = wrapper.find('dialog')
    await dialog.trigger('click.self')

    expect(wrapper.emitted('update:modelValue')).toBeFalsy()
  })

  test('does not close when clicking on content', async () => {
    const wrapper = mount(Modal, {
      props: {
        modelValue: true,
        closeOnClickOutside: true
      }
    })

    await nextTick()

    const content = wrapper.find('[class*="content"]')
    await content.trigger('click')

    expect(wrapper.emitted('update:modelValue')).toBeFalsy()
  })
})

describe('Reactivity and Props', () => {
  test('shows modal when modelValue changes from false to true', async () => {
    const wrapper = mount(Modal, {
      props: {
        modelValue: false
      }
    })

    await nextTick()
    expect(wrapper.find('dialog').exists()).toBe(false)

    await wrapper.setProps({ modelValue: true })
    await nextTick()

    expect(wrapper.find('dialog').exists()).toBe(true)
  })

  test('hides modal and emits transitionEnd when modelValue changes from true to false', async () => {
    const wrapper = mount(Modal, {
      props: {
        modelValue: true
      }
    })

    await nextTick()
    expect(wrapper.find('dialog').exists()).toBe(true)

    await wrapper.setProps({ modelValue: false })
    await nextTick()

    expect(wrapper.find('dialog').exists()).toBe(true)

    await new Promise((resolve) => setTimeout(resolve, 50))
    expect(wrapper.emitted('transitionEnd')).toBeTruthy()
  })

  describe('Default Prop Values', () => {
    test('closeOnClickOutside defaults to true, allowing close on outside click', async () => {
      const wrapper = mount(Modal, {
        props: {
          modelValue: true
        }
      })

      await nextTick()

      const dialog = wrapper.find('dialog')
      await dialog.trigger('click.self')

      expect(wrapper.emitted('close')).toBeTruthy()
      expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    })

    test('fullScreen defaults to false', async () => {
      const wrapper = mount(Modal, {
        props: {
          modelValue: true
        }
      })

      await nextTick()

      const dialog = wrapper.find('dialog')
      expect(dialog.classes().some((cls) => cls.includes('full_screen'))).toBe(false)
    })
  })
})

describe('Context', () => {
  test('provides modal context with a close function', async () => {
    let modalContext: any = null

    const ChildComponent = {
      setup() {
        modalContext = useModalContext()
        return {}
      },
      template: '<div>Child</div>'
    }

    mount(Modal, {
      props: {
        modelValue: true
      },
      slots: {
        default: ChildComponent
      }
    })

    await nextTick()

    expect(modalContext).toBeTruthy()
    expect(typeof modalContext.close).toBe('function')
  })

  test('closes and emits events when context close function is used', async () => {
    let modalContext: any = null

    const ChildComponent = {
      setup() {
        modalContext = useModalContext()
        return { modalContext }
      },
      template: '<button @click="modalContext.close()">Close</button>'
    }

    const wrapper = mount(Modal, {
      props: {
        modelValue: true
      },
      slots: {
        default: ChildComponent
      }
    })

    await nextTick()

    const button = wrapper.find('button')
    await button.trigger('click')

    expect(wrapper.emitted('close')).toBeTruthy()
    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    expect(wrapper.emitted('update:modelValue')![0]).toEqual([false])
  })
})

describe('Native Dialog Methods', () => {
  test('calls showModal when opened', async () => {
    const wrapper = mount(Modal, {
      props: {
        modelValue: false
      }
    })

    await wrapper.setProps({ modelValue: true })
    await nextTick()

    const dialog = wrapper.find('dialog')
    expect(dialog.exists()).toBe(true)
    expect(HTMLDialogElement.prototype.showModal).toHaveBeenCalled()
  })

  test('calls close when modal is closed', async () => {
    const wrapper = mount(Modal, {
      props: {
        modelValue: true
      }
    })

    await nextTick()

    const vm = wrapper.vm as any
    vm.closeModal()
    await nextTick()

    expect(HTMLDialogElement.prototype.close).toHaveBeenCalled()
  })
})
