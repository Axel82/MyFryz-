# ❄️ MyFryz'

MyFryz' est votre compagnon mobile pour la gestion facile de votre congélateur. Développé en React/Vite (PWA ready), il inclut une synchronisation dans le cloud via Supabase.

## ✨ Fonctionnalités Principales

- **Dashboard Intelligent** : Listez vos aliments par tiroir et identifiez-les par catégories colorées.
- **Scan de Code-barres** : Ajoutez de nouveaux produits automatiquement grâce à votre appareil photo.
- **Suivi des Dates de Péremption (DLC)** : 🆕 Activez les alertes automatiques pour savoir depuis combien de mois vos produits sont congelés. L'application affiche des indicateurs discrets (cloches jaunes / rouges) en fonction des limites configurées.
- **Espace Famille (Cloud)** : Entrez vos identifiants Supabase pour synchroniser en temps réel le congélateur entre tous les membres de la famille grâce au code de partage.
- **Customisable** : Mode clair/sombre, couleurs personnalisées et support multi-langues.

## 📱 Installation Mobile (APK)

Grâce à notre pipeline **GitHub Actions**, un fichier APK est automatiquement généré à chaque mise à jour.

1. Allez sur l'onglet **Actions** de ce dépôt.
2. Cliquez sur le dernier processus terminé avec succès nommé **"Build Android APK"**.
3. En bas de la page, dans la section **Artifacts**, téléchargez le fichier `MyFryz-Android-Debug`.
4. Transférez-le sur votre téléphone et installez-le (autorisez les sources inconnues si nécessaire).

## 🚀 Développement Local

```bash
npm install
npm run dev
```
