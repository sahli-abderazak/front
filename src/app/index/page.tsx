"use client"
import Image from "next/image"
import { Upload, Briefcase, Mail } from "lucide-react"
import { useEffect, useState } from "react"

import TestimonialsSection from "../components/index/testimonials-section"
import FeaturedJobs from "../components/index/featured-jobs"
import JobCategories from "../components/index/job-categories"
import RecruitersSection from "../components/index/news-section"

import "../components/styles/index.css"
import Header from "../components/index/header"
import Footer from "../components/index/footer"

export default function Index() {
  const [departement, setDepartement] = useState("")
  const [domaine, setDomaine] = useState("")
  const [isSearching, setIsSearching] = useState(false)

  const [departements, setDepartements] = useState([])
  const [domaines, setDomaines] = useState([])

  useEffect(() => {
    const handleMouseMove = (e) => {
      const cards = document.querySelectorAll(".floating-card")
      const mouseX = e.clientX / window.innerWidth - 0.5
      const mouseY = e.clientY / window.innerHeight - 0.5

      cards.forEach((card) => {
        const moveFactor = Number.parseFloat(card.getAttribute("data-move-factor") || "30")

        const moveX = mouseX * moveFactor
        const moveY = mouseY * moveFactor

        card.style.transform = `translate(${moveX}px, ${moveY}px)`
        card.style.transition = "transform 0.2s ease-out"
      })
    }

    window.addEventListener("mousemove", handleMouseMove)

    document.querySelectorAll(".floating-card").forEach((card) => {
      const randomFactor = 20 + Math.random() * 20
      card.setAttribute("data-move-factor", randomFactor)
    })

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
    }
  }, [])

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <section className="relative bg-slate-50 pt-6 pb-12 lg:pb-0 overflow-hidden mb-30">
        <div className="container mx-auto px-4 -mt-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="space-y-3">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
                  Il ya <span className="text-primary">93,178</span> Poste ici pour toi !
                </h1>
                <p className="text-lg text-muted-foreground">Trouvez un Poste, Stage & Des Opportunitiés de carrière</p>

                <div className=" bg-gradient-to-br from-white to-slate-50 p-7 rounded-2xl border border-slate-100 shadow-md relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 to-purple-500/5 opacity-50"></div>
                  <div className="relative z-10">
                    <h3 className="text-2xl font-bold mb-3 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                      À propos de nous
                    </h3>
                    <p className="text-base leading-relaxed font-light tracking-wide">
                      Notre plateforme innovante vous permet de parcourir et choisir parmi des milliers d'offres
                      d'emploi, postuler en quelques clics, puis passer un test de personnalité alimenté par
                      l'intelligence artificielle. Cette approche unique facilite la présélection des candidats, offrant
                      une expérience fluide tant pour les chercheurs d'emploi que pour les recruteurs.
                    </p>
                  </div>
                  <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-gradient-to-tr from-primary/20 to-transparent rounded-full blur-xl"></div>
                </div>
              </div>
            </div>

            <div className="relative hidden lg:block mt-[40px] mb-[0px]">
              <Image
                src="/image.png"
                alt="Professional at work"
                width={600}
                height={700}
                className="object-contain"
                priority
              />

              <div className="absolute top-20 left-0 bg-white rounded-lg shadow-lg p-4 flex items-center gap-4 floating-card">
                <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                  <Mail className="text-amber-600 w-5 h-5" />
                </div>
                <div>
                  <p className="font-medium">Opportunités par </p>
                  <p className="text-sm text-muted-foreground">Talent Match</p>
                </div>
              </div>

              <div className="absolute bottom-36 right-8 bg-white rounded-lg shadow-lg p-4 flex flex-col items-start floating-card">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 bg-rose-100 rounded-full flex items-center justify-center">
                    <Briefcase className="text-rose-600 w-4 h-4" />
                  </div>
                  <span className="font-medium">Des entreprises creatives</span>
                </div>
                <p className="text-sm text-muted-foreground">Startup</p>
              </div>

              <div className="absolute bottom-20 left-8 bg-white rounded-lg shadow-lg p-4 flex items-center gap-4 floating-card">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <Upload className="text-green-600 w-5 h-5" />
                </div>
                <div>
                  <p className="font-medium">Ajouter ton CV</p>
                  <p className="text-sm text-muted-foreground">Il prend juste des secondes</p>
                </div>
              </div>

              <div className="absolute top-[25%] right-8 bg-white rounded-lg shadow-lg p-4 floating-card">
                <img src="/multi-peoples.png" alt="Candidates" className="w-32 h-auto" />
                <p className="font-medium">10k+ Candidates</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      <JobCategories />
      <FeaturedJobs />
      <TestimonialsSection />
      <RecruitersSection />
      <Footer />
    </div>
  )
}