"use client";
import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import Papa from "papaparse";

// ═══════════════════════════════════════════════════════════════════════
// TASTI OUTBOUND ENGINE — Partnership & Affiliate Growth
// ═══════════════════════════════════════════════════════════════════════

const C = { navy:"#f5f1ed", deep:"#faf7f3", card:"#fff9f5", border:"rgba(0,0,0,0.08)", bL:"rgba(0,0,0,0.04)", teal:"#d4794f", teal2:"#e8956a", blue:"#8b6f47", blue2:"#a89968", gold:"#f5deb3", white:"#2b2520", soft:"rgba(43,37,32,0.75)", muted:"#9d8b7e", red:"#c85a54", purple:"#b8956a" };
const F = "'Plus Jakarta Sans',-apple-system,sans-serif";
const M = "'DM Mono',monospace";
const GRAD = "linear-gradient(90deg,#d4794f,#e8956a)";

// ─── STATUSES ────────────────────────────────────────────────────────
const SL = ["not_contacted","request_sent","accepted_dm","following_up","replied_followup","booked","second_call","not_interested","closed"];
const SS = {
  not_contacted:{ bg:"rgba(212,121,79,0.08)", text:"#8b6f47", dot:"#a89968" },
  request_sent:{ bg:"rgba(139,111,71,0.08)", text:"#8b6f47", dot:"#a89968" },
  accepted_dm:{ bg:"rgba(212,121,79,0.12)", text:"#d4794f", dot:"#d4794f" },
  following_up:{ bg:"rgba(232,149,106,0.08)", text:"#e8956a", dot:"#e8956a" },
  replied_followup:{ bg:"rgba(184,149,106,0.10)", text:"#b8956a", dot:"#9d8b7e" },
  booked:{ bg:"rgba(212,121,79,0.15)", text:"#c85a54", dot:"#c85a54" },
  second_call:{ bg:"rgba(184,149,106,0.12)", text:"#b8956a", dot:"#a89968" },
  not_interested:{ bg:"rgba(200,90,84,0.08)", text:"#c85a54", dot:"#c85a54" },
  closed:{ bg:"rgba(139,111,71,0.08)", text:"#8b6f47", dot:"#9d8b7e" },
};
const fmtS = s => {
  const labels = { not_contacted:"Not Contacted", request_sent:"Request Sent", accepted_dm:"Accepted / DM Sent", following_up:"Following Up", replied_followup:"Replied / Follow Up", booked:"Booked", second_call:"2nd Call", not_interested:"Not Interested", closed:"Closed" };
  return labels[s] || (s||"").replace(/_/g," ").replace(/\b\w/g,c=>c.toUpperCase());
};

// ─── SIDEBAR VIEWS ───────────────────────────────────────────────────
const PIPELINE = [
  { id:"all", label:"All Leads", icon:"◈" },
  { id:"not_contacted", label:"Not Contacted", icon:"○" },
  { id:"request_sent", label:"Request Sent", icon:"◐" },
  { id:"accepted_dm", label:"Accepted / DM Sent", icon:"●" },
  { id:"following_up", label:"Following Up", icon:"◉" },
  { id:"replied_followup", label:"Replied / Follow Up", icon:"↩" },
  { id:"due_today", label:"Due Today", icon:"⚡" },
  { id:"booked", label:"Booked", icon:"★" },
  { id:"second_call", label:"2nd Call", icon:"★★" },
  { id:"not_interested", label:"Not Interested", icon:"✕" },
  { id:"closed", label:"Closed", icon:"💰" },
];

const PERSONAS = ["Executive","Director","Business Dev"];
const PC = { "Executive":"#d4794f", "Director":"#e8956a", "Business Dev":"#8b6f47" };

// ─── HELPERS ─────────────────────────────────────────────────────────
const td = () => new Date().toISOString().split("T")[0];
const addD = (d,n) => { const dt=new Date(d); dt.setDate(dt.getDate()+n); return dt.toISOString().split("T")[0]; };
const isOv = d => d && d <= td();
const fmtD = d => { if(!d||d==="") return "—"; return new Date(d+"T12:00:00").toLocaleDateString("en-US",{month:"short",day:"numeric"}); };
const hasE = l => l.email && l.email.includes("@");

function classP(title) {
  if(!title) return "Executive"; const t=title.toLowerCase();
  if(/\b(ceo|president|founder|executive|chief|vp|vice president|managing director)\b/.test(t)) return "Executive";
  if(/\b(director|head of|manager|officer)\b/.test(t)) return "Director";
  if(/\b(sales|business development|account|partnership|strategy)\b/.test(t)) return "Business Dev";
  return "Executive";
}

// ─── AI PROMPTS ──────────────────────────────────────────────────────
const FIN = "Tasti makes premium high-protein ice cream mixes (25g protein, low sugar, 100% natural) designed for Ninja Creami machines. Perfect for food & beverage companies, retailers, and distributors. Partnership opportunities: wholesale B2B, white-label, co-packing, retail partnerships.";
const PA = { "Executive":"growth opportunities, revenue streams, market expansion", "Director":"product integration, operational partnerships, supply chain", "Business Dev":"deal structure, wholesale pricing, distribution agreements", Other:"partnership opportunity, business growth" };

function emailPrompt(l) {
  const p=l.persona||classP(l.title);
  return "Write a personalized cold email opening line for Tasti's B2B partnerships team.\n\nTASTI: "+FIN+"\n\nLEAD: "+(l.full_name||l.first_name+" "+l.last_name)+", "+(l.title||"?")+" at "+(l.company||"?")+" ("+l.state+"), LinkedIn: "+(l.linkedin_about||"N/A")+"\nRole: "+(PA[p]||PA.Other)+"\n\nRULES: 1-2 sentences MAX. Focus on B2B partnership value, distribution opportunity, or co-packing. Reference their company/industry if possible. NO flattery, NO 'hope you're well', NO 'I came across'. Executive tone, professional.\n\nReturn ONLY the opening line. No JSON.";
}

function liPrompt(l) {
  const p=l.persona||classP(l.title);
  return "Generate LinkedIn outreach messages for Tasti's B2B partnerships team.\n\nTASTI: "+FIN+"\n\nLEAD: "+(l.full_name||l.first_name+" "+l.last_name)+", "+(l.title||"?")+" at "+(l.company||"?")+" ("+l.state+"), LinkedIn: "+(l.linkedin_about||"N/A")+"\nRole: "+(PA[p]||PA.Other)+"\n\nCreate 3 sharp, professional LinkedIn messages focused on B2B partnership value (wholesale, distribution, white-label, co-packing). No fake compliments or product pitch.\n\nReturn ONLY valid JSON:\n{\"linkedin_connection_note\":\"<280 chars max>\",\"linkedin_dm_1\":\"<3-4 sentences, B2B partnership focus>\",\"linkedin_followup_1\":\"<2-3 sentences>\",\"linkedin_followup_2\":\"<1-2 sentences>\"}";
}

async function aiCall(prompt) {
  try {
    const r=await fetch("/api/generate",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({prompt})});
    const d=await r.json();
    if(d.success) return d.data;
    console.error("AI error:",d.error);
    return {_error:d.error||"AI generation failed"};
  } catch(e) { console.error("AI:",e); return {_error:e.message}; }
}

// ─── GOOGLE SHEETS (paginated) ───────────────────────────────────────
async function gsFetch(url, onP) {
  let all=[], off=0, lim=500, tot=Infinity;
  while(off<tot) {
    const r=await fetch("/api/sheets?scriptUrl="+encodeURIComponent(url)+"&action=getLeads&offset="+off+"&limit="+lim);
    const d=await r.json();
    if(!d.success) throw new Error(d.error||"Failed");
    all=all.concat(d.data||[]); tot=d.total||0; off+=lim;
    if(onP) onP(all.length, tot);
    if(!d.data||!d.data.length) break;
  }
  return all.map(l=>({...l,lead_score:parseInt(l.lead_score)||0,linkedin_step:parseInt(l.linkedin_step)||0}));
}
async function gsUp(url,id,u){try{await fetch("/api/sheets",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({scriptUrl:url,action:"updateLead",id,updates:u})})}catch(e){console.error(e)}}
async function gsBk(url,list){try{await fetch("/api/sheets",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({scriptUrl:url,action:"bulkUpdate",updates:list})})}catch(e){console.error(e)}}
async function gsAd(url,lead){try{await fetch("/api/sheets",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({scriptUrl:url,action:"addLead",lead})})}catch(e){console.error(e)}}

