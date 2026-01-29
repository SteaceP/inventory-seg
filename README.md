# SEG Inventaire

Une application de gestion d'inventaire pour La Société Emmanuel-Grégoire, entièrement indépendante de l'intranet/extranet principal, construite avec un stack technologique moderne, conçue pour l'efficacité, la clarté et la synchronisation en temps réel.

## ✨ Caractéristiques

- **📊 Tableau de bord** : Aperçu général des articles totaux, des catégories principales et des alertes de stock faible.
- **📦 Suivi d'inventaire** :
  - Vue en grille catégorisée avec sections repliables.
  - Seuils de stock faible au niveau de l'article, de la catégorie et global (**Logique hiérarchique : Article > Catégorie > Global**).
  - Génération de SKU/codes-barres et prise en charge de la numérisation.
  - Prise en charge des images pour un suivi visuel.
  - **Gestion des emplacements** : Organisation hiérarchique des stocks par entrepôts, étagères, etc.
- **🔧 Suivi des appareils** :
  - Gérer les appareils ménagers (Marque, Modèle, Numéro de série).
  - Suivi de l'historique des réparations avec les coûts et les informations sur les prestataires de services.
- **📊 Rapports et analyses** :
  - Rapports mensuels et annuels sur l'utilisation des stocks.
  - Exportation au format PDF/Impression pour les inventaires physiques.
- **⚡ Mises à jour en temps réel** : Synchronisation instantanée entre les appareils via Supabase Realtime.
- **🌍 Support multilingue** : Support complet pour l'anglais, le français et l'arabe.
- **🎨 Personnalisation** :
  - Modes sombre et clair.
  - Vue compacte pour l'affichage d'informations à haute densité.
  - Personnalisation du profil utilisateur (Nom d'affichage, Avatar).
- **🤖 Réapprovisionnement automatique par IA** :
  - Analyse quotidienne des stocks et de l'historique de commandes via Cloudflare AI (Llama 3).
  - Regroupement intelligent par fournisseur (BOD, Papeterie, etc.).
  - Notifications push proactives lorsque le volume de commande est optimal.

## 🛠️ Stack technologique

- **Frontend** : [React 19](https://react.dev/), [Vite](https://vitejs.dev/), [TypeScript](https://www.typescriptlang.org/)
- **UI & Bibliothèque de composants** : [Material UI (MUI)](https://mui.com/), [Framer Motion](https://www.framer.com/motion/)
- **Backend & Base de données** : [Supabase](https://supabase.com/) (PostgreSQL, Auth, Storage, Realtime), [Cloudflare Workers AI](https://developers.cloudflare.com/workers-ai/)
- **Gestion d'état** : React Context API
- **Internationalisation** : Implémentation i18n personnalisée

## 🚀 Pour commencer

### Prérequis

- [Node.js](https://nodejs.org/) (v24 ou ultérieur recommandé)
- [pnpm](https://pnpm.io/)
- Un compte et un projet [Supabase](https://supabase.com/).

### Instructions d'installation

1. Cloner le repo :

   ```bash
   git clone https://github.com/steace/inventory-seg.git
   cd inventory-seg
   ```

2. Installer les dépendances :

   ```bash
   pnpm install
   ```

3. Configurer les variables d'environnement :

   **Important** : Ne jamais commettre de secrets réels dans le contrôle de version !

   Créer un fichier `.env.local` dans le répertoire racine (ce fichier est ignoré par git) :

   ```bash
   cp .env.example .env.local
   ```

   Ensuite, éditez `.env.local` avec vos propres identifiants Supabase :

   ```env
   VITE_SUPABASE_URL=https://votre-projet.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=votre_cle_publique_supabase_ici
   VITE_VAPID_PUBLIC_KEY=votre_cle_publique_vapid_ici
   VITE_VAPID_PRIVATE_KEY=votre_cle_privee_vapid_ici
   ```

   **NE JAMAIS** utiliser `VITE_SUPABASE_SECRET_KEY` dans le code côté client !

4. Migrations de la base de données :
   Appliquez les migrations situées dans le dossier `supabase/migrations` à votre projet Supabase.

5. Exécuter localement :

   ```bash
   pnpm run dev
   ```

## 🚀 Déploiement

### Cloudflare Pages + Workers

Cette application est conçue pour être déployée sur Cloudflare Pages avec un Cloudflare Worker pour l'API backend.

1. **Construire l'application :**

   ```bash
   pnpm run build
   ```

2. **Définir les secrets du Cloudflare Worker** (NE JAMAIS les commettre dans le contrôle de version) :

   ```bash
   pnpm dlx wrangler secret put SUPABASE_SECRET_KEY
   pnpm dlx wrangler secret put VAPID_PRIVATE_KEY
   pnpm dlx wrangler secret put BREVO_API_KEY
   ```

3. **Déployer le Worker :**

   ```bash
   pnpm dlx wrangler deploy
   ```

4. **Déployer sur Cloudflare Pages :**
   - Connectez votre repo GitHub à Cloudflare Pages
   - Définissez la commande de construction : `pnpm run build`
   - Définissez le répertoire de sortie : `dist`
   - Ajoutez les variables d'environnement (variables VITE_* uniquement)

### Liste de contrôle de sécurité avant le déploiement

- ✅ Tous les secrets sont dans `.env.local` (jamais `.env`)
- ✅ `.env.local` est dans `.gitignore`
- ✅ Utilisation de `VITE_SUPABASE_PUBLISHABLE_KEY` dans le client (pas la clé secrète)
- ✅ Secrets du Cloudflare Worker définis via CLI
- ✅ En-têtes CSP configurés
- ✅ Politiques RLS de Supabase activées sur toutes les tables
- ✅ Tester les flux d'authentification
- ✅ Vérifier que les notifications push fonctionnent
- ✅ Vérifier la fonctionnalité hors ligne de la PWA

## 🔒 Sécurité

Cette application suit les meilleures pratiques de sécurité :

- **Sécurité au niveau des lignes (RLS)** : Toutes les tables de la base de données ont des politiques RLS activées
- **Authentification** : Supabase Auth avec gestion sécurisée des sessions
- **Validation des entrées** : Validation côté serveur sur tous les points de terminaison de l'API
- **En-têtes CSP** : Content Security Policy pour prévenir les attaques XSS
- **Gestion des secrets** : Les variables d'environnement ne sont jamais commises dans le contrôle de version
- **Prévention de l'injection SQL** : Requêtes paramétrées via le client Supabase
- **HTTPS uniquement** : La PWA nécessite HTTPS pour les service workers

Pour les problèmes de sécurité, voir [`SECURITY.md`](./SECURITY.md).

## 📜 Schéma de la base de données

Les tables principales incluent :

- `inventory` : Suit les articles en stock et leurs seuils.
- `inventory_categories` : Gère les seuils spécifiques aux catégories.
- `inventory_activity` : Journal d'audit pour tous les changements.
- `appliances` & `repairs` : Gère le matériel domestique et l'historique de maintenance.
- `user_settings` : Préférences utilisateur et données de profil.

## 🤝 Contribution

Il s'agit d'un projet personnel, mais les suggestions et améliorations sont les bienvenues ! N'hésitez pas à ouvrir une issue ou à soumettre une pull request.

## 📄 Licence

Ce projet est privé et destiné à un usage personnel. Voir le fichier [`LICENSE`](./LICENSE) pour plus de détails.
