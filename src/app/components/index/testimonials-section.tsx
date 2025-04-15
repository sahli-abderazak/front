"use client"
import Image from "next/image"
import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight, Quote } from "lucide-react"

export default function TestimonialsSection() {
  const [testimonials, setTestimonials] = useState([])
  const [activeIndex, setActiveIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const response = await fetch("http://127.0.0.1:8000/api/temoignagesValides")
        if (!response.ok) {
          throw new Error("Erreur lors de la récupération des témoignages")
        }
        const data = await response.json()

        // Transformer les données pour correspondre à la structure attendue
        const formattedTestimonials = data.temoignages.map((temoignage) => ({
          id: temoignage.id,
          name: temoignage.nom,
          content: temoignage.temoignage,
          position: "Utilisateur", // Valeur par défaut
          avatar: "/placeholder.svg?height=64&width=64", // Image par défaut
        }))

        setTestimonials(formattedTestimonials)
      } catch (error) {
        console.error("Erreur:", error)
        setTestimonials([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchTestimonials()
  }, [])

  const nextTestimonial = () => {
    setActiveIndex((prev) => (prev + 1) % testimonials.length)
  }

  const prevTestimonial = () => {
    setActiveIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)
  }

  if (isLoading) {
    return (
      <section className="py-16 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Témoignages de nos condidats</h2>
            <p className="text-muted-foreground">Chargement des témoignages...</p>
          </div>
        </div>
      </section>
    )
  }

  if (testimonials.length === 0) {
    return (
      <section className="py-16 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Témoignages de nos condidats</h2>
            <p className="text-muted-foreground">Aucun témoignage disponible pour le moment.</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 bg-slate-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Témoignages de nos condidats</h2>
          <p className="text-muted-foreground">Découvrez ce que disent nos condidats satisfaits</p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="relative bg-white p-8 rounded-xl shadow-sm">
            <div className="absolute -top-4 left-8 w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <Quote className="h-4 w-4 text-white" />
            </div>

            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <p className="text-lg mb-6">{testimonials[activeIndex].content}</p>
                <div className="flex items-center">
                  
                  <div>
                    <h4 className="font-semibold">{testimonials[activeIndex].name}</h4>
                  </div>
                </div>
              </div>

              {testimonials.length > 1 && (
                <div className="hidden md:block">
                  <p className="text-lg mb-6">{testimonials[(activeIndex + 1) % testimonials.length].content}</p>
                  <div className="flex items-center">
                    <div>
                      <h4 className="font-semibold">{testimonials[(activeIndex + 1) % testimonials.length].name}</h4>
                     
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-center mt-8 space-x-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveIndex(index)}
                className={`w-2.5 h-2.5 rounded-full ${index === activeIndex ? "bg-primary" : "bg-gray-300"}`}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>

          {testimonials.length > 1 && (
            <div className="flex justify-center mt-6 space-x-4">
              <button
                onClick={prevTestimonial}
                className="w-10 h-10 rounded-full border flex items-center justify-center hover:bg-primary hover:text-white hover:border-primary transition-colors"
                aria-label="Previous testimonial"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={nextTestimonial}
                className="w-10 h-10 rounded-full border flex items-center justify-center hover:bg-primary hover:text-white hover:border-primary transition-colors"
                aria-label="Next testimonial"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

