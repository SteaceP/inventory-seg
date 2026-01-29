# Guide de Développement Local Supabase

Ce projet utilise l'interface en ligne de commande (CLI) de Supabase pour gérer le développement local, les migrations de base de données et la génération de types TypeScript.

## Prérequis

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) ou Docker Engine doit être installé et en cours d'exécution.

## Configuration Initiale

Avant de commencer pour la première fois, vous devez lier votre environnement local au projet Supabase distant :

```bash
supabase link --project-ref <votre-id-de-projet>
```

> [!NOTE]
> Vous pouvez trouver votre ID de projet dans le [Tableau de bord Supabase](https://supabase.com/dashboard) sous **Settings > General**.

## Commandes Courantes

| Commande | Script | Description |
| :--- | :--- | :--- |
| `pnpm run supabase:start` | `supabase start` | Démarre tous les services Supabase locaux via Docker. |
| `pnpm run supabase:stop` | `supabase stop` | Arrête tous les services Supabase locaux. |
| `pnpm run supabase:gen-types` | `supabase gen types...` | Génère les types TypeScript pour votre schéma de base de données. |
| `supabase db diff` | - | Génère un nouveau fichier de migration basé sur les changements locaux. |
| `supabase db reset` | - | Réinitialise la base de données locale à l'état actuel des migrations. |

## Flux de travail : Mise à jour des types

Après avoir apporté des modifications à votre schéma de base de données (ex: via des migrations), vous devez régénérer les types TypeScript :

1. Assurez-vous que Supabase est en cours d'exécution : `pnpm run supabase:start`
2. Lancez la génération de types : `pnpm run supabase:gen-types`
3. Les types seront mis à jour dans `src/types/database.types.ts`.

## Architecture Realtime

Ce projet utilise une architecture **Broadcast-uniquement** pour la synchronisation en temps réel.

- **Publication legacy `supabase_realtime`** : Entièrement supprimée pour éliminer la charge de décodage WAL et le polling des métadonnées.
- **Méthode** : Tous les composants utilisent `supabase.channel().send()` et `.on('broadcast')` pour les mises à jour en temps réel.
- **Fonctions de base de données** : La fonction `public.handle_broadcast_activity` est utilisée par les déclencheurs (triggers) de la base de données pour diffuser manuellement les changements via `realtime.broadcast_changes`.

> [!IMPORTANT]
> Lors de l'ajout de nouvelles tables nécessitant des mises à jour en temps réel, ne les ajoutez PAS à une publication. À la place, ajoutez un déclencheur pour appeler `handle_broadcast_activity` lors d'un changement.
