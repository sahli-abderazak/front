"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, User, Briefcase, Clock, MapPin, ArrowLeft, Check, X, CalendarIcon, Video } from "lucide-react"
import { DashboardHeaderRec } from "@/app/components/recruteur/dashboard-header_rec"
import { DashboardSidebarRec } from "@/app/components/recruteur/dashboard-sidebar_rec"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"

interface Interview {
  id: number
  candidat_id: number
  offre_id: number
  recruteur_id: number
  date_heure: string
  candidat_nom: string
  candidat_prenom: string
  candidat_email: string
  poste: string
  email_sent: boolean
  type: string
  lien_ou_adresse: string
  status?: "cancelled" | "completed" | "pending"
}

export default function EntretiensPage() {
  const router = useRouter()
  const [interviews, setInterviews] = useState<Interview[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [filteredInterviews, setFilteredInterviews] = useState<Interview[]>([])
  const [isRescheduleOpen, setIsRescheduleOpen] = useState(false)
  const [currentInterview, setCurrentInterview] = useState<Interview | null>(null)
  const [newDate, setNewDate] = useState<string>("")
  const [availableHours, setAvailableHours] = useState<string[]>([])
  const [selectedHour, setSelectedHour] = useState<string>("")
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)
  const [calendarDates, setCalendarDates] = useState<Date[]>([])
  const [calendarMonth, setCalendarMonth] = useState<Date>(new Date())
  const [loadingHours, setLoadingHours] = useState(false)

  useEffect(() => {
    const checkUserRole = async () => {
      try {
        const token = sessionStorage.getItem("token")
        if (!token) {
          router.push("/auth/login")
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

        // Si l'utilisateur n'est pas un recruteur, rediriger vers le dashboard
        if (userData.role !== "recruteur") {
          router.push("/dashbord")
          return
        }

        // Continuer avec le chargement des données si l'utilisateur est un recruteur
        fetchInterviews(token)
      } catch (error) {
        console.error("Erreur:", error)
        router.push("/auth/login")
      }
    }

    const fetchInterviews = async (token: string) => {
      try {
        const response = await fetch("http://127.0.0.1:8000/api/interviews", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })

        if (!response.ok) {
          if (response.status === 401) {
            sessionStorage.removeItem("token")
            router.push("/auth/login")
            return
          } else {
            throw new Error("Erreur lors de la récupération des entretiens")
          }
        }

        const data = await response.json()
        // Ajouter un statut par défaut à chaque entretien
        const interviewsWithStatus = data.map((interview: Interview) => ({
          ...interview,
          status: interview.status || "pending",
        }))
        setInterviews(interviewsWithStatus)
        filterInterviewsByDate(interviewsWithStatus, selectedDate)

        // Extraire toutes les dates uniques pour le calendrier
        const uniqueDates = [
          ...new Set(data.map((interview: Interview) => format(new Date(interview.date_heure), "yyyy-MM-dd"))),
        ].map((dateStr) => new Date(dateStr))

        setCalendarDates(uniqueDates)
      } catch (error) {
        console.error("Erreur:", error)
        setError("Une erreur est survenue lors du chargement des entretiens")
      } finally {
        setLoading(false)
      }
    }

    checkUserRole()
  }, [router])

  // Filtrer les entretiens par date sélectionnée
  const filterInterviewsByDate = (interviewsData: Interview[], date: Date) => {
    const dateString = format(date, "yyyy-MM-dd")
    const filtered = interviewsData.filter((interview) => {
      try {
        const interviewDate = new Date(interview.date_heure)
        return format(interviewDate, "yyyy-MM-dd") === dateString
      } catch (error) {
        console.error("Erreur de date pour l'entretien:", interview.id, error)
        return false
      }
    })

    setFilteredInterviews(filtered)
  }

  // Mettre à jour les entretiens filtrés lorsque la date sélectionnée change
  useEffect(() => {
    if (interviews.length > 0) {
      filterInterviewsByDate(interviews, selectedDate)
    }
  }, [selectedDate, interviews])

  // Fonction pour changer de date (navigation)
  const changeDate = (direction: "prev" | "next") => {
    const newDate = new Date(selectedDate)
    if (direction === "prev") {
      newDate.setDate(newDate.getDate() - 1)
    } else {
      newDate.setDate(newDate.getDate() + 1)
    }
    setSelectedDate(newDate)
  }

  // Fonction pour annuler un entretien
  const cancelInterview = async (interviewId: number) => {
    try {
      const token = sessionStorage.getItem("token")
      if (!token) {
        router.push("/auth/login")
        return
      }

      const response = await fetch(`http://127.0.0.1:8000/api/interviews/${interviewId}/cancel`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error("Erreur lors de l'annulation de l'entretien")
      }

      // Mettre à jour l'état local
      const updatedInterviews = interviews.map((interview) =>
        interview.id === interviewId ? { ...interview, status: "cancelled" } : interview,
      )

      setInterviews(updatedInterviews)
      filterInterviewsByDate(updatedInterviews, selectedDate)
      toast({
        title: "Entretien annulé",
        description: "L'entretien a été annulé avec succès.",
      })
    } catch (error) {
      console.error("Erreur:", error)
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'annulation de l'entretien.",
        variant: "destructive",
      })
    }
  }

  // Fonction pour marquer un entretien comme terminé
  const completeInterview = async (interviewId: number) => {
    try {
      const token = sessionStorage.getItem("token")
      if (!token) {
        router.push("/auth/login")
        return
      }

      const response = await fetch(`http://127.0.0.1:8000/api/interviews/${interviewId}/complete`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error("Erreur lors de la mise à jour de l'entretien")
      }

      // Mettre à jour l'état local
      const updatedInterviews = interviews.map((interview) =>
        interview.id === interviewId ? { ...interview, status: "completed" } : interview,
      )

      setInterviews(updatedInterviews)
      filterInterviewsByDate(updatedInterviews, selectedDate)
      toast({
        title: "Entretien terminé",
        description: "L'entretien a été marqué comme terminé.",
      })
    } catch (error) {
      console.error("Erreur:", error)
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la mise à jour de l'entretien.",
        variant: "destructive",
      })
    }
  }

  // Fonction pour ouvrir la boîte de dialogue de replanification
  const openRescheduleDialog = async (interview: Interview) => {
    setCurrentInterview(interview)
    setNewDate("")
    setSelectedHour("")
    setIsRescheduleOpen(true)
  }

  // Fonction pour récupérer les heures disponibles
  const fetchAvailableHours = async (dateString: string, offreId: number) => {
    setLoadingHours(true)
    setAvailableHours([])

    try {
      const token = sessionStorage.getItem("token")
      if (!token) {
        router.push("/auth/login")
        return
      }

      const response = await fetch(
        `http://127.0.0.1:8000/api/interview/available-hours?date=${dateString}&offre_id=${offreId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      )

      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des heures disponibles")
      }

      const data = await response.json()
      setAvailableHours(data.available_hours || [])
    } catch (error) {
      console.error("Erreur:", error)
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la récupération des heures disponibles.",
        variant: "destructive",
      })
    } finally {
      setLoadingHours(false)
    }
  }

  // Fonction pour formater l'heure (correction du décalage horaire)
  const formatDisplayTime = (dateTimeString: string) => {
    try {
      const date = new Date(dateTimeString)
      // Soustraire une heure pour corriger le décalage
      date.setHours(date.getHours() - 1)
      return format(date, "HH:mm")
    } catch (error) {
      console.error("Erreur de formatage de l'heure:", error)
      return "--:--"
    }
  }

  // Fonction pour replanifier un entretien
  const rescheduleInterview = async () => {
    if (!currentInterview || !newDate || !selectedHour) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner une date et une heure valides.",
        variant: "destructive",
      })
      return
    }

    try {
      const token = sessionStorage.getItem("token")
      if (!token) {
        router.push("/auth/login")
        return
      }

      // Format ISO pour l'API Laravel
      const dateTimeString = `${newDate}T${selectedHour}:00.000Z`

      const response = await fetch(`http://127.0.0.1:8000/api/interviews/${currentInterview.id}/reschedule`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          date_heure: dateTimeString,
        }),
      })

      if (!response.ok) {
        throw new Error("Erreur lors de la replanification de l'entretien")
      }

      const updatedInterview = await response.json()

      // Mettre à jour l'état local avec les nouvelles données
      const updatedInterviews = interviews.map((interview) =>
        interview.id === currentInterview.id
          ? { ...interview, date_heure: updatedInterview.interview.date_heure }
          : interview,
      )

      setInterviews(updatedInterviews)

      // Fermer la boîte de dialogue avant de filtrer pour éviter l'erreur
      setIsRescheduleOpen(false)

      // Mettre à jour les entretiens filtrés
      filterInterviewsByDate(updatedInterviews, selectedDate)

      toast({
        title: "Entretien replanifié",
        description: "L'entretien a été replanifié avec succès. Un email a été envoyé au candidat.",
      })
    } catch (error) {
      console.error("Erreur:", error)
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la replanification de l'entretien.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <DashboardHeaderRec />
      <div className="container mx-auto p-4 md:p-6 lg:p-8 pt-6">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
          <div className="hidden md:block md:col-span-1 lg:col-span-1">
            <div className="sticky top-20">
              <DashboardSidebarRec />
            </div>
          </div>
          <div className="md:col-span-5 lg:col-span-5 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <Button
                  variant="ghost"
                  onClick={() => router.back()}
                  className="mb-2 text-muted-foreground hover:text-foreground"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Retour
                </Button>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Calendrier des entretiens techniques</h1>
                <p className="text-muted-foreground mt-1">
                  Consultez et gérez tous vos entretiens techniques planifiés
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => setIsCalendarOpen(!isCalendarOpen)}
                className="flex items-center"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                Voir le calendrier complet
              </Button>
            </div>

            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : error ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <p className="text-xl font-medium text-center">{error}</p>
                  <Button onClick={() => router.back()} className="mt-6">
                    Retour
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Navigation de date simplifiée */}
                <Card className="md:col-span-1">
                  <CardHeader>
                    <CardTitle className="text-lg">Sélectionner une date</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between mb-4">
                      <Button variant="outline" size="sm" onClick={() => changeDate("prev")}>
                        Jour précédent
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => changeDate("next")}>
                        Jour suivant
                      </Button>
                    </div>
                    <div className="mb-4">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <Input
                          type="date"
                          value={format(selectedDate, "yyyy-MM-dd")}
                          onChange={(e) => {
                            const date = new Date(e.target.value)
                            if (!isNaN(date.getTime())) {
                              setSelectedDate(date)
                            }
                          }}
                          className="flex-1"
                        />
                      </div>
                    </div>
                    <Button variant="outline" className="w-full" onClick={() => setSelectedDate(new Date())}>
                      <Calendar className="mr-2 h-4 w-4" />
                      Aujourd'hui
                    </Button>
                    <div className="mt-4 flex items-center justify-center">
                      <div className="flex items-center">
                        <div className="h-3 w-3 rounded-full bg-primary/30 border border-primary/50 mr-2"></div>
                        <span className="text-sm text-muted-foreground">
                          {interviews.length} entretien(s) planifié(s) au total
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Liste des entretiens pour la date sélectionnée */}
                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle className="text-lg">
                      Entretiens du {format(selectedDate, "d MMMM yyyy", { locale: fr })}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {filteredInterviews.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                        <p className="text-lg font-medium">Aucun entretien planifié pour cette date</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Sélectionnez une autre date ou planifiez de nouveaux entretiens
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {filteredInterviews
                          .sort((a, b) => new Date(a.date_heure).getTime() - new Date(b.date_heure).getTime())
                          .map((interview) => {
                            // Déterminer la couleur de la carte en fonction du statut
                            let cardClass = "border rounded-lg p-4 hover:border-primary/30 transition-colors"
                            if (interview.status === "cancelled") {
                              cardClass += " bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-800/50"
                            } else if (interview.status === "completed") {
                              cardClass += " bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800/50"
                            }

                            return (
                              <div key={interview.id} className={cardClass}>
                                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                  <div className="space-y-2">
                                    <div className="flex items-center">
                                      <User className="h-4 w-4 mr-2 text-primary" />
                                      <span className="font-medium">
                                        {interview.candidat_prenom} {interview.candidat_nom}
                                      </span>
                                    </div>
                                    <div className="flex items-center">
                                      <Briefcase className="h-4 w-4 mr-2 text-muted-foreground" />
                                      <span className="text-sm">{interview.poste}</span>
                                    </div>
                                    <div className="flex items-center">
                                      <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                                      <span className="text-sm">
                                        {interview.type === "en ligne" ? "Entretien en ligne" : "Entretien présentiel"}
                                      </span>
                                    </div>
                                    {interview.type === "en ligne" && interview.lien_ou_adresse && (
                                      <div>
                                        <a
                                          href={interview.lien_ou_adresse}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                                        >
                                          <Video className="h-4 w-4 mr-1" />
                                          Rejoindre la réunion
                                        </a>
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex flex-col items-end">
                                    <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                                      <Clock className="h-3.5 w-3.5 mr-1" />
                                      {formatDisplayTime(interview.date_heure)}
                                    </Badge>
                                    <a
                                      href={`mailto:${interview.candidat_email}`}
                                      className="text-sm text-blue-600 hover:underline mt-2 dark:text-blue-400"
                                    >
                                      {interview.candidat_email}
                                    </a>

                                    {/* Boutons d'action */}
                                    <div className="flex mt-3 space-x-2">
                                      {interview.status === "pending" && (
                                        <>
                                          <Button
                                            size="sm"
                                            variant="outline"
                                            className="border-green-500 text-green-600 hover:bg-green-50 dark:border-green-700 dark:text-green-400 dark:hover:bg-green-950/30"
                                            onClick={() => completeInterview(interview.id)}
                                          >
                                            <Check className="h-4 w-4 mr-1" />
                                            Fait
                                          </Button>
                                          <Button
                                            size="sm"
                                            variant="outline"
                                            className="border-red-500 text-red-600 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-950/30"
                                            onClick={() => cancelInterview(interview.id)}
                                          >
                                            <X className="h-4 w-4 mr-1" />
                                            Annuler
                                          </Button>
                                          <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => openRescheduleDialog(interview)}
                                          >
                                            <Calendar className="h-4 w-4 mr-1" />
                                            Reporter
                                          </Button>
                                        </>
                                      )}
                                      {interview.status === "cancelled" && (
                                        <Badge
                                          variant="outline"
                                          className="bg-red-100 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-800/50"
                                        >
                                          Annulé
                                        </Badge>
                                      )}
                                      {interview.status === "completed" && (
                                        <Badge
                                          variant="outline"
                                          className="bg-green-100 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-400 dark:border-green-800/50"
                                        >
                                          Terminé
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )
                          })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Boîte de dialogue pour replanifier un entretien */}
      <Dialog open={isRescheduleOpen} onOpenChange={setIsRescheduleOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Reporter l'entretien</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="new-date">Nouvelle date</Label>
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <Input
                  id="new-date"
                  type="date"
                  value={newDate}
                  onChange={(e) => {
                    const dateValue = e.target.value
                    setNewDate(dateValue)
                    if (dateValue && currentInterview) {
                      fetchAvailableHours(dateValue, currentInterview.offre_id)
                    }
                  }}
                  className="flex-1"
                  min={format(new Date(), "yyyy-MM-dd")}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="new-time">Nouvelle heure</Label>
              <Select
                disabled={!newDate || (availableHours.length === 0 && !loadingHours)}
                value={selectedHour}
                onValueChange={setSelectedHour}
              >
                <SelectTrigger id="new-time">
                  <SelectValue placeholder={loadingHours ? "Chargement..." : "Sélectionner une heure"} />
                </SelectTrigger>
                <SelectContent>
                  {loadingHours ? (
                    <div className="flex items-center justify-center py-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-primary"></div>
                    </div>
                  ) : (
                    availableHours.map((hour) => (
                      <SelectItem key={hour} value={hour}>
                        {hour}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {newDate && !loadingHours && availableHours.length === 0 && (
                <p className="text-sm text-red-500">Aucun créneau disponible pour cette date.</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRescheduleOpen(false)}>
              Annuler
            </Button>
            <Button onClick={rescheduleInterview} disabled={!newDate || !selectedHour || loadingHours}>
              Confirmer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Boîte de dialogue pour le calendrier complet */}
      <Dialog open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Calendrier des entretiens</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <div className="flex justify-between items-center mb-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const newMonth = new Date(calendarMonth)
                  newMonth.setMonth(newMonth.getMonth() - 1)
                  setCalendarMonth(newMonth)
                }}
              >
                Mois précédent
              </Button>
              <h3 className="text-lg font-medium">{format(calendarMonth, "MMMM yyyy", { locale: fr })}</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const newMonth = new Date(calendarMonth)
                  newMonth.setMonth(newMonth.getMonth() + 1)
                  setCalendarMonth(newMonth)
                }}
              >
                Mois suivant
              </Button>
            </div>
            <div className="grid grid-cols-7 gap-2 text-center">
              <div className="text-sm font-medium">Lu</div>
              <div className="text-sm font-medium">Ma</div>
              <div className="text-sm font-medium">Me</div>
              <div className="text-sm font-medium">Je</div>
              <div className="text-sm font-medium">Ve</div>
              <div className="text-sm font-medium">Sa</div>
              <div className="text-sm font-medium">Di</div>

              {Array.from({ length: 35 }).map((_, i) => {
                const date = new Date(
                  calendarMonth.getFullYear(),
                  calendarMonth.getMonth(),
                  i - new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), 1).getDay() + 2,
                )
                const isCurrentMonth = date.getMonth() === calendarMonth.getMonth()
                const isSelected = format(date, "yyyy-MM-dd") === format(selectedDate, "yyyy-MM-dd")
                const hasInterview = calendarDates.some((d) => format(d, "yyyy-MM-dd") === format(date, "yyyy-MM-dd"))

                return (
                  <Button
                    key={i}
                    variant={isSelected ? "default" : "outline"}
                    className={cn(
                      "h-10 w-full p-0",
                      !isCurrentMonth && "text-muted-foreground opacity-50",
                      hasInterview &&
                        !isSelected &&
                        "bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800/50",
                    )}
                    disabled={!isCurrentMonth}
                    onClick={() => {
                      setSelectedDate(date)
                      setIsCalendarOpen(false)
                    }}
                  >
                    {date.getDate()}
                  </Button>
                )
              })}
            </div>
            <div className="mt-4 flex items-center justify-center">
              <div className="flex items-center">
                <div className="h-3 w-3 rounded-full bg-blue-100 border border-blue-300 mr-2"></div>
                <span className="text-sm text-muted-foreground">Dates avec des entretiens planifiés</span>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
