# Configuration Google Maps

## Obtenir une clé API Google Maps

Pour activer la fonctionnalité d'autocomplete d'adresse avec Google Maps Places API, vous devez obtenir une clé API Google Maps.

### Étapes :

1. **Créer un projet Google Cloud** :
   - Allez sur [Google Cloud Console](https://console.cloud.google.com/)
   - Créez un nouveau projet ou sélectionnez un projet existant

2. **Activer l'API Places** :
   - Dans le menu de navigation, allez dans "APIs & Services" > "Library"
   - Recherchez "Places API"
   - Cliquez sur "Places API" et activez-le
   - Recherchez également "Maps JavaScript API" et activez-le

3. **Créer une clé API** :
   - Allez dans "APIs & Services" > "Credentials"
   - Cliquez sur "Create Credentials" > "API key"
   - Copiez la clé générée

4. **Sécuriser votre clé API** (Recommandé) :
   - Cliquez sur votre clé API pour la modifier
   - Sous "Application restrictions", sélectionnez "HTTP referrers (web sites)"
   - Ajoutez vos domaines autorisés (ex: `localhost:*`, `https://votre-domaine.com/*`)
   - Sous "API restrictions", sélectionnez "Restrict key"
   - Cochez "Places API" et "Maps JavaScript API"
   - Cliquez sur "Save"

5. **Configurer dans l'application** :
   - Créez un fichier `.env` à la racine du projet (s'il n'existe pas déjà)
   - Ajoutez votre clé API :
     ```bash
     VITE_GOOGLE_MAPS_API_KEY=votre_clé_api_ici
     ```
   - Redémarrez le serveur de développement

## Utilisation

Une fois configuré, l'autocomplete Google Maps sera automatiquement activé dans le formulaire de création d'événement lorsque vous sélectionnez un lieu "Physique" ou "Hybride".

### Fonctionnalités :

- ✅ Autocomplete d'adresse en temps réel
- ✅ Sélection d'adresse avec la souris ou le clavier
- ✅ Extraction automatique des composants d'adresse (rue, ville, code postal, pays)
- ✅ Récupération des coordonnées GPS (latitude, longitude)
- ✅ Fallback vers un champ texte simple si la clé API n'est pas configurée

## Mode sans clé API

Si vous n'avez pas de clé API Google Maps, l'application fonctionnera toujours avec un champ de saisie manuel d'adresse. Un message informatif sera affiché pour indiquer comment activer l'autocomplete.

## Tarification

Google Maps offre un crédit mensuel gratuit de 200 $ qui couvre environ :
- 40 000 sessions d'autocomplete par mois
- 28 500 requêtes de détails de lieu par mois

Pour plus d'informations : [Google Maps Platform Pricing](https://mapsplatform.google.com/pricing/)

## Dépannage

### L'autocomplete ne fonctionne pas

1. Vérifiez que votre clé API est correctement configurée dans `.env`
2. Vérifiez que les APIs "Places API" et "Maps JavaScript API" sont activées
3. Vérifiez la console du navigateur pour voir s'il y a des erreurs
4. Assurez-vous que votre domaine est autorisé dans les restrictions de la clé API

### Erreur "This API project is not authorized to use this API"

- Vérifiez que "Places API" et "Maps JavaScript API" sont activées dans votre projet Google Cloud

### Erreur "RefererNotAllowedMapError"

- Vérifiez les restrictions HTTP referrers de votre clé API
- Ajoutez votre domaine (ou `localhost:*` pour le développement) aux referrers autorisés
