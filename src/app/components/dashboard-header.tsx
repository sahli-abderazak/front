"use client"

import type React from "react"
import { MessageSquare } from "lucide-react"
import { useEffect, useState } from "react"
import { Search, Bell, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { MobileSidebar } from "./mobile-sidebar"

interface Notification {
  id: number
  type: string
  message: string
  data: any
  read: boolean
  created_at: string
}

interface UserProps {
  nom: string
  prenom: string
  image: string | null
  nom_societe?: string
  role?: string
}

export function DashboardHeader() {
  const [user, setUser] = useState<UserProps | null>(null)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    // Fetch user info
    fetch("http://localhost:8000/api/users/profile", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        Accept: "application/json",
      },
    })
      .then((response) => response.json())
      .then((data) => setUser(data))
      .catch((error) => console.error("Erreur lors de la récupération des infos utilisateur :", error))

    // Fetch notifications
    fetchNotifications()

    // Set up polling to check for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchNotifications = () => {
    fetch("http://localhost:8000/api/notifications", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        Accept: "application/json",
      },
    })
      .then((response) => response.json())
      .then((data) => {
        // Add null checks to handle unexpected response structure
        setNotifications(data?.notifications || [])
        setUnreadCount(data?.unread_count || 0)
      })
      .catch((error) => {
        console.error("Erreur lors de la récupération des notifications :", error)
        // Set default values on error
        setNotifications([])
        setUnreadCount(0)
      })
  }

  const markAsRead = (notification: Notification) => {
    fetch(`http://localhost:8000/api/notifications/${notification.id}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        Accept: "application/json",
      },
    })
      .then(() => {
        // Update local state
        setNotifications(notifications.map((n) => (n.id === notification.id ? { ...n, read: true } : n)))
        setUnreadCount(Math.max(0, unreadCount - 1))

        // Handle navigation based on notification type
        if (notification.type === "new_job_offer") {
          // Navigate to job offer details
          window.location.href = `/offre_admin`
        } else if (notification.type === "new_recruiter") {
          // Navigate to recruiter details or list
          window.location.href = `/employees`
        } else if (notification.type === "new_contact") {
          // Navigate to contact message details
          window.location.href = `/contact_admin`
        } else if (notification.type === "new_testimonial") {
          // Navigate to testimonial details or list
          window.location.href = `/temoiniage_admin`
        }
      })
      .catch((error) => console.error("Erreur lors du marquage de la notification comme lue :", error))
  }

  const markAllAsRead = () => {
    fetch("http://localhost:8000/api/notifications", {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        Accept: "application/json",
      },
    })
      .then(() => {
        // Update local state
        setNotifications(
          notifications.map((notification) => ({
            ...notification,
            read: true,
          })),
        )
        setUnreadCount(0)
      })
      .catch((error) => console.error("Erreur lors du marquage de toutes les notifications comme lues :", error))
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  // Function to approve a testimonial
  const approveTestimonial = (e: React.MouseEvent, testimonialId: number, notificationId: number) => {
    e.stopPropagation() // Prevent triggering the parent onClick

    fetch(`http://localhost:8000/api/temoignages/${testimonialId}/approve`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        Accept: "application/json",
      },
    })
      .then(() => {
        // Mark notification as read
        fetch(`http://localhost:8000/api/notifications/${notificationId}`, {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            Accept: "application/json",
          },
        }).then(() => {
          // Remove the notification from the list
          setNotifications(notifications.filter((n) => n.id !== notificationId))
          setUnreadCount(Math.max(0, unreadCount - 1))

          // Show success message
          alert("Témoignage approuvé avec succès !")
        })
      })
      .catch((error) => console.error("Erreur lors de l'approbation du témoignage :", error))
  }

  // Function to reject a testimonial
  const rejectTestimonial = (e: React.MouseEvent, testimonialId: number, notificationId: number) => {
    e.stopPropagation() // Prevent triggering the parent onClick

    fetch(`http://localhost:8000/api/temoignages/${testimonialId}/reject`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        Accept: "application/json",
      },
    })
      .then(() => {
        // Mark notification as read
        fetch(`http://localhost:8000/api/notifications/${notificationId}`, {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            Accept: "application/json",
          },
        }).then(() => {
          // Remove the notification from the list
          setNotifications(notifications.filter((n) => n.id !== notificationId))
          setUnreadCount(Math.max(0, unreadCount - 1))

          // Show success message
          alert("Témoignage rejeté avec succès !")
        })
      })
      .catch((error) => console.error("Erreur lors du rejet du témoignage :", error))
  }

  // Function to get notification title based on type
  const getNotificationTitle = (type: string) => {
    switch (type) {
      case "new_recruiter":
        return "Nouveau recruteur"
      case "new_job_offer":
        return "Nouvelle offre d'emploi"
      case "new_contact":
        return "Nouveau message de contact"
      case "new_testimonial":
        return "Nouveau témoignage"
      default:
        return "Notification"
    }
  }

  // Function to render notification details based on type
  const renderNotificationDetails = (notification: Notification) => {
    switch (notification.type) {
      case "new_recruiter":
        return (
          <div className="text-xs text-muted-foreground mt-2 p-2 bg-purple-50 dark:bg-purple-950/30 rounded-md border-l-2 border-purple-500">
            <div>
              Société: <span className="font-medium">{notification.data.company}</span>
            </div>
          </div>
        )
      case "new_job_offer":
        return (
          <div className="text-xs text-muted-foreground mt-2 p-2 bg-blue-50 dark:bg-blue-950/30 rounded-md border-l-2 border-blue-500">
            <div>
              Poste: <span className="font-medium">{notification.data.position}</span>
            </div>
            <div>
              Département: <span className="font-medium">{notification.data.department}</span>
            </div>
            <div>
              Ajouté par: <span className="font-medium">{notification.data.company}</span>
            </div>
          </div>
        )
      case "new_contact":
        return (
          <div className="text-xs text-muted-foreground mt-2 p-2 bg-amber-50 dark:bg-amber-950/30 rounded-md border-l-2 border-amber-500">
            <div>
              De: <span className="font-medium">{notification.data.name}</span> (
              <span className="text-amber-700 dark:text-amber-400">{notification.data.email}</span>)
            </div>
            <div>
              Sujet: <span className="font-medium">{notification.data.subject}</span>
            </div>
            <div className="mt-1 italic bg-white dark:bg-black/20 p-1 rounded">{notification.data.message_preview}</div>
          </div>
        )
      case "new_testimonial":
        return (
          <div className="text-xs text-muted-foreground mt-2 p-2 bg-green-50 dark:bg-green-950/30 rounded-md border-l-2 border-green-500">
            <div>
              De: <span className="font-medium">{notification.data.name}</span> (
              <span className="text-green-700 dark:text-green-400">{notification.data.email}</span>)
            </div>
            <div className="mt-1 italic bg-white dark:bg-black/20 p-1 rounded">
              {notification.data.testimonial_preview}
            </div>
            <div className="mt-2 flex items-center justify-end gap-2">
              {/* Action buttons are commented out in the original code */}
            </div>
          </div>
        )
      default:
        return null
    }
  }

  // Ajouter la fonction handleLogout
  const handleLogout = () => {
    // Appel à l'API de déconnexion
    fetch("http://localhost:8000/api/logout", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        Accept: "application/json",
      },
    })
      .then((response) => response.json())
      .then(() => {
        // Supprimer le token localement
        localStorage.removeItem("token")

        // Rediriger vers la page d'accueil
        window.location.href = "/"
      })
      .catch((error) => {
        console.error("Erreur lors de la déconnexion :", error)
        // En cas d'erreur, on supprime quand même le token et on redirige
        localStorage.removeItem("token")
        window.location.href = "/"
      })
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          {/* Mobile sidebar trigger */}
          <MobileSidebar />

          <a href="/dashbord_rec" className="flex items-center space-x-2">
            <img src="/Logo.jpeg" alt="Logo" className="h-10 w-auto" />
            <span className="font-bold hidden sm:inline">Admin Dashboard</span>
          </a>
        </div>

        {/* Search - hidden on mobile, shown on md and up */}

        <div className="flex items-center gap-2">
          {/* Mobile search trigger */}
          <Button variant="ghost" size="icon" className="md:hidden">
            <Search className="h-5 w-5" />
          </Button>

          {/* Message Icon */}
          <Button
            variant="ghost"
            size="icon"
            className="relative"
            onClick={() => (window.location.href = "/chatAdmin")}
          >
            <MessageSquare className="h-5 w-5" />
          </Button>

          {/* Notifications Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 px-1.5 py-0.5 min-w-[18px] h-[18px] flex items-center justify-center text-xs bg-red-500 text-white border-0">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[350px] p-0 rounded-xl shadow-lg border-0">
              <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 rounded-t-xl">
                <h3 className="font-semibold text-purple-700 dark:text-purple-300">Notifications</h3>
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={markAllAsRead}
                    className="text-xs h-7 text-purple-600 hover:text-purple-800 hover:bg-purple-100 dark:text-purple-400 dark:hover:bg-purple-800"
                  >
                    Tout marquer comme lu
                  </Button>
                )}
              </div>
              <div className="max-h-[400px] overflow-y-auto">
                {notifications?.length === 0 ? (
                  <div className="p-8 text-center">
                    <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-20" />
                    <p className="text-muted-foreground">Aucune notification</p>
                  </div>
                ) : (
                  notifications?.map((notification) => (
                    <DropdownMenuItem
                      key={notification.id}
                      className={`p-4 cursor-pointer border-b last:border-b-0 hover:bg-purple-50 dark:hover:bg-purple-950 transition-colors ${!notification.read ? "bg-purple-50/70 dark:bg-purple-950/50" : ""}`}
                      onClick={() => markAsRead(notification)}
                    >
                      <div className="flex gap-3 w-full">
                        <div
                          className={`flex-shrink-0 w-2 h-2 mt-2 rounded-full ${!notification.read ? "bg-purple-500" : "bg-transparent"}`}
                        />
                        <div className="flex flex-col gap-1 w-full">
                          <div className="flex items-start justify-between">
                            <span className="font-medium text-purple-700 dark:text-purple-300">
                              {getNotificationTitle(notification.type)}
                            </span>
                            <span className="text-xs text-muted-foreground ml-2">
                              {formatDate(notification.created_at)}
                            </span>
                          </div>
                          <p className="text-sm">{notification.message}</p>
                          {renderNotificationDetails(notification)}
                          {!notification.read && notification.type !== "new_testimonial" && (
                            <div className="flex justify-end mt-2">
                              <Badge
                                variant="secondary"
                                className="text-xs bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300"
                              >
                                Nouveau
                              </Badge>
                            </div>
                          )}
                        </div>
                      </div>
                    </DropdownMenuItem>
                  ))
                )}
              </div>
              {notifications?.length > 0 && (
                <div className="p-3 border-t bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 rounded-b-xl">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full bg-white hover:bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900 dark:text-purple-300 dark:border-purple-800 dark:hover:bg-purple-800"
                    onClick={() => (window.location.href = "/notifications_admin")}
                  >
                    Voir toutes les notifications
                  </Button>
                </div>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0">
                <img
                  src={user?.image || "/placeholder.svg?height=40&width=40"}
                  alt="Avatar"
                  className="rounded-full object-cover h-10 w-10"
                />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-64 p-0 rounded-xl shadow-lg border-0">
              <div className="p-4 bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 rounded-t-xl">
                <div className="flex items-center gap-3">
                  <img
                    src={user?.image || "/placeholder.svg?height=60&width=60"}
                    alt="Avatar"
                    className="rounded-full object-cover h-14 w-14 border-2 border-white shadow-md dark:border-gray-800"
                  />
                  <div>
                    <h3 className="font-bold text-lg text-purple-800 dark:text-purple-300">
                      {user?.prenom} {user?.nom}
                    </h3>
                    <p className="text-sm text-purple-600 dark:text-purple-400">{user?.nom_societe}</p>
                  </div>
                </div>
              </div>

              <div className="p-2">
                {/* <DropdownMenuItem className="flex items-center gap-2 p-2 cursor-pointer rounded-md">
                  <User className="h-4 w-4" />
                  <span>Mon profil</span>
                </DropdownMenuItem> */}

                <DropdownMenuItem
                  className="flex items-center gap-2 p-2 cursor-pointer rounded-md text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/50"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4" />
                  <span>Déconnexion</span>
                </DropdownMenuItem>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}

