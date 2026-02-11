// K360 Admin Panel – sidebar menu (no template menu data)

export const getK360AdminMenu = () => [
  { label: 'Dashboard', href: '/admin/dashboard', icon: 'ri-dashboard-line' },
  { label: 'Users', href: '/admin/users', icon: 'ri-user-line' },
  { label: 'Cycle Phases', href: '/admin/cycle-phases', icon: 'ri-calendar-check-line' },
  { label: 'Sequences', href: '/admin/sequences', icon: 'ri-stack-line' },
  { label: 'Sessions', href: '/admin/sessions', icon: 'ri-play-circle-line' },
  { label: 'Steps', href: '/admin/steps', icon: 'ri-list-check' },
  { label: 'Media Library', href: '/admin/media', icon: 'ri-video-line' },
  { label: 'Logs', href: '/admin/logs', icon: 'ri-file-list-line' },
  { label: 'Cycles', href: '/admin/cycles', icon: 'ri-calendar-line' },
  { label: 'Subscriptions', href: '/admin/subscriptions', icon: 'ri-vip-crown-line' },
  { label: 'Gift Subscriptions', href: '/admin/gifts', icon: 'ri-gift-line' },
  { label: 'Notifications', href: '/admin/notifications', icon: 'ri-notification-line' }
]
