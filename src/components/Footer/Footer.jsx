import { getDataSourceLabel } from '../../api/footballApi';
import useFootballStore from '../../store/useFootballStore';
import './Footer.css';

export default function Footer() {
  const source = useFootballStore((state) => state.matchCenter.source);

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__top">
          <div>
            <h3>Les Fennecs Digital Hub</h3>
            <p>Live match intelligence, current squad imagery, and verified media coverage.</p>
          </div>

          <nav className="footer__links" aria-label="Footer links">
            <a href="#hero">Home</a>
            <a href="#live">Match Center</a>
            <a href="#news">News</a>
            <a href="#history">Legacy</a>
            <a href="#squad">Squad</a>
          </nav>
        </div>

        <div className="footer__bottom">
          <p>Data: {getDataSourceLabel(source)} / NewsAPI / GDELT / Wikimedia Commons</p>
          <p>Fan-made project, not affiliated with FAF.</p>
        </div>
      </div>
    </footer>
  );
}
