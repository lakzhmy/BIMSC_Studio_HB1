import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/userStore'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'login',
      component: () => import('@/views/LoginView.vue'),
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('@/views/ProfileSetup.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('@/views/DashboardView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/kpi',
      name: 'kpi',
      component: () => import('@/views/KPIDashboardView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/meetings',
      name: 'meetings',
      component: () => import('@/views/MeetingsView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/actions',
      name: 'actions',
      component: () => import('@/views/ActionsView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/viewer',
      name: 'viewer',
      component: () => import('@/views/ViewerView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/teams',
      name: 'teams',
      component: () => import('@/views/TeamsView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/teams/:id',
      name: 'team-detail',
      component: () => import('@/views/TeamDetailView.vue'),
      meta: { requiresAuth: true },
    },
  ],
})

// Navigation guards
router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  
  // If trying to access login page, allow it (don't redirect even if logged in)
  if (to.name === 'login') {
    next()
  }
  // If trying to access protected route without being logged in
  else if (to.meta.requiresAuth && !userStore.isLoggedIn) {
    next({ name: 'login' })
  }
  // If logged in but no team selected, go to profile
  else if (to.name === 'dashboard' && !userStore.selectedTeam) {
    next({ name: 'profile' })
  } else {
    next()
  }
})

export default router
