"use client"

import Link from "next/link"
import { Facebook, Twitter, Instagram, Linkedin } from "lucide-react"

export default function Footer() {
  return (
    <footer className="bg-slate-50 py-12">
      <div className="container mx-auto px-4">
        {/* Conteneur Flex pour aligner le contenu */}
        <div className="flex flex-col md:flex-row justify-between items-center text-center md:text-left gap-8">
          
          {/* Logo et Infos */}
          <div className="flex flex-col items-center md:items-start">
            <Link href="/" className="flex items-center gap-2 mb-4">
             
              <span className="text-xl font-bold">Talent Match</span>
            </Link>
            <p className="text-muted-foreground">
              Appelez-nous : <span className="text-foreground font-medium">+ 53 132 382</span>
            </p>
            <p className="text-muted-foreground">Tunisia, Nabeul, 8000</p>
          </div>

          {/* Liens rapides */}
          <div className="flex flex-col items-center md:items-start">
            <h4 className="text-base font-semibold mb-3">À propos de nous</h4>
            <ul className="space-y-2">
            <li>
                <Link href="/jobs" className="text-muted-foreground hover:text-primary transition-colors">
                  Annonces
                </Link>
              </li>
              <li>
                <Link href="/temoiniage" className="text-muted-foreground hover:text-primary transition-colors">
                  Témoignages de Candidats
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-muted-foreground hover:text-primary transition-colors">
                  Contact us
                </Link>
              </li>
            </ul>
          </div>

          {/* Réseaux sociaux */}
          <div className="flex flex-col items-center md:items-end">
            <h4 className="text-base font-semibold mb-3">Suivez-nous</h4>
            <div className="flex space-x-4">
              <Link href="#" className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-colors">
                <Facebook size={18} />
              </Link>
              
              <Link href="#" className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-colors">
                <Instagram size={18} />
              </Link>
              
            </div>
          </div>

        </div>

        {/* Copyright */}
        <div className="border-t mt-8 pt-4 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Talent Match. Tous droits réservés.
        </div>
      </div>
    </footer>
  )
}