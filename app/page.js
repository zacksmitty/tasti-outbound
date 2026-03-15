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
    <div style={{display:"flex",alignItems:"center",gap:18}}>
    <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAKAAAACiCAYAAADGB8YmAABAHElEQVR4nO296bclR3Xo+dsRmWe4U5WqVFWaEGK2nzHYIAQCLMwgZtQYA362n+0vr9+X/tZ/Sn/tXr3eWna/tt3YzzaTxCTJYCRmJAxmRiChqVRVdzxDDrH7Q0Rkxsl77lCTqkSdvda9eXKOjNix571DIAMEUMAhADgMHiRs4378LVgqHA6ljkfFhDsMqAMUwWFw5OFeF/7AhPscygKuVQh4laKAS/77M/HPGIOIpQJKFIc21yHhl4TfAXOtsQBU4Q/A2gwVs+vNC7j2QFLaJi067QJtrmtpY5Zn1NUYlfAoMhCJNwBKL7PUZYFTT1UVAWNxzatamriAaw8kMMwZFGiokoDNMtQJqoKqI2AbiAWr4KbtxWJoEdSB08CKW1aukVWLAWOgKlgg4LULYkklQA8eAU2LNTMSofFoqwrUiFSQ4GX7ZP+gPBcMgohQO6hqj8wEFowrWSDgtQtZF28UEsQDyTIwgtZAXYPWWJsBiqsqMg0UVD0SRlSy4TlaKHVA6ZqAqJLT0N2I/Qu4JiFTZvANr8G2B9U5qLz60MuEfpbj6gKtHVnmdeio+6rxJFUk/KknlCJQKkwr2ClBtQZjIcuhKJ/Hz13A1QYZpATIdE47qL1p5pYbjvHEna/V6pYbPEKWFfT7kGWICNgo11nEBvlOBCqHWINujdAfP8Yt3/yuPPHcBurqBeddAFm0yUGi6YprsDITMApPvOMOlfe/FVldhn4fqR3Unrx5JdiE36YhgYKAtVAFZPv93+GJH/9C8+c2pBalruvn/YMXcHVBBqZVOiCwXi+fCdAz0DewvraMrK1AvxfkQufpp4v0M94fEBAJmk1AZmugl0OeBdO3UuvCBHOtQ9YiX2K/k/aoqz0SMuhDz9v5tK6RWiGz7X0R4boQ5EnJLNrLkV4PC6g6BFnoH9c4ZO3PiCm7L3IVXgN2ileHxf92pkW6GWeKZ81eATGJViJgZN4rFnCNgvHejwpvEpmlR96bG0wntVdIiApHZsEk1K+xNOvsX2uB9vvO+bdZG2TOruKzgGsJMoimuCCrxYAC8QEFDXNuEEoQY6JzmNanFj0kwUitASmbfeeVkdpRA9WCDi4AyCKC1XREOBUUQ41LAg48MqlzPvZgngAX/cLGeIKqeJZs/MWqPnqmFuMVmYUOck2DgUDMiJSOGUO0i1flmWe9MOPjbWAGGYOMmHDo6HoTs6B8C2ghq2PYlDbOsYBL/kB0sTXmFgnsOe6boP02UTDRtxaQMBiktapgaeDfBVTVNJhs3HxKuoAXJJwvedmlAXQP7AoyaE7o/m+TTmuiwdqbp5vA1wXyXduQHXSB7ocgux3JHiTBvmh+iVRyYYb5jYa90GWvMT8QASEgYSPPdR7lkld2z0Fg0QnSyezv/TF8Ab/pcCgEbKBBsD2QJhig97x3r3ML+I2HvcjMAVbgPWwkEZHcPtRrgXALOAScHwWE3UgV+fNhcE0VnC70jt8ouDhP1nne3UWdQ6CSc3vLeQv575qHQ1HAuqaV75xDrPW+4Kr2dr5U442gzh/Ps07CibYeOgMsQgJf0GDFe7ciXzPWNnGexhhc12HRgTkUcJaXphaVSLFUE6P0QRCDGIILzzc2PGpBAF/wEBEssxlGDC4JMlbVA8f4QAooM+KdN5tIxMrDIGBohGpM01zIgL9JYEJGmqsrbPCKqYAxQlWHkU4HvIMyZu7PeSgSo2EOsvvtSrPThaz3GwoC5KHyxYzTS/3xrjMM2IVaF6TCtCw4eeqhcUwXnpDfIKiqGiswyAzO+bE9fuwIeurlmufR+doGSc0Mvp6PGaax66WKxpxrUpjnqgvXRO/cAl74YBSKyseO2lt/R+3tH2RtvEm58Ss2y1Gjf0oMbIkgh6CADQeNN8Zwqi47XsA1Cb7ej49wsre9Rk+8+79y7K0fp3/Dy+n18+aaCKKzgfcJBXSASYJP/WaeH1gi+VKHL+4RrolZ6DMPoFFE2gfSnlvAFQVpUnLdLvboz0foVDMTh6qPaM4Upje+Qo/dcQ9Hbv8Axua48Rbr9rjChswzxERqeCAFbD1qLUZqTLU0ZreS4aKy4vx1IZ9EsgzqGsnywJljPsgiJ+RKgWAwWAyWphaQgbiLQIYwICfHYrEImY/jtAaMt7AVN71Kj73lYxx/259ih2u4coqq42T5XIhxztAm/Td5v16q0ZeUXLbHZEbQ675+gXxXByTjMEdmdyiCJaNHG7Ic/gzoiRfp0Td+iCOvfy+mv0S1eRqtSkze5xl7nbax9u17usVOLw5SxSPE+809t4CrDhSocdRR8PIH2gQhBSeWMTVjCpSa3ChWHRlwaqXH0Tv/iCNv+CD9G1+GViVaV5i8D2I4NX12XwRQLiQYYS9Iqd1CxX0BQTtQkuwGxxo261OVpT8iDuNCodETL9fqd97K8TfeQ+/4zdQ762hZYvpLYDNcOeF0dp3Ck7skvTSf7dIh4AJeeJCUUo7ptZFJOgyKUFW19/trhav9NfWxG/Xo79/Nsbs+TrZ6PQBaFkjWR2yGG2/hJjuYrL8PHdrNji8OZrTbBfl74UC3Po+X1bTRRMDz4ooccCdfrEffdA9rr38P/RtfRixGj7FIloMYJMsRYzmx87ik75Gk+D0AYi4BBUxNL13n84xZZgFXJcxYxSLls+1BI1BPfBGhG16iR+/8MEde9x5619+Cm+wgNvel9ppqGM5TwrzPZFI1j9mFBSFN99Kw4HmItl94/gKuDpij9c46Sh3Uta9mdv0teuT293LkDe+jd+JWqF0Y9hCgYn1l0nq83eBD3rcwqtmvEP2hWLC1hOSiNs+3KckRDYXR/te1C4b7NF4ftGRdsOkrDoI3IufpAfHKBjj6/YwVo9wwtKz9/js59vY/I1s5FhCupV2umGBXj6NVgYh4OXA6wgSbb4QZZFOfrLYwxF3jsNTLPM6BpzTGgFXE1tTTMStW2XnTn+ixd/0lZrCMXT2Gm+wAoOXUFx2oK0+QAls1+QCT9VjfnBxYeWWBgNc4TIqKTIwvF1DV4ApwFVntWMuguOvP9fjdf0X/hpciWQ832cYuH/EULu9jV64DddTjLXA16hxu6hG0v9TfVQGtK5QtEPAaBweYvIcvqOzoZZaeg2ND4O1/qcfu/isGt7ySerSBlkVC9Uqk16c69zQSKJ4Yi+kPcVVJtbPOqKg8VZwbhKrJ7wVck6CAZENGhQ+j7yH0qprjPZi+4aN67O1/Su/krVRb5zC9IRiLXT1Gde4ZJO+jZUE92SZfOw4o1fZZ1NVoMabaOsOkCsVMafWdJIMIWCDgNQ6GUtrFIwWlrzB+85/o8Xf/FWZpzQeVVFO0KjD9IVpMMINlxOa4Yky2dgJXFVSjDexwDbEZo19+j8mvfwS2t2e6bhPd9/x86AKuShB8/WVjsFnO8cEK5Rvfr9f9wR/Tv+VVUFcggh2uepufGOrxFnbpCLgaMRmoo1p/FlSxq8eYPvML1r/5aapffEd8vGhcPWE+ZOlKRRJiArswo8l0wv32+zjV1Ko0e8OeVbcWcPkhHcNMMOrIyylbb/iQnvrY/0529CTV+jP0Tr2YemcTMZbs6EncaBu7fJRy41lMb9houzpYRuuKnR8+xOnP/9/Itz4jCkhu0cpHNcQkyKbsc8A145NzW7CxXrQKkLU1ooFduR8mzWmS1iYY1wkR8QFjWbCsV52UvUV2yKWDNFtC2l0hrCHUXGdpFooUh50WnMhL7J0f0mN3/wXYHFQxg2Wq7XWvcFQFWvkVrSTLMb2Bt/UVI8qN00iWM3n8P3j2vv+T5e9/RuIoaznBF7X3yOZLM9OsEw2VXyfEI5Vror0Eh3rPX/iEEH7fjWo+lDF5gWiXFWTObuoHMD5ZXFG/NIaJAcWGzMDRHkzf+J/12Fs+zNLLfw9XTJC8j4ilqRluc7QqAHyQQW/og2N6FhXLzo+/wbmv/iPD//icrE/aaK7MWKoYvOxbQ7OudDh2sCtONSSRJ16Opqxa/L0Pgi1Csy4fpFQv5FrYdheHX8yqDgQGwa/xB2Q4hgrF7R/StdfeRe+GF+OKMfX2JppP0LryEcvDVahrtJiQHT2FG++gVUE92sb2lxk/9j3OffUfMF/7Z9lKaRTgXM1Basbh6wN2d2Lh8ZmAVPZHtoX77dJDgoDe5OsHvIm5EzwbFM99bendb9V1p7R65es48aH/Rn78JsTm3u+7ep2nenWN6S/jRltI3kOynnfBZZ5Fu+mI4tlfcfZf/5bBo5+SreBNsbllWtYzMX9tWxNtIrT78MEIF4I88wjjTCbdAiEvGhoEDEXgu8lDFmJB+V4m2FJZBSa/+2aOf+C/YgbL3nbn/MpVkvXQYuwf0BuidenNLgrlc094iugc06d+yvpD/8TS9z4j5yZtc6alX5zXWItTaUoENUXtO8lO55cXfCHQrBOyQLbLAjPdajrRLD45jH4G04pqrJwYwvab/1SPvOn99E69GDcd+fApk6HFxCuPeR9UvLttsEy9s4HJ+pjBMibvs/2Dh1j/+qeYfuMzMiFQPitMa21Yv2B8mJbsz4IPZQc8FO7tiV9pInvnokW41sWDM/4vpNTWyR8A6rBlha3heN8j39G3f4zBbf+JaussZrAMdYXWJW4yQouJ13hFvMLRX/ILE4lgl9aYPvlTNr91L/n3PiUlcRFyoVQfcipZ5o3UtR6IfHChBSolhPl3FYzDyH8LSnjpQOnSu2Z1eg+OfpahRcWxPhTv/l/12Nv+OES0jDC9AW46xo13yFaPYZdWPdGcjskGy97md+4ZsuUjuMmY0S9/wJnP/3fsI5+RM1Ol18+pS0eZVD0zYnFVCWKwvR51UbDfakTnh4CpFhwz4FQSzbh7gzQIJ8agsa5g+rwFXDAI3n8LUAA2yzwCuhKTWbRwSOGoj9+gk9vfydE3fxCztOZD5sWAWEzmlQ+tK6idTyqajnGTEWIy7NIqrpwy/sUjnPvyJ8i+92nZmIKYjOk0mpdbdbwqW7Z7EPLBxbji9qNo8wJTrxGQYICPf5cTvGNfyTBYFOcq0CmIw1UlffFsd/UNd3PkbR+hf/PL0GqKG215M4sR3HgnyHwOtMZNdsjWjntlpCpAhPHPH2H94U/S+/6nZX3sjcmoRUyaNxI7IN1Jtd75iHiBVfLnwKJODPD8R3obDBokPtW6yR3PHFTHTunozR9g9Y5307/lFU0ku/SHNIWmbIbYDFXFLq9SbZ7FTXbQqsIurTH64dfZ/Ma9mO98Qp7b8QxPJMPNGJgTmFcRdQ7yxVsvrkh54x2RWRtgrKTK/jj7mwAickXTCwRLjcOKeIOz8+bZ65dgcsfdHH3Hx7Cr11FvnkGyntdk+0u4sQ8alTwP7NcrIqY3AFfjRpvUm2c498DfsvbTL8kTO34888GAutDgy4VdVE7N7PYAOH9D9AJmILLaLhJG9uvcwYNwoeCAKTU5lrxnqKc1xsGpI4aN37tHr3vnxzDLPkRKjUXyASIGDciGMeh4BMaCqynPPUPv+M3glPFjP2Dj3/6J4aOflWfHMf8HykkZEMKQZYaqooNokTLuQSE7BOniWXCTktk95mNs94b5kTcvNNgPwS63DOi1Xq8LltMpGVBdf6Nu3XE3q793F70bbqPeWof+EqY/RKxFpxPEZsHf6xVDQTDLR7wGPNlh9NPvsvWN+7Bf+QdZ12jSMcHYHZGxIok3vWC4OBacpmPGYtIq1xTJtNZ6E0T4i9DdvywgoMZQ1JVHvuM36Oqb3sPKHXfTv+XlwY439MpEVXljszpMljf5vBK0YACxGTs/eJhzD/wdvR88KFsKsVxWHuL6QKmk9CL/HNfrXvi4qyc05gVH12735sP0XTTFRAVEk+P7BChcjXRvrhtbYDZczTWHY2j5dX3//YWDsoJS/Z+H+ck4jfy0x/N3tYHkurC8bYx6Ea0QHMeGluKOd7H8+j8kP3EzZrjiqZ8qbmfTh9OvHcc4n89LXQUSWiM2o1o/Tfnck2x+6/Ms/eRBWS/BZJaqMsG7Ee5DfWV8Iay723zUBVHDhgKq+GfZjmFZrEHFzSw4IxJIsTVQuXatkCb3N6wRXLswacI6EtaAbYtXXw10Mg0Nb5YyaU4YsFn7XQiiNRZYG2ZsrF6v47veSf6K34aNdeqvPoj57jdEAJNn1LWQ2wFVWcyECLgYmQIgMSvXx81JGMimbwRvV9NAgcRCVWKAYSaUlcOdepGWd76HtTe/j/zki8ApdQwiMBbpD7GDZa/dFhPE5pj+EvXWObLlo2hdMXn8R5z7/N9gH/WUz2aEnA4NmW0RoujkPMJ08OXAMW0uCMs7zCBCQszi8Rk20o18SY/v6wWZvb79efkE9EsGzpEPh5STEbiapZ5BSsfmDS/WpT98N0vvfB9UNWJz7OpRpre8WAef+4RsFhVgKN3E+0URbIz/dc4vW2HNbBeEiBYUXNqlJmsS/w3iQ/QcuEqpjp3UtTfezepb3k9+6kXtavYKWle40Tb5iVtwO1tQV4ix2KVV6tEWdvkI9WiT0Y++xdbX72X1p1+WDQ1hXFXTJObK65eIepy/JwQ6ofYHgDBbM9BcAJ2+jBD7cVf4kLZhxBH5MkAqx/RVv6NLf3g3g9vfjBksoRMfPdJ/7euRwYDRxjk99rUvylbha++ZbEhZlX4Y1XjfqgPRuJKQIlSzGWMpG6+jgOQd/EY99yuOn9K1t/8RK7e/g97NL0XLgli1QOs6rGqVU2+eRYyl3l4nP3kr1foZL/s5x/gn32Hza58l+9pnZSO8Nv5ZY6liXkcKl3CV+0OJY3Nl6fP0dMhVu3pmrAY1pyuijhWQLwMmL36ZDv/wbgZ33oVZXcONR0h/4C/OcrIbbmb5fR9h/Nb366mVnBxQHSPWeQ+FOgSLNXmojlZjqXyRb9oBmZEeFVAhNxYbRIDqptt05S3vZ+1t99C76SW4ych7NbLcm1XqCsly7MpaKJUxIT91K9XZZ8iuO4FWJZNf/gcb//YvHPmPL0h0mmW5aSq5+PIbHfZ7CNve+cAVqQ949aChaSM25s4lL/su5YKWSvmSl+nyPR+l95rXtf5wAUQwR6+jPv0s2c23Yo+dQLKccytreuLBT8hTGxVqHP2VIdPtKbWDPMQu2yYpcjd4Wdlfp+rQypdIK0/doqtvupvVuz6EXb0OyUOw6MAivT5utOMrlQ5WcMUUqorsuhNUzz2FXV6jPPM0xZO/4Nzn/pr+d74oZ1zrNChq11DA0hv52C+e72IJ4cEUsOvzvUSmhf1thM83SKt0EAfeYQmFe0qlvPU2XXrfPfTf+BbM8oof8F4Pqhq3vYXbWEd6fXQ6AXVkJ29k+T3/C+t3/5meWPXKXV2MiUJfjWLE7mpJFAUiWqo6MpScih6O6qbbdPWt72f5je+id/NLg7znSbU6hxZTbxzPfB6HTkZIf0h5+teYJe9qm/zsUZ77h/8D+8j9su1alluq1ykdhJRLvezU4oJkwPNCwtnF5q5CNiy79gyusTIs57B500t08I5307/jzUiWoUWJDIe+JO3KajB17GCPHsed8/KVFlOyE6dYett72HaqN37pr+Xp9RhAFOyGxvikMdr4vVYTN6EtPjejB0xueZmuvPndrNzxTrKTt+CmY1+hoCq9/Od8SXGxeUDAGrNy1GvNg2Wq556kfO4p1r/0d9iffltGajAi1KoN21UC8oFn5ZfZlnnhLNgp7J7Ae4O5WmXAFBwmUL64WsHG9Tfr8h99nMEdd3rNsiwRa6AoUJsFecthlldw62eQwRDKEnP0GFpVmNUjLL/j/WzUtZ743P+QjQmU1FQoVd1hYTN2QYPBs1wLjI6f0pXXvZXVP3g/+U0vQUc7uO1NzHDZ2/L6A0x/CS2m6Hjk67T0+rjxts9icwXTJ37KuXv/msFj35YtLJUqmTHUYRbYrAcivib0TE2XaLe8dMpHhIMRMFi/fX6f8bm9WebXAY5QJ7UC01T07joi4Rme5F+g5fJSQzSkqyMXb4fLgBULZ07epKv/7X/DnjzV5EwgAnkP6Vt0OkWnUygKzLElNMhi5sh1uM1NzHDJD9hgyPAt72SnP9Tp/Z8mO/20gPP2VQhyaKA2mfW+5bJoJsLk+CldvesDHPngX/hAgq11EIM9cgw32sEOVzzi2RK3te5zOPI+WpZo0L5Hj36Vc/f9DdnPHpGR8csvADNablWl7SGM2+U1lV26nJDUFtitmHq+1PL5BOfoLw0odrYRhT5+OM7e9gpdvucj2Btvwl5/ErOyik4m6PaON7uEOsiy6s0w6mof2Km1P1+VXh5EMKtHPFK8XtGyYPSVL2h++impTLBxC5DnUBS+xJkRMqtIDdPjp3T5jndw5AN/juQ9TH9IXUx9gK+rfUxfOfWlMlSRwZL/LlXvgnM1Ww9/kc0v/zPys0dlrNHz5rDWUsclVaM6cJ7xfBcLlyYaZh5ydkv0JvGCVwHdC+BZSjHaacwsA+Dcq35Lh2+/m97rbscePYYWJe7sGRCDDIfejzqdNvY/nPNRJeJzIhBBVlZ9wGblzSGqSnbLbay86wiS99j50qc1e+5pKcR7TVzhU8tMliN1gamV+uTNuvKmd3LkQ3+J9AaYpRXqjbOYwVIoLFAiw2V0Z8dPAFdjllbR0banfKMtdr71IJv/9kmqnz4qFcbLd8677/LMhNXNE130POP5LhYuzgxzUB3ohBJqwoqvHgQEaxVqX5Z7KHDuVb+tw/d8gP7tdwDgdnzN47jAnk6noFPIcszaGjotkLyHVpXPrQWviZoMddMgyBfoeIwYQ3bqJpbveg+UBaOHH9TeU78SVxaNt68nFa5Wji0J4zvfxdp7Pw7qMMurVM94TRab40br/ndVIYMlpK6otzewqwaMpd48y853v8z6F/8e++ufSIUh6y9RVW3h8KIo2WXnS+EyUb0UDlUZoYHE7nVesJc77yoAqZXc+AjijZe/Uofv/QD9170BGS75cKU4YJkvwk1Ve0+QBue8c6gEH4YxiFNcVUHutVjKErXOKydVhRuPsMdPsnTnO5HhMqOvflF7j/1EcqCXQTmtKY+f0sm7/ojl19+FWVpFRKg3z5GdvBmcozr9FPlJ715z4x2yYzcgvQH11gZuewM3HjH58XdZv+//YfD0z2UnRLVU0ymg2CwjM46iiMi4h5Ixj8x1h+8iSeHFG6L38QPPuOx0lgULcsWDERpjqoPJq1+jSx+8h/zVrwHjFQxZWfEsdTL1VM3mSL/v217V6GjHewvKoglaUMAMfDFH0+vjRmMoC5930evjdrYREbIbb2Eod0JZslNMdeXJX4lWML3uel19xz2svPW9ZMdPAeC2NrAr1yFZTvnkL8lveBFu4xzSGyCDJdz2BpL3vbH52V+z9fB9jL77FbJf/1wmEtGrpWZ1VXkT0ExnXBm//MUhYDRUpiFZ6TloKV6SURcV66sBVpZztm+8TYfvez/9t/wBOpnCdIosr6A7O36lz/7A2/vq2st+ziFZz1NJBLe16bPLYiK2sbjtTegv+SBQEdxk7CtLDYaN3GiPnWB4+1uR/oDJo99QNx6xevtdrLzl3dgjx5vJbZZW0bqifOqXZEevpz7zLNn1N1Kvn/Fa8c6mdwkaw853vszWlz+J/Prn4pOHvE83Mz6CpVJHcBP7ZVXrUL2q4+HowuUarmzWAZ/+bGdEu8Cwtip6F5qCRYRtN3C169CO11zszIveiz0E5W7sV5wz+Nm3fesrdPje99N73e3oaActSszaEe/VKCtkmPs1MaYT7wrNe97fWlXozhZuNKY+ewZ73LvfzPKq9w1vbvjcirLALK1A4Y3FZmnVV6cqS8xwGXvbK0Gh96KXAUJ27AT2aMhKKwu0LLGrR6GssCtrPm9jZc37dNeOUZ15luzYKarTT7Hz3X9j/fN/i3nyF1JhMFmfsprSM4YylFezxi+jUNauRb4rCA0FjGu3zkSFiGeVeQwSdNoGcDlvs6LWFuHiQMf6gDG+SySsL2uIqH1pygO2Fdi9FNYuBVUDdcQ0S+PfsghSKyuSsXXbrbr8Z3+OveFGpN/zWq4EI3NVz8qrqkivDyGsnapCi4LxQw8y/ebDZDfczPAP30N+60tRBLOy6jXOovCBAXmO5D1ffWAyxa4e8S0e7dB/5aupnv412Ymb0OkENx1jewNvU+z1vWHZ5p7NVxVa15jhsg8+6A9wo23GP/o2G1/4e+yTvxAfyaKUtTcDFUldxtopbRTpbjiQ0l0WQ7Q4TLQVEwYuedtu8eA8eOjzqHPMpc2xgkOtZD2LjmuGBnZe+7u69IEPkr34Nk+xnEJdtm12rhlssRkyXMadO+vZ8dIK5X98j+KHP+DoP/93Wd+ekn//EbaefVpXP/yf6f/u69HJBKQKaZADtCi9Ac5Yz87F4EbbTTiXWV7z+RrGB0hoMQ1t8ZM5rsUhYjCDAdQ19WQT0xuw9dXPsvG5v8P88kfi/bhQOo2j1+kdN3P0SktCB8qA++Y1XPHcD5f8crvPqIHKRxL3eoZ6POX61YyzL3u1Dt77PvLXvNZHktTOI5rSRHMjBno9KCvMyipucwOzugpVTfmj7zN99DuMPv8ZqvUpJb4yQf9735Yt59RtrNN7+W9jjhyDsgwKytQbjsNk0No1EctuZxu7ehS3vYksrTYKjVi/OrnWhZ8EfY94TUpllrP10OfYvP9/Yn75I0/5MojKrc/W291rkTFcDeHAh1dCrlpfru9GJSnII4BmgCBqGNiMerLDkUw48+Lf0uFHPkJ2y63+vskEEeMH22YtMmbGs9ysR/3M09jrT6LTKdWTv2T67W8wuveTDDfOSWGgUujllqKo6X//u7JTV6plxfCNf9CUMdayaBGqLMEpZtkrF4AvCBRcl2Kt/whrofQVDBoZW3y+bX3uDOXTj7Pxmb+h9+TPpAQGA8O4cJ3agElXBVdjCldaH7ygrDhJFY4rDA0rmXFDG1DvSV3tLVEVmxwzOWde+7s6/NA92JOnMMePQ4x3a8KxkvCjuoayQKcF5tgx6rNn0NEO0+98k9G9/8LKxrpMCAlIFkZljeDF4qWf/Ltsb2+pjnYY/P4bsWtHPXJlmXff9fq47W10MgKTYYZL3j64vOoN2hLiFDWW1fWhUVpMvTnHKZMfP8Lm5/8/ek/+TIoQQrU9CXxAhDzLKMvg5Ujj+a4yuHhPyBX0a8xlJdGxj0FwVMUmRxCeu/21Ovz4n2BvuAFZXUN3dpClZSQTtCi9jCaVrwzQz8Gpj3wZDNDgox3f/3kmD3yB1c11GQPSMz55w3nEVRyjUJkge+KXsv2pv1cdj5C73o297oRXHDbW/XvzPGSkWch7MNrxFHg6BSseYcRr3VpMMVkfGSxRnz3N+NGH2XrgX3A/fkRcD1zRxhD6cCpp4kOuKrfTHLjwxPSrZC3giISe/Wb4qBIAh6VmiZrn7nyTDv/ow9jbXowZLqE7Ix/Pt73t5bw4Sg3F6SGEkmPTKbqxweTBLzH92r8xeOYp2QFMr8e0rLC9nLquIMu8c78YU+PoL+Wwflp27v+MYgz9V7+e/itf7U0rhS9zK/0hYmxQQla94uGrintq1wuh/nWNSoU7t8nON+5n84v/iPzih1KIt4HHxQqEEN9XhyzE5yGe72LhakzRPW/w3NN4PqwmIGBNRsXGnW/U3p1vwr70pZjVVdxzz3kNVwTyHB2PvQtteTlEOFcwnaBFgVYVur3F+MEvMr7/8wwf+7mUgFqhKB2IpS5cQ37qqgLxK06OxiVTBTn9jIy+8kVGX/kC9ZnT3pOSIr0IbmfLT4zp2CsbWUgFtRk6GXuWPd5h55sPsvXAv2B/8UMpwEfEEAzKKjh1s5SvIRCz4fQpXGn0PBQFlPgx3chmI4dTpeIUVfV5wam98CJ7wAB5z1IXgqqhP1xiOtpkyVQUr3mtDj/6x17eyzK0KJAjR7zhP1YDGA4D28t8emV/4JEwy2Bnm51/+FuK73+Ppad+7Qe9Z7y1xgg4A+qwSIgqCQ1qgjkdzkL2xGNy5OxjbPX6uvK+j/ogUvWTQCdj7HXX40Y7Pqig1/MsnxDU0B+i4xGjb/0rm5/9W+Txn4o/m6HBXuZlPWn/IuI5t6fsd7VIhM9vUlJwx11KrmAFyqJmkC1RVCXVaJO1DEav+k86/Mv/4mW+/sC/fjr1SGbCYi3OQc97Nrxm6mA68T7XH/w704e/yvTrD3Nk/TkZ4823Lmod6pUKGwJHIVQn1ThRQyq6OgqBMyOovvYg2IyVuz/s/bmb617TNt7up5OJD7HKet48JEJ15hlG33iQ7Qc+SfnkT8XnFWc+sw4TKqKmcXtp77g9fl89cEEI2AQZnI9TN1lR/VIiYKnQN5ayGjEgw1Ixes3v6fCv/gJ76gYfhQJQld5AJhKocLD3GYM6hbJElpbQc+vUzz3H5MEvceSBe2WrhBFAwFdVaaPD6zrQHG0SmVRNkscdPDVSo6Lkzzwpq5/9a3YGQ1155z2+clWW+2CD1SPQX6I+8wz26AnM6irTn/w7o6/dz85DX6B89he+AH42gHEdXInamp4izKV47bErzXK7cJ5JSRfxJtUWCS8hWBEqV5MDS7Zm/U136vBjf4y99VZ0e8dHLkeWlGfe5pdlTUAAdY2OJ/4YQvWrx5j+6wMcf/hLcqYMQ2ckVCoIvgVr/Dg7hYQCGXwiuv/e6Cb0MqlmgpiKsxOl/Nw/gRiW33I39sgxH/Q6GqHTCdnJmxFjmf7oESY/fITlB/4vWV8P5qF+DyZBdECpqT3Sx87o1ue7SqleCudPAc9X+21qfVwejdnmGXVRkgPrd9yh/Y9+BPuS29DRGHPsWFAyQjlZxVPguvaVhOoa6XmlQLKc6ic/Yvq1hxk+8AU57QAjVEhbGibytzqkQoahb9c+ay+JlMhkPVxZUpb4FcbzAnvmWdm5/9OqxZS1930cV9deI7YruMkYt7XB5MffY+vz/8jknAaKamDsQjyIIbdQlh2frkYqvDs442qjfBEuLC0zwvnGVYWAhOa2S0ANp0XJUGD79tfr8L/8KebUKdy5c9ibb4HRyNvZUuSvXasFh6w2sRnuzBmmX36Q4ptf96m2NqN0BJnOt9MYwdU16qpgdM5wtV/csVE+gxgYu8WVJdbk1E4pyopenlFTIE89LqN/vU8FYeUdHyJbPYrubON2thk99EU27/sEy08/LlPEJ6e73NeTkRqloKhb+tad2lfeOHZ4OBABZS8kOyxFi2Ev0Z2UIuAlgNWVZbZuukmHf/Xn2Je9BPf0s5jrr/eBBOOJF/LVoUFO87VpvKdBjI98qR5/guLb36L49rcYnH5WCsTLWkXZmDPEgmh05IeFHV3lWW7SFTMOGRxgsZKRWUtRTyjKsOqkgD39pGw/+Fl1kzErb30PIIwe/hKjb32ZtacfFx+O0KOPBc19YSzGlM5T3awHdbG/LW1vJmwOvOL5AI+Aibwww20OvahvYk5JqVs6MCLorvow3RwEdgVGtnga54ojVi3IgO1XvVIHf/LHmOuP49Y3MCdPAD6tkX7P+1NjcZ+YNqpe9sM53NYWxTe/zuRz97F69kzQdsWbZkzQb7VGK6X2gh9GDCYEd3bJTdc3NMx7jMspYMitpfQ2HHy+ksOefkrWHvos586eVsRw7IcPy+TMJjuAwdsLfYZwgasdJnHmRptf1Hnmba92OFQ0jCp+IG1QBW2gInWdyHgmsevJrJfbiA/utAYR8awtQIto0Zzv5Zw4P21uKUoFcsgyMi0x9YRVgY3bX6/9j34Yc+MpZG3VR5lMpmG1ngytS+9OE+Ndajs7Iaqkjzu3DlnO5L7PMv3Kl8nOnpEiEx8vF1m06+qYvuG1Jg7/A4y743Ic9g1FPW2eE1NNauDJM+uYr35BHPDUzJOqZhvJQ51ouZo0L7anu90brg703BsB99Kimuy2AzTaXacO4LmRdzn/3oiY3sgaKhAgVHXFANh4652av+VNHvlWVkKv1w3L1BhVkuUwmfholF7PFz/JvSts/M//RPHQQ+jTT0sBWDXUAekyK9S12zMc7bASxNxq8nOeU3e2s/fMG4f5u93t1Q4XURsmIuDeYVreXrg/Gz9MR8UCoVQlgmO1n7H9treS3/46H2ESlhdtvCvxyeqDTGV5Gd3YhKUlZDikfuwxiocfZnLfveTnzkoNdAuKX+nlF64VOLwrLkK0fUkYYLOHCHwhgzeH6hoDNXUTrWxRzpw4qUsve4kvDxLj98AbmI31bazCqmmVg9x511pdUz35GNPPfY7iqw+xeu6sTBJRIbrTYuHxBVx+uHSuuG6kzHnDfEQ2xDwGj5h9Y5isLCOrqz6qJSygjLFeTo0KUDgmS310YxOztkb9s58z+eSnKB95lOOnn/UhVUFYfd4r3C8AuJDSHCaYVGZV3L1vvEgDdFsfXLFGvBF5OET6ebBy+HUuaJwSrqHMElxm0u9TP/kUk8/ey9qXviCFgzFCjaFKJHljDKrarP3ha6fscnYt4BLCBcQDamvOaI7NgUtIQQT8+hZhTVwZhiSifh+JQbGqnh07DTWY1Ye5b23hnn6G6QMPsvLgvbLhCOur2aAtKtb6KO/uojOXc5WjBXi48PWCnyd7u5XE0qPeWCODgTevZBkao1uiaGpCsEBVoJMCffY0k09/Brn/ftkw4IzBOcNyvsSknBD1zrRmSp7nVFW1YMPPAxwqIFUVL/A71yTKBFdAK291gw0ios513yW7RFTeI24tub12vkC3lmUj70m/75FwNVQuKEtfj6Wq0bPnGP+P/5frH/lXmUoIpwpxjTvlxGu6sIvNlmW5QL7nCZ7/iOi9Bjb1pMw5THo6IrcRdGMTWVnCnQ7RxisrkGW4Z08z+Yd/5MQPvynPnqtbTLcmyLBuVyrnAp5/uCJV8lOYa+6WWU9e9CTEFYbEWl8mF0GOXeeRcGnoa+Sd8+XUpv/ySY595QE5U0IVH5RZ2qLekboukPBKwvMeET2PtbVJRZ3LSdHDR4UYqUPyeKBkVeVlwvEEs7pG/fRjFF+8n+rR77FeerZrrOCMDfF/HT/ggtNeUbj8LDipjhWR7zBjHtEkUj8fwWK9rdq2zXbn1n20ysoK9eOPU37nuxy//9OSP/2MlIQV2CrxpQtKGmUlRuUv4MrC80MBU6p3HsK9I7jEwjzxy8VbUoenrK3632VJce/nKb/5bdZLmALYni+eFHKEfXSyQ2wSzLyAKwrPHw2IWjJ7jLv4UKfm8uYvpFuGBf9mVqlzzptiypLpJ/4n5Te/TfbEr2RUgl1eBWcRu4Shhw1r3ubGzoaKvJCiN38D4SIR8AJGr1vI8lCvUXyUniYlOLzJRycTyi89SPHlrzJ8/FdSOMDm1OMJZjBAncNRofhlUl1cL1cDC15QwSsKh2LBxuDXB7HWR53EuoDA3OKTcVSj/XBa+mCA0q9bZhrzoOkk8UBTCy46XUKFAgmN1VrQ7R3kyBHcE09S3vdFyu88Sv/xx2TqIMsMVVX65xWjJmjOJVJljOPTvcvkLeB5gksnA2ryI5Ip70Pb56YDCLD4wABrfLUX56Df7zNZXaF+7JdUD32D8uvfYunxX8tWrCUe5DwfuVzjQlDngtBdnXBpipTveSrxFyfXna+TQaQtaV65GvfMacpPf47yq19j8PQzslWUzXUpLAIJrn64tFqwaicotIXo9joQ+0JsQYQ8t5Rl3XDonUlJ/9HvyerPfs65rR0KK5gkJjH16S7caVc/XEIW3DG1NPa/5Jq4aE3n1l0JSMkFMSLFOc+wFSgcnNnawRraSlAdiKFVCyS8uuHizTD7xfvNY8E6D13CZezWq9u1zIIdMGuJbLWHF22BfC8cuLR2wP0GfQ9EDfl1Mw0RZpExy7Im2a6KCdnWtAUZxbNhY0wT17dAvhcGPL/OqAOiow9qTJZlrZiZrPQTo5i7iGft1bpE5wIiHD4eMLO+UoAx3qGfmeDdiHa7UPXAmlbWi/GCEVysLJA8G0/RWj/ILD0UQuFH8GubBdJYdOuizIGFFnz1w2WVAbtmEeCShuov3GgvfLhEdsBOJQRJpLiWT+75iBlFufl1ddQuWcDlhedXBkwCEs4XGsRc6Ba/UXBpl2vtrpDZzQmZFw8oMBMFEyzOEeFiJtwMzDxgQSFfyHDpKGBK2eZRuZmyHgEOuUZtbORC5PvNg4tHwC6Fc7sp3p77MN/6vIBrBvZmwd3l2+dCStU0hOj5sFGchuwzOnaX+NC4nJbuelxzHhdLQTb787cXCwc9/3K992Lff7Hbi4Q5ONI1se19wrfjUBVSjVGfC5xnIR4w+MNyv6SVp2LGK8Maw7HUryzuFIYDdBKWQp0WGF9xG0zuS3xKLLzdbbyh9ZXM2x7C0HxgzZpkQszZCqHEr3r7pqp0rrs42K31z3l/8s3K7Pt1j/sOve1yn/2cBfP6zzhsMAlr3Y5MtO9GD9bu/jJNjOc+1E5n35vKcQ27leRY+kVhUcOqgtHEI2hZeYN2vKaugboJGr0gBVcOQMIDF+lLUwF2b7V5hobtHnUTLxA0vMcP2u4tzb6Grdl1fr/2778l6fTwXZpSSBf6N+77/Bo/Xi1C1SFR0dpWrDciSFp7pxNx0rhZD+ygWCF1njzXjXqJGrG098rSAGqHWIuGtXgdDmuU2hUg5exzuxPwAKzMDkCw/W5XCUMhEBcHPK9t2ma9gG28d5/3qAtbTbYmuc5dQLuT9tumg+YjaayLrbtKaPoYc5vnVHXtXaGamstilJJpLR3JYJjwjMObYbqkORYqaopUdq6Pykjly/h6IqLo1o6PbtaCel7cYGd/PwQSJcX3+dfss68K7kIUoGh37yLShWyh7UZ2b0VoFl9qthfQ5L0g1QH37es97hMJsziYzzLrUSqWEtZugacosQXucn4FKk0Id5+x89GhjtIiJfiazUNPBen3AC+5VeoYZMK069LdR6jdC85nQNJrHTR1NoXz2F4GF/Oe74sYt1eQ0fm0u7OF+QUBDm5rOyquGUAv08X4zLa5kbXPb/v5U8B5Qmqcns30TU71co940xJcgawuM/BNoqqUZRMEezUodUi9dIdCqn3GZe61XbDsVmO61+1WjGahlZh8gpUJc1vCcRv2zR7bVMKau9V2v+6c36tNh4U0O/V8vlmSoxYlsxYLlHUdJNVQNsVaytrNeUILhy9QOU8DSijd3kWH1CshTmE8wfzuqzhTO9WihKqiGE/aLPGwiMwt44l4yr2/GUHFUQs42fs6EYsGoTndqgpGIRfTVmxItvF3GlCRHo+fa8IyXuKYu7X4rdH524POGwU1klwvzT6Q1DA8fzOME0epGhL+ab43/eb4/Hgs3Yo6+gLPDU9oZf2q7mIzDLC6dVo2xiOvNO0hJx2aBScj0P5FwSUtCh7fkgoqoZybDAfoyhL2PXdhXvESX9GgDIsHuhb5qJVn61qpnSf1IaZvpth5MIUIyXuQRr5Iv1ZCxzTkMmjvEnpl2pwL21BiTsL3alW3z01L0M30qoCG9kbZN5yPDMojrHREeaE2fgjCMLcqQLjebwxOBEm3CN6yULTdn3x78z/lRjN96Jlm1iCYVxBFoiElIKLJ/F1ifD/EFFwxQXxx3NgbYvI+preEsT3Kc0+x8e37tP+tT8lE3Sybl7ar4XwQMHZ+7ZhZ/7f5pj2kNeev12mBZBbWVpDX/Ja/I7JtFTDi931v0JTdFTPTmTIz6NCs26LSdlRsTZjaLWLEJ8WBkZnhap6RvqsRKyQgbbct3WfSDmJAbFF2Xxe/q2lXpDyd7woD7RFAfX9GRAjHZMYclnyVtLGVzbek3920q+275l3xaLffkHYMxPgxMwYtS0zWh7picNMrKJ57Avn2pyg1kTMDEiOOWs9XBoxtjd6N5kDcHiSNJNQxFhfSpNOSqqsNIiK+3K6mHcDsfhUXijZJh7ZbicvWW5O4CWXO9cl7I3KECTLz3kgdu0ictimorjMU2qVLVph2shjdjZSNcNtBSgJvj8+ISGlmJ+Yswree9FmE90e0qlq2akz73EjhqJNJakh6y7/HGP8OMYgJqwuogrHkEtG7ix3RiH6+FBCYSTBK2W/6lviNip+xJNcrgdrRUNKZIuPhfIMciW9ZSShD8y3JM+KvZND8s5L3ptfFh6Ita2nuD+9Pf7twXWybhPYogX0lyDKzXon40sEpIodrm/LCTXvazmspbLg/ImnKLjvOgEiRZidJ0sc2mVQaJigEqrfbu+ORMiEMe/rzw4BL+/1G0ukdIX3HIV1xDVZDMiC0iDKP+IVBiQNMNErOkHXfYHXewt+8Iy08bkw7KFHmTPdT5J6Zasm1aRt3yW4aDrsGuZrfAXn8BX4itYvvaEMR44RT1yJNu8im+HslmLC6g5wgXIMwaZsUEEuzSLhquNL48wnytc90DRudPd6+U2mR1bdSGmKhLkiuKmAsEt6oTUqF/yYNVFBF/X6iH6ir6ZoA58HFacERujS2mfyaULP0YaSroJIi48yMhtBBCQsK1zeDG2SiViGanXMeuduJ0jxdFZWUItJq4xFZNOnopu2hraFz/ZG23RqpaXeSpYhLu4migMRvl4CwaZ+5ukUoCHJ1pKI6y2XCs9sJpUk7mUFw35WzFD1VoiLJ6CJxs/KoguIQydprYgVaVWqdR5vab5PDekKco60sGilgF1F2UZiwtZHqNV88w1ZbJSOcM7RURxIEa+ahhA/vIE98d7pgYnxG+rrucWta5N4Vx6jt9zaUJn5a53h8+kyhpg67j/93aZTxsjCBjPFu2OaFAUFnrA7xk5OCdQ11DHc617wjVZJIJ56L1DI828jMPeoS8UQ6E1+i8iJBNBC0ofRtV81Dwmh/PRwFjA1tcKvDElNofMPzBihAlAHnEdUZKhbYc4Pcc1qWdM48mKlP07TbP1skvS8iP+23Ie1gxQkX72meMYcqN++NlDtpe6MJzrLIdnI15KFtq02oVEPtOiwniAizsnq3P7viR+f747em8nDXVxKR02YtJRODmnCftOZtv5R3Ah6RSFuUQdU8aJ5l3DMVZu1bDWlPqEIXYh+5lJ20A9uyrrDEfBrUkLBt6bLg2Gkz7Hu2E2eQXoIWrdr6LVOFYK+0gWg+aRCYXWM+K1rE450JqA6dMe8E1t70a5B/m8kU7wsP7K7FF769ibsMxvEZ5E1/N5OKZNzS7kpl7HA8rBiqjdafjnkiX+7qC23Yr7p6jtS2WyjMbHJKmxabpjGi0MtgJL6z6OVQVH65+yi3pCwPZgcmzt703Q3CBdLd3CO7CGajoJDM3/ishprQdqDiBznKZNJqfK0sRzKBan+dulbLayjBLHttWA7QRAZ0YY47smGNQTnw5lPXtr8jdkiIrUQMuNq3K9Eypa3SmSzSkzDf1CQ0I9dq+w2NKNF0tA8aScWEeWy/awFxDldMMPkQV0y9KSbkg2fMj5pMXz3LggXakELfKIFZdplSwkghUgSgs68wIy/OlZ32BokV8bXpXhp21xynZQ0RiYy0ZpN4V2pfBJo6hpE6anJM2ufv+qaUzR6U5Wd81HdDoRJjb2NMjm1RpdUmA5ISrRCtxuuROUwwrWfHp0G08Nxohgrn/HcnSCXtOUhsnKGXdK8A1SgDNi44C7W3BWItYjOseNxpCGQiH8bvyFyy46N+09PBrayE9Xi7s1uZnemdbfxYZNa2J7RULBWcd5kkwjbKPREJGpmhBpUZUaZld/FSTXdm2J/EjoxzqRnIQHG0VYDiSzQRBdppZWaeTRBcJFLjmb5oO0ldnbi+aNhrwyEiW2uEf9pj8XsC1ZpRyFKbZPyfijipdlxXsffbvozj0pijUu6mof+CCUZrvzJ9Zf2zwrPbSdQFLyfGeZvpzIlILeKMY0bCminDEft6bgbcHr9T+cx07k2Reh4yomHwNWFjs0jVXJ9SrmSStJ27+xzRJZgqBd37GlyKbaShHDNtmJGPXRjYrv0wUjdH6v4iZb8RGZXWHirtBADxAcuJ6OBFA9P2tdPOd3fHKtgm43sJmm+06dmM1kWpzTP9eESTk/MyX121hm10Lvv1EOv6NGaYlPIFEIcJGGxaGpqcT1jdzLnOtiuJpsbheF7Sweu2taOERA9Cc7+096V+40Z7bQTGGfbSToRwNCJgeu0cF+DMM/bzDMTDxiZUcvZZwN4svNF2ZfZ5dH43fZKeD4pPMzlmb/WUORyPwQZN+2jEl7SrvJGdloo3EyBDbYaYHKzz++IweZ+sh1+fZQZm0TLblaTivz79vN0TJ0U67Xxgl+xGn2szQxMzwjz5Yldnd65LxYCmgyPyRo0zUMnIBlPY9TGRPnQn0DzYTZX3bHe3/alclpyTWMErEUk8C4vIGhKRUhmw6eOE2kfK7YI8iyY2vHlcpdPmSFldci7pl7gEbnNcaK4VY8PazLZh/2IsTw9OaFac3q9DyQ5KDtfYN6o0q2M69eqLc7s16+4gNKsaCTPegQRmfK/dbXyv/9LmHX4m16TyTGSjSoqzezOCyOIa9q7KbPJNYJOkmnSgIA0eJkpEM2gJpXNxUhgg8arMeC+CTXJGxg7eE2OSY11xg2AuSlh+olRIt42piSh9X+i7GVdbfGe7pEEykaShlFpXzeRSdV5XcHV4rZ0zJ2cRJpsRcBolxDWX1gQqGmWCSIJjXJxtnelN41OW3LWzNZ0ZYC/KESGJhkkRsHHUi7QdHRAwZcMEM0WqQc/c38T/RbYzR8PW5L7UCN1QnjigyWSPbUpZcCoioC0iKi1iImDNrMauJDLgrHiwy6skYUvSVwkSNrbNqJFHEcdpG5kD7f2QaPuhvxuRJ3K08Lsb0GEtNfOG18udgiNrOxi0g50qUKlfbVK//zP0xHXw4ptgUnjX3OoyTIqEJUgzURt2EZJU/IRr5ZkGIZoB6nR40wj2QKDwO6EkqSeiuSOGazUTY86z5rnr4rMi9Z3XBmEfBE/bQoJQ7fEZBE7v6MqiybHd+9IMfvRiSGSFu56zu40arBuNFSJwuMbFl5q3ZnsIELQssIOVhhPZwSpuOqI4+xRHpmflTPpabfvSxhDc1BAdzoUbwosNaO3IBVaWh/TEUJVTDI5+nvHEYLkduv0oWdIB6ac0huqUs6TbiNEzJxKYR107z5jxoybbm6tz4hCcOIyauVtqcKIYlV1bUKwcmNWx5/ap7Lo5BbPndcQhIRqxk/1Gbtt3bCIl89sb62fFc0PHU/ak7j04IFkPk/XQukLrEjEZGMvK9tOyMZp4R176CeFpEe8ORsDMUzAfmq5NF2WCNyEcvnvmQsfKdF7QyKcXASrsm5MRczvmnYdAfA6ceHtDkqZ/Ye0P292osf+8Tq/rOKlm4KC2tTaG2WcYMrJhn/F4HE6m1I8mGWs+AjZP7GjIMcTd2sb2g1TtjQd97Zyvv1gEbibMBb7/ksBFvP9STODdilZKafeHhkJdSPsFmgVcMNgQfe6SaBiAmYUoOwiY7UI8kgPisFkGGpc98J4ALzdEueUAViOxXoOZu1Un+9+/7xZaVyDzt/PsdAn4L9j7PbJP4qTDhdiOC2///q07zP3zSpPEcemi9+z9KjEwIo6Hstc4zd+C7eV+KY2qpnY1mbHYkInoSFZNSCbdrP7fzJ7DMjND1OisNdRV4RsUZIbz2l4SuJjnuGaoLuzuS0BIG3tRF8H2uyfpv5mwtzTvJJy+JILKfm1hhponejCe7gWhL60/pIkM2MYjuJmLZnQeSfopXn2JvuliB1AuCgEjC7/Aj1F20ZgLej9wXgiYQPv9+913+RBQ8XqkX4fZ2xJblBeqBgETe2aCY4cuzWHUm2QMgPFKSNzfj1EclHh9AIdMjNR7nA8UYK/3SzAu7XXeaxP7vGO/BsrB7z9o26rBrrM9HEgQ+VONeVa1PtzzLrT9eWaoKkfp6obpN2+0tDmZc7pR21cfTEX2E7MuZnup4KLefwkaf6W//2LhYtsvc/72vGABC7ha4P8H7AVIfPdQAOkAAAAASUVORK5CYII=" alt="" height={30} style={{display:"block"}}/>
    <span style={{fontSize:28,fontWeight:800,letterSpacing:-2.5,lineHeight:1.2,paddingRight:6,background:"linear-gradient(90deg,#d4794f 0%,#e8956a 115%)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text",fontFamily:"'Plus Jakarta Sans',sans-serif"}}>Tasti</span>
    </div>
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

