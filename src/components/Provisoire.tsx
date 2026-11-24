export function Provisoire({ show = true, children = "Contenu provisoire" }: { show?: boolean; children?: React.ReactNode }) {
  if (!show) return null;
  return <span className="provisoire" title="À remplacer par la direction depuis l'administration">{children}</span>;
}
