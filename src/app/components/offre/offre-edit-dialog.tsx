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
import { Calendar, Building2, Briefcase, MapPin, Clock, AlertCircle, CheckCircle2, Sliders } from 'lucide-react'

// Sample data for dropdowns - same as in AddOffreForm
const DEPARTMENTS = [
  { id: "1", name: "Informatique" },
  { id: "2", name: "Marketing" },
  { id: "3", name: "Ressources Humaines" },
  { id: "4", name: "Finance" },
]

const DOMAINS = {
  Informatique: [
    { id: "1", name: "Développement Web" },
    { id: "2", name: "Développement Mobile" },
    { id: "3", name: "Intelligence Artificielle" },
    { id: "4", name: "Cybersécurité" },
  ],
  Marketing: [
    { id: "1", name: "Marketing Digital" },
    { id: "2", name: "Relations Publiques" },
    { id: "3", name: "Médias Sociaux" },
  ],
  "Ressources Humaines": [
    { id: "1", name: "Recrutement" },
    { id: "2", name: "Formation" },
    { id: "3", name: "Gestion des Talents" },
  ],
  Finance: [
    { id: "1", name: "Comptabilité" },
    { id: "2", name: "Audit" },
    { id: "3", name: "Contrôle de Gestion" },
  ],
}

const POSITIONS = {
  Informatique: [
    { id: "1", name: "Développeur Frontend" },
    { id: "2", name: "Développeur Backend" },
    { id: "3", name: "DevOps Engineer" },
    { id: "4", name: "Data Scientist" },
  ],
  Marketing: [
    { id: "1", name: "Responsable Marketing" },
    { id: "2", name: "Chargé de Communication" },
    { id: "3", name: "Community Manager" },
  ],
  "Ressources Humaines": [
    { id: "1", name: "Recruteur" },
    { id: "2", name: "Responsable RH" },
    { id: "3", name: "Chargé de Formation" },
  ],
  Finance: [
    { id: "1", name: "Comptable" },
    { id: "2", name: "Auditeur" },
    { id: "3", name: "Contrôleur de Gestion" },
  ],
}

const CITIES = [
  { id: "1", name: "Tunis" },
  { id: "2", name: "Nabeul" },
  { id: "3", name: "Sousse" },
  { id: "4", name: "Bizete" },
  { id: "5", name: "Monastir" },
  { id: "6", name: "Sfax" },
  { id: "7", name: "Ariana" },
  { id: "8", name: "Benarousse" },
  { id: "9", name: "Beja" },
  { id: "10", name: "Tataouine" },
  { id: "11", name: "Kef" },
  { id: "12", name: "Touzeur" },
  { id: "13", name: "Jandouba" },
  { id: "14", name: "Zaghouen" },
  { id: "15", name: "Seliana" },
  { id: "16", name: "Sidi Bouzid" },
  { id: "17", name: "Gabes" },
  { id: "18", name: "Gbili" },
  { id: "19", name: "Gasrinne" },
  { id: "20", name: "Gafsa" },
  { id: "21", name: "Kairouen" },
  { id: "22", name: "Mednine" },
  { id: "23", name: "Manouba" },
  { id: "24", name: "Mahdia" },
]

const JOB_TYPES = [
  { id: "1", name: "CDI" },
  { id: "2", name: "CDD" },
  { id: "3", name: "Stage" },
  { id: "4", name: "Alternance" },
]

const WORK_TYPES = [
  { id: "1", name: "À Temps plein" },
  { id: "2", name: "À temps partiel" },
  { id: "3", name: "Télétravail" },
  { id: "4", name: "Free mission" },
]

const EXPERIENCE_LEVELS = [
  { id: "1", name: "Sans expérience" },
  { id: "2", name: "1ans" },
  { id: "3", name: "2ans" },
  { id: "4", name: "3ans" },
  { id: "5", name: "4ans" },
  { id: "6", name: "5ans" },
  { id: "7", name: "7ans" },
]