// ─── LOCAL CACHE ─────────────────────────────────────────────────────
function cacheGet(k){ try{return JSON.parse(localStorage.getItem(k))}catch{return null} }
function cacheSet(k,v){ try{localStorage.setItem(k,JSON.stringify(v))}catch{} }

// ─── COMPONENTS ──────────────────────────────────────────────────────
function Logo() {
  return <div style={{padding:"20px 16px",borderBottom:`1px solid ${C.bL}`}}>
    <img src="/tasti-logo.png" alt="Tasti" height={52} style={{display:"block",maxWidth:150,objectFit:"contain"}}/>
    <div style={{fontSize:10,fontWeight:600,letterSpacing:2.5,textTransform:"uppercase",color:C.muted,marginTop:6,fontFamily:F}}>Outbound Engine</div>
  </div>;
}

function SBadge({status,onClick}){
  const s=SS[status]||SS.not_contacted;
  return <span onClick={onClick} style={{display:"inline-flex",alignItems:"center",gap:6,padding:"3px 10px",borderRadius:20,fontSize:11,fontWeight:600,background:s.bg,color:s.text,cursor:onClick?"pointer":"default",transition:"all .2s",border:"1px solid transparent",whiteSpace:"nowrap"}}
    onMouseEnter={e=>{if(onClick)e.currentTarget.style.borderColor=s.dot}} onMouseLeave={e=>e.currentTarget.style.borderColor="transparent"}>
    <span style={{width:6,height:6,borderRadius:3,background:s.dot,flexShrink:0}}/>{fmtS(status)}{onClick&&<span style={{fontSize:9,marginLeft:2}}>▾</span>}
  </span>;
}

function SDrop({current,onSel,onClose}){
  return <div style={{position:"absolute",top:"100%",left:0,zIndex:60,background:C.card,border:`1px solid ${C.border}`,borderRadius:10,padding:4,minWidth:180,boxShadow:"0 12px 40px rgba(0,0,0,.6)",animation:"fadeUp .15s ease"}} onClick={e=>e.stopPropagation()}>
    {SL.map(s=><button key={s} onClick={()=>{onSel(s);onClose()}} style={{display:"flex",alignItems:"center",gap:8,width:"100%",padding:"7px 10px",border:"none",borderRadius:6,cursor:"pointer",fontSize:12,fontFamily:F,background:s===current?"rgba(0,219,168,0.1)":"transparent",color:s===current?C.teal:(SS[s]||{}).text||C.soft,transition:"background .1s"}}
      onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,0.04)"} onMouseLeave={e=>e.currentTarget.style.background=s===current?"rgba(0,219,168,0.1)":"transparent"}>
      <span style={{width:6,height:6,borderRadius:3,background:(SS[s]||{}).dot||C.muted,flexShrink:0}}/>{fmtS(s)}
    </button>)}
  </div>;
}

function KPI({label,value,color,onClick,active}){
  return <div onClick={onClick} style={{background:C.card,border:`1px solid ${active?C.teal:C.border}`,borderRadius:12,padding:"12px 16px",flex:1,minWidth:95,cursor:onClick?"pointer":"default",transition:"all .2s",transform:active?"translateY(-1px)":"none",boxShadow:active?"0 4px 20px rgba(0,219,168,.12)":"none"}}
    onMouseEnter={e=>{if(onClick){e.currentTarget.style.borderColor=C.teal;e.currentTarget.style.transform="translateY(-1px)"}}}
    onMouseLeave={e=>{if(onClick&&!active){e.currentTarget.style.borderColor=C.border;e.currentTarget.style.transform="none"}}}>
    <div style={{fontSize:9,textTransform:"uppercase",letterSpacing:2.5,color:C.muted,marginBottom:3,fontFamily:F}}>{label}</div>
    <div style={{fontSize:22,fontWeight:700,color:color||C.white,letterSpacing:-.5,fontFamily:F}}>{value}</div>
  </div>;
}

function Btn({children,onClick,disabled,style:s,small,ghost}){
  return <button onClick={onClick} disabled={disabled} style={{padding:small?"4px 10px":"7px 14px",fontSize:small?11:12,fontWeight:600,borderRadius:8,border:ghost?`1px solid ${C.border}`:"none",cursor:disabled?"not-allowed":"pointer",opacity:disabled?.4:1,transition:"all .15s",color:C.white,background:ghost?"transparent":undefined,fontFamily:F,whiteSpace:"nowrap",...s}}
    onMouseEnter={e=>{if(!disabled){e.currentTarget.style.opacity=".85";e.currentTarget.style.transform="translateY(-1px)"}}}
    onMouseLeave={e=>{e.currentTarget.style.opacity=disabled?.4:"1";e.currentTarget.style.transform="none"}}>{children}</button>;
}

function CopyField({label,value}){
  const[ok,setOk]=useState(false);
  return <div style={{marginBottom:14}}><div style={{fontSize:10,letterSpacing:1.5,textTransform:"uppercase",color:C.muted,marginBottom:4,fontFamily:F}}>{label}</div><div style={{background:C.deep,border:`1px solid ${C.border}`,borderRadius:10,padding:12,fontSize:13,color:value?C.soft:"#3a5070",lineHeight:1.6,whiteSpace:"pre-wrap",fontStyle:value?"normal":"italic",minHeight:28,fontFamily:F}}>{value||"Not generated"}</div>{value&&<button onClick={()=>{navigator.clipboard.writeText(value);setOk(true);setTimeout(()=>setOk(false),1500)}} style={{fontSize:11,color:ok?C.teal:C.blue2,background:"none",border:"none",cursor:"pointer",marginTop:3,fontFamily:F}}>{ok?"Copied!":"Copy"}</button>}</div>;
}

