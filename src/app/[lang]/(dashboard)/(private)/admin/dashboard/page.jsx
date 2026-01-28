'use client'

// React Imports
import { useState, useEffect } from 'react'

// Next Imports
import { useParams } from 'next/navigation'
import Link from 'next/link'
import dynamic from 'next/dynamic'

// MUI Imports
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import { toast } from 'react-toastify'
import { useTheme } from '@mui/material/styles'

// Components Imports
import CardStatVertical from '@components/card-statistics/Vertical'
import CustomAvatar from '@core/components/mui/Avatar'
import OptionMenu from '@core/components/option-menu'
import { adminAPI } from '@/utils/api'
import { useAuthToken } from '@/hooks/useAuthToken'
import themeConfig from '@/configs/themeConfig'

// Util Imports
import { getLocalizedUrl } from '@/utils/i18n'

const AppReactApexCharts = dynamic(() => import('@/libs/styles/AppReactApexCharts'), { ssr: false })

const appName = themeConfig.appName || 'K360'

const AdminDashboard = () => {
  const params = useParams()
  const { lang: locale } = params
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const { isReady, isLoading } = useAuthToken()

  useEffect(() => {
    const fetchStats = async () => {
      if (!isReady || isLoading) return
      try {
        const response = await adminAPI.getDashboardStats()
        const raw = response?.data ?? response
        const payload = raw && typeof raw === 'object' && raw.data && typeof raw.data === 'object'
          ? raw.data
          : raw
        if (!payload || typeof payload !== 'object') {
          setData({ stats: {}, charts: {}, recentActivity: [] })
          return
        }
        setData({
          stats: payload.stats ?? payload ?? {},
          charts: payload.charts ?? {},
          recentActivity: Array.isArray(payload.recentActivity) ? payload.recentActivity : []
        })
      } catch (error) {
        toast.error(error.message || 'Error fetching dashboard stats')
        setData({ stats: {}, charts: {}, recentActivity: [] })
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [isReady, isLoading])

  const stats = data?.stats || {}
  const charts = data?.charts || {}
  const recentActivity = data?.recentActivity || []

  if (loading || isLoading) {
    return (
      <Grid container spacing={6}>
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardContent>
              <Typography color='text.primary'>Loading dashboard...</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    )
  }

  // Calculate percentages
  const userGrowthPercent = stats.totalUsers > 0 && stats.recentUsers > 0
    ? Math.round((stats.recentUsers / stats.totalUsers) * 100)
    : 0
  const premiumPercent = stats.totalUsers > 0 && stats.activeSubscriptions > 0
    ? Math.round((stats.activeSubscriptions / stats.totalUsers) * 100)
    : 0

  // Chart data
  const usersPerDay = charts.usersPerDay || []
  const logsPerDay = charts.logsPerDay || []
  const cyclesByPhase = charts.cyclesByPhase || { menstrual: 0, follicular: 0, ovulation: 0, luteal: 0 }
  const subscriptionsByPlan = charts.subscriptionsByPlan || { free: 0, monthly: 0, yearly: 0 }

  // Users line chart
  const usersLineSeries = [{ name: 'Users', data: usersPerDay.map(d => d.count) }]
  const usersLineCategories = usersPerDay.map(d => d.label)

  // Logs bar chart
  const logsBarSeries = [{ name: 'Logs', data: logsPerDay.map(d => d.count) }]
  const logsBarCategories = logsPerDay.map(d => d.label)

  // Weekly overview (mixed bar + line)
  const weeklySeries = [
    { name: 'Logs', type: 'column', data: logsBarSeries[0].data },
    { name: 'Users', type: 'line', data: usersLineSeries[0].data }
  ]

  // Cycles by phase donut
  const phaseLabels = ['Menstrual', 'Follicular', 'Ovulation', 'Luteal']
  const phaseValues = [cyclesByPhase.menstrual, cyclesByPhase.follicular, cyclesByPhase.ovulation, cyclesByPhase.luteal]
  const phaseTotal = phaseValues.reduce((a, b) => a + b, 0)

  // Subscriptions by plan donut
  const planLabels = ['Free', 'Monthly', 'Yearly']
  const planValues = [subscriptionsByPlan.free, subscriptionsByPlan.monthly, subscriptionsByPlan.yearly]
  const planTotal = planValues.reduce((a, b) => a + b, 0)

  // Content breakdown (Videos, Sessions, Steps, Media)
  const contentData = [
    { name: 'Videos', value: stats.totalVideos || 0, color: 'var(--mui-palette-primary-main)' },
    { name: 'Sessions', value: stats.totalSessions || 0, color: 'var(--mui-palette-success-main)' },
    { name: 'Steps', value: stats.totalSteps || 0, color: 'var(--mui-palette-warning-main)' },
    { name: 'Media', value: stats.totalMedia || 0, color: 'var(--mui-palette-info-main)' }
  ]
  const contentSeries = contentData.map(d => d.value)
  const contentLabels = contentData.map(d => d.name)
  const contentColors = contentData.map(d => d.color)

  // Mini stacked bar for logs vs users
  const miniStackedSeries = [
    { name: 'Logs', data: logsBarSeries[0].data.slice(-5) },
    { name: 'Users', data: usersLineSeries[0].data.slice(-5) }
  ]

  return (
    <Grid container spacing={6}>
      {/* Welcome Card (Award style) */}
      <Grid size={{ xs: 12, md: 4 }}>
        <Card className='relative bs-full'>
          <CardContent>
            <div className='flex flex-col items-start gap-2.5'>
              <div className='flex flex-col'>
                <Typography variant='h5'>
                  Welcome to <span className='font-bold'>{appName} Admin</span> 🎉
                </Typography>
                <Typography variant='subtitle1'>Platform Overview</Typography>
              </div>
              <div className='flex flex-col'>
                <Typography variant='h5' color='primary.main'>
                  {stats.totalUsers || 0}
                </Typography>
                <Typography>{stats.recentUsers || 0} new users this month 🚀</Typography>
              </div>
              <Link href={getLocalizedUrl('/admin/users', locale)} className='no-underline'>
                <Button size='small' variant='contained'>
                  View Users
                </Button>
              </Link>
            </div>
            <CustomAvatar
              size={106}
              variant='rounded'
              skin='light'
              color='primary'
              className='absolute inline-end-5'
              sx={{
                bottom: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                '& i': {
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '60%',
                  height: '60%',
                  lineHeight: '1'
                }
              }}
            >
              <i className='ri-admin-line text-6xl' />
            </CustomAvatar>
          </CardContent>
        </Card>
      </Grid>

      {/* Stats Cards */}
      <Grid size={{ xs: 12, md: 2, sm: 3 }}>
        <CardStatVertical
          stats={stats.totalUsers ?? 0}
          title='Total Users'
          trendNumber={userGrowthPercent ? `+${userGrowthPercent}%` : '0%'}
          chipText='Last 30 Days'
          avatarColor='primary'
          avatarIcon='ri-user-line'
          avatarSkin='light'
          chipColor='secondary'
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 3, md: 2 }}>
        <CardStatVertical
          stats={stats.activeSubscriptions ?? 0}
          title='Active Subs'
          trendNumber={premiumPercent ? `${premiumPercent}%` : '0%'}
          chipText='Premium Users'
          avatarColor='success'
          avatarIcon='ri-vip-crown-line'
          avatarSkin='light'
          chipColor='secondary'
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 3, md: 2 }}>
        <Card className='bs-full flex flex-col'>
          <CardContent>
            <div className='flex flex-wrap items-center gap-1'>
              <Typography variant='h5'>{stats.totalLogs ?? 0}</Typography>
              <Typography color='success.main'>+{logsBarSeries[0].data.slice(-1)[0] || 0}</Typography>
            </div>
            <Typography variant='subtitle1'>Total Logs</Typography>
          </CardContent>
          <CardContent className='flex grow items-center'>
            <AppReactApexCharts
              type='bar'
              height={84}
              width='100%'
              options={{
                chart: { stacked: true, parentHeightOffset: 0, toolbar: { show: false }, zoom: { enabled: false } },
                legend: { show: false },
                dataLabels: { enabled: false },
                stroke: { width: 5, colors: ['var(--mui-palette-background-paper)'] },
                colors: ['var(--mui-palette-text-primary)', 'var(--mui-palette-error-main)'],
                plotOptions: {
                  bar: {
                    borderRadius: 7,
                    columnWidth: '65%',
                    borderRadiusApplication: 'around',
                    borderRadiusWhenStacked: 'all'
                  }
                },
                grid: {
                  padding: { top: -35, left: -30, right: -18, bottom: -25 },
                  yaxis: { lines: { show: false } }
                },
                states: { hover: { filter: { type: 'none' } }, active: { filter: { type: 'none' } } },
                xaxis: { labels: { show: false }, axisTicks: { show: false }, crosshairs: { opacity: 0 }, axisBorder: { show: false } },
                yaxis: { labels: { show: false } }
              }}
              series={miniStackedSeries}
            />
          </CardContent>
        </Card>
      </Grid>
      <Grid size={{ xs: 12, sm: 3, md: 2 }}>
        <Card className='bs-full'>
          <CardContent className='pbe-0'>
            <div className='flex flex-wrap items-center gap-1'>
              <Typography variant='h5'>{planTotal}</Typography>
              <Typography color='success.main'>+{premiumPercent}%</Typography>
            </div>
            <Typography variant='subtitle1'>Subscriptions</Typography>
            <AppReactApexCharts
              type='donut'
              height={127}
              width='100%'
              options={{
                legend: { show: false },
                stroke: { width: 5, colors: ['var(--mui-palette-background-paper)'] },
                colors: ['var(--mui-palette-text-disabled)', 'var(--mui-palette-primary-main)', 'var(--mui-palette-warning-main)'],
                labels: planLabels,
                tooltip: { y: { formatter: val => `${val}` } },
                dataLabels: { enabled: false },
                states: { hover: { filter: { type: 'none' } }, active: { filter: { type: 'none' } } },
                plotOptions: {
                  pie: {
                    donut: {
                      size: '70%',
                      labels: {
                        show: true,
                        name: { show: false },
                        total: {
                          label: '',
                          show: true,
                          fontWeight: 600,
                          fontSize: '1rem',
                          color: 'var(--mui-palette-text-secondary)',
                          formatter: () => `${planTotal}`
                        },
                        value: {
                          offsetY: 6,
                          fontWeight: 600,
                          fontSize: '0.9375rem',
                          formatter: val => `${val}`,
                          color: 'var(--mui-palette-text-primary)'
                        }
                      }
                    }
                  }
                }
              }}
              series={planValues}
            />
          </CardContent>
        </Card>
      </Grid>

      {/* Cycles by Phase Donut (Organic Sessions style) */}
      <Grid size={{ xs: 12, md: 4 }}>
        <Card>
          <CardHeader
            title='Cycles by Phase'
            action={<OptionMenu options={['Last 28 Days', 'Last Month', 'Last Year']} />}
          />
          <CardContent>
            <AppReactApexCharts
              type='donut'
              height={373}
              width='100%'
              options={{
                chart: { sparkline: { enabled: true } },
                colors: ['#f87171', '#4ade80', '#fbbf24', '#60a5fa'],
                grid: { padding: { bottom: -30 } },
                legend: {
                  show: true,
                  position: 'bottom',
                  fontSize: '15px',
                  offsetY: 5,
                  itemMargin: { horizontal: 28, vertical: 6 },
                  labels: { colors: 'var(--mui-palette-text-secondary)' },
                  markers: { offsetY: 1, offsetX: theme.direction === 'rtl' ? 4 : -1, width: 10, height: 10 }
                },
                tooltip: { enabled: false },
                dataLabels: { enabled: false },
                stroke: { width: 4, lineCap: 'round', colors: ['var(--mui-palette-background-paper)'] },
                labels: phaseLabels,
                states: { hover: { filter: { type: 'none' } }, active: { filter: { type: 'none' } } },
                plotOptions: {
                  pie: {
                    endAngle: 130,
                    startAngle: -130,
                    customScale: 0.9,
                    donut: {
                      size: '83%',
                      labels: {
                        show: true,
                        name: {
                          offsetY: 25,
                          fontSize: '0.9375rem',
                          color: 'var(--mui-palette-text-secondary)'
                        },
                        value: {
                          offsetY: -15,
                          fontWeight: 500,
                          fontSize: '1.75rem',
                          formatter: value => `${value}`,
                          color: 'var(--mui-palette-text-primary)'
                        },
                        total: {
                          show: true,
                          label: 'Total',
                          fontSize: '1rem',
                          color: 'var(--mui-palette-text-secondary)',
                          formatter: () => `${phaseTotal}`
                        }
                      }
                    }
                  }
                }
              }}
              series={phaseValues}
            />
          </CardContent>
        </Card>
      </Grid>

      {/* Weekly Overview (Mixed Bar + Line) */}
      <Grid size={{ xs: 12, md: 8 }}>
        <Card>
          <CardHeader title='Weekly Overview' action={<OptionMenu options={['Refresh', 'Update', 'Share']} />} />
          <CardContent className='flex flex-col gap-6'>
            <AppReactApexCharts
              type='line'
              height={186}
              width='100%'
              series={weeklySeries}
              options={{
                chart: { parentHeightOffset: 0, toolbar: { show: false } },
                plotOptions: {
                  bar: {
                    borderRadius: 7,
                    columnWidth: '35%',
                    colors: {
                      ranges: [
                        {
                          to: 50,
                          from: 40,
                          color: 'var(--mui-palette-primary-main)'
                        }
                      ]
                    }
                  }
                },
                markers: {
                  size: 3.5,
                  strokeWidth: 2,
                  fillOpacity: 1,
                  strokeOpacity: 1,
                  colors: 'var(--mui-palette-background-paper)',
                  strokeColors: 'var(--mui-palette-primary-main)'
                },
                stroke: {
                  width: [0, 2],
                  colors: ['var(--mui-palette-customColors-trackBg)', 'var(--mui-palette-primary-main)']
                },
                legend: { show: false },
                dataLabels: { enabled: false },
                colors: ['var(--mui-palette-customColors-trackBg)'],
                grid: {
                  strokeDashArray: 7,
                  borderColor: 'var(--mui-palette-divider)',
                  padding: { left: -2, right: 8 }
                },
                states: { hover: { filter: { type: 'none' } }, active: { filter: { type: 'none' } } },
                xaxis: {
                  categories: logsBarCategories.length ? logsBarCategories : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
                  tickPlacement: 'on',
                  labels: { show: false },
                  axisTicks: { show: false },
                  axisBorder: { show: false }
                },
                yaxis: {
                  min: 0,
                  max: Math.max(...logsBarSeries[0].data, ...usersLineSeries[0].data, 10) || 10,
                  show: true,
                  tickAmount: 3,
                  labels: {
                    offsetX: -10,
                    formatter: value => `${value}`,
                    style: {
                      fontSize: '0.8125rem',
                      colors: 'var(--mui-palette-text-disabled)'
                    }
                  }
                }
              }}
            />
            <div className='flex items-center gap-4'>
              <Typography variant='h4'>{stats.totalLogs || 0}</Typography>
              <Typography>Total logs tracked. {stats.recentUsers || 0} new users joined this month 😎</Typography>
            </div>
            <Link href={getLocalizedUrl('/admin/logs', locale)} className='no-underline'>
              <Button variant='contained' color='primary'>
                View Logs
              </Button>
            </Link>
          </CardContent>
        </Card>
      </Grid>

      {/* Content Breakdown */}
      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
        <Card>
          <CardHeader
            title='Content Breakdown'
            action={<OptionMenu options={['Last 28 Days', 'Last Month', 'Last Year']} />}
          />
          <CardContent className='flex flex-col gap-6'>
            <div>
              <div className='flex items-center'>
                <Typography variant='h4'>{stats.totalVideos + stats.totalSessions + stats.totalSteps + stats.totalMedia || 0}</Typography>
                <i className='ri-arrow-up-s-line text-2xl text-success' />
                <Typography color='success.main'>+{contentSeries.reduce((a, b) => a + b, 0)}</Typography>
              </div>
              <Typography>Total Content Items</Typography>
            </div>
            <div className='flex flex-col gap-4'>
              {contentData.map((item, index) => (
                <div key={index} className='flex items-center gap-3'>
                  <CustomAvatar skin='light' color={index === 0 ? 'primary' : index === 1 ? 'success' : index === 2 ? 'warning' : 'info'} size={34}>
                    <i className={index === 0 ? 'ri-video-line' : index === 1 ? 'ri-play-circle-line' : index === 2 ? 'ri-file-list-line' : 'ri-image-line'} />
                  </CustomAvatar>
                  <div className='flex flex-wrap justify-between items-center gap-x-2 gap-y-1 is-full'>
                    <div className='flex flex-col gap-0.5'>
                      <Typography className='font-medium' color='text.primary'>
                        {item.name}
                      </Typography>
                      <Typography variant='body2'>Content Type</Typography>
                    </div>
                    <Typography color='text.primary' className='font-medium'>
                      {item.value}
                    </Typography>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </Grid>

      {/* Monthly Activity (Area Chart) */}
      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
        <Card>
          <CardHeader title='Monthly Activity' action={<OptionMenu options={['Refresh', 'Update', 'Share']} />} />
          <CardContent className='flex flex-col gap-6'>
            <AppReactApexCharts
              type='area'
              height={248}
              width='100%'
              options={{
                chart: { parentHeightOffset: 0, toolbar: { show: false } },
                tooltip: { enabled: false },
                dataLabels: { enabled: false },
                stroke: { width: 5, lineCap: 'round', curve: 'smooth' },
                grid: { show: false, padding: { top: -9, left: 6, right: 8, bottom: 0 } },
                fill: {
                  type: 'gradient',
                  gradient: {
                    opacityTo: 0.7,
                    opacityFrom: 0.5,
                    shadeIntensity: 1,
                    stops: [0, 90, 100],
                    colorStops: [
                      [
                        { offset: 0, opacity: 0.6, color: 'var(--mui-palette-success-main)' },
                        { offset: 100, opacity: 0.1, color: 'var(--mui-palette-background-paper)' }
                      ]
                    ]
                  }
                },
                theme: {
                  monochrome: {
                    enabled: true,
                    shadeTo: 'light',
                    shadeIntensity: 1,
                    color: theme.palette.success.main
                  }
                },
                xaxis: { type: 'numeric', labels: { show: false }, axisTicks: { show: false }, axisBorder: { show: false } },
                yaxis: { show: false },
                markers: {
                  size: 1,
                  offsetY: 1,
                  offsetX: -5,
                  strokeWidth: 4,
                  strokeOpacity: 1,
                  colors: ['transparent'],
                  strokeColors: 'transparent',
                  discrete: [
                    {
                      size: 7,
                      seriesIndex: 0,
                      dataPointIndex: usersLineSeries[0].data.length - 1,
                      strokeColor: 'var(--mui-palette-success-main)',
                      fillColor: 'var(--mui-palette-background-paper)'
                    }
                  ]
                }
              }}
              series={[{ name: 'Activity', data: usersLineSeries[0].data.length ? usersLineSeries[0].data : [0, 5, 10, 8, 12, 15, 20] }]}
            />
            <Typography>
              Last month you had {stats.totalLogs || 0} logs, {stats.recentUsers || 0} new users and {stats.activeSubscriptions || 0} active subscriptions.
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      {/* Recent Activity Timeline */}
      <Grid size={{ xs: 12, md: 4 }}>
        <Card>
          <CardHeader
            title='Recent Activity'
            subheader={`${recentActivity.length} Recent Items`}
            action={<OptionMenu options={['Refresh', 'Update', 'Share']} />}
          />
          <CardContent className='flex flex-col gap-6'>
            {recentActivity.length === 0 ? (
              <Typography color='text.secondary'>No recent activity.</Typography>
            ) : (
              recentActivity.slice(0, 5).map((item, idx) => (
                <div key={idx} className='flex items-center gap-3'>
                  <CustomAvatar
                    skin='light'
                    color={item.type === 'user' ? 'primary' : 'info'}
                    variant='rounded'
                  >
                    <i className={item.type === 'user' ? 'ri-user-add-line' : 'ri-file-list-3-line'} />
                  </CustomAvatar>
                  <div className='flex flex-col gap-0.5'>
                    <Typography color='text.primary' className='font-medium'>
                      {item.label}
                    </Typography>
                    <Typography variant='body2'>
                      {(() => {
                        const d = new Date(item.time)
                        const now = new Date()
                        const diffMins = Math.floor((now - d) / 60000)
                        if (diffMins < 60) return `${diffMins}m ago`
                        const diffHours = Math.floor(diffMins / 60)
                        if (diffHours < 24) return `${diffHours}h ago`
                        const diffDays = Math.floor(diffHours / 24)
                        if (diffDays < 7) return `${diffDays}d ago`
                        return d.toLocaleDateString()
                      })()}
                    </Typography>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </Grid>

      {/* Quick Stats Row */}
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <CardStatVertical
          stats={stats.totalVideos ?? 0}
          title='Videos'
          trendNumber=''
          chipText='Content'
          avatarColor='error'
          avatarIcon='ri-video-line'
          avatarSkin='light'
          chipColor='secondary'
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <CardStatVertical
          stats={stats.totalSessions ?? 0}
          title='Sessions'
          trendNumber=''
          chipText='Workouts'
          avatarColor='success'
          avatarIcon='ri-play-circle-line'
          avatarSkin='light'
          chipColor='secondary'
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <CardStatVertical
          stats={stats.totalCycles ?? 0}
          title='Cycles'
          trendNumber=''
          chipText='Tracked'
          avatarColor='info'
          avatarIcon='ri-calendar-line'
          avatarSkin='light'
          chipColor='secondary'
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <CardStatVertical
          stats={stats.totalGifts ?? 0}
          title='Gifts'
          trendNumber=''
          chipText='Gifted'
          avatarColor='warning'
          avatarIcon='ri-gift-line'
          avatarSkin='light'
          chipColor='secondary'
        />
      </Grid>
    </Grid>
  )
}

export default AdminDashboard
