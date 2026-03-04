import { useEffect, useState } from 'react';
import './Header.css';

const NAV_ITEMS = [
  { label: 'Home', href: '#hero' },
  { label: 'Match Center', href: '#live' },
  { label: 'News', href: '#news' },
  { label: 'Legacy', href: '#history' },
  { label: 'Squad', href: '#squad' },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleNav = (event, href) => {
    event.preventDefault();
    setMenuOpen(false);

    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className={`header ${scrolled ? 'header--scrolled' : ''}`}>
      <div className="header__inner container">
        <a href="#hero" className="header__brand" onClick={(event) => handleNav(event, '#hero')}>
          <span className="header__crest" aria-hidden="true">FAF</span>
          <span>
            <span className="header__title">Les Fennecs</span>
            <span className="header__subtitle">Algeria National Team</span>
          </span>
        </a>

        <nav
          className={`header__nav ${menuOpen ? 'header__nav--open' : ''}`}
          id="primary-navigation"
          aria-label="Primary navigation"
        >
          {NAV_ITEMS.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="header__link"
              onClick={(event) => handleNav(event, item.href)}
            >
              {item.label}
            </a>
          ))}
        </nav>

        <button
          className={`header__burger ${menuOpen ? 'header__burger--open' : ''}`}
          onClick={() => setMenuOpen((currentValue) => !currentValue)}
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
          aria-controls="primary-navigation"
        >
          <span />
          <span />
          <span />
        </button>
      </div>
    </header>
  );
}