// ─── RESEARCH TOOL ───────────────────────────────────────────────────
function Research(){
  const[q,setQ]=useState("");const[ld,setLd]=useState(false);const[res,setRes]=useState(null);
  const go=async()=>{if(!q.trim())return;setLd(true);setRes(null);try{const r=await fetch("/api/research",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({name:q.trim()})});setRes(await r.json())}catch(e){console.error(e)}setLd(false)};
  const copyAll=()=>{if(!res)return;const i=res.institution;const a=res.ai;let t=`INSTITUTION: ${i?.name||q}\nType: ${i?.type||"?"}\nHQ: ${i?.city||""}, ${i?.state||""}\nAssets: ${i?.total_assets||"?"}\nDeposits: ${i?.deposits||"N/A"}\nBranches: ${i?.branches||"?"}\n`;if(a){t+=`\nSUMMARY:\n${a.summary}\n\nPRIORITIES:\n${(a.likely_priorities||[]).map((p,i)=>`${i+1}. ${p}`).join("\n")}\n\nCONCERNS:\n${(a.likely_concerns||[]).map((c,i)=>`${i+1}. ${c}`).join("\n")}\n\nPITCH:\n${a.recommended_pitch_angle}\n\nQUESTIONS:\n${(a.discovery_questions||[]).map((q,i)=>`${i+1}. ${q}`).join("\n")}`}navigator.clipboard.writeText(t)};
  const Sec=({t,children})=><div style={{marginBottom:18}}><div style={{fontSize:10,textTransform:"uppercase",letterSpacing:2.5,color:C.teal,marginBottom:8,fontFamily:F}}>{t}</div>{children}</div>;

  return <div style={{padding:24,maxWidth:800,overflowY:"auto",height:"100%"}}>
    <h2 style={{fontSize:22,fontWeight:700,color:C.white,marginBottom:4,fontFamily:F}}>Bank Research Tool</h2>
    <p style={{fontSize:13,color:C.muted,marginBottom:20,fontFamily:F}}>Pre-call research for booked meetings.</p>
    <div style={{display:"flex",gap:10,marginBottom:24}}>
      <input value={q} onChange={e=>setQ(e.target.value)} onKeyDown={e=>e.key==="Enter"&&go()} placeholder="Search institution name…" style={{flex:1,padding:"10px 14px",fontSize:14,background:C.card,border:`1px solid ${C.border}`,borderRadius:10,color:C.white,outline:"none",fontFamily:F}}/>
      <Btn onClick={go} disabled={ld} style={{background:GRAD,padding:"10px 24px"}}>{ld?"Searching…":"Search"}</Btn>
    </div>
    {ld&&<div style={{textAlign:"center",padding:40}}><div style={{width:36,height:36,border:`3px solid ${C.border}`,borderTopColor:C.teal,borderRadius:"50%",animation:"spin .8s linear infinite",margin:"0 auto",marginBottom:12}}/><div style={{fontSize:13,color:C.soft,fontFamily:F}}>Searching FDIC/NCUA…</div></div>}
    {res&&!ld&&<>
      {res.institution&&<div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:20,marginBottom:20}}>
        <Sec t="Institution Profile">
          <div style={{fontSize:20,fontWeight:700,color:C.white,marginBottom:10,fontFamily:F}}>{res.institution.name}</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"8px 24px",fontSize:13,fontFamily:F}}>
            <div><span style={{color:C.muted}}>Type: </span><span style={{color:C.soft}}>{res.institution.type}</span></div>
            <div><span style={{color:C.muted}}>HQ: </span><span style={{color:C.soft}}>{res.institution.city}, {res.institution.state}</span></div>
            <div><span style={{color:C.muted}}>Assets: </span><span style={{color:C.teal,fontWeight:600}}>{res.institution.total_assets}</span></div>
            <div><span style={{color:C.muted}}>Deposits: </span><span style={{color:C.soft}}>{res.institution.deposits}</span></div>
            <div><span style={{color:C.muted}}>Branches: </span><span style={{color:C.soft}}>{res.institution.branches}</span></div>
            <div><span style={{color:C.muted}}>Source: </span><span style={{color:C.muted,fontSize:11}}>{res.institution.source}</span></div>
            {res.institution.members&&<div><span style={{color:C.muted}}>Members: </span><span style={{color:C.soft}}>{res.institution.members}</span></div>}
            {res.institution.website&&<div style={{gridColumn:"1/3"}}><a href={(res.institution.website.startsWith("http")?res.institution.website:"https://"+res.institution.website)} target="_blank" rel="noreferrer" style={{color:C.blue2,textDecoration:"none",fontSize:13}}>{res.institution.website} ↗</a></div>}
          </div>
        </Sec>
      </div>}
      {res.ai&&<div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:20}}>
        <Sec t="Pre-Call Summary"><p style={{fontSize:14,color:C.soft,lineHeight:1.7,fontFamily:F}}>{res.ai.summary}</p></Sec>
        <Sec t="Likely Priorities">{(res.ai.likely_priorities||[]).map((p,i)=><div key={i} style={{fontSize:13,color:C.soft,padding:"4px 0",display:"flex",gap:8,fontFamily:F}}><span style={{color:C.teal,fontWeight:600}}>{i+1}.</span>{p}</div>)}</Sec>
        <Sec t="Likely Concerns">{(res.ai.likely_concerns||[]).map((c,i)=><div key={i} style={{fontSize:13,color:C.soft,padding:"4px 0",display:"flex",gap:8,fontFamily:F}}><span style={{color:C.gold,fontWeight:600}}>{i+1}.</span>{c}</div>)}</Sec>
        <Sec t="Pitch Angle"><p style={{fontSize:14,color:C.teal2,lineHeight:1.6,fontWeight:500,fontFamily:F}}>{res.ai.recommended_pitch_angle}</p></Sec>
        <Sec t="Discovery Questions">{(res.ai.discovery_questions||[]).map((q,i)=><div key={i} style={{fontSize:13,color:C.soft,padding:"4px 0",display:"flex",gap:8,fontFamily:F}}><span style={{color:C.blue2,fontWeight:600}}>{i+1}.</span>{q}</div>)}</Sec>
        <Btn onClick={copyAll} ghost style={{marginTop:8}}>Copy All</Btn>
      </div>}
    </>}
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
      <div style={{display:"flex",gap:4,padding:"12px 10px 4px",flexShrink:0}}>
        <button onClick={()=>setPg("dash")} style={{flex:1,padding:7,fontSize:11,fontWeight:600,borderRadius:7,border:"none",cursor:"pointer",background:pg==="dash"?C.card:"transparent",color:pg==="dash"?C.white:C.muted,fontFamily:F}}>Dashboard</button>
        <button onClick={()=>setPg("research")} style={{flex:1,padding:7,fontSize:11,fontWeight:600,borderRadius:7,border:"none",cursor:"pointer",background:pg==="research"?C.card:"transparent",color:pg==="research"?C.white:C.muted,fontFamily:F}}>Research</button>
      </div>
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
        <h1 style={{fontSize:15,fontWeight:600,color:C.soft,flex:1,margin:0,fontFamily:F}}>{pg==="research"?"Bank Research Tool":pg==="emailfinder"?"Email Finder":PIPELINE.find(v=>v.id===view)?.label||"Leads"}</h1>
        {pg==="dash"&&<Btn onClick={()=>setShowAdd(true)} small style={{background:GRAD}}>+ Add Lead</Btn>}
        {sUrl&&<div style={{width:8,height:8,borderRadius:4,background:C.teal}} title="Connected"/>}
      </header>

      {pg==="research"?<Research/>:pg==="emailfinder"?<EmailFinder/>:<>
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
