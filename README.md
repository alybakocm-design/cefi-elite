# CEFI-ÉLITE — Plateforme (Version 1 · socle opérationnel)

Application web Next.js 15 + Supabase (PostgreSQL, Auth, Storage), prévue pour Netlify.

## Contenu
- Racine : l'application Next.js (site public + espaces privés).
- `supabase/migrations/` : schéma de la base, règles d'accès (RLS), stockage — déjà appliqué sur le projet Supabase `cefi-elite` (ref `ndnuzlekmgbzzkrkwqbq`, région Paris).
- `supabase/seed_*.sql` : contenus provisoires et comptes de démonstration (déjà chargés).
- `docs/` : déploiement et utilisation. Les identifiants de démonstration ne sont pas dans le dépôt.

## Ce qui fonctionne (V1)
**Site public** : accueil, le centre (présentation, mission, vision, valeurs, pédagogie), catalogue filtrable,
fiche formation (sessions, matières, tarifs), académie en ligne (vitrine, achat en V2), formateurs, actualités,
FAQ, contact (enregistré en base), inscription en ligne avec dépôt de documents → numéro de dossier.
SEO : titres, descriptions, sitemap, robots, Open Graph. PWA installable (manifeste + icônes).

**Espaces privés** (menu selon le rôle) :
- Tableau de bord direction : effectifs, candidatures, présence, recettes, dépenses, impayés, top formations — chiffres réels calculés en base, données de démo exclues.
- Candidatures : 7 statuts, notes internes, documents (liens signés 10 min), confirmation → dossier apprenant + inscription.
- Apprenants : recherche, fiche complète, inscriptions, soldes, paiements, assiduité, export CSV (Excel).
- Formations : création/édition sans code, sessions, classes, matières/coefficients, publication.
- Paiements : encaissement guichet (espèces, Orange/Moov Money, carte, virement), reçu numéroté imprimable/PDF, remboursement tracé (jamais de modification).
- Messages du formulaire de contact. Contenus du site (coordonnées, textes) éditables, badge « provisoire » automatique.
- Formateur : ses classes, appel (présent/retard/absent/excusé). Apprenant : formations, soldes, notes publiées, reçus.

**Sécurité** : permissions appliquées dans la base (RLS) pour 8 rôles, journal des actions sensibles,
historique de connexion, paiements en ligne impossibles à saisir à la main, clé secrète jamais côté navigateur.

## Pas encore dans la V1 (prévu)
Saisie des notes et bulletins PDF par le formateur (tables prêtes), échéanciers à l'écran, dépenses à l'écran,
publication d'actualités depuis l'interface, gestion des comptes utilisateurs depuis l'interface
(aujourd'hui : via Supabase), puis V2 (académie, paiement en ligne, certificats QR) et V3.
