---
title: Project Meridian - Justice Beyond Borders
toc: false
---

<style>
  .hero {
    text-align: center;
    padding: 4rem 2rem;
    background: linear-gradient(135deg, #0a2540 0%, #1a4d7a 50%, #2a6ba8 100%);
    border-radius: 16px;
    margin-bottom: 3rem;
    color: white;
  }

  .hero h1 {
    font-size: 3rem;
    font-weight: 700;
    margin-bottom: 0.5rem;
    background: linear-gradient(135deg, #ffffff 0%, #a8d5ff 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .hero .subtitle {
    font-size: 1.5rem;
    color: #a8d5ff;
    font-weight: 300;
    margin-bottom: 2rem;
  }

  .hero .intro-text {
    max-width: 900px;
    margin: 0 auto;
    font-size: 1.1rem;
    line-height: 1.8;
    color: #e0f0ff;
  }

  .key-stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1.5rem;
    margin: 3rem 0;
    padding: 2rem;
    background: linear-gradient(135deg, rgba(10, 37, 64, 0.6) 0%, rgba(26, 77, 122, 0.6) 100%);
    border-radius: 16px;
    backdrop-filter: blur(10px);
  }

  .stat-item {
    text-align: center;
    color: white;
  }

  .stat-number {
    font-size: 2.5rem;
    font-weight: 700;
    color: #a8d5ff;
    display: block;
  }

  .stat-label {
    font-size: 0.9rem;
    color: #d0e8ff;
    margin-top: 0.5rem;
  }

  .cards-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
  margin-top: 3rem;
  max-width: 900px;
  margin-left: auto;
  margin-right: auto;
}

  .card {
    background: linear-gradient(135deg, rgba(10, 37, 64, 0.4) 0%, rgba(26, 77, 122, 0.4) 100%);
    border-radius: 16px;
    padding: 2rem;
    position: relative;
    overflow: hidden;
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    border: 1px solid rgba(168, 213, 255, 0.2);
    backdrop-filter: blur(10px);
    text-decoration: none;
    display: block;
    color: inherit;
  }

  .card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, rgba(42, 107, 168, 0.4) 0%, rgba(26, 77, 122, 0.6) 100%);
  transform: translateX(-100%);
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 0;
}

