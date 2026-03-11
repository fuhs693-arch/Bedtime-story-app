import { useState, useEffect, useRef } from "react";

const THEMES = [
  { id: "dragons", label: "Dragons & Magic", emoji: "🐉" },
  { id: "space", label: "Outer Space", emoji: "🚀" },
  { id: "ocean", label: "Under the Sea", emoji: "🐠" },
  { id: "forest", label: "Enchanted Forest", emoji: "🌲" },
  { id: "dinosaurs", label: "Dinosaurs", emoji: "🦕" },
  { id: "fairies", label: "Fairies & Pixies", emoji: "🧚" },
  { id: "superheroes", label: "Superheroes", emoji: "🦸" },
  { id: "pirates", label: "Pirates & Treasure", emoji: "🏴‍☠️" },
  { id: "animals", label: "Talking Animals", emoji: "🦁" },
  { id: "candy", label: "Candy Kingdom", emoji: "🍭" },
];

const MOODS = [
  { id: "adventurous", label: "Adventure", emoji: "⚔️" },
  { id: "funny", label: "Funny", emoji: "😄" },
  { id: "calm", label: "Calm & Peaceful", emoji: "🌙" },
  { id: "magical", label: "Magical", emoji: "✨" },
  { id: "brave", label: "Brave & Bold", emoji: "🦁" },
];

const LENGTHS = [
  { id: "short", label: "Quick (2 min)", words: "200" },
  { id: "medium", label: "Classic (5 min)", words: "400" },
  { id: "long", label: "Epic (10 min)", words: "700" },
];

const AGES = ["2–4", "5–7", "8–10", "11–12"];

const STAR_COUNT = 80;
const stars = Array.from({ length: STAR_COUNT }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 60,
  size: Math.random() * 2.5 + 0.5,
  delay: Math.random() * 4,
  duration: 2 + Math.random() * 3,
}));

function FloatingStar({ x, y, size, delay, duration }) {
  return (
    <div style={{
      position: "absolute", left: `${x}%`, top: `${y}%`,
      width: `${size}px`, height: `${size}px`, borderRadius: "50%",
      background: "white", opacity: 0.3,
      animation: `twinkle ${duration}s ease-in-out infinite`,
      animationDelay: `${delay}s`,
      pointerEvents: "none",
    }} />
  );
}

