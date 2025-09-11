import { useDispatch } from 'react-redux'
import { createToastActions } from '@/shared/ui/toast-slice'

export const useToast = () => {
  const dispatch = useDispatch()
  return createToastActions(dispatch)
}

export default useToast
