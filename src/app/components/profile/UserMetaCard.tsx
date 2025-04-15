"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import ProfileEditModal from "./profile-edit-modal";

interface UserData {
  id: number;
  email: string;
  numTel?: string;
  password?: string;
  adresse?: string;
  image?: string;
  nom_societe?: string;
  role?: string;
  // Nouveaux champs
  apropos?: string;
  lien_site_web?: string;
  fax?: string;
  domaine_activite?: string;
}

export default function ProfilePage() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchUserProfile = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Token non trouvé");

      const response = await fetch("http://127.0.0.1:8000/api/users/profile", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des données");
      }
      const data = await response.json();
      setUserData({
        ...data,
        password: "", // Ne pas afficher le mot de passe dans l'UI
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Une erreur inconnue s'est produite"
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const handleProfileUpdateSuccess = () => {
    fetchUserProfile(); // Refresh user data after successful update
  };

  return (
    <main>
      <div className="p-4 mx-auto max-w-7xl md:p-6">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-4 border-t-primary rounded-full animate-spin"></div>
          </div>
        ) : error ? (
          <div className="p-4 text-red-700 bg-red-100 rounded-md">{error}</div>
        ) : (
          <>
            <div className="p-5 mb-6 border border-gray-200 rounded-2xl lg:p-6">
              <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                <div className="flex flex-col items-center w-full gap-6 xl:flex-row">
                  <div className="w-20 h-20 overflow-hidden border border-gray-200 rounded-full">
                    {userData?.image ? (
                      <Image
                        src={userData.image || "/placeholder.svg"}
                        alt={userData?.nom_societe || "Entreprise"}
                        width={80}
                        height={80}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <Image
                        src="/placeholder.svg?height=80&width=80"
                        alt="Entreprise"
                        width={80}
                        height={80}
                        className="object-cover w-full h-full"
                      />
                    )}
                  </div>
                  <div className="order-3 xl:order-2">
                    <h4 className="mb-2 text-lg font-semibold text-center text-gray-800 xl:text-left">
                      {userData?.nom_societe || "Entreprise"}
                    </h4>
                    <div className="flex flex-col items-center gap-1 text-center xl:flex-row xl:gap-3 xl:text-left">
                      <p className="text-sm text-gray-500">
                        {userData?.domaine_activite || "Aucun domaine spécifié"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Informations Personnelles et Adresse */}
            <div className="p-5 border border-gray-200 rounded-2xl lg:p-6">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between mb-6">
                <h4 className="text-lg font-semibold text-gray-800">
                  Informations Entreprise
                </h4>
                <Button
                  variant="outline"
                  className="w-full lg:w-auto rounded-full"
                  onClick={() => setIsProfileModalOpen(true)}
                >
                  <Pencil className="w-4 h-4 mr-2" />
                  Modifier
                </Button>
              </div>

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Informations Entreprise */}
                <div className="border-b lg:border-b-0 lg:border-r border-gray-200 pb-6 lg:pb-0 lg:pr-6">
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <p className="mb-2 text-xs leading-normal text-gray-500">
                        Nom de l'entreprise
                      </p>
                      <p className="text-sm font-medium text-gray-800">
                        {userData?.nom_societe || "Non spécifié"}
                      </p>
                    </div>

                    <div>
                      <p className="mb-2 text-xs leading-normal text-gray-500">
                        Adresse email
                      </p>
                      <p className="text-sm font-medium text-gray-800">
                        {userData?.email}
                      </p>
                    </div>

                    <div>
                      <p className="mb-2 text-xs leading-normal text-gray-500">
                        Téléphone
                      </p>
                      <p className="text-sm font-medium text-gray-800">
                        {userData?.numTel || "Non spécifié"}
                      </p>
                    </div>

                    <div>
                      <p className="mb-2 text-xs leading-normal text-gray-500">
                        Fax
                      </p>
                      <p className="text-sm font-medium text-gray-800">
                        {userData?.fax || "Non spécifié"}
                      </p>
                    </div>

                    <div>
                      <p className="mb-2 text-xs leading-normal text-gray-500">
                        Domaine d'activité
                      </p>
                      <p className="text-sm font-medium text-gray-800">
                        {userData?.domaine_activite || "Non spécifié"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Adresse et Site Web */}
                <div className="pt-6 lg:pt-0 lg:pl-6">
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <p className="mb-2 text-xs leading-normal text-gray-500">
                        Adresse
                      </p>
                      <p className="text-sm font-medium text-gray-800">
                        {userData?.adresse || "Non spécifié"}
                      </p>
                    </div>

                    <div>
                      <p className="mb-2 text-xs leading-normal text-gray-500">
                        Site Web
                      </p>
                      {userData?.lien_site_web ? (
                        <a
                          href={userData.lien_site_web}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          Visiter le site
                        </a>
                      ) : (
                        <p className="text-sm font-medium text-gray-800">
                          Non spécifié
                        </p>
                      )}
                    </div>

                    <div>
                      <p className="mb-2 text-xs leading-normal text-gray-500">
                        Rôle
                      </p>
                      <p className="text-sm font-medium text-gray-800">
                        {userData?.role || "Non spécifié"}
                      </p>
                    </div>

                    <div>
                      <p className="mb-2 text-xs leading-normal text-gray-500">
                        À propos
                      </p>
                      <p className="text-sm font-medium text-gray-800">
                        {userData?.apropos || "Non spécifié"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Edit Profile Modal */}
      {userData && (
        <ProfileEditModal
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
          userData={userData}
          onSuccess={handleProfileUpdateSuccess}
        />
      )}
    </main>
  );
}
