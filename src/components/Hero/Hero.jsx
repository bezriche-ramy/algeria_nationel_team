import useFootballStore from '../../store/useFootballStore';
import { formatDateTime, formatMatchStatus, formatScore } from '../../utils/formatters';
import './Hero.css';

export default function Hero() {
  const heroImage = useFootballStore((state) => state.heroImage);
  const matchCenter = useFootballStore((state) => state.matchCenter);
  const loading = useFootballStore((state) => state.loading);

  const focusMatch = matchCenter.focusMatch;
  const nextMatch = matchCenter.upcoming?.[0] || null;
  const panelMatch = focusMatch || nextMatch;

  const heroStyle = heroImage?.url
    ? {
        '--hero-image': `url("${heroImage.url}")`,
      }
    : undefined;

  return (
    <section className="hero" id="hero" style={heroStyle}>
      <div className="hero__media" aria-hidden="true" />
      <div className="hero__veil" aria-hidden="true" />
      <div className="hero__texture" aria-hidden="true" />

      <div className="hero__content container">
        <p className="hero__kicker">Algeria National Team</p>
        <h1 className="hero__title">
          Real-Time Pulse of
          <span> Les Fennecs</span>
        </h1>
        <p className="hero__lead">
          Live match status, licensed photography, and verified updates tailored to the Algerian national team.
        </p>

        {panelMatch && (
          <div className="hero__panel">
            <div className="hero__panel-top">
              <span className={`hero__status ${panelMatch.status?.isLive ? 'hero__status--live' : ''}`}>
                {formatMatchStatus(panelMatch)}
              </span>
              <span className="hero__competition">{panelMatch.competition}</span>
            </div>

            <div className="hero__teams">
              <span>{panelMatch.teams?.home?.name}</span>
              <strong>{formatScore(panelMatch)}</strong>
              <span>{panelMatch.teams?.away?.name}</span>
            </div>

            <div className="hero__meta">
              <span>{formatDateTime(panelMatch.date)}</span>
              {panelMatch.venue && <span>{panelMatch.venue}</span>}
            </div>
          </div>
        )}

        <div className="hero__actions">
          <a href="#live" className="hero__button hero__button--primary">Open Match Center</a>
          <a href="#squad" className="hero__button hero__button--ghost">Browse Squad</a>
        </div>

        {heroImage?.sourceUrl && (
          <a
            className="hero__credit"
            href={heroImage.sourceUrl}
            target="_blank"
            rel="noreferrer noopener"
          >
            Photo: Wikimedia Commons
          </a>
        )}

        {!heroImage && !loading.visuals && (
          <p className="hero__fallback-note">Image source is loading or temporarily unavailable.</p>
        )}
      </div>
    </section>
  );
}
