# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## 📱 Installation Mobile (APK)

Grâce à notre pipeline **GitHub Actions**, un fichier APK est automatiquement généré à chaque mise à jour.

1. Allez sur l'onglet **Actions** de ce dépôt.
2. Cliquez sur le dernier processus terminé avec succès nommé **"Build Android APK"**.
3. En bas de la page, dans la section **Artifacts**, téléchargez le fichier `MyFryz-Android-Debug`.
4. Transférez-le sur votre téléphone et installez-le (autorisez les sources inconnues si nécessaire).

---

## 🚀 Installation & Développement

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
