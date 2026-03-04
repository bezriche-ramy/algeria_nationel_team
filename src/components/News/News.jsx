import useFootballStore from '../../store/useFootballStore';
import { formatRelativeNewsDate } from '../../utils/formatters';
import './News.css';

export default function News() {
  const news = useFootballStore((state) => state.news);
  const loadingNews = useFootballStore((state) => state.loading.news);
  const newsError = useFootballStore((state) => state.errors.news);

  return (
    <section className="news section" id="news">
      <div className="container">
        <span className="section-label">Verified Feed</span>
        <h2 className="section-title">Latest Coverage</h2>
        <p className="section-subtitle">
          Aggregated journalism focused on Algeria national team updates, fixtures, and squad developments.
        </p>

        {loadingNews && news.length === 0 && <p className="news__state">Loading latest headlines...</p>}
        {newsError && news.length === 0 && <p className="news__state">{newsError}</p>}

        <div className="news__grid">
          {news.map((article, index) => (
            <article key={article.id} className={`news__card ${index === 0 ? 'news__card--featured' : ''}`}>
              {article.image && (
                <div className="news__media">
                  <img src={article.image} alt={article.title} loading="lazy" />
                </div>
              )}

              <div className="news__body">
                <p className="news__meta">
                  <span>{article.source}</span>
                  <span>{formatRelativeNewsDate(article.publishedAt)}</span>
                </p>

                <h3>{article.title}</h3>

                {article.summary && <p>{article.summary}</p>}

                <a href={article.url} target="_blank" rel="noreferrer noopener">
                  Read Full Story
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
