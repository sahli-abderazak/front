"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export default function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  // Close mobile menu when screen size changes to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsOpen(false)
      }
    }

    // Add scroll effect
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true)
      } else {
        setScrolled(false)
      }
    }

    window.addEventListener("resize", handleResize)
    window.addEventListener("scroll", handleScroll)

    return () => {
      window.removeEventListener("resize", handleResize)
      window.removeEventListener("scroll", handleScroll)
    }
  }, [])

  // Prevent scrolling when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }

    return () => {
      document.body.style.overflow = "unset"
    }
  }, [isOpen])

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-200",
        scrolled ? "bg-background/95 backdrop-blur-sm shadow-sm" : "bg-background",
      )}
    >
      <div className="container mx-auto px-4">
        <nav className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            {/* Logo */}
            <Link href="/">
              <Image src="/Logo.jpeg" alt="Talent Match Logo" width={70} height={70} className="rounded-md" />
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-6">
              <Link href="/" className="text-sm font-medium hover:text-primary transition-colors">
                Accueil
              </Link>
              <Link href="/jobs" className="text-sm font-medium hover:text-primary transition-colors">
                Annonces
              </Link>
              <Link href="/temoiniage" className="text-sm font-medium hover:text-primary transition-colors">
                Témoignages
              </Link>
              <Link href="/contact" className="text-sm font-medium hover:text-primary transition-colors">
                Contact
              </Link>
            </div>
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center gap-4">
            <Button variant="outline" asChild>
              <Link href="/register">S'inscrire</Link>
            </Button>
            <Button asChild>
              <Link href="/login">Se connecter</Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-foreground"
            onClick={() => setIsOpen(!isOpen)}
            aria-label={isOpen ? "Fermer le menu" : "Ouvrir le menu"}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </nav>
      </div>

      {/* Mobile Sidebar */}
      <div
        className={cn(
          "fixed inset-0 bg-background/80 backdrop-blur-sm z-50 md:hidden transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none",
        )}
        onClick={() => setIsOpen(false)}
      >
        <div
          className={cn(
            "fixed top-0 right-0 h-full w-[75%] max-w-sm bg-background border-l shadow-xl p-6 transition-transform duration-300 ease-in-out transform",
            isOpen ? "translate-x-0" : "translate-x-full",
          )}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex flex-col h-full">
            <div className="flex justify-between items-center mb-8">
              <Link href="/" onClick={() => setIsOpen(false)}>
                <Image src="/Logo.jpeg" alt="Talent Match Logo" width={60} height={60} className="rounded-md" />
              </Link>
              <button className="p-2 text-foreground" onClick={() => setIsOpen(false)} aria-label="Fermer le menu">
                <X size={24} />
              </button>
            </div>

            <div className="flex flex-col gap-6 mb-8">
              <Link
                href="/"
                className="text-lg font-medium hover:text-primary transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Accueil
              </Link>
              <Link
                href="/jobs"
                className="text-lg font-medium hover:text-primary transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Annonces
              </Link>
              <Link
                href="/temoiniage"
                className="text-lg font-medium hover:text-primary transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Témoignages
              </Link>
              <Link
                href="/contact"
                className="text-lg font-medium hover:text-primary transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Contact
              </Link>
            </div>

            <div className="mt-auto flex flex-col gap-4">
              <Button variant="outline" className="w-full" asChild>
                <Link href="/register" onClick={() => setIsOpen(false)}>
                  S'inscrire
                </Link>
              </Button>
              <Button className="w-full" asChild>
                <Link href="/login" onClick={() => setIsOpen(false)}>
                  Se connecter
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}