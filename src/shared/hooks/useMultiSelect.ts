import { useState, useCallback, useMemo } from 'react'

interface UseMultiSelectOptions {
  items: any[]
  getItemId: (item: any) => string
  onSelectionChange?: (selectedIds: Set<string>) => void
}

interface UseMultiSelectReturn {
  selectedIds: Set<string>
  isSelected: (id: string) => boolean
  isAllSelected: boolean
  isIndeterminate: boolean
  selectItem: (id: string) => void
  unselectItem: (id: string) => void
  toggleItem: (id: string) => void
  selectAll: () => void
  unselectAll: () => void
  toggleAll: () => void
  selectedCount: number
  selectedItems: any[]
}

/**
 * Hook pour gérer la sélection multiple d'éléments dans un tableau
 */
export const useMultiSelect = ({
  items,
  getItemId,
  onSelectionChange,
}: UseMultiSelectOptions): UseMultiSelectReturn => {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  const handleSelectionChange = useCallback(
    (newSelectedIds: Set<string>) => {
      setSelectedIds(newSelectedIds)
      onSelectionChange?.(newSelectedIds)
    },
    [onSelectionChange]
  )

  const selectItem = useCallback(
    (id: string) => {
      const newSelectedIds = new Set(selectedIds)
      newSelectedIds.add(id)
      handleSelectionChange(newSelectedIds)
    },
    [selectedIds, handleSelectionChange]
  )

  const unselectItem = useCallback(
    (id: string) => {
      const newSelectedIds = new Set(selectedIds)
      newSelectedIds.delete(id)
      handleSelectionChange(newSelectedIds)
    },
    [selectedIds, handleSelectionChange]
  )

  const toggleItem = useCallback(
    (id: string) => {
      if (selectedIds.has(id)) {
        unselectItem(id)
      } else {
        selectItem(id)
      }
    },
    [selectedIds, selectItem, unselectItem]
  )

  const selectAll = useCallback(() => {
    const allIds = new Set(items.map(getItemId))
    handleSelectionChange(allIds)
  }, [items, getItemId, handleSelectionChange])

  const unselectAll = useCallback(() => {
    handleSelectionChange(new Set())
  }, [handleSelectionChange])

  const toggleAll = useCallback(() => {
    if (selectedIds.size === items.length) {
      unselectAll()
    } else {
      selectAll()
    }
  }, [selectedIds.size, items.length, selectAll, unselectAll])

  const isSelected = useCallback(
    (id: string) => {
      return selectedIds.has(id)
    },
    [selectedIds]
  )

  const isAllSelected = useMemo(() => {
    return items.length > 0 && selectedIds.size === items.length
  }, [items.length, selectedIds.size])

  const isIndeterminate = useMemo(() => {
    return selectedIds.size > 0 && selectedIds.size < items.length
  }, [selectedIds.size, items.length])

  const selectedCount = selectedIds.size

  const selectedItems = useMemo(() => {
    return items.filter((item) => selectedIds.has(getItemId(item)))
  }, [items, selectedIds, getItemId])

  return {
    selectedIds,
    isSelected,
    isAllSelected,
    isIndeterminate,
    selectItem,
    unselectItem,
    toggleItem,
    selectAll,
    unselectAll,
    toggleAll,
    selectedCount,
    selectedItems,
  }
}
