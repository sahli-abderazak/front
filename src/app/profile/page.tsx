"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import UserMetaCard from "../components/profile/UserMetaCard"
import { DashboardHeaderRec } from "../components/recruteur/dashboard-header_rec"
import { DashboardSidebarRec } from "../components/recruteur/dashboard-sidebar_rec"

export default function Profile() {
  const router = useRouter()
  const [shouldRender, setShouldRender] = useState(false)

  useEffect(() => {
    // Vérifier le rôle de l'utilisateur avant de rendre la page
    const checkUserRole = async () => {
      try {
        const token = sessionStorage.getItem("token")
        if (!token) {
          // Rediriger vers la page de connexion si pas de token
          router.push("/")
          return
        }

        const response = await fetch("http://127.0.0.1:8000/api/users/profile", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          throw new Error("Erreur lors de la récupération des données")
        }

        const userData = await response.json()

        // Si l'utilisateur est un admin, rediriger vers le dashboard admin
        if (userData.role === "admin") {
          router.push("/dashbord")
          // Ne pas rendre la page
          return
        }

        // Si l'utilisateur est un recruteur, autoriser le rendu de la page
        if (userData.role === "recruteur") {
          setShouldRender(true)
        } else {
          // Si autre rôle, rediriger vers la page d'accueil
          router.push("/")
        }
      } catch (error) {
        // En cas d'erreur, rediriger vers la page d'accueil
        router.push("/dashbord")
      }
    }

    checkUserRole()
  }, [router])

  // Ne rien afficher jusqu'à ce que la vérification soit terminée
  if (!shouldRender) {
    return null
  }

  // Afficher la page de profil uniquement pour les recruteurs
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <DashboardHeaderRec />
      <div className="container mx-auto p-4 md:p-6 lg:p-8 pt-6">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
          {/* Sidebar */}
          <div className="hidden md:block md:col-span-1 lg:col-span-1">
            <div className="sticky top-20">
              <DashboardSidebarRec />
            </div>
          </div>

          {/* Main Content */}
          <div className="md:col-span-5 lg:col-span-5 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
                <p className="text-muted-foreground">Gérer vos informations personnelles</p>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
              <div className="space-y-6">
                <UserMetaCard />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
