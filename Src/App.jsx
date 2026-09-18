import React, { useState, useEffect, useMemo, useCallback } from "react";
import { supabase } from "./supabaseClient";

/* ------------------------------------------------------------------ */
/*  Utilidades                                                         */
/* ------------------------------------------------------------------ */

async function hashSenha(texto) {
  const enc = new TextEncoder().encode(texto);
  const buf = await crypto.subtle.digest("SHA-256", enc);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function novoId(prefixo) {
  return `${prefixo}:${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

const AREAS = [
  "Ator / Atriz",
  "Cantor(a)",
  "Dançarino(a)",
  "Modelo",
  "Fotógrafo(a)",
  "Ilustrador(a) / Artista visual",
  "Músico(a) / Instrumentista",
  "Diretor(a)",
  "Produtor(a)",
  "Grafiteiro(a) / Muralista",
  "Maquiador(a) / Beleza",
  "Outro",
];

/* ------------------------------------------------------------------ */
/*  Estilo global                                                      */
/* ------------------------------------------------------------------ */

const GlobalStyle = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=Sora:wght@400;500;600;700&family=IBM+Plex+Mono:wght@500&display=swap');

    :root{
      --terra:#3C2A1E;
      --coffee:#6B4A34;
      --terracotta:#C1652F;
      --terracotta-deep:#A6501F;
      --ochre:#C68A2E;
      --blush:#E9D6C8;
      --cream:#F7EEE4;
      --cream-2:#FBF6F0;
      --ink:#2A1D15;
      --line: rgba(60,42,30,0.18);
    }
    *{box-sizing:border-box;}
    body,html{margin:0;padding:0;}
    .app{
      font-family:'Sora',sans-serif;
      background:var(--cream);
      color:var(--ink);
      min-height:100vh;
      line-height:1.5;
    }
    .wrap{max-width:1120px;margin:0 auto;padding:0 24px;}
    .eyebrow{
      font-family:'IBM Plex Mono',monospace;
      font-size:11px;
      letter-spacing:0.14em;
      text-transform:uppercase;
      color:var(--terracotta-deep);
      font-weight:500;
    }
    h1,h2,h3,.serif{font-family:'Fraunces',serif;}
    a{color:inherit;}
    button{font-family:'Sora',sans-serif;cursor:pointer;}

    .header{
      position:sticky;top:0;z-index:40;
      background:rgba(247,238,228,0.92);
      backdrop-filter:blur(6px);
      border-bottom:1px solid var(--line);
    }
    .header-inner{display:flex;align-items:center;justify-content:space-between;height:72px;}
    .logo{
      font-family:'Fraunces',serif;font-style:italic;font-weight:600;
      font-size:22px;color:var(--terra);letter-spacing:-0.01em;
      display:flex;align-items:center;gap:8px;
    }
    .logo .dot{width:9px;height:9px;border-radius:50%;background:var(--terracotta);display:inline-block;}
    .nav{display:flex;align-items:center;gap:4px;}
    .navbtn{
      background:transparent;border:none;padding:9px 16px;border-radius:999px;
      font-size:14px;font-weight:600;color:var(--coffee);
    }
    .navbtn:hover{background:var(--blush);}
    .navbtn.active{background:var(--terra);color:var(--cream-2);}
    .btn-primary{
      background:var(--terracotta);color:#fff;border:none;padding:11px 20px;
      border-radius:999px;font-weight:700;font-size:14px;
    }
    .btn-primary:hover{background:var(--terracotta-deep);}
    .btn-primary:disabled{opacity:0.55;cursor:default;}
    .btn-ghost{
      background:transparent;border:1.5px solid var(--terra);color:var(--terra);
      padding:9.5px 18px;border-radius:999px;font-weight:700;font-size:14px;
    }
    .btn-ghost:hover{background:var(--terra);color:var(--cream-2);}
    .btn-link{background:none;border:none;color:var(--terracotta-deep);font-weight:700;font-size:14px;padding:0;text-decoration:underline;text-underline-offset:3px;}

    .hero{padding:76px 0 88px;}
    .hero-grid{display:grid;grid-template-columns:1.05fr 0.95fr;gap:56px;align-items:center;}
    .hero h1{font-size:48px;line-height:1.06;font-weight:600;color:var(--terra);margin:14px 0 20px;letter-spacing:-0.01em;}
    .hero p.lead{font-size:17px;color:var(--coffee);max-width:460px;margin-bottom:30px;}
    .hero-ctas{display:flex;gap:12px;flex-wrap:wrap;}

    .mural{position:relative;height:420px;}
    .pin{
      position:absolute;border-radius:14px;padding:16px;
      box-shadow:0 14px 30px -12px rgba(42,29,21,0.35);
      color:#fff;width:168px;
    }
    .pin .num{font-family:'IBM Plex Mono',monospace;font-size:10px;opacity:0.75;letter-spacing:0.08em;}
    .pin .name{font-family:'Fraunces',serif;font-size:20px;margin-top:20px;line-height:1.1;}
    .pin .role{font-size:11px;margin-top:6px;opacity:0.85;font-family:'IBM Plex Mono',monospace;}

    .section{padding:64px 0;}
    .section.alt{background:var(--blush);}
    .valueprops{display:grid;grid-template-columns:repeat(3,1fr);gap:28px;margin-top:34px;}
    .vp{border-top:2px solid var(--terra);padding-top:16px;}
    .vp h3{font-size:19px;margin:10px 0 8px;color:var(--terra);}
    .vp p{color:var(--coffee);font-size:14.5px;margin:0;}

    .card{
      background:var(--cream-2);border:1px solid var(--line);border-radius:18px;
      padding:36px;
    }
    .formgrid{display:grid;grid-template-columns:1fr 1fr;gap:16px;}
    .field{display:flex;flex-direction:column;gap:6px;margin-bottom:16px;}
    .field label{font-size:12.5px;font-weight:700;color:var(--terra);}
    .field input,.field select,.field textarea{
      font-family:'Sora',sans-serif;font-size:14.5px;padding:11px 13px;
      border:1.5px solid var(--line);border-radius:10px;background:#fff;color:var(--ink);
    }
    .field input:focus,.field select:focus,.field textarea:focus,button:focus-visible{
      outline:2.5px solid var(--terracotta);outline-offset:1px;
    }
    .field textarea{resize:vertical;min-height:80px;}
    .portfolio-draft-item{
      display:grid;grid-template-columns:1fr 1fr auto;gap:10px;align-items:end;
      background:var(--cream);border:1px dashed var(--line);border-radius:10px;padding:12px;margin-bottom:10px;
    }
    .iconbtn{background:none;border:none;color:var(--terracotta-deep);font-weight:700;font-size:13px;}
    .errorbox{background:#fbe7e0;border:1px solid var(--terracotta);color:var(--terracotta-deep);padding:10px 14px;border-radius:10px;font-size:13.5px;margin-bottom:16px;}
    .okbox{background:#e9f2e6;border:1px solid #6b8f5c;color:#3d5c33;padding:10px 14px;border-radius:10px;font-size:13.5px;margin-bottom:16px;}

    .dir-layout{display:grid;grid-template-columns:250px 1fr;gap:36px;align-items:start;}
    .filters{position:sticky;top:96px;background:var(--cream-2);border:1px solid var(--line);border-radius:16px;padding:22px;}
    .filters h4{margin:0 0 14px;font-size:13px;text-transform:uppercase;letter-spacing:0.08em;color:var(--terra);font-family:'IBM Plex Mono',monospace;}
    .grid-artists{display:grid;grid-template-columns:repeat(2,1fr);gap:18px;}
    .ficha{
      background:var(--cream-2);border:1px solid var(--line);border-radius:16px;padding:22px;
      position:relative;cursor:pointer;transition:box-shadow .15s, transform .15s;
    }
    .ficha:hover{box-shadow:0 12px 26px -14px rgba(42,29,21,0.35);transform:translateY(-2px);}
    .ficha .tag{position:absolute;top:18px;right:18px;font-family:'IBM Plex Mono',monospace;font-size:10px;color:var(--terracotta-deep);border:1px solid var(--terracotta);border-radius:6px;padding:2px 6px;}
    .ficha .name{font-family:'Fraunces',serif;font-size:22px;color:var(--terra);margin:0 0 4px;padding-right:60px;}
    .ficha .meta{font-family:'IBM Plex Mono',monospace;font-size:11px;color:var(--coffee);letter-spacing:0.02em;}
    .ficha hr{border:none;border-top:1px solid var(--line);margin:14px 0;}
    .ficha .bio{font-size:13.5px;color:var(--coffee);margin:0;}
    .empty{padding:50px 0;text-align:center;color:var(--coffee);}

    .profile-top{display:flex;justify-content:space-between;align-items:flex-start;gap:24px;flex-wrap:wrap;}
    .profile-top .name{font-size:40px;margin:6px 0 8px;color:var(--terra);}
    .profile-meta{font-family:'IBM Plex Mono',monospace;font-size:12.5px;color:var(--coffee);letter-spacing:0.03em;}
    .contact-box{background:var(--blush);border-radius:14px;padding:18px 20px;margin-top:22px;}
    .contact-box h4{margin:0 0 10px;font-size:12.5px;text-transform:uppercase;letter-spacing:0.08em;color:var(--terra);font-family:'IBM Plex Mono',monospace;}
    .contact-row{display:flex;gap:8px;font-size:14px;margin-bottom:6px;}
    .contact-row .k{font-weight:700;color:var(--terra);min-width:100px;}
    .portfolio-strip{display:flex;gap:16px;overflow-x:auto;padding:6px 2px 14px;margin-top:14px;}
    .pf-card{min-width:220px;background:var(--cream-2);border:1px solid var(--line);border-radius:14px;padding:16px;flex-shrink:0;}
    .pf-card .pnum{font-family:'IBM Plex Mono',monospace;font-size:10px;color:var(--terracotta-deep);}
    .pf-card h5{margin:8px 0 6px;font-family:'Fraunces',serif;font-size:17px;color:var(--terra);}
    .pf-card p{font-size:13px;color:var(--coffee);margin:0 0 8px;}

    .job-card{background:var(--cream-2);border:1px solid var(--line);border-radius:16px;padding:22px;margin-bottom:16px;}
    .job-card .top{display:flex;justify-content:space-between;flex-wrap:wrap;gap:10px;}
    .job-card h3{margin:0;font-size:20px;color:var(--terra);}
    .job-card .company{font-family:'IBM Plex Mono',monospace;font-size:12px;color:var(--terracotta-deep);}
    .job-card .req{font-size:13.5px;color:var(--coffee);white-space:pre-wrap;margin-top:10px;}
    .pill{display:inline-block;background:var(--blush);color:var(--terra);font-size:11.5px;font-weight:700;padding:3px 10px;border-radius:999px;margin-right:6px;}

    .footer{border-top:1px solid var(--line);padding:26px 0;margin-top:40px;}
    .footer p{font-size:12px;color:var(--coffee);margin:0;}

    .loading{padding:60px 0;text-align:center;color:var(--coffee);font-family:'IBM Plex Mono',monospace;font-size:13px;}

    @media (max-width:840px){
      .hero-grid{grid-template-columns:1fr;}
      .mural{display:none;}
      .valueprops{grid-template-columns:1fr;}
      .dir-layout{grid-template-columns:1fr;}
      .filters{position:static;}
      .grid-artists{grid-template-columns:1fr;}
      .formgrid{grid-template-columns:1fr;}
      .hero h1{font-size:34px;}
    }
  `}</style>
);

