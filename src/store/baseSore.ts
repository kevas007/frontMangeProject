import { defineStore } from 'pinia'
import axios from 'axios'
import { type Project,type UserLogin,type User } from '@/type'
import router from '@/router' // Assurez-vous que le chemin est correct

export const baseStore = defineStore('baseStore', {
  state: () => ({
    token: null as string | null,
    projects: [] as Project[],
    isLoggedIn: false,
    UserLogin: {
      email:'',
      password:''
    } as UserLogin,
    user: null as User | null,

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
      const userData = localStorage.getItem('userData');
      if (userData) {
        try {
          this.user = JSON.parse(userData) as User;
         
        } catch (error) {
          console.error("Erreur lors du parsing de l'utilisateur :", error);
          this.user = null;
        }
      } else {
        this.user = null;
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
        
      } catch (error) {
        console.error(error)
      }
   },
   async loginUser(){
    try {
      const response = await axios.post('http://localhost:8000/api/v1/auth/login', this.UserLogin)
  
      
      // Selon la structure de votre réponse Laravel
      const token = response.data.token 
      const user = JSON.stringify(response.data.user)

      // Sauvegarde du token dans le localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('userData',user);
  
      alert(response.data.message)
  
      // Redirige l'utilisateur vers la page d'accueil après une connexion réussie
   
      this.isLoggedIn = true

      // Redirection après une connexion réussie
      this.redirectToHome()
      
    } catch (error) {
      alert( 'Login failed')
    }
   },
   async logoutUser() {
    try {
      if (!this.user?.id) {
        throw new Error("Utilisateur non identifié.");
      }
  
      const response = await axios.post(
        `http://localhost:8000/api/v1/logout/${this.user.id}`,
        {}, // Pas besoin d'envoyer de données ici
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.token}`,  // Ajout du token correct
          },
          withCredentials: true // 🔥 Ajoute ceci si tu utilises Laravel Sanctum
        }
      );
  
      // Supprime les données stockées
      localStorage.clear();
  
      // Mise à jour du store
      this.token = null;
      this.isLoggedIn = false;
      this.user = null;
  
      alert(response.data.message || "Déconnexion réussie !");
      window.location.reload(); // Recharge la page
    } catch (error) {
      console.error("Erreur lors de la déconnexion :", error);
      alert(error.response?.data?.error || "Déconnexion échouée, veuillez réessayer.");
    }
  }
  
  

  }
})
