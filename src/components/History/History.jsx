import useFootballStore from '../../store/useFootballStore';
import './History.css';

export default function History() {
  const historyGallery = useFootballStore((state) => state.historyGallery);
  const loadingVisuals = useFootballStore((state) => state.loading.visuals);
  const visualError = useFootballStore((state) => state.errors.visuals);

  return (
    <section className="history section" id="history">
      <div className="container">
        <span className="section-label">Historical Frame</span>
        <h2 className="section-title">Legacy in Real Moments</h2>
        <p className="section-subtitle">
          A parallax-inspired archive of licensed photography connected to major milestones in Algeria's football history.
        </p>

        {loadingVisuals && historyGallery.length === 0 && <p className="history__state">Loading historical imagery...</p>}
        {visualError && historyGallery.length === 0 && <p className="history__state">{visualError}</p>}

        <div className="history__grid">
          {historyGallery.map((item, index) => (
            <article key={item.id} className="history__card" style={{ '--stagger': `${index * 80}ms` }}>
              <div className="history__media">
                <img src={item.image} alt={`${item.year} - ${item.title}`} loading="lazy" />
              </div>

              <div className="history__body">
                <p className="history__year">{item.year}</p>
                <h3>{item.title}</h3>
                <p>{item.description}</p>

                {item.sourceUrl && (
                  <a href={item.sourceUrl} target="_blank" rel="noreferrer noopener">
                    Photo Source
                  </a>
                )}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