export default function BedtimeStoryGenerator() {
  const [step, setStep] = useState("form");
  const [childName, setChildName] = useState("");
  const [age, setAge] = useState("5–7");
  const [selectedThemes, setSelectedThemes] = useState([]);
  const [mood, setMood] = useState("magical");
  const [length, setLength] = useState("medium");
  const [extraDetails, setExtraDetails] = useState("");
  const [story, setStory] = useState("");
  const [storyTitle, setStoryTitle] = useState("");
  const [loadingText, setLoadingText] = useState("Sprinkling stardust…");
  const [displayedStory, setDisplayedStory] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const loadingMessages = [
    "Sprinkling stardust…","Waking up the story fairies…",
    "Lighting the enchanted lantern…","Gathering moonbeams…",
    "Writing with a magic quill…","Almost ready… 🌙",
  ];

  useEffect(() => {
    if (step !== "loading") return;
    let i = 0;
    const interval = setInterval(() => {
      i = (i + 1) % loadingMessages.length;
      setLoadingText(loadingMessages[i]);
    }, 1800);
    return () => clearInterval(interval);
  }, [step]);

  useEffect(() => {
    if (!story || step !== "story") return;
    setDisplayedStory("");
    setIsTyping(true);
    let i = 0;
    const interval = setInterval(() => {
      if (i < story.length) { setDisplayedStory(story.slice(0, i + 1)); i++; }
      else { clearInterval(interval); setIsTyping(false); }
    }, 14);
    return () => clearInterval(interval);
  }, [story, step]);

  const toggleTheme = (id) => {
    setSelectedThemes(prev =>
      prev.includes(id) ? prev.filter(t => t !== id) : prev.length < 3 ? [...prev, id] : prev
    );
  };

  const canGenerate = childName.trim().length > 0 && selectedThemes.length > 0;

  const generateStory = async () => {
    if (!canGenerate) return;
    setStep("loading");
    setStory(""); setStoryTitle("");

    const themeLabels = selectedThemes.map(id => THEMES.find(t => t.id === id)?.label).join(", ");
    const moodLabel = MOODS.find(m => m.id === mood)?.label;
    const wordCount = LENGTHS.find(l => l.id === length)?.words || "400";

    const prompt = `You are a magical bedtime story writer for children. Write a personalized bedtime story.

Child's name: ${childName}
Age group: ${age} years old
Themes: ${themeLabels}
Mood: ${moodLabel}
Length: ~${wordCount} words
${extraDetails ? `Extra details: ${extraDetails}` : ""}

- Make ${childName} the HERO
- Age-appropriate language
- Soothing, peaceful ending (child drifts to sleep)
- Vivid imaginative descriptions
- Gentle moral woven in

Respond ONLY with valid JSON, no markdown:
{"title":"Story title","story":"Full story with paragraph breaks using \\n\\n"}`;

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1500,
          messages: [{ role: "user", content: prompt }]
        })
      });
      const data = await res.json();
      const text = data.content?.find(b => b.type === "text")?.text || "";
      try {
        const parsed = JSON.parse(text.replace(/```json|```/g, "").trim());
        setStoryTitle(parsed.title || "A Magical Story");
        setStory(parsed.story || text);
      } catch {
        setStoryTitle(`${childName}'s Magical Adventure`);
        setStory(text);
      }
      setStep("story");
    } catch {
      setStoryTitle("Oops…");
      setStory("The story fairies are asleep! Please try again. 🌙");
      setStep("story");
    }
  };

  const reset = () => {
    setStep("form"); setStory(""); setStoryTitle(""); setDisplayedStory("");
    setChildName(""); setSelectedThemes([]); setMood("magical");
    setLength("medium"); setExtraDetails(""); setAge("5–7");
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(180deg,#02050f 0%,#060d1f 40%,#0c1a35 70%,#0f1e3d 100%)",
      color: "#e8dcc8", fontFamily: "Georgia, 'Times New Roman', serif",
      position: "relative", overflowX: "hidden",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600&family=Crimson+Text:ital,wght@0,400;0,600;1,400&display=swap');
        @keyframes twinkle { 0%,100%{opacity:0.2;transform:scale(1)} 50%{opacity:0.9;transform:scale(1.5)} }
        @keyframes moonGlow { 0%,100%{box-shadow:0 0 40px 15px rgba(255,220,120,0.15),0 0 80px 30px rgba(255,200,80,0.08)} 50%{box-shadow:0 0 60px 25px rgba(255,220,120,0.25),0 0 120px 50px rgba(255,200,80,0.12)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes shimmer { 0%,100%{opacity:0.4} 50%{opacity:1} }
        @keyframes cloudDrift { 0%{transform:translateX(-10px)} 100%{transform:translateX(10px)} }
        .fade-up { animation: fadeUp 0.5s ease both; }
        .fade-1 { animation: fadeUp 0.5s 0.1s ease both; }
        .fade-2 { animation: fadeUp 0.5s 0.2s ease both; }
        .fade-3 { animation: fadeUp 0.5s 0.3s ease both; }
        .fade-4 { animation: fadeUp 0.5s 0.4s ease both; }
        .theme-chip { cursor:pointer; border:1.5px solid rgba(255,220,120,0.2); background:rgba(255,220,120,0.04); border-radius:40px; padding:8px 14px; font-size:13px; color:#c4b08a; transition:all 0.2s; display:flex; align-items:center; gap:6px; font-family:'Crimson Text',serif; }
        .theme-chip:hover { border-color:rgba(255,220,120,0.5); background:rgba(255,220,120,0.08); color:#f5dfa0; }
        .theme-chip.on { border-color:#f5c842; background:rgba(245,200,66,0.15); color:#f5dfa0; box-shadow:0 0 12px rgba(245,200,66,0.2); }
        .mood-btn { cursor:pointer; border:1.5px solid rgba(180,160,220,0.2); background:rgba(180,160,220,0.04); border-radius:10px; padding:9px 14px; font-size:13px; color:#b0a0d0; transition:all 0.2s; font-family:'Crimson Text',serif; }
        .mood-btn:hover { border-color:rgba(180,160,220,0.5); }
        .mood-btn.on { border-color:#c8a8ff; background:rgba(200,168,255,0.15); color:#e0d0ff; box-shadow:0 0 12px rgba(200,168,255,0.2); }
        .len-btn { cursor:pointer; border:1.5px solid rgba(120,200,180,0.2); background:rgba(120,200,180,0.04); border-radius:10px; padding:9px 14px; font-size:13px; color:#80c0b0; transition:all 0.2s; font-family:'Crimson Text',serif; flex:1; text-align:center; }
        .len-btn:hover { border-color:rgba(120,200,180,0.5); }
        .len-btn.on { border-color:#68d8c0; background:rgba(104,216,192,0.15); color:#a8f0e0; box-shadow:0 0 12px rgba(104,216,192,0.2); }
        .age-btn { cursor:pointer; border:1.5px solid rgba(255,180,120,0.2); background:rgba(255,180,120,0.04); border-radius:8px; padding:8px 14px; font-size:13px; color:#d4a080; transition:all 0.2s; font-family:'Crimson Text',serif; }
        .age-btn.on { border-color:#ffaa60; background:rgba(255,170,96,0.15); color:#ffd0a0; }
        .gen-btn { background:linear-gradient(135deg,#c8900a,#f5c842,#c8900a); border:none; border-radius:50px; padding:16px 48px; font-size:17px; color:#1a0e00; font-family:'Cinzel',serif; font-weight:600; letter-spacing:0.08em; cursor:pointer; transition:all 0.3s; box-shadow:0 4px 30px rgba(245,200,66,0.3); }
        .gen-btn:hover { transform:translateY(-2px); box-shadow:0 8px 40px rgba(245,200,66,0.5); }
        .gen-btn:disabled { opacity:0.3; cursor:not-allowed; transform:none; }
        .act-btn { border-radius:40px; padding:11px 24px; font-family:'Cinzel',serif; font-size:13px; cursor:pointer; letter-spacing:0.05em; transition:all 0.2s; }
        input,textarea { background:rgba(255,255,255,0.05); border:1.5px solid rgba(255,220,120,0.2); color:#e8dcc8; border-radius:12px; padding:12px 16px; font-family:'Crimson Text',serif; font-size:16px; outline:none; width:100%; box-sizing:border-box; transition:border-color 0.2s; }
        input:focus,textarea:focus { border-color:rgba(255,220,120,0.5); }
        input::placeholder,textarea::placeholder { color:rgba(200,180,140,0.35); }
        ::-webkit-scrollbar{width:4px} ::-webkit-scrollbar-thumb{background:rgba(245,200,66,0.2);border-radius:4px}
      `}</style>

      {stars.map(s => <FloatingStar key={s.id} {...s} />)}

      <div style={{
        position:"fixed", top:36, right:60, width:80, height:80, borderRadius:"50%",
        background:"radial-gradient(circle at 35% 35%,#fff8e0,#f5d870 40%,#e8b830 70%,#c49020)",
        animation:"moonGlow 4s ease-in-out infinite", zIndex:0, opacity:0.85,
      }}>
        <div style={{position:"absolute",top:18,left:16,width:11,height:11,borderRadius:"50%",background:"rgba(150,100,20,0.25)"}}/>
        <div style={{position:"absolute",top:40,left:44,width:7,height:7,borderRadius:"50%",background:"rgba(150,100,20,0.2)"}}/>
      </div>

      {[{top:"10%",left:"-4%",op:0.06,sc:1.1,dur:"8s"},{top:"22%",right:"8%",op:0.05,sc:0.8,dur:"11s"}].map((c,i)=>(
        <div key={i} style={{position:"fixed",top:c.top,left:c.left,right:c.right,fontSize:70,opacity:c.op,transform:`scale(${c.sc})`,animation:`cloudDrift ${c.dur} ease-in-out infinite alternate`,zIndex:0,filter:"blur(2px)",userSelect:"none",pointerEvents:"none"}}>☁️</div>
      ))}

      <div style={{position:"relative",zIndex:1,maxWidth:660,margin:"0 auto",padding:"44px 20px 80px"}}>

        <div className="fade-up" style={{textAlign:"center",marginBottom:44}}>
          <div style={{fontSize:46,marginBottom:10}}>🌙</div>
          <h1 style={{fontFamily:"'Cinzel',serif",fontSize:"clamp(24px,5vw,36px)",fontWeight:600,letterSpacing:"0.06em",color:"#f5dfa0",margin:"0 0 8px",textShadow:"0 0 40px rgba(245,200,66,0.3)"}}>
            Once Upon a Dream
          </h1>
          <p style={{color:"#7a6a50",fontSize:15,fontFamily:"'Crimson Text',serif",fontStyle:"italic",margin:0}}>
            Personalized bedtime stories, magically crafted for your little one
          </p>
        </div>

        {step === "form" && (
          <div>
            <div className="fade-1" style={{marginBottom:26}}>
              <label style={{display:"block",marginBottom:9,color:"#c4a870",fontSize:13,fontFamily:"'Cinzel',serif",letterSpacing:"0.08em"}}>✨ CHILD'S NAME</label>
              <input value={childName} onChange={e=>setChildName(e.target.value)} placeholder="e.g. Zara, Ali, Emma…" maxLength={30}/>
            </div>

            <div className="fade-1" style={{marginBottom:26}}>
              <label style={{display:"block",marginBottom:9,color:"#c4a870",fontSize:13,fontFamily:"'Cinzel',serif",letterSpacing:"0.08em"}}>🎂 AGE GROUP</label>
              <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                {AGES.map(a=><button key={a} className={`age-btn${age===a?" on":""}`} onClick={()=>setAge(a)}>{a} yrs</button>)}
              </div>
            </div>

            <div className="fade-2" style={{marginBottom:26}}>
              <label style={{display:"block",marginBottom:9,color:"#c4a870",fontSize:13,fontFamily:"'Cinzel',serif",letterSpacing:"0.08em"}}>🌟 STORY THEMES <span style={{color:"#5a4a30",fontSize:11,fontWeight:"normal"}}>(pick up to 3)</span></label>
              <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
                {THEMES.map(t=>(
                  <button key={t.id} className={`theme-chip${selectedThemes.includes(t.id)?" on":""}`} onClick={()=>toggleTheme(t.id)}>
                    {t.emoji} {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="fade-3" style={{marginBottom:26}}>
              <label style={{display:"block",marginBottom:9,color:"#c4a870",fontSize:13,fontFamily:"'Cinzel',serif",letterSpacing:"0.08em"}}>🌠 STORY MOOD</label>
              <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                {MOODS.map(m=><button key={m.id} className={`mood-btn${mood===m.id?" on":""}`} onClick={()=>setMood(m.id)}>{m.emoji} {m.label}</button>)}
              </div>
            </div>

            <div className="fade-3" style={{marginBottom:26}}>
              <label style={{display:"block",marginBottom:9,color:"#c4a870",fontSize:13,fontFamily:"'Cinzel',serif",letterSpacing:"0.08em"}}>📖 STORY LENGTH</label>
              <div style={{display:"flex",gap:8}}>
                {LENGTHS.map(l=><button key={l.id} className={`len-btn${length===l.id?" on":""}`} onClick={()=>setLength(l.id)}>{l.label}</button>)}
              </div>
            </div>

            <div className="fade-4" style={{marginBottom:34}}>
              <label style={{display:"block",marginBottom:9,color:"#c4a870",fontSize:13,fontFamily:"'Cinzel',serif",letterSpacing:"0.08em"}}>🪄 SPECIAL DETAILS <span style={{color:"#5a4a30",fontSize:11,fontWeight:"normal"}}>(optional)</span></label>
              <textarea value={extraDetails} onChange={e=>setExtraDetails(e.target.value)} placeholder="e.g. favourite toy is a blue rabbit, best friend is Hamza, scared of the dark…" rows={3} style={{resize:"none"}}/>
            </div>

            <div style={{textAlign:"center"}}>
              <button className="gen-btn" onClick={generateStory} disabled={!canGenerate}>🌙 Begin the Story</button>
              {!canGenerate && <p style={{marginTop:10,color:"#4a3a20",fontSize:13,fontFamily:"'Crimson Text',serif",fontStyle:"italic"}}>Add a name and at least one theme to begin ✨</p>}
            </div>
          </div>
        )}

        {step === "loading" && (
          <div style={{textAlign:"center",padding:"80px 20px"}}>
            <div style={{fontSize:60,marginBottom:22,animation:"shimmer 1.5s ease-in-out infinite"}}>🪄</div>
            <p style={{fontFamily:"'Cinzel',serif",fontSize:19,color:"#f5dfa0",marginBottom:10,letterSpacing:"0.05em"}}>{loadingText}</p>
            <p style={{color:"#4a3a20",fontSize:14,fontStyle:"italic",fontFamily:"'Crimson Text',serif"}}>Crafting a story just for {childName}…</p>
            <div style={{marginTop:28,display:"flex",justifyContent:"center",gap:8}}>
              {[0,1,2].map(i=>(
                <div key={i} style={{width:8,height:8,borderRadius:"50%",background:"#f5c842",animation:"shimmer 1.2s ease-in-out infinite",animationDelay:`${i*0.3}s`}}/>
              ))}
            </div>
          </div>
        )}

        {step === "story" && (
          <div className="fade-up">
            <div style={{
              background:"linear-gradient(160deg,rgba(28,18,6,0.92) 0%,rgba(12,8,3,0.96) 100%)",
              border:"1px solid rgba(245,200,66,0.18)", borderRadius:20,
              padding:"36px 32px", boxShadow:"0 20px 80px rgba(0,0,0,0.6),inset 0 1px 0 rgba(255,220,120,0.08)",
              position:"relative", overflow:"hidden",
            }}>
              <div style={{position:"absolute",top:14,left:18,fontSize:24,opacity:0.22}}>🌿</div>
              <div style={{position:"absolute",top:14,right:18,fontSize:24,opacity:0.22}}>🌿</div>
              <div style={{position:"absolute",bottom:14,left:18,fontSize:22,opacity:0.18}}>⭐</div>
              <div style={{position:"absolute",bottom:14,right:18,fontSize:22,opacity:0.18}}>⭐</div>

              <h2 style={{fontFamily:"'Cinzel',serif",textAlign:"center",fontSize:"clamp(17px,4vw,24px)",color:"#f5dfa0",marginBottom:6,letterSpacing:"0.05em",textShadow:"0 0 30px rgba(245,200,66,0.3)"}}>
                {storyTitle}
              </h2>
              <div style={{textAlign:"center",marginBottom:28,color:"#5a4a30",fontSize:13}}>✦ ✦ ✦</div>

              <div style={{fontFamily:"'Crimson Text',serif",fontSize:19,lineHeight:1.9,color:"#e0d4bc",letterSpacing:"0.01em"}}>
                {displayedStory.split("\n\n").map((para,i)=>(
                  <p key={i} style={{marginBottom:"1.3em",marginTop:0}}>
                    {i===0&&para.length>0&&(
                      <span style={{float:"left",fontSize:"3.6em",lineHeight:0.75,marginRight:6,marginTop:8,color:"#f5c842",fontFamily:"'Cinzel',serif",textShadow:"0 0 20px rgba(245,200,66,0.4)"}}>
                        {para[0]}
                      </span>
                    )}
                    {i===0 ? para.slice(1) : para}
                  </p>
                ))}
                {isTyping && <span style={{display:"inline-block",width:2,height:"1em",background:"#f5c842",verticalAlign:"text-bottom",animation:"shimmer 0.8s infinite",marginLeft:2}}/>}
              </div>

              {!isTyping && <div style={{textAlign:"center",marginTop:28,fontSize:26,opacity:0.55}}>🌙 ★ 🌙</div>}
            </div>

            {!isTyping && (
              <div style={{display:"flex",gap:10,marginTop:20,justifyContent:"center",flexWrap:"wrap"}}>
                <button className="act-btn" onClick={generateStory} style={{background:"rgba(245,200,66,0.1)",border:"1.5px solid rgba(245,200,66,0.3)",color:"#f5dfa0"}}>🔄 New Version</button>
                <button className="act-btn" onClick={reset} style={{background:"rgba(200,168,255,0.1)",border:"1.5px solid rgba(200,168,255,0.3)",color:"#d0b8ff"}}>✨ New Story</button>
                <button className="act-btn" onClick={()=>navigator.clipboard?.writeText(`${storyTitle}\n\n${story}`)} style={{background:"rgba(104,216,192,0.1)",border:"1.5px solid rgba(104,216,192,0.3)",color:"#a0e8d8"}}>📋 Copy</button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