const EDUCATION_LEVELS = [
  { id: "1", name: "BTP" },
  { id: "2", name: "BTS" },
  { id: "3", name: "Bac" },
  { id: "4", name: "Bac+1" },
  { id: "5", name: "Bac+2" },
  { id: "6", name: "Bac+3" },
  { id: "7", name: "Bac+4" },
  { id: "8", name: "Bac+5" },
]

const TRAIT_WEIGHTS = [
  { id: "1", name: "2", value: 2 },
  { id: "2", name: "3", value: 3 },
  { id: "3", name: "4", value: 4 },
  { id: "4", name: "5", value: 5 },
  { id: "5", name: "6", value: 6 },
  { id: "6", name: "7", value: 7 },
  { id: "7", name: "8", value: 8 },
  { id: "8", name: "9", value: 9 },
  { id: "9", name: "10", value: 10 },
]

// Valeur spéciale pour l'option "Autre"
const AUTRE_OPTION = "autre"

interface Offre {
  id: number
  domaine: string
  poste: string
  description: string
  datePublication: string
  dateExpiration: string
  valider: boolean
  departement?: string
  typePoste?: string
  typeTravail?: string
  heureTravail?: string
  niveauExperience?: string
  niveauEtude?: string
  pays?: string
  ville?: string
  societe?: string
  responsabilite?: string
  experience?: string
  poids_ouverture?: string | number
  poids_conscience?: string | number
  poids_extraversion?: string | number
  poids_agreabilite?: string | number
  poids_stabilite?: string | number
}

interface OffreEditDialogProps {
  offre: Offre | null
  isOpen: boolean
  onClose: () => void
  onOffreUpdated: () => void
}

// Fonction utilitaire pour combiner des classes conditionnellement
const cn = (...classes: (string | boolean | undefined)[]) => {
  return classes.filter(Boolean).join(" ")
}

