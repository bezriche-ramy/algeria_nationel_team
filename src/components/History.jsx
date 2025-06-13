import React, { useState, useEffect, useRef } from 'react';
import Trophy3D from './Trophy3D';
import './History.css';

const History = () => {
  const [visibleTrophies, setVisibleTrophies] = useState({});
  const timelineRefs = useRef({});

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const year = entry.target.dataset.year;
          if (entry.isIntersecting && (year === '1990' || year === '2019')) {
            setVisibleTrophies(prev => ({ ...prev, [year]: true }));
          }
        });
      },
      { threshold: 0.3 }
    );

    Object.values(timelineRefs.current).forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, []);

  const events = [
    {
      year: 1958,
      title: "FLN Team Formed",
      description: "Rebel team in exile during independence struggle",
      image: "https://assets.rbl.ms/10400527/origin.jpg"
    },
    {
      year: 1964,
      title: "FIFA Membership & First FIFA Match",
      description: "Algeria joins FIFA and plays its first official international match",
      image: "https://i.ytimg.com/vi/0_D4kK1r9Zo/sddefault.jpg"
    },
    {
      year: 1982,
      title: "World Cup Debut & Upset vs West Germany",
      description: "Historic win against West Germany in first World Cup appearance",
      image: "https://i.ytimg.com/vi/fmYatA1Dtxo/hq720.jpg?sqp=-oaymwEhCK4FEIIDSFryq4qpAxMIARUAAAAAGAElAADIQj0AgKJD&rs=AOn4CLA-w14CVUWiS0KuACzKVr_BJWxT9g"
    },
    {
      year: 1982,
      title: '"Shame of Gijón" Controversy',
      description: "Controversial match between West Germany and Austria eliminates Algeria",
      image: "https://img.theweek.in/content/dam/week/news/sports/images/2018/6/26/west-germany-austria-gijon-algeria-ap.jpg"
    },
    {
      year: 1990,
      title: "AFCON Champions (Host)",
      description: "First African Cup of Nations title as host nation",
      image: "https://www.lequipe.fr/_medias/img-photo-jpg/cherif-oudjani-a-gauche-avec-moussa-saib-et-djamel-menad-champions-d-afrique-1990-m-deschamps-l-equipe/1500000001590501/235:2,1548:1315-828-828-75/58d3a"
    },
    {
      year: 2014,
      title: "Scored 4 Goals in One World Cup Match",
      description: "Historic 4-2 victory over South Korea in World Cup",
      image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSkk6-XgnqjsZMIA3tdSPr9E-vWSngxVaDpPw&s"
    },
    {
      year: 2019,
      title: "AFCON Champions",
      description: "Second African Cup of Nations title",
      image: "https://static.standard.co.uk/s3fs-public/thumbnails/image/2019/07/19/23/afconfinal1907-42.jpg?width=1200"
    }
  ];

  return (
    <section id="history" className="history">
      <div className="container">
        <h1>Our History</h1>
        <div className="timeline">
          {events.map((event, index) => (
            <div 
              key={index} 
              className={`timeline-item ${index % 2 === 0 ? 'left' : 'right'} ${
                (event.year === 1990 || event.year === 2019) ? 'afcon-victory' : ''
              }`}
              ref={el => timelineRefs.current[event.year] = el}
              data-year={event.year}
            >
              <div className="timeline-content">
                <div className="timeline-img">
                  <img src={event.image} alt={event.title} />
                </div>
                <div className="timeline-text">
                  <h3>{event.year}</h3>
                  <h4>{event.title}</h4>
                  <p>{event.description}</p>
                </div>
                {(event.year === 1990 || event.year === 2019) && (
                  <div className="trophy-container">
                    <Trophy3D 
                      isVisible={visibleTrophies[event.year] || false}
                      height="250px"
                    />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default History;