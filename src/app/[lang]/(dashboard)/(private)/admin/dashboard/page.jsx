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
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import { toast } from 'react-toastify'
import { useTheme } from '@mui/material/styles'

// Components Imports
import CardStatVertical from '@components/card-statistics/Vertical'
import CustomAvatar from '@core/components/mui/Avatar'
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

  const userGrowthPercent = stats.totalUsers > 0 && stats.recentUsers > 0
    ? Math.round((stats.recentUsers / stats.totalUsers) * 100)
    : 0
  const premiumPercent = stats.totalUsers > 0 && stats.premiumUsers > 0
    ? Math.round((stats.premiumUsers / stats.totalUsers) * 100)
    : 0

  const usersPerDay = charts.usersPerDay || []
  const logsPerDay = charts.logsPerDay || []
  const cyclesByPhase = charts.cyclesByPhase || { menstrual: 0, follicular: 0, ovulation: 0, luteal: 0 }
  const subscriptionsByPlan = charts.subscriptionsByPlan || { free: 0, monthly: 0, yearly: 0 }

  const usersLineSeries = [{ name: 'Users joined', data: usersPerDay.map(d => d.count) }]
  const usersLineCategories = usersPerDay.map(d => d.label)

  const logsBarSeries = [{ name: 'Logs', data: logsPerDay.map(d => d.count) }]
  const logsBarCategories = logsPerDay.map(d => d.label)

  const phaseLabels = ['Menstrual', 'Follicular', 'Ovulation', 'Luteal']
  const phaseValues = [cyclesByPhase.menstrual, cyclesByPhase.follicular, cyclesByPhase.ovulation, cyclesByPhase.luteal]
  const planLabels = ['Free', 'Monthly', 'Yearly']
  const planValues = [subscriptionsByPlan.free, subscriptionsByPlan.monthly, subscriptionsByPlan.yearly]

  const formatTime = t => {
    if (!t) return ''
    const d = new Date(t)
    const now = new Date()
    const diffMs = now - d
    const diffMins = Math.floor(diffMs / 60000)
    if (diffMins < 60) return `${diffMins}m ago`
    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `${diffHours}h ago`
    const diffDays = Math.floor(diffHours / 24)
    if (diffDays < 7) return `${diffDays}d ago`
    return d.toLocaleDateString()
  }

  return (
    <Grid container spacing={6}>
      {/* Welcome Card */}
      <Grid size={{ xs: 12, md: 8 }}>
        <Card className='relative bs-full' sx={{ background: 'linear-gradient(135deg, #E88A9E 0%, #F9B5C4 100%)' }}>
          <CardContent className='sm:pbe-0'>
            <Grid container spacing={6}>
              <Grid size={{ xs: 12, md: 8 }} className='flex flex-col items-start gap-4'>
                <Typography variant='h4' sx={{ color: 'white', fontWeight: 'bold' }}>
                  Welcome to {appName} Admin
                </Typography>
                <div>
                  <Typography sx={{ color: 'rgba(255,255,255,0.9)' }}>
                    {stats.totalUsers ?? 0} users on your platform. {stats.recentUsers ?? 0} joined in the last 30 days.
                  </Typography>
                </div>
                <Link href={getLocalizedUrl('/admin/users', locale)} className='no-underline'>
                  <button
                    style={{
                      padding: '10px 20px',
                      backgroundColor: 'white',
                      color: '#E88A9E',
                      border: 'none',
                      borderRadius: '8px',
                      fontWeight: 'bold',
                      cursor: 'pointer'
                    }}
                  >
                    View Users
                  </button>
                </Link>
              </Grid>
              <Grid size={{ xs: 12, md: 4 }} className='max-sm:flex max-sm:justify-center'>
                <CustomAvatar size={120} variant='rounded' skin='light' color='primary' className='max-bs-[186px]'>
                  <i className='ri-admin-line text-6xl' />
                </CustomAvatar>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>

      {/* App stats row */}
      <Grid size={{ xs: 12, sm: 6, md: 2 }}>
        <CardStatVertical
          stats={stats.totalUsers ?? 0}
          title='Total Users'
          trendNumber={userGrowthPercent ? `${userGrowthPercent}%` : '0%'}
          trend='positive'
          chipText='Last 30 days'
          avatarColor='primary'
          avatarIcon='ri-user-line'
          avatarSkin='light'
          chipColor='primary'
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 2 }}>
        <CardStatVertical
          stats={stats.activeUsers ?? 0}
          title='Active Users'
          trendNumber=''
          trend='positive'
          chipText='Active'
          avatarColor='success'
          avatarIcon='ri-user-heart-line'
          avatarSkin='light'
          chipColor='success'
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 2 }}>
        <CardStatVertical
          stats={stats.premiumUsers ?? 0}
          title='Premium'
          trendNumber={premiumPercent ? `${premiumPercent}%` : '0%'}
          trend='positive'
          chipText='Subscribed'
          avatarColor='warning'
          avatarIcon='ri-vip-crown-line'
          avatarSkin='light'
          chipColor='warning'
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 2 }}>
        <CardStatVertical
          stats={stats.totalLogs ?? 0}
          title='Logs'
          trendNumber=''
          trend='positive'
          chipText='All time'
          avatarColor='info'
          avatarIcon='ri-file-list-line'
          avatarSkin='light'
          chipColor='info'
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 2 }}>
        <CardStatVertical
          stats={stats.totalCycles ?? 0}
          title='Cycles'
          trendNumber=''
          trend='positive'
          chipText='Tracked'
          avatarColor='success'
          avatarIcon='ri-calendar-line'
          avatarSkin='light'
          chipColor='success'
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 2 }}>
        <CardStatVertical
          stats={stats.totalVideos ?? 0}
          title='Videos'
          trendNumber=''
          trend='positive'
          chipText='Content'
          avatarColor='error'
          avatarIcon='ri-video-line'
          avatarSkin='light'
          chipColor='error'
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 2 }}>
        <CardStatVertical
          stats={stats.totalNotifications ?? 0}
          title='Notifications'
          trendNumber=''
          trend='positive'
          chipText='Sent'
          avatarColor='secondary'
          avatarIcon='ri-notification-line'
          avatarSkin='light'
          chipColor='secondary'
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 2 }}>
        <CardStatVertical
          stats={stats.totalGifts ?? 0}
          title='Gifts'
          trendNumber=''
          trend='positive'
          chipText='Gifted'
          avatarColor='error'
          avatarIcon='ri-gift-line'
          avatarSkin='light'
          chipColor='error'
        />
      </Grid>

      {/* Users joined (last 7 days) – line chart */}
      <Grid size={{ xs: 12, md: 6 }}>
        <Card>
          <CardHeader title='Users Joined' subheader='Last 7 days' titleTypographyProps={{ color: 'text.primary' }} subheaderTypographyProps={{ color: 'text.secondary' }} />
          <CardContent>
            <AppReactApexCharts
              type='area'
              height={280}
              width='100%'
              series={usersLineSeries}
              options={{
                chart: { toolbar: { show: false }, zoom: { enabled: false } },
                colors: ['var(--mui-palette-primary-main)'],
                dataLabels: { enabled: false },
                stroke: { curve: 'smooth', width: 2 },
                fill: { type: 'gradient', gradient: { opacityFrom: 0.4, opacityTo: 0.05 } },
                xaxis: { categories: usersLineCategories.length ? usersLineCategories : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], labels: { style: { colors: 'var(--mui-palette-text-secondary)' } } },
                yaxis: { labels: { style: { colors: 'var(--mui-palette-text-secondary)' } } },
                grid: { borderColor: 'var(--mui-palette-divider)' },
                tooltip: { theme: isDark ? 'dark' : 'light' }
              }}
            />
          </CardContent>
        </Card>
      </Grid>

      {/* Logs this week – bar chart */}
      <Grid size={{ xs: 12, md: 6 }}>
        <Card>
          <CardHeader title='Logs This Week' subheader='By day' titleTypographyProps={{ color: 'text.primary' }} subheaderTypographyProps={{ color: 'text.secondary' }} />
          <CardContent>
            <AppReactApexCharts
              type='bar'
              height={280}
              width='100%'
              series={logsBarSeries}
              options={{
                chart: { toolbar: { show: false } },
                colors: ['var(--mui-palette-info-main)'],
                plotOptions: { bar: { borderRadius: 6, columnWidth: '60%' } },
                dataLabels: { enabled: false },
                xaxis: { categories: logsBarCategories.length ? logsBarCategories : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], labels: { style: { colors: 'var(--mui-palette-text-secondary)' } } },
                yaxis: { labels: { style: { colors: 'var(--mui-palette-text-secondary)' } } },
                grid: { borderColor: 'var(--mui-palette-divider)' },
                tooltip: { theme: isDark ? 'dark' : 'light' }
              }}
            />
          </CardContent>
        </Card>
      </Grid>

      {/* Cycles by phase – donut */}
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <Card>
          <CardHeader title='Cycles by Phase' subheader='Tracked phases' titleTypographyProps={{ color: 'text.primary' }} subheaderTypographyProps={{ color: 'text.secondary' }} />
          <CardContent className='pbe-0'>
            <AppReactApexCharts
              type='donut'
              height={220}
              width='100%'
              series={phaseValues}
              options={{
                labels: phaseLabels,
                colors: ['#f87171', '#4ade80', '#fbbf24', '#60a5fa'],
                legend: { position: 'bottom', fontSize: '12px', labels: { colors: 'var(--mui-palette-text-secondary)' } },
                plotOptions: {
                  pie: {
                    donut: {
                      size: '65%',
                      labels: {
                        show: true,
                        total: {
                          show: true,
                          label: 'Total',
                          color: 'var(--mui-palette-text-secondary)',
                          formatter: () => String(phaseValues.reduce((a, b) => a + b, 0))
                        },
                        value: { color: 'var(--mui-palette-text-primary)' }
                      }
                    }
                  }
                }
              }}
            />
          </CardContent>
        </Card>
      </Grid>

      {/* Subscriptions by plan – donut */}
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <Card>
          <CardHeader title='Subscriptions by Plan' subheader='Free / Monthly / Yearly' titleTypographyProps={{ color: 'text.primary' }} subheaderTypographyProps={{ color: 'text.secondary' }} />
          <CardContent className='pbe-0'>
            <AppReactApexCharts
              type='donut'
              height={220}
              width='100%'
              series={planValues}
              options={{
                labels: planLabels,
                colors: ['var(--mui-palette-text-disabled)', 'var(--mui-palette-primary-main)', 'var(--mui-palette-warning-main)'],
                legend: { position: 'bottom', fontSize: '12px', labels: { colors: 'var(--mui-palette-text-secondary)' } },
                plotOptions: {
                  pie: {
                    donut: {
                      size: '65%',
                      labels: {
                        show: true,
                        total: {
                          show: true,
                          label: 'Total',
                          color: 'var(--mui-palette-text-secondary)',
                          formatter: () => String(planValues.reduce((a, b) => a + b, 0))
                        },
                        value: { color: 'var(--mui-palette-text-primary)' }
                      }
                    }
                  }
                }
              }}
            />
          </CardContent>
        </Card>
      </Grid>

      {/* Recent app activity */}
      <Grid size={{ xs: 12, md: 6 }}>
        <Card>
          <CardHeader title='Recent Activity' subheader='Users & logs in your app' titleTypographyProps={{ color: 'text.primary' }} subheaderTypographyProps={{ color: 'text.secondary' }} />
          <CardContent>
            {recentActivity.length === 0 ? (
              <Typography color='text.secondary'>No recent activity.</Typography>
            ) : (
              <List dense disablePadding>
                {recentActivity.map((item, idx) => (
                  <ListItem key={idx} disablePadding className='pbe-2'>
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      <CustomAvatar skin='light' color={item.type === 'user' ? 'primary' : 'info'} size={32}>
                        <i className={item.type === 'user' ? 'ri-user-add-line' : 'ri-file-list-3-line'} />
                      </CustomAvatar>
                    </ListItemIcon>
                    <ListItemText
                      primary={item.label}
                      secondary={formatTime(item.time)}
                      primaryTypographyProps={{ variant: 'body2', color: 'text.primary' }}
                      secondaryTypographyProps={{ variant: 'caption', color: 'text.secondary' }}
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </CardContent>
        </Card>
      </Grid>

      {/* Quick Actions */}
      <Grid size={{ xs: 12 }}>
        <Card>
          <CardContent>
            <Typography variant='h6' className='mbe-4' color='text.primary'>
              Quick Actions
            </Typography>
            <div className='flex flex-wrap gap-4'>
              <Link href={getLocalizedUrl('/admin/users', locale)} className='no-underline' title='Users'>
                <CustomAvatar size={48} variant='rounded' skin='light' color='primary' className='cursor-pointer hover:shadow-md transition-shadow'>
                  <i className='ri-user-line text-2xl' />
                </CustomAvatar>
              </Link>
              <Link href={getLocalizedUrl('/admin/videos', locale)} className='no-underline' title='Videos'>
                <CustomAvatar size={48} variant='rounded' skin='light' color='success' className='cursor-pointer hover:shadow-md transition-shadow'>
                  <i className='ri-video-line text-2xl' />
                </CustomAvatar>
              </Link>
              <Link href={getLocalizedUrl('/admin/logs', locale)} className='no-underline' title='Logs'>
                <CustomAvatar size={48} variant='rounded' skin='light' color='warning' className='cursor-pointer hover:shadow-md transition-shadow'>
                  <i className='ri-file-list-line text-2xl' />
                </CustomAvatar>
              </Link>
              <Link href={getLocalizedUrl('/admin/subscriptions', locale)} className='no-underline' title='Subscriptions'>
                <CustomAvatar size={48} variant='rounded' skin='light' color='info' className='cursor-pointer hover:shadow-md transition-shadow'>
                  <i className='ri-vip-crown-line text-2xl' />
                </CustomAvatar>
              </Link>
              <Link href={getLocalizedUrl('/admin/cycles', locale)} className='no-underline' title='Cycles'>
                <CustomAvatar size={48} variant='rounded' skin='light' color='primary' className='cursor-pointer hover:shadow-md transition-shadow'>
                  <i className='ri-calendar-line text-2xl' />
                </CustomAvatar>
              </Link>
              <Link href={getLocalizedUrl('/admin/gifts', locale)} className='no-underline' title='Gifts'>
                <CustomAvatar size={48} variant='rounded' skin='light' color='error' className='cursor-pointer hover:shadow-md transition-shadow'>
                  <i className='ri-gift-line text-2xl' />
                </CustomAvatar>
              </Link>
              <Link href={getLocalizedUrl('/admin/notifications', locale)} className='no-underline' title='Notifications'>
                <CustomAvatar size={48} variant='rounded' skin='light' color='secondary' className='cursor-pointer hover:shadow-md transition-shadow'>
                  <i className='ri-notification-line text-2xl' />
                </CustomAvatar>
              </Link>
            </div>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}

export default AdminDashboard