export function OffreEditDialog({ offre, isOpen, onClose, onOffreUpdated }: OffreEditDialogProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("informations")
  const [formData, setFormData] = useState<Partial<Offre>>({
    domaine: "",
    poste: "",
    description: "",
    dateExpiration: "",
    departement: "",
    typePoste: "",
    typeTravail: "",
    heureTravail: "",
    niveauExperience: "",
    niveauEtude: "",
    pays: "",
    ville: "",
    societe: "",
    responsabilite: "",
    experience: "",
    poids_ouverture: "2",
    poids_conscience: "2",
    poids_extraversion: "2",
    poids_agreabilite: "2",
    poids_stabilite: "2",
  })

  // États pour les champs personnalisés
  const [customDomaine, setCustomDomaine] = useState<string>("")
  const [customPoste, setCustomPoste] = useState<string>("")

  // États pour les options filtrées
  const [availableDomains, setAvailableDomains] = useState<any[]>([])
  const [availablePositions, setAvailablePositions] = useState<any[]>([])

  useEffect(() => {
    if (offre) {
      // Helper function to clean values (convert "0" to empty string)
      const cleanValue = (value: any) => {
        if (value === 0 || value === "0") return ""
        return value || ""
      }

      setFormData({
        domaine: cleanValue(offre.domaine),
        poste: cleanValue(offre.poste),
        description: cleanValue(offre.description),
        dateExpiration: offre.dateExpiration?.split("T")[0] || "",
        departement: cleanValue(offre.departement),
        typePoste: cleanValue(offre.typePoste),
        typeTravail: cleanValue(offre.typeTravail),
        heureTravail: cleanValue(offre.heureTravail),
        niveauExperience: cleanValue(offre.niveauExperience),
        niveauEtude: cleanValue(offre.niveauEtude),
        pays: cleanValue(offre.pays),
        ville: cleanValue(offre.ville),
        societe: cleanValue(offre.societe),
        responsabilite: cleanValue(offre.responsabilite),
        experience: cleanValue(offre.experience),
        poids_ouverture: cleanValue(offre.poids_ouverture) || "2",
        poids_conscience: cleanValue(offre.poids_conscience) || "2",
        poids_extraversion: cleanValue(offre.poids_extraversion) || "2",
        poids_agreabilite: cleanValue(offre.poids_agreabilite) || "2",
        poids_stabilite: cleanValue(offre.poids_stabilite) || "2",
      })

      // Vérifier si le domaine et le poste sont dans les listes prédéfinies
      if (offre.departement) {
        const domainsForDept = DOMAINS[offre.departement as keyof typeof DOMAINS] || []
        const positionsForDept = POSITIONS[offre.departement as keyof typeof POSITIONS] || []

        setAvailableDomains(domainsForDept)
        setAvailablePositions(positionsForDept)

        // Si le domaine n'est pas dans la liste, considérer comme personnalisé
        if (offre.domaine && offre.domaine !== "0" && !domainsForDept.some((d) => d.name === offre.domaine)) {
          setFormData((prev) => ({ ...prev, domaine: AUTRE_OPTION }))
          setCustomDomaine(offre.domaine)
        }

        // Si le poste n'est pas dans la liste, considérer comme personnalisé
        if (offre.poste && offre.poste !== "0" && !positionsForDept.some((p) => p.name === offre.poste)) {
          setFormData((prev) => ({ ...prev, poste: AUTRE_OPTION }))
          setCustomPoste(offre.poste)
        }
      }
    }
  }, [offre])

  // Mettre à jour les domaines et postes disponibles lorsque le département change
  useEffect(() => {
    if (formData.departement) {
      setAvailableDomains(DOMAINS[formData.departement as keyof typeof DOMAINS] || [])
      setAvailablePositions(POSITIONS[formData.departement as keyof typeof POSITIONS] || [])
    } else {
      setAvailableDomains([])
      setAvailablePositions([])
    }
  }, [formData.departement])

  // Calculer la somme des poids des traits de personnalité
  const calculateTotalWeight = () => {
    const ouverture = Number.parseInt(formData.poids_ouverture as string) || 0
    const conscience = Number.parseInt(formData.poids_conscience as string) || 0
    const extraversion = Number.parseInt(formData.poids_extraversion as string) || 0
    const agreabilite = Number.parseInt(formData.poids_agreabilite as string) || 0
    const stabilite = Number.parseInt(formData.poids_stabilite as string) || 0

    return ouverture + conscience + extraversion + agreabilite + stabilite
  }

  // Vérifier si la somme des poids est égale à 15
  const isWeightSumValid = () => {
    return calculateTotalWeight() === 15
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Réinitialiser les champs personnalisés si l'utilisateur change sa sélection
    if (name === "domaine" && value !== AUTRE_OPTION) {
      setCustomDomaine("")
    }
    if (name === "poste" && value !== AUTRE_OPTION) {
      setCustomPoste("")
    }

    // Si le département change, réinitialiser domaine et poste
    if (name === "departement") {
      setFormData((prev) => ({ ...prev, domaine: "", poste: "" }))
      setCustomDomaine("")
      setCustomPoste("")
    }
  }

  const handleCustomInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: React.Dispatch<React.SetStateAction<string>>,
  ) => {
    setter(e.target.value)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!offre) return

    // Vérifier que la somme des poids est égale à 15
    if (!isWeightSumValid()) {
      setError("La somme des poids des traits de personnalité doit être égale à 15.")
      setActiveTab("personality")
      return
    }

    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const token = sessionStorage.getItem("token")
      if (!token) {
        setError("Vous devez être connecté pour modifier une offre.")
        return
      }

      // S'assurer que la date d'expiration est dans le futur
      const today = new Date()
      today.setHours(0, 0, 0, 0) // Réinitialiser l'heure à minuit
      const expirationDate = new Date(formData.dateExpiration || "")

      if (expirationDate <= today) {
        setError("La date d'expiration doit être postérieure à aujourd'hui.")
        setLoading(false)
        return
      }

      // Préparer les données à envoyer
      const dataToSend = {
        ...formData,
        // Utiliser les valeurs personnalisées si "Autre" est sélectionné
        domaine: formData.domaine === AUTRE_OPTION ? customDomaine : formData.domaine,
        poste: formData.poste === AUTRE_OPTION ? customPoste : formData.poste,
        // Assurez-vous que les champs sont au format attendu par le serveur
        dateExpiration: formData.dateExpiration, // Format YYYY-MM-DD
      }

      // Si l'offre est validée, utiliser l'endpoint de prolongation pour mettre à jour uniquement la date d'expiration
      const endpoint = offre.valider
        ? `http://127.0.0.1:8000/api/prolonger-offre/${offre.id}`
        : `http://127.0.0.1:8000/api/offres-departement/${offre.id}`

      // Si l'offre est validée, n'envoyer que la date d'expiration
      const dataToSendFinal = offre.valider ? { dateExpiration: formData.dateExpiration } : dataToSend

      const response = await fetch(endpoint, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataToSendFinal),
      })

      // Récupérer la réponse complète
      const responseText = await response.text()
      let data

      try {
        data = JSON.parse(responseText)
      } catch (e) {
        console.error("Erreur lors du parsing de la réponse JSON:", e)
        data = { error: "Réponse du serveur invalide" }
      }

      if (!response.ok) {
        if (response.status === 400 && data.error) {
          setError(data.error)
        } else if (response.status === 500 && data.details) {
          setError(`Erreur serveur: ${data.details}`)
        } else {
          throw new Error("Erreur lors de la modification de l'offre")
        }
        return
      }

      setSuccess(offre.valider ? "Date d'expiration prolongée avec succès !" : "Offre modifiée avec succès !")
      onOffreUpdated()

      setTimeout(() => {
        onClose()
        setSuccess(null)
      }, 2000)
    } catch (error) {
      console.error("Erreur détaillée:", error)
      setError("Erreur lors de la modification de l'offre. Vérifiez la console pour plus de détails.")
    } finally {
      setLoading(false)
    }
  }

  // Calculer la date minimale (aujourd'hui) pour le champ de date d'expiration
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
    select:
      "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
    textarea:
      "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[100px] resize-y",
    button: {
      primary: "bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors",
      secondary:
        "bg-white hover:bg-gray-100 text-gray-800 font-medium py-2 px-4 border border-gray-300 rounded-md transition-colors",
      amber: "bg-amber-600 hover:bg-amber-700 text-white font-medium py-2 px-4 rounded-md transition-colors",
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
    tabButton: "px-4 py-2 font-medium rounded-md transition-colors",
    tabButtonActive: "bg-blue-600 text-white",
    tabButtonInactive: "bg-gray-100 text-gray-700 hover:bg-gray-200",
    tabsContainer: "flex space-x-2 mb-4",
    grid: "grid grid-cols-1 md:grid-cols-2 gap-6",
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto"
        style={{ fontFamily: "'Inter', 'Segoe UI', sans-serif" }}
      >
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-2xl font-bold text-blue-600">
            {offre.valider ? "Prolonger l'offre" : "Modifier l'offre"}
          </DialogTitle>
          <DialogDescription className="text-base">
            {offre.valider
              ? "Vous pouvez uniquement prolonger la date d'expiration de cette offre validée."
              : "Modifiez les informations de l'offre d'emploi selon vos besoins."}
          </DialogDescription>
        </DialogHeader>

        {/* Message d'avertissement pour les offres validées */}
        {offre.valider && (
          <div className={styles.alert.warning}>
            <div className="flex items-start">
              <AlertCircle className={`${styles.icon.base} ${styles.icon.warning}`} />
              <p className="text-amber-800 text-sm">
                Cette offre est déjà validée. Vous pouvez uniquement modifier sa date d'expiration.
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {offre.valider ? (
            // Formulaire simplifié pour les offres validées (uniquement date d'expiration)
            <div className={styles.sectionContainer}>
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Calendar className={styles.icon.primary} />
                  <h3 className="text-lg font-semibold">Date d'expiration</h3>
                </div>

                <div className={styles.grid}>
                  <div className={styles.formGroup}>
                    <label htmlFor="datePublication" className={styles.label}>
                      Date de publication
                    </label>
                    <input
                      id="datePublication"
                      name="datePublication"
                      type="date"
                      value={offre.datePublication?.split("T")[0]}
                      disabled={true}
                      className={`${styles.input} bg-gray-50 font-medium`}
                      style={{ opacity: 0.7 }}
                    />
                    <p className="text-xs text-gray-500 mt-1">La date de publication ne peut pas être modifiée</p>
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="dateExpiration" className={styles.label}>
                      Nouvelle date d'expiration
                    </label>
                    <div className="relative">
                      <input
                        id="dateExpiration"
                        name="dateExpiration"
                        type="date"
                        min={today}
                        value={formData.dateExpiration}
                        onChange={handleInputChange}
                        className={`${styles.input} pl-10 border-blue-300`}
                      />
                      <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">La date doit être postérieure à aujourd'hui</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // Formulaire complet pour les offres non validées
            <div>
              {/* Tabs navigation */}
              <div className={styles.tabsContainer}>
                <button
                  type="button"
                  onClick={() => setActiveTab("informations")}
                  className={`${styles.tabButton} ${activeTab === "informations" ? styles.tabButtonActive : styles.tabButtonInactive}`}
                >
                  <Building2 className={styles.icon.base} size={16} />
                  <span>Informations</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("details")}
                  className={`${styles.tabButton} ${activeTab === "details" ? styles.tabButtonActive : styles.tabButtonInactive}`}
                >
                  <Briefcase className={styles.icon.base} size={16} />
                  <span>Détails</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("localisation")}
                  className={`${styles.tabButton} ${activeTab === "localisation" ? styles.tabButtonActive : styles.tabButtonInactive}`}
                >
                  <MapPin className={styles.icon.base} size={16} />
                  <span>Localisation</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("dates")}
                  className={`${styles.tabButton} ${activeTab === "dates" ? styles.tabButtonActive : styles.tabButtonInactive}`}
                >
                  <Calendar className={styles.icon.base} size={16} />
                  <span>Dates</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("personality")}
                  className={`${styles.tabButton} ${activeTab === "personality" ? styles.tabButtonActive : styles.tabButtonInactive}`}
                >
                  <Sliders className={styles.icon.base} size={16} />
                  <span>Traits de personnalité</span>
                </button>
              </div>

              <div className={styles.sectionContainer}>
                {/* Tab content: Informations */}
                {activeTab === "informations" && (
                  <div className="space-y-6">
                    <div className={styles.sectionTitle}>
                      <Building2 className={styles.icon.primary} />
                      <span>Informations principales</span>
                    </div>

                    <div className={styles.grid}>
                      {/* Département */}
                      <div className={styles.formGroup}>
                        <label htmlFor="departement" className={styles.label}>
                          Département
                        </label>
                        <select
                          id="departement"
                          value={formData.departement}
                          onChange={(e) => handleSelectChange("departement", e.target.value)}
                          className={styles.select}
                        >
                          <option value="">Sélectionner un département</option>
                          {DEPARTMENTS.map((dept) => (
                            <option key={dept.id} value={dept.name}>
                              {dept.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Domaine */}
                      <div className={styles.formGroup}>
                        <label htmlFor="domaine" className={styles.label}>
                          Domaine
                        </label>
                        <select
                          id="domaine"
                          value={formData.domaine}
                          onChange={(e) => handleSelectChange("domaine", e.target.value)}
                          disabled={!formData.departement}
                          className={styles.select}
                        >
                          <option value="">Sélectionner un domaine</option>
                          {availableDomains.map((domain) => (
                            <option key={domain.id} value={domain.name}>
                              {domain.name}
                            </option>
                          ))}
                          <option value={AUTRE_OPTION}>Autre</option>
                        </select>
                      </div>

                      {/* Champ personnalisé pour le domaine */}
                      {formData.domaine === AUTRE_OPTION && (
                        <div className={styles.formGroup}>
                          <label htmlFor="customDomaine" className={styles.label}>
                            Précisez le domaine
                          </label>
                          <input
                            id="customDomaine"
                            value={customDomaine}
                            onChange={(e) => handleCustomInputChange(e, setCustomDomaine)}
                            placeholder="Entrez votre domaine personnalisé"
                            className={styles.input}
                            required
                          />
                        </div>
                      )}

                      {/* Poste */}
                      <div className={styles.formGroup}>
                        <label htmlFor="poste" className={styles.label}>
                          Poste
                        </label>
                        <select
                          id="poste"
                          value={formData.poste}
                          onChange={(e) => handleSelectChange("poste", e.target.value)}
                          disabled={!formData.departement}
                          className={styles.select}
                        >
                          <option value="">Sélectionner un poste</option>
                          {availablePositions.map((position) => (
                            <option key={position.id} value={position.name}>
                              {position.name}
                            </option>
                          ))}
                          <option value={AUTRE_OPTION}>Autre</option>
                        </select>
                      </div>

                      {/* Champ personnalisé pour le poste */}
                      {formData.poste === AUTRE_OPTION && (
                        <div className={styles.formGroup}>
                          <label htmlFor="customPoste" className={styles.label}>
                            Précisez le poste
                          </label>
                          <input
                            id="customPoste"
                            value={customPoste}
                            onChange={(e) => handleCustomInputChange(e, setCustomPoste)}
                            placeholder="Entrez votre poste personnalisé"
                            className={styles.input}
                            required
                          />
                        </div>
                      )}

                      {/* Société */}
                      <div className={styles.formGroup}>
                        <label htmlFor="societe" className={styles.label}>
                          Société
                        </label>
                        <input
                          id="societe"
                          name="societe"
                          value={formData.societe}
                          onChange={handleInputChange}
                          className={`${styles.input} bg-gray-50 font-medium`}
                          readOnly
                        />
                      </div>
                    </div>

                    {/* Description */}
                    <div className={styles.formGroup}>
                      <label htmlFor="description" className={styles.label}>
                        Description du poste
                      </label>
                      <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        className={styles.textarea}
                        placeholder="Décrivez le poste en détail..."
                      />
                    </div>
                  </div>
                )}

                {/* Tab content: Details */}
                {activeTab === "details" && (
                  <div className="space-y-6">
                    <div className={styles.sectionTitle}>
                      <Briefcase className={styles.icon.primary} />
                      <span>Détails du poste</span>
                    </div>

                    <div className={styles.grid}>
                      {/* Type de poste */}
                      <div className={styles.formGroup}>
                        <label htmlFor="typePoste" className={styles.label}>
                          Type de contrat
                        </label>
                        <select
                          id="typePoste"
                          value={formData.typePoste}
                          onChange={(e) => handleSelectChange("typePoste", e.target.value)}
                          className={styles.select}
                        >
                          <option value="">Sélectionner un type de contrat</option>
                          {JOB_TYPES.map((type) => (
                            <option key={type.id} value={type.name}>
                              {type.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Type de travail */}
                      <div className={styles.formGroup}>
                        <label htmlFor="typeTravail" className={styles.label}>
                          Type de travail
                        </label>
                        <select
                          id="typeTravail"
                          value={formData.typeTravail}
                          onChange={(e) => handleSelectChange("typeTravail", e.target.value)}
                          className={styles.select}
                        >
                          <option value="">Sélectionner un type de travail</option>
                          {WORK_TYPES.map((type) => (
                            <option key={type.id} value={type.name}>
                              {type.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Heures de travail */}
                      <div className={styles.formGroup}>
                        <label htmlFor="heureTravail" className={styles.label}>
                          Heures de travail
                        </label>
                        <div className="relative">
                          <input
                            id="heureTravail"
                            name="heureTravail"
                            value={formData.heureTravail}
                            onChange={handleInputChange}
                            placeholder="Ex: 40h par semaine"
                            className={`${styles.input} pl-10`}
                          />
                          <Clock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                        </div>
                      </div>

                      {/* Niveau d'expérience */}
                      <div className={styles.formGroup}>
                        <label htmlFor="niveauExperience" className={styles.label}>
                          Niveau d'expérience
                        </label>
                        <select
                          id="niveauExperience"
                          value={formData.niveauExperience}
                          onChange={(e) => handleSelectChange("niveauExperience", e.target.value)}
                          className={styles.select}
                        >
                          <option value="">Sélectionner un niveau d'expérience</option>
                          {EXPERIENCE_LEVELS.map((level) => (
                            <option key={level.id} value={level.name}>
                              {level.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Niveau d'étude */}
                      <div className={styles.formGroup}>
                        <label htmlFor="niveauEtude" className={styles.label}>
                          Niveau d'étude
                        </label>
                        <select
                          id="niveauEtude"
                          value={formData.niveauEtude}
                          onChange={(e) => handleSelectChange("niveauEtude", e.target.value)}
                          className={styles.select}
                        >
                          <option value="">Sélectionner un niveau d'étude</option>
                          {EDUCATION_LEVELS.map((level) => (
                            <option key={level.id} value={level.name}>
                              {level.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Responsabilités */}
                    <div className={styles.formGroup}>
                      <label htmlFor="responsabilite" className={styles.label}>
                        Responsabilités du poste
                      </label>
                      <textarea
                        id="responsabilite"
                        name="responsabilite"
                        value={formData.responsabilite}
                        onChange={handleInputChange}
                        className={styles.textarea}
                        placeholder="Décrivez les responsabilités liées au poste..."
                      />
                    </div>

                    {/* Expérience */}
                    <div className={styles.formGroup}>
                      <label htmlFor="experience" className={styles.label}>
                        Expérience requise
                      </label>
                      <textarea
                        id="experience"
                        name="experience"
                        value={formData.experience}
                        onChange={handleInputChange}
                        className={styles.textarea}
                        placeholder="Décrivez l'expérience requise pour ce poste..."
                      />
                    </div>
                  </div>
                )}

                {/* Tab content: Localisation */}
                {activeTab === "localisation" && (
                  <div className="space-y-6">
                    <div className={styles.sectionTitle}>
                      <MapPin className={styles.icon.primary} />
                      <span>Localisation</span>
                    </div>

                    <div className={styles.grid}>
                      {/* Pays */}
                      <div className={styles.formGroup}>
                        <label htmlFor="pays" className={styles.label}>
                          Pays
                        </label>
                        <div className="relative">
                          <input
                            id="pays"
                            name="pays"
                            value={formData.pays}
                            onChange={handleInputChange}
                            placeholder="Ex: Tunisie"
                            className={`${styles.input} pl-10`}
                          />
                          <MapPin className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                        </div>
                      </div>

                      {/* Ville */}
                      <div className={styles.formGroup}>
                        <label htmlFor="ville" className={styles.label}>
                          Ville
                        </label>
                        <select
                          id="ville"
                          value={formData.ville}
                          onChange={(e) => handleSelectChange("ville", e.target.value)}
                          className={styles.select}
                        >
                          <option value="">Sélectionner une ville</option>
                          {CITIES.map((city) => (
                            <option key={city.id} value={city.name}>
                              {city.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab content: Dates */}
                {activeTab === "dates" && (
                  <div className="space-y-6">
                    <div className={styles.sectionTitle}>
                      <Calendar className={styles.icon.primary} />
                      <span>Dates</span>
                    </div>

                    <div className={styles.grid}>
                      <div className={styles.formGroup}>
                        <label htmlFor="datePublication" className={styles.label}>
                          Date de publication
                        </label>
                        <div className="relative">
                          <input
                            id="datePublication"
                            name="datePublication"
                            type="date"
                            value={offre.datePublication?.split("T")[0]}
                            disabled={true}
                            className={`${styles.input} pl-10 bg-gray-50 font-medium`}
                            style={{ opacity: 0.7 }}
                          />
                          <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">La date de publication ne peut pas être modifiée</p>
                      </div>

                      <div className={styles.formGroup}>
                        <label htmlFor="dateExpiration" className={styles.label}>
                          Date d'expiration
                        </label>
                        <div className="relative">
                          <input
                            id="dateExpiration"
                            name="dateExpiration"
                            type="date"
                            min={today}
                            value={formData.dateExpiration}
                            onChange={handleInputChange}
                            className={`${styles.input} pl-10 border-blue-300`}
                          />
                          <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">La date doit être postérieure à aujourd'hui</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab content: Personality Traits */}
                {activeTab === "personality" && (
                  <div className="space-y-6">
                    <div className={styles.sectionTitle}>
                      <Sliders className={styles.icon.primary} />
                      <span>Poids des traits de personnalité</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">
                      Définissez l'importance de chaque trait de personnalité pour ce poste (minimum 2). La somme des
                      poids doit être égale à 15.
                    </p>

                    {!isWeightSumValid() && (
                      <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md mb-4">
                        <p className="text-red-800 text-sm">
                          La somme des poids doit être égale à 15. Actuellement: {calculateTotalWeight()}
                        </p>
                      </div>
                    )}

                    <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-md mb-4">
                      <p className="text-blue-800 text-sm">Somme actuelle des poids: {calculateTotalWeight()}/15</p>
                    </div>

                    <div className={styles.grid}>
                      {/* Ouverture */}
                      <div className={styles.formGroup}>
                        <label htmlFor="poids_ouverture" className={styles.label}>
                          Poids Ouverture
                        </label>
                        <select
                          id="poids_ouverture"
                          value={formData.poids_ouverture}
                          onChange={(e) => handleSelectChange("poids_ouverture", e.target.value)}
                          className={styles.select}
                        >
                          {TRAIT_WEIGHTS.map((weight) => (
                            <option key={weight.id} value={weight.value}>
                              {weight.name}
                            </option>
                          ))}
                        </select>
                        <p className="text-xs text-gray-500 mt-1">
                          Curiosité, créativité, ouverture aux nouvelles idées
                        </p>
                      </div>

                      {/* Conscience */}
                      <div className={styles.formGroup}>
                        <label htmlFor="poids_conscience" className={styles.label}>
                          Poids Conscience
                        </label>
                        <select
                          id="poids_conscience"
                          value={formData.poids_conscience}
                          onChange={(e) => handleSelectChange("poids_conscience", e.target.value)}
                          className={styles.select}
                        >
                          {TRAIT_WEIGHTS.map((weight) => (
                            <option key={weight.id} value={weight.value}>
                              {weight.name}
                            </option>
                          ))}
                        </select>
                        <p className="text-xs text-gray-500 mt-1">Organisation, fiabilité, autodiscipline</p>
                      </div>

                      {/* Extraversion */}
                      <div className={styles.formGroup}>
                        <label htmlFor="poids_extraversion" className={styles.label}>
                          Poids Extraversion
                        </label>
                        <select
                          id="poids_extraversion"
                          value={formData.poids_extraversion}
                          onChange={(e) => handleSelectChange("poids_extraversion", e.target.value)}
                          className={styles.select}
                        >
                          {TRAIT_WEIGHTS.map((weight) => (
                            <option key={weight.id} value={weight.value}>
                              {weight.name}
                            </option>
                          ))}
                        </select>
                        <p className="text-xs text-gray-500 mt-1">Sociabilité, assertivité, énergie</p>
                      </div>

                      {/* Agréabilité */}
                      <div className={styles.formGroup}>
                        <label htmlFor="poids_agreabilite" className={styles.label}>
                          Poids Agréabilité
                        </label>
                        <select
                          id="poids_agreabilite"
                          value={formData.poids_agreabilite}
                          onChange={(e) => handleSelectChange("poids_agreabilite", e.target.value)}
                          className={styles.select}
                        >
                          {TRAIT_WEIGHTS.map((weight) => (
                            <option key={weight.id} value={weight.value}>
                              {weight.name}
                            </option>
                          ))}
                        </select>
                        <p className="text-xs text-gray-500 mt-1">Coopération, empathie, altruisme</p>
                      </div>

                      {/* Stabilité */}
                      <div className={styles.formGroup}>
                        <label htmlFor="poids_stabilite" className={styles.label}>
                          Poids Stabilité
                        </label>
                        <select
                          id="poids_stabilite"
                          value={formData.poids_stabilite}
                          onChange={(e) => handleSelectChange("poids_stabilite", e.target.value)}
                          className={styles.select}
                        >
                          {TRAIT_WEIGHTS.map((weight) => (
                            <option key={weight.id} value={weight.value}>
                              {weight.name}
                            </option>
                          ))}
                        </select>
                        <p className="text-xs text-gray-500 mt-1">Gestion du stress, stabilité émotionnelle</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

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
            <button
              type="submit"
              disabled={loading}
              className={offre.valider ? styles.button.primary : styles.button.primary}
            >
              {loading
                ? "Traitement en cours..."
                : offre.valider
                  ? "Prolonger la date d'expiration"
                  : "Modifier l'offre"}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
