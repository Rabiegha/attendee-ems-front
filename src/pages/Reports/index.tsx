import React, { useMemo, useEffect, useState } from 'react'
import { useGetEventsQuery } from '@/features/events/api/eventsApi'
import { useGetAttendeesQuery } from '@/features/attendees/api/attendeesApi'
import { useSelector } from 'react-redux'
import { selectToken } from '@/features/auth/model/sessionSlice'
import { PageContainer, PageHeader, Card, CardContent } from '@/shared/ui'
import { EChartsWrapper } from '@/components/charts/EChartsWrapper'
import type { EChartsOption } from 'echarts'
import { format, subDays } from 'date-fns'
import { fr } from 'date-fns/locale'
import {
  TrendingUp,
  Users,
  Calendar,
  FileText,
  Activity,
} from 'lucide-react'

export const ReportsPage: React.FC = () => {
  const token = useSelector(selectToken)
  
  const [checkInData, setCheckInData] = useState<{
    eventNames: string[]
    checkInRates: number[]
    avgCheckInRate: number
  }>({ eventNames: [], checkInRates: [], avgCheckInRate: 0 })

  // Fetch all events
  const { data: eventsResponse, isLoading: eventsLoading } = useGetEventsQuery({
    limit: 10000,
  })
  const events = eventsResponse?.data || []

  // Fetch all attendees with pagination info
  const {
    data: attendeesResponse,
    isLoading: attendeesLoading,
  } = useGetAttendeesQuery({
    page: 1,
    pageSize: 10000,
  })

  const attendees = attendeesResponse?.data || []
  const totalAttendees = attendeesResponse?.meta?.total || attendees.length

  // Fetch registrations for all events and calculate check-in rates
  useEffect(() => {
    const fetchCheckInData = async () => {
      console.log('🔍 Starting check-in data fetch...')
      console.log('📊 Events count:', events.length)
      
      if (events.length === 0) {
        console.log('⚠️ No events found, skipping check-in data fetch')
        return
      }

      if (!token) {
        console.log('⚠️ No token found, skipping check-in data fetch')
        return
      }

      console.log('✅ Token found, processing up to 20 events...')
      const checkInStats: { name: string; rate: number }[] = []

      for (const event of events.slice(0, 20)) {
        // Limit to 20 events to avoid too many API calls
        console.log(`📡 Fetching registrations for event: ${event.name} (ID: ${event.id})`)
        
        try {
          const response = await fetch(
            `http://localhost:3000/api/events/${event.id}/registrations?limit=10000`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          )

          console.log(`📥 Response status for ${event.name}:`, response.status)

          if (response.ok) {
            const data = await response.json()
            const registrations = data.data || []
            const totalRegs = registrations.length
            
            console.log(`📋 Event "${event.name}": ${totalRegs} registrations found`)
            
            // Debug: Log first registration to see structure
            if (registrations.length > 0) {
              console.log('🔎 Sample registration structure:', registrations[0])
            }
            
            const checkedIn = registrations.filter(
              (r: any) => {
                const isCheckedIn = r.status === 'checked-in' || !!r.checked_in_at || !!r.checkedInAt
                return isCheckedIn
              }
            ).length

            console.log(`✅ Event "${event.name}": ${checkedIn}/${totalRegs} checked in`)

            if (totalRegs > 0) {
              const rate = Math.round((checkedIn / totalRegs) * 100)
              checkInStats.push({
                name: event.name.length > 25 ? event.name.substring(0, 25) + '...' : event.name,
                rate,
              })
            }
          } else {
            console.error(`❌ Failed to fetch registrations for ${event.name}:`, response.statusText)
          }
        } catch (error) {
          console.error(`❌ Error fetching registrations for event ${event.id}:`, error)
        }
      }

      console.log('📊 Final check-in stats:', checkInStats)

      // Sort by check-in rate descending
      checkInStats.sort((a, b) => b.rate - a.rate)

      // Calculate average check-in rate
      const avgRate = checkInStats.length > 0
        ? Math.round(checkInStats.reduce((sum, stat) => sum + stat.rate, 0) / checkInStats.length)
        : 0

      console.log('📈 Average check-in rate:', avgRate + '%')

      setCheckInData({
        eventNames: checkInStats.map(s => s.name),
        checkInRates: checkInStats.map(s => s.rate),
        avgCheckInRate: avgRate,
      })
    }

    fetchCheckInData()
  }, [events, token])

  // Calculate statistics
  const stats = useMemo(() => {
    // Count attendees by type
    const typeCount: Record<string, number> = {}
    attendees.forEach((attendee: any) => {
      const typeName = attendee.type?.name || attendee.attendeeType?.name || 'Sans type'
      typeCount[typeName] = (typeCount[typeName] || 0) + 1
    })

    // Count events by month
    const eventsByMonth: Record<string, number> = {}
    events.forEach((event: any) => {
      if (!event.start_date) return
      const date = new Date(event.start_date)
      if (isNaN(date.getTime())) return // Skip invalid dates
      const monthYear = format(date, 'MMM yyyy', { locale: fr })
      eventsByMonth[monthYear] = (eventsByMonth[monthYear] || 0) + 1
    })

    // Events over last 30 days (based on creation date)
    const last30Days: Record<string, number> = {}
    for (let i = 29; i >= 0; i--) {
      const date = subDays(new Date(), i)
      const dateKey = format(date, 'dd MMM', { locale: fr })
      last30Days[dateKey] = 0
    }

    events.forEach((event: any) => {
      // Use created_at instead of start_date for "events created in last 30 days"
      const createdDate = event.created_at || event.createdAt
      if (!createdDate) return
      const eventDate = new Date(createdDate)
      if (isNaN(eventDate.getTime())) return // Skip invalid dates
      const now = new Date()
      const daysAgo = Math.floor((now.getTime() - eventDate.getTime()) / (1000 * 60 * 60 * 24))
      if (daysAgo >= 0 && daysAgo < 30) {
        const dateKey = format(eventDate, 'dd MMM', { locale: fr })
        if (last30Days[dateKey] !== undefined) {
          last30Days[dateKey] = last30Days[dateKey] + 1
        }
      }
    })

    // Capacity distribution (group events by capacity ranges)
    const capacityRanges = {
      '0-50': 0,
      '51-100': 0,
      '101-200': 0,
      '201-500': 0,
      '500+': 0,
    }

    const eventsWithCapacity = events.filter((e: any) => e.capacity && e.capacity > 0)
    eventsWithCapacity.forEach((event: any) => {
      const cap = event.capacity
      if (cap <= 50) capacityRanges['0-50']++
      else if (cap <= 100) capacityRanges['51-100']++
      else if (cap <= 200) capacityRanges['101-200']++
      else if (cap <= 500) capacityRanges['201-500']++
      else capacityRanges['500+']++
    })

    // Average capacity
    const avgCapacity = eventsWithCapacity.length > 0
      ? Math.round(eventsWithCapacity.reduce((sum: number, e: any) => sum + (e.capacity || 0), 0) / eventsWithCapacity.length)
      : 0

    // Total capacity across all events
    const totalCapacity = eventsWithCapacity.reduce((sum: number, e: any) => sum + (e.capacity || 0), 0)

    // Calculate occupancy rate (if we have capacity data)
    const occupancyRate = totalCapacity > 0 ? Math.round((totalAttendees / totalCapacity) * 100) : 0

    return {
      totalAttendees,
      totalEvents: events.length,
      typeCount,
      eventsByMonth,
      last30Days,
      capacityRanges,
      avgCapacity,
      totalCapacity,
      occupancyRate,
    }
  }, [attendees, events, totalAttendees])

  // Préparer les données pour ECharts
  const pieChartOption = useMemo((): EChartsOption => {
    const data = Object.entries(stats.typeCount).map(([name, value]) => ({
      name,
      value,
    }))
    
    return {
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c} ({d}%)',
      },
      legend: {
        orient: 'horizontal',
        bottom: 0,
        textStyle: {
          fontSize: 12,
        },
      },
      series: [
        {
          type: 'pie',
          radius: ['40%', '70%'],
          avoidLabelOverlap: true,
          itemStyle: {
            borderRadius: 8,
            borderColor: '#fff',
            borderWidth: 2,
          },
          label: {
            show: true,
            formatter: '{b}\n{d}%',
            fontSize: 11,
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 14,
              fontWeight: 'bold',
            },
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)',
            },
          },
          data,
        },
      ],
    }
  }, [stats.typeCount])

  const barChartMonthOption = useMemo((): EChartsOption => {
    const categories = Object.keys(stats.eventsByMonth)
    const values = Object.values(stats.eventsByMonth)
    
    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow',
        },
        formatter: (params: any) => {
          const param = params[0]
          return `${param.axisValue}<br/>${param.marker}${param.seriesName}: ${param.value}`
        },
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: categories,
        axisLabel: {
          rotate: 45,
          fontSize: 11,
        },
      },
      yAxis: {
        type: 'value',
        minInterval: 1,
      },
      series: [
        {
          name: 'Événements',
          type: 'bar',
          data: values,
          itemStyle: {
            color: '#3B82F6',
            borderRadius: [4, 4, 0, 0],
          },
          emphasis: {
            itemStyle: {
              color: '#2563EB',
            },
          },
        },
      ],
    }
  }, [stats.eventsByMonth])

  const lineChartOption = useMemo((): EChartsOption => {
    const categories = Object.keys(stats.last30Days)
    const values = Object.values(stats.last30Days)
    
    return {
      tooltip: {
        trigger: 'axis',
        formatter: (params: any) => {
          const param = params[0]
          return `${param.axisValue}<br/>${param.marker}${param.seriesName}: ${param.value}`
        },
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: categories,
        boundaryGap: false,
        axisLabel: {
          rotate: 45,
          fontSize: 11,
        },
      },
      yAxis: {
        type: 'value',
        minInterval: 1,
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
          height: 20,
        },
      ],
      series: [
        {
          name: 'Événements créés',
          type: 'line',
          data: values,
          smooth: false,
          areaStyle: {
            opacity: 0.3,
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(16, 185, 129, 0.5)' },
                { offset: 1, color: 'rgba(16, 185, 129, 0.05)' },
              ],
            },
          },
          itemStyle: {
            color: '#10B981',
          },
          lineStyle: {
            width: 2,
            color: '#10B981',
          },
          symbol: 'circle',
          symbolSize: 6,
          emphasis: {
            scale: true,
            itemStyle: {
              color: '#059669',
            },
          },
        },
      ],
    }
  }, [stats.last30Days])

  const capacityChartOption = useMemo((): EChartsOption => {
    const categories = Object.keys(stats.capacityRanges)
    const values = Object.values(stats.capacityRanges)
    
    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow',
        },
        formatter: (params: any) => {
          const param = params[0]
          return `${param.axisValue}<br/>${param.marker}${param.seriesName}: ${param.value}`
        },
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: categories,
        axisLabel: {
          fontSize: 11,
        },
      },
      yAxis: {
        type: 'value',
        minInterval: 1,
      },
      series: [
        {
          name: "Nombre d'événements",
          type: 'bar',
          data: values,
          itemStyle: {
            color: '#3B82F6',
            borderRadius: [4, 4, 0, 0],
          },
          emphasis: {
            itemStyle: {
              color: '#2563EB',
            },
          },
        },
      ],
    }
  }, [stats.capacityRanges])

  const checkInRateChartOption = useMemo((): EChartsOption => {
    const categories = checkInData.eventNames
    const values = checkInData.checkInRates
    
    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow',
        },
        formatter: (params: any) => {
          const param = params[0]
          return `${param.axisValue}<br/>${param.marker}${param.seriesName}: ${param.value}%`
        },
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '10%',
        top: '3%',
        containLabel: true,
      },
      xAxis: {
        type: 'value',
        min: 0,
        max: 100,
        axisLabel: {
          formatter: '{value}%',
        },
      },
      yAxis: {
        type: 'category',
        data: categories,
        axisLabel: {
          fontSize: 11,
          interval: 0,
        },
      },
      dataZoom: [
        {
          type: 'inside',
          yAxisIndex: 0,
          start: 0,
          end: 50,
        },
        {
          type: 'slider',
          yAxisIndex: 0,
          start: 0,
          end: 50,
          width: 20,
          right: 10,
        },
      ],
      series: [
        {
          name: 'Taux de présence',
          type: 'bar',
          data: values,
          itemStyle: {
            color: '#10B981',
            borderRadius: [0, 4, 4, 0],
          },
          label: {
            show: true,
            position: 'right',
            formatter: '{c}%',
            fontSize: 11,
          },
          emphasis: {
            itemStyle: {
              color: '#059669',
            },
          },
        },
      ],
    }
  }, [checkInData])

  if (eventsLoading || attendeesLoading) {
    return (
      <PageContainer maxWidth="7xl" padding="lg">
        <PageHeader
          title="Rapports et Statistiques"
          description="Analyse des données de votre plateforme"
          icon={TrendingUp}
        />
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Chargement des données...</p>
        </div>
      </PageContainer>
    )
  }

  return (
    <PageContainer maxWidth="7xl" padding="lg">
      <PageHeader
        title="Rapports et Statistiques"
        description="Analyse des données de votre plateforme"
        icon={TrendingUp}
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Total Participants</p>
                <h3 className="text-3xl font-bold mt-2">{stats.totalAttendees}</h3>
              </div>
              <Users className="h-12 w-12 text-blue-100 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Total Événements</p>
                <h3 className="text-3xl font-bold mt-2">{stats.totalEvents}</h3>
              </div>
              <Calendar className="h-12 w-12 text-green-100 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500 to-amber-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-amber-100 text-sm font-medium">Capacité moyenne</p>
                <h3 className="text-3xl font-bold mt-2">{stats.avgCapacity}</h3>
              </div>
              <FileText className="h-12 w-12 text-amber-100 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Taux de remplissage</p>
                <h3 className="text-3xl font-bold mt-2">{stats.occupancyRate}%</h3>
              </div>
              <Activity className="h-12 w-12 text-purple-100 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-rose-500 to-rose-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-rose-100 text-sm font-medium">Capacité totale</p>
                <h3 className="text-3xl font-bold mt-2">{stats.totalCapacity}</h3>
              </div>
              <TrendingUp className="h-12 w-12 text-rose-100 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-100 text-sm font-medium">Taux de présence moyen</p>
                <h3 className="text-3xl font-bold mt-2">{checkInData.avgCheckInRate}%</h3>
              </div>
              <Users className="h-12 w-12 text-emerald-100 opacity-80" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Attendee Type Distribution */}
        {Object.keys(stats.typeCount).length > 0 && (
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                Distribution par type de participant
              </h3>
              <div style={{ height: '300px' }}>
                <EChartsWrapper option={pieChartOption} />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Events by Month */}
        {Object.keys(stats.eventsByMonth).length > 0 && (
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                Événements par mois
              </h3>
              <div style={{ height: '300px' }}>
                <EChartsWrapper option={barChartMonthOption} />
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Events Trend (30 days) */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            Événements créés (30 derniers jours)
          </h3>
          <div style={{ height: '300px' }}>
            <EChartsWrapper option={lineChartOption} />
          </div>
        </CardContent>
      </Card>

      {/* Capacity Distribution */}
      {Object.values(stats.capacityRanges).some(v => v > 0) && (
        <Card className="mb-8">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              Distribution des événements par capacité
            </h3>
            <div style={{ height: '300px' }}>
              <EChartsWrapper option={capacityChartOption} />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Check-in Rate by Event */}
      {checkInData.eventNames.length > 0 && (
        <Card className="mb-8">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              Taux de présence par événement (Top 20)
            </h3>
            <div style={{ height: '400px' }}>
              <EChartsWrapper option={checkInRateChartOption} />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Insights */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            Informations clés
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                Type le plus fréquent
              </p>
              <p className="text-2xl font-bold text-blue-900 dark:text-blue-100 mt-2">
                {Object.keys(stats.typeCount).length > 0
                  ? Object.entries(stats.typeCount).reduce((prev, current) =>
                      prev[1] > current[1] ? prev : current
                    )[0]
                  : 'N/A'}
              </p>
            </div>
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                Événements à venir
              </p>
              <p className="text-2xl font-bold text-green-900 dark:text-green-100 mt-2">
                {events.filter((e: any) => {
                  if (!e.start_date) return false
                  const startDate = new Date(e.start_date)
                  return !isNaN(startDate.getTime()) && startDate > new Date()
                }).length}
              </p>
            </div>
            <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
              <p className="text-sm text-amber-600 dark:text-amber-400 font-medium">
                Moyenne participants/événement
              </p>
              <p className="text-2xl font-bold text-amber-900 dark:text-amber-100 mt-2">
                {stats.totalEvents > 0 ? Math.round(stats.totalAttendees / stats.totalEvents) : 0}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </PageContainer>
  )
}
