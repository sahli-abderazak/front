"use client"

import type React from "react"
import { useState, useEffect, useCallback, useRef } from "react"
import "../components/styles/jobs.css"
import "../components/styles/index.css"
import {
  Search,
  MapPin,
  Briefcase,
  Clock,
  ChevronRight,
  ChevronLeft,
  GraduationCap,
  Clock3,
  AlarmClock,
  X,
  Building,
  Filter,
  ArrowUpRight,
  Tv,
  ChevronDown,
} from "lucide-react"
import Footer from "../components/index/footer"
import Header from "../components/index/header"
import Link from "next/link"

interface Offre {
  id: number
  departement: string
  poste: string
  datePublication: string
  dateExpiration: string
  typePoste: string
  typeTravail: string
  heureTravail: string
  niveauEtude: string
  ville: string
  societe: string
  statut: "urgent" | "normal"
  created_at: string
}

interface SearchParams {
  poste: string
  ville: string
  domaine: string
  typePoste?: string
  typeTravail?: string
}

export default function JobsPage() {
  const [showFilters, setShowFilters] = useState(false)
  const [offres, setOffres] = useState<Offre[]>([])
  const [loading, setLoading] = useState(true)
  const [villes, setVilles] = useState<string[]>([])
  const [domaines, setDomaines] = useState<string[]>([])
  const [typesPoste, setTypesPoste] = useState({
    cdi: false,
    cdd: false,
    alternance: false,
    stage: false,
  })
  const [selectedTypeTravail, setSelectedTypeTravail] = useState<string | null>(null)
  const [selectedDatePublication, setSelectedDatePublication] = useState<string>("tous")
  const [selectedExperienceLevel, setSelectedExperienceLevel] = useState<string>("tous")
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [allPostes, setAllPostes] = useState<string[]>([])
  const searchInputRef = useRef<HTMLInputElement>(null)
  const filtersRef = useRef<HTMLDivElement>(null)

  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(6)

  const [searchParams, setSearchParams] = useState<SearchParams>({
    poste: "",
    ville: "",
    domaine: "",
  })

  // Collapse sections on mobile
  const [collapsedSections, setCollapsedSections] = useState({
    typePoste: false,
    datePublication: false,
    experience: false,
    typeTravail: false,
  })

  const toggleSection = (section: keyof typeof collapsedSections) => {
    setCollapsedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  // Update the fetchOffres function to sort by newest first (LIFO)
  const fetchOffres = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch("http://127.0.0.1:8000/api/offres-candidat")
      const data = await response.json()

      // Sort by newest first (LIFO)
      const sortedData = [...data].sort((a, b) => {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      })

      setOffres(sortedData)

      // Extraire tous les titres de poste uniques pour l'autocomplétion
      const uniquePostes = Array.from(new Set(data.map((offre: Offre) => offre.poste)))
      setAllPostes(uniquePostes as string[])

      setLoading(false)
    } catch (error) {
      console.error("Erreur lors de la récupération des offres:", error)
      setLoading(false)
    }
  }, [])

  // Update the searchOffres function to handle experience levels correctly
  const searchOffres = useCallback(
    async (params: SearchParams) => {
      setCurrentPage(1) // Réinitialiser à la première page lors d'une nouvelle recherche
      try {
        setLoading(true)

        // Create form data for the POST request
        const formData = new FormData()
        if (params.poste) formData.append("poste", params.poste)
        if (params.ville) formData.append("ville", params.ville)
        if (params.domaine) formData.append("domaine", params.domaine)

        // Add typePoste to the form data if any job types are selected
        if (params.typePoste) formData.append("typePoste", params.typePoste)
        if (params.typeTravail) formData.append("typeTravail", params.typeTravail)

        // Ajouter les nouveaux filtres
        if (selectedDatePublication && selectedDatePublication !== "tous")
          formData.append("datePublication", selectedDatePublication)

        // Traitement spécial pour le niveau d'expérience
        if (selectedExperienceLevel === "sans_experience") {
          formData.append("niveauExperience", "Sans expérience")
        } else if (selectedExperienceLevel === "plus_10ans") {
          formData.append("niveauExperience", "+10ans")
        } else if (selectedExperienceLevel && selectedExperienceLevel !== "tous") {
          formData.append("niveauExperience", selectedExperienceLevel)
        }

        // Make POST request to the new endpoint
        const response = await fetch("http://127.0.0.1:8000/api/offresRecherche", {
          method: "POST",
          body: formData,
        })

        if (!response.ok) {
          throw new Error("Erreur lors de la recherche")
        }

        const data = await response.json()
        setOffres(data)
      } catch (error) {
        console.error("Erreur lors de la recherche:", error)
      } finally {
        setLoading(false)
      }
    },
    [selectedDatePublication, selectedExperienceLevel],
  )

  const fetchVillesEtDomaines = useCallback(async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/api/villes-domaines")
      if (!response.ok) {
        console.error("Erreur API:", response.status, response.statusText)
        return
      }
      const data = await response.json()
      setVilles(data.villes || [])
      setDomaines(data.domaines || [])
    } catch (error) {
      console.error("Erreur lors de la récupération des villes et domaines:", error)
    }
  }, [])

  useEffect(() => {
    fetchOffres()
    fetchVillesEtDomaines()

    // Ajouter un gestionnaire d'événements pour fermer les suggestions lors d'un clic à l'extérieur
    const handleClickOutside = (event: MouseEvent) => {
      if (searchInputRef.current && !searchInputRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
      }

      // Close filters when clicking outside on mobile
      if (
        showFilters &&
        filtersRef.current &&
        !filtersRef.current.contains(event.target as Node) &&
        !(event.target as Element).closest(".filter-toggle-btn")
      ) {
        setShowFilters(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)

    // Prevent body scrolling when filters are open on mobile
    if (showFilters) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "auto"
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.body.style.overflow = "auto"
    }
  }, [fetchOffres, fetchVillesEtDomaines, showFilters])

  const handleSearch = (e: React.FormEvent) => {
    setCurrentPage(1) // Réinitialiser à la première page lors d'une nouvelle recherche
    e.preventDefault()

    // Get selected job types
    const selectedTypes = Object.entries(typesPoste)
      .filter(([_, isChecked]) => isChecked)
      .map(([type]) => type.toUpperCase())
    const typePosteParam = selectedTypes.length > 0 ? selectedTypes.join(",") : ""

    // Search with all parameters
    searchOffres({
      ...searchParams,
      typePoste: typePosteParam,
      typeTravail: selectedTypeTravail || undefined,
    })

    // Fermer les suggestions après la recherche
    setShowSuggestions(false)

    // Close filters on mobile after search
    if (window.innerWidth < 768) {
      setShowFilters(false)
    }
  }

  // Modifier la fonction toggleFilters pour qu'elle n'applique pas immédiatement les filtres
  const toggleFilters = () => {
    setShowFilters(!showFilters)
  }

  // Modifier la fonction closeFilters pour qu'elle applique les filtres avant de fermer le panneau
  const closeFilters = () => {
    // Appliquer les filtres avant de fermer
    applyFilters()
    setShowFilters(false)
  }

  // Update the applyFilters function to correctly handle experience levels
  const applyFilters = () => {
    // Récupérer les types de poste sélectionnés
    const selectedTypes = Object.entries(typesPoste)
      .filter(([_, isChecked]) => isChecked)
      .map(([type]) => type.toUpperCase())
    const typePosteParam = selectedTypes.length > 0 ? selectedTypes.join(",") : ""

    // Créer le FormData avec tous les filtres
    const formData = new FormData()

    // Ajouter les filtres de base
    if (searchParams.poste) formData.append("poste", searchParams.poste)
    if (searchParams.ville) formData.append("ville", searchParams.ville)
    if (searchParams.domaine) formData.append("domaine", searchParams.domaine)

    // Ajouter les types de poste (CDI, CDD, etc.)
    if (typePosteParam) {
      formData.append("typePoste", typePosteParam)
    }

    // Ajouter le type de travail (Temps plein, partiel, etc.)
    if (selectedTypeTravail) {
      formData.append("typeTravail", selectedTypeTravail)
    }

    // Ajouter la date de publication si elle n'est pas "tous"
    if (selectedDatePublication !== "tous") {
      formData.append("datePublication", selectedDatePublication)
    }

    // Traitement spécial pour le niveau d'expérience
    if (selectedExperienceLevel === "sans_experience") {
      formData.append("niveauExperience", "Sans expérience")
    } else if (selectedExperienceLevel === "plus_10ans") {
      formData.append("niveauExperience", "+10ans")
    } else if (selectedExperienceLevel !== "tous") {
      formData.append("niveauExperience", selectedExperienceLevel)
    }

    // S'assurer que tous les paramètres sont correctement envoyés
    const params = new URLSearchParams()
    formData.forEach((value, key) => {
      params.append(key, value.toString())
    })

    // Appel à l'API avec les paramètres combinés
    setLoading(true)
    setCurrentPage(1)

    fetch("http://127.0.0.1:8000/api/offresRecherche", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Erreur lors de la recherche")
        }
        return response.json()
      })
      .then((data) => {
        setOffres(data)
        setLoading(false)
        setShowFilters(false) // Fermer le panneau des filtres après l'application
      })
      .catch((error) => {
        console.error("Erreur lors de la recherche:", error)
        setLoading(false)
      })
  }

  // Modifier les fonctions de changement de filtre pour qu'elles ne déclenchent pas de recherche immédiate sur mobile
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target

    // Mettre à jour l'état du checkbox
    setTypesPoste((prev) => ({ ...prev, [name]: checked }))

    // Sur desktop, appliquer les filtres immédiatement
    if (window.innerWidth >= 768) {
      // Get all selected job types after this change
      const updatedTypesPoste = { ...typesPoste, [name]: checked }
      const selectedTypes = Object.entries(updatedTypesPoste)
        .filter(([_, isChecked]) => isChecked)
        .map(([type]) => type.toUpperCase())
      const typePosteParam = selectedTypes.length > 0 ? selectedTypes.join(",") : ""

      // Search with all parameters
      searchOffres({
        ...searchParams,
        typePoste: typePosteParam,
        typeTravail: selectedTypeTravail || undefined,
      })
    }
  }

  const handleTypeTravailChange = (typeTravail: string) => {
    // Si on clique sur le type déjà sélectionné, on le désélectionne
    const newTypeTravail = selectedTypeTravail === typeTravail ? null : typeTravail
    setSelectedTypeTravail(newTypeTravail)

    // Sur desktop, appliquer les filtres immédiatement
    if (window.innerWidth >= 768) {
      // Récupérer les types de poste sélectionnés
      const selectedTypes = Object.entries(typesPoste)
        .filter(([_, isChecked]) => isChecked)
        .map(([type]) => type.toUpperCase())
      const typePosteParam = selectedTypes.length > 0 ? selectedTypes.join(",") : ""

      // Rechercher avec tous les paramètres, y compris typeTravail
      searchOffres({
        ...searchParams,
        typePoste: typePosteParam,
        typeTravail: newTypeTravail || undefined,
      })
    }
  }

  const handleDatePublicationChange = (dateValue: string) => {
    setSelectedDatePublication(dateValue)

    // Sur desktop, appliquer les filtres immédiatement
    if (window.innerWidth >= 768) {
      // Récupérer les types de poste sélectionnés
      const selectedTypes = Object.entries(typesPoste)
        .filter(([_, isChecked]) => isChecked)
        .map(([type]) => type.toUpperCase())
      const typePosteParam = selectedTypes.length > 0 ? selectedTypes.join(",") : ""

      // Rechercher avec tous les paramètres
      const formData = new FormData()
      if (searchParams.poste) formData.append("poste", searchParams.poste)
      if (searchParams.ville) formData.append("ville", searchParams.ville)
      if (searchParams.domaine) formData.append("domaine", searchParams.domaine)
      if (typePosteParam) formData.append("typePoste", typePosteParam)
      if (selectedTypeTravail) formData.append("typeTravail", selectedTypeTravail)
      if (selectedExperienceLevel && selectedExperienceLevel !== "tous")
        formData.append("niveauExperience", selectedExperienceLevel)

      // N'ajouter la date que si ce n'est pas "tous"
      if (dateValue !== "tous") {
        formData.append("datePublication", dateValue)
      }

      // Appel direct à l'API pour éviter les problèmes de dépendances
      setLoading(true)
      fetch("http://127.0.0.1:8000/api/offresRecherche", {
        method: "POST",
        body: formData,
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("Erreur lors de la recherche")
          }
          return response.json()
        })
        .then((data) => {
          setOffres(data)
          setLoading(false)
        })
        .catch((error) => {
          console.error("Erreur lors de la recherche:", error)
          setLoading(false)
        })
    }
  }

  // Update the handleExperienceLevelChange function to correctly map experience levels
  const handleExperienceLevelChange = (experienceValue: string) => {
    setSelectedExperienceLevel(experienceValue)

    // Sur desktop, appliquer les filtres immédiatement
    if (window.innerWidth >= 768) {
      // Récupérer les types de poste sélectionnés
      const selectedTypes = Object.entries(typesPoste)
        .filter(([_, isChecked]) => isChecked)
        .map(([type]) => type.toUpperCase())
      const typePosteParam = selectedTypes.length > 0 ? selectedTypes.join(",") : ""

      // Rechercher avec tous les paramètres
      const formData = new FormData()
      if (searchParams.poste) formData.append("poste", searchParams.poste)
      if (searchParams.ville) formData.append("ville", searchParams.ville)
      if (searchParams.domaine) formData.append("domaine", searchParams.domaine)
      if (typePosteParam) formData.append("typePoste", typePosteParam)
      if (selectedTypeTravail) formData.append("typeTravail", selectedTypeTravail)
      if (selectedDatePublication !== "tous") formData.append("datePublication", selectedDatePublication)

      // Traitement spécial pour les niveaux d'expérience
      if (experienceValue === "sans_experience") {
        formData.append("niveauExperience", "Sans expérience")
      } else if (experienceValue === "plus_10ans") {
        formData.append("niveauExperience", "+10ans")
      } else if (experienceValue !== "tous") {
        formData.append("niveauExperience", experienceValue)
      }

      // Appel direct à l'API
      setLoading(true)
      fetch("http://127.0.0.1:8000/api/offresRecherche", {
        method: "POST",
        body: formData,
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("Erreur lors de la recherche")
          }
          return response.json()
        })
        .then((data) => {
          setOffres(data)
          setLoading(false)
        })
        .catch((error) => {
          console.error("Erreur lors de la recherche:", error)
          setLoading(false)
        })
    }
  }

  // Fonction pour gérer la saisie dans le champ de recherche
  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchParams({ ...searchParams, poste: value })

    // Filtrer les suggestions en fonction de la saisie
    if (value.trim() === "") {
      setSuggestions([])
      setShowSuggestions(false)
    } else {
      const filteredSuggestions = allPostes.filter((poste) => poste.toLowerCase().includes(value.toLowerCase()))
      setSuggestions(filteredSuggestions)
      setShowSuggestions(true)
    }
  }

  // Fonction pour sélectionner une suggestion
  const handleSelectSuggestion = (suggestion: string) => {
    setSearchParams({ ...searchParams, poste: suggestion })
    setShowSuggestions(false)
  }

  // Fonction pour effacer le champ de recherche
  const handleClearSearch = () => {
    setSearchParams({ ...searchParams, poste: "" })
    setSuggestions([])
    setShowSuggestions(false)
  }

  // Fonction pour gérer le changement de page
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber)
    // Faire défiler vers le haut de la liste des offres
    window.scrollTo({
      top: document.querySelector(".ls-outer")?.getBoundingClientRect().top + window.scrollY - 100 || 0,
      behavior: "smooth",
    })
  }

  // Fonction pour obtenir l'icône correspondant au type de travail
  const getWorkTypeIcon = (typeTravail: string) => {
    switch (typeTravail) {
      case "À Temps plein":
        return <Briefcase className="work-type-icon" />
      case "À temps partiel":
        return <Clock3 className="work-type-icon" />
      case "Free mission":
        return <AlarmClock className="work-type-icon" />
      default:
        return <Briefcase className="work-type-icon" />
    }
  }

  // Nombre de filtres actifs
  const getActiveFiltersCount = () => {
    let count = 0

    // Compter les types de poste sélectionnés
    Object.values(typesPoste).forEach((isChecked) => {
      if (isChecked) count++
    })

    // Ajouter les autres filtres
    if (selectedTypeTravail) count++
    if (selectedDatePublication !== "tous") count++
    if (selectedExperienceLevel !== "tous") count++

    return count
  }

  const activeFiltersCount = getActiveFiltersCount()

  return (
    <div className="jobs-page">
      <Header />

      {/* Bouton de filtre mobile avec badge */}
      <button className="filter-toggle-btn" onClick={toggleFilters}>
        <Filter size={24} />
        {activeFiltersCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {activeFiltersCount}
          </span>
        )}
      </button>

      {/* Overlay pour mobile */}
      {showFilters && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden" onClick={closeFilters}></div>
      )}

      {/* Header Section */}
      <section className="page-title">
        <div className="auto-container">
          <div className="job-search-form">
            <form className="search-form" onSubmit={handleSearch}>
              <div className="form-group search-field">
                <div className="search-container" ref={searchInputRef}>
                  <div className="search-input-wrapper">
                    <Search className="icon" />
                    <input
                      type="text"
                      placeholder="Titre de poste"
                      value={searchParams.poste}
                      onChange={handleSearchInputChange}
                      onFocus={() => {
                        if (searchParams.poste && suggestions.length > 0) {
                          setShowSuggestions(true)
                        }
                      }}
                    />
                    {searchParams.poste && (
                      <button
                        type="button"
                        className="clear-button"
                        onClick={handleClearSearch}
                        aria-label="Effacer la recherche"
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>

                  {showSuggestions && suggestions.length > 0 && (
                    <div className="suggestions-container">
                      {suggestions.map((suggestion, index) => (
                        <div key={index} className="suggestion-item" onClick={() => handleSelectSuggestion(suggestion)}>
                          {highlightMatch(suggestion, searchParams.poste)}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="form-group category-field">
                <MapPin className="icon" />
                <select
                  value={searchParams.ville}
                  onChange={(e) => setSearchParams({ ...searchParams, ville: e.target.value })}
                >
                  <option value="">Ville</option>
                  {villes.map((ville, index) => (
                    <option key={index} value={ville}>
                      {ville}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group category-field">
                <Building className="icon" />
                <select
                  value={searchParams.domaine}
                  onChange={(e) => setSearchParams({ ...searchParams, domaine: e.target.value })}
                >
                  <option value="">Domaines</option>
                  {domaines.map((domaine, index) => (
                    <option key={index} value={domaine}>
                      {domaine}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group button-field">
                <button type="submit" className="find-jobs-btn">
                  Chercher poste
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Listing Section */}
      <section className="ls-section">
        <div className="auto-container">
          <div className="row">
            {/* Filters Column */}
            <div ref={filtersRef} className={`filters-column ${showFilters ? "show" : ""}`}>
              <div className="inner-column">
                <div className="filters-outer">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Filtres</h3>
                    <button
                      className="close-filters flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200"
                      onClick={closeFilters}
                    >
                      <X size={18} />
                    </button>
                  </div>

                  {/* Active filters summary for mobile */}
                  {activeFiltersCount > 0 && (
                    <div className="mb-4 p-3 bg-blue-50 rounded-lg md:hidden">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-blue-700">
                          {activeFiltersCount} filtre{activeFiltersCount > 1 ? "s" : ""} actif
                          {activeFiltersCount > 1 ? "s" : ""}
                        </span>
                        <button
                          className="text-xs text-blue-700 underline"
                          onClick={() => {
                            setTypesPoste({ cdi: false, cdd: false, alternance: false, stage: false })
                            setSelectedTypeTravail(null)
                            setSelectedDatePublication("tous")
                            setSelectedExperienceLevel("tous")
                            fetchOffres()
                          }}
                        >
                          Réinitialiser
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Job Type */}
                  <div className="switchbox-outer mb-4">
                    <div
                      className="flex justify-between items-center cursor-pointer py-2"
                      onClick={() => toggleSection("typePoste")}
                    >
                      <h4 className="m-0">Type de poste</h4>
                      <ChevronDown
                        size={20}
                        className={`transition-transform ${collapsedSections.typePoste ? "rotate-180" : ""}`}
                      />
                    </div>

                    <div className={`mt-3 ${collapsedSections.typePoste ? "hidden" : "block"}`}>
                      <ul className="switchbox">
                        <li>
                          <span className="title">CDD</span>
                          <label className="switch">
                            <input
                              type="checkbox"
                              name="cdd"
                              checked={typesPoste.cdd}
                              onChange={handleCheckboxChange}
                            />
                            <span className="slider round"></span>
                          </label>
                        </li>
                        <li>
                          <span className="title">CDI</span>
                          <label className="switch">
                            <input
                              type="checkbox"
                              name="cdi"
                              checked={typesPoste.cdi}
                              onChange={handleCheckboxChange}
                            />
                            <span className="slider round"></span>
                          </label>
                        </li>
                        <li>
                          <span className="title">Alternance</span>
                          <label className="switch">
                            <input
                              type="checkbox"
                              name="alternance"
                              checked={typesPoste.alternance}
                              onChange={handleCheckboxChange}
                            />
                            <span className="slider round"></span>
                          </label>
                        </li>
                        <li>
                          <span className="title">Stage</span>
                          <label className="switch">
                            <input
                              type="checkbox"
                              name="stage"
                              checked={typesPoste.stage}
                              onChange={handleCheckboxChange}
                            />
                            <span className="slider round"></span>
                          </label>
                        </li>
                      </ul>
                    </div>
                  </div>

                  {/* Date Posted */}
                  <div className="checkbox-outer mb-4">
                    <div
                      className="flex justify-between items-center cursor-pointer py-2"
                      onClick={() => toggleSection("datePublication")}
                    >
                      <h4 className="m-0">Date de publication</h4>
                      <ChevronDown
                        size={20}
                        className={`transition-transform ${collapsedSections.datePublication ? "rotate-180" : ""}`}
                      />
                    </div>

                    <div className={`mt-3 ${collapsedSections.datePublication ? "hidden" : "block"}`}>
                      <ul className="checkboxes">
                        <li>
                          <input
                            id="check-f"
                            type="radio"
                            name="datePublication"
                            checked={selectedDatePublication === "tous"}
                            onChange={() => handleDatePublicationChange("tous")}
                          />
                          <label htmlFor="check-f">Tous</label>
                        </li>
                        <li>
                          <input
                            id="check-a"
                            type="radio"
                            name="datePublication"
                            checked={selectedDatePublication === "derniere_heure"}
                            onChange={() => handleDatePublicationChange("derniere_heure")}
                          />
                          <label htmlFor="check-a">Derniere heure</label>
                        </li>
                        <li>
                          <input
                            id="check-b"
                            type="radio"
                            name="datePublication"
                            checked={selectedDatePublication === "24_heure"}
                            onChange={() => handleDatePublicationChange("24_heure")}
                          />
                          <label htmlFor="check-b">24 Heures</label>
                        </li>
                        <li>
                          <input
                            id="check-c"
                            type="radio"
                            name="datePublication"
                            checked={selectedDatePublication === "derniers_7_jours"}
                            onChange={() => handleDatePublicationChange("derniers_7_jours")}
                          />
                          <label htmlFor="check-c">Derniers 7 jours</label>
                        </li>
                      </ul>
                    </div>
                  </div>

                  {/* Experience Level */}
                  <div className="checkbox-outer mb-4">
                    <div
                      className="flex justify-between items-center cursor-pointer py-2"
                      onClick={() => toggleSection("experience")}
                    >
                      <h4 className="m-0">Niveau d'expérience</h4>
                      <ChevronDown
                        size={20}
                        className={`transition-transform ${collapsedSections.experience ? "rotate-180" : ""}`}
                      />
                    </div>

                    <div className={`mt-3 ${collapsedSections.experience ? "hidden" : "block"}`}>
                      <ul className="checkboxes square">
                        <li>
                          <input
                            id="check-ba"
                            type="radio"
                            name="niveauExperience"
                            checked={selectedExperienceLevel === "tous"}
                            onChange={() => handleExperienceLevelChange("tous")}
                          />
                          <label htmlFor="check-ba">Tous</label>
                        </li>

                        <li>
                          <input
                            id="check-sans"
                            type="radio"
                            name="niveauExperience"
                            checked={selectedExperienceLevel === "sans_experience"}
                            onChange={() => handleExperienceLevelChange("sans_experience")}
                          />
                          <label htmlFor="check-sans">Sans expérience</label>
                        </li>
                        <li>
                          <input
                            id="check-bc"
                            type="radio"
                            name="niveauExperience"
                            checked={selectedExperienceLevel === "2ans"}
                            onChange={() => handleExperienceLevelChange("2ans")}
                          />
                          <label htmlFor="check-bc">2 ans</label>
                        </li>
                        <li>
                          <input
                            id="check-be"
                            type="radio"
                            name="niveauExperience"
                            checked={selectedExperienceLevel === "5ans"}
                            onChange={() => handleExperienceLevelChange("5ans")}
                          />
                          <label htmlFor="check-be">5 ans</label>
                        </li>
                        <li>
                          <input
                            id="check-bf"
                            type="radio"
                            name="niveauExperience"
                            checked={selectedExperienceLevel === "7ans"}
                            onChange={() => handleExperienceLevelChange("7ans")}
                          />
                          <label htmlFor="check-bf">7 ans</label>
                        </li>
                        <li>
                          <input
                            id="check-bg"
                            type="radio"
                            name="niveauExperience"
                            checked={selectedExperienceLevel === "plus_10ans"}
                            onChange={() => handleExperienceLevelChange("plus_10ans")}
                          />
                          <label htmlFor="check-bg">Plus de 10 ans</label>
                        </li>
                      </ul>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="filter-block">
                    <div
                      className="flex justify-between items-center cursor-pointer py-2"
                      onClick={() => toggleSection("typeTravail")}
                    >
                      <h4 className="m-0">Types de travail</h4>
                      <ChevronDown
                        size={20}
                        className={`transition-transform ${collapsedSections.typeTravail ? "rotate-180" : ""}`}
                      />
                    </div>

                    <div className={`${collapsedSections.typeTravail ? "hidden" : "block"}`}>
                      <div className="work-type-tags">
                        <button
                          onClick={() => handleTypeTravailChange("À Temps plein")}
                          className={`modern-work-button ${selectedTypeTravail === "À Temps plein" ? "active" : ""}`}
                        >
                          <Briefcase size={18} className="mr-2" />
                          <span>À Temps plein</span>
                        </button>
                        <button
                          onClick={() => handleTypeTravailChange("À temps partiel")}
                          className={`modern-work-button ${selectedTypeTravail === "À temps partiel" ? "active" : ""}`}
                        >
                          <Clock3 size={18} className="mr-2" />
                          <span>À temps partiel</span>
                        </button>
                        <button
                          onClick={() => handleTypeTravailChange("Free mission")}
                          className={`modern-work-button ${selectedTypeTravail === "Free mission" ? "active" : ""}`}
                        >
                          <AlarmClock size={18} className="mr-2" />
                          <span>Free mission</span>
                        </button>
                        <button
                          onClick={() => handleTypeTravailChange("Télétravail")}
                          className={`modern-work-button ${selectedTypeTravail === "Télétravail" ? "active" : ""}`}
                        >
                          <Tv size={18} className="mr-2" />
                          <span>Télétravail</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Apply filters button for mobile */}
                  <div className="mt-6 md:hidden">
                    <button className="find-jobs-btn w-full" onClick={applyFilters}>
                      Appliquer les filtres
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Content Column */}
            <div className="content-column">
              <div className="ls-outer">
                {/* Active filters summary for desktop */}
                {activeFiltersCount > 0 && (
                  <div className="hidden md:block mb-4 p-3 bg-blue-50 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-blue-700">
                        {activeFiltersCount} filtre{activeFiltersCount > 1 ? "s" : ""} actif
                        {activeFiltersCount > 1 ? "s" : ""}
                      </span>
                      <button
                        className="text-xs text-blue-700 underline"
                        onClick={() => {
                          setTypesPoste({ cdi: false, cdd: false, alternance: false, stage: false })
                          setSelectedTypeTravail(null)
                          setSelectedDatePublication("tous")
                          setSelectedExperienceLevel("tous")
                          fetchOffres()
                        }}
                      >
                        Réinitialiser tous les filtres
                      </button>
                    </div>
                  </div>
                )}

                {/* Job Listings */}
                {loading ? (
                  <div className="loader-container">
                    <div className="loader"></div>
                  </div>
                ) : offres.length > 0 ? (
                  <>
                    {/* Affichage des offres paginées */}
                    {offres.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((offre, index) => (
                      <JobBlock key={index} offre={offre} />
                    ))}

                    {/* Pagination en bas */}
                    {offres.length > itemsPerPage && (
                      <nav className="ls-pagination">
                        <ul>
                          <li className={`prev ${currentPage === 1 ? "disabled" : ""}`}>
                            <a
                              href="#"
                              onClick={(e) => {
                                e.preventDefault()
                                if (currentPage > 1) handlePageChange(currentPage - 1)
                              }}
                            >
                              <ChevronLeft />
                            </a>
                          </li>
                          {Array.from({ length: Math.ceil(offres.length / itemsPerPage) }, (_, i) => (
                            <li key={i}>
                              <a
                                href="#"
                                className={currentPage === i + 1 ? "current-page" : ""}
                                onClick={(e) => {
                                  e.preventDefault()
                                  handlePageChange(i + 1)
                                }}
                              >
                                {i + 1}
                              </a>
                            </li>
                          ))}
                          <li
                            className={`next ${currentPage === Math.ceil(offres.length / itemsPerPage) ? "disabled" : ""}`}
                          >
                            <a
                              href="#"
                              onClick={(e) => {
                                e.preventDefault()
                                if (currentPage < Math.ceil(offres.length / itemsPerPage))
                                  handlePageChange(currentPage + 1)
                              }}
                            >
                              <ChevronRight />
                            </a>
                          </li>
                        </ul>
                      </nav>
                    )}
                  </>
                ) : (
                  <div className="text-center py-10">Aucune offre disponible pour le moment</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  )
}

// Fonction pour mettre en évidence les parties correspondantes dans les suggestions
function highlightMatch(text: string, query: string): React.ReactNode {
  if (!query) return text

  const parts = text.split(new RegExp(`(${query})`, "gi"))

  return (
    <>
      {parts.map((part, index) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <span key={index} className="highlight">
            {part}
          </span>
        ) : (
          part
        ),
      )}
    </>
  )
}

function JobBlock({ offre }: { offre: Offre }) {
  // Format the date
  const formatDate = (dateString: string) => {
    if (!dateString) return ""
    const date = new Date(dateString)
    return date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }

  return (
    <Link href={`/jobsDetail/${offre.id}`} legacyBehavior passHref>
      <a className="job-block" style={{ textDecoration: "none", color: "inherit", display: "block" }}>
        <div className="inner-box">
          <div className="content">
            <h4>
              {offre.poste}
              <ArrowUpRight size={16} className="ml-auto text-gray-400" />
            </h4>
            <ul className="job-info">
              <li>
                <Building className="icon" /> {offre.societe}
              </li>
              <li>
                <MapPin className="icon" /> {offre.ville}
              </li>
              <li>
                <Clock className="icon" /> {offre.heureTravail}
              </li>
              <li>
                <GraduationCap className="icon" /> {offre.niveauEtude}
              </li>
            </ul>
            <div className="flex justify-between items-center mt-2">
              <ul className="job-other-info">
                <li className="time">{offre.typeTravail}</li>
                <li className="privacy">{offre.typePoste}</li>
                {offre.statut === "urgent" && <li className="required">Urgent</li>}
              </ul>
              <div className="text-sm text-gray-500">
                <span className="flex items-center">
                  <Clock3 size={14} className="mr-1" /> Publié le {formatDate(offre.created_at)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </a>
    </Link>
  )
}

