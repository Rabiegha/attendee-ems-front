# Instructions pour déployer l'APK mobile

## Problème actuel
Le fichier `AttendeeV2.apk` n'existe pas dans `public/downloads/`.

## Solution

### Option 1: Déployer l'APK dans le frontend (recommandé pour dev)
1. Télécharger l'APK depuis expo.dev
2. Le placer dans `attendee-ems-front/public/downloads/AttendeeV2.apk`
3. Le fichier sera accessible via `http://localhost:5173/downloads/AttendeeV2.apk`

### Option 2: Servir l'APK depuis le VPS (recommandé pour production)
1. Upload l'APK sur le VPS dans `/var/www/downloads/AttendeeV2.apk`
2. Configurer nginx pour servir ce dossier
3. Modifier le frontend pour pointer vers `https://attendee.fr/downloads/AttendeeV2.apk`

## Configuration nginx (VPS)

Ajouter dans la config nginx:

```nginx
location /downloads/ {
    alias /var/www/downloads/;
    autoindex off;
    
    # Headers pour forcer le téléchargement
    add_header Content-Disposition "attachment";
    add_header X-Content-Type-Options nosniff;
    
    # Cache
    expires 1d;
    add_header Cache-Control "public, immutable";
}
```

## Commandes

### Télécharger l'APK depuis expo.dev
```bash
# Récupérer l'URL de build depuis expo.dev
# puis télécharger avec:
curl -L "URL_DE_BUILD" -o AttendeeV2.apk
```

### Upload sur VPS
```bash
scp AttendeeV2.apk debian@attendee.fr:/var/www/downloads/
```
