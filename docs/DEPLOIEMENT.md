# Mettre le site en ligne (Netlify)

La base de données est déjà en ligne sur Supabase. Il reste à publier l'application (racine du dépôt).

## Option A — via GitHub (recommandée, mises à jour automatiques)
1. Créer un dépôt GitHub privé et y pousser ce code.
2. Sur app.netlify.com : **Add new project → Import an existing project → GitHub**, choisir le dépôt.
3. Netlify détecte Next.js. Commande `npm run build`. Les clés publiques sont déjà dans `netlify.toml`.
4. **Deploy**. Le site est en ligne en 2 à 3 minutes.

## Option B — Netlify CLI depuis un ordinateur
```
cd cefi-elite
npm install
npx netlify-cli login
npx netlify-cli deploy --build --prod
```

## Après la mise en ligne
1. Supabase → Authentication → URL Configuration : mettre l'adresse du site dans **Site URL** et ajouter `https://<site>/reinitialiser` aux **Redirect URLs** (lien « mot de passe oublié »).
2. Brancher le nom de domaine (Netlify → Domain management) quand il sera choisi.
3. Configurer un service d'e-mail (Brevo ou Resend) dans Supabase → Auth → SMTP : le service intégré est limité à quelques e-mails par heure.
4. Renseigner les vrais contenus dans **Mon espace → Contenus du site** et remplacer les formations de démonstration.

## Avant l'ouverture au public : purger la démonstration
Dans Supabase → SQL Editor :
```sql
delete from public.enrollments where learner_id in (select id from public.learners where is_demo);
delete from public.learners where is_demo;
delete from public.programs where is_demo;   -- supprime aussi sessions, classes, matières
delete from public.trainers where is_demo;
delete from public.faqs where is_demo;
delete from auth.users where email like 'demo.%@cefi-elite.test';
```
Puis créer le vrai compte super administrateur : s'inscrire avec son e-mail, puis
```sql
insert into public.user_roles (user_id, role)
select id, 'super_admin' from public.profiles where email = 'VOTRE_EMAIL';
```

## Sauvegarde et restauration
- Supabase (offre gratuite) : pas de sauvegarde automatique téléchargeable ; passer à l'offre Pro en production (sauvegardes quotidiennes, restauration en un clic).
- En attendant : export hebdomadaire `pg_dump` (Supabase → Database → connection string) et stockage hors plateforme.
- Restauration : `psql <connection_string> < sauvegarde.sql` sur un projet vierge, puis vérifier avec les comptes de démonstration.