.card:hover::before {
  transform: translateX(0);
}

  .card:hover {
    transform: translateY(-8px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
    border-color: rgba(168, 213, 255, 0.5);
  }

  .card.active {
    cursor: pointer;
  }

  .card.placeholder {
    cursor: default;
    opacity: 0.85;
  }

  .card.placeholder:hover {
    transform: none;
    box-shadow: none;
  }

  .card.placeholder::before {
    display: none;
  }

  .card-content {
    position: relative;
    z-index: 1;
  }

  .card-number {
    font-size: 3rem;
    font-weight: 700;
    color: rgba(168, 213, 255, 0.3);
    margin-bottom: 1rem;
    transition: color 0.4s ease;
  }

  .card.active:hover .card-number {
    color: rgba(168, 213, 255, 0.6);
  }

  .card-title {
    font-size: 1.5rem;
    font-weight: 600;
    margin-bottom: 1rem;
    color: #ffffff;
  }

  .card-description {
    font-size: 1rem;
    line-height: 1.6;
    color: #d0e8ff;
    margin-bottom: 1.5rem;
  }

  .card-status {
    display: inline-block;
    padding: 0.5rem 1rem;
    border-radius: 20px;
    font-size: 0.85rem;
    font-weight: 500;
  }

  .status-active {
    background: rgba(34, 197, 94, 0.2);
    color: #86efac;
    border: 1px solid rgba(34, 197, 94, 0.3);
  }

  .status-coming-soon {
    background: rgba(168, 213, 255, 0.1);
    color: #a8d5ff;
    border: 1px solid rgba(168, 213, 255, 0.2);
  }

  @media (max-width: 768px) {
    .hero h1 {
      font-size: 2rem;
    }
    
    .hero .subtitle {
      font-size: 1.2rem;
    }

    .cards-grid {
      grid-template-columns: 1fr;
    }
  }
</style>

<div class="hero">
  <h1>Project Meridian</h1>
  <div class="subtitle">Justice Beyond Borders: Digital Report 2025</div>
  <div class="intro-text">
    A comprehensive mapping of accountability through universal jurisdiction for the most serious international crimes across 216 jurisdictions worldwide.
  </div>
</div>

<div class="key-stats">
  <div class="stat-item">
    <span class="stat-number">216</span>
    <div class="stat-label">Jurisdictions Analyzed</div>
  </div>
  <div class="stat-item">
    <span class="stat-number">153</span>
    <div class="stat-label">UN Member States with Criminalized Crimes</div>
  </div>
  <div class="stat-item">
    <span class="stat-number">148</span>
    <div class="stat-label">States with Cross-Border Investigation Laws</div>
  </div>
  <div class="stat-item">
    <span class="stat-number">20</span>
    <div class="stat-label">Countries with Actual Cases</div>
  </div>
</div>

<div class="cards-grid">
  <a href="./Jurisdiction%20over%20Serious%20International%20Crimes" class="card active">
    <div class="card-content">
      <div class="card-number">01</div>
      <h2 class="card-title">Universal Jurisdiction: Closing the Impunity Gap</h2>
      <p class="card-description">
        Explore how 148 jurisdictions can investigate and prosecute serious international crimes beyond their borders, with detailed analysis of absolute universal jurisdiction, perpetrator presence requirements, and various jurisdictional bases.
      </p>
      <span class="card-status status-active">Explore Now →</span>
    </div>
  </a>

  <div class="card placeholder">
    <div class="card-content">
      <div class="card-number">02</div>
      <h2 class="card-title">Criminalization of International Crimes</h2>
      <p class="card-description">
        Discover which countries have criminalized war crimes, genocide, crimes against humanity, and aggression. Includes regional breakdowns and analysis of countries criminalizing all four core crimes.
      </p>
      <span class="card-status status-coming-soon">Coming Soon</span>
    </div>
  </div>

  <div class="card placeholder">
    <div class="card-content">
      <div class="card-number">03</div>
      <h2 class="card-title">Command Responsibility & Modes of Liability</h2>
      <p class="card-description">
        Examine which jurisdictions hold commanders and superiors accountable for crimes committed by forces under their control, analyzing provisions for command responsibility.
      </p>
      <span class="card-status status-coming-soon">Coming Soon</span>
    </div>
  </div>

  <div class="card placeholder">
    <div class="card-content">
      <div class="card-number">04</div>
      <h2 class="card-title">Cases & Practice: From Law to Action</h2>
      <p class="card-description">
        Track actual prosecutions and investigations across jurisdictions, including specialized units, conviction rates, and the gap between legal capacity and practical implementation.
      </p>
      <span class="card-status status-coming-soon">Coming Soon</span>
    </div>
  </div>

  <div class="card placeholder">
    <div class="card-content">
      <div class="card-number">05</div>
      <h2 class="card-title">Trends & Challenges in International Justice</h2>
      <p class="card-description">
        Navigate three decades of universal jurisdiction evolution, from legal developments to structural investigations, examining key milestones and ongoing challenges in the pursuit of justice.
      </p>
      <span class="card-status status-coming-soon">Coming Soon</span>
    </div>
  </div>

  <div class="card placeholder">
    <div class="card-content">
      <div class="card-number">06</div>
      <h2 class="card-title">The Accountability Gap: Potential vs. Reality</h2>
      <p class="card-description">
        Understand why only 12% of countries with universal jurisdiction laws have used them, exploring legal barriers, procedural limitations, and the path forward for survivor justice.
      </p>
      <span class="card-status status-coming-soon">Coming Soon</span>
    </div>
  </div>
</div>