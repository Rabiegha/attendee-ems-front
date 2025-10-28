import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { Toast, ToastType } from '@/shared/ui/Toast'

interface ToastState {
  toasts: Toast[]
}

const initialState: ToastState = {
  toasts: [],
}

let toastIdCounter = 0

const toastSlice = createSlice({
  name: 'toast',
  initialState,
  reducers: {
    addToast: (state, action: PayloadAction<Omit<Toast, 'id'>>) => {
      const id = `toast-${++toastIdCounter}`
      const toast: Toast = {
        id,
        duration: 5000, // 5 secondes par défaut
        ...action.payload,
      }
      state.toasts.push(toast)
    },
    removeToast: (state, action: PayloadAction<string>) => {
      state.toasts = state.toasts.filter((toast) => toast.id !== action.payload)
    },
    clearAllToasts: (state) => {
      state.toasts = []
    },
  },
})

export const { addToast, removeToast, clearAllToasts } = toastSlice.actions
export const toastReducer = toastSlice.reducer

// Selectors
export const selectToasts = (state: { toast: ToastState }) => state.toast.toasts

// Helper functions pour simplifier l'usage
export const createToastActions = (dispatch: any) => ({
  success: (title: string, message?: string, options?: Partial<Toast>) => {
    const payload: Omit<Toast, 'id'> = {
      type: 'success' as ToastType,
      title,
      ...options,
    }
    if (message !== undefined) payload.message = message
    return dispatch(addToast(payload))
  },

  error: (title: string, message?: string, options?: Partial<Toast>) => {
    const payload: Omit<Toast, 'id'> = {
      type: 'error' as ToastType,
      title,
      ...options,
    }
    if (message !== undefined) payload.message = message
    return dispatch(addToast(payload))
  },

  warning: (title: string, message?: string, options?: Partial<Toast>) => {
    const payload: Omit<Toast, 'id'> = {
      type: 'warning' as ToastType,
      title,
      ...options,
    }
    if (message !== undefined) payload.message = message
    return dispatch(addToast(payload))
  },

  info: (title: string, message?: string, options?: Partial<Toast>) => {
    const payload: Omit<Toast, 'id'> = {
      type: 'info' as ToastType,
      title,
      ...options,
    }
    if (message !== undefined) payload.message = message
    return dispatch(addToast(payload))
  },

  remove: (id: string) => dispatch(removeToast(id)),

  clear: () => dispatch(clearAllToasts()),
})

export default toastSlice
