"use client"

import type React from "react"
import { useState } from "react"
import Image from "next/image"
import "../components/styles/temoiniage.css"
import "../components/styles/index.css"
import Header from "../components/index/header"
import Footer from "../components/index/footer"

export default function BlogSingle() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [comment, setComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setMessage("")

    try {
      const response = await fetch("http://localhost:8000/api/temoiniage", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nom: name,
          email: email,
          temoignage: comment,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setMessage("Votre témoignage a été envoyé avec succès !")
        setName("")
        setEmail("")
        setComment("")
      } else {
        setMessage(data.message || "Une erreur est survenue. Veuillez réessayer.")
      }
    } catch (error) {
      setMessage("Erreur de connexion au serveur. Veuillez réessayer.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="page-wrapper">
      <Header />

      <section className="blog-single">
        <div className="auto-container">
          <div className="upper-box">
            <h3 className="heading-title">
              Votre satisfaction est notre plus belle réussite.
              <span className="heading-highlight">Partagez votre expérience et inspirez les autres.</span>
            </h3>
          </div>
        </div>

        <figure className="main-image">
          <Image
            src="/blog-single.jpg"
            alt="Témoignages"
            width={1200}
            height={600}
            className="featured-image"
            priority
          />
        </figure>

        <div className="auto-container">
          <div className="comment-form default-form">
            <h4 className="form-title">Laissez vos témoignages ici</h4>

            {message && <div className={`message ${message.includes("succès") ? "success" : "error"}`}>{message}</div>}

            <form onSubmit={handleSubmit}>
              <div className="row clearfix">
                <div className="col-lg-6 col-md-12 col-sm-12 form-group">
                  <label htmlFor="name">Nom</label>
                  <input
                    id="name"
                    type="text"
                    name="username"
                    placeholder="Votre nom"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="input-field"
                  />
                </div>

                <div className="col-lg-6 col-md-12 col-sm-12 form-group">
                  <label htmlFor="email">Email</label>
                  <input
                    id="email"
                    type="email"
                    name="email"
                    placeholder="Votre email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-field"
                  />
                </div>

                <div className="col-lg-12 col-md-12 col-sm-12 form-group">
                  <label htmlFor="comment">Témoignage</label>
                  <textarea
                    id="comment"
                    name="message"
                    placeholder="Partagez votre expérience..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="textarea-field"
                    rows={6}
                  ></textarea>
                </div>

                <div className="col-lg-12 col-md-12 col-sm-12 form-group">
                  <button className="theme-btn btn-style-one" type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Envoi en cours..." : "Envoyer"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}