/* ------------------------------------------------------------------ */
/*  App                                                                 */
/* ------------------------------------------------------------------ */

export default function App() {
  const [view, setView] = useState("home");
  const [carregando, setCarregando] = useState(true);
  const [artistas, setArtistas] = useState([]);
  const [vagas, setVagas] = useState([]);
  const [usuario, setUsuario] = useState(null);
  const [perfilAberto, setPerfilAberto] = useState(null);

  const carregarTudo = useCallback(async () => {
    setCarregando(true);
    const { data: a } = await supabase.from("artistas").select("*");
    const { data: v } = await supabase.from("vagas").select("*").order("criado_em", { ascending: false });
    
    setArtistas(a || []);
    setVagas(v || []);
    setCarregando(false);
  }, []);

  useEffect(() => {
    carregarTudo();
  }, [carregarTudo]);

  const irPara = (v) => {
    setView(v);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="app">
      <GlobalStyle />
      <Header view={view} irPara={irPara} usuario={usuario} onSair={() => { setUsuario(null); irPara("home"); }} />

      {view === "home" && <Home irPara={irPara} artistas={artistas} />}

      {view === "diretorio" && (
        <Directory
          carregando={carregando}
          artistas={artistas}
          onAbrirPerfil={(a) => { setPerfilAberto(a); irPara("perfil"); }}
        />
      )}

      {view === "perfil" && perfilAberto && (
        <PerfilArtista artista={perfilAberto} onVoltar={() => irPara("diretorio")} />
      )}

      {view === "vagas" && <Vagas carregando={carregando} vagas={vagas} />}

      {view === "escolhaCadastro" && <EscolhaCadastro irPara={irPara} />}

      {view === "cadastroArtista" && (
        <CadastroArtista
          irPara={irPara}
          onCadastrado={async (perfil) => {
            setUsuario(perfil);
            await carregarTudo();
            irPara("meuPerfil");
          }}
        />
      )}

      {view === "cadastroEmpresa" && (
        <CadastroEmpresa
          irPara={irPara}
          onCadastrado={(perfil) => { setUsuario(perfil); irPara("painelEmpresa"); }}
        />
      )}

      {view === "login" && (
        <Login
          irPara={irPara}
          onLogin={async (perfil) => {
            setUsuario(perfil);
            await carregarTudo();
            irPara(perfil.tipo === "empresa" ? "painelEmpresa" : "meuPerfil");
          }}
        />
      )}

      {view === "meuPerfil" && usuario && usuario.tipo === "artista" && (
        <PerfilArtista artista={usuario} onVoltar={() => irPara("home")} dono />
      )}

      {view === "painelEmpresa" && usuario && usuario.tipo === "empresa" && (
        <PainelEmpresa
          usuario={usuario}
          vagas={vagas.filter((v) => v.empresa_email === usuario.email)}
          onPublicada={carregarTudo}
        />
      )}

      <footer className="footer">
        <div className="wrap">
          <p>ATERRO — Plataforma de conexão de talentos integrada ao Supabase.</p>
        </div>
      </footer>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Header                                                              */
/* ------------------------------------------------------------------ */

function Header({ view, irPara, usuario, onSair }) {
  return (
    <header className="header">
      <div className="wrap header-inner">
        <div className="logo" onClick={() => irPara("home")} style={{ cursor: "pointer" }}>
          <span className="dot" />ATERRO
        </div>
        <nav className="nav">
          <button className={`navbtn ${view === "diretorio" ? "active" : ""}`} onClick={() => irPara("diretorio")}>Diretório</button>
          <button className={`navbtn ${view === "vagas" ? "active" : ""}`} onClick={() => irPara("vagas")}>Vagas</button>
          {!usuario && (
            <>
              <button className="navbtn" onClick={() => irPara("login")}>Entrar</button>
              <button className="btn-primary" style={{ marginLeft: 6 }} onClick={() => irPara("escolhaCadastro")}>Cadastrar</button>
            </>
          )}
          {usuario && usuario.tipo === "artista" && (
            <>
              <button className="navbtn" onClick={() => irPara("meuPerfil")}>Meu perfil</button>
              <button className="btn-ghost" style={{ marginLeft: 6 }} onClick={onSair}>Sair</button>
            </>
          )}
          {usuario && usuario.tipo === "empresa" && (
            <>
              <button className="navbtn" onClick={() => irPara("painelEmpresa")}>Painel da empresa</button>
              <button className="btn-ghost" style={{ marginLeft: 6 }} onClick={onSair}>Sair</button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

/* ------------------------------------------------------------------ */
/*  Home                                                                */
/* ------------------------------------------------------------------ */

const CORES_PIN = ["var(--terracotta)", "var(--coffee)", "var(--ochre)", "var(--terra)"];
const PINS = [
  { top: "0%", left: "6%", rot: "-6deg", nome: "Ayo M.", papel: "FOTOGRAFIA" },
  { top: "6%", left: "46%", rot: "4deg", nome: "Dandara S.", papel: "DANÇA" },
  { top: "40%", left: "2%", rot: "3deg", nome: "Kaique R.", papel: "MÚSICA" },
  { top: "46%", left: "44%", rot: "-4deg", nome: "Ìyá B.", papel: "ARTES VISUAIS" },
  { top: "26%", left: "70%", rot: "-3deg", nome: "Preto N.", papel: "ATUAÇÃO" },
];

function Home({ irPara, artistas }) {
  return (
    <>
      <section className="hero">
        <div className="wrap hero-grid">
          <div>
            <span className="eyebrow">Vitrine de talentos negros e periféricos</span>
            <h1>Talento que já existe. Visibilidade que faltava.</h1>
            <p className="lead">
              Um espaço para artistas negros e periféricos publicarem portfólio, trajetória
              e contatos — e para marcas e agências encontrarem quem procuram.
            </p>
            <div className="hero-ctas">
              <button className="btn-primary" onClick={() => irPara("diretorio")}>Ver artistas</button>
              <button className="btn-ghost" onClick={() => irPara("escolhaCadastro")}>Quero me cadastrar</button>
            </div>
          </div>
          <div className="mural" aria-hidden="true">
            {PINS.map((p, i) => (
              <div
                key={p.nome}
                className="pin"
                style={{ top: p.top, left: p.left, transform: `rotate(${p.rot})`, background: CORES_PIN[i % CORES_PIN.length] }}
              >
                <div className="num">Nº {String(i + 1).padStart(2, "0")}</div>
                <div className="name">{p.nome}</div>
                <div className="role">{p.papel}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section alt">
        <div className="wrap">
          <span className="eyebrow">Como funciona</span>
          <div className="valueprops">
            <div className="vp">
              <h3>Portfólio próprio</h3>
              <p>Cada artista monta sua ficha: trajetória, projetos já realizados e rede de contatos.</p>
            </div>
            <div className="vp">
              <h3>Busca por filtro</h3>
              <p>Marcas e agências filtram por área artística, cidade, idade e altura para achar rápido quem precisam.</p>
            </div>
            <div className="vp">
              <h3>Vagas abertas</h3>
              <p>Empresas publicam a vaga com os requisitos direto na plataforma.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <span className="eyebrow">{artistas.length} artista{artistas.length !== 1 ? "s" : ""} na plataforma</span>
          <h2 className="serif" style={{ color: "var(--terra)", fontSize: 28, margin: "10px 0 22px" }}>Quem já está por aqui</h2>
          {artistas.length === 0 ? (
            <p style={{ color: "var(--coffee)" }}>Ainda não há artistas cadastrados — seja o primeiro a publicar seu portfólio.</p>
          ) : (
            <div className="grid-artists">
              {artistas.slice(0, 4).map((a) => (
                <MiniFicha key={a.email} a={a} onClick={() => irPara("diretorio")} />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}

function MiniFicha({ a, onClick }) {
  return (
    <div className="ficha" onClick={onClick}>
      <span className="tag">{a.area}</span>
      <h3 className="name">{a.nome}</h3>
      <div className="meta">{a.cidade} · {a.idade} anos</div>
      <hr />
      <p className="bio">{(a.portfolio && a.portfolio[0] && a.portfolio[0].titulo) || "Ver portfólio completo"}</p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Diretório + filtros                                                 */
/* ------------------------------------------------------------------ */

function Directory({ carregando, artistas, onAbrirPerfil }) {
  const [area, setArea] = useState("");
  const [cidade, setCidade] = useState("");
  const [idadeMin, setIdadeMin] = useState("");
  const [idadeMax, setIdadeMax] = useState("");
  const [alturaMin, setAlturaMin] = useState("");
  const [alturaMax, setAlturaMax] = useState("");

  const filtrados = useMemo(() => {
    return artistas.filter((a) => {
      if (area && a.area !== area) return false;
      if (cidade && !a.cidade.toLowerCase().includes(cidade.toLowerCase())) return false;
      if (idadeMin && a.idade < Number(idadeMin)) return false;
      if (idadeMax && a.idade > Number(idadeMax)) return false;
      if (alturaMin && a.altura < Number(alturaMin)) return false;
      if (alturaMax && a.altura > Number(alturaMax)) return false;
      return true;
    });
  }, [artistas, area, cidade, idadeMin, idadeMax, alturaMin, alturaMax]);

  return (
    <section className="section">
      <div className="wrap">
        <span className="eyebrow">Diretório</span>
        <h2 className="serif" style={{ fontSize: 30, color: "var(--terra)", margin: "8px 0 26px" }}>Encontre um artista</h2>
        <div className="dir-layout">
          <aside className="filters">
            <h4>Filtros</h4>
            <div className="field">
              <label>Área artística</label>
              <select value={area} onChange={(e) => setArea(e.target.value)}>
                <option value="">Todas</option>
                {AREAS.map((a) => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Cidade</label>
              <input value={cidade} onChange={(e) => setCidade(e.target.value)} placeholder="ex: Salvador" />
            </div>
            <div className="field">
              <label>Idade (min – max)</label>
              <div style={{ display: "flex", gap: 8 }}>
                <input type="number" min="0" value={idadeMin} onChange={(e) => setIdadeMin(e.target.value)} placeholder="min" />
                <input type="number" min="0" value={idadeMax} onChange={(e) => setIdadeMax(e.target.value)} placeholder="max" />
              </div>
            </div>
            <div className="field">
              <label>Altura em cm (min – max)</label>
              <div style={{ display: "flex", gap: 8 }}>
                <input type="number" min="0" value={alturaMin} onChange={(e) => setAlturaMin(e.target.value)} placeholder="min" />
                <input type="number" min="0" value={alturaMax} onChange={(e) => setAlturaMax(e.target.value)} placeholder="max" />
              </div>
            </div>
            {(area || cidade || idadeMin || idadeMax || alturaMin || alturaMax) && (
              <button className="btn-link" onClick={() => { setArea(""); setCidade(""); setIdadeMin(""); setIdadeMax(""); setAlturaMin(""); setAlturaMax(""); }}>
                Limpar filtros
              </button>
            )}
          </aside>

          <div>
            {carregando ? (
              <div className="loading">Carregando artistas…</div>
            ) : filtrados.length === 0 ? (
              <div className="empty">Nenhum artista encontrado com esses filtros.</div>
            ) : (
              <div className="grid-artists">
                {filtrados.map((a) => (
                  <MiniFicha key={a.email} a={a} onClick={() => onAbrirPerfil(a)} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Perfil do artista                                                   */
/* ------------------------------------------------------------------ */

function PerfilArtista({ artista, onVoltar, dono }) {
  return (
    <section className="section">
      <div className="wrap">
        <button className="btn-link" onClick={onVoltar}>← Voltar</button>
        <div className="profile-top" style={{ marginTop: 18 }}>
          <div>
            <span className="eyebrow">{artista.area}</span>
            <h1 className="serif name" style={{ fontSize: 40 }}>{artista.nome}</h1>
            <div className="profile-meta">{artista.cidade} · {artista.idade} anos · {artista.altura} cm</div>
          </div>
          {dono && <span className="pill">Este é o seu perfil público</span>}
        </div>

        {artista.bio && <p style={{ maxWidth: 620, marginTop: 22, color: "var(--coffee)" }}>{artista.bio}</p>}

        <div className="contact-box">
          <h4>Rede de contatos</h4>
          {artista.instagram && <div className="contact-row"><span className="k">Instagram</span><span>{artista.instagram}</span></div>}
          {artista.whatsapp && <div className="contact-row"><span className="k">WhatsApp</span><span>{artista.whatsapp}</span></div>}
          {artista.site && <div className="contact-row"><span className="k">Site / portfólio</span><span>{artista.site}</span></div>}
          {artista.email_contato && <div className="contact-row"><span className="k">E-mail</span><span>{artista.email_contato}</span></div>}
        </div>

        <h4 style={{ marginTop: 30, fontFamily: "'IBM Plex Mono',monospace", fontSize: 12.5, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--terra)" }}>
          Projetos já trabalhados
        </h4>
        {(!artista.portfolio || artista.portfolio.length === 0) ? (
          <p style={{ color: "var(--coffee)", fontSize: 14 }}>Nenhum projeto adicionado ainda.</p>
        ) : (
          <div className="portfolio-strip">
            {artista.portfolio.map((p, i) => (
              <div className="pf-card" key={i}>
                <div className="pnum">Nº {String(i + 1).padStart(2, "0")}</div>
                <h5>{p.titulo}</h5>
                <p>{p.descricao}</p>
                {p.link && <a href={p.link} target="_blank" rel="noreferrer" className="btn-link" style={{ fontSize: 12.5 }}>Ver link</a>}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Vagas                                                              */
/* ------------------------------------------------------------------ */

function Vagas({ carregando, vagas }) {
  return (
    <section className="section">
      <div className="wrap" style={{ maxWidth: 760 }}>
        <span className="eyebrow">Oportunidades</span>
        <h2 className="serif" style={{ fontSize: 30, color: "var(--terra)", margin: "8px 0 26px" }}>Vagas abertas</h2>
        {carregando ? (
          <div className="loading">Carregando vagas…</div>
        ) : vagas.length === 0 ? (
          <div className="empty">Nenhuma vaga publicada até o momento.</div>
        ) : (
          vagas.map((v) => (
            <div className="job-card" key={v.id}>
              <div className="top">
                <div>
                  <h3>{v.titulo}</h3>
                  <div className="company">{v.empresa_nome}</div>
                </div>
                <div>
                  {v.local && <span className="pill">{v.local}</span>}
                  {v.tipo && <span className="pill">{v.tipo}</span>}
                </div>
              </div>
              <p style={{ marginTop: 12, fontSize: 14, color: "var(--coffee)" }}>{v.descricao}</p>
              {v.requisitos && (
                <>
                  <div className="eyebrow" style={{ marginTop: 12 }}>Requisitos</div>
                  <p className="req">{v.requisitos}</p>
                </>
              )}
            </div>
          ))
        )}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Escolha do Cadastro                                                 */
/* ------------------------------------------------------------------ */

function EscolhaCadastro({ irPara }) {
  return (
    <section className="section">
      <div className="wrap" style={{ maxWidth: 720 }}>
        <span className="eyebrow">Cadastro</span>
        <h2 className="serif" style={{ fontSize: 30, color: "var(--terra)", margin: "8px 0 30px" }}>Como você quer entrar?</h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          <div className="card">
            <h3 style={{ marginTop: 0 }}>Sou artista</h3>
            <p style={{ color: "var(--coffee)", fontSize: 14 }}>Publique seu portfólio, projetos e rede de contatos para ser encontrado.</p>
            <button className="btn-primary" onClick={() => irPara("cadastroArtista")}>Criar meu perfil</button>
          </div>
          <div className="card">
            <h3 style={{ marginTop: 0 }}>Sou empresa / agência</h3>
            <p style={{ color: "var(--coffee)", fontSize: 14 }}>Busque artistas por filtro e publique vagas com seus requisitos.</p>
            <button className="btn-primary" onClick={() => irPara("cadastroEmpresa")}>Cadastrar empresa</button>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Cadastro de Artista                                                 */
/* ------------------------------------------------------------------ */

function CadastroArtista({ irPara, onCadastrado }) {
  const [form, setForm] = useState({
    nome: "", email: "", senha: "", idade: "", altura: "", cidade: "", area: AREAS[0],
    bio: "", instagram: "", whatsapp: "", site: "", emailContato: "",
  });
  const [portfolioDraft, setPortfolioDraft] = useState([{ titulo: "", descricao: "", link: "" }]);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState(null);

  const set = (campo) => (e) => setForm({ ...form, [campo]: e.target.value });

  const addProjeto = () => setPortfolioDraft([...portfolioDraft, { titulo: "", descricao: "", link: "" }]);
  const rmProjeto = (i) => setPortfolioDraft(portfolioDraft.filter((_, idx) => idx !== i));
  const setProjeto = (i, campo, valor) => {
    const copia = [...portfolioDraft];
    copia[i] = { ...copia[i], [campo]: valor };
    setPortfolioDraft(copia);
  };

  const enviar = async (e) => {
    e.preventDefault();
    setErro(null);
    if (!form.nome || !form.email || !form.senha || !form.idade || !form.altura || !form.cidade) {
      setErro("Preencha nome, e-mail, senha, idade, altura e cidade.");
      return;
    }
    setEnviando(true);
    
    try {
      const senhaHash = await hashSenha(form.senha);
      const perfil = {
        email: form.email.trim().toLowerCase(),
        tipo: "artista",
        nome: form.nome.trim(),
        senha_hash: senhaHash,
        idade: Number(form.idade),
        altura: Number(form.altura),
        cidade: form.cidade.trim(),
        area: form.area,
        bio: form.bio.trim(),
        instagram: form.instagram.trim(),
        whatsapp: form.whatsapp.trim(),
        site: form.site.trim(),
        email_contato: form.emailContato.trim(),
        portfolio: portfolioDraft.filter((p) => p.titulo.trim() !== ""),
        criado_em: Date.now(),
      };

      const { error } = await supabase.from("artistas").insert([perfil]);
      if (error) throw error;

      onCadastrado(perfil);
    } catch (err) {
      console.error(err);
      setErro("Não foi possível concluir o cadastro. O e-mail já pode estar em uso.");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <section className="section">
      <div className="wrap" style={{ maxWidth: 720 }}>
        <span className="eyebrow">Cadastro de artista</span>
        <h2 className="serif" style={{ fontSize: 28, color: "var(--terra)", margin: "8px 0 24px" }}>Monte seu perfil</h2>
        <form className="card" onSubmit={enviar}>
          {erro && <div className="errorbox">{erro}</div>}
          <div className="formgrid">
            <div className="field"><label>Nome</label><input value={form.nome} onChange={set("nome")} /></div>
            <div className="field"><label>E-mail</label><input type="email" value={form.email} onChange={set("email")} /></div>
            <div className="field"><label>Senha</label><input type="password" value={form.senha} onChange={set("senha")} /></div>
            <div className="field"><label>Área artística</label>
              <select value={form.area} onChange={set("area")}>{AREAS.map((a) => <option key={a}>{a}</option>)}</select>
            </div>
            <div className="field"><label>Idade</label><input type="number" min="0" value={form.idade} onChange={set("idade")} /></div>
            <div className="field"><label>Altura (cm)</label><input type="number" min="0" value={form.altura} onChange={set("altura")} /></div>
            <div className="field" style={{ gridColumn: "1 / -1" }}><label>Cidade</label><input value={form.cidade} onChange={set("cidade")} /></div>
            <div className="field" style={{ gridColumn: "1 / -1" }}>
              <label>Sobre você (bio)</label>
              <textarea value={form.bio} onChange={set("bio")} placeholder="Trajetória, estilo, o que te representa..." />
            </div>
          </div>

          <h4 style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--terra)" }}>Rede de contatos</h4>
          <div className="formgrid">
            <div className="field"><label>Instagram</label><input value={form.instagram} onChange={set("instagram")} placeholder="@seuusuario" /></div>
            <div className="field"><label>WhatsApp</label><input value={form.whatsapp} onChange={set("whatsapp")} placeholder="(00) 00000-0000" /></div>
            <div className="field"><label>Site / portfólio externo</label><input value={form.site} onChange={set("site")} /></div>
            <div className="field"><label>E-mail de contato profissional</label><input value={form.emailContato} onChange={set("emailContato")} /></div>
          </div>

          <h4 style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--terra)" }}>Projetos já trabalhados</h4>
          {portfolioDraft.map((p, i) => (
            <div className="portfolio-draft-item" key={i}>
              <div className="field" style={{ marginBottom: 0 }}><label>Título</label><input value={p.titulo} onChange={(e) => setProjeto(i, "titulo", e.target.value)} /></div>
              <div className="field" style={{ marginBottom: 0 }}><label>Descrição / link</label><input value={p.descricao} onChange={(e) => setProjeto(i, "descricao", e.target.value)} /></div>
              <button type="button" className="iconbtn" onClick={() => rmProjeto(i)}>Remover</button>
            </div>
          ))}
          <button type="button" className="btn-link" onClick={addProjeto}>+ Adicionar outro projeto</button>

          <div style={{ marginTop: 24, display: "flex", gap: 12, alignItems: "center" }}>
            <button className="btn-primary" disabled={enviando} type="submit">{enviando ? "Salvando…" : "Criar perfil"}</button>
            <button type="button" className="btn-link" onClick={() => irPara("escolhaCadastro")}>Voltar</button>
          </div>
        </form>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Cadastro de Empresa                                                 */
/* ------------------------------------------------------------------ */

function CadastroEmpresa({ irPara, onCadastrado }) {
  const [form, setForm] = useState({ nomeEmpresa: "", email: "", senha: "" });
  const [erro, setErro] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const set = (campo) => (e) => setForm({ ...form, [campo]: e.target.value });

  const enviar = async (e) => {
    e.preventDefault();
    setErro(null);
    if (!form.nomeEmpresa || !form.email || !form.senha) {
      setErro("Preencha nome da empresa, e-mail e senha.");
      return;
    }
    setEnviando(true);
    
    try {
      const senhaHash = await hashSenha(form.senha);
      const perfil = {
        email: form.email.trim().toLowerCase(),
        tipo: "empresa",
        nome_empresa: form.nomeEmpresa.trim(),
        senha_hash: senhaHash,
        criado_em: Date.now(),
      };

      const { error } = await supabase.from("empresas").insert([perfil]);
      if (error) throw error;

      onCadastrado(perfil);
    } catch (err) {
      console.error(err);
      setErro("Não foi possível concluir o cadastro. O e-mail já pode estar cadastrado.");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <section className="section">
      <div className="wrap" style={{ maxWidth: 520 }}>
        <span className="eyebrow">Cadastro de empresa</span>
        <h2 className="serif" style={{ fontSize: 28, color: "var(--terra)", margin: "8px 0 24px" }}>Crie sua conta</h2>
        <form className="card" onSubmit={enviar}>
          {erro && <div className="errorbox">{erro}</div>}
          <div className="field"><label>Nome da empresa / agência</label><input value={form.nomeEmpresa} onChange={set("nomeEmpresa")} /></div>
          <div className="field"><label>E-mail</label><input type="email" value={form.email} onChange={set("email")} /></div>
          <div className="field"><label>Senha</label><input type="password" value={form.senha} onChange={set("senha")} /></div>
          <div style={{ marginTop: 10, display: "flex", gap: 12, alignItems: "center" }}>
            <button className="btn-primary" disabled={enviando} type="submit">{enviando ? "Salvando…" : "Criar conta"}</button>
            <button type="button" className="btn-link" onClick={() => irPara("escolhaCadastro")}>Voltar</button>
          </div>
        </form>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Login                                                               */
/* ------------------------------------------------------------------ */

function Login({ irPara, onLogin }) {
  const [tipo, setTipo] = useState("artista");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState(null);
  const [enviando, setEnviando] = useState(false);

  const entrar = async (e) => {
    e.preventDefault();
    setErro(null);
    setEnviando(true);
    
    const tabela = tipo === "artista" ? "artistas" : "empresas";
    const emailLimpo = email.trim().toLowerCase();

    try {
      const { data, error } = await supabase
        .from(tabela)
        .select("*")
        .eq("email", emailLimpo)
        .single();

      if (error || !data) {
        setErro("Conta não encontrada. Verifique o e-mail informado.");
        setEnviando(false);
        return;
      }

      const senhaHash = await hashSenha(senha);
      if (senhaHash !== data.senha_hash) {
        setErro("Senha incorreta.");
        setEnviando(false);
        return;
      }

      onLogin(data);
    } catch (err) {
      console.error(err);
      setErro("Falha ao efetuar login. Tente novamente.");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <section className="section">
      <div className="wrap" style={{ maxWidth: 460 }}>
        <span className="eyebrow">Entrar</span>
        <h2 className="serif" style={{ fontSize: 28, color: "var(--terra)", margin: "8px 0 24px" }}>Acesse sua conta</h2>
        <form className="card" onSubmit={entrar}>
          {erro && <div className="errorbox">{erro}</div>}
          <div className="field">
            <label>Eu sou</label>
            <select value={tipo} onChange={(e) => setTipo(e.target.value)}>
              <option value="artista">Artista</option>
              <option value="empresa">Empresa / agência</option>
            </select>
          </div>
          <div className="field"><label>E-mail</label><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
          <div className="field"><label>Senha</label><input type="password" value={senha} onChange={(e) => setSenha(e.target.value)} /></div>
          <div style={{ marginTop: 10, display: "flex", gap: 12, alignItems: "center" }}>
            <button className="btn-primary" disabled={enviando} type="submit">{enviando ? "Entrando…" : "Entrar"}</button>
            <button type="button" className="btn-link" onClick={() => irPara("escolhaCadastro")}>Criar conta</button>
          </div>
        </form>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Painel da Empresa                                                   */
/* ------------------------------------------------------------------ */

function PainelEmpresa({ usuario, vagas, onPublicada }) {
  const [form, setForm] = useState({ titulo: "", descricao: "", requisitos: "", local: "", tipo: "Freelance" });
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState(null);
  const [ok, setOk] = useState(false);
  const set = (campo) => (e) => setForm({ ...form, [campo]: e.target.value });

  const publicar = async (e) => {
    e.preventDefault();
    setErro(null);
    setOk(false);
    if (!form.titulo || !form.descricao) {
      setErro("Preencha ao menos o título e a descrição da vaga.");
      return;
    }
    setEnviando(true);
    try {
      const id = novoId("vaga");
      const vaga = {
        id,
        empresa_email: usuario.email,
        empresa_nome: usuario.nome_empresa || usuario.nomeEmpresa,
        titulo: form.titulo.trim(),
        descricao: form.descricao.trim(),
        requisitos: form.requisitos.trim(),
        local: form.local.trim(),
        tipo: form.tipo,
        criado_em: Date.now(),
      };

      const { error } = await supabase.from("vagas").insert([vaga]);
      if (error) throw error;

      setForm({ titulo: "", descricao: "", requisitos: "", local: "", tipo: "Freelance" });
      setOk(true);
      await onPublicada();
    } catch (err) {
      console.error(err);
      setErro("Não foi possível publicar a vaga agora.");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <section className="section">
      <div className="wrap" style={{ maxWidth: 760 }}>
        <span className="eyebrow">Painel da empresa</span>
        <h2 className="serif" style={{ fontSize: 28, color: "var(--terra)", margin: "8px 0 6px" }}>{usuario.nome_empresa || usuario.nomeEmpresa}</h2>
        <p style={{ color: "var(--coffee)", marginTop: 0 }}>{usuario.email}</p>

        <div className="card" style={{ marginTop: 20 }}>
          <h3 style={{ marginTop: 0 }}>Publicar nova vaga</h3>
          {erro && <div className="errorbox">{erro}</div>}
          {ok && <div className="okbox">Vaga publicada com sucesso.</div>}
          <form onSubmit={publicar}>
            <div className="field"><label>Título da vaga</label><input value={form.titulo} onChange={set("titulo")} placeholder="ex: Modelo para campanha" /></div>
            <div className="formgrid">
              <div className="field"><label>Local</label><input value={form.local} onChange={set("local")} placeholder="ex: São Paulo, SP" /></div>
              <div className="field">
                <label>Tipo de contrato</label>
                <select value={form.tipo} onChange={set("tipo")}>
                  <option>Freelance</option>
                  <option>CLT</option>
                  <option>PJ</option>
                  <option>Cachê único</option>
                </select>
              </div>
            </div>
            <div className="field"><label>Descrição</label><textarea value={form.descricao} onChange={set("descricao")} /></div>
            <div className="field"><label>Requisitos</label><textarea value={form.requisitos} onChange={set("requisitos")} /></div>
            <button className="btn-primary" disabled={enviando} type="submit">{enviando ? "Publicando…" : "Publicar vaga"}</button>
          </form>
        </div>

        <h3 style={{ marginTop: 34 }}>Suas vagas publicadas</h3>
        {vagas.length === 0 ? (
          <p style={{ color: "var(--coffee)" }}>Você ainda não publicou nenhuma vaga.</p>
        ) : (
          vagas.map((v) => (
            <div className="job-card" key={v.id}>
              <div className="top">
                <h3>{v.titulo}</h3>
                {v.local && <span className="pill">{v.local}</span>}
              </div>
              <p style={{ marginTop: 12, fontSize: 14, color: "var(--coffee)" }}>{v.descricao}</p>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
