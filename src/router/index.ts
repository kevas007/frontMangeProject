import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../views/project/IndexView.vue'),
      meta: { requiresAuth: true }, // Page protégée
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('@/components/Register.vue'),
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
    },
    {
      path: '/ajouter',
      name: 'ajouter',
      component: () => import('../views/project/AddView.vue'),
    },
    {
      path: '/projects/:id',
      name: 'ProjectDetails',
      component: () => import('../views/project/ShowView.vue'),
    },
  ],
})

// Guard de navigation
router.beforeEach((to, from, next) => {
  const isAuthenticated = !!localStorage.getItem('userData')

  if (to.name !== 'login' && to.name !== 'register' && !isAuthenticated) {
    next({ name: 'login' })
  } else {
    next()
  }
})

export default router
