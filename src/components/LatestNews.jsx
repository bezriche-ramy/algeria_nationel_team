import React from 'react';
import './LatestNews.css';

const LatestNews = () => {
  const newsArticles = [
    {
      id: 1,
      title: "Algeria Drawn in Group E for AFCON 2025",
      summary: "The Desert Foxes will face Burkina Faso, Equatorial Guinea, and Sudan in the group stage of the 2025 Africa Cup of Nations in Morocco.",
      image: "https://www.cafonline.com/media/unelihh4/algeria-b24knfr0002.jpg",
      date: "2024-12-15",
      category: "Tournament"
    },
    {
      id: 2,
      title: "Riyad Mahrez Leads Algeria Squad Preparation",
      summary: "Captain Riyad Mahrez emphasizes team unity and preparation as Algeria gears up for the upcoming AFCON tournament.",
      image: "https://www.cafonline.com/media/x5xhke3m/riyad-mahrez-of-algeria.jpg",
      date: "2024-12-10",
      category: "Squad News"
    },
    {
      id: 3,
      title: "Algeria Maintains Strong FIFA Ranking Position",
      summary: "The national team continues to hold its position among Africa's top-ranked teams ahead of the continental championship.",
      image: "https://i.redd.it/7mlxer5ufy6a1.jpg",
      date: "2024-12-05",
      category: "Rankings"
    },
    {
      id: 4,
      title: "Young Talents Join Algeria Training Camp",
      summary: "Several promising young players have been called up to join the senior national team training sessions.",
      image: "https://scontent.falg7-2.fna.fbcdn.net/v/t39.30808-6/494384390_1238537110965128_1645680982371247805_n.jpg?stp=dst-jpg_p180x540_tt6&_nc_cat=110&ccb=1-7&_nc_sid=127cfc&_nc_ohc=kWwD3-_5C8QQ7kNvwGK-k0Z&_nc_oc=AdkTERbFnr-w0FSznjwlH7a91J17mUJ6H0l6VSA6g2N2Cgdg5okOYaX2NVEDWBDYsyc&_nc_zt=23&_nc_ht=scontent.falg7-2.fna&_nc_gid=b4KICnmR6Rh5aasovBhDxQ&oh=00_AfNaS6Krs30U42hChZkaRfpuYWcHHB3KAoQ78MhsOyp4hQ&oe=6852061B",
      date: "2024-12-01",
      category: "Youth Development"
    },
    {
      id: 5,
      title: "Algeria's Historic AFCON Journey Continues",
      summary: "Building on their 2019 triumph, the Desert Foxes aim to reclaim continental glory in Morocco 2025.",
      image: "https://media.cnn.com/api/v1/images/stellar/prod/190719231008-algeria-trophy.jpg?q=w_4856,h_3237,x_0,y_0,c_fill",
      date: "2024-11-28",
      category: "History"
    },
    {
      id: 6,
      title: "Friendly Matches Scheduled for AFCON Preparation",
      summary: "Algeria announces international friendly matches to fine-tune tactics before the continental tournament.",
      image: "https://i.ytimg.com/vi/LOXlIyPEsqE/hq720.jpg?sqp=-oaymwEhCK4FEIIDSFryq4qpAxMIARUAAAAAGAElAADIQj0AgKJD&rs=AOn4CLDw04-JFoMwD-4qFnQr-FqrBGE25w",
      date: "2024-11-25",
      category: "Fixtures"
    }
  ];

  return (
    <section id="news" className="latest-news">
      <div className="container">
        <div className="news-header">
          <h2>Latest News</h2>
          <p>Stay updated with the latest news from the Algeria National Football Team</p>
        </div>
        
        <div className="news-grid">
          {newsArticles.map(article => (
            <article key={article.id} className="news-card">
              <div className="news-image">
                <img src={article.image} alt={article.title} />
                <div className="news-category">{article.category}</div>
              </div>
              <div className="news-content">
                <div className="news-date">
                  {new Date(article.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
                <h3>{article.title}</h3>
                <p>{article.summary}</p>
              </div>
            </article>
          ))}
        </div>
        
        <div className="news-footer">
          <button className="view-all-news">View All News</button>
        </div>
      </div>
    </section>
  );
};

export default LatestNews;
