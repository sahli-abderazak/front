"use client";

import type React from "react";
import { useState } from "react";
import "../components/styles/index.css";
import "../components/styles/contact.css";
import Footer from "../components/index/footer";
import Header from "../components/index/header";
import { MapPin, Phone, Mail, Send } from "lucide-react";

export default function ContactForm() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    subject: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMessage("");
    setErrorMessage("");

    try {
      const response = await fetch("http://localhost:8000/api/contacts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nom: formData.username,
          email: formData.email,
          sujet: formData.subject,
          message: formData.message,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMessage("Message envoyé avec succès !");
        setFormData({
          username: "",
          email: "",
          subject: "",
          message: "",
        });
      } else {
        setErrorMessage(data.message || "Une erreur s'est produite.");
      }
    } catch (error) {
      setErrorMessage("Erreur de connexion au serveur.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-poppins">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto">
          {/* Contact Information */}
          <div className="bg-[#f0f4f8] rounded-xl shadow-lg p-8 mb-10 transform hover:scale-[1.01] transition-all duration-300">
            <h2 className="text-3xl font-bold mb-8 text-gray-800">
              Contactez-nous
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="flex items-start space-x-4 group">
                <div className="flex items-start space-x-4 group">
                  <a
                    href="https://www.google.com/maps/place/Institut+Sup%C3%A9rieur+des+%C3%89tudes+Technologiques+de+Nabeul/@36.4368019,10.6770335,708m/data=!3m1!1e3!4m14!1m7!3m6!1s0x13029f1ca3014f93:0x197afabacb39f85c!2sInstitut+Sup%C3%A9rieur+des+%C3%89tudes+Technologiques+de+Nabeul!8m2!3d36.4368019!4d10.6770335!16s%2Fg%2F1235qk3n!3m5!1s0x13029f1ca3014f93:0x197afabacb39f85c!8m2!3d36.4368019!4d10.6770335!16s%2Fg%2F1235qk3n?entry=ttu&g_ep=EgoyMDI1MDIyNi4xIKXMDSoJLDEwMjExNDU1SAFQAw%3D%3D"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start space-x-4 group"
                  >
                    <div className="bg-white p-3 rounded-full shadow-md group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                      <MapPin className="w-6 h-6 text-blue-600 group-hover:text-white" />
                    </div>
                  </a>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Adresse</h3>
                  <p className="text-gray-600">Tunisia, Nabeul, 8000</p>
                </div>
              </div>
              <div className="flex items-start space-x-4 group">
                <div className="bg-white p-3 rounded-full shadow-md group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                  <Phone className="w-6 h-6 text-blue-600 group-hover:text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Téléphone</h3>
                  <p className="text-gray-600">+ 53 132 382</p>
                </div>
              </div>
              <div className="flex items-start space-x-4 group">
                <a
                  href="https://mail.google.com/mail/?view=cm&fs=1&to=contact@talentmatch.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start space-x-4 group"
                >
                  <div className="bg-white p-3 rounded-full shadow-md group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                    <Mail className="w-6 h-6 text-blue-600 group-hover:text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Email</h3>
                    <p className="text-gray-600">contact@talentmatch.com</p>
                  </div>
                </a>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white rounded-xl shadow-lg p-10">
            <h2 className="text-3xl font-bold mb-8 text-gray-800">
              Laissez un message
            </h2>

            {successMessage && (
              <p className="text-green-600 font-medium">{successMessage}</p>
            )}
            {errorMessage && (
              <p className="text-red-600 font-medium">{errorMessage}</p>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Votre nom
                  </label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    className="w-full px-5 py-4 rounded-lg bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                    placeholder="Votre nom*"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Votre email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-5 py-4 rounded-lg bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                    placeholder="Votre email*"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Sujet
                </label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className="w-full px-5 py-4 rounded-lg bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                  placeholder="Sujet *"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Votre message
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  className="w-full px-5 py-4 rounded-lg bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[180px] transition-all duration-300"
                  placeholder="Écrivez votre message..."
                  required
                ></textarea>
              </div>

              <button
                type="submit"
                className="px-8 py-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-md hover:shadow-lg transform hover:translate-y-[-2px] transition-all duration-300"
                disabled={loading}
              >
                {loading ? "Envoi en cours..." : "Envoyer le message"}
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}