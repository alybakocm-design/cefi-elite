-- Les fonctions de déclencheur ne doivent pas être appelables via l'API.
-- Les fonctions d'autorisation (has_role, is_staff, ...) restent exécutables : la RLS en a besoin
-- et elles ne renvoient que des informations sur l'utilisateur appelant.
revoke execute on function public.audit_trigger() from public, anon, authenticated;
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.protect_profile_fields() from public, anon, authenticated;
revoke execute on function public.check_grade_max() from public, anon, authenticated;
revoke execute on function public.touch_updated_at() from public, anon, authenticated;
