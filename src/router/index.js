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
      path: '/auth/success',
      name: 'auth-success',
      component: () => import('@/views/AuthCallback.vue'),
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
      path: '/timeline',
      name: 'timeline',
      component: () => import('@/views/TimelineView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/viewer',
      name: 'viewer',
      component: () => import('@/views/ViewerView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/stress-test',
      name: 'stress-test',
      component: () => import('@/views/StressTestView.vue'),
      meta: { requiresAuth: true },
    },
  ],
})

// Navigation guards
router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  
  // If trying to access login page, redirect logged-in users to dashboard/profile
  if (to.name === 'login') {
    if (userStore.isLoggedIn) {
      next({ name: userStore.selectedTeam ? 'dashboard' : 'profile' })
    } else {
      next()
    }
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
