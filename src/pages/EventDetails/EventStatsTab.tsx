import React, { useMemo, useEffect } from 'react'
import { useGetRegistrationsQuery } from '@/features/registrations/api/registrationsApi'
import { useGetEventAttendeeTypesQuery } from '@/features/events/api/eventsApi'
import { EChartsWrapper } from '@/components/charts/EChartsWrapper'
import type { EChartsOption } from 'echarts'
import { format, parseISO, isValid, startOfDay } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Users, TrendingUp, UserCheck, Activity } from 'lucide-react'
import type { Event } from '@/features/events/types'

interface EventStatsTabProps {
  event: Event
}

interface Registration {
  id: string
  eventAttendeeTypeId?: string | null
  eventAttendeeType?: {
    id: string
    attendeeType: {
      id: string
      name: string
      color_hex: string
    }
  } | null
  status: string
  checkedInAt?: string | null
  checkedOutAt?: string | null
  createdAt: string
  source?: string | null
}

interface CheckInOutEvent {
  timestamp: Date
  type: 'in' | 'out'
}

export const EventStatsTab: React.FC<EventStatsTabProps> = ({ event }) => {
  // Fetch registrations avec RTK Query
  const { data: registrationsData, isLoading: isLoadingRegistrations } = useGetRegistrationsQuery({
    eventId: event.id,
    page: 1,
    limit: 10000,
  })

  // Fetch attendee types avec RTK Query
  const { data: attendeeTypesData, isLoading: isLoadingTypes } = useGetEventAttendeeTypesQuery(event.id)

  const registrations = registrationsData?.data || []
  const attendeeTypes = attendeeTypesData || []
  const loading = isLoadingRegistrations || isLoadingTypes

  useEffect(() => {
    if (!loading) {
      console.log('📊 Registrations loaded:', registrations.length)
      console.log('🏷️ Attendee types loaded:', attendeeTypes.length)
      if (registrations.length > 0) {
        console.log('📋 Sample registration:', registrations[0])
      }
    }
  }, [loading, registrations.length, attendeeTypes.length])

  // 1. Distribution par type de participant (approuvés uniquement)
  const pieChartOption: EChartsOption = useMemo(() => {
    const approvedRegs = registrations.filter((r) => r.status === 'approved')
    const typeCounts: Record<string, { count: number; name: string; color: string }> = {}

    approvedRegs.forEach((reg) => {
      let typeId = 'unknown'
      let typeName = 'Sans type'
      let typeColor = '#94a3b8'

      if (reg.eventAttendeeType?.attendeeType) {
        typeId = reg.eventAttendeeType.attendeeType.id
        typeName = reg.eventAttendeeType.attendeeType.name
        typeColor = reg.eventAttendeeType.attendeeType.color_hex || '#94a3b8'
      } else if (reg.eventAttendeeTypeId) {
        const eventType = attendeeTypes.find((t) => t.id === reg.eventAttendeeTypeId)
        if (eventType?.attendeeType) {
          typeId = eventType.attendeeType.id
          typeName = eventType.attendeeType.name
          typeColor = eventType.attendeeType.color_hex || '#94a3b8'
        }
      }

      if (!typeCounts[typeId]) {
        typeCounts[typeId] = { count: 0, name: typeName, color: typeColor }
      }
      typeCounts[typeId]!.count++
    })

    const pieData = Object.values(typeCounts).map((typeData) => ({
      value: typeData.count,
      name: typeData.name,
      itemStyle: { color: typeData.color },
    }))

    return {
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c} participants ({d}%)',
      },
      legend: {
        orient: 'vertical',
        right: 10,
        top: 'center',
        formatter: (name: string) => {
          const item = pieData.find((d) => d.name === name)
          return `${name}: ${item?.value || 0}`
        },
      },
      series: [
        {
          type: 'pie',
          radius: ['40%', '70%'],
          padAngle: 3, // Feature from ECharts 6.0.0
          itemStyle: {
            borderRadius: 8,
          },
          label: {
            show: true,
            formatter: '{c}',
            position: 'inside',
            fontSize: 14,
            fontWeight: 'bold',
            color: '#fff',
          },
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)',
            },
          },
          data: pieData,
        },
      ],
    }
  }, [registrations, attendeeTypes])

  // 2. Évolution des inscriptions dans le temps (par jour)
  const registrationTimelineOption: EChartsOption = useMemo(() => {
    const timelineMap: Record<number, number> = {} // timestamp -> count

    registrations.forEach((reg) => {
      if (!reg.createdAt) return
      const date = parseISO(reg.createdAt)
      if (!isValid(date)) return

      const dayStart = startOfDay(date)
      const timestamp = dayStart.getTime()

      timelineMap[timestamp] = (timelineMap[timestamp] || 0) + 1
    })

    // Convertir en format [timestamp, valeur] pour axe temporel et trier
    const data = Object.entries(timelineMap)
      .map(([timestamp, count]) => [Number(timestamp), count] as [number, number])
      .sort((a, b) => a[0] - b[0])

    return {
      tooltip: {
        trigger: 'axis',
        formatter: (params: any) => {
          const param = params[0]
          const date = new Date(param.value[0])
          const dateStr = format(date, 'dd MMM yyyy', { locale: fr })
          return `${dateStr}<br/>${param.seriesName}: ${param.value[1]} inscriptions`
        },
      },
      xAxis: {
        type: 'time',
        boundaryGap: false,
        axisLabel: {
          rotate: 45,
          formatter: (value: number) => {
            return format(new Date(value), 'dd MMM', { locale: fr })
          },
        },
      },
      yAxis: {
        type: 'value',
        name: 'Inscriptions',
        min: 0,
      },
      dataZoom: [
        {
          type: 'inside',
          start: 0,
          end: 100,
        },
        {
          type: 'slider',
          start: 0,
          end: 100,
          height: 30,
          bottom: 5,
        },
      ],
      series: [
        {
          name: 'Inscriptions',
          type: 'line',
          data: data,
          smooth: true,
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(59, 130, 246, 0.3)' },
                { offset: 1, color: 'rgba(59, 130, 246, 0.05)' },
              ],
            },
          },
          lineStyle: {
            color: '#3B82F6',
            width: 3,
          },
          itemStyle: {
            color: '#3B82F6',
          },
        },
      ],
      grid: {
        left: 60,
        right: 20,
        top: 20,
        bottom: 85,
      },
    }
  }, [registrations])

  // 3. % de check-in
  const checkInRate = useMemo(() => {
    const approvedRegs = registrations.filter((r) => r.status === 'approved')
    if (approvedRegs.length === 0) return 0

    const checkedIn = approvedRegs.filter((r) => !!r.checkedInAt).length

    return Math.round((checkedIn / approvedRegs.length) * 100)
  }, [registrations])

  // 4. Présence sur place (check-in/check-out) - Intraday Chart with Breaks
  const presenceOverTimeOption: EChartsOption = useMemo(() => {
    // Collecter tous les événements check-in et check-out
    const events: CheckInOutEvent[] = []

    registrations.forEach((reg) => {
      if (reg.checkedInAt) {
        const date = parseISO(reg.checkedInAt)
        if (isValid(date)) {
          events.push({ timestamp: date, type: 'in' })
        }
      }
      if (reg.checkedOutAt) {
        const date = parseISO(reg.checkedOutAt)
        if (isValid(date)) {
          events.push({ timestamp: date, type: 'out' })
        }
      }
    })

    // Si pas d'événements, retourner vide
    if (events.length === 0) {
      return {
        title: {
          text: 'Aucune donnée de présence disponible',
          left: 'center',
          top: 'center',
          textStyle: { color: '#9ca3af', fontSize: 14 },
        },
      }
    }

    // Trier par timestamp
    events.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())

    // Construire les données au format [timestamp, valeur]
    const presenceData: [number, number][] = []

    let currentCount = 0
    events.forEach((evt) => {
      if (evt.type === 'in') {
        currentCount++
      } else if (evt.type === 'out' && currentCount > 0) {
        currentCount--
      }

      presenceData.push([evt.timestamp.getTime(), currentCount])
    })

    return {
      tooltip: {
        trigger: 'axis',
        formatter: (params: any) => {
          const param = params[0]
          const date = new Date(param.value[0])
          const dateStr = format(date, 'dd MMM HH:mm', { locale: fr })
          return `${dateStr}<br/>${param.seriesName}: ${param.value[1]} personnes`
        },
      },
      xAxis: {
        type: 'time',
        boundaryGap: false,
        axisLabel: {
          rotate: 45,
          formatter: (value: number) => {
            const date = new Date(value)
            const day = format(date, 'dd MMM', { locale: fr })
            const time = format(date, 'HH:mm', { locale: fr })
            return `${day}\n${time}`
          },
        },
      },
      yAxis: {
        type: 'value',
        name: 'Présents',
        min: 0,
      },
      dataZoom: [
        {
          type: 'inside',
          start: 0,
          end: 100,
        },
        {
          type: 'slider',
          start: 0,
          end: 100,
          height: 30,
          bottom: 5,
        },
      ],
      series: [
        {
          name: 'Personnes présentes',
          type: 'line',
          data: presenceData,
          smooth: true,
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(16, 185, 129, 0.3)' },
                { offset: 1, color: 'rgba(16, 185, 129, 0.05)' },
              ],
            },
          },
          lineStyle: {
            color: '#10B981',
            width: 3,
          },
          itemStyle: {
            color: '#10B981',
          },
        },
      ],
      grid: {
        left: 60,
        right: 20,
        top: 20,
        bottom: 85,
      },
    }
  }, [registrations])

  // 5. Répartition par source d'inscription (Bar Chart horizontal)
  const sourceDistributionOption: EChartsOption = useMemo(() => {
    const sourceCounts: Record<string, number> = {}

    registrations.forEach((reg) => {
      const source = reg.source || 'Non spécifié'
      sourceCounts[source] = (sourceCounts[source] || 0) + 1
    })

    // Trier par nombre d'inscriptions (du plus grand au plus petit)
    const sortedSources = Object.entries(sourceCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10) // Top 10 sources

    const sourceNames = sortedSources.map(([name]) => name)
    const sourceCounts_data = sortedSources.map(([, count]) => count)

    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow',
        },
        formatter: (params: any) => {
          const param = params[0]
          return `${param.name}<br/>${param.seriesName}: ${param.value} inscriptions`
        },
      },
      xAxis: {
        type: 'value',
        name: 'Inscriptions',
        min: 0,
      },
      yAxis: {
        type: 'category',
        data: sourceNames,
        axisLabel: {
          interval: 0,
          width: 120,
          overflow: 'truncate',
        },
      },
      grid: {
        left: 140,
        right: 40,
        top: 20,
        bottom: 40,
      },
      series: [
        {
          name: 'Inscriptions',
          type: 'bar',
          data: sourceCounts_data,
          itemStyle: {
            color: '#8B5CF6',
          },
          label: {
            show: true,
            position: 'right',
            formatter: '{c}',
          },
          barMaxWidth: 40,
        },
      ],
    }
  }, [registrations])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const totalRegistrations = registrations.length
  const approvedCount = registrations.filter((r) => r.status === 'approved').length
  const checkedInCount = registrations.filter((r) => !!r.checkedInAt).length

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Total inscriptions</p>
              <p className="text-3xl font-bold mt-1">{totalRegistrations}</p>
            </div>
            <Users className="h-12 w-12 text-blue-200 opacity-80" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Approuvés</p>
              <p className="text-3xl font-bold mt-1">{approvedCount}</p>
            </div>
            <TrendingUp className="h-12 w-12 text-green-200 opacity-80" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Check-in effectués</p>
              <p className="text-3xl font-bold mt-1">{checkedInCount}</p>
            </div>
            <UserCheck className="h-12 w-12 text-purple-200 opacity-80" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-amber-100 text-sm font-medium">Taux de présence</p>
              <p className="text-3xl font-bold mt-1">{checkInRate}%</p>
            </div>
            <Activity className="h-12 w-12 text-amber-200 opacity-80" />
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distribution par type */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Distribution par type de participant
          </h3>
          <div className="h-[350px]">
            <EChartsWrapper option={pieChartOption} />
          </div>
        </div>

        {/* Évolution des inscriptions */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Évolution des inscriptions
          </h3>
          <div className="h-[400px]">
            <EChartsWrapper option={registrationTimelineOption} />
          </div>
        </div>

        {/* Présence sur place */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 lg:col-span-2">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Présence sur place (Check-in/Check-out)
          </h3>
          <div className="h-[400px]">
            <EChartsWrapper option={presenceOverTimeOption} />
          </div>
        </div>

        {/* Répartition par source d'inscription */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Provenance des inscriptions
          </h3>
          <div className="h-[400px]">
            <EChartsWrapper option={sourceDistributionOption} />
          </div>
        </div>
      </div>
    </div>
  )
}