// ─── SETTINGS ────────────────────────────────────────────────────────
function Settings({url,onSave,onClose}){
  const[v,setV]=useState(url);
  return <div style={{position:"fixed",inset:0,zIndex:100,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(0,0,0,.7)",backdropFilter:"blur(6px)"}} onClick={onClose}><div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:18,width:"100%",maxWidth:520,padding:28,animation:"fadeUp .2s ease"}} onClick={e=>e.stopPropagation()}>
    <h2 style={{fontSize:18,fontWeight:700,color:C.white,margin:"0 0 4px",fontFamily:F}}>Connect Google Sheet</h2>
    <p style={{fontSize:13,color:C.muted,margin:"0 0 20px",lineHeight:1.6,fontFamily:F}}>Paste your Apps Script web app URL.</p>
    <input value={v} onChange={e=>setV(e.target.value)} placeholder="https://script.google.com/macros/s/.../exec" style={{width:"100%",padding:"10px 14px",fontSize:13,background:C.navy,border:`1px solid ${C.border}`,borderRadius:10,color:C.white,outline:"none",boxSizing:"border-box",marginBottom:16,fontFamily:F}}/>
    <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}>
      <Btn onClick={onClose} ghost>Cancel</Btn>
      <Btn onClick={()=>onSave(v)} disabled={!v.includes("script.google.com")} style={{background:GRAD}}>Connect & Sync</Btn>
    </div>
  </div></div>;
}

// ─── ADD LEAD ────────────────────────────────────────────────────────
function AddLead({onClose,onAdd}){
  const[f,sF]=useState({first_name:"",last_name:"",email:"",title:"",company:"",company_url:"",institution_type:"Bank",state:"",linkedin_url:"",asset_size:""});
  const set=(k,v)=>sF(p=>({...p,[k]:v}));
  const inp=(l,k,ph)=><div style={{marginBottom:10}}><div style={{fontSize:10,textTransform:"uppercase",letterSpacing:1.5,color:C.muted,marginBottom:3,fontFamily:F}}>{l}</div><input value={f[k]} onChange={e=>set(k,e.target.value)} placeholder={ph||""} style={{width:"100%",padding:"8px 12px",fontSize:13,background:C.navy,border:`1px solid ${C.border}`,borderRadius:8,color:C.white,outline:"none",boxSizing:"border-box",fontFamily:F}}/></div>;
  const go=()=>{onAdd({...f,id:crypto.randomUUID(),full_name:`${f.first_name} ${f.last_name}`.trim(),status:"not_contacted",linkedin_step:0,lead_score:0,persona:classP(f.title),export_status:"not_exported",created_at:new Date().toISOString(),updated_at:new Date().toISOString()});onClose()};
  return <div style={{position:"fixed",inset:0,zIndex:100,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(0,0,0,.7)",backdropFilter:"blur(6px)"}} onClick={onClose}><div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:18,width:"100%",maxWidth:500,padding:28,maxHeight:"85vh",overflowY:"auto",animation:"fadeUp .2s ease"}} onClick={e=>e.stopPropagation()}>
    <h2 style={{fontSize:18,fontWeight:700,color:C.white,margin:"0 0 16px",fontFamily:F}}>Add Lead</h2>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 12px"}}>{inp("First Name","first_name","John")}{inp("Last Name","last_name","Smith")}</div>
    {inp("Email","email","john@bank.com")}{inp("Title","title","CEO")}{inp("Company","company","First National Bank")}{inp("Company URL","company_url","firstnationalbank.com")}
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 12px"}}>
      <div style={{marginBottom:10}}><div style={{fontSize:10,textTransform:"uppercase",letterSpacing:1.5,color:C.muted,marginBottom:3,fontFamily:F}}>Type</div><select value={f.institution_type} onChange={e=>set("institution_type",e.target.value)} style={{width:"100%",padding:"8px 12px",fontSize:13,background:C.navy,border:`1px solid ${C.border}`,borderRadius:8,color:C.white,outline:"none",fontFamily:F}}><option>Bank</option><option>Credit Union</option><option>Other</option></select></div>
      {inp("State","state","MA")}
    </div>
    {inp("LinkedIn URL","linkedin_url")}{inp("Asset Size","asset_size","$2.1B")}
    <div style={{display:"flex",gap:10,justifyContent:"flex-end",marginTop:12}}><Btn onClick={onClose} ghost>Cancel</Btn><Btn onClick={go} disabled={!f.first_name&&!f.last_name} style={{background:GRAD}}>Add Lead</Btn></div>
  </div></div>;
}

// ─── DRAWER ──────────────────────────────────────────────────────────
function Drawer({lead,onClose,onUpd,onAct,onDel,aiL,sUrl}){
  const[tab,setTab]=useState("overview");
  const[notes,setNotes]=useState(lead?.notes||"");
  const[liGen,setLiGen]=useState(false);
  const[liM,setLiM]=useState({});
  const[efL,setEfL]=useState(false);const[efR,setEfR]=useState(null);
  useEffect(()=>{setNotes(lead?.notes||"");setTab("overview");setEfR(null);setLiM({linkedin_connection_note:lead?.linkedin_connection_note||"",linkedin_dm_1:lead?.linkedin_dm_1||"",linkedin_followup_1:lead?.linkedin_followup_1||"",linkedin_followup_2:lead?.linkedin_followup_2||""})},[lead?.id]);
  if(!lead) return null;
  const nm=lead.full_name||`${lead.first_name||""} ${lead.last_name||""}`.trim();

  const genLi=async()=>{setLiGen(true);const r=await aiCall(liPrompt(lead));if(r&&r._error){alert("Error: "+r._error);setLiGen(false);return}if(r&&r.linkedin_connection_note){setLiM(r);onUpd(lead.id,r)}setLiGen(false)};

  const findEmail=async()=>{
    setEfL(true);setEfR(null);
    const names=nm.split(/\s+/);const first=names[0];const last=names.slice(1).join(" ")||names[0];
    try{
      const r=await fetch("/api/hunter",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({first_name:first,last_name:last,company:lead.company||"",domain:lead.company_url||""})});
      const d=await r.json();
      setEfR(d);
      if(d.success&&d.email){onUpd(lead.id,{email:d.email})}
    }catch(e){setEfR({success:false,error:e.message})}
    setEfL(false);
  };

  return <div style={{position:"fixed",inset:0,zIndex:50,display:"flex",justifyContent:"flex-end"}} onClick={onClose}>
    <div style={{position:"absolute",inset:0,background:"rgba(0,0,0,.5)",backdropFilter:"blur(4px)"}}/>
    <div style={{position:"relative",width:"100%",maxWidth:460,background:C.navy,borderLeft:`1px solid ${C.border}`,overflowY:"auto",animation:"slideIn .2s ease"}} onClick={e=>e.stopPropagation()}>
      {/* Header */}
      <div style={{position:"sticky",top:0,zIndex:10,background:"rgba(7,20,40,.95)",backdropFilter:"blur(8px)",borderBottom:`1px solid ${C.bL}`,padding:"18px 22px"}}>
        <div style={{display:"flex",justifyContent:"space-between"}}>
          <div><div style={{fontSize:17,fontWeight:700,color:C.white,fontFamily:F}}>{nm||"—"}</div><div style={{fontSize:13,color:C.muted,marginTop:2,fontFamily:F}}>{lead.title} · {lead.company}</div></div>
          <button onClick={onClose} style={{background:"none",border:"none",color:C.muted,fontSize:18,cursor:"pointer"}}>✕</button>
        </div>
        <div style={{display:"flex",gap:8,alignItems:"center",marginTop:10,flexWrap:"wrap"}}>
          <SBadge status={lead.status}/>
          {lead.persona&&<span style={{fontSize:11,fontWeight:700,color:PC[lead.persona]||C.muted,fontFamily:F}}>{lead.persona}</span>}
        </div>
        <div style={{display:"flex",gap:4,marginTop:14}}>{["overview","email","linkedin","actions"].map(t=><button key={t} onClick={()=>setTab(t)} style={{padding:"6px 12px",fontSize:12,fontWeight:600,borderRadius:8,border:"none",cursor:"pointer",background:tab===t?C.card:"transparent",color:tab===t?C.white:C.muted,fontFamily:F,transition:"all .15s"}}>{t==="actions"?"Status":t[0].toUpperCase()+t.slice(1)}</button>)}</div>
      </div>
      <div style={{padding:22}}>
        {tab==="overview"&&<>
          <div style={{fontSize:10,textTransform:"uppercase",letterSpacing:2,color:C.muted,marginBottom:8,fontFamily:F}}>Contact</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"8px 16px",fontSize:13,marginBottom:20,fontFamily:F}}>
            <div><span style={{color:C.muted}}>Email: </span><span style={{color:C.soft}}>{lead.email||"—"}</span></div>
            <div><span style={{color:C.muted}}>State: </span><span style={{color:C.soft}}>{lead.state||"—"}</span></div>
            <div><span style={{color:C.muted}}>Type: </span><span style={{color:C.soft}}>{lead.institution_type||"—"}</span></div>
            <div><span style={{color:C.muted}}>Assets: </span><span style={{color:C.soft}}>{lead.asset_size||"—"}</span></div>
            {lead.company_url&&<div style={{gridColumn:"1/3"}}><span style={{color:C.muted}}>URL: </span><a href={(lead.company_url.startsWith("http")?lead.company_url:"https://"+lead.company_url)} target="_blank" rel="noreferrer" style={{color:C.blue2,textDecoration:"none",fontSize:13}}>{lead.company_url} ↗</a></div>}
          </div>
          {lead.linkedin_url&&<a href={lead.linkedin_url} target="_blank" rel="noreferrer" style={{fontSize:13,color:C.blue2,textDecoration:"none",fontFamily:F}}>LinkedIn ↗</a>}
          <div style={{fontSize:10,textTransform:"uppercase",letterSpacing:2,color:C.muted,marginTop:20,marginBottom:8,fontFamily:F}}>Notes</div>
          <textarea value={notes} onChange={e=>setNotes(e.target.value)} rows={3} style={{width:"100%",background:C.deep,border:`1px solid ${C.border}`,borderRadius:10,padding:12,fontSize:13,color:C.soft,resize:"none",outline:"none",boxSizing:"border-box",fontFamily:F}}/>
          <button onClick={()=>onUpd(lead.id,{notes})} style={{fontSize:11,color:C.teal,background:"none",border:"none",cursor:"pointer",marginTop:4,fontFamily:F}}>Save Notes</button>
          <div style={{borderTop:`1px solid ${C.border}`,marginTop:24,paddingTop:16}}>
            <button onClick={()=>{if(confirm("Delete this lead permanently?")){onDel(lead.id);onClose()}}} style={{fontSize:12,color:C.red,background:"none",border:`1px solid ${C.red}`,borderRadius:8,padding:"6px 14px",cursor:"pointer",fontFamily:F,transition:"all .15s"}} onMouseEnter={e=>{e.currentTarget.style.background="rgba(255,60,60,.1)"}} onMouseLeave={e=>{e.currentTarget.style.background="none"}}>Delete Contact</button>
          </div>
        </>}
        {tab==="email"&&<>
          {!hasE(lead)&&<div style={{background:C.deep,border:`1px solid ${C.border}`,borderRadius:12,padding:16,marginBottom:16}}>
            <div style={{fontSize:12,color:C.gold,marginBottom:10,fontFamily:F}}>No email on file</div>
            <Btn onClick={findEmail} disabled={efL} style={{width:"100%",padding:10,background:efL?C.card:`linear-gradient(135deg,#f5c518,#e0a800)`,fontSize:13,color:"#071428"}}>{efL?"Searching Hunter.io…":"🔍 Find Email (Hunter.io)"}</Btn>
            {efR&&<div style={{marginTop:10,fontSize:12,fontFamily:F,color:efR.success?C.teal:C.red}}>{efR.success?`Found: ${efR.email} (${efR.confidence}% confidence)`:efR.error||"Not found"}</div>}
          </div>}
          {hasE(lead)&&<>
            <Btn onClick={()=>onAct(lead.id,"gen_email")} disabled={aiL} style={{width:"100%",padding:12,background:aiL?C.card:GRAD,fontSize:13,marginBottom:16}}>{aiL?"Generating…":"Generate Email First Line"}</Btn>
            <CopyField label="Email First Line (prepend to cold email)" value={lead.email_first_line_personalization}/>
          </>}
        </>}
        {tab==="linkedin"&&<>
          <Btn onClick={genLi} disabled={liGen} style={{width:"100%",padding:12,background:liGen?C.card:`linear-gradient(135deg,${C.blue},${C.teal})`,fontSize:13,marginBottom:16}}>{liGen?"Generating…":"Generate LinkedIn Messages"}</Btn>
          <div style={{fontSize:10,textTransform:"uppercase",letterSpacing:2,color:C.muted,marginBottom:8,fontFamily:F}}>Step {lead.linkedin_step||0}/3</div>
          <div style={{display:"flex",gap:4,marginBottom:10}}>{[1,2,3].map(s=><div key={s} style={{flex:1,height:5,borderRadius:3,background:(lead.linkedin_step||0)>=s?C.teal:C.deep,transition:"background .3s"}}/>)}</div>
          {lead.next_linkedin_followup_date&&<div style={{fontSize:12,color:C.muted,marginBottom:16,fontFamily:F}}>Next follow-up: <span style={{color:isOv(lead.next_linkedin_followup_date)?C.gold:C.soft,fontWeight:isOv(lead.next_linkedin_followup_date)?700:400}}>{fmtD(lead.next_linkedin_followup_date)}</span></div>}
          <CopyField label="Connection Note (280 char)" value={liM.linkedin_connection_note}/>
          <CopyField label="DM 1" value={liM.linkedin_dm_1}/>
          <CopyField label="Follow-Up 1" value={liM.linkedin_followup_1}/>
          <CopyField label="Follow-Up 2" value={liM.linkedin_followup_2}/>
        </>}
        {tab==="actions"&&<>
          <div style={{fontSize:10,textTransform:"uppercase",letterSpacing:2,color:C.muted,marginBottom:12,fontFamily:F}}>Change Status</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
            {SL.map(s=>{const st=SS[s]||SS.not_contacted;return <button key={s} onClick={()=>onAct(lead.id,s)} style={{padding:"10px 12px",fontSize:12,fontWeight:600,borderRadius:10,border:lead.status===s?`2px solid ${st.dot}`:`1px solid ${C.border}`,background:lead.status===s?st.bg:"transparent",color:lead.status===s?st.text:C.soft,cursor:"pointer",fontFamily:F,transition:"all .15s",textAlign:"left",display:"flex",alignItems:"center",gap:8}}
              onMouseEnter={e=>e.currentTarget.style.background=st.bg} onMouseLeave={e=>{if(lead.status!==s)e.currentTarget.style.background="transparent"}}>
              <span style={{width:8,height:8,borderRadius:4,background:st.dot,flexShrink:0}}/>{fmtS(s)}
            </button>})}
          </div>

        </>}
      </div>
    </div>
  </div>;
}

