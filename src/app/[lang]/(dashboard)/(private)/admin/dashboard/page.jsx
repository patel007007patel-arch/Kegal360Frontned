'use client'

// React Imports
import { useState, useEffect } from 'react'

// Next Imports
import { useParams } from 'next/navigation'
import Link from 'next/link'

// MUI Imports
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import { toast } from 'react-toastify'
import { useColorScheme } from '@mui/material/styles'

// Components Imports
import CardStatVertical from '@components/card-statistics/Vertical'
import LineChart from '@views/dashboards/analytics/LineChart'
import BarChart from '@views/dashboards/analytics/BarChart'
import RadialBarChart from '@views/dashboards/analytics/RadialBarChart'
import TotalTransactions from '@views/dashboards/analytics/TotalTransactions'
import ActivityTimeline from '@views/dashboards/analytics/ActivityTimeline'
import WeeklySales from '@views/dashboards/analytics/WeeklySales'
import VisitsByDay from '@views/dashboards/analytics/VisitsByDay'
import SalesCountry from '@views/dashboards/analytics/SalesCountry'
import Performance from '@views/dashboards/analytics/Performance'
import ProjectStatistics from '@views/dashboards/analytics/ProjectStatistics'
import TopReferralSources from '@views/dashboards/analytics/TopReferralSources'
import CustomAvatar from '@core/components/mui/Avatar'
import { adminAPI } from '@/utils/api'
import { useAuthToken } from '@/hooks/useAuthToken'

// Util Imports
import { getLocalizedUrl } from '@/utils/i18n'

