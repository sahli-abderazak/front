"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { CandidatsTabs } from "../components/candidat/candidat-tabs"
import { DashboardHeaderRec } from "../components/recruteur/dashboard-header_rec"
import { DashboardSidebarRec } from "../components/recruteur/dashboard-sidebar_rec"

export default function ReviewsPage() {
  const router = useRouter()
  const [refreshTrigger, setRefreshTrigger] = useState(false)
  const [refreshTable, setRefreshTable] = useState(false)
  const [shouldRender, setShouldRender] = useState(false)

  const handleUserAdded = () => {
    setRefreshTable((prev) => !prev) // Bascule l'état pour déclencher un rafraîchissement
  }

  const handleRecruiterAdded = () => {
    setRefreshTrigger((prev) => !prev)
  }

  useEffect(() => {
    // Vérifier le rôle de l'utilisateur avant de rendre la page
    const checkUserRole = async () => {
      try {
        const token = localStorage.getItem("token")
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
        console.error("Erreur:", error)
        // En cas d'erreur, rediriger vers la page d'accueil
        router.push("/")
      }
    }

    checkUserRole()
  }, [router])

  // Ne rien afficher jusqu'à ce que la vérification soit terminée
  if (!shouldRender) {
    return null
  }

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
                <h1 className="text-3xl font-bold tracking-tight">Candidats</h1>
                <p className="text-muted-foreground">Gérer et suivre les candidats</p>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
              <CandidatsTabs refresh={refreshTable} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
