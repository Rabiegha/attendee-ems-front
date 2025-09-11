import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { ToastContainer } from '@/shared/ui/Toast'
import { selectToasts, removeToast } from '@/shared/ui/toast-slice'

export const ToastProvider: React.FC = () => {
  const toasts = useSelector(selectToasts)
  const dispatch = useDispatch()

  const handleRemoveToast = (id: string) => {
    dispatch(removeToast(id))
  }

  return (
    <ToastContainer
      toasts={toasts}
      onRemove={handleRemoveToast}
    />
  )
}

export default ToastProvider