// ─── EMAIL FINDER TOOL ──────────────────────────────────────────────
function EmailFinder(){
  const[fn,setFn]=useState("");const[ln,setLn]=useState("");const[co,setCo]=useState("");const[dm,setDm]=useState("");
  const[ld,setLd]=useState(false);const[res,setRes]=useState(null);
  const go=async()=>{if(!fn.trim()||!ln.trim())return;setLd(true);setRes(null);
    try{const r=await fetch("/api/hunter",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({first_name:fn.trim(),last_name:ln.trim(),company:co.trim(),domain:dm.trim()})});setRes(await r.json())}catch(e){setRes({success:false,error:e.message})}setLd(false)};
  const inp=(l,v,s,ph)=><div style={{marginBottom:10}}><div style={{fontSize:10,textTransform:"uppercase",letterSpacing:1.5,color:C.muted,marginBottom:3,fontFamily:F}}>{l}</div><input value={v} onChange={e=>s(e.target.value)} placeholder={ph} style={{width:"100%",padding:"10px 14px",fontSize:14,background:C.card,border:`1px solid ${C.border}`,borderRadius:10,color:C.white,outline:"none",boxSizing:"border-box",fontFamily:F}}/></div>;
  return <div style={{padding:24,maxWidth:600,overflowY:"auto",height:"100%"}}>
    <h2 style={{fontSize:22,fontWeight:700,color:C.white,margin:"0 0 4px",fontFamily:F}}>Email Finder</h2>
    <p style={{color:C.muted,fontSize:13,marginBottom:20,fontFamily:F}}>Find email addresses using Hunter.io</p>
    <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:20,marginBottom:20}}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 12px"}}>{inp("First Name",fn,setFn,"John")}{inp("Last Name",ln,setLn,"Smith")}</div>
      {inp("Company Name",co,setCo,"First National Bank")}
      {inp("Company Domain (optional, more accurate)",dm,setDm,"firstnational.com")}
      <Btn onClick={go} disabled={ld||!fn.trim()||!ln.trim()} style={{width:"100%",padding:12,background:ld?C.card:`linear-gradient(135deg,#f5c518,#e0a800)`,fontSize:14,color:"#071428",marginTop:8}}>{ld?"Searching Hunter.io…":"🔍 Find Email"}</Btn>
    </div>
    {res&&<div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:20}}>
      {res.success?<>
        <div style={{fontSize:10,textTransform:"uppercase",letterSpacing:2,color:C.teal,marginBottom:8,fontFamily:F}}>Email Found</div>
        <div style={{fontSize:18,fontWeight:700,color:C.white,marginBottom:8,fontFamily:F}}>{res.email}</div>
        <div style={{fontSize:13,color:C.muted,fontFamily:F}}>Confidence: <span style={{color:res.confidence>=80?C.teal:res.confidence>=50?C.gold:C.red,fontWeight:600}}>{res.confidence}%</span></div>
        <Btn onClick={()=>{navigator.clipboard.writeText(res.email)}} ghost style={{marginTop:12}}>Copy Email</Btn>
      </>:<>
        <div style={{fontSize:10,textTransform:"uppercase",letterSpacing:2,color:C.red,marginBottom:8,fontFamily:F}}>Not Found</div>
        <div style={{fontSize:13,color:C.muted,fontFamily:F}}>{res.error||"No email found for this contact"}</div>
      </>}
    </div>}
  </div>;
}

