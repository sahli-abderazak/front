"use client"

import type React from "react"
import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { AlertCircle, Calendar, CheckCircle2 } from "lucide-react"

interface Offre {
  id: number
  domaine: string
  departement: string
  poste: string
  description: string
  datePublication: string
  dateExpiration: string
  valider: boolean
}

interface OffreEditDialogProps {
  offre: Offre | null
  isOpen: boolean
  onClose: () => void
  onOffreUpdated: () => void
  isExpiringSoon?: boolean
  isProlongation?: boolean
}

export function OffreEditDialogExpiree({
  offre,
  isOpen,
  onClose,
  onOffreUpdated,
  isExpiringSoon = false,
  isProlongation = false,
}: OffreEditDialogProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [dateExpiration, setDateExpiration] = useState("")

  useEffect(() => {
    if (offre) {
      // Pour les offres expirées, définir une nouvelle date d'expiration par défaut (aujourd'hui + 7 jours)
      const defaultNewDate = isProlongation
        ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
        : offre.dateExpiration.split("T")[0]

      setDateExpiration(defaultNewDate)
    }
  }, [offre, isProlongation])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!offre) return

    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const token = sessionStorage.getItem("token")
      if (!token) {
        setError("Vous devez être connecté pour modifier une offre.")
        return
      }

      // On n'envoie que la date d'expiration
      const dataToSend = { dateExpiration }

      // Toujours utiliser l'endpoint de prolongation pour mettre à jour la date d'expiration
      const endpoint =` http://127.0.0.1:8000/api/prolonger-offre/${offre.id}`

      const response = await fetch(endpoint, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataToSend),
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 400 && data.error) {
          setError(data.error)
        } else {
          throw new Error("Erreur lors de la modification de l'offre")
        }
        return
      }

      setSuccess(isProlongation ? "Offre prolongée avec succès !" : "Offre modifiée avec succès !")
      onOffreUpdated() // Rafraîchir la liste des offres

      setTimeout(() => {
        onClose()
        setSuccess(null)
      }, 2000)
    } catch (error) {
      setError(
        isProlongation ? "Erreur lors de la prolongation de l'offre." : "Erreur lors de la modification de l'offre.",
      )
    } finally {
      setLoading(false)
    }
  }

  const today = new Date().toISOString().split("T")[0]

  if (!offre) return null

  // Styles personnalisés
  const styles = {
    sectionTitle: "text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2",
    sectionContainer: "bg-white p-5 rounded-lg shadow-sm border border-gray-100 mb-4",
    formGroup: "space-y-2 mb-4",
    label: "text-sm font-medium text-gray-700 block",
    input:
      "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
    inputReadOnly: "w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-50 font-medium",
    button: {
      primary: "bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors",
      secondary:
        "bg-white hover:bg-gray-100 text-gray-800 font-medium py-2 px-4 border border-gray-300 rounded-md transition-colors",
    },
    alert: {
      error: "bg-red-50 border-l-4 border-red-400 p-4 rounded-md mb-4",
      success: "bg-green-50 border-l-4 border-green-400 p-4 rounded-md mb-4",
      warning: "bg-amber-50 border-l-4 border-amber-400 p-4 rounded-md mb-4",
    },
    icon: {
      base: "inline-block mr-2",
      error: "text-red-500",
      success: "text-green-500",
      warning: "text-amber-500",
      primary: "text-blue-500",
    },
    grid: "grid grid-cols-1 md:grid-cols-2 gap-6",
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto"
        style={{ fontFamily: "'Inter', 'Segoe UI', sans-serif" }}
      >
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-2xl font-bold text-blue-600">
            {isProlongation ? "Prolonger l'offre expirée" : "Modifier l'offre"}
          </DialogTitle>
          <DialogDescription className="text-base">
            {isProlongation
              ? "Définissez une nouvelle date d'expiration pour prolonger cette offre."
              : "Vous pouvez modifier la date d'expiration de cette offre, même si elle est validée."}
          </DialogDescription>
        </DialogHeader>

        {isExpiringSoon && (
          <div className={styles.alert.warning}>
            <div className="flex items-start">
              <AlertCircle className={`${styles.icon.base} ${styles.icon.warning}`} />
              <div>
                <h4 className="font-medium text-amber-800">Attention</h4>
                <p className="text-amber-800 text-sm">
                  Cette offre expire bientôt. Vous pouvez prolonger sa durée en modifiant la date d'expiration.
                </p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className={styles.sectionContainer}>
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className={styles.icon.primary} />
                <h3 className="text-lg font-semibold">Informations de l'offre</h3>
              </div>

              <div className={styles.grid}>
                <div className={styles.formGroup}>
                  <label htmlFor="domaine" className={styles.label}>
                    Domaine
                  </label>
                  <input id="domaine" value={offre.domaine || ""} className={styles.inputReadOnly} readOnly />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="departement" className={styles.label}>
                    Département
                  </label>
                  <input id="departement" value={offre.departement || ""} className={styles.inputReadOnly} readOnly />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="poste" className={styles.label}>
                    Poste
                  </label>
                  <input id="poste" value={offre.poste || ""} className={styles.inputReadOnly} readOnly />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="datePublication" className={styles.label}>
                    Date de publication
                  </label>
                  <div className="relative">
                    <input
                      id="datePublication"
                      type="date"
                      value={offre.datePublication?.split("T")[0] || ""}
                      className={`${styles.inputReadOnly} pl-10`}
                      style={{ opacity: 0.7 }}
                      readOnly
                    />
                    <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.sectionContainer}>
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className={styles.icon.primary} />
                <h3 className="text-lg font-semibold">Nouvelle date d'expiration</h3>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="dateExpiration" className={styles.label}>
                  Date d'expiration
                </label>
                <div className="relative">
                  <input
                    id="dateExpiration"
                    type="date"
                    min={today}
                    value={dateExpiration}
                    onChange={(e) => setDateExpiration(e.target.value)}
                    className={`${styles.input} pl-10 border-blue-300`}
                  />
                  <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                </div>
                <p className="text-xs text-gray-500 mt-1">La date doit être postérieure à aujourd'hui</p>
              </div>
            </div>
          </div>

          {/* Messages d'erreur et de succès */}
          {error && (
            <div className={styles.alert.error}>
              <div className="flex items-start">
                <AlertCircle className={`${styles.icon.base} ${styles.icon.error}`} />
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            </div>
          )}

          {success && (
            <div className={styles.alert.success}>
              <div className="flex items-start">
                <CheckCircle2 className={`${styles.icon.base} ${styles.icon.success}`} />
                <p className="text-green-800 text-sm">{success}</p>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <button type="button" onClick={onClose} className={styles.button.secondary}>
              Annuler
            </button>
            <button type="submit" disabled={loading} className={styles.button.primary}>
              {loading
                ? "Traitement en cours..."
                : isProlongation
                  ? "Prolonger l'offre"
                  : "Prolonger la date d'expiration"}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}