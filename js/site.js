(function(){
  const card=document.getElementById("next-service-card");
  if(!card||!Array.isArray(window.diary))return;
  const now=new Date();now.setHours(0,0,0,0);
  const next=window.diary.filter(e=>e.status!=="cancelled").map(e=>({...e,parsedDate:new Date(`${e.date}T12:00:00`)})).filter(e=>e.parsedDate>=now).sort((a,b)=>a.parsedDate-b.parsedDate)[0];
  if(!next){card.innerHTML='<p class="no-services">There are no upcoming dates listed at the moment.</p>';return;}
  const day=next.parsedDate.toLocaleDateString("en-GB",{day:"numeric"});
  const month=next.parsedDate.toLocaleDateString("en-GB",{month:"short"});
  const weekday=next.parsedDate.toLocaleDateString("en-GB",{weekday:"long"});
  card.innerHTML=`<div class="next-date">${weekday}<strong>${day} ${month}</strong></div><div class="next-details"><h3>${next.venue}</h3><p>${next.location?`${next.location} · `:""}Starts at ${next.time}</p></div><div class="next-type">${next.type}</div>`;
})();