// ═══════════════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════════════
export default function App(){
  const[sUrl,setSUrl]=useState("");
  const[leads,setLeads]=useState([]);
  const[ld,setLd]=useState(false);
  const[lp,setLp]=useState({p:0,t:0});
  const[aiL,setAiL]=useState(false);
  const[bulkP,setBulkP]=useState(null);
  const[view,setView]=useState("all");
  const[pg,setPg]=useState("dash");
  const[search,setSearch]=useState("");
  const[fP,setFP]=useState("");const[fT,setFT]=useState("");const[fS,setFS]=useState("");const[fE,setFE]=useState("");
  const[sortBy,setSortBy]=useState("full_name");const[sortDir,setSortDir]=useState("asc");
  const[sLead,setSLead]=useState(null);
  const[selIds,setSelIds]=useState(new Set());
  const[showSet,setShowSet]=useState(false);
  const[showAdd,setShowAdd]=useState(false);
  const[toast,setToast]=useState(null);
  const[sb,setSb]=useState(true);
  const[mounted,setMounted]=useState(false);
  const[pgSz,setPgSz]=useState(25);const[pgN,setPgN]=useState(1);
  const[sDD,setSDD]=useState(null);

  const flash=m=>{setToast(m);setTimeout(()=>setToast(null),3000)};

  // Init: load from cache first, then sync
  useEffect(()=>{
    setMounted(true);
    const cached=cacheGet("fin-leads");
    if(cached&&cached.length>0) setLeads(cached);
    try{const u=localStorage.getItem("fin-url");if(u){setSUrl(u);loadLeads(u)}else setShowSet(true)}catch{setShowSet(true)}
  },[]);

  const loadLeads=async url=>{if(!url)return;setLd(true);setLp({p:0,t:0});
    try{let d=await gsFetch(url,(p,t)=>setLp({p,t}));d=d.map(l=>({...l,persona:l.persona||classP(l.title)}));setLeads(d);cacheSet("fin-leads",d);flash(`Synced ${d.length} leads`)}
    catch(e){flash("Failed: "+e.message)}setLd(false)};

  const connect=url=>{setSUrl(url);try{localStorage.setItem("fin-url",url)}catch{}loadLeads(url);setShowSet(false)};

  const upd=useCallback((id,u)=>{
    setLeads(p=>{const n=p.map(l=>l.id===id?{...l,...u}:l);cacheSet("fin-leads",n);return n});
    if(sLead?.id===id) setSLead(p=>p?{...p,...u}:p);
    if(sUrl) gsUp(sUrl,id,u);
  },[sUrl,sLead]);

  const act=useCallback(async(id,a)=>{
    const l=leads.find(x=>x.id===id);if(!l)return;let u={};
    switch(a){
      case"not_contacted":u={status:"not_contacted",linkedin_step:0,next_linkedin_followup_date:""};break;
      case"request_sent":u={status:"request_sent",linkedin_step:0,last_linkedin_action_date:td()};flash("Request sent");break;
      case"accepted_dm":u={status:"accepted_dm",linkedin_step:1,last_linkedin_action_date:td(),next_linkedin_followup_date:addD(td(),3)};flash("Accepted / DM sent — FU in 3 days");break;
      case"following_up":
        const step=(l.linkedin_step||0)+1;
        const days=step===2?4:5;
        u={status:"following_up",linkedin_step:Math.min(step,3),last_linkedin_action_date:td(),next_linkedin_followup_date:step<3?addD(td(),days):""};
        flash(step<3?`Follow-up ${step-1} sent — next in ${days} days`:"Final follow-up sent");break;
      case"followup1":u={status:"following_up",linkedin_step:2,last_linkedin_action_date:td(),next_linkedin_followup_date:addD(td(),4)};flash("FU1 — next in 4 days");break;
      case"followup2":u={status:"following_up",linkedin_step:3,last_linkedin_action_date:td(),next_linkedin_followup_date:""};flash("FU2 sent — sequence done");break;
      case"booked":u={status:"booked",next_linkedin_followup_date:""};flash("Booked!");break;
      case"second_call":u={status:"second_call"};flash("2nd Call");break;
      case"not_interested":u={status:"not_interested",next_linkedin_followup_date:""};flash("Not interested");break;
      case"replied_followup":u={status:"replied_followup",next_linkedin_followup_date:""};flash("Replied / Follow Up");break;
      case"closed":u={status:"closed",next_linkedin_followup_date:""};flash("Closed");break;
      case"gen_email":
        setAiL(true);const line=await aiCall(emailPrompt(l));
        if(line&&line._error){flash("Error: "+line._error);setAiL(false);return}
        if(line&&typeof line==="string"){upd(id,{email_first_line_personalization:line});flash("Email line generated")}
        else flash("Failed — check API key in Vercel");setAiL(false);return;
      default:break;
    }
    if(Object.keys(u).length) upd(id,u);
  },[leads,upd]);

  // Contextual next action
  const nextAction = (l) => {
    switch(l.status){
      case"not_contacted": return {label:"Request Sent",action:"request_sent",bg:C.blue};
      case"request_sent": return {label:"Accepted/DM",action:"accepted_dm",bg:"#0a6a50"};
      case"accepted_dm": return {label:"FU1",action:"followup1",bg:"#5a4a0a"};
      case"following_up": return (l.linkedin_step||0)<3?{label:"FU2",action:"followup2",bg:"#6a3a0a"}:{label:"Booked",action:"booked",bg:"#3a1a6a"};
      case"replied_followup": return {label:"Booked",action:"booked",bg:"#3a1a6a"};
      case"booked": return {label:"2nd Call",action:"second_call",bg:"#1a1040"};
      default: return null;
    }
  };

  const bulkGen=async()=>{
    const ids=[...selIds].filter(id=>{const l=leads.find(x=>x.id===id);return l&&hasE(l)});
    if(!ids.length){flash("No selected leads have emails");return}
    setBulkP({c:0,t:ids.length});const batch=[];
    for(let i=0;i<ids.length;i++){setBulkP({c:i+1,t:ids.length});const l=leads.find(x=>x.id===ids[i]);if(!l)continue;
      const line=await aiCall(emailPrompt(l));
      if(line&&line._error){flash("Error: "+line._error);setBulkP(null);return}
      if(line&&typeof line==="string"){
        setLeads(p=>{const n=p.map(x=>x.id===ids[i]?{...x,email_first_line_personalization:line}:x);cacheSet("fin-leads",n);return n});
        batch.push({id:ids[i],updates:{email_first_line_personalization:line}});
      }}
    if(sUrl&&batch.length) await gsBk(sUrl,batch);
    setBulkP(null);setSelIds(new Set());flash(`Generated ${batch.length} email lines`);
  };

  const exportCSV=()=>{
    const rows=leads.filter(l=>selIds.has(l.id)&&hasE(l));if(!rows.length){flash("No leads with email");return}
    const csv=Papa.unparse(rows.map(l=>({first_name:l.first_name||"",last_name:l.last_name||"",email:l.email||"",company:l.company||"",title:l.title||"",personalization:l.email_first_line_personalization||""})));
    const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([csv],{type:"text/csv"}));a.download=`instantly-${td()}.csv`;a.click();
    rows.forEach(l=>upd(l.id,{export_status:"exported"}));if(sUrl)gsBk(sUrl,rows.map(l=>({id:l.id,updates:{export_status:"exported"}})));
    setSelIds(new Set());flash(`Exported ${rows.length} leads`);
  };

  const addLead=async lead=>{setLeads(p=>{const n=[lead,...p];cacheSet("fin-leads",n);return n});if(sUrl)await gsAd(sUrl,lead);flash("Lead added")};

  const delLead=async id=>{
    setLeads(p=>{const n=p.filter(l=>l.id!==id);cacheSet("fin-leads",n);return n});
    if(sUrl){try{await fetch("/api/sheets",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({scriptUrl:sUrl,action:"deleteLead",id})})}catch(e){console.error("Delete error:",e)}}
    if(sLead?.id===id)setSLead(null);
    flash("Lead deleted");
  };

  const bulkFindEmails=async()=>{
    const ids=[...selIds].filter(id=>{const l=leads.find(x=>x.id===id);return l&&!hasE(l)});
    if(!ids.length){flash("No selected leads missing emails");return}
    setBulkP({c:0,t:ids.length});let found=0;
    for(let i=0;i<ids.length;i++){setBulkP({c:i+1,t:ids.length});const l=leads.find(x=>x.id===ids[i]);if(!l)continue;
      const names=(l.full_name||`${l.first_name||""} ${l.last_name||""}`).trim().split(/\s+/);
      const first=names[0];const last=names.slice(1).join(" ")||names[0];
      try{const r=await fetch("/api/hunter",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({first_name:first,last_name:last,company:l.company||"",domain:l.company_url||""})});
        const d=await r.json();if(d.success&&d.email){upd(ids[i],{email:d.email});found++}}catch(e){console.error(e)}}
    setBulkP(null);setSelIds(new Set());flash(`Found ${found}/${ids.length} emails`);
  };

  // Filter
  const filtered=useMemo(()=>{
    let r=[...leads];
    if(view==="not_contacted")r=r.filter(l=>l.status==="not_contacted");
    else if(view==="request_sent")r=r.filter(l=>l.status==="request_sent");
    else if(view==="accepted_dm")r=r.filter(l=>l.status==="accepted_dm");
    else if(view==="following_up")r=r.filter(l=>l.status==="following_up");
    else if(view==="replied_followup")r=r.filter(l=>l.status==="replied_followup");
    else if(view==="due_today")r=r.filter(l=>isOv(l.next_linkedin_followup_date)&&!["booked","second_call","not_interested","closed","replied_followup"].includes(l.status));
    else if(view==="booked")r=r.filter(l=>l.status==="booked");
    else if(view==="second_call")r=r.filter(l=>l.status==="second_call");
    else if(view==="not_interested")r=r.filter(l=>l.status==="not_interested");
    else if(view==="ready_export")r=r.filter(l=>l.email_first_line_personalization&&l.export_status!=="exported"&&hasE(l));
    else if(view==="closed")r=r.filter(l=>l.status==="closed");
    if(search){const q=search.toLowerCase();r=r.filter(l=>`${l.full_name} ${l.first_name} ${l.last_name} ${l.company} ${l.title} ${l.email}`.toLowerCase().includes(q))}
    if(fT)r=r.filter(l=>l.institution_type===fT);if(fS)r=r.filter(l=>l.state===fS);
    if(fE==="has")r=r.filter(l=>hasE(l));if(fE==="no")r=r.filter(l=>!hasE(l));
    r.sort((a,b)=>{let av=a[sortBy],bv=b[sortBy];if(!isNaN(Number(av))){av=Number(av)||0;bv=Number(bv)||0}else{av=String(av||"").toLowerCase();bv=String(bv||"").toLowerCase()}return sortDir==="asc"?(av<bv?-1:av>bv?1:0):(av>bv?-1:av<bv?1:0)});
    return r;
  },[leads,view,search,fT,fS,fE,sortBy,sortDir]);

  const totalPg=Math.ceil(filtered.length/pgSz);
  const paged=filtered.slice((pgN-1)*pgSz,pgN*pgSz);
  useEffect(()=>setPgN(1),[view,search,fT,fS,fE,pgSz]);

  const togSort=f=>{if(sortBy===f)setSortDir(d=>d==="asc"?"desc":"asc");else{setSortBy(f);setSortDir("asc")}};
  const togSel=id=>setSelIds(p=>{const n=new Set(p);n.has(id)?n.delete(id):n.add(id);return n});
  const togPage=()=>selIds.size===paged.length?setSelIds(new Set()):setSelIds(new Set(paged.map(l=>l.id)));
  const selAll=()=>setSelIds(new Set(filtered.map(l=>l.id)));

  const states=useMemo(()=>[...new Set(leads.map(l=>l.state).filter(Boolean))].sort(),[leads]);
  const kpis=useMemo(()=>({
    total:leads.length,
    due:leads.filter(l=>isOv(l.next_linkedin_followup_date)&&!["booked","second_call","not_interested","closed"].includes(l.status)).length,
    booked:leads.filter(l=>l.status==="booked").length+leads.filter(l=>l.status==="second_call").length,
    ready:leads.filter(l=>l.email_first_line_personalization&&l.export_status!=="exported"&&hasE(l)).length,
    accepted:leads.filter(l=>l.status==="accepted_dm").length,
  }),[leads]);

  const selN=selIds.size;const selE=[...selIds].filter(id=>{const l=leads.find(x=>x.id===id);return l&&hasE(l)}).length;

  if(!mounted) return null;

  const inp={padding:"7px 12px",fontSize:13,background:C.card,border:`1px solid ${C.border}`,borderRadius:8,color:C.soft,outline:"none",fontFamily:F};
  const sl={...inp,appearance:"none",paddingRight:26,backgroundImage:"url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 10 10'%3E%3Cpath fill='%237a96bc' d='M2.5 3.5L5 6.5L7.5 3.5'/%3E%3C/svg%3E\")",backgroundRepeat:"no-repeat",backgroundPosition:"right 8px center"};

  return <div style={{display:"flex",height:"100vh",overflow:"hidden",background:C.navy,color:C.white,fontFamily:F}} onClick={()=>setSDD(null)}>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet"/>

    {/* SIDEBAR */}
    <aside style={{width:sb?224:0,overflow:"hidden",flexShrink:0,background:C.deep,borderRight:`1px solid ${C.bL}`,display:"flex",flexDirection:"column",transition:"width .25s ease"}}>
      <Logo/>
      <nav style={{flex:1,padding:"6px 8px",overflowY:"auto",scrollbarWidth:"none",msOverflowStyle:"none",WebkitOverflowScrolling:"touch"}}>
        {pg==="dash"&&PIPELINE.map(v=>{
          const ct=v.id==="all"?leads.length:v.id==="due_today"?kpis.due:v.id==="not_contacted"?leads.filter(l=>l.status==="not_contacted").length:v.id==="request_sent"?leads.filter(l=>l.status==="request_sent").length:v.id==="accepted_dm"?kpis.accepted:v.id==="following_up"?leads.filter(l=>l.status==="following_up").length:v.id==="replied_followup"?leads.filter(l=>l.status==="replied_followup").length:v.id==="booked"?leads.filter(l=>l.status==="booked").length:v.id==="second_call"?leads.filter(l=>l.status==="second_call").length:v.id==="not_interested"?leads.filter(l=>l.status==="not_interested").length:leads.filter(l=>l.status==="closed").length;
          return <button key={v.id} onClick={()=>setView(v.id)} style={{width:"100%",display:"flex",alignItems:"center",gap:10,padding:"7px 12px",borderRadius:8,border:"none",cursor:"pointer",fontSize:13,marginBottom:1,background:view===v.id?C.card:"transparent",color:view===v.id?C.white:C.muted,textAlign:"left",fontFamily:F,transition:"all .15s"}}
            onMouseEnter={e=>{if(view!==v.id)e.currentTarget.style.background="rgba(255,255,255,.03)"}} onMouseLeave={e=>{if(view!==v.id)e.currentTarget.style.background="transparent"}}>
            <span style={{fontSize:v.id==="closed"||v.id==="second_call"?13:11,color:view===v.id?C.teal:undefined,width:20,textAlign:"center"}}>{v.icon}</span>
            <span style={{flex:1,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{v.label}</span>
            {ct>0&&<span style={{fontSize:10,fontFamily:M,padding:"1px 6px",borderRadius:6,background:v.id==="due_today"&&ct?"rgba(245,197,24,.15)":v.id==="accepted_dm"&&ct?"rgba(0,219,168,.15)":"rgba(255,255,255,.04)",color:v.id==="due_today"&&ct?C.gold:v.id==="accepted_dm"&&ct?C.teal:C.muted,flexShrink:0}}>{ct}</span>}
          </button>;
        })}
      </nav>
      <div style={{padding:"8px 10px",borderTop:`1px solid ${C.bL}`,flexShrink:0}}>
        {pg==="dash"&&<button onClick={()=>setView("ready_export")} style={{width:"100%",display:"flex",alignItems:"center",gap:10,padding:"7px 12px",borderRadius:8,border:"none",cursor:"pointer",fontSize:13,marginBottom:1,background:view==="ready_export"?C.card:"transparent",color:view==="ready_export"?C.white:C.muted,textAlign:"left",fontFamily:F}}>
          <span style={{fontSize:11,color:view==="ready_export"?C.teal:undefined,width:20,textAlign:"center"}}>↗</span>
          <span style={{flex:1}}>Ready for Export</span>
          {kpis.ready>0&&<span style={{fontSize:10,fontFamily:M,padding:"1px 6px",borderRadius:6,background:"rgba(56,170,255,.12)",color:C.blue2}}>{kpis.ready}</span>}
        </button>}
        <button onClick={()=>setPg("emailfinder")} style={{width:"100%",display:"flex",alignItems:"center",gap:10,padding:"7px 12px",borderRadius:8,border:"none",cursor:"pointer",fontSize:13,marginBottom:1,background:pg==="emailfinder"?C.card:"transparent",color:pg==="emailfinder"?C.white:C.muted,textAlign:"left",fontFamily:F}}>
          <span style={{fontSize:11,color:pg==="emailfinder"?C.gold:undefined,width:20,textAlign:"center"}}>🔍</span>
          <span style={{flex:1}}>Email Finder</span>
        </button>
        <button onClick={()=>loadLeads(sUrl)} disabled={!sUrl||ld} style={{width:"100%",padding:7,fontSize:12,borderRadius:8,border:"none",cursor:"pointer",background:"transparent",color:ld?"#2a3a50":C.muted,textAlign:"left",fontFamily:F}}>⟳ Refresh</button>
        <button onClick={()=>setShowSet(true)} style={{width:"100%",padding:7,fontSize:12,borderRadius:8,border:"none",cursor:"pointer",background:"transparent",color:C.muted,textAlign:"left",fontFamily:F}}>⚙ Settings</button>
      </div>
    </aside>

    {/* MAIN */}
    <main style={{flex:1,display:"flex",flexDirection:"column",minWidth:0,overflow:"hidden"}}>
      <header style={{display:"flex",alignItems:"center",gap:12,padding:"12px 20px",borderBottom:`1px solid ${C.bL}`,flexShrink:0}}>
        <button onClick={()=>setSb(s=>!s)} style={{background:"none",border:"none",color:C.muted,fontSize:18,cursor:"pointer"}} onMouseEnter={e=>e.currentTarget.style.color=C.white} onMouseLeave={e=>e.currentTarget.style.color=C.muted}>☰</button>
        <h1 style={{fontSize:15,fontWeight:600,color:C.soft,flex:1,margin:0,fontFamily:F}}>{pg==="emailfinder"?"Email Finder":PIPELINE.find(v=>v.id===view)?.label||"Leads"}</h1>
        {pg==="dash"&&<Btn onClick={()=>setShowAdd(true)} small style={{background:GRAD}}>+ Add Lead</Btn>}
        {sUrl&&<div style={{width:8,height:8,borderRadius:4,background:C.teal}} title="Connected"/>}
      </header>

      {pg==="emailfinder"?<EmailFinder/>:<>
      {/* KPIs */}
      <div style={{display:"flex",gap:10,padding:"14px 20px",flexShrink:0}}>
        <KPI label="Total" value={kpis.total} onClick={()=>setView("all")} active={view==="all"}/>
        <KPI label="Due Today" value={kpis.due} color={kpis.due?C.gold:undefined} onClick={()=>setView("due_today")} active={view==="due_today"}/>
        <KPI label="Accepted" value={kpis.accepted} color={kpis.accepted?C.teal:undefined} onClick={()=>setView("accepted_dm")} active={view==="accepted_dm"}/>
        <KPI label="Booked" value={kpis.booked} color={C.purple} onClick={()=>setView("booked")} active={view==="booked"}/>
        <KPI label="Export Ready" value={kpis.ready} color={C.blue2} onClick={()=>setView("ready_export")} active={view==="ready_export"}/>
      </div>

      {/* Filters */}
      <div style={{display:"flex",alignItems:"center",gap:8,padding:"0 20px 10px",flexWrap:"wrap",flexShrink:0}}>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search…" style={{...inp,width:180}}/>
        <select value={fT} onChange={e=>setFT(e.target.value)} style={sl}><option value="">All Types</option>{["Bank","Credit Union","Banking","Other"].map(t=><option key={t}>{t}</option>)}</select>
        <select value={fS} onChange={e=>setFS(e.target.value)} style={sl}><option value="">All States</option>{states.map(s=><option key={s}>{s}</option>)}</select>
        <select value={fE} onChange={e=>setFE(e.target.value)} style={sl}><option value="">All Emails</option><option value="has">Has Email</option><option value="no">No Email</option></select>
        {(search||fT||fS||fE)&&<button onClick={()=>{setSearch("");setFT("");setFS("");setFE("")}} style={{fontSize:11,color:C.muted,background:"none",border:"none",cursor:"pointer",fontFamily:F}}>Clear</button>}
        <div style={{flex:1}}/>
        <span style={{fontSize:11,color:C.muted,fontFamily:M}}>{filtered.length} leads</span>
      </div>

      {/* Bulk actions */}
      {selN>0&&<div style={{margin:"0 20px 10px",display:"flex",alignItems:"center",gap:10,padding:"10px 16px",background:C.card,border:`1px solid ${C.border}`,borderRadius:12,flexWrap:"wrap",flexShrink:0}}>
        <span style={{fontSize:12,fontWeight:600,color:C.soft}}>{selN} selected</span>
        {selE>0&&<span style={{fontSize:11,color:C.muted}}>({selE} with email)</span>}
        {selN<filtered.length&&<button onClick={selAll} style={{fontSize:11,color:C.blue2,background:"none",border:"none",cursor:"pointer",fontFamily:F,textDecoration:"underline"}}>Select all {filtered.length}</button>}
        <div style={{width:1,height:18,background:C.border}}/>
        <Btn onClick={bulkGen} disabled={!!bulkP||!selE} small style={{background:GRAD}}>{bulkP?`Generating ${bulkP.c}/${bulkP.t}`:"Generate Email Lines"}</Btn>
        <Btn onClick={bulkFindEmails} disabled={!!bulkP} small style={{background:`linear-gradient(135deg,#f5c518,#e0a800)`,color:"#071428"}}>{bulkP?`Finding ${bulkP.c}/${bulkP.t}`:"Find Emails"}</Btn>
        <Btn onClick={exportCSV} disabled={!selE} small style={{background:C.blue}}>Export for Instantly</Btn>
        <div style={{flex:1}}/>
        <button onClick={()=>setSelIds(new Set())} style={{fontSize:11,color:C.muted,background:"none",border:"none",cursor:"pointer",fontFamily:F}}>Deselect</button>
      </div>}
      {bulkP&&<div style={{margin:"0 20px 8px",height:3,background:C.deep,borderRadius:2,overflow:"hidden",flexShrink:0}}><div style={{width:`${(bulkP.c/bulkP.t)*100}%`,height:"100%",background:GRAD,transition:"width .3s",borderRadius:2}}/></div>}

      {/* Loading */}
      {ld&&<div style={{padding:"16px 20px",flexShrink:0}}>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <div style={{width:20,height:20,border:`2px solid ${C.border}`,borderTopColor:C.teal,borderRadius:"50%",animation:"spin .8s linear infinite"}}/>
          <span style={{fontSize:13,color:C.soft,fontFamily:F}}>Loading leads… {lp.p>0&&`${lp.p.toLocaleString()} / ${lp.t.toLocaleString()}`}</span>
        </div>
        {lp.t>0&&<div style={{marginTop:8,height:3,background:C.deep,borderRadius:2,overflow:"hidden"}}><div style={{width:`${(lp.p/lp.t)*100}%`,height:"100%",background:GRAD,transition:"width .3s",borderRadius:2}}/></div>}
      </div>}

      {/* Table */}
      <div style={{flex:1,overflow:"auto",padding:"0 20px"}}>
        {!sUrl&&!ld?<div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:"60%",gap:12}}>
          <div style={{fontSize:40}}>📊</div>
          <div style={{fontSize:16,fontWeight:600,color:C.soft,fontFamily:F}}>Connect your Google Sheet</div>
          <Btn onClick={()=>setShowSet(true)} style={{background:GRAD,marginTop:8}}>Connect Sheet</Btn>
        </div>:!ld&&
        <table style={{width:1100,fontSize:13,borderCollapse:"collapse",fontFamily:F}}>
          <thead><tr>
            <th style={{padding:"10px 8px",textAlign:"left",width:32,position:"sticky",top:0,background:C.navy,zIndex:5}}><input type="checkbox" checked={selN>0&&selN===paged.length} onChange={togPage} style={{cursor:"pointer",accentColor:C.teal}}/></th>
            {[{k:"full_name",l:"Name",w:150},{k:"title",l:"Title",w:140},{k:"company",l:"Company",w:120},{k:"persona",l:"Persona",w:65},{k:"status",l:"Status",w:140},{k:"linkedin_step",l:"LI",w:32},{k:"next_linkedin_followup_date",l:"Follow-Up",w:78},{k:"_a",l:"",w:100}].map(c=>
              <th key={c.k} onClick={c.k!=="_a"?()=>togSort(c.k):undefined} style={{padding:"10px 8px",textAlign:"left",fontSize:9,textTransform:"uppercase",letterSpacing:1.5,color:C.muted,fontWeight:600,cursor:c.k!=="_a"?"pointer":"default",minWidth:c.w,userSelect:"none",position:"sticky",top:0,background:C.navy,zIndex:5,whiteSpace:"nowrap"}}
                onMouseEnter={e=>{if(c.k!=="_a")e.currentTarget.style.color=C.soft}} onMouseLeave={e=>e.currentTarget.style.color=C.muted}>
                {c.l}{sortBy===c.k&&<span style={{color:C.teal,marginLeft:4}}>{sortDir==="asc"?"↑":"↓"}</span>}
              </th>
            )}
          </tr></thead>
          <tbody>
            {paged.map(lead=>{
              const due=isOv(lead.next_linkedin_followup_date)&&!["booked","second_call","not_interested","closed"].includes(lead.status);
              const nm=lead.full_name||`${lead.first_name||""} ${lead.last_name||""}`.trim();
              const na=nextAction(lead);
              return <tr key={lead.id} onClick={()=>setSLead(lead)} style={{borderBottom:`1px solid ${C.bL}`,cursor:"pointer",background:due?"rgba(245,197,24,.03)":"transparent",transition:"background .15s"}}
                onMouseEnter={e=>e.currentTarget.style.background=due?"rgba(245,197,24,.06)":C.deep} onMouseLeave={e=>e.currentTarget.style.background=due?"rgba(245,197,24,.03)":"transparent"}>
                <td style={{padding:"9px 8px"}} onClick={e=>e.stopPropagation()}><input type="checkbox" checked={selIds.has(lead.id)} onChange={()=>togSel(lead.id)} style={{cursor:"pointer",accentColor:C.teal}}/></td>
                <td style={{padding:"9px 8px",fontWeight:500,color:C.soft,whiteSpace:"nowrap"}}>{nm||"—"}</td>
                <td style={{padding:"9px 8px",color:C.muted,maxWidth:140,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{lead.title||"—"}</td>
                <td style={{padding:"9px 8px",color:C.muted,whiteSpace:"nowrap"}}>{lead.company||"—"}</td>
                <td style={{padding:"9px 8px"}}><span style={{fontSize:11,fontWeight:700,color:PC[lead.persona]||C.muted}}>{lead.persona||"—"}</span></td>
                <td style={{padding:"9px 8px",position:"relative"}} onClick={e=>e.stopPropagation()}>
                  <SBadge status={lead.status} onClick={e=>{e.stopPropagation();setSDD(sDD===lead.id?null:lead.id)}}/>
                  {sDD===lead.id&&<SDrop current={lead.status} onSel={s=>act(lead.id,s)} onClose={()=>setSDD(null)}/>}
                </td>
                <td style={{padding:"9px 8px",textAlign:"center"}}><span style={{fontSize:11,fontFamily:M,color:C.muted}}>{lead.linkedin_step||0}/3</span></td>
                <td style={{padding:"9px 8px"}}><span style={{fontSize:11,color:due?C.gold:C.muted,fontWeight:due?700:400,whiteSpace:"nowrap"}}>{lead.next_linkedin_followup_date?fmtD(lead.next_linkedin_followup_date):"—"}</span></td>
                <td style={{padding:"9px 8px"}} onClick={e=>e.stopPropagation()}>
                  <div style={{display:"flex",gap:4}}>
                    {na&&<Btn onClick={()=>act(lead.id,na.action)} small style={{background:na.bg}}>{na.label}</Btn>}
                    <Btn onClick={()=>setSLead(lead)} small ghost>Open</Btn>
                  </div>
                </td>
              </tr>;
            })}
            {!paged.length&&!ld&&<tr><td colSpan={9} style={{padding:"50px 0",textAlign:"center",color:C.muted}}>No leads match filters</td></tr>}
          </tbody>
        </table>}
      </div>

      {/* Pagination */}
      {filtered.length>0&&!ld&&<div style={{display:"flex",alignItems:"center",gap:12,padding:"10px 20px",borderTop:`1px solid ${C.bL}`,flexShrink:0}}>
        <span style={{fontSize:12,color:C.muted}}>Page {pgN} of {totalPg}</span>
        <Btn onClick={()=>setPgN(p=>Math.max(1,p-1))} disabled={pgN<=1} small ghost>←</Btn>
        <Btn onClick={()=>setPgN(p=>Math.min(totalPg,p+1))} disabled={pgN>=totalPg} small ghost>→</Btn>
        <div style={{flex:1}}/>
        <span style={{fontSize:11,color:C.muted}}>Show:</span>
        {[25,50,100].map(n=><button key={n} onClick={()=>setPgSz(n)} style={{padding:"3px 8px",fontSize:11,borderRadius:6,border:`1px solid ${pgSz===n?C.teal:C.border}`,background:pgSz===n?"rgba(0,219,168,.1)":"transparent",color:pgSz===n?C.teal:C.muted,cursor:"pointer",fontFamily:F}}>{n}</button>)}
      </div>}
      </>}
    </main>

    {sLead&&<Drawer lead={leads.find(l=>l.id===sLead.id)||sLead} onClose={()=>setSLead(null)} onUpd={upd} onAct={act} onDel={delLead} aiL={aiL} sUrl={sUrl}/>}
    {showSet&&<Settings url={sUrl} onSave={connect} onClose={()=>setShowSet(false)}/>}
    {showAdd&&<AddLead onClose={()=>setShowAdd(false)} onAdd={addLead}/>}
    {toast&&<div style={{position:"fixed",bottom:24,left:"50%",transform:"translateX(-50%)",zIndex:200,padding:"10px 20px",background:C.card,border:`1px solid ${C.border}`,borderRadius:12,fontSize:13,color:C.soft,boxShadow:"0 8px 32px rgba(0,0,0,.5)",fontFamily:F,animation:"fadeUp .2s ease"}}>{toast}</div>}

    <style>{`
      @keyframes spin{to{transform:rotate(360deg)}}
      @keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
      @keyframes slideIn{from{opacity:0;transform:translateX(20px)}to{opacity:1;transform:translateX(0)}}
      ::-webkit-scrollbar{width:6px;height:8px}::-webkit-scrollbar-track{background:${C.deep};border-radius:4px}::-webkit-scrollbar-thumb{background:${C.teal};border-radius:4px}::-webkit-scrollbar-thumb:hover{background:${C.teal2}}
      nav::-webkit-scrollbar{display:none}
      *{box-sizing:border-box}select option{background:#101f3a;color:rgba(255,255,255,0.65)}
    `}</style>
  </div>;
}
