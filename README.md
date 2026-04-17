# ❄️ MyFryz'

MyFryz' est une application mobile moderne et légère conçue pour simplifier la gestion de votre inventaire de congélateur. Basée sur les dernières technologies web (React 19, Vite 6), elle offre une expérience fluide, une synchronisation cloud en temps réel et une compatibilité mobile native via Capacitor.

## 🚀 Fonctionnalités Clés

- **📦 Gestion Multititroirs** : Organisez vos aliments par tiroirs personnalisables pour retrouver vos articles en un clin d'œil.
- **🏷️ Catégorisation Intelligente** : Des codes couleurs clairs (Viande, Poisson, Légumes, etc.) pour une lecture visuelle immédiate.
- **🔍 Scan de Code-barres** : Intégration de `html5-qrcode` pour ajouter des produits instantanément en scannant leur code-barres.
- **🛒 Liste de Courses Intégrée** : 
    - Génération automatique : Ajoutez un article à la liste lors de sa suppression du congélateur.
    - **Nouveau** : Ajout manuel d'articles directement dans la liste via une interface dédiée.
- **🔔 Gestion des Dates Limites** : Système d'alertes à deux niveaux (configurable en mois) pour ne plus jamais oublier un produit au fond du tiroir.
- **👨‍👩‍👧‍👦 Partage Familial (Cloud Sync)** : Synchronisation automatique entre plusieurs utilisateurs via **Supabase**. Partagez simplement votre code de groupe.
- **🌗 Personnalisation Totale** : Support du multi-langues (FR/EN) et plusieurs thèmes visuels (Ice, Emerald, Midnight).

## 🛠️ Stack Technique

- **Frontend** : [React 19](https://react.dev/) + [Vite 6](https://vitejs.dev/)
- **Mobile** : [Capacitor 8](https://capacitorjs.com/) (Native Android/iOS)
- **Base de données/Sync** : [Supabase](https://supabase.com/) (PostgreSQL + Real-time channels)
- **Animations** : [Framer Motion](https://www.framer.com/motion/)
- **Icônes** : [Lucide React](https://lucide.dev/)

## 📱 Utilisation Mobile (Android)

L'application est optimisée pour Android. Un nouveau fichier APK est généré automatiquement via GitHub Actions à chaque mise à jour.

1. Allez dans l'onglet **Actions** de ce dépôt.
2. Téléchargez l'artefact `MyFryz-Android-Debug` du build le plus récent.
3. Installez le fichier APK sur votre appareil (autorisez les sources inconnues).

## 💻 Installation & Développement Local

Pour lancer le projet en local sur votre machine :

```bash
# Installation des dépendances
npm install

# Lancement du serveur de développement
npm run dev
```

### Configuration Supabase (Optionnel)
Pour activer la synchronisation cloud, rendez-vous dans les paramètres (icône Menu → Cloud) et entrez vos propres identifiants Supabase (URL et Clé Anon).