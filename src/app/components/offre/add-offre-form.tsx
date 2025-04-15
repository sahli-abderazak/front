"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Calendar, Building2, Briefcase, MapPin, Clock, AlertCircle, CheckCircle2, Plus } from "lucide-react"
import { useRouter } from "next/navigation"

// Sample data for dropdowns - replace with your actual data or API calls
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
  { id: "3", name: "2ans" },
  { id: "4", name: "3ans" },
  { id: "5", name: "5ans" },
  { id: "6", name: "7ans" },
  { id: "7", name: "+10ans" },
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

const MATCHING_PERCENTAGES = [
  { id: "1", name: "0%", value: 0 },
  { id: "2", name: "10%", value: 10 },
  { id: "3", name: "20%", value: 20 },
  { id: "4", name: "30%", value: 30 },
  { id: "5", name: "40%", value: 40 },
  { id: "6", name: "50%", value: 50 },
  { id: "7", name: "60%", value: 60 },
  { id: "8", name: "70%", value: 70 },
]

// Valeur spéciale pour l'option "Autre"
const AUTRE_OPTION = "autre"

export function AddOffreForm({ onOffreAdded }: { onOffreAdded: () => void }) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [userDepartement, setUserDepartement] = useState<string>("")
  const [activeTab, setActiveTab] = useState("informations")
  const [validationErrors, setValidationErrors] = useState<Record<string, boolean>>({})

  // État pour les champs personnalisés
  const [customDomaine, setCustomPoste] = useState<string>("")
  const [customPoste, setCustomDomaine] = useState<string>("")

  const [formData, setFormData] = useState({
    departement: "",
    poste: "",
    description: "",
    dateExpiration: "",
    typePoste: "",
    typeTravail: "",
    heureTravail: "",
    niveauExperience: "",
    niveauEtude: "",
    pays: "Tunisie", // Valeur par défaut
    ville: "",
    societe: "",
    domaine: "",
    responsabilite: "",
    experience: "",
    matchingAttachment: "", // Add this new field
  })

  // Filtered options based on department selection
  const [availableDomains, setAvailableDomains] = useState<any[]>([])
  const [availablePositions, setAvailablePositions] = useState<any[]>([])

  useEffect(() => {
    const fetchUserDepartement = async () => {
      try {
        const token = localStorage.getItem("token")
        if (!token) {
          setError("Vous devez être connecté pour ajouter une offre.")
          router.push("/auth/login")
          return
        }

        const response = await fetch("http://127.0.0.1:8000/api/user", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })

        if (!response.ok) {
          if (response.status === 401) {
            localStorage.removeItem("token")
            router.push("/auth/login")
            return
          }
          throw new Error("Erreur lors de la récupération des informations utilisateur")
        }

        const userData = await response.json()
        console.log("Données utilisateur récupérées:", userData) // Log pour déboguer
        setUserDepartement(userData.departement)

        // S'assurer que la société est correctement récupérée
        const societeNom = userData.societe || userData.nom_societe || userData.company || ""
        console.log("Société récupérée:", societeNom) // Log pour déboguer

        setFormData((prev) => ({
          ...prev,
          departement: userData.departement,
          societe: societeNom,
        }))
      } catch (error) {
        console.error("Erreur:", error)
        setError("Erreur lors de la récupération du département")
      }
    }

    if (isOpen) {
      fetchUserDepartement()
    }
  }, [isOpen, router])

  // Update available domains and positions when department changes
  useEffect(() => {
    if (formData.departement) {
      setAvailableDomains(DOMAINS[formData.departement as keyof typeof DOMAINS] || [])
      setAvailablePositions(POSITIONS[formData.departement as keyof typeof POSITIONS] || [])
    } else {
      setAvailableDomains([])
      setAvailablePositions([])
    }

    // Réinitialiser les valeurs personnalisées et les sélections lorsque le département change
    setCustomDomaine("")
    setCustomPoste("")
    setFormData((prev) => ({
      ...prev,
      domaine: "",
      poste: "",
    }))
  }, [formData.departement])

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
  }

  const handleCustomInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: React.Dispatch<React.SetStateAction<string>>,
  ) => {
    setter(e.target.value)
  }

  const validateForm = () => {
    const errors: Record<string, boolean> = {}
    const requiredFields = [
      "departement",
      "poste",
      "description",
      "dateExpiration",
      "typePoste",
      "typeTravail",
      "heureTravail",
      "niveauExperience",
      "niveauEtude",
      "ville",
      "responsabilite",
      "experience",
    ]

    // Check if domaine is required based on conditions
    if (formData.departement) {
      requiredFields.push("domaine")
    }

    // Check each required field
    requiredFields.forEach((field) => {
      let value = formData[field as keyof typeof formData]

      // Special handling for custom fields
      if (field === "domaine" && formData.domaine === AUTRE_OPTION) {
        value = customDomaine
      }
      if (field === "poste" && formData.poste === AUTRE_OPTION) {
        value = customPoste
      }

      if (!value || value.trim() === "") {
        errors[field] = true
      }
    })

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate the form first
    if (!validateForm()) {
      // Find the first tab with errors and switch to it
      const fieldsToTabMap: Record<string, string> = {
        departement: "informations",
        domaine: "informations",
        poste: "informations",
        description: "informations",
        typePoste: "details",
        typeTravail: "details",
        heureTravail: "details",
        niveauExperience: "details",
        niveauEtude: "details",
        responsabilite: "details",
        experience: "details",
        ville: "localisation",
        dateExpiration: "dates",
      }

      // Find the first field with an error
      const firstErrorField = Object.keys(validationErrors)[0]
      const tabWithError = fieldsToTabMap[firstErrorField] || "informations"

      // Switch to the tab with the error
      setActiveTab(tabWithError)

      // Scroll to the field with error (if possible)
      setTimeout(() => {
        const errorElement = document.getElementById(firstErrorField)
        if (errorElement) {
          errorElement.scrollIntoView({ behavior: "smooth", block: "center" })
          errorElement.focus()
        }
      }, 100)

      setError("Veuillez remplir tous les champs obligatoires.")
      return
    }

    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const token = localStorage.getItem("token")
      if (!token) {
        setError("Vous devez être connecté pour ajouter une offre.")
        return
      }

      // Préparer les données à envoyer
      const dataToSubmit = {
        ...formData,
        // Use the values directly from formData instead of editor refs
        domaine: formData.domaine === AUTRE_OPTION ? customDomaine : formData.domaine,
        poste: formData.poste === AUTRE_OPTION ? customPoste : formData.poste,
        // Use the values from the input fields
        description: formData.description,
        responsabilite: formData.responsabilite,
        experience: formData.experience,
        datePublication: new Date().toISOString().split("T")[0], // Current date
        // Convertir matchingAttachment en valeur numérique pour le champ matching
        matching: formData.matchingAttachment ? Number.parseInt(formData.matchingAttachment.replace("%", "")) : 0,
      }

      const response = await fetch("http://127.0.0.1:8000/api/addOffres", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataToSubmit),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Une erreur est survenue lors de l'ajout de l'offre.")
        return
      }

      setSuccess("Offre ajoutée avec succès !")

      // Réinitialiser le formulaire
      setFormData({
        departement: userDepartement,
        poste: "",
        description: "",
        dateExpiration: "",
        typePoste: "",
        typeTravail: "",
        heureTravail: "",
        niveauExperience: "",
        niveauEtude: "",
        pays: "Tunisie", // Conserver la valeur par défaut
        ville: "",
        societe: formData.societe, // Keep the company name
        domaine: "",
        responsabilite: "",
        experience: "",
        matchingAttachment: "", // Reset this field too
      })
      setCustomDomaine("")
      setCustomPoste("")

      onOffreAdded()

      setTimeout(() => {
        setIsOpen(false)
        setSuccess(null)
      }, 2000)
    } catch (error) {
      setError("Erreur lors de l'ajout de l'offre.")
    } finally {
      setLoading(false)
    }
  }

  const today = new Date().toISOString().split("T")[0]

  const hasError = (fieldName: string) => {
    return validationErrors[fieldName] ? true : false
  }

  const getInputClassName = (fieldName: string, baseClass: string) => {
    return `${baseClass} ${hasError(fieldName) ? "border-red-500 ring-1 ring-red-500" : ""}`
  }

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
    },
    alert: {
      error: "bg-red-50 border-l-4 border-red-400 p-4 rounded-md mb-4",
      success: "bg-green-50 border-l-4 border-green-400 p-4 rounded-md mb-4",
    },
    icon: {
      base: "inline-block mr-2",
      error: "text-red-500",
      success: "text-green-500",
      primary: "text-blue-500",
    },
    tabButton: "px-4 py-2 font-medium rounded-md transition-colors",
    tabButtonActive: "bg-blue-600 text-white",
    tabButtonInactive: "bg-gray-100 text-gray-700 hover:bg-gray-200",
    tabsContainer: "flex space-x-2 mb-4",
    grid: "grid grid-cols-1 md:grid-cols-2 gap-6",
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className={styles.button.primary}>
          <Plus className="mr-2 h-4 w-4" />
          Ajouter une offre
        </Button>
      </DialogTrigger>
      <DialogContent
        className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto"
        style={{ fontFamily: "'Inter', 'Segoe UI', sans-serif" }}
      >
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-2xl font-bold text-blue-600">Ajouter une offre</DialogTitle>
          <DialogDescription className="text-base">
            Remplissez les informations de la nouvelle offre d'emploi.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
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
                      className={getInputClassName("departement", styles.select)}
                    >
                      <option value="">Sélectionner un département</option>
                      {DEPARTMENTS.map((dept) => (
                        <option key={dept.id} value={dept.name}>
                          {dept.name}
                        </option>
                      ))}
                    </select>
                    {hasError("departement") && <p className="text-xs text-red-500 mt-1">Ce champ est obligatoire</p>}
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
                      className={getInputClassName("domaine", styles.select)}
                    >
                      <option value="">Sélectionner un domaine</option>
                      {availableDomains.map((domain) => (
                        <option key={domain.id} value={domain.name}>
                          {domain.name}
                        </option>
                      ))}
                      <option value={AUTRE_OPTION}>Autre</option>
                    </select>
                    {hasError("domaine") && <p className="text-xs text-red-500 mt-1">Ce champ est obligatoire</p>}
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
                        className={getInputClassName("domaine", styles.input)}
                        required
                      />
                      {hasError("domaine") && <p className="text-xs text-red-500 mt-1">Ce champ est obligatoire</p>}
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
                      className={getInputClassName("poste", styles.select)}
                    >
                      <option value="">Sélectionner un poste</option>
                      {availablePositions.map((position) => (
                        <option key={position.id} value={position.name}>
                          {position.name}
                        </option>
                      ))}
                      <option value={AUTRE_OPTION}>Autre</option>
                    </select>
                    {hasError("poste") && <p className="text-xs text-red-500 mt-1">Ce champ est obligatoire</p>}
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
                        className={getInputClassName("poste", styles.input)}
                        required
                      />
                      {hasError("poste") && <p className="text-xs text-red-500 mt-1">Ce champ est obligatoire</p>}
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
                      value={formData.societe || "Chargement..."}
                      className={`${styles.input} bg-gray-50 font-medium text-gray-800`}
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
                    className={getInputClassName("description", styles.textarea)}
                    placeholder="Décrivez le poste en détail..."
                    required
                  />
                  {hasError("description") && <p className="text-xs text-red-500 mt-1">Ce champ est obligatoire</p>}
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
                      className={getInputClassName("typePoste", styles.select)}
                    >
                      <option value="">Sélectionner un type de contrat</option>
                      {JOB_TYPES.map((type) => (
                        <option key={type.id} value={type.name}>
                          {type.name}
                        </option>
                      ))}
                    </select>
                    {hasError("typePoste") && <p className="text-xs text-red-500 mt-1">Ce champ est obligatoire</p>}
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
                      className={getInputClassName("typeTravail", styles.select)}
                    >
                      <option value="">Sélectionner un type de travail</option>
                      {WORK_TYPES.map((type) => (
                        <option key={type.id} value={type.name}>
                          {type.name}
                        </option>
                      ))}
                    </select>
                    {hasError("typeTravail") && <p className="text-xs text-red-500 mt-1">Ce champ est obligatoire</p>}
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
                        className={`${getInputClassName("heureTravail", styles.input)} pl-10`}
                        required
                      />
                      <Clock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    </div>
                    {hasError("heureTravail") && <p className="text-xs text-red-500 mt-1">Ce champ est obligatoire</p>}
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
                      className={getInputClassName("niveauExperience", styles.select)}
                    >
                      <option value="">Sélectionner un niveau d'expérience</option>
                      {EXPERIENCE_LEVELS.map((level) => (
                        <option key={level.id} value={level.name}>
                          {level.name}
                        </option>
                      ))}
                    </select>
                    {hasError("niveauExperience") && (
                      <p className="text-xs text-red-500 mt-1">Ce champ est obligatoire</p>
                    )}
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
                      className={getInputClassName("niveauEtude", styles.select)}
                    >
                      <option value="">Sélectionner un niveau d'étude</option>
                      {EDUCATION_LEVELS.map((level) => (
                        <option key={level.id} value={level.name}>
                          {level.name}
                        </option>
                      ))}
                    </select>
                    {hasError("niveauEtude") && <p className="text-xs text-red-500 mt-1">Ce champ est obligatoire</p>}
                  </div>

                  {/* Correspondance avec l'offre */}
                  <div className={styles.formGroup}>
                    <label htmlFor="matchingAttachment" className={styles.label}>
                      Correspondance avec l'offre
                    </label>
                    <select
                      id="matchingAttachment"
                      value={formData.matchingAttachment}
                      onChange={(e) => handleSelectChange("matchingAttachment", e.target.value)}
                      className={styles.select}
                    >
                      <option value="">Sélectionner un pourcentage</option>
                      {MATCHING_PERCENTAGES.map((percentage) => (
                        <option key={percentage.id} value={percentage.value}>
                          {percentage.name}
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
                    className={getInputClassName("responsabilite", styles.textarea)}
                    placeholder="Décrivez les responsabilités liées au poste..."
                    required
                  />
                  {hasError("responsabilite") && <p className="text-xs text-red-500 mt-1">Ce champ est obligatoire</p>}
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
                    className={getInputClassName("experience", styles.textarea)}
                    placeholder="Décrivez l'expérience requise pour ce poste..."
                    required
                  />
                  {hasError("experience") && <p className="text-xs text-red-500 mt-1">Ce champ est obligatoire</p>}
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
                        placeholder="Tunisie"
                        className={`${styles.input} pl-10`}
                        required
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
                      className={getInputClassName("ville", styles.select)}
                    >
                      <option value="">Sélectionner une ville</option>
                      {CITIES.map((city) => (
                        <option key={city.id} value={city.name}>
                          {city.name}
                        </option>
                      ))}
                    </select>
                    {hasError("ville") && <p className="text-xs text-red-500 mt-1">Ce champ est obligatoire</p>}
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
                        value={new Date().toISOString().split("T")[0]}
                        disabled={true}
                        className={`${styles.input} pl-10 bg-gray-50 font-medium`}
                        style={{ opacity: 0.7 }}
                      />
                      <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      La date de publication est automatiquement définie à aujourd'hui
                    </p>
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
                        className={`${getInputClassName("dateExpiration", styles.input)} pl-10 border-blue-300`}
                        required
                      />
                      <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    </div>
                    {hasError("dateExpiration") && (
                      <p className="text-xs text-red-500 mt-1">Ce champ est obligatoire</p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">La date doit être postérieure à aujourd'hui</p>
                  </div>
                </div>
              </div>
            )}
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
            <button type="button" onClick={() => setIsOpen(false)} className={styles.button.secondary}>
              Annuler
            </button>
            <button type="submit" disabled={loading} className={styles.button.primary}>
              {loading ? "Ajout en cours..." : "Ajouter l'offre"}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}