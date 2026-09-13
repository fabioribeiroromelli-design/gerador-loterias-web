<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="color-scheme" content="dark">
<title>Sorteio & Estatísticas das Loterias</title>
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
<link href="https://fonts.googleapis.com/css2?family=Big+Shoulders+Display:wght@600;700;800&family=IBM+Plex+Mono:wght@500;600&family=IBM+Plex+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
:root{
  --bg:#121019;--surface:#1c1a26;--surface-2:#262432;--surface-3:#312e3f;
  --border:#363347;--border-soft:#2a2836;--ink:#14131b;
  --text:#EDEAE3;--text-muted:#9a96ab;--text-faint:#59566c;
  --gold:#E3A83B;--gold-soft:#f3c874;--gold-dim:rgba(227,168,59,.16);
  --hot:#E3A83B;--cold:#3B82F6;--cold-soft:#7fb0ff;--mid:#56536c;
  --delay:#E0553F;--delay-soft:#ff9686;
  --radius:10px;--radius-lg:16px;
  --shadow-card:0 4px 18px rgba(0,0,0,.30);
  --font-display:'Big Shoulders Display',sans-serif;
  --font-body:'IBM Plex Sans',sans-serif;--font-mono:'IBM Plex Mono',monospace;
}
*{box-sizing:border-box}
body{margin:0;padding:0;font-family:var(--font-body);background-color:var(--bg);
  background-image:radial-gradient(circle at 12% 0%,rgba(227,168,59,.07),transparent 40%),
                   radial-gradient(circle at 88% 10%,rgba(147,0,137,.12),transparent 45%);
  background-attachment:fixed;color:var(--text);-webkit-font-smoothing:antialiased}

/* HEADER */
.header-bar{background:linear-gradient(180deg,var(--ink),var(--surface));border-bottom:1px solid var(--border);
  padding:18px 24px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:16px;
  box-shadow:0 6px 20px rgba(0,0,0,.25);position:relative;z-index:5}
.header-left{display:flex;align-items:center;gap:16px}
.btn-back{background:transparent;color:var(--text);border:1px solid var(--border);padding:9px 16px;border-radius:8px;
  cursor:pointer;font-family:var(--font-body);font-weight:500;font-size:.9rem;display:inline-flex;align-items:center;
  gap:8px;text-decoration:none;white-space:nowrap;transition:border-color .15s ease,background .15s ease}
.btn-back:hover{border-color:var(--gold);background:var(--gold-dim)}
.header-titles h1{margin:0;font-family:var(--font-display);font-weight:700;
  font-size:clamp(1.4rem,1.1rem + 1.2vw,1.9rem);letter-spacing:.01em;line-height:1.1}
.header-titles p{margin:4px 0 0;color:var(--text-muted);font-size:.9rem}
.lang-select-wrap{position:relative;display:inline-flex;align-items:center}
.lang-select-wrap i{position:absolute;left:13px;color:var(--text-muted);font-size:.82rem;pointer-events:none}
.lang-selector{background:var(--surface-2);color:var(--text);border:1px solid var(--border);
  padding:9px 30px 9px 34px;border-radius:8px;font-family:var(--font-body);font-size:.88rem;cursor:pointer;
  appearance:none;-webkit-appearance:none;
  background-image:linear-gradient(45deg,transparent 50%,var(--text-muted) 50%),
                   linear-gradient(135deg,var(--text-muted) 50%,transparent 50%);
  background-position:calc(100% - 16px) center,calc(100% - 11px) center;
  background-size:5px 5px,5px 5px;background-repeat:no-repeat}
.container{max-width:1280px;margin:0 auto;padding:28px 20px 60px}

/* TABS */
.tabs-nav{display:flex;gap:4px;margin-bottom:18px;border-bottom:1px solid var(--border)}
.tab-btn{background:transparent;border:none;color:var(--text-muted);padding:12px 22px;font-family:var(--font-body);
  font-weight:600;font-size:.95rem;cursor:pointer;border-bottom:3px solid transparent;display:inline-flex;
  align-items:center;gap:8px;transition:all .15s ease;margin-bottom:-1px}
.tab-btn:hover{color:var(--text)}
.tab-btn.active{color:var(--gold);border-bottom-color:var(--gold)}
.page-view{display:none}
.page-view.active{display:block;animation:entrar .35s ease}
@keyframes entrar{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:translateY(0)}}
@keyframes spin{to{transform:rotate(360deg)}}

/* LOTTERY NAV */
.lottery-grid-nav{display:grid;grid-template-columns:repeat(auto-fit,minmax(122px,1fr));gap:10px;margin-bottom:22px}
.lottery-card-btn{border:none;padding:12px 10px;border-radius:8px;color:#fff;font-family:var(--font-display);
  cursor:pointer;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;
  gap:2px;min-height:60px;opacity:.75;transition:transform .15s ease,filter .15s ease,opacity .15s ease;
  box-shadow:0 1px 0 rgba(255,255,255,.12) inset,0 4px 10px rgba(0,0,0,.28)}
