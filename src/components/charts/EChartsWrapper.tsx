import { useThemeContext } from '@/app/providers/theme-provider'
import ReactECharts from 'echarts-for-react'
import type { EChartsOption } from 'echarts'
import { useMemo } from 'react'

interface EChartsWrapperProps {
  option: EChartsOption
  style?: React.CSSProperties
  onEvents?: Record<string, (params: any) => void>
}

export const EChartsWrapper: React.FC<EChartsWrapperProps> = ({ option, style, onEvents }) => {
  const { isDark } = useThemeContext()

  const mergedOption = useMemo(() => {
    // Merge user option with dark mode theme
    const baseOption: EChartsOption = {
      ...option,
      backgroundColor: 'transparent',
      textStyle: {
        color: isDark ? '#e5e7eb' : '#1f2937',
      },
    }

    return baseOption
  }, [option, isDark])

  return (
    <ReactECharts
      option={mergedOption}
      style={{ height: '100%', width: '100%', ...style }}
      theme={isDark ? 'dark' : ''}
      {...(onEvents && { onEvents })}
      notMerge={true}
      lazyUpdate={true}
    />
  )
}
