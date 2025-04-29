"use client"

import { useEffect, useState } from "react"
import { Bell, Search, CheckCircle, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { useMediaQuery } from "@/app/hooks/use-media-query_notif"

interface Notification {
  id: number
  type: string
  message: string
  data: any
  read: boolean
  created_at: string
}

interface User {
  nom: string
  prenom: string
  image: string | null
  role?: string
}

export default function NotificationsContent() {
  const [user, setUser] = useState<User | null>(null)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTypes, setSelectedTypes] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState("all")

  const isMobile = useMediaQuery("(max-width: 640px)")

  useEffect(() => {
    fetchAdminNotifications()
  }, [])

  useEffect(() => {
    if (isMobile) {
      // Adjust viewport meta tag for mobile
      const viewportMeta = document.querySelector('meta[name="viewport"]')
      if (viewportMeta) {
        viewportMeta.setAttribute(
          "content",
          "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no",
        )
      }

      // Add touch-friendly scrolling
      document.body.style.overscrollBehavior = "contain"

      return () => {
        // Reset when component unmounts
        if (viewportMeta) {
          viewportMeta.setAttribute("content", "width=device-width, initial-scale=1.0")
        }
        document.body.style.overscrollBehavior = "auto"
      }
    }
  }, [isMobile])

  const fetchAdminNotifications = () => {
    fetch("http://127.0.0.1:8000/api/notifications", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        Accept: "application/json",
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`)
        }
        return response.text().then((text) => {
          try {
            return text ? JSON.parse(text) : {}
          } catch (e) {
            console.error("Error parsing JSON:", e, "Response was:", text)
            return {}
          }
        })
      })
      .then((data) => {
        console.log("Admin notifications received:", data)
        // Ensure we're handling the data structure correctly
        const notificationsArray = Array.isArray(data) ? data : data?.notifications || []
        setNotifications(notificationsArray)
        setUnreadCount(notificationsArray.filter((n: Notification) => !n.read).length || 0)

        // Extract all unique notification types for filter
        const types = [...new Set(notificationsArray.map((n: Notification) => n.type) || [])]
        setSelectedTypes(types)
      })
      .catch((error) => {
        console.error("Erreur lors de la récupération des notifications admin :", error)
        setNotifications([])
        setUnreadCount(0)
      })
  }

  const handleNotificationClick = (notification: Notification) => {
    // If notification is unread, mark it as read
    if (!notification.read) {
      fetch(`http://127.0.0.1:8000/api/notifications/${notification.id}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          Accept: "application/json",
        },
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`)
          }
          return response.text().then((text) => {
            try {
              return text ? JSON.parse(text) : {}
            } catch (e) {
              console.error("Error parsing JSON:", e, "Response was:", text)
              return {}
            }
          })
        })
        .then(() => {
          // Update local state
          setNotifications(notifications.map((n) => (n.id === notification.id ? { ...n, read: true } : n)))
          setUnreadCount(Math.max(0, unreadCount - 1))
        })
        .catch((error) => console.error("Erreur lors du marquage de la notification comme lue :", error))
    }

    // Navigate based on notification type for both read and unread notifications
    handleNotificationNavigation(notification)
  }

  const handleAdminNotificationNavigation = (notification: Notification) => {
    if (notification.type === "new_job_offer") {
      window.location.href = `/offre_admin`
    } else if (notification.type === "new_recruiter") {
      window.location.href = `/employees`
    } else if (notification.type === "new_contact") {
      window.location.href = `/contact_admin`
    } else if (notification.type === "new_testimonial") {
      window.location.href = `/temoiniage_admin`
    }
  }

  const handleNotificationNavigation = (notification: Notification) => {
    // Check if user is admin or employee and navigate accordingly
    handleAdminNotificationNavigation(notification)
  }

  const markAllAsRead = () => {
    fetch("http://127.0.0.1:8000/api/notifications", {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        Accept: "application/json",
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`)
        }
        return response.text().then((text) => {
          try {
            return text ? JSON.parse(text) : {}
          } catch (e) {
            console.error("Error parsing JSON:", e, "Response was:", text)
            return {}
          }
        })
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

  // Function to get notification title based on type
  const getNotificationTitle = (type: string) => {
    // Admin notification types
    if (type === "new_recruiter") return "Nouveau recruteur"
    if (type === "new_job_offer") return "Nouvelle offre d'emploi"
    if (type === "new_contact") return "Nouveau message de contact"
    if (type === "new_testimonial") return "Nouveau témoignage"

    // Recruiter notification types
    if (type === "offer_validated") return "Offre validée"
    if (type === "new_application") return "Nouvelle candidature"
    if (type === "account_activated") return "Compte activé"
    if (type === "offer_rejected") return "Offre refusée"

    return "Notification"
  }

  // Function to render notification details based on type
  const renderNotificationDetails = (notification: Notification) => {
    // Admin notification types
    if (notification.type === "new_recruiter") {
      return (
        <div className="text-sm text-muted-foreground mt-2 p-2 sm:p-3 bg-purple-50 dark:bg-purple-950/30 rounded-md border-l-2 border-purple-500">
          <div>
            Société: <span className="font-medium">{notification.data.company}</span>
          </div>
        </div>
      )
    }

    if (notification.type === "new_job_offer") {
      return (
        <div className="text-sm text-muted-foreground mt-2 p-2 sm:p-3 bg-blue-50 dark:bg-blue-950/30 rounded-md border-l-2 border-blue-500">
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
    }

    if (notification.type === "new_contact") {
      return (
        <div className="text-sm text-muted-foreground mt-2 p-2 sm:p-3 bg-amber-50 dark:bg-amber-950/30 rounded-md border-l-2 border-amber-500">
          <div>
            De: <span className="font-medium">{notification.data.name}</span>
          </div>
          <div>
            Email: <span className="text-amber-700 dark:text-amber-400">{notification.data.email}</span>
          </div>
          <div>
            Sujet: <span className="font-medium">{notification.data.subject}</span>
          </div>
          <div className="mt-2 italic bg-white dark:bg-black/20 p-2 rounded text-xs sm:text-sm">
            {notification.data.message_preview}
          </div>
        </div>
      )
    }

    if (notification.type === "new_testimonial") {
      return (
        <div className="text-sm text-muted-foreground mt-2 p-2 sm:p-3 bg-green-50 dark:bg-green-950/30 rounded-md border-l-2 border-green-500">
          <div>
            De: <span className="font-medium">{notification.data.name}</span>
          </div>
          <div>
            Email: <span className="text-green-700 dark:text-green-400">{notification.data.email}</span>
          </div>
          <div className="mt-2 italic bg-white dark:bg-black/20 p-2 rounded text-xs sm:text-sm">
            {notification.data.testimonial_preview}
          </div>
        </div>
      )
    }

    return null
  }

  // Filter notifications based on search query, selected types, and active tab
  const filteredNotifications = notifications.filter((notification) => {
    // Filter by search query
    const matchesSearch =
      searchQuery === "" ||
      notification.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      JSON.stringify(notification.data).toLowerCase().includes(searchQuery.toLowerCase())

    // Filter by type
    const matchesType = selectedTypes.includes(notification.type)

    // Filter by tab
    const matchesTab =
      activeTab === "all" ||
      (activeTab === "unread" && !notification.read) ||
      (activeTab === "read" && notification.read)

    return matchesSearch && matchesType && matchesTab
  })

  // Group notifications by date
  const groupedNotifications: { [key: string]: Notification[] } = {}
  filteredNotifications.forEach((notification) => {
    const date = new Date(notification.created_at)
    const dateKey = date.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" })

    if (!groupedNotifications[dateKey]) {
      groupedNotifications[dateKey] = []
    }
    groupedNotifications[dateKey].push(notification)
  })

  // Sort dates in descending order
  const sortedDates = Object.keys(groupedNotifications).sort((a, b) => {
    const dateA = new Date(a.split("/").reverse().join("/"))
    const dateB = new Date(b.split("/").reverse().join("/"))
    return dateB.getTime() - dateA.getTime()
  })

  const handleTypeToggle = (type: string) => {
    if (selectedTypes.includes(type)) {
      setSelectedTypes(selectedTypes.filter((t) => t !== type))
    } else {
      setSelectedTypes([...selectedTypes, type])
    }
  }

  // Get unique notification types for filter
  const uniqueTypes = [...new Set(notifications.map((n) => n.type))]

  const themeColor = "purple"

  return (
    <div className="container max-w-5xl py-4 sm:py-8 px-4 sm:px-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Badge className={"bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300"}>
              {unreadCount} non lues
            </Badge>
          )}
        </div>
        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={markAllAsRead}
            className={
              "text-purple-600 border-purple-200 hover:bg-purple-50 hover:text-purple-700 dark:text-purple-400 dark:border-purple-800 dark:hover:bg-purple-950 w-full sm:w-auto"
            }
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Tout marquer comme lu
          </Button>
        )}
      </div>

      <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
       

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="w-full sm:w-auto mb-2 sm:mb-0">
              <Filter className="h-4 w-4 mr-2" />
              Filtrer par type
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            {uniqueTypes.map((type) => (
              <DropdownMenuItem key={type} onClick={() => handleTypeToggle(type)}>
                <div className="flex items-center w-full">
                  <input type="checkbox" checked={selectedTypes.includes(type)} onChange={() => {}} className="mr-2" />
                  {getNotificationTitle(type)}
                </div>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="flex items-center gap-2 w-full sm:w-auto mt-4 sm:mt-0">
          <Tabs defaultValue="all" className="w-full" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3 gap-1">
              <TabsTrigger className="px-4" value="all">
                Toutes
              </TabsTrigger>
              <TabsTrigger className="px-4" value="unread">
                Non lues
              </TabsTrigger>
              <TabsTrigger className="px-4" value="read">
                Lues
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      <Card>
        <CardHeader className={"bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900"}>
          <CardTitle className={"text-purple-700 dark:text-purple-300"}>Historique des notifications</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Bell className="h-16 w-16 text-muted-foreground opacity-20 mb-4" />
              <p className="text-muted-foreground text-center">Aucune notification à afficher</p>
              <p className="text-muted-foreground text-center text-sm mt-1">
                {selectedTypes.length === 0 || searchQuery
                  ? "Essayez de modifier vos filtres de recherche"
                  : "Vous n'avez pas encore reçu de notifications"}
              </p>
            </div>
          ) : (
            <>
              {sortedDates.map((dateKey) => (
                <div key={dateKey}>
                  <div className="sticky top-0 z-10 px-4 py-2 bg-muted/80 backdrop-blur supports-[backdrop-filter]:bg-muted/60 font-medium text-sm">
                    {dateKey}
                  </div>
                  <div className="divide-y">
                    {groupedNotifications[dateKey].map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-4 ${"hover:bg-purple-50/50 dark:hover:bg-purple-950/30"} cursor-pointer transition-colors ${!notification.read ? "bg-purple-50/70 dark:bg-purple-950/50" : ""}`}
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <div className="flex gap-3">
                          <div
                            className={`flex-shrink-0 w-2 h-2 mt-2 rounded-full ${!notification.read ? "bg-purple-500" : "bg-transparent"}`}
                          />
                          <div className="w-full">
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                              <h3 className={"font-medium text-purple-700 dark:text-purple-300"}>
                                {getNotificationTitle(notification.type)}
                              </h3>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-muted-foreground whitespace-nowrap">
                                  {formatDate(notification.created_at)}
                                </span>
                                {!notification.read && (
                                  <Badge
                                    variant="secondary"
                                    className={`text-xs ${"bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300"}`}
                                  >
                                    Nouveau
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <p className="mt-1">{notification.message}</p>
                            {renderNotificationDetails(notification)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}