const AdminDashboard = () => {
  const params = useParams()
  const { lang: locale } = params
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const { isReady, isLoading } = useAuthToken()
  const { mode } = useColorScheme()
  
  // Get server mode for components that need it
  const serverMode = mode === 'system' ? 'light' : mode || 'light'

  useEffect(() => {
    const fetchStats = async () => {
      if (!isReady || isLoading) return

      try {
        const response = await adminAPI.getDashboardStats()
        setStats(response.data.stats)
      } catch (error) {
        toast.error(error.message || 'Error fetching dashboard stats')
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [isReady, isLoading])

  if (loading || isLoading) {
    return (
      <Grid container spacing={6}>
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardContent>
              <Typography>Loading dashboard...</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    )
  }

  // Calculate percentages for trends
  const userGrowthPercent = stats?.totalUsers > 0 && stats?.recentUsers > 0 
    ? Math.round((stats.recentUsers / stats.totalUsers) * 100) 
    : 0
  const premiumPercent = stats?.totalUsers > 0 && stats?.premiumUsers > 0
    ? Math.round((stats.premiumUsers / stats.totalUsers) * 100)
    : 0

  return (
    <Grid container spacing={6}>
      {/* Welcome Card */}
      <Grid size={{ xs: 12, md: 8 }}>
        <Card className='relative bs-full' sx={{ background: 'linear-gradient(135deg, #FF6BB5 0%, #FFB3D9 100%)' }}>
          <CardContent className='sm:pbe-0'>
            <Grid container spacing={6}>
              <Grid size={{ xs: 12, md: 8 }} className='flex flex-col items-start gap-4'>
                <Typography variant='h4' sx={{ color: 'white', fontWeight: 'bold' }}>
                  Welcome to K360 Admin! 🎉
                </Typography>
                <div>
                  <Typography sx={{ color: 'rgba(255,255,255,0.9)' }}>
                    You have {stats?.totalUsers || 0} total users in your platform.
                  </Typography>
                  <Typography sx={{ color: 'rgba(255,255,255,0.9)' }}>
                    {stats?.recentUsers || 0} new users joined in the last 30 days.
                  </Typography>
                </div>
                <Link href={getLocalizedUrl('/admin/users', locale)} className='no-underline'>
                  <button
                    style={{
                      padding: '10px 20px',
                      backgroundColor: 'white',
                      color: '#FF6BB5',
                      border: 'none',
                      borderRadius: '8px',
                      fontWeight: 'bold',
                      cursor: 'pointer'
                    }}
                  >
                    View All Users
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

      {/* Main Statistics Cards */}
      <Grid size={{ xs: 12, sm: 6, md: 2 }}>
        <CardStatVertical
          stats={stats?.totalUsers || 0}
          title='Total Users'
          trendNumber={`${userGrowthPercent}%`}
          trend='positive'
          chipText='Last 30 Days'
          avatarColor='primary'
          avatarIcon='ri-user-line'
          avatarSkin='light'
          chipColor='primary'
        />
      </Grid>

      <Grid size={{ xs: 12, sm: 6, md: 2 }}>
        <LineChart />
      </Grid>

      <Grid size={{ xs: 12, md: 8 }}>
        <TotalTransactions />
      </Grid>

      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
        <Performance />
      </Grid>

      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
        <ProjectStatistics serverMode={serverMode} />
      </Grid>

      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
        <Grid container spacing={6}>
          <Grid size={{ xs: 6 }}>
            <BarChart />
          </Grid>
          <Grid size={{ xs: 6 }}>
            <CardStatVertical
              stats={stats?.activeUsers || 0}
              avatarColor='success'
              trendNumber=''
              title='Active Users'
              chipText='Currently Active'
              avatarIcon='ri-user-heart-line'
              avatarSkin='light'
              chipColor='secondary'
            />
          </Grid>
          <Grid size={{ xs: 6 }}>
            <CardStatVertical
              stats={stats?.premiumUsers || 0}
              avatarColor='warning'
              trendNumber={`${premiumPercent}%`}
              trend='positive'
              title='Premium Users'
              chipText='Subscribed'
              avatarIcon='ri-vip-crown-line'
              avatarSkin='light'
              chipColor='secondary'
            />
          </Grid>
          <Grid size={{ xs: 6 }}>
            <RadialBarChart />
          </Grid>
        </Grid>
      </Grid>

      <Grid size={{ xs: 12, sm: 6, md: 2 }}>
        <CardStatVertical
          stats={stats?.totalLogs || 0}
          title='Total Logs'
          trendNumber=''
          chipText='All Time'
          avatarColor='info'
          avatarIcon='ri-file-list-line'
          avatarSkin='light'
          chipColor='info'
        />
      </Grid>

      <Grid size={{ xs: 12, sm: 6, md: 2 }}>
        <CardStatVertical
          stats={stats?.totalCycles || 0}
          title='Total Cycles'
          trendNumber=''
          chipText='Tracked'
          avatarColor='success'
          avatarIcon='ri-calendar-line'
          avatarSkin='light'
          chipColor='success'
        />
      </Grid>

      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
        <SalesCountry />
      </Grid>

      <Grid size={{ xs: 12, md: 8 }}>
        <TopReferralSources />
      </Grid>

      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
        <WeeklySales />
      </Grid>

      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
        <VisitsByDay />
      </Grid>

      <Grid size={{ xs: 12, md: 8 }}>
        <ActivityTimeline />
      </Grid>

      {/* Quick Actions */}
      <Grid size={{ xs: 12 }}>
        <Card>
          <CardContent>
            <Typography variant='h6' className='mbe-4'>
              Quick Actions
            </Typography>
            <div className='flex flex-wrap gap-4'>
              <Link href={getLocalizedUrl('/admin/users', locale)} className='no-underline'>
                <CustomAvatar size={48} variant='rounded' skin='light' color='primary' className='cursor-pointer hover:shadow-md transition-shadow'>
                  <i className='ri-user-line text-2xl' />
                </CustomAvatar>
              </Link>
              <Link href={getLocalizedUrl('/admin/videos', locale)} className='no-underline'>
                <CustomAvatar size={48} variant='rounded' skin='light' color='success' className='cursor-pointer hover:shadow-md transition-shadow'>
                  <i className='ri-video-line text-2xl' />
                </CustomAvatar>
              </Link>
              <Link href={getLocalizedUrl('/admin/logs', locale)} className='no-underline'>
                <CustomAvatar size={48} variant='rounded' skin='light' color='warning' className='cursor-pointer hover:shadow-md transition-shadow'>
                  <i className='ri-file-list-line text-2xl' />
                </CustomAvatar>
              </Link>
              <Link href={getLocalizedUrl('/admin/subscriptions', locale)} className='no-underline'>
                <CustomAvatar size={48} variant='rounded' skin='light' color='info' className='cursor-pointer hover:shadow-md transition-shadow'>
                  <i className='ri-vip-crown-line text-2xl' />
                </CustomAvatar>
              </Link>
              <Link href={getLocalizedUrl('/admin/cycles', locale)} className='no-underline'>
                <CustomAvatar size={48} variant='rounded' skin='light' color='primary' className='cursor-pointer hover:shadow-md transition-shadow'>
                  <i className='ri-calendar-line text-2xl' />
                </CustomAvatar>
              </Link>
              <Link href={getLocalizedUrl('/admin/gifts', locale)} className='no-underline'>
                <CustomAvatar size={48} variant='rounded' skin='light' color='error' className='cursor-pointer hover:shadow-md transition-shadow'>
                  <i className='ri-gift-line text-2xl' />
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
