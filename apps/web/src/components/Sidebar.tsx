type MenuItem = {
  key: string;
  label: string;
  enabled?: boolean;
};

type Props = {
  currentKey: string;
  items: MenuItem[];
  onSelect: (key: string) => void;
};

export function Sidebar({ currentKey, items, onSelect }: Props) {
  return (
    <aside className="sidebar">
      <h2 className="sidebar-title">CRM Clube04</h2>
      <nav>
        {items.map((item) => (
          <button
            type="button"
            key={item.key}
            className={`sidebar-link${currentKey === item.key ? " active" : ""}`}
            onClick={() => item.enabled !== false && onSelect(item.key)}
            disabled={item.enabled === false}
          >
            {item.label}
          </button>
        ))}
      </nav>
    </aside>
  );
}
