const FILTERS = [
  { id: 'under-20', label: 'Under 20 min' },
  { id: 'high-protein', label: 'High protein' },
  { id: 'budget', label: 'Budget-friendly' },
  { id: 'easy', label: 'Easy' },
  { id: 'uses-spinach', label: 'Uses spinach' },
  { id: 'uses-salmon', label: 'Uses salmon' },
  { id: 'vegetarian', label: 'Vegetarian' },
];

export function RecipeFilters({ active, onToggle }: { active: string[]; onToggle: (id: string) => void }) {
  return (
    <div className="rf-chips" role="group" aria-label="Recipe filters">
      {FILTERS.map((filter) => (
        <button
          key={filter.id}
          type="button"
          className={`rf-chip ${active.includes(filter.id) ? 'on' : ''}`}
          aria-pressed={active.includes(filter.id)}
          onClick={() => onToggle(filter.id)}
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
}

export function GoalSelector({ value, onChange }: { value: string; onChange: (goal: 'budget' | 'protein' | 'quick' | 'sustainable') => void }) {
  const goals = [
    ['budget', 'Budget'],
    ['protein', 'Protein'],
    ['quick', 'Quick'],
    ['sustainable', 'Sustainable'],
  ] as const;
  return (
    <div className="rf-goals" role="radiogroup" aria-label="Ranking goal">
      {goals.map(([id, label]) => (
        <button key={id} type="button" className={`rf-chip ${value === id ? 'on' : ''}`} aria-pressed={value === id} onClick={() => onChange(id)}>
          {label}
        </button>
      ))}
    </div>
  );
}

export function RecipeSearch({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <label className="rf-search">
      <span className="visually-hidden">Search recipes</span>
      <input value={value} onChange={(event) => onChange(event.target.value)} placeholder="Search recipes, ingredients, or tags" />
    </label>
  );
}
