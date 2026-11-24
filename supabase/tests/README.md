# Tests des règles d'accès (RLS)

Les tests simulent chaque rôle dans une transaction annulée (aucune donnée conservée).
Dernière exécution : 24/11/2026 — 25 contrôles sur 25 réussis :
anonyme (aucune donnée privée, dépôt de candidature possible, aucun paiement),
apprenant (son seul dossier, pas d'auto-attribution de rôle), formateur (sa classe, appel),
secrétariat (confirmation d'une candidature → dossier apprenant), comptable (encaissement guichet
numéroté, paiement en ligne et modification refusés, solde recalculé), direction (journal, lecture seule).
