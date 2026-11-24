-- Contenus provisoires. Tout ce qui est fictif porte is_demo = true ou is_placeholder = true.
insert into public.settings (key, label, value, is_placeholder) values
 ('site.name', 'Nom', '"CEFI-ELITE"', false),
 ('site.full_name', 'Dénomination complète', '"Centre d''Études et de Formations Islamiques ÉLITE"', false),
 ('site.tagline', 'Accroche', '"Former avec rigueur, transmettre avec sincérité."', true),
 ('site.intro', 'Présentation courte', '"Texte de présentation à rédiger par la direction : qui est CEFI-ELITE, ce que le centre enseigne et pour qui."', true),
 ('contact.phone', 'Téléphone', '"À renseigner"', true),
 ('contact.whatsapp', 'WhatsApp', '"À renseigner"', true),
 ('contact.email', 'E-mail', '"À renseigner"', true),
 ('contact.address', 'Adresse', '"Bamako, Mali — adresse précise à renseigner"', true),
 ('contact.hours', 'Horaires d''accueil', '"À renseigner"', true),
 ('about.mission', 'Mission', '"Texte de la mission à rédiger par la direction."', true),
 ('about.vision', 'Vision', '"Texte de la vision à rédiger par la direction."', true),
 ('about.values', 'Valeurs', '["Valeur 1 à définir","Valeur 2 à définir","Valeur 3 à définir"]', true),
 ('about.pedagogy', 'Pédagogie', '"Description de la méthode pédagogique à rédiger."', true),
 ('social.facebook', 'Facebook', '""', true),
 ('social.youtube', 'YouTube', '""', true),
 ('social.tiktok', 'TikTok', '""', true)
on conflict (key) do nothing;

insert into public.categories (name, slug, sort_order) values
 ('Coran et sciences coraniques','coran',1),('Hadith et sciences du hadith','hadith',2),('Fiqh','fiqh',3),
 ('Aqida','aqida',4),('Langue arabe','langue-arabe',5),('Sira','sira',6),('Histoire islamique','histoire',7),
 ('Éducation et comportement','education',8),('Autres disciplines','autres',9)
on conflict do nothing;

insert into public.trainers (full_name, bio, specialties, is_public, is_demo, profile_id)
select 'Formateur de démonstration', 'Profil fictif servant à tester la plateforme. À remplacer par les vrais enseignants.', array['Langue arabe'], true, true,
       (select id from public.profiles where email = 'demo.formateur@cefi-elite.test');

insert into public.programs (slug, title, category_id, modality, level, short_description, description, objectives, prerequisites, duration_label, is_published, is_featured, is_demo)
select v.slug, v.title, c.id, v.modality::public.modality, v.level, v.short, 'Fiche de démonstration : le programme réel sera saisi par l''administration.',
       'Objectifs à définir.', 'Prérequis à définir.', 'Durée à définir', true, true, true
from (values
 ('exemple-langue-arabe-1','Exemple — Langue arabe, niveau 1','langue-arabe','presentiel','Débutant','Formation fictive pour tester le catalogue et les inscriptions.'),
 ('exemple-fiqh-adorations','Exemple — Fiqh des adorations','fiqh','presentiel','Intermédiaire','Formation fictive pour tester le catalogue et les inscriptions.'),
 ('exemple-tajwid-en-ligne','Exemple — Tajwid en ligne','coran','video','Tous niveaux','Formation vidéo fictive (l''académie arrive en V2).')
) v(slug, title, cat, modality, level, short)
join public.categories c on c.slug = v.cat;

insert into public.subjects (program_id, name, coefficient, sort_order)
select id, s.name, s.coef, s.ord from public.programs, (values ('Lecture',2,1),('Grammaire',2,2),('Expression orale',1,3)) s(name, coef, ord)
where slug = 'exemple-langue-arabe-1';

insert into public.program_sessions (program_id, label, schedule_text, trainer_id)
select p.id, 'Session de démonstration', 'Horaires à définir', t.id
from public.programs p, public.trainers t where p.slug = 'exemple-langue-arabe-1' and t.is_demo;

insert into public.classes (session_id, name, trainer_id)
select s.id, 'Groupe A (démo)', s.trainer_id from public.program_sessions s where s.label = 'Session de démonstration';

insert into public.learners (first_name, last_name, sex, phone, email, is_demo, profile_id)
values ('Apprenant', 'Démonstration', 'M', '+223 00 00 00 00', 'demo.apprenant@cefi-elite.test', true,
        (select id from public.profiles where email = 'demo.apprenant@cefi-elite.test'));

insert into public.enrollments (learner_id, program_id, session_id, class_id, source)
select l.id, p.id, s.id, c.id, 'guichet'
from public.learners l, public.programs p, public.program_sessions s, public.classes c
where l.is_demo and p.slug = 'exemple-langue-arabe-1' and s.program_id = p.id and c.session_id = s.id;

insert into public.faqs (question, answer, sort_order, is_demo) values
 ('Comment s''inscrire ?', 'Remplissez le formulaire d''inscription en ligne ; le secrétariat vous recontacte pour finaliser le dossier. (Réponse provisoire à valider.)', 1, true),
 ('Puis-je suivre une formation à distance ?', 'Oui : l''académie en ligne et les formations accompagnées à distance ouvriront progressivement. (Réponse provisoire à valider.)', 2, true);
