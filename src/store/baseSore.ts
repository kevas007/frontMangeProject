import { defineStore } from 'pinia'
import axios from 'axios'
import { type Project, type UserLogin, type User, type ShowProject, type State } from '@/type'
import router from '@/router' // Assurez-vous que le chemin est correct

export const baseStore = defineStore('baseStore', {
  state: () => ({
    token: null as string | null,
    projects: [] as Project[],
    isLoggedIn: false,
    UserLogin: {
      email: '',
      password: '',
    } as UserLogin,
    user: null as User | null,
    currentProject: null as ShowProject | null,
    states: null as State | null,
  }),

  actions: {
    redirectToHome() {
      router.push('/')
    },
    getToken() {
      const gettoken = localStorage.getItem('token')
      this.token = gettoken
      if (gettoken) {
        this.isLoggedIn = true
      }
    },
    getUser() {
      const userData = localStorage.getItem('userData')
      if (userData) {
        try {
          this.user = JSON.parse(userData) as User
        } catch (error) {
          console.error("Erreur lors du parsing de l'utilisateur :", error)
          this.user = null
        }
      } else {
        this.user = null
      }
    },
    async getAllProjects() {
      this.getToken()
      try {
        const response = await axios.get('http://localhost:8000/api/v1/projects', {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.token}`,
          },
        })
        this.projects = response.data.data
        console.log(this.projects)
      } catch (error) {
        console.error(error)
      }
    },
    async getProject(id: number) {
      this.getToken()

      try {
        const response = await axios.get(`http://localhost:8000/api/v1/project/${id}`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.token}`,
          },
        })

        this.currentProject = response.data.data // Crée une variable dédiée au projet
        console.log(this.currentProject)
        router.push(`/projects/${id}`)
      } catch (error: any) {
        console.error('Erreur lors de la récupération du projet :', error)
        alert(error.response?.data?.message || 'Échec de la récupération du projet.')
      }
    },
    async getAllUser() {
      this.getToken()

      try {
        const response = await axios.get(`http://localhost:8000/api/v1/users`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.token}`,
          },
        })

        this.user = response.data.data // Crée une variable dédiée au projet
        console.log(this.user + 'fefertet')
      } catch (error: any) {
        console.error('Erreur lors de la récupération des users :', error)
        alert(error.response?.data?.message || 'Échec de la récupération users.')
      }
    },
    async loginUser() {
      try {
        const response = await axios.post('http://localhost:8000/api/v1/auth/login', this.UserLogin)

        // Selon la structure de votre réponse Laravel
        const token = response.data.token
        const user = JSON.stringify(response.data.user)

        // Sauvegarde du token dans le localStorage
        localStorage.setItem('token', token)
        localStorage.setItem('userData', user)

        alert(response.data.message)

        // Redirige l'utilisateur vers la page d'accueil après une connexion réussie

        this.isLoggedIn = true

        // Redirection après une connexion réussie
        this.redirectToHome()
      } catch (error) {
        alert('Login failed')
      }
    },
    async logoutUser() {
      try {
        if (!this.user?.id) {
          throw new Error('Utilisateur non identifié.')
        }

        const response = await axios.post(
          `http://localhost:8000/api/v1/logout/${this.user.id}`,
          {}, // Pas besoin d'envoyer de données ici
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${this.token}`, // Ajout du token correct
            },
            withCredentials: true, // 🔥 Ajoute ceci si tu utilises Laravel Sanctum
          },
        )

        // Supprime les données stockées
        localStorage.clear()

        // Mise à jour du store
        this.token = null
        this.isLoggedIn = false
        this.user = null

        alert(response.data.message || 'Déconnexion réussie !')
        window.location.reload() // Recharge la page
      } catch (error) {
        console.error('Erreur lors de la déconnexion :', error)
      }
    },
    async allState() {
      this.getToken()

      try {
        const response = await axios.get(`http://localhost:8000/api/v1/states`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.token}`,
          },
        })

        this.states = response.data.data // Crée une variable dédiée au projet
        console.log(this.states)
      } catch (error: any) {
        console.error('Erreur lors de la récupération du projet :', error)
        alert(error.response?.data?.message || 'Échec de la récupération du projet.')
      }
    },
    async updateProject(
      id: number,
      data: {
        name: string
        description: string
        deadline: string
        users: number[] // IDs
        state_id: number
      },
    ) {
      this.getToken()

      try {
        // 1. Mise à jour du projet (hors utilisateurs)
        await axios.put(
          `http://localhost:8000/api/v1/project/${id}/update`,
          {
            name: data.name,
            description: data.description,
            deadline: data.deadline,
            state_id: data.state_id,
          },
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${this.token}`,
            },
          },
        )

        // 2. Synchronisation des utilisateurs même si vide
        await axios.post(
          `http://localhost:8000/api/v1/project/${id}`,
          {
            user_id: data.users || [], // tableau d'IDs
          },
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${this.token}`,
            },
          },
        )

        // 3. Recharge le projet pour voir les changements
      } catch (error) {
        console.error('Erreur updateProject:', error)
        throw error
      }
    },
    async deleteProject(id: number) {
      this.getToken()

      try {
        // 1. Mise à jour du projet
        await axios.delete(`http://localhost:8000/api/v1/project/${id}/delete`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.token}`,
          },
        })
      } catch (error) {
        console.error('Erreur updateProject:', error)
        throw error
      }
    },
    async createProject(data: {
      name: string
      description: string
      deadline: string
      users: number[] // IDs
      state_id: number
    }) {
      this.getToken()

      try {
        // 1. Mise à jour du projet
        await axios.post(
          `http://localhost:8000/api/v1/project`,
          {
            name: data.name,
            description: data.description,
            deadline: data.deadline,
            state_id: data.state_id,
            ...(data.users?.length ? { users: data.users } : {}), // n’envoie que si non vide
          },
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${this.token}`,
            },
          },
        )
      } catch (error) {
        console.error('createv:', error)
        throw error
      }
    },
  },
})
