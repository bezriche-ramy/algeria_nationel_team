import { getDataSourceLabel } from '../../api/footballApi';
import useFootballStore from '../../store/useFootballStore';
import { formatDateOnly, formatDateTime, formatMatchStatus, formatScore, getResultCode } from '../../utils/formatters';
import './LiveMatch.css';

export default function LiveMatch() {
  const matchCenter = useFootballStore((state) => state.matchCenter);
  const loadingMatches = useFootballStore((state) => state.loading.matches);
  const matchError = useFootballStore((state) => state.errors.matches);

  const focusMatch = matchCenter.focusMatch;
  const recentMatches = matchCenter.recent || [];

  return (
    <section className="live section" id="live">
      <div className="container">
        <div className="live__heading">
          <div>
            <span className="section-label">Match Center</span>
            <h2 className="section-title">Live Tracker</h2>
            <p className="section-subtitle">
              Current match pulse, result timeline, and quick context for the latest Algeria fixtures.
            </p>
          </div>
          <span className="live__source">Source: {getDataSourceLabel(matchCenter.source)}</span>
        </div>

        <div className="live__layout">
          <article className="live__feature">
            {focusMatch ? (
              <>
                <header className="live__feature-header">
                  <span className={`live__state ${focusMatch.status?.isLive ? 'live__state--live' : ''}`}>
                    {formatMatchStatus(focusMatch)}
                  </span>
                  <span className="live__competition">{focusMatch.competition}</span>
                </header>

                <div className="live__fixture">
                  <span>{focusMatch.teams?.home?.name}</span>
                  <strong>{formatScore(focusMatch)}</strong>
                  <span>{focusMatch.teams?.away?.name}</span>
                </div>

                <p className="live__detail">{formatDateTime(focusMatch.date)}</p>
                {focusMatch.venue && <p className="live__detail">{focusMatch.venue}</p>}

                <div className="live__events">
                  <h3>Key Events</h3>
                  {focusMatch.events?.length ? (
                    <ul>
                      {focusMatch.events.map((event) => (
                        <li key={event.id}>
                          <span>{event.minute ? `${event.minute}'` : '--'}</span>
                          <div>
                            <strong>{event.type}</strong>
                            <p>{[event.player, event.detail].filter(Boolean).join(' - ')}</p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="live__empty">No published event timeline for this fixture yet.</p>
                  )}
                </div>
              </>
            ) : (
              <p className="live__empty">No current match information is available.</p>
            )}
          </article>

          <aside className="live__recent">
            <h3>Recent Results</h3>

            {loadingMatches && recentMatches.length === 0 && (
              <p className="live__empty">Loading latest fixtures...</p>
            )}

            {matchError && recentMatches.length === 0 && (
              <p className="live__empty">{matchError}</p>
            )}

            <div className="live__recent-list">
              {recentMatches.map((match) => {
                const result = getResultCode(match);
                return (
                  <article key={match.id} className="live__recent-item">
                    <div>
                      <p className="live__recent-teams">
                        {match.teams?.home?.name} vs {match.teams?.away?.name}
                      </p>
                      <p className="live__recent-date">{formatDateOnly(match.date)}</p>
                    </div>

                    <div className="live__recent-meta">
                      <span className="live__recent-score">{formatScore(match)}</span>
                      {result && <span className={`live__badge live__badge--${result.toLowerCase()}`}>{result}</span>}
                    </div>
                  </article>
                );
              })}
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
