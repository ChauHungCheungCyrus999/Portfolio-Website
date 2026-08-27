import { useEffect, useRef, useState } from 'react'
import './App.css'
import MiniGames from './MiniGames.jsx'
import profilePhoto from './assets/CyrusPfp.jpeg'
import sanfieldLogo from './assets/Sanfield.png'
import ylotLogo from './assets/Y-LOT FOUNDATION.jpeg'
import paddlePhoto from './assets/StandupPaddle.jpg'
import barPhoto from './assets/Bar.JPG'
import sunsetPhoto from './assets/SunsetJPG.JPG'
import parrotPhoto from './assets/Parrot.JPG'
import cvPdf from './assets/CV_ChauHungCheungCyrus.pdf'

const projects = [
  { number: '01', title: 'RAG Q&A Web App with Vector Database and LLM Integration', description: 'Built a Flask-based Q&A application leveraging MySQL, FAISS vector databases, and large language models to provide natural language answers over company knowledge. The system supports Chinese and English with over 95% accuracy, handles datasets exceeding 1,000 entries, and delivers responses within five seconds.', tags: ['Python', 'JavaScript', 'Flask', 'RESTful API'], link: 'https://github.com/ChauHungCheungCyrus999/RAGQ-AChatBot', linkType: 'GitHub' },
  { number: '02', title: 'Bank-Shot Target Model', description: 'Built a React and Flask bank shot target optimizer that lets users drag a shooter on a basketball court and instantly see the recommended backboard aim point, using geometry from a 2011 research paper.', tags: ['ReactJs', 'Flask'], link: 'https://github.com/ChauHungCheungCyrus999/Bank-Shot-Target-Optimizer', linkType: 'GitHub' },
  { number: '03', title: 'Canada Vehicle Emissions Analysis', description: 'Built an R project that transformed and explored Canada vehicle emissions data, then applied linear regression and diagnostic checks to study key emission factors. Also used a chi-square test to compare emission test failures across vehicle categories, with final findings presented through clear visualizations.', tags: ['R'], link: 'https://github.com/ChauHungCheungCyrus999/Canada-Vehicle-Emissions-Analysis', linkType: 'GitHub' },
  { number: '04', title: 'My Own Personal Blog', description: 'Created a personal blog where I share thoughts on life, personal experiences, and reflections in a simple static website.', tags: ['HTML', 'CSS', 'JavaScript'], link: 'https://chauhungcheungcyrus999.github.io/CyBlog', linkType: 'Website' },
  { number: '05', title: 'Pokemon Battle Turn-based Game', description: 'Built a playable command-line Pokemon battle game in Java, using JUnit tests to validate core turn-based battle behavior without relying on a database.', tags: ['Java', 'JUnit'], link: 'https://github.com/thomasmahk3/CS3343-Project-Pokemon-Battle-Game', linkType: 'GitHub' },
  { number: '06', title: 'Extrovert vs. Introvert Behavior Data Analysis', description: 'Analyzed behavioral data to identify key features, create decision thresholds, train a Logistic Regression model, and evaluate its predictions.', tags: ['Python'], link: 'https://github.com/ChauHungCheungCyrus999/ExtroverVsIntrovert', linkType: 'GitHub' },
]

const experience = [
  {
    role: 'Information Technology Intern',
    company: 'Sanfield (Management) Limited',
    image: sanfieldLogo,
    date: '08/2025 — 05/2026',
    focus: 'Software Development',
    points: [
      'Developed a bilingual RAG-based Q&A chatbot with React, Flask, Oracle Database and Ollama, achieving 98%+ answer accuracy across large internal knowledge bases.',
      'Built an internal CRUD dashboard with one-click vector database regeneration, improving knowledge maintenance for non-technical staff.',
      'Implemented Neuron Mind App, generating LLM-powered mind maps and Markdown summaries from uploaded documents.',
      'Resolved 83 bugs and delivered new features for Project-mastar, an internal project tracking system.',
      'Developed a company website for GCL by translating client requirements into a functional web solution.',
    ],
    tools: 'Python · React · Flask · MySQL · Docker · RAG · Ollama · Open WebUI · n8n',
  },
  {
    role: 'Programme Assistant Intern',
    company: 'Y-LOT Foundation Limited',
    image: ylotLogo,
    date: '08/2024',
    focus: 'Education & Data',
    points: [
      'Developed one-hour and five-hour Python curricula, reducing reliance on outsourced teaching materials.',
      'Evaluated external Python curricula, identified defects and provided actionable feedback to vendors.',
      'Used web scraping and data cleaning to compile 4,115 targeted contacts for competition outreach.',
    ],
    tools: 'Python · JavaScript · Web scraping · Excel · Word',
  },
]

