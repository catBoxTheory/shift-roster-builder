const setupCards = [
  {
    title: "Employees",
    description: "Add team members and their roles in Phase 4."
  },
  {
    title: "Weekly Roster",
    description: "Assign shifts across Monday to Sunday in Phase 5."
  },
  {
    title: "Summary",
    description: "Review hours and conflicts in Phase 6."
  }
];

export default function App() {
  return (
    <main className="app-shell">
      <section className="hero" aria-labelledby="app-title">
        <div>
          <p className="stage-label">Optix Stage 2 Assessment</p>
          <h1 id="app-title">Shift Roster Builder</h1>
          <p className="hero-copy">
            Phase 1 scaffold is running. The next phases will add employees,
            weekly shift assignments, conflict detection, and hour summaries.
          </p>
        </div>
        <div className="status-card" aria-label="Project status">
          <span className="status-dot" aria-hidden="true" />
          <span>Project setup complete</span>
        </div>
      </section>

      <section className="workspace-preview" aria-label="Roster workspace">
        {setupCards.map((card) => (
          <article className="preview-panel" key={card.title}>
            <h2>{card.title}</h2>
            <p>{card.description}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