.lottery-card-btn .game-name{font-weight:700;font-size:1.05rem;letter-spacing:.01em}
.lottery-card-btn .game-hint{font-family:var(--font-body);font-weight:500;font-size:.62rem;opacity:.8}
.lottery-card-btn:hover,.lottery-card-btn.active{opacity:1;transform:translateY(-2px);filter:brightness(1.08)}
.lottery-card-btn.active{box-shadow:0 0 0 3px var(--gold),0 6px 16px rgba(0,0,0,.35)}
.btn-megasena{background-color:#209869}.btn-lotofacil{background-color:#930089}
.btn-quina{background-color:#260085}.btn-lotomania{background-color:#f78100}
.btn-timemania{background-color:#00ff48;color:#14131b !important}.btn-duplasena{background-color:#a61324}
.btn-diadesorte{background-color:#cb831d}.btn-supersete{background-color:#a8cf45;color:#14131b !important}
.btn-maismilionaria{background-color:#1b3582}

/* CARDS */
.card-box{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:20px;box-shadow:var(--shadow-card)}
.card-box h3{margin:0 0 4px;font-family:var(--font-display);font-weight:700;font-size:1.1rem;display:flex;align-items:center;gap:8px}
.card-box h3 i{color:var(--gold);font-size:.9rem}
.card-box .card-desc{margin:0 0 14px;color:var(--text-muted);font-size:.8rem;line-height:1.4;
  padding-bottom:12px;border-bottom:1px solid var(--border)}

/* DRAW STAGE */
.draw-stage{display:grid;grid-template-columns:auto 1fr;gap:32px;align-items:center;
  background:var(--surface);border:1px solid var(--border);border-radius:var(--radius-lg);padding:32px;
  margin-bottom:20px;box-shadow:var(--shadow-card)}
@media(max-width:700px){.draw-stage{grid-template-columns:1fr;justify-items:center;text-align:center}}
.globo{width:180px;height:180px;border-radius:50%;
  background:radial-gradient(circle at 30% 30%,#3a2f5c,#1a1428 70%);
  display:flex;align-items:center;justify-content:center;
  box-shadow:0 0 60px rgba(227,168,59,.25),inset 0 -20px 40px rgba(0,0,0,.6);
  border:3px solid rgba(227,168,59,.3);transition:all .3s ease}
.globo.girando{animation:spin .8s linear infinite}
.numero{font-family:var(--font-display);font-weight:800;font-size:4rem;color:var(--gold);
  text-shadow:0 0 20px rgba(227,168,59,.5);transition:transform .3s ease}
.numero.girando{opacity:.9}
.draw-info h2{font-family:var(--font-display);font-size:2rem;margin:0 0 8px}
.draw-info p{margin:6px 0;color:var(--text-muted)}
.draw-info strong{color:var(--gold);font-family:var(--font-mono)}

/* EXCLUSIONS */
.excluded-input{width:100%;padding:12px 14px;background:var(--surface-2);border:1px solid var(--border);
  border-radius:8px;color:var(--text);font-family:var(--font-mono);font-size:.95rem;outline:none}
.excluded-input:focus{border-color:var(--gold)}
.exclusion-hint{font-size:.78rem;color:var(--text-muted);margin:8px 0 0;white-space:pre-line;line-height:1.4}
.exclusion-actions{margin-top:12px;display:flex;flex-wrap:wrap;gap:10px}
.excluded-chips-container{display:flex;flex-wrap:wrap;gap:8px;margin-top:14px;padding-top:14px;border-top:1px solid var(--border);align-items:center}
.excluded-chip{display:inline-flex;align-items:center;justify-content:center;min-width:38px;height:38px;padding:0 8px;
  border-radius:50%;background:var(--delay);color:#fff;font-family:var(--font-display);font-weight:700;font-size:.9rem;
  box-shadow:0 3px 10px rgba(224,85,63,.4)}
.excluded-chip-label{color:var(--text-muted);font-size:.78rem;font-weight:600;margin-right:6px;text-transform:uppercase;letter-spacing:.04em}
.excluded-empty{color:var(--text-faint);font-size:.8rem;font-style:italic}

/* SUPER SETE EXCLUSIONS */
.ss-excl-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:12px;margin-top:12px}
.ss-col-card{background:var(--surface-2);border:1px solid var(--border);border-radius:10px;padding:12px}
.ss-col-title{font-family:var(--font-display);font-weight:700;color:var(--gold);font-size:.9rem;margin-bottom:10px;text-align:center}
.ss-digits{display:grid;grid-template-columns:repeat(5,1fr);gap:5px}
.ss-digit{aspect-ratio:1;display:flex;align-items:center;justify-content:center;
  background:var(--surface);border:1px solid var(--border);border-radius:6px;color:var(--text);
  font-family:var(--font-mono);font-weight:600;font-size:.85rem;cursor:pointer;transition:all .12s ease;user-select:none}
.ss-digit:hover{border-color:var(--gold);transform:scale(1.08)}
.ss-digit.excluded{background:var(--delay);color:#fff;border-color:var(--delay);text-decoration:line-through;
  box-shadow:0 3px 8px rgba(224,85,63,.4)}

/* BUTTONS */
.btn-primary,.btn-secondary{padding:12px 22px;border-radius:8px;font-family:var(--font-body);font-weight:600;
  font-size:.9rem;cursor:pointer;display:inline-flex;align-items:center;gap:8px;border:1px solid transparent;
  transition:all .15s ease}
.btn-primary{background:var(--gold);color:var(--ink);border-color:var(--gold)}
.btn-primary:hover{filter:brightness(1.1);transform:translateY(-1px)}
.btn-primary:disabled{opacity:.5;cursor:not-allowed;transform:none}
.btn-secondary{background:transparent;color:var(--text);border-color:var(--border)}
.btn-secondary:hover{border-color:var(--gold);background:var(--gold-dim)}
.draw-actions{display:flex;flex-wrap:wrap;gap:10px;margin-bottom:20px}

/* DRAWN AREA */
.drawn-area{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:20px;
  box-shadow:var(--shadow-card);display:none;margin-bottom:20px}
.drawn-area.visible{display:block;animation:entrar .3s ease}
.drawn-area h3{font-family:var(--font-display);margin:0 0 14px;font-size:1.1rem;display:flex;align-items:center;gap:8px}
.drawn-area h3 i{color:var(--gold)}
.drawn-numbers-container{display:flex;flex-wrap:wrap;gap:10px}
.ball{width:48px;height:48px;border-radius:50%;display:flex;align-items:center;justify-content:center;
  font-family:var(--font-display);font-weight:700;font-size:1.1rem;color:#fff;
  box-shadow:0 4px 12px rgba(0,0,0,.3);animation:entrar .3s ease}
.extra-info{margin-top:16px;padding:12px 16px;background:var(--surface-2);border-radius:8px;border-left:3px solid var(--gold)}
.extra-info span{color:var(--text-muted);margin-right:8px;font-size:.85rem}
.extra-info strong{color:var(--gold);font-family:var(--font-display);font-size:1.1rem}

/* STATS PAGE ELEMENTS (originais) */
.context-bar{display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;
  background:var(--surface);border:1px solid var(--border);padding:16px 20px;border-radius:var(--radius);
  margin-bottom:20px;box-shadow:var(--shadow-card)}
#stats_title{margin:0;font-family:var(--font-display);font-weight:700;font-size:1.4rem}
#stats_subtitle{margin:4px 0 0;color:var(--text-muted);font-size:.85rem}
#badge_fonte{font-family:var(--font-body);font-size:.78rem;font-weight:500;color:var(--text-muted);
  padding:5px 12px;border-radius:20px;border:1px solid var(--border);background:var(--surface-2);
  white-space:nowrap;display:inline-flex;align-items:center;gap:6px}
#badge_fonte i{color:var(--gold)}
#stats_container.fade-in{animation:entrar .35s ease}

.legend-bar{display:flex;flex-wrap:wrap;gap:14px;margin-bottom:16px;padding-bottom:14px;border-bottom:1px solid var(--border)}
.legend-item{display:inline-flex;align-items:center;gap:7px;font-size:.78rem;color:var(--text-muted)}
.legend-dot{width:11px;height:11px;border-radius:50%;flex-shrink:0;display:inline-block}
.legend-dot.dot-hot{background:var(--hot)}
.legend-dot.dot-mid{background:var(--mid)}
.legend-dot.dot-cold{background:var(--cold)}
.legend-dot.dot-delay{background:var(--delay)}
.legend-dot.dot-never{background:transparent;border:1.5px dashed var(--text-faint)}
.legend-dot.dot-delay-ring{background:transparent;border:2px solid var(--delay)}
.legend-swatch.heat-swatch{width:36px;height:11px;border-radius:4px;
  background:linear-gradient(90deg,rgba(227,168,59,.12),rgba(227,168,59,.95));display:inline-block}

.painel-principal{display:grid;grid-template-columns:minmax(0,2fr) minmax(280px,1fr);gap:20px;margin-bottom:20px;align-items:start}
@media(max-width:900px){.painel-principal{grid-template-columns:1fr}}
.stats-main-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:18px;margin-bottom:20px}

.number-grid{display:grid;gap:7px;margin-top:4px;justify-items:center}
.number-cell{aspect-ratio:1/1;width:100%;min-width:30px;max-width:54px;border-radius:50%;
  display:flex;align-items:center;justify-content:center;font-family:var(--font-display);
  font-weight:700;font-size:.78rem;background:var(--surface-2);color:var(--text);
  border:1px solid var(--border);cursor:pointer;transition:transform .12s ease,box-shadow .12s ease;
  position:relative;flex-shrink:0}
.number-cell:hover{transform:scale(1.15);box-shadow:0 0 12px rgba(227,168,59,.5);z-index:2}
.number-cell.hot{background:radial-gradient(circle at 32% 28%,var(--gold-soft),var(--gold) 72%);color:var(--ink);border-color:var(--gold)}
.number-cell.cold{background:radial-gradient(circle at 32% 28%,var(--cold-soft),var(--cold) 75%);color:#fff;border-color:var(--cold)}
.number-cell.mid{background:var(--surface-2);color:var(--text-muted);border-color:var(--border)}
.number-cell.delay{background:radial-gradient(circle at 32% 28%,var(--delay-soft),var(--delay) 75%);color:#fff;border-color:var(--delay)}
.number-cell.never{border-style:dashed;border-width:2px;border-color:var(--text-faint)}
.tooltip{display:none;position:absolute;bottom:calc(100% + 8px);left:50%;transform:translateX(-50%);
  background:var(--surface);border:1px solid var(--gold);border-radius:8px;padding:8px 12px;
  font-family:var(--font-body);font-weight:400;font-size:.72rem;color:var(--text);min-width:160px;max-width:240px;
  box-shadow:0 8px 24px rgba(0,0,0,.6);z-index:10;pointer-events:none;white-space:normal;line-height:1.5;text-align:left}
.number-cell:hover .tooltip{display:block}
.last-draw-wrap{display:flex;flex-wrap:wrap;gap:10px}
.result-ball{width:42px;height:42px;font-size:.95rem}

.recent-list{display:flex;flex-direction:column;gap:8px}
.recent-row{display:grid;grid-template-columns:84px 1fr;gap:14px;align-items:center;padding:10px 12px;
  border-radius:8px;background:var(--surface-2);border:1px solid var(--border-soft)}
.recent-row:nth-child(even){background:var(--surface)}
.rr-meta .rr-num{color:var(--gold);font-family:var(--font-display);font-weight:700;font-size:.95rem}
.rr-meta .rr-date{color:var(--text-muted);font-size:.65rem;margin-top:2px}
.recent-balls{display:flex;flex-wrap:wrap;gap:6px}
.recent-ball{width:30px;height:30px;font-size:.7rem}

.list-stats{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:8px}
.list-row{display:grid;grid-template-columns:40px 1fr auto;gap:10px;align-items:center;padding:8px 10px;
  background:var(--surface-2);border-radius:6px;transition:background .12s ease}
.list-row:hover{background:var(--surface-3)}
.list-row .row-num{font-family:var(--font-display);font-weight:700;font-size:1.05rem;color:var(--gold);text-align:center}
.list-row .row-bar{height:8px;background:rgba(0,0,0,.3);border-radius:4px;overflow:hidden}
.list-row .row-fill{height:100%;background:linear-gradient(90deg,var(--gold),var(--gold-soft));border-radius:4px;transition:width .4s ease}
.list-row .row-fill.cold{background:linear-gradient(90deg,var(--cold),var(--cold-soft))}
.list-row .row-fill.delay{background:linear-gradient(90deg,var(--delay),var(--delay-soft))}
.list-row .row-val{font-family:var(--font-mono);font-size:.75rem;color:var(--text-muted);white-space:nowrap}

.metric-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:12px;margin-top:6px}
.metric-card{background:var(--surface-2);border:1px solid var(--border);border-radius:8px;padding:12px 14px}
.metric-card .lbl{display:flex;align-items:center;gap:6px;font-size:.66rem;color:var(--text-muted);
  text-transform:uppercase;letter-spacing:.5px;font-weight:600}
.metric-card .lbl i{color:var(--gold);font-size:.72rem}
.metric-card .val{font-family:var(--font-display);font-size:1.5rem;font-weight:700;color:var(--gold);margin-top:4px;line-height:1}

.matrix-scroll{overflow-x:auto;-webkit-overflow-scrolling:touch;border-radius:8px}
.supersete-matrix,.supersete-recent-table{border-collapse:collapse;width:100%;min-width:600px}
.supersete-matrix th,.supersete-matrix td,
.supersete-recent-table th,.supersete-recent-table td{border:4px solid var(--bg);padding:10px 8px}
.supersete-matrix th,.supersete-recent-table th{font-family:var(--font-body);font-size:.7rem;
  text-transform:uppercase;letter-spacing:.04em;color:var(--text-muted);font-weight:600;text-align:center}
.supersete-matrix td,.supersete-recent-table td{text-align:center}
.sticky-col{position:sticky;left:0;z-index:2;background:var(--surface-2);text-align:left !important}
.digit-label{font-family:var(--font-display);font-weight:700;color:var(--gold);font-size:1rem}
.digit-label-header{color:var(--text-muted);padding-left:12px}
.heat-cell{font-family:var(--font-mono);font-weight:600;font-size:.85rem;border-radius:6px;min-width:44px;cursor:default;transition:transform .12s ease}
.heat-cell:hover{transform:scale(1.08);position:relative;z-index:3}
.heat-cell.is-overdue{box-shadow:inset 0 0 0 2px var(--delay)}
.digit-pill{display:inline-flex;align-items:center;justify-content:center;width:30px;height:30px;border-radius:50%;
  background:var(--surface);border:1px solid var(--border);font-family:var(--font-display);font-weight:700;color:var(--gold)}
.recent-concurso{color:var(--gold);font-weight:700;font-size:.72rem;white-space:nowrap}
.recent-data{display:block;color:var(--text-muted);font-weight:400;font-size:.63rem;margin-top:2px}

.col-summary-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:12px;margin-top:6px}
.col-summary-card{background:var(--surface-2);border:1px solid var(--border);border-radius:8px;padding:12px 14px}
.col-summary-title{font-family:var(--font-display);font-weight:700;color:var(--gold);font-size:.95rem;margin-bottom:8px}
.col-summary-row{display:flex;align-items:center;gap:8px;font-size:.76rem;color:var(--text-muted);margin-bottom:5px}
.col-summary-row:last-child{margin-bottom:0}
.tag{display:inline-flex;align-items:center;justify-content:center;width:22px;height:22px;border-radius:50%;
  font-family:var(--font-mono);font-weight:700;font-size:.72rem;color:var(--ink);flex-shrink:0}
.tag-hot{background:var(--hot)}.tag-cold{background:var(--cold);color:#fff}.tag-delay{background:var(--delay);color:#fff}

.last-col-strip{display:flex;flex-wrap:wrap;gap:10px}
.last-col-badge{display:flex;flex-direction:column;align-items:center;gap:6px;background:var(--surface-2);
  border:1px solid var(--border);border-radius:8px;padding:10px 14px;min-width:64px}
.last-col-label{font-size:.6rem;text-transform:uppercase;letter-spacing:.04em;color:var(--text-muted)}
.last-col-digit{font-family:var(--font-display);font-weight:800;font-size:1.4rem;color:var(--gold)}

.loading-state{grid-column:1/-1;text-align:center;padding:60px 20px;color:var(--text-muted)}
.spinner{width:34px;height:34px;border-radius:50%;border:3px solid var(--border);border-top-color:var(--gold);
  margin:0 auto 14px;animation:spin .8s linear infinite}
.estado-vazio{grid-column:1/-1;text-align:center;padding:52px 24px;color:var(--text-muted);
  background:var(--surface);border:1px solid var(--border);border-radius:var(--radius)}
.estado-vazio i{color:var(--delay);font-size:1.6rem;display:block;margin-bottom:14px}
.empty-tag{display:inline-block;margin-top:12px;font-size:.7rem;padding:4px 12px;border-radius:20px;
  background:var(--surface-2);border:1px solid var(--border);color:var(--text-muted)}
.rodape-nota{margin-top:26px;color:var(--text-muted);font-size:.78rem;text-align:center;line-height:1.5}

@media(max-width:480px){
  .container{padding:20px 14px 44px}
  .card-box{padding:16px}
  .draw-stage{padding:22px 16px}
  .globo{width:140px;height:140px}
  .numero{font-size:3rem}
}
</style>
</head>
<body>

<header class="header-bar">
  <div class="header-left">
    <a href="index.html" class="btn-back">
      <i class="fa-solid fa-arrow-left"></i> <span data-i18n="back">Voltar</span>
    </a>
    <div class="header-titles">
      <h1 data-i18n="main_title">Sorteio e Estatísticas</h1>
      <p data-i18n="main_subtitle">Simulador de sorteio e análise histórica oficial</p>
    </div>
  </div>
  <div class="lang-select-wrap">
    <i class="fa-solid fa-globe"></i>
    <select id="lang_selector" class="lang-selector" onchange="mudarIdioma(this.value)">
      <option value="pt">Português</option>
      <option value="en">English</option>
      <option value="es">Español</option>
    </select>
  </div>
</header>

<main class="container">
  <!-- TABS -->
  <nav class="tabs-nav">
    <button class="tab-btn active" data-tab="draw" onclick="switchTab('draw', this)">
      <i class="fa-solid fa-dice"></i> <span data-i18n="tab_draw">Sorteio</span>
    </button>
    <button class="tab-btn" data-tab="stats" onclick="switchTab('stats', this)">
      <i class="fa-solid fa-chart-simple"></i> <span data-i18n="tab_stats">Estatísticas</span>
    </button>
  </nav>

  <!-- SHARED LOTTERY NAV -->
  <nav class="lottery-grid-nav">
    <button class="lottery-card-btn btn-megasena active" onclick="selecionarLoteria('megasena','MEGA_SENA','Mega-Sena',this)">
      <span class="game-name">Mega-Sena</span><span class="game-hint" data-hint="megasena"></span></button>
    <button class="lottery-card-btn btn-lotofacil" onclick="selecionarLoteria('lotofacil','LOTOFACIL','Lotofácil',this)">
      <span class="game-name">Lotofácil</span><span class="game-hint" data-hint="lotofacil"></span></button>
    <button class="lottery-card-btn btn-quina" onclick="selecionarLoteria('quina','QUINA','Quina',this)">
      <span class="game-name">Quina</span><span class="game-hint" data-hint="quina"></span></button>
    <button class="lottery-card-btn btn-lotomania" onclick="selecionarLoteria('lotomania','LOTOMANIA','Lotomania',this)">
      <span class="game-name">Lotomania</span><span class="game-hint" data-hint="lotomania"></span></button>
    <button class="lottery-card-btn btn-timemania" onclick="selecionarLoteria('timemania','TIMEMANIA','Timemania',this)">
      <span class="game-name">Timemania</span><span class="game-hint" data-hint="timemania"></span></button>
    <button class="lottery-card-btn btn-duplasena" onclick="selecionarLoteria('duplasena','DUPLA_SENA','Dupla Sena',this)">
      <span class="game-name">Dupla Sena</span><span class="game-hint" data-hint="duplasena"></span></button>
    <button class="lottery-card-btn btn-diadesorte" onclick="selecionarLoteria('diadesorte','DIA_DE_SORTE','Dia de Sorte',this)">
      <span class="game-name">Dia de Sorte</span><span class="game-hint" data-hint="diadesorte"></span></button>
    <button class="lottery-card-btn btn-supersete" onclick="selecionarLoteria('supersete','SUPER_SETE','Super Sete',this)">
      <span class="game-name">Super Sete</span><span class="game-hint" data-hint="supersete"></span></button>
    <button class="lottery-card-btn btn-maismilionaria" onclick="selecionarLoteria('maismilionaria','MAIS_MILIONARIA','+Milionária',this)">
      <span class="game-name">+Milionária</span><span class="game-hint" data-hint="maismilionaria"></span></button>
  </nav>

  <!-- ===================== DRAW PAGE ===================== -->
  <section id="page-draw" class="page-view active">
    <div class="draw-stage">
      <div class="globo" id="globo"><div class="numero" id="currentNumber">--</div></div>
      <div class="draw-info">
        <h2 id="lotteryName">Mega-Sena</h2>
        <p><span data-i18n="need_numbers">Números a sortear:</span> <strong id="totalNumbers">6</strong></p>
        <p id="statusInfo"></p>
        <p id="gamesCount"></p>
      </div>
    </div>

    <div class="card-box" style="margin-bottom:20px;">
      <h3><i class="fa-solid fa-ban"></i> <span data-i18n="exclusions_title">Exclusões</span></h3>
      <p class="card-desc" data-i18n="exclusions_desc">Digite os números a excluir separados por ponto, vírgula ou espaço. Eles nunca serão sorteados e ficarão visíveis abaixo.</p>

      <div id="standardExclusionArea">
        <input type="text" id="excludedInput" class="excluded-input" placeholder="Ex: 5.12.24">
        <p id="exclusionHint" class="exclusion-hint"></p>
      </div>
      <div id="superSeteContainer" style="display:none;"></div>

      <div class="exclusion-actions">
        <button id="btnApplyExclusion" class="btn-secondary">
          <i class="fa-solid fa-check"></i> <span data-i18n="apply_exclusion">Aplicar Exclusões</span>
        </button>
      </div>

      <!-- CHIPS DOS EXCLUÍDOS -->
      <div id="excludedChipsContainer" class="excluded-chips-container"></div>
    </div>

    <div class="draw-actions">
      <button id="btnDrawOne" class="btn-primary"><i class="fa-solid fa-circle-play"></i> Sortear</button>
      <button id="btnDrawAll" class="btn-primary"><i class="fa-solid fa-forward-step"></i> Sortear Todos</button>
      <button id="btnSave" class="btn-secondary" style="display:none;"><i class="fa-solid fa-floppy-disk"></i> Salvar Jogo</button>
      <button id="btnClear" class="btn-secondary"><i class="fa-solid fa-trash"></i> Limpar</button>
    </div>

    <div id="drawnArea" class="drawn-area">
      <h3><i class="fa-solid fa-list-ol"></i> <span data-i18n="drawn_numbers">Números Sorteados</span></h3>
      <div id="drawnNumbersContainer" class="drawn-numbers-container"></div>
      <div id="extraContainer" class="extra-info" style="display:none;">
        <span id="extraLabel"></span> <strong id="extraValue"></strong>
      </div>
    </div>
  </section>

  <!-- ===================== STATS PAGE ===================== -->
  <section id="page-stats" class="page-view">
    <div class="context-bar">
      <div>
        <h2 id="stats_title" data-i18n="select_lottery">Selecione uma loteria</h2>
        <p id="stats_subtitle"></p>
      </div>
      <span id="badge_fonte" data-i18n="waiting">Aguardando...</span>
    </div>
    <div id="stats_container"></div>
    <p class="rodape-nota" data-i18n="footer_note">As estatísticas utilizam exclusivamente os arquivos JSON oficiais do repositório. Resultados passados não garantem resultados futuros; use como referência histórica.</p>
  </section>
</main>

<script>
/* ============================================================
   ESTADO GLOBAL
   ============================================================ */
let currentLang = 'pt';
let currentStatsLottery = 'megasena';
let currentStatsName = 'Mega-Sena';
let currentTab = 'draw';
let statsJaCarregou = false;

/* ============================================================
   TRADUÇÕES UNIFICADAS
   ============================================================ */
const i18n = {
  pt: {
    back:'Voltar', main_title:'Sorteio e Estatísticas', main_subtitle:'Simulador de sorteio e análise histórica oficial',
    tab_draw:'Sorteio', tab_stats:'Estatísticas',
    need_numbers:'Números a sortear:', exclusions_title:'Exclusões',
    exclusions_desc:'Digite os números a excluir separados por ponto, vírgula ou espaço. Eles nunca serão sorteados e ficarão visíveis abaixo.',
    apply_exclusion:'Aplicar Exclusões', drawn_numbers:'Números Sorteados',
    page_title:'Estatísticas das loterias', page_subtitle:'Análise histórica oficial via repositório',
    select_lottery:'Selecione uma loteria', waiting:'Aguardando...',
    checking:'Lendo histórico oficial...', loading:'Calculando estatísticas...',
    no_history:'Nenhum histórico encontrado para', empty_warning:'Arquivo vazio ou ausente',
    analyzed_total:(t)=>`Total de ${t} concursos oficiais analisados`,
    source_label:(o,n)=>`Base: ${o} · Último: Concurso ${n}`,
    freq_title:'Frequência dos Números', freq_desc:'Histórico completo de saídas por dezena calculado sobre toda a base oficial.',
    last_draw_title:(n)=>`Último Concurso (${n})`, last_draw_desc:'Resultado oficial apurado no sorteio mais recente.',
    top_freq_title:'Top 10 Mais Frequentes', top_freq_desc:'Dezenas que mais saíram na história completa.',
    top_cold_title:'Top 10 Menos Frequentes', top_cold_desc:'Dezenas que menos apareceram no histórico.',
    top_delay_title:'Top 10 Mais Atrasados', top_delay_desc:'Dezenas que estão há mais tempo sem sair.',
    metrics_title:'Métricas Gerais', metrics_desc:'Dados consolidados sobre toda a base analisada.',
    recent_title:'Últimos 10 Concursos', recent_desc:'Histórico recente com destaque para números quentes.',
    hot_num:'Número quente', cold_num:'Número frio', mid_num:'Frequência média', delay_num:'Em atraso prolongado',
    never_label:'Nunca saiu', never_drawn:'Nunca sorteado na base.',
    times_drawn:(c)=>`Saiu ${c} ${c===1?'vez':'vezes'}.`,
    last_draws_label:'Concursos recentes: ', number_label:'Número ',
    footer_note:'As estatísticas utilizam exclusivamente os arquivos JSON oficiais do repositório. Resultados passados não garantem resultados futuros; use como referência histórica.',
    metric_soma:'Soma Média', metric_pares:'Média Pares', metric_impares:'Média Ímpares',
    metric_primos:'Média Primos', metric_repetidos:'Repetem Anterior',
    metric_seq:'Maior Sequência', metric_amplitude:'Amplitude Média',
    metric_media:'Frequência Média', metric_atraso_max:'Maior Atraso',
    supersete_title:'Super Sete por Coluna',
    supersete_desc:'Cada célula mostra quantas vezes aquele dígito já saiu naquela coluna. Quanto mais dourada, mais frequente.',
    supersete_summary_title:'Resumo por Coluna', supersete_summary_desc:'Dígito mais quente, mais frio e mais atrasado em cada uma das 7 colunas.',
    coluna_label:'Coluna', digit_label:'Dígito', col_concurso:'Concurso',
    summary_hot:(f)=>`Mais sai (${f}x)`, summary_cold:(f)=>`Menos sai (${f}x)`,
    summary_delay:(a)=>`Atrasado há ${a} concurso${a===1?'':'s'}`,
    heat_tooltip:(f,a)=>f===0?'Nunca saiu nesta coluna.':`Saiu ${f}x nesta coluna · Atraso atual: ${a}.`,
    legend_heat:'Mais dourado = mais frequente', legend_overdue:'Anel vermelho = mais atrasado da coluna',
    numeros_hint:(n)=>`${n} números`, hint_supersete:'7 colunas · 0–9',
    /* Draw */
    megasena:'Mega-Sena', lotofacil:'Lotofácil', quina:'Quina', lotomania:'Lotomania', timemania:'Timemania',
    duplasena:'Dupla Sena', diadesorte:'Dia de Sorte', supersete:'Super Sete', maismilionaria:'+Milionária',
    months:['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'],
    draw:'Sortear', drawAll:'Sortear Todos', remaining:'Sortear Restantes', newDraw:'Novo Sorteio',
    save:'Salvar Jogo', clear:'Limpar', clearExclusion:'Limpar Exclusões',
    noNumbers:'Não há números disponíveis!', noValidNumbers:'Nenhum número válido encontrado!',
    excludedSuccess:'números excluídos!', exclusionRemoved:'Exclusões removidas!', exclusionCleared:'Exclusões limpas!',
    complete:'Sorteio completo!', saved:'Jogo salvo com sucesso!', noSaved:'Nenhum número sorteado para salvar!',
    col:'COLUNA', colFull:'Coluna', extraTrevo:'Trevo da Sorte:', extraMonth:'Mês da Sorte:',
    extraTeam:'Time do Coração:', games:'Jogos',
    no_excluded:'Nenhum número excluído até agora.', excluded_label:'Excluídos:'
  },
  en: {
    back:'Back', main_title:'Draw & Statistics', main_subtitle:'Draw simulator and official historical analysis',
    tab_draw:'Draw', tab_stats:'Statistics',
    need_numbers:'Numbers to draw:', exclusions_title:'Exclusions',
    exclusions_desc:'Type numbers to exclude separated by dot, comma or space. They will never be drawn and remain visible below.',
    apply_exclusion:'Apply Exclusions', drawn_numbers:'Drawn Numbers',
    page_title:'Lottery Statistics', page_subtitle:'Official historical analysis via repository',
    select_lottery:'Select a lottery', waiting:'Waiting...',
    checking:'Reading official history...', loading:'Calculating statistics...',
    no_history:'No history found for', empty_warning:'File empty or missing',
    analyzed_total:(t)=>`Total of ${t} official draws analyzed`,
    source_label:(o,n)=>`Source: ${o} · Last: Draw ${n}`,
    freq_title:'Number Frequency', freq_desc:'Complete historical draw count per number across the entire official dataset.',
    last_draw_title:(n)=>`Last Draw (${n})`, last_draw_desc:'Official result from the most recent draw.',
    top_freq_title:'Top 10 Most Frequent', top_freq_desc:'Numbers that have appeared the most.',
    top_cold_title:'Top 10 Least Frequent', top_cold_desc:'Numbers that have appeared the least.',
    top_delay_title:'Top 10 Most Overdue', top_delay_desc:"Numbers that haven't appeared in the longest time.",
    metrics_title:'General Metrics', metrics_desc:'Consolidated data from the entire analyzed dataset.',
    recent_title:'Last 10 Draws', recent_desc:'Recent history with hot numbers highlighted.',
    hot_num:'Hot number', cold_num:'Cold number', mid_num:'Average frequency', delay_num:'Overdue',
    never_label:'Never drawn', never_drawn:'Never drawn in this dataset.',
    times_drawn:(c)=>`Drawn ${c} ${c===1?'time':'times'}.`,
    last_draws_label:'Recent draws: ', number_label:'Number ',
    footer_note:"Statistics use only the repository's official JSON files. Past results don't guarantee future outcomes — use this data as historical reference only.",
    metric_soma:'Avg Sum', metric_pares:'Avg Even', metric_impares:'Avg Odd',
    metric_primos:'Avg Primes', metric_repetidos:'Repeat Prev.',
    metric_seq:'Max Sequence', metric_amplitude:'Avg Range',
    metric_media:'Avg Frequency', metric_atraso_max:'Max Delay',
    supersete_title:'Super Sete by Column',
    supersete_desc:'Each cell shows how many times that digit has been drawn in that column. The more gold, the more frequent.',
    supersete_summary_title:'Column Summary', supersete_summary_desc:'Hottest, coldest and most overdue digit in each of the 7 columns.',
    coluna_label:'Column', digit_label:'Digit', col_concurso:'Draw',
    summary_hot:(f)=>`Most frequent (${f}x)`, summary_cold:(f)=>`Least frequent (${f}x)`,
    summary_delay:(a)=>`Overdue for ${a} draw${a===1?'':'s'}`,
    heat_tooltip:(f,a)=>f===0?'Never drawn in this column.':`Drawn ${f}x in this column · Current gap: ${a}.`,
    legend_heat:'More gold = more frequent', legend_overdue:'Red ring = most overdue in column',
    numeros_hint:(n)=>`${n} numbers`, hint_supersete:'7 columns · 0–9',
    megasena:'Mega-Sena', lotofacil:'Lotofácil', quina:'Quina', lotomania:'Lotomania', timemania:'Timemania',
    duplasena:'Dupla Sena', diadesorte:'Dia de Sorte', supersete:'Super Sete', maismilionaria:'+Milionária',
    months:['January','February','March','April','May','June','July','August','September','October','November','December'],
    draw:'Draw', drawAll:'Draw All', remaining:'Draw Remaining', newDraw:'New Draw',
    save:'Save Game', clear:'Clear', clearExclusion:'Clear Exclusions',
    noNumbers:'No numbers available!', noValidNumbers:'No valid numbers found!',
    excludedSuccess:'numbers excluded!', exclusionRemoved:'Exclusions removed!', exclusionCleared:'Exclusions cleared!',
    complete:'Draw complete!', saved:'Game saved successfully!', noSaved:'No drawn numbers to save!',
    col:'COLUMN', colFull:'Column', extraTrevo:'Lucky Clover:', extraMonth:'Lucky Month:',
    extraTeam:'Heart Team:', games:'Games',
    no_excluded:'No numbers excluded yet.', excluded_label:'Excluded:'
  },
  es: {
    back:'Volver', main_title:'Sorteo y Estadísticas', main_subtitle:'Simulador de sorteo y análisis histórico oficial',
    tab_draw:'Sorteo', tab_stats:'Estadísticas',
    need_numbers:'Números a sortear:', exclusions_title:'Exclusiones',
    exclusions_desc:'Escriba números a excluir separados por punto, coma o espacio. Nunca serán sorteados y quedarán visibles abajo.',
    apply_exclusion:'Aplicar Exclusiones', drawn_numbers:'Números Sorteados',
    page_title:'Estadísticas de Loterías', page_subtitle:'Análisis histórico oficial mediante repositorio',
    select_lottery:'Seleccione una lotería', waiting:'Esperando...',
    checking:'Leyendo historial oficial...', loading:'Calculando estadísticas...',
    no_history:'No se encontró historial para', empty_warning:'Archivo vacío o ausente',
    analyzed_total:(t)=>`Total de ${t} sorteos oficiales analizados`,
    source_label:(o,n)=>`Base: ${o} · Último: Sorteo ${n}`,
    freq_title:'Frecuencia de Números', freq_desc:'Historial completo de salidas por número en toda la base oficial.',
    last_draw_title:(n)=>`Último Sorteo (${n})`, last_draw_desc:'Resultado oficial del sorteo más reciente.',
    top_freq_title:'Top 10 Más Frecuentes', top_freq_desc:'Números que más aparecieron.',
    top_cold_title:'Top 10 Menos Frecuentes', top_cold_desc:'Números que menos aparecieron.',
    top_delay_title:'Top 10 Más Atrasados', top_delay_desc:'Números sin salir hace más tiempo.',
    metrics_title:'Métricas Generales', metrics_desc:'Datos consolidados de toda la base analizada.',
    recent_title:'Últimos 10 Sorteos', recent_desc:'Historial reciente con números calientes destacados.',
    hot_num:'Número caliente', cold_num:'Número frío', mid_num:'Frecuencia media', delay_num:'Atrasado',
    never_label:'Nunca salió', never_drawn:'Nunca sorteado en la base.',
    times_drawn:(c)=>`Salió ${c} ${c===1?'vez':'veces'}.`,
    last_draws_label:'Sorteos recientes: ', number_label:'Número ',
    footer_note:'Las estadísticas usan exclusivamente los archivos JSON oficiales del repositorio. Los resultados pasados no garantizan resultados futuros; úselos solo como referencia histórica.',
    metric_soma:'Suma Media', metric_pares:'Media Pares', metric_impares:'Media Impares',
    metric_primos:'Media Primos', metric_repetidos:'Repiten Anterior',
    metric_seq:'Secuencia Máx.', metric_amplitude:'Amplitud Media',
    metric_media:'Frecuencia Media', metric_atraso_max:'Mayor Atraso',
    supersete_title:'Super Sete por Columna',
    supersete_desc:'Cada celda muestra cuántas veces salió ese dígito en esa columna. Cuanto más dorado, más frecuente.',
    supersete_summary_title:'Resumen por Columna', supersete_summary_desc:'Dígito más caliente, más frío y más atrasado en cada una de las 7 columnas.',
    coluna_label:'Columna', digit_label:'Dígito', col_concurso:'Sorteo',
    summary_hot:(f)=>`Más sale (${f}x)`, summary_cold:(f)=>`Menos sale (${f}x)`,
    summary_delay:(a)=>`Atrasado ${a} sorteo${a===1?'':'s'}`,
    heat_tooltip:(f,a)=>f===0?'Nunca salió en esta columna.':`Salió ${f}x en esta columna · Atraso actual: ${a}.`,
    legend_heat:'Más dorado = más frecuente', legend_overdue:'Anillo rojo = más atrasado de la columna',
    numeros_hint:(n)=>`${n} números`, hint_supersete:'7 columnas · 0–9',
    megasena:'Mega-Sena', lotofacil:'Lotofácil', quina:'Quina', lotomania:'Lotomania', timemania:'Timemania',
    duplasena:'Dupla Sena', diadesorte:'Dia de Sorte', supersete:'Super Sete', maismilionaria:'+Milionária',
    months:['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'],
    draw:'Sortear', drawAll:'Sortear Todos', remaining:'Sortear Restantes', newDraw:'Nuevo Sorteo',
    save:'Guardar Juego', clear:'Limpiar', clearExclusion:'Limpiar Exclusiones',
    noNumbers:'¡No hay números disponibles!', noValidNumbers:'¡No se encontraron números válidos!',
    excludedSuccess:'números excluidos!', exclusionRemoved:'¡Exclusiones eliminadas!', exclusionCleared:'¡Exclusiones limpias!',
    complete:'¡Sorteo completo!', saved:'¡Juego guardado con éxito!', noSaved:'¡Ningún número sorteado para guardar!',
    col:'COLUMNA', colFull:'Columna', extraTrevo:'Trébol de la Suerte:', extraMonth:'Mes de la Suerte:',
    extraTeam:'Equipo del Corazón:', games:'Juegos',
    no_excluded:'Ningún número excluido todavía.', excluded_label:'Excluidos:'
  }
};
function t(key){ return i18n[currentLang][key] || key; }

/* ============================================================
   CONFIG LOTERIAS (draw)
   ============================================================ */
const LOTTERY_TYPES = {
  MEGA_SENA:{id:'MEGA_SENA',nameKey:'megasena',minNumber:1,maxNumber:60,minNumbersToPick:6,color:'#209869',icon:'fa-trophy',shortName:'Mega-Sena'},
  LOTOFACIL:{id:'LOTOFACIL',nameKey:'lotofacil',minNumber:1,maxNumber:25,minNumbersToPick:15,color:'#930089',icon:'fa-clover',shortName:'Lotofácil'},
  QUINA:{id:'QUINA',nameKey:'quina',minNumber:1,maxNumber:80,minNumbersToPick:5,color:'#260085',icon:'fa-star',shortName:'Quina'},
  LOTOMANIA:{id:'LOTOMANIA',nameKey:'lotomania',minNumber:0,maxNumber:99,minNumbersToPick:50,color:'#F78100',icon:'fa-dice',shortName:'Lotomania'},
  TIMEMANIA:{id:'TIMEMANIA',nameKey:'timemania',minNumber:1,maxNumber:80,minNumbersToPick:10,hasTeam:true,color:'#2ecc71',icon:'fa-clock',shortName:'Timemania'},
  DUPLA_SENA:{id:'DUPLA_SENA',nameKey:'duplasena',minNumber:1,maxNumber:50,minNumbersToPick:6,color:'#a61324',icon:'fa-copy',shortName:'Dupla Sena'},
  DIA_DE_SORTE:{id:'DIA_DE_SORTE',nameKey:'diadesorte',minNumber:1,maxNumber:31,minNumbersToPick:7,hasLuckyMonth:true,color:'#cb8322',icon:'fa-sun',shortName:'Dia de Sorte'},
  SUPER_SETE:{id:'SUPER_SETE',nameKey:'supersete',minNumber:0,maxNumber:9,minNumbersToPick:7,isSuperSete:true,color:'#a8cf45',icon:'fa-seven',shortName:'Super Sete'},
  MAIS_MILIONARIA:{id:'MAIS_MILIONARIA',nameKey:'maismilionaria',minNumber:1,maxNumber:50,minNumbersToPick:6,hasExtraNumbers:true,minExtraNumber:1,maxExtraNumber:6,totalExtraNumbersToPick:2,color:'#1b3582',icon:'fa-gem',shortName:'+Milionária'}
};
const TEAMS=['Rio Branco-AC','CRB','CSA','Nacional-AM','São Raimundo-AM','Trem','Bahia','Vitória','Fluminense de Feira','Ceará','Fortaleza','Ferroviário','Brasiliense','Gama','Desportiva','Rio Branco-ES','Goiás','Atlético-GO','Vila Nova','Goiânia','Moto Club','Sampaio Corrêa','Atlético-MG','Cruzeiro','América-MG','Ipatinga','Tupi','Uberlândia','Villa Nova','Operário-MS','Mixto','União Rondonópolis','Paysandu','Remo','Tuna Luso','Botafogo-PB','Treze','Campinense','Sport','Santa Cruz','Náutico','River-PI','Flamengo-PI','Athletico-PR','Coritiba','Paraná','Londrina','Flamengo','Vasco','Fluminense','Botafogo','America-RJ','Americano','Bangu','Olaria','Volta Redonda','ABC','América-RN','Ji-Paraná','Roraima','Grêmio','Internacional','Juventude','Caxias','Figueirense','Avaí','Criciúma','Joinville','Sergipe','Confiança','Corinthians','Palmeiras','Santos','São Paulo','Guarani','Ponte Preta','Portuguesa','Bragantino','Ituano','Inter de Limeira','Juventus-SP','Marília','Mogi Mirim','Santo André','São Caetano','Botafogo-SP','XV de Piracicaba','Palmas'];

/* ============================================================
   ESTADO DO DRAW
   ============================================================ */
let currentLotteryId='MEGA_SENA';
let config=LOTTERY_TYPES.MEGA_SENA;
let availableNumbers=[];
let drawnNumbers=[];
let extraNumbers=[];
let luckyMonth=0;
let heartTeam='';
let excludedNumbers=new Set();
let superSeteExclusions={}; // {1:Set([2,5]), 2:Set([...]), ...}
let isGameFinished=false;
let gamesCompleted=0;
let isDrawing=false;
let isSuperSete=false;
let animationInterval=null;

/* DOM refs */
const globo=document.getElementById('globo');
const currentNumberEl=document.getElementById('currentNumber');
const lotteryName=document.getElementById('lotteryName');
const totalNumbers=document.getElementById('totalNumbers');
const statusInfo=document.getElementById('statusInfo');
const gamesCount=document.getElementById('gamesCount');
const btnDrawOne=document.getElementById('btnDrawOne');
const btnDrawAll=document.getElementById('btnDrawAll');
const btnSave=document.getElementById('btnSave');
const btnClear=document.getElementById('btnClear');
const drawnArea=document.getElementById('drawnArea');
const drawnContainer=document.getElementById('drawnNumbersContainer');
const extraContainer=document.getElementById('extraContainer');
const extraLabel=document.getElementById('extraLabel');
const extraValue=document.getElementById('extraValue');
const excludedInput=document.getElementById('excludedInput');
const exclusionHint=document.getElementById('exclusionHint');
const btnApplyExclusion=document.getElementById('btnApplyExclusion');
const superSeteContainer=document.getElementById('superSeteContainer');
const excludedChipsContainer=document.getElementById('excludedChipsContainer');
const standardExclusionArea=document.getElementById('standardExclusionArea');

/* ============================================================
   TABS
   ============================================================ */
function switchTab(tab, btn){
  currentTab=tab;
  document.querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('active'));
  if(btn) btn.classList.add('active');
  document.querySelectorAll('.page-view').forEach(p=>p.classList.remove('active'));
  if(tab==='draw') document.getElementById('page-draw').classList.add('active');
  else document.getElementById('page-stats').classList.add('active');
  if(tab==='stats') carregarEstatisticas(currentStatsLottery, currentStatsName);
}

/* ============================================================
   NAVEGAÇÃO DE LOTERIAS (compartilhada)
   ============================================================ */
function selecionarLoteria(statsKey, drawKey, displayName, btn){
  // Atualiza estado de estatísticas
  currentStatsLottery = statsKey;
  currentStatsName = displayName;

  // Atualiza botão ativo
  document.querySelectorAll('.lottery-card-btn').forEach(b=>b.classList.remove('active'));
  if(btn) btn.classList.add('active');

  // Atualiza draw
  if(!isDrawing) selectLotteryDraw(drawKey);

  // Se estamos na aba de estatísticas, recarrega
  if(currentTab==='stats') carregarEstatisticas(statsKey, displayName);
}

/* ============================================================
   DRAW — seleção
   ============================================================ */
function selectLotteryDraw(id){
  if(isDrawing) return;
  currentLotteryId=id;
  config=LOTTERY_TYPES[id];
  isSuperSete=config.isSuperSete||false;

  if(lotteryName) lotteryName.textContent=t(config.nameKey);
  if(totalNumbers) totalNumbers.textContent=config.minNumbersToPick;

  excludedNumbers=new Set();
  superSeteExclusions={};

  if(isSuperSete){
    if(standardExclusionArea) standardExclusionArea.style.display='none';
    if(btnApplyExclusion) btnApplyExclusion.style.display='none';
    if(superSeteContainer){
      superSeteContainer.style.display='block';
      buildSuperSeteExclusionUI();
    }
  } else {
    if(superSeteContainer) superSeteContainer.style.display='none';
    if(standardExclusionArea) standardExclusionArea.style.display='block';
    if(btnApplyExclusion){
      btnApplyExclusion.style.display='inline-flex';
      btnApplyExclusion.innerHTML=`<i class="fa-solid fa-check"></i> <span>${t('apply_exclusion')}</span>`;
    }
    if(excludedInput) excludedInput.value='';
    if(exclusionHint){
      const ex = config.id==='LOTOMANIA' ? '05.12.24' : `${config.minNumber}.${config.minNumber+1}`;
      exclusionHint.textContent=`Digite os números separados por ponto, vírgula ou espaço.\nExemplo: ${ex}`;
    }
  }
  resetGame();
}

function resetGame(){
  drawnNumbers=[]; extraNumbers=[]; luckyMonth=0; heartTeam='';
  isGameFinished=false; isDrawing=false;
  refreshStandardPool();
  if(currentNumberEl){
    currentNumberEl.textContent='--'; currentNumberEl.className='numero'; currentNumberEl.style.transform='scale(1)';
  }
  if(globo){ globo.className='globo'; globo.style.transform='rotate(0deg)'; }
  if(drawnArea) drawnArea.classList.remove('visible');
  if(extraContainer) extraContainer.style.display='none';
  if(btnSave) btnSave.style.display='none';
  if(btnDrawOne){
    btnDrawOne.disabled=false;
    btnDrawOne.innerHTML=`<i class="fa-solid fa-circle-play"></i> ${isSuperSete?t('colFull')+' 1':t('draw')}`;
  }
  if(btnDrawAll){
    btnDrawAll.disabled=false;
    btnDrawAll.innerHTML=`<i class="fa-solid fa-forward-step"></i> ${t('drawAll')}`;
  }
  updateExcludedChips();
  updateStatus();
}

function refreshStandardPool(){
  availableNumbers=[];
  for(let i=config.minNumber;i<=config.maxNumber;i++){
    if(!excludedNumbers.has(i) && !drawnNumbers.includes(i)) availableNumbers.push(i);
  }
}

function formatNumber(num){
  if(isSuperSete) return num.toString();
  if(config.id==='LOTOMANIA' && num===0) return '00';
  return num<10?'0'+num:num.toString();
}
function getRandomNumber(min,max){ return Math.floor(Math.random()*(max-min+1))+min; }

/* ============================================================
   LEITURA E APLICAÇÃO DE EXCLUSÕES
   (CORRIGIDO: nome sem espaço — bug original)
   ============================================================ */
function lerEAplicarExclusoes(){
  if(isSuperSete) return;
  const text=excludedInput?excludedInput.value.trim():'';
  if(!text){
    excludedNumbers.clear();
    refreshStandardPool();
    updateExcludedChips();
    return;
  }
  const numbers=new Set();
  const tokens=text.split(/[.,\s]+/).filter(x=>x!=='');
  for(const token of tokens){
    const num=parseInt(token,10);
    if(!isNaN(num) && num>=config.minNumber && num<=config.maxNumber) numbers.add(num);
  }
  excludedNumbers=numbers;
  refreshStandardPool();
  drawnNumbers=drawnNumbers.filter(n=>!excludedNumbers.has(n));
  updateDrawnNumbersDisplay();
  updateExcludedChips();
}

/* ============================================================
   RENDER DOS CHIPS DE EXCLUÍDOS
   ============================================================ */
function updateExcludedChips(){
  if(!excludedChipsContainer) return;
  if(isSuperSete){
    // Mostra exclusões por coluna
    let html='';
    let temAlgo=false;
    for(let c=1;c<=7;c++){
      const set=superSeteExclusions[c]||new Set();
      if(set.size>0){
        temAlgo=true;
        html+=`<span class="excluded-chip-label">${t('colFull')} ${c}:</span>`;
        [...set].sort((a,b)=>a-b).forEach(d=>{
          html+=`<span class="excluded-chip">${d}</span>`;
        });
      }
    }
    excludedChipsContainer.innerHTML = temAlgo?html:`<span class="excluded-empty">${t('no_excluded')}</span>`;
  } else {
    if(excludedNumbers.size===0){
      excludedChipsContainer.innerHTML=`<span class="excluded-empty">${t('no_excluded')}</span>`;
    } else {
      const sorted=[...excludedNumbers].sort((a,b)=>a-b);
      excludedChipsContainer.innerHTML=
        `<span class="excluded-chip-label">${t('excluded_label')}</span>`+
        sorted.map(n=>`<span class="excluded-chip">${formatNumber(n)}</span>`).join('');
    }
  }
}

/* ============================================================
   ANIMAÇÃO DO GLOBO
   ============================================================ */
function startGlobeAnimation(finalNumber, callback){
  if(animationInterval){ clearInterval(animationInterval); animationInterval=null; }
  const isSS=isSuperSete;
  const min=config.minNumber, max=config.maxNumber;
  let count=0;
  const totalSteps=25+Math.floor(Math.random()*15);

  animationInterval=setInterval(()=>{
    count++;
    let temp=isSS?Math.floor(Math.random()*10):Math.floor(Math.random()*(max-min+1))+min;
    if(currentNumberEl){
      currentNumberEl.textContent=formatNumber(temp);
      currentNumberEl.className='numero girando';
      currentNumberEl.style.transform=`scale(${1+Math.sin(count*0.5)*0.1})`;
    }
    if(globo) globo.className='globo girando';

    if(count>=totalSteps){
      clearInterval(animationInterval); animationInterval=null;
      if(currentNumberEl){
        currentNumberEl.textContent=formatNumber(finalNumber);
        currentNumberEl.className='numero';
        currentNumberEl.style.transform='scale(1.2)';
        setTimeout(()=>{ if(currentNumberEl) currentNumberEl.style.transform='scale(1)'; },300);
      }
      if(globo) globo.className='globo';
      if(callback) callback();
    }
  },isSS?60:50);
}

/* ============================================================
   SORTEAR 1
   ============================================================ */
function drawOne(){
  if(isDrawing) return;
  if(isGameFinished){ resetGame(); return; }
  lerEAplicarExclusoes();
  if(isSuperSete) drawSuperSeteOne(); else drawStandardOne();
}

function drawSuperSeteOne(){
  const col=drawnNumbers.length+1;
  if(col>7) return;
  const excludedInColumn=superSeteExclusions[col]||new Set();
  const available=[];
  for(let i=0;i<=9;i++) if(!excludedInColumn.has(i)) available.push(i);
  if(available.length===0){ showToast(`${t('colFull')} ${col} — ${t('noNumbers')}`); return; }

  isDrawing=true; btnDrawOne.disabled=true; btnDrawAll.disabled=true;
  const selected=available[Math.floor(Math.random()*available.length)];
  startGlobeAnimation(selected,()=>{
    drawnNumbers.push(selected);
    updateDrawnNumbersDisplay();
    isDrawing=false; btnDrawOne.disabled=false; btnDrawAll.disabled=false;
    if(drawnNumbers.length>=config.minNumbersToPick) completeGame();
    updateStatus();
  });
}

function drawStandardOne(){
  if(availableNumbers.length===0){ showToast(t('noNumbers')); return; }
  isDrawing=true; btnDrawOne.disabled=true; btnDrawAll.disabled=true;
  const idx=Math.floor(Math.random()*availableNumbers.length);
  const selected=availableNumbers[idx];
  availableNumbers.splice(idx,1);
  startGlobeAnimation(selected,()=>{
    drawnNumbers.push(selected);
    updateDrawnNumbersDisplay();
    isDrawing=false; btnDrawOne.disabled=false; btnDrawAll.disabled=false;
    if(drawnNumbers.length>=config.minNumbersToPick) completeGame();
    updateStatus();
  });
}

/* ============================================================
   SORTEAR TODOS
   ============================================================ */
function drawAll(){
  if(isDrawing) return;
  if(isGameFinished){ resetGame(); return; }
  lerEAplicarExclusoes();
  isDrawing=true; btnDrawOne.disabled=true; btnDrawAll.disabled=true;
  const remaining=config.minNumbersToPick-drawnNumbers.length;
  if(isSuperSete) drawSuperSeteAll(remaining); else drawStandardAll(remaining);
}

function drawSuperSeteAll(remaining){
  let col=drawnNumbers.length+1, drawn=0;
  function next(){
    if(drawn>=remaining||col>7){
      isDrawing=false; btnDrawOne.disabled=false; btnDrawAll.disabled=false;
      if(drawnNumbers.length>=config.minNumbersToPick) completeGame();
      updateStatus(); return;
    }
    const excluded=superSeteExclusions[col]||new Set();
    const available=[];
    for(let i=0;i<=9;i++) if(!excluded.has(i)) available.push(i);
    if(available.length===0){
      showToast(`${t('colFull')} ${col} — ${t('noNumbers')}`);
      isDrawing=false; btnDrawOne.disabled=false; btnDrawAll.disabled=false; return;
    }
    const selected=available[Math.floor(Math.random()*available.length)];
    startGlobeAnimation(selected,()=>{
      drawnNumbers.push(selected); drawn++; col++;
      updateDrawnNumbersDisplay();
      setTimeout(next,200);
    });
  }
  next();
}

function drawStandardAll(remaining){
  let drawn=0;
  function next(){
    if(drawn>=remaining||availableNumbers.length===0){
      isDrawing=false; btnDrawOne.disabled=false; btnDrawAll.disabled=false;
      if(drawnNumbers.length>=config.minNumbersToPick) completeGame();
      updateStatus(); return;
    }
    const idx=Math.floor(Math.random()*availableNumbers.length);
    const selected=availableNumbers[idx];
    availableNumbers.splice(idx,1);
    startGlobeAnimation(selected,()=>{
      drawnNumbers.push(selected); drawn++;
      updateDrawnNumbersDisplay();
      setTimeout(next,200);
    });
  }
  next();
}

function completeGame(){
  isGameFinished=true; gamesCompleted++;
  if(config.hasExtraNumbers) sortExtraNumbers();
  if(config.hasLuckyMonth) sortLuckyMonth();
  if(config.hasTeam) sortHeartTeam();
  updateExtraInfoDisplay();
  btnDrawOne.innerHTML=`<i class="fa-solid fa-rotate-right"></i> ${t('newDraw')}`;
  btnDrawAll.innerHTML=`<i class="fa-solid fa-rotate-right"></i> ${t('newDraw')}`;
  if(btnSave) btnSave.style.display='inline-flex';
  showToast('✅ '+t('complete'));
}

function sortExtraNumbers(){
  extraNumbers=[];
  while(extraNumbers.length<config.totalExtraNumbersToPick){
    const n=getRandomNumber(config.minExtraNumber,config.maxExtraNumber);
    if(!extraNumbers.includes(n)) extraNumbers.push(n);
  }
  extraNumbers.sort((a,b)=>a-b);
}
function sortLuckyMonth(){ luckyMonth=getRandomNumber(1,12); }
function sortHeartTeam(){ heartTeam=TEAMS[Math.floor(Math.random()*TEAMS.length)]; }

function updateDrawnNumbersDisplay(){
  if(!drawnArea||!drawnContainer) return;
  if(drawnNumbers.length>0){
    drawnArea.classList.add('visible');
    const sorted=[...drawnNumbers].sort((a,b)=>a-b);
    drawnContainer.innerHTML=sorted.map(n=>
      `<div class="ball" style="background:${config.color};">${formatNumber(n)}</div>`
    ).join('');
    isGameFinished=drawnNumbers.length>=config.minNumbersToPick;
    if(isGameFinished){
      btnDrawOne.innerHTML=`<i class="fa-solid fa-rotate-right"></i> ${t('newDraw')}`;
      btnDrawAll.innerHTML=`<i class="fa-solid fa-rotate-right"></i> ${t('newDraw')}`;
      if(btnSave) btnSave.style.display='inline-flex';
    } else {
      btnDrawOne.innerHTML=`<i class="fa-solid fa-circle-play"></i> ${isSuperSete?t('colFull')+' '+(drawnNumbers.length+1):t('draw')}`;
      const faltam=config.minNumbersToPick-drawnNumbers.length;
      btnDrawAll.innerHTML=`<i class="fa-solid fa-forward-step"></i> ${t('remaining')} (${faltam})`;
      if(btnSave) btnSave.style.display='none';
    }
  } else {
    drawnArea.classList.remove('visible');
    if(btnSave) btnSave.style.display='none';
  }
  updateStatus();
}

function updateExtraInfoDisplay(){
  if(!extraContainer||!extraLabel||!extraValue) return;
  if(config.hasExtraNumbers&&extraNumbers.length>0){
    extraContainer.style.display='block';
    extraLabel.textContent=t('extraTrevo');
    extraValue.textContent=extraNumbers.map(n=>formatNumber(n)).join(' - ');
  } else if(config.hasLuckyMonth&&luckyMonth>0){
    extraContainer.style.display='block';
    extraLabel.textContent=t('extraMonth');
    extraValue.textContent=i18n[currentLang].months[luckyMonth-1];
  } else if(config.hasTeam&&heartTeam){
    extraContainer.style.display='block';
    extraLabel.textContent=t('extraTeam');
    extraValue.textContent=heartTeam;
  } else {
    extraContainer.style.display='none';
  }
}

function updateStatus(){
  if(statusInfo) statusInfo.innerHTML=`<strong>${t(config.nameKey)}</strong> (${drawnNumbers.length}/${config.minNumbersToPick})`;
  if(gamesCount) gamesCount.textContent=`${t('games')}: ${gamesCompleted}`;
}

/* ============================================================
   BOTÃO APLICAR EXCLUSÕES
   ============================================================ */
function applyExclusions(showToastMsg=false){
  if(isSuperSete){ return; } // Super Sete é aplicado em tempo real pelos botões

  const text=excludedInput?excludedInput.value.trim():'';
  if(!text){
    excludedNumbers.clear();
    refreshStandardPool();
    drawnNumbers=drawnNumbers.filter(n=>!excludedNumbers.has(n));
    updateDrawnNumbersDisplay();
    updateExcludedChips();
    if(showToastMsg) showToast('✅ '+t('exclusionRemoved'));
    return;
  }
  const numbers=new Set();
  const tokens=text.split(/[.,\s]+/).filter(x=>x!=='');
  for(const token of tokens){
    const num=parseInt(token,10);
    if(!isNaN(num)&&num>=config.minNumber&&num<=config.maxNumber) numbers.add(num);
  }
  if(numbers.size===0){
    if(showToastMsg) showToast('⚠️ '+t('noValidNumbers'));
    return;
  }
  excludedNumbers=numbers;
  refreshStandardPool();
  drawnNumbers=drawnNumbers.filter(n=>!excludedNumbers.has(n));
  updateDrawnNumbersDisplay();
  updateExcludedChips();
  if(showToastMsg) showToast(`✅ ${excludedNumbers.size} ${t('excludedSuccess')}`);
}

/* ============================================================
   UI SUPER SETE — EXCLUSÕES POR COLUNA
   Agora cada dígito é um botão clicável (vermelho = excluído)
   ============================================================ */
function buildSuperSeteExclusionUI(){
  if(!superSeteContainer) return;
  superSeteContainer.innerHTML='';
  const grid=document.createElement('div');
  grid.className='ss-excl-grid';

  for(let col=1;col<=7;col++){
    const card=document.createElement('div');
    card.className='ss-col-card';
    const title=document.createElement('div');
    title.className='ss-col-title';
    title.textContent=`${t('colFull')} ${col}`;
    card.appendChild(title);

    const digits=document.createElement('div');
    digits.className='ss-digits';

    for(let n=0;n<=9;n++){
      const btn=document.createElement('div');
      btn.className='ss-digit';
      btn.textContent=n;
      btn.dataset.col=col;
      btn.dataset.digit=n;
      if((superSeteExclusions[col]||new Set()).has(n)) btn.classList.add('excluded');
      btn.addEventListener('click',()=>{
        if(!superSeteExclusions[col]) superSeteExclusions[col]=new Set();
        if(superSeteExclusions[col].has(n)){
          superSeteExclusions[col].delete(n);
          btn.classList.remove('excluded');
        } else {
          superSeteExclusions[col].add(n);
          btn.classList.add('excluded');
        }
        updateExcludedChips();
      });
      digits.appendChild(btn);
    }
    card.appendChild(digits);
    grid.appendChild(card);
  }
  superSeteContainer.appendChild(grid);
}

/* ============================================================
   SALVAR JOGO
   ============================================================ */
function saveGame(){
  if(drawnNumbers.length===0){ showToast('⚠️ '+t('noSaved')); return; }
  const saved=JSON.parse(localStorage.getItem('saved_games_list')||'[]');
  saved.push({
    loteria:t(config.nameKey),
    data:new Date().toLocaleDateString('pt-BR'),
    numeros:drawnNumbers,
    extra:config.hasExtraNumbers&&extraNumbers.length>0?extraNumbers.join(', '):null,
    mes:config.hasLuckyMonth&&luckyMonth>0?i18n[currentLang].months[luckyMonth-1]:null,
    time:config.hasTeam&&heartTeam?heartTeam:null,
    tipo:'sorteio-globo'
  });
  localStorage.setItem('saved_games_list',JSON.stringify(saved));
  showToast('💾 '+t('saved'));
}

/* ============================================================
   TOAST
   ============================================================ */
function showToast(msg){
  const toast=document.createElement('div');
  toast.style.cssText='position:fixed;bottom:30px;left:50%;transform:translateX(-50%);background:#1e293b;color:#e2e8f0;padding:12px 24px;border-radius:8px;border:1px solid #334155;box-shadow:0 8px 24px rgba(0,0,0,.4);z-index:9999;font-weight:500;max-width:90%;text-align:center;';
  toast.textContent=msg;
  document.body.appendChild(toast);
  setTimeout(()=>{ toast.style.opacity='0'; toast.style.transition='opacity .3s'; setTimeout(()=>toast.remove(),300); },3000);
}

/* ============================================================
   ESTATÍSTICAS — CONFIG
   ============================================================ */
const TOTAL_NUMEROS={megasena:60,lotofacil:25,quina:80,lotomania:100,timemania:80,duplasena:50,diadesorte:31,supersete:10,maismilionaria:50};
const COLUNAS_GRADE={megasena:10,lotofacil:5,quina:10,lotomania:10,timemania:10,duplasena:10,diadesorte:5,supersete:10,maismilionaria:10};
const ARQUIVO_JSON={megasena:'historico_megasena.json',lotofacil:'historico_lotofacil.json',quina:'historico_quina.json',lotomania:'historico_lotomania.json',timemania:'historico_timemania.json',duplasena:'historico_duplasena.json',diadesorte:'historico_diadesorte.json',supersete:'historico_supersete.json',maismilionaria:'historico_maismilionaria.json'};
const PRIMOS=[2,3,5,7,11,13,17,19,23,29,31,37,41,43,47,53,59,61,67,71,73,79,83,89,97];

function preencherDicasNav(){
  const tr=i18n[currentLang];
  document.querySelectorAll('.game-hint').forEach(el=>{
    const key=el.getAttribute('data-hint');
    if(key==='supersete') el.innerText=tr.hint_supersete;
    else if(TOTAL_NUMEROS[key]!==undefined) el.innerText=tr.numeros_hint(TOTAL_NUMEROS[key]);
  });
}

function mudarIdioma(lang){
  currentLang=lang;
  document.querySelectorAll('[data-i18n]').forEach(el=>{
    const key=el.getAttribute('data-i18n');
    if(i18n[currentLang][key]) el.innerText=i18n[currentLang][key];
  });
  preencherDicasNav();
  // Atualiza textos dinâmicos
  if(lotteryName) lotteryName.textContent=t(config.nameKey);
  if(btnApplyExclusion&&!isSuperSete) btnApplyExclusion.innerHTML=`<i class="fa-solid fa-check"></i> <span>${t('apply_exclusion')}</span>`;
  // Reconstrói UI Super Sete para tradução dos títulos
  if(isSuperSete) buildSuperSeteExclusionUI();
  updateExcludedChips();
  resetGame(); // re-renderiza labels
  if(currentTab==='stats') carregarEstatisticas(currentStatsLottery,currentStatsName);
}

/* ============================================================
   ESTATÍSTICAS — carregamento
   ============================================================ */
async function carregarHistoricoJSON(loteria){
  const arquivo=ARQUIVO_JSON[loteria]||`historico_${loteria}.json`;
  const cb=new Date().getTime();
  try{
    const resp=await fetch(`./${arquivo}?v=${cb}`);
    if(!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const hist=await resp.json();
    return {historico:Array.isArray(hist)?hist:[],origem:'JSON Repositório'};
  } catch(err){
    console.error(`Erro ao ler ${arquivo}:`,err);
    return {historico:[],origem:'Erro'};
  }
}
function getConcursoHeader(draw){ return draw.concurso||draw.numero||draw.id||'?'; }

function calcularEstatisticasCompletas(draws,loteria){
  const totalNumeros=TOTAL_NUMEROS[loteria]||60;
  const numeros=Array.from({length:totalNumeros},(_,i)=>i+1);
  const valido=n=>(n>=1&&n<=totalNumeros);
  const ordenadoDesc=[...draws].sort((a,b)=>Number(getConcursoHeader(b))-Number(getConcursoHeader(a)));
  const freq={},ocorrencias={},atrasoAtual={};
  numeros.forEach(n=>{freq[n]=0;ocorrencias[n]=[];atrasoAtual[n]=-1;});
  ordenadoDesc.forEach((draw,idx)=>{
    const num=getConcursoHeader(draw);
    const nums=(draw.dezenas||draw.listaDezenas||[]).map(n=>parseInt(n,10));
    nums.forEach(n=>{
      if(valido(n)){
        freq[n]++;ocorrencias[n].push(num);
        if(atrasoAtual[n]===-1) atrasoAtual[n]=idx;
      }
    });
  });
  numeros.forEach(n=>{if(atrasoAtual[n]===-1) atrasoAtual[n]=ordenadoDesc.length;});

  let somaTotal=0,paresTotal=0,imparesTotal=0,primosTotal=0,ampTotal=0,repTotal=0,maxSeq=0,contRep=0;
  ordenadoDesc.forEach((draw,idx)=>{
    const nums=(draw.dezenas||draw.listaDezenas||[]).map(n=>parseInt(n,10)).filter(n=>!isNaN(n));
    if(nums.length===0) return;
    const soma=nums.reduce((a,b)=>a+b,0);
    const pares=nums.filter(n=>n%2===0).length;
    const impares=nums.length-pares;
    const primos=nums.filter(n=>PRIMOS.includes(n)).length;
    const min=Math.min(...nums),max=Math.max(...nums);
    somaTotal+=soma;paresTotal+=pares;imparesTotal+=impares;primosTotal+=primos;ampTotal+=(max-min);
    const sorted=[...nums].sort((a,b)=>a-b);
    let seq=1,seqMax=1;
    for(let i=1;i<sorted.length;i++){
      if(sorted[i]===sorted[i-1]+1){seq++;seqMax=Math.max(seqMax,seq);}
      else seq=1;
    }
    maxSeq=Math.max(maxSeq,seqMax);
    if(idx>0){
      const ant=(ordenadoDesc[idx-1].dezenas||ordenadoDesc[idx-1].listaDezenas||[]).map(n=>parseInt(n,10));
      repTotal+=nums.filter(n=>ant.includes(n)).length;
      contRep++;
    }
  });
  const total=ordenadoDesc.length;
  const metricas={
    somaMedia:somaTotal/total,paresMedia:paresTotal/total,imparesMedia:imparesTotal/total,
    primosMedia:primosTotal/total,amplitudeMedia:ampTotal/total,
    repetidosMedia:contRep>0?repTotal/contRep:0,maxSequencia:maxSeq,
    freqMedia:Object.values(freq).reduce((a,b)=>a+b,0)/numeros.length,
    atrasoMax:Math.max(...Object.values(atrasoAtual))
  };
  const entradas=Object.entries(freq).map(([n,f])=>({num:Number(n),freq:f,atraso:atrasoAtual[n]}));
  return {
    numeros,freq,ocorrencias,atrasoAtual,metricas,
    topFreq:[...entradas].sort((a,b)=>b.freq-a.freq).slice(0,10),
    topCold:[...entradas].sort((a,b)=>a.freq-b.freq).slice(0,10),
    topDelay:[...entradas].sort((a,b)=>b.atraso-a.atraso).slice(0,10),
    totalNumeros,
    ultimos:ordenadoDesc.slice(0,10)
  };
}

function calcularEstatisticasSuperSete(draws){
  const ordenadoDesc=[...draws].sort((a,b)=>Number(getConcursoHeader(b))-Number(getConcursoHeader(a)));
  const colunas=Array.from({length:7},()=>{const o={};for(let d=0;d<=9;d++)o[d]=0;return o;});
  const atrasoCol=Array.from({length:7},()=>{const o={};for(let d=0;d<=9;d++)o[d]=-1;return o;});
  ordenadoDesc.forEach((draw,idx)=>{
    const nums=(draw.dezenas||draw.listaDezenas||[]).map(n=>parseInt(n,10));
    nums.forEach((n,ci)=>{
      if(ci<7&&n>=0&&n<=9){
        colunas[ci][n]++;
        if(atrasoCol[ci][n]===-1) atrasoCol[ci][n]=idx;
      }
    });
  });
  for(let c=0;c<7;c++) for(let d=0;d<=9;d++) if(atrasoCol[c][d]===-1) atrasoCol[c][d]=ordenadoDesc.length;

  const resumoColunas=colunas.map((fobj,c)=>{
    const ent=Object.keys(fobj).map(d=>({digito:Number(d),freq:fobj[d],atraso:atrasoCol[c][d]}));
    return {
      maisQuente:[...ent].sort((a,b)=>b.freq-a.freq)[0],
      maisFrio:[...ent].sort((a,b)=>a.freq-b.freq)[0],
      maisAtrasado:[...ent].sort((a,b)=>b.atraso-a.atraso)[0],
      minFreq:Math.min(...ent.map(e=>e.freq)),
      maxFreq:Math.max(...ent.map(e=>e.freq))
    };
  });
  return {colunas,atrasoColuna:atrasoCol,resumoColunas,ultimos:ordenadoDesc.slice(0,10),totalConcursos:ordenadoDesc.length};
}

function classificarNumero(num,stats){
  const c=stats.freq[num]||0;
  const a=stats.atrasoAtual[num]||0;
  const m=stats.metricas.freqMedia;
  if(a>=15&&c>0) return 'delay';
  if(c>m*1.15) return 'hot';
  if(c<m*0.85) return 'cold';
  return 'mid';
}

function formatarTooltip(concursos,atraso){
  const tr=i18n[currentLang];
  if(!concursos.length) return tr.never_drawn;
  return `${tr.times_drawn(concursos.length)} ${tr.last_draws_label}${concursos.slice(0,5).join(', ')}. (Atraso: ${atraso})`;
}

function gerarLegenda(tr){
  return `<div class="legend-bar">
    <span class="legend-item"><span class="legend-dot dot-hot"></span>${tr.hot_num}</span>
    <span class="legend-item"><span class="legend-dot dot-mid"></span>${tr.mid_num}</span>
    <span class="legend-item"><span class="legend-dot dot-cold"></span>${tr.cold_num}</span>
    <span class="legend-item"><span class="legend-dot dot-delay"></span>${tr.delay_num}</span>
    <span class="legend-item"><span class="legend-dot dot-never"></span>${tr.never_label}</span>
  </div>`;
}
function gerarLegendaSuperSete(tr){
  return `<div class="legend-bar">
    <span class="legend-item"><span class="legend-swatch heat-swatch"></span>${tr.legend_heat}</span>
    <span class="legend-item"><span class="legend-dot dot-delay-ring"></span>${tr.legend_overdue}</span>
  </div>`;
}

async function carregarEstatisticas(loteria,nomeExibicao){
  currentStatsLottery=loteria;
  currentStatsName=nomeExibicao||currentStatsName;
  const tr=i18n[currentLang];
  document.getElementById('stats_title').innerText=currentStatsName;
  document.getElementById('badge_fonte').innerHTML=`<i class="fa-solid fa-spinner fa-spin"></i> ${tr.checking}`;
  document.getElementById('stats_subtitle').innerText=tr.loading;
  document.getElementById('stats_container').className='';
  document.getElementById('stats_container').innerHTML=`<div class="loading-state"><div class="spinner"></div><p>${tr.loading}</p></div>`;

  const resultado=await carregarHistoricoJSON(loteria);
  const draws=resultado.historico;

  if(!draws||draws.length===0){
    document.getElementById('badge_fonte').innerHTML=`<i class="fa-solid fa-triangle-exclamation"></i> ${tr.empty_warning}`;
    document.getElementById('stats_subtitle').innerText='';
    document.getElementById('stats_container').innerHTML=`
      <div class="estado-vazio">
        <i class="fa-solid fa-triangle-exclamation"></i>
        <p>${tr.no_history} <strong>${currentStatsName}</strong>.</p>
        <span class="empty-tag">${tr.empty_warning}</span>
      </div>`;
    return;
  }

  if(loteria==='supersete'){ renderSuperSete(draws,resultado,tr); return; }

  const stats=calcularEstatisticasCompletas(draws,loteria);
  const ultimo=stats.ultimos[0];
  const numUltimo=getConcursoHeader(ultimo);
  const colunas=COLUNAS_GRADE[loteria]||10;

  document.getElementById('stats_subtitle').innerText=tr.analyzed_total(draws.length);
  document.getElementById('badge_fonte').innerHTML=`<i class="fa-solid fa-database"></i> ${tr.source_label(resultado.origem,numUltimo)}`;

  let gridHtml=`<div class="number-grid" style="grid-template-columns:repeat(${colunas},1fr);">`;
  stats.numeros.forEach(num=>{
    const cls=classificarNumero(num,stats);
    const isNever=(stats.freq[num]||0)===0;
    const display = (loteria==='lotomania' && num===100) ? '00' : num.toString().padStart(2,'0');
    const tip=formatarTooltip(stats.ocorrencias[num]||[],stats.atrasoAtual[num]);
    gridHtml+=`<div class="number-cell ${cls}${isNever?' never':''}">${display}<div class="tooltip">${tip}</div></div>`;
  });
  gridHtml+='</div>';

  const numerosUltimo=(ultimo.dezenas||ultimo.listaDezenas||[]).map(n=>parseInt(n,10));
  let ultimoBallsHtml='';
  [...numerosUltimo].sort((a,b)=>a-b).forEach(n=>{
    const cls=classificarNumero(n,stats);
    const display = (loteria==='lotomania' && n===100) ? '00' : n.toString().padStart(2,'0');
    const tip=formatarTooltip(stats.ocorrencias[n]||[],stats.atrasoAtual[n]);
    ultimoBallsHtml+=`<div class="number-cell result-ball ${cls}">${display}<div class="tooltip">${tip}</div></div>`;
  });

  const m=stats.metricas;
  const metricsList=[
    {label:tr.metric_soma,value:m.somaMedia.toFixed(1),icon:'fa-calculator'},
    {label:tr.metric_pares,value:m.paresMedia.toFixed(1),icon:'fa-hashtag'},
    {label:tr.metric_impares,value:m.imparesMedia.toFixed(1),icon:'fa-hashtag'},
    {label:tr.metric_primos,value:m.primosMedia.toFixed(1),icon:'fa-asterisk'},
    {label:tr.metric_repetidos,value:m.repetidosMedia.toFixed(1),icon:'fa-rotate'},
    {label:tr.metric_seq,value:m.maxSequencia,icon:'fa-arrow-trend-up'},
    {label:tr.metric_amplitude,value:m.amplitudeMedia.toFixed(1),icon:'fa-arrows-left-right'},
    {label:tr.metric_media,value:m.freqMedia.toFixed(1),icon:'fa-chart-line'},
    {label:tr.metric_atraso_max,value:m.atrasoMax,icon:'fa-hourglass-half'}
  ];
  const metricsHtml=`<div class="metric-grid">${metricsList.map(mt=>`
    <div class="metric-card">
      <div class="lbl"><i class="fa-solid ${mt.icon}"></i> ${mt.label}</div>
      <div class="val">${mt.value}</div>
    </div>`).join('')}</div>`;

  const gerarLista=(arr,max,tipo)=>arr.map(item=>{
    const pct=Math.round((item.freq/max)*100)||0;
    const dPct=Math.round((item.atraso/m.atrasoMax)*100)||0;
    const pctFinal=tipo==='delay'?dPct:pct;
    const valTxt=tipo==='delay'?`${item.atraso}`:`${item.freq}x`;
    const display = (loteria==='lotomania' && item.num===100) ? '00' : String(item.num).padStart(2,'0');
    return `<li class="list-row">
      <span class="row-num">${display}</span>
      <div class="row-bar"><div class="row-fill ${tipo==='cold'?'cold':''} ${tipo==='delay'?'delay':''}" style="width:${pctFinal}%"></div></div>
      <span class="row-val">${valTxt}</span>
    </li>`;
  }).join('');

  const maxFreq=stats.topFreq[0]?.freq||1;
  const maxCold=stats.topCold[stats.topCold.length-1]?.freq||1;
  const maxDelay=stats.topDelay[0]?.atraso||1;

  let recentesHtml='';
  stats.ultimos.forEach(draw=>{
    const num=getConcursoHeader(draw);
    const data=draw.data||draw.dataApuracao||'';
    const nums=(draw.dezenas||draw.listaDezenas||[]).map(n=>parseInt(n,10)).sort((a,b)=>a-b);
    const bolas=nums.map(n=>{
      const cls=classificarNumero(n,stats);
      const display = (loteria==='lotomania' && n===100) ? '00' : String(n).padStart(2,'0');
return `<span class="number-cell recent-ball ${cls}">${display}</span>`;
    }).join('');
    recentesHtml+=`
      <div class="recent-row">
        <div class="rr-meta"><div class="rr-num">#${num}</div><div class="rr-date">${data}</div></div>
        <div class="recent-balls">${bolas}</div>
      </div>`;
  });

  document.getElementById('stats_container').className='fade-in';
  document.getElementById('stats_container').innerHTML=`
    <div class="painel-principal">
      <div class="card-box">
        <h3><i class="fa-solid fa-chart-simple"></i> ${tr.freq_title}</h3>
        <p class="card-desc">${tr.freq_desc}</p>
        ${gerarLegenda(tr)}
        ${gridHtml}
      </div>
      <div class="card-box" style="border-left:3px solid var(--gold);">
        <h3><i class="fa-solid fa-bullseye"></i> ${tr.last_draw_title(numUltimo)}</h3>
        <p class="card-desc">${tr.last_draw_desc}</p>
        <div class="last-draw-wrap">${ultimoBallsHtml}</div>
      </div>
    </div>
    <div class="card-box" style="margin-bottom:20px;">
      <h3><i class="fa-solid fa-gauge-high"></i> ${tr.metrics_title}</h3>
      <p class="card-desc">${tr.metrics_desc}</p>
      ${metricsHtml}
    </div>
    <div class="stats-main-grid">
      <div class="card-box">
        <h3><i class="fa-solid fa-fire"></i> ${tr.top_freq_title}</h3>
        <p class="card-desc">${tr.top_freq_desc}</p>
        <ul class="list-stats">${gerarLista(stats.topFreq,maxFreq,'hot')}</ul>
      </div>
      <div class="card-box">
        <h3><i class="fa-solid fa-snowflake"></i> ${tr.top_cold_title}</h3>
        <p class="card-desc">${tr.top_cold_desc}</p>
        <ul class="list-stats">${gerarLista(stats.topCold,maxCold,'cold')}</ul>
      </div>
      <div class="card-box">
        <h3><i class="fa-solid fa-clock"></i> ${tr.top_delay_title}</h3>
        <p class="card-desc">${tr.top_delay_desc}</p>
        <ul class="list-stats">${gerarLista(stats.topDelay,maxDelay,'delay')}</ul>
      </div>
    </div>
    <div class="card-box">
      <h3><i class="fa-solid fa-list-ol"></i> ${tr.recent_title}</h3>
      <p class="card-desc">${tr.recent_desc}</p>
      <div class="recent-list">${recentesHtml}</div>
    </div>`;
}

function renderSuperSete(draws,resultado,tr){
  const stats=calcularEstatisticasSuperSete(draws);
  const ultimo=stats.ultimos[0];
  const numUltimo=getConcursoHeader(ultimo);

  document.getElementById('stats_subtitle').innerText=tr.analyzed_total(draws.length);
  document.getElementById('badge_fonte').innerHTML=`<i class="fa-solid fa-database"></i> ${tr.source_label(resultado.origem,numUltimo)}`;

  let headerCells='';
  for(let c=0;c<7;c++) headerCells+=`<th>${tr.coluna_label} ${c+1}</th>`;

  let bodyRows='';
  for(let d=0;d<=9;d++){
    let rowCells='';
    for(let c=0;c<7;c++){
      const freq=stats.colunas[c][d];
      const atraso=stats.atrasoColuna[c][d];
      const resumo=stats.resumoColunas[c];
      const range=(resumo.maxFreq-resumo.minFreq)||1;
      const intens=0.12+0.80*((freq-resumo.minFreq)/range);
      const isOverdue=resumo.maisAtrasado.digito===d;
      const escuro=intens>0.55;
      const tip=tr.heat_tooltip(freq,atraso);
      rowCells+=`<td class="heat-cell${isOverdue?' is-overdue':''}" style="background-color:rgba(227,168,59,${intens.toFixed(2)});color:${escuro?'var(--ink)':'var(--text)'};" title="${tip}">${freq}</td>`;
    }
    bodyRows+=`<tr><th class="digit-label sticky-col">${d}</th>${rowCells}</tr>`;
  }

  const matrixHtml=`<div class="matrix-scroll">
    <table class="supersete-matrix">
      <thead><tr><th class="digit-label-header sticky-col">${tr.digit_label}</th>${headerCells}</tr></thead>
      <tbody>${bodyRows}</tbody>
    </table>
  </div>`;

  let resumoHtml='';
  stats.resumoColunas.forEach((r,c)=>{
    resumoHtml+=`<div class="col-summary-card">
      <div class="col-summary-title">${tr.coluna_label} ${c+1}</div>
      <div class="col-summary-row"><span class="tag tag-hot">${r.maisQuente.digito}</span>${tr.summary_hot(r.maisQuente.freq)}</div>
      <div class="col-summary-row"><span class="tag tag-cold">${r.maisFrio.digito}</span>${tr.summary_cold(r.maisFrio.freq)}</div>
      <div class="col-summary-row"><span class="tag tag-delay">${r.maisAtrasado.digito}</span>${tr.summary_delay(r.maisAtrasado.atraso)}</div>
    </div>`;
  });

  const numsUltimo=(ultimo.dezenas||ultimo.listaDezenas||[]).map(n=>parseInt(n,10));
  let ultimoHtml='';
  numsUltimo.forEach((n,i)=>{
    ultimoHtml+=`<div class="last-col-badge">
      <span class="last-col-label">${tr.coluna_label} ${i+1}</span>
      <span class="last-col-digit">${n}</span>
    </div>`;
  });

  let recentRows='';
  stats.ultimos.forEach(draw=>{
    const num=getConcursoHeader(draw);
    const data=draw.data||draw.dataApuracao||'';
    const nums=(draw.dezenas||draw.listaDezenas||[]).map(n=>parseInt(n,10));
    const cels=nums.map(n=>`<td><span class="digit-pill">${n}</span></td>`).join('');
    recentRows+=`<tr><td class="recent-concurso sticky-col">#${num}<span class="recent-data">${data}</span></td>${cels}</tr>`;
  });
  const recentTableHtml=`<div class="matrix-scroll">
    <table class="supersete-recent-table">
      <thead><tr><th class="sticky-col">${tr.col_concurso}</th>${headerCells}</tr></thead>
      <tbody>${recentRows}</tbody>
    </table>
  </div>`;

  document.getElementById('stats_container').className='fade-in';
  document.getElementById('stats_container').innerHTML=`
    <div class="card-box" style="margin-bottom:20px;">
      <h3><i class="fa-solid fa-table-cells"></i> ${tr.supersete_title}</h3>
      <p class="card-desc">${tr.supersete_desc}</p>
      ${gerarLegendaSuperSete(tr)}
      ${matrixHtml}
    </div>
    <div class="card-box" style="margin-bottom:20px;">
      <h3><i class="fa-solid fa-ranking-star"></i> ${tr.supersete_summary_title}</h3>
      <p class="card-desc">${tr.supersete_summary_desc}</p>
      <div class="col-summary-grid">${resumoHtml}</div>
    </div>
    <div class="painel-principal">
      <div class="card-box">
        <h3><i class="fa-solid fa-list-ol"></i> ${tr.recent_title}</h3>
        <p class="card-desc">${tr.recent_desc}</p>
        ${recentTableHtml}
      </div>
      <div class="card-box" style="border-left:3px solid var(--gold);">
        <h3><i class="fa-solid fa-bullseye"></i> ${tr.last_draw_title(numUltimo)}</h3>
        <p class="card-desc">${tr.last_draw_desc}</p>
        <div class="last-col-strip">${ultimoHtml}</div>
      </div>
    </div>`;
}

/* ============================================================
   EVENTOS
   ============================================================ */
if(btnDrawOne) btnDrawOne.addEventListener('click',drawOne);
if(btnDrawAll) btnDrawAll.addEventListener('click',drawAll);
if(btnSave) btnSave.addEventListener('click',saveGame);
if(btnClear) btnClear.addEventListener('click',resetGame);
if(btnApplyExclusion) btnApplyExclusion.addEventListener('click',()=>applyExclusions(true));
if(excludedInput){
  // Limpa os chips "em tempo real" ao digitar (sem aplicar até clicar)
  excludedInput.addEventListener('input',()=>{
    // Nada — o usuário aplica com o botão (mantém comportamento previsível)
  });
}

/* ============================================================
   INICIALIZAÇÃO
   ============================================================ */
window.addEventListener('DOMContentLoaded',()=>{
  preencherDicasNav();
  selectLotteryDraw('MEGA_SENA');
  // Estatísticas carregam quando o usuário clica na aba
});
</script>
</body>
</html>