const photos = [
  { label: 'Paddleboarding in Canada', className: 'photo-one', image: paddlePhoto, position: 'center' },
  { label: 'Good times with friends', className: 'photo-two', image: barPhoto, position: 'center' },
  { label: 'Vancouver sunset', className: 'photo-three', image: sunsetPhoto, position: 'center bottom' },
  { label: 'A curious local', className: 'photo-four', image: parrotPhoto, position: 'center bottom' },
]

const parseApiResponse = async (response) => {
  const text = await response.text()
  if (!text) return {}
  try {
    return JSON.parse(text)
  } catch {
    throw new Error('Backend did not return JSON. Make sure the Flask server is running.')
  }
}

function App() {
  const [showIntro, setShowIntro] = useState(true)
  const [introLeaving, setIntroLeaving] = useState(false)
  const [activeGame, setActiveGame] = useState(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [secretLoginOpen, setSecretLoginOpen] = useState(false)
  const [auditOpen, setAuditOpen] = useState(false)
  const [auditToken, setAuditToken] = useState('')
  const [auditPassword, setAuditPassword] = useState('')
  const [auditError, setAuditError] = useState('')
  const [auditVisits, setAuditVisits] = useState([])
  const [auditLoading, setAuditLoading] = useState(false)
  const secretHoldTimerRef = useRef(null)

  useEffect(() => {
    const startExit = window.setTimeout(() => setIntroLeaving(true), 8000)
    const finishExit = window.setTimeout(() => setShowIntro(false), 8700)
    return () => {
      window.clearTimeout(startExit)
      window.clearTimeout(finishExit)
    }
  }, [])

  useEffect(() => {
    fetch('/api/audit/visit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        path: window.location.pathname,
        referrer: document.referrer,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        screen: `${window.screen.width} × ${window.screen.height}`,
        viewport: `${window.innerWidth} × ${window.innerHeight}`,
      }),
    }).catch(() => {})
  }, [])

  useEffect(() => () => window.clearTimeout(secretHoldTimerRef.current), [])

  const closeIntro = () => {
    setIntroLeaving(true)
    window.setTimeout(() => setShowIntro(false), 700)
  }

  const goTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
    setMenuOpen(false)
  }

  const loadAuditVisits = async (token) => {
    setAuditLoading(true)
    setAuditError('')
    try {
      const response = await fetch('/api/audit/visits', {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await parseApiResponse(response)
      if (!response.ok) throw new Error(data.error || 'Unable to load audit log')
      setAuditVisits(data.visits)
    } catch (error) {
      setAuditError(error.message)
    } finally {
      setAuditLoading(false)
    }
  }

  const startSecretHold = () => {
    window.clearTimeout(secretHoldTimerRef.current)
    secretHoldTimerRef.current = window.setTimeout(() => {
      setAuditError('')
      setSecretLoginOpen(true)
    }, 3000)
  }

  const stopSecretHold = () => window.clearTimeout(secretHoldTimerRef.current)

  const submitAuditLogin = async (event) => {
    event.preventDefault()
    setAuditLoading(true)
    setAuditError('')
    try {
      const response = await fetch('/api/audit/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: auditPassword.trim() }),
      })
      const data = await parseApiResponse(response)
      if (!response.ok) throw new Error(data.error || 'Invalid password')
      setAuditToken(data.token)
      setAuditPassword('')
      setSecretLoginOpen(false)
      setAuditOpen(true)
      await loadAuditVisits(data.token)
    } catch (error) {
      setAuditError(error.message)
    } finally {
      setAuditLoading(false)
    }
  }

  return (
    <>
      {showIntro && (
        <div className={`intro-screen ${introLeaving ? 'leaving' : ''}`}>
          <div className="intro-orbit" aria-hidden="true"><span /></div>
          <p>Hello, this is</p>
          <h1>Chau Hung Cheung, Cyrus.</h1>
          <p className="welcome-line">Welcome to know more about me.</p>
          <button type="button" onClick={closeIntro}>Enter portfolio <span>↘</span></button>
        </div>
      )}

      <header className="site-header">
        <button className="logo" type="button" onClick={() => goTo('home')}>C<span>.</span></button>
        <button className="menu-toggle" type="button" aria-label="Toggle navigation" aria-expanded={menuOpen} onClick={() => setMenuOpen((open) => !open)}>{menuOpen ? 'Close' : 'Menu'}</button>
        <nav className={menuOpen ? 'open' : ''} aria-label="Main navigation">
          {['profile', 'experience', 'projects', 'photos', 'game', 'contact'].map((item) => (
            <button key={item} type="button" onClick={() => goTo(item)}>{item === 'game' ? 'Mini game' : item}</button>
          ))}
        </nav>
      </header>

      <button
        className="back-to-top"
        type="button"
        aria-label="Back to top"
        onClick={() => goTo('home')}
      >
        <span>↑</span>
        <small>Top</small>
      </button>

      <MiniGames activeGame={activeGame} onClose={() => setActiveGame(null)} />

      <main>
        <section className="hero section" id="home">
          <div className="hero-copy">
            <h1>CYRUS CHAU</h1>
            <div className="hero-ticker" role="note" aria-label="Build forward">
              <div className="hero-ticker-track" aria-hidden="true">
                {[...Array(2)].map((_, groupIndex) => (
                  <div className="hero-ticker-group" key={groupIndex}>
                    {[...Array(10)].map((__, itemIndex) => (
                      <span className="hero-ticker-item" key={itemIndex}>
                        BUILD FORWARD <span className="hero-ticker-separator">✦</span>
                      </span>
                    ))}
                  </div>
                ))}
              </div>
            </div>
            <div className="hero-details">
              <div>
                <p className="hero-role">
                  <span>Full-stack Developer · AI Application Builder</span>
                  <span>Creative Thinker · Problem Solver · Lifelong Learner</span>
                </p>
                <button className="text-link" type="button" onClick={() => goTo('profile')}>Discover my story <span>↓</span></button>
              </div>
              <p className="hero-intro">Computer Science undergraduate building full-stack applications, AI-powered tools and internal business systems.</p>
              <div className="hero-stamp" aria-label="Based in Hong Kong">
                <strong>CHC</strong>
                <small>Hong Kong </small><strong>🇭🇰</strong>
              </div>
            </div>
          </div>
          <span className="side-note">OPEN TO OPPORTUNITIES</span>
        </section>

        <section className="profile section" id="profile">
          <div className="section-index">01 / PROFILE</div>
          <div className="profile-heading"><p className="eyebrow">A LITTLE ABOUT ME</p><h2>More than just the code.</h2></div>
          <div className="profile-body">
            <figure className="profile-photo">
              <img src={profilePhoto} alt="Chau Hung Cheung, Cyrus" />
              <figcaption>Cyrus Chau · Hong Kong</figcaption>
            </figure>
            <p className="large-copy">I build practical systems where <em>full-stack engineering</em>, AI and thoughtful user experience meet.</p>
            <div className="bio">
              <p>I’m a Computer Science undergraduate with hands-on experience building full-stack web applications, AI-powered tools and internal business systems.</p>
              <p>Skilled in Python, React, Flask, SQL and LLM/RAG application development, I deliver production features, improve operational efficiency and communicate clearly with technical and non-technical stakeholders.</p>
              <a className="cv-download" href={cvPdf} download="CV_ChauHungCheungCyrus.pdf">Download CV <span>↓</span></a>
            </div>
          </div>
          <div className="facts">
            <div><strong>Hong Kong</strong><span>Home base</span></div>
            <div><strong>CityU Hong Kong</strong><span>BSc Computer Science · 2027</span></div>
            <div><strong>AI & Full Stack</strong><span>Current focus</span></div>
          </div>
          <div className="cv-details">
            <article>
              <p className="eyebrow">EDUCATION</p>
              <div className="education-item"><div><strong>Bachelor of Computing in Computer Science</strong><span>City University of Hong Kong</span></div><time>08/2023 — 06/2027</time></div>
              <div className="education-item"><div><strong>High School Diploma</strong><span>Liu Po Shan Memorial College</span></div><time>09/2016 — 08/2023</time></div>
            </article>
            <article>
              <p className="eyebrow">LANGUAGES & INTERESTS</p>
              <p><strong>Cantonese</strong> · Native &nbsp; <strong>English</strong> · Fluent &nbsp; <strong>Mandarin</strong></p>
              <p className="muted-copy">AI applications · Data analysis · Philosophy · Lifelong learning · Fitness · Investing</p>
            </article>
          </div>
        </section>

        <section className="experience section" id="experience">
          <div className="section-index">02 / EXPERIENCE</div>
          <div className="section-title-row"><div><p className="eyebrow">WORK EXPERIENCE</p><h2>Building things that work.</h2></div><p>Production software, internal tools and measurable operational improvements.</p></div>
          <div className="experience-list">
            {experience.map((job, index) => (
              <article key={job.company}>
                <div className="experience-meta">
                  <span>0{index + 1}</span>
                  <figure className="experience-image">
                    <img src={job.image} alt={`${job.company} logo`} />
                  </figure>
                  <time>{job.date}</time>
                </div>
                <div className="experience-content">
                  <p className="job-focus">{job.focus}</p>
                  <h3>{job.role}</h3>
                  <h4>{job.company}</h4>
                  <ul>{job.points.map((point) => <li key={point}>{point}</li>)}</ul>
                  <p className="tools"><strong>Tools</strong> {job.tools}</p>
                </div>
              </article>
            ))}
          </div>
          <div className="skills-panel">
            <div><span>Programming</span><strong>Python · Java · C++ · JavaScript · SQL</strong></div>
            <div><span>Frameworks & tools</span><strong>React · Node.js · Express · Flask · MongoDB · MySQL · Docker · FAISS · Ollama · Postman</strong></div>
          </div>
        </section>

        <section className="projects section" id="projects">
          <div className="section-index">04 / PROJECTS</div>
          <div className="section-title-row"><div><p className="eyebrow">SELECTED WORK</p><h2>Things I’ve made.</h2></div><p>A growing collection of ideas brought to life.</p></div>
          <div className="project-list">
            {projects.map((project) => (
              <article className={project.link ? 'has-link' : ''} key={project.number}>
                <span className="project-number">{project.number}</span>
                <div><h3>{project.title}</h3><p>{project.description}</p></div>
                <ul>{project.tags.map((tag) => <li key={tag}>{tag}</li>)}</ul>
                {project.link ? (
                  <>
                    <span className="project-arrow" aria-hidden="true">↗</span>
                    <a className="project-card-link" href={project.link} target="_blank" rel="noreferrer" aria-label={`Open ${project.title} ${project.linkType || 'link'}`} />
                  </>
                ) : <span className="project-arrow">—</span>}
              </article>
            ))}
          </div>
        </section>

        <section className="photos section" id="photos">
          <div className="section-index">03 / PHOTOS</div>
          <div className="section-title-row">
            <div><p className="eyebrow">LIFE IN FRAMES</p><h2>Moments worth keeping.</h2></div>
            <p>Snapshots from life, friendship and travel. <a className="photo-album-link" href="https://drive.google.com/drive/folders/1FlLawvDOswFA3QDlQhGH4ok9B6JWlRn5?usp=sharing" target="_blank" rel="noreferrer">View Canada album ↗</a></p>
          </div>
          <div className="photo-grid">
            {photos.map((photo) => (
              <figure className={photo.className} key={photo.label}>
                <div>
                  <img src={photo.image} alt={photo.label} style={{ objectPosition: photo.position }} />
                </div>
                <figcaption>{photo.label}</figcaption>
              </figure>
            ))}
          </div>
        </section>

        <section className="game section" id="game">
          <div className="section-index">05 / MINI GAME</div>
          <div className="section-title-row game-heading">
            <div><p className="eyebrow">TAKE A QUICK BREAK</p><h2>Choose your game.</h2></div>
            <p>Each game opens in a small window, so you never lose your place in the portfolio.</p>
          </div>
          <div className="game-library">
            <button type="button" className="game-card featured" onClick={() => setActiveGame('zombie')}>
              <span className="game-card-number">01</span>
              <div className="game-preview shooter-preview"><i className="preview-player" /><i className="preview-rifle" /><i className="preview-zombie one" /><i className="preview-zombie two" /></div>
              <h3>Zombie Killer</h3>
              <p>Defend yourself against waves of green circle zombies.</p>
              <strong>Play game ↗</strong>
            </button>
            <button type="button" className="game-card" onClick={() => setActiveGame('memory')}>
              <span className="game-card-number">02</span>
              <div className="game-preview memory-preview"><i>◆</i><i>●</i><i>▲</i><i>✦</i><i>■</i><i>?</i></div>
              <h3>Memory Match</h3>
              <p>Turn over cards, remember their positions and match every pair.</p>
              <strong>Play game ↗</strong>
            </button>
            <button type="button" className="game-card" onClick={() => setActiveGame('reaction')}>
              <span className="game-card-number">03</span>
              <div className="game-preview reaction-preview"><span>000</span><small>MS</small></div>
              <h3>Reaction Check</h3>
              <p>Wait for the signal and find out how fast your reflexes really are.</p>
              <strong>Play game ↗</strong>
            </button>
          </div>
        </section>

        <section className="contact section" id="contact">
          <div className="section-index">06 / CONTACT</div>
          <p className="eyebrow">LET’S CONNECT</p>
          <h2>Interested in working together<br />or discussing an opportunity? <em>Let’s connect.</em></h2>
          <a className="email-link" href="mailto:c60413094@gmail.com?subject=Professional%20Opportunity" aria-label="Email Cyrus Chau at c60413094@gmail.com">c60413094@gmail.com <span>↗</span></a>
          <div className="contact-footer">
            <p>Chau Hung Cheung, Cyrus<br /><span>Hong Kong SAR · +852 6041 3094</span></p>
            <div className="social-links">
              <a href="https://www.linkedin.com/in/chauhungcheungcyrus" target="_blank" rel="noreferrer" aria-label="Open Cyrus Chau on LinkedIn">
                <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                  <path d="M6.5 8.7h-4V22h4zM4.5 2a2.3 2.3 0 1 0 0 4.6A2.3 2.3 0 0 0 4.5 2M22 14.7c0-4.1-2.2-6-5.1-6a4.4 4.4 0 0 0-4 2.2h-.1V8.7H9V22h4v-6.6c0-1.7.3-3.4 2.5-3.4s2.2 2 2.2 3.5V22h4z" />
                </svg>
              </a>
              <a href="https://github.com/ChauHungCheungCyrus999" target="_blank" rel="noreferrer" aria-label="Open Cyrus Chau on GitHub">
                <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                  <path d="M12 .8a11.2 11.2 0 0 0-3.5 21.8c.6.1.8-.2.8-.6v-2c-3.4.7-4.1-1.4-4.1-1.4-.5-1.4-1.3-1.8-1.3-1.8-1.1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1.1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.8-1.6-2.7-.3-5.5-1.3-5.5-6a4.7 4.7 0 0 1 1.2-3.2 4.4 4.4 0 0 1 .1-3.1s1-.3 3.3 1.2a11.4 11.4 0 0 1 6 0c2.3-1.5 3.3-1.2 3.3-1.2.6 1.4.2 2.5.1 3.1a4.7 4.7 0 0 1 1.2 3.2c0 4.7-2.8 5.7-5.5 6 .4.3.8 1 .8 2.1V22c0 .4.2.7.8.6A11.2 11.2 0 0 0 12 .8" />
                </svg>
              </a>
            </div>
            <button
              className="secret-icon"
              type="button"
              aria-label="Hold to open private audit login"
              onPointerDown={startSecretHold}
              onPointerUp={stopSecretHold}
              onPointerLeave={stopSecretHold}
              onPointerCancel={stopSecretHold}
            >
              <span />
            </button>
          </div>
        </section>
      </main>

      {secretLoginOpen && (
        <div className="audit-backdrop" role="presentation" onPointerDown={() => setSecretLoginOpen(false)}>
          <form className="audit-login" onSubmit={submitAuditLogin} onPointerDown={(event) => event.stopPropagation()}>
            <input
              type="text"
              value={auditPassword}
              placeholder="Enter password"
              autoFocus
              autoComplete="off"
              onChange={(event) => setAuditPassword(event.target.value)}
            />
            {auditError && <p>{auditError}</p>}
          </form>
        </div>
      )}

      {auditOpen && (
        <div className="audit-page" role="dialog" aria-modal="true" aria-label="Website audit page">
          <header>
            <div><small>PRIVATE AUDIT</small><h2>Website visitors</h2></div>
            <div>
              <button type="button" onClick={() => loadAuditVisits(auditToken)} disabled={auditLoading}>Refresh</button>
              <button type="button" onClick={() => setAuditOpen(false)}>Close</button>
            </div>
          </header>
          {auditError && <p className="audit-error">{auditError}</p>}
          <div className="audit-summary">
            <div><strong>{auditVisits.length}</strong><span>Total recorded visits</span></div>
            <div><strong>{new Set(auditVisits.map((visit) => visit.ipAddress)).size}</strong><span>Unique IP addresses</span></div>
            <div><strong>{new Set(auditVisits.map((visit) => visit.visitorType)).size}</strong><span>Device/browser types</span></div>
          </div>
          <div className="audit-table-wrap">
            <table className="audit-table">
              <thead>
                <tr><th>Time</th><th>Visitor type</th><th>Path</th><th>Language</th><th>Screen</th><th>IP</th><th>Referrer</th></tr>
              </thead>
              <tbody>
                {auditVisits.map((visit) => (
                  <tr key={visit.id}>
                    <td>{new Date(visit.visitedAt).toLocaleString()}</td>
                    <td>{visit.visitorType}</td>
                    <td>{visit.path}</td>
                    <td>{visit.language}</td>
                    <td>{visit.screen}</td>
                    <td>{visit.ipAddress}</td>
                    <td>{visit.referrer}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!auditVisits.length && <p className="audit-empty">No visits recorded yet.</p>}
          </div>
        </div>
      )}
    </>
  )
}

export default App
