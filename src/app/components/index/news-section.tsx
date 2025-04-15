"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import Image from "next/image"
import { Globe } from "lucide-react" // Import the Globe icon for website links

import "../styles/recruiters-carousel.css"

interface Recruiter {
  nom_societe: string
  image: string | null
  domaine_activite: string
  apropos: string
  lien_site_web: string | null // Added the website link property
}

export default function RecruitersSection() {
  const [recruiters, setRecruiters] = useState<Recruiter[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentSlide, setCurrentSlide] = useState(0)
  const carouselRef = useRef<HTMLDivElement>(null)
  const autoplayRef = useRef<NodeJS.Timeout | null>(null)

  // Fixed values for display requirements
  const totalRecruiters = 6
  const recruitersPerSlide = 3
  const totalSlides = 2 // 6 recruiters ÷ 3 per slide = 2 slides

  // Function to fetch recruiters
  const fetchRecruiters = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch("http://127.0.0.1:8000/api/recruteurs_acceuil")

      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des recruteurs")
      }

      const data = await response.json()

      // Limit to exactly 6 recruiters
      setRecruiters(data.slice(0, totalRecruiters))
    } catch (err) {
      console.error("Erreur:", err)
      setError("Impossible de charger les recruteurs")
    } finally {
      setLoading(false)
    }
  }, [])

  // Initial fetch and setup
  useEffect(() => {
    fetchRecruiters()

    // Set up a timer to fetch new recruiters every 2 hours
    const fetchInterval = setInterval(
      () => {
        fetchRecruiters()
      },
      2 * 60 * 60 * 1000,
    ) // 2 hours in milliseconds

    return () => {
      clearInterval(fetchInterval)
      if (autoplayRef.current) {
        clearInterval(autoplayRef.current)
      }
    }
  }, [fetchRecruiters])

  // Set up autoplay for carousel
  useEffect(() => {
    // Start autoplay
    autoplayRef.current = setInterval(() => {
      nextSlide()
    }, 5000) // Change slide every 5 seconds

    return () => {
      if (autoplayRef.current) {
        clearInterval(autoplayRef.current)
      }
    }
  }, [])

  // Update carousel position when slide changes
  useEffect(() => {
    if (carouselRef.current) {
      const slideWidth = 100 / recruitersPerSlide
      carouselRef.current.style.transform = `translateX(-${currentSlide * slideWidth * recruitersPerSlide}%)`
    }
  }, [currentSlide])

  // Functions to control the carousel
  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === totalSlides - 1 ? 0 : prev + 1))
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? totalSlides - 1 : prev - 1))
  }

  const goToSlide = (index: number) => {
    setCurrentSlide(index)
  }

  if (loading) {
    return (
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Nos partenaires </h2>
            <p className="text-muted-foreground">Chargement des partenaires...</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="flex justify-center">
                  <div className="rounded-full bg-gray-200 h-24 w-24"></div>
                </div>
                <div className="mt-4 bg-gray-200 h-6 w-3/4 mx-auto rounded"></div>
                <div className="mt-2 bg-gray-200 h-4 w-1/2 mx-auto rounded"></div>
                <div className="mt-2 bg-gray-200 h-4 w-2/3 mx-auto rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Nos partenaires</h2>
            <p className="text-red-500">{error}</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Nos partenaires</h2>
          <p className="text-muted-foreground">
            Trouvez les meilleurs talents et simplifiez votre processus de recrutement.
          </p>
        </div>

        <div className="recruiter-carousel">
          <div className="recruiter-carousel-inner" ref={carouselRef}>
            {recruiters.map((recruiter, index) => (
              <div key={index} className="recruiter-card">
                <div className="recruiter-image-container">
                  <Image
                    src={recruiter.image || "/placeholder.svg?height=120&width=120"}
                    alt={recruiter.nom_societe}
                    width={120}
                    height={120}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="recruiter-card-content">
                  <h3 className="recruiter-name">{recruiter.nom_societe}</h3>
                  <p className="recruiter-position">{recruiter.domaine_activite}</p>
                  <div className="recruiter-description mt-2">
                    <p className="text-sm text-muted-foreground line-clamp-2">{recruiter.apropos}</p>
                  </div>
                  {recruiter.lien_site_web && (
                    <div className="mt-3 flex items-center">
                      <Globe className="h-4 w-4 text-muted-foreground mr-1" />
                      <a
                        href={recruiter.lien_site_web}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline truncate"
                      >
                        {recruiter.lien_site_web.replace(/^https?:\/\/(www\.)?/, "")}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="carousel-dots">
            {[...Array(totalSlides)].map((_, index) => (
              <div
                key={index}
                className={`carousel-dot ${currentSlide === index ? "active" : ""}`}
                onClick={() => goToSlide(index)}
              ></div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}