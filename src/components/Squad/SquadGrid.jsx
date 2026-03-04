import { useMemo } from 'react';
import useFootballStore from '../../store/useFootballStore';
import './SquadGrid.css';

const POSITION_ORDER = ['Goalkeeper', 'Defender', 'Midfielder', 'Attacker'];
const POSITION_LABELS = {
  Goalkeeper: 'Goalkeepers',
  Defender: 'Defenders',
  Midfielder: 'Midfielders',
  Attacker: 'Attackers',
};

const formatUpdatedDate = (isoDate) => {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return isoDate;

  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
};

export default function SquadGrid() {
  const squad = useFootballStore((state) => state.squad);
  const coach = useFootballStore((state) => state.coach);
  const squadUpdatedAt = useFootballStore((state) => state.squadUpdatedAt);

  const groups = useMemo(() => {
    const map = new Map(POSITION_ORDER.map((position) => [position, []]));

    squad.forEach((player) => {
      if (!map.has(player.position)) {
        map.set(player.position, []);
      }

      map.get(player.position).push(player);
    });

    return map;
  }, [squad]);

  const handleImageError = (event) => {
    event.currentTarget.src = '/download.png';
    event.currentTarget.onerror = null;
  };

  return (
    <section className="squad section" id="squad">
      <div className="container">
        <span className="section-label">Current Squad</span>
        <h2 className="section-title">Selected Team List</h2>
        <p className="section-subtitle">
          Updated on {formatUpdatedDate(squadUpdatedAt)} with your provided coach and player selection.
        </p>

        {coach && (
          <article className="squad__coach">
            <div className="squad__coach-media">
              <img src={coach.image} alt={coach.name} loading="lazy" onError={handleImageError} />
            </div>

            <div className="squad__coach-body">
              <p className="squad__coach-label">Head Coach</p>
              <h3>{coach.name}</h3>
              <p>{coach.position}</p>
            </div>
          </article>
        )}

        {POSITION_ORDER.map((position) => {
          const players = groups.get(position) || [];
          if (players.length === 0) return null;

          return (
            <div key={position} className="squad__group">
              <h3>{POSITION_LABELS[position]}</h3>

              <div className="squad__grid">
                {players.map((player) => (
                  <article key={player.id} className="squad__card">
                    <div className="squad__media">
                      <img src={player.photo} alt={player.name} loading="lazy" onError={handleImageError} />
                    </div>

                    <div className="squad__body">
                      <p className="squad__name">{player.name}</p>
                      <p className="squad__meta">{player.position}</p>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
