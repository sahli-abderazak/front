"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Home, Users, Building2, Briefcase, Star, LogOut, MessageSquare } from "lucide-react"

const menuItems = [
  { icon: <Home className="h-4 w-4" />, label: "Dashboard", href: "/dashbord" },
  { icon: <Users className="h-4 w-4" />, label: "Recruteurs", href: "/employees" },
  { icon: <Building2 className="h-4 w-4" />, label: "Archive", href: "/archive" },
  //{ icon: <Calendar className="h-4 w-4" />, label: "Calendar", href: "/calendar" },
  { icon: <Briefcase className="h-4 w-4" />, label: "Offre", href: "/offre_admin" },
  { icon: <Star className="h-4 w-4" />, label: "Témoiniages", href: "/temoiniage_admin" },
  { icon: <MessageSquare className="h-4 w-4" />, label: "Messages", href: "/contact_admin" },
  //{ icon: <Star className="h-4 w-4" />, label: "Reviews", href: "/reviews" },
  //{ icon: <BarChart className="h-4 w-4" />, label: "Reports", href: "/reports" },
  //{ icon: <Settings className="h-4 w-4" />, label: "Settings", href: "/settings" },
  
]

export function DashboardSidebar() {
  const router = useRouter()

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("token")

      if (!token) {
        console.error("Aucun token trouvé")
        return
      }

      const response = await fetch("http://127.0.0.1:8000/api/logout", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })
      

      if (!response.ok) {
        console.error("Erreur lors de la déconnexion")
        return
      }

      // Supprimer le token localement
      localStorage.removeItem("token")

      // Rediriger vers la page d'accueil ou de connexion
      router.push("/")

    } catch (error) {
      console.error("Erreur lors de la déconnexion :", error)
    }
  }

  return (
    <div className="flex flex-col h-full space-y-4 bg-white">
      <div className="flex-1 space-y-1">
        {menuItems.map((item) => (
          <Button key={item.href} variant="ghost" className="w-full justify-start" asChild>
            <Link href={item.href}>
              {item.icon}
              <span className="ml-2">{item.label}</span>
            </Link>
          </Button>
        ))}
      </div>

      {/* Bouton Logout */}
      <Button 
        variant="ghost" 
        className="w-full justify-start text-red-500" 
        onClick={handleLogout}
      >
        <LogOut className="h-4 w-4" />
        <span className="ml-2">Déconnexion</span>
      </Button>
    </div>
  )
}