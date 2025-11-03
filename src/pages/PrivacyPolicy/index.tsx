import React from 'react'
import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export const PrivacyPolicyPage: React.FC = () => {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors duration-200 mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            Retour
          </button>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Politique de Confidentialité
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Dernière mise à jour : {new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>

        {/* Content */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8 space-y-8 transition-colors duration-200">
          
          {/* Section 1 */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              1. Introduction
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              La présente politique de confidentialité décrit comment nous collectons, utilisons, stockons et protégeons 
              vos données personnelles lorsque vous utilisez notre plateforme de gestion d'événements. Nous nous engageons 
              à protéger votre vie privée et à respecter la réglementation en vigueur, notamment le Règlement Général sur 
              la Protection des Données (RGPD).
            </p>
          </section>

          {/* Section 2 */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              2. Données collectées
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
              Nous collectons les types de données suivants :
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
              <li>Informations d'identification : nom, prénom, adresse email, numéro de téléphone</li>
              <li>Données professionnelles : entreprise, fonction, secteur d'activité</li>
              <li>Données de participation : événements auxquels vous vous inscrivez, présence, check-ins</li>
              <li>Données techniques : adresse IP, type de navigateur, pages consultées, durée de visite</li>
              <li>Données de communication : échanges avec notre support, préférences de notification</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              3. Finalités du traitement
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
              Vos données personnelles sont utilisées pour :
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
              <li>Gérer votre inscription et participation aux événements</li>
              <li>Vous envoyer des confirmations, rappels et informations importantes concernant les événements</li>
              <li>Améliorer nos services et personnaliser votre expérience</li>
              <li>Générer des statistiques anonymisées sur la fréquentation des événements</li>
              <li>Respecter nos obligations légales et réglementaires</li>
              <li>Vous informer de nos événements futurs (avec votre consentement explicite)</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              4. Base légale du traitement
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              Le traitement de vos données personnelles repose sur :
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4 mt-3">
              <li><strong>L'exécution du contrat</strong> : inscription et participation aux événements</li>
              <li><strong>Votre consentement</strong> : communications marketing et newsletters</li>
              <li><strong>Notre intérêt légitime</strong> : amélioration de nos services, sécurité de la plateforme</li>
              <li><strong>Obligations légales</strong> : conservation des données fiscales et comptables</li>
            </ul>
          </section>

          {/* Section 5 */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              5. Partage des données
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              Nous ne vendons jamais vos données personnelles. Vos données peuvent être partagées avec :
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4 mt-3">
              <li>Les organisateurs des événements auxquels vous participez</li>
              <li>Nos prestataires de services (hébergement, emailing, analytics) sous contrat de confidentialité</li>
              <li>Les autorités compétentes en cas d'obligation légale</li>
            </ul>
          </section>

          {/* Section 6 */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              6. Durée de conservation
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              Vos données personnelles sont conservées pendant la durée nécessaire aux finalités pour lesquelles elles 
              ont été collectées :
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4 mt-3">
              <li><strong>Données de participation</strong> : 3 ans après le dernier événement</li>
              <li><strong>Données comptables</strong> : 10 ans conformément aux obligations légales</li>
              <li><strong>Consentement marketing</strong> : 3 ans à compter du dernier contact</li>
            </ul>
          </section>

          {/* Section 7 */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              7. Vos droits
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
              Conformément au RGPD, vous disposez des droits suivants :
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
              <li><strong>Droit d'accès</strong> : obtenir une copie de vos données personnelles</li>
              <li><strong>Droit de rectification</strong> : corriger vos données inexactes ou incomplètes</li>
              <li><strong>Droit à l'effacement</strong> : supprimer vos données dans certaines conditions</li>
              <li><strong>Droit à la limitation</strong> : limiter le traitement de vos données</li>
              <li><strong>Droit à la portabilité</strong> : recevoir vos données dans un format structuré</li>
              <li><strong>Droit d'opposition</strong> : vous opposer au traitement de vos données</li>
              <li><strong>Droit de retirer votre consentement</strong> : à tout moment, sans affecter la licéité du traitement antérieur</li>
            </ul>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mt-4">
              Pour exercer ces droits, contactez-nous à l'adresse : <strong>privacy@votre-domaine.com</strong>
            </p>
          </section>

          {/* Section 8 */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              8. Sécurité des données
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              Nous mettons en œuvre des mesures techniques et organisationnelles appropriées pour protéger vos données 
              personnelles contre tout accès non autorisé, perte, destruction ou altération. Ces mesures incluent le 
              chiffrement des données, l'authentification sécurisée, les sauvegardes régulières et la formation de notre 
              personnel.
            </p>
          </section>

          {/* Section 9 */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              9. Cookies et technologies similaires
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              Notre plateforme utilise des cookies pour améliorer votre expérience utilisateur, analyser le trafic et 
              personnaliser le contenu. Vous pouvez gérer vos préférences de cookies dans les paramètres de votre 
              navigateur. Certains cookies sont essentiels au fonctionnement de la plateforme.
            </p>
          </section>

          {/* Section 10 */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              10. Modifications de la politique
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              Nous nous réservons le droit de modifier cette politique de confidentialité à tout moment. Les modifications 
              seront publiées sur cette page avec une nouvelle date de mise à jour. Nous vous encourageons à consulter 
              régulièrement cette page pour rester informé de nos pratiques en matière de protection des données.
            </p>
          </section>

          {/* Section 11 */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              11. Contact
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              Pour toute question concernant cette politique de confidentialité ou le traitement de vos données personnelles, 
              vous pouvez nous contacter :
            </p>
            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 transition-colors duration-200">
              <p className="text-gray-700 dark:text-gray-300"><strong>Email :</strong> privacy@votre-domaine.com</p>
              <p className="text-gray-700 dark:text-gray-300 mt-2"><strong>Adresse postale :</strong> [Votre adresse complète]</p>
              <p className="text-gray-700 dark:text-gray-300 mt-2"><strong>Téléphone :</strong> [Votre numéro]</p>
            </div>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mt-4">
              Vous avez également le droit de déposer une réclamation auprès de la Commission Nationale de l'Informatique 
              et des Libertés (CNIL) si vous estimez que vos droits ne sont pas respectés.
            </p>
          </section>

        </div>
      </div>
    </div>
  )
}
