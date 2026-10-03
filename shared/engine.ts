import labels from './knownEntities.json';
import {isAddress, type BlockchainProvider,type Investigation,type TraceInput,type Transaction,type Entity} from './types';
export const recommendations=[
 'Preserve the transaction hashes, timestamps, provider responses, and attribution dataset version.',
 'Review the receiving address and validate the attribution against an authoritative or licensed dataset.',
 'Examine transactions before and after this bounded trace, including internal and token transfers.',
 'Check related addresses against other complaints using authorized records.',
 'If appropriate, request relevant VASP records through authorized investigative channels.'
];
export async function investigate(input:TraceInput,provider:BlockchainProvider,reason:string,onStage?:(stage:number)=>void):Promise<Investigation>{
 if(!isAddress(input.wallet))throw new Error('Enter a valid Ethereum address: 0x followed by 40 hexadecimal characters.');
 const wallet=input.wallet.toLowerCase(),maxHops=Math.min(3,Math.max(1,input.maxHops??3));
 const entities=(labels as Entity[]).filter(x=>x.demo===(provider.mode==='demo'));
 const transactions:Transaction[]=[],addresses=new Set([wallet]),seenTx=new Set<string>();
 const queue:{address:string;hop:number;after:number;path:Transaction[]}[]=[{address:wallet,hop:0,after:0,path:[]}];
 const expanded=new Set<string>();let nearest:Investigation['nearest']=null,truncated=false;
 const cache=new Map<string,Transaction[]>();onStage?.(0);
 while(queue.length){
  const current=queue.shift()!;if(current.hop>=maxHops)continue;
  const expansionKey=current.address+':'+current.hop+':'+current.after;
  if(expanded.has(expansionKey))continue;expanded.add(expansionKey);
  if(expanded.size>24){truncated=true;break;}
  if(!cache.has(current.address))cache.set(current.address,await provider.getWalletTransactions(current.address));
  onStage?.(1);
  const candidates=cache.get(current.address)!.filter(t=>t.from.toLowerCase()===current.address&&t.token==='ETH'&&Number(t.value)>0&&Date.parse(t.timestamp)>=current.after).sort((a,b)=>Date.parse(a.timestamp)-Date.parse(b.timestamp));
  if(candidates.length>20)truncated=true;
  for(const original of candidates.slice(0,20)){
   const t={...original,from:original.from.toLowerCase(),to:original.to.toLowerCase(),hop:current.hop+1};
   if(!isAddress(t.to)||t.to===wallet||current.path.some(p=>p.from===t.to))continue;
   if(transactions.length>=100){truncated=true;break;}
   if(!seenTx.has(t.hash)){transactions.push(t);seenTx.add(t.hash);addresses.add(t.to);}
   const path=[...current.path,t],entity=entities.find(e=>e.address.toLowerCase()===t.to);
   if(entity){if(!nearest||t.hop<nearest.hops||(t.hop===nearest.hops&&t.timestamp<nearest.firstReceipt))nearest={entity,hops:t.hop,received:t.value,firstReceipt:t.timestamp,path};}
   else queue.push({address:t.to,hop:t.hop,after:Date.parse(t.timestamp),path});
  }
 }
 onStage?.(2);
 const sorted=[...transactions].sort((a,b)=>Date.parse(a.timestamp)-Date.parse(b.timestamp));
 // Only score observed chronological paths, never exchange identity or value alone.
 const byFrom=new Map<string,Transaction[]>();for(const t of sorted)byFrom.set(t.from,[...(byFrom.get(t.from)??[]),t]);
 const rapid=sorted.filter(t=>sorted.some(p=>p.to===t.from&&Date.parse(t.timestamp)>Date.parse(p.timestamp)&&Date.parse(t.timestamp)-Date.parse(p.timestamp)<=300000));
 const intermediary=[...addresses].filter(a=>a!==wallet&&sorted.some(t=>t.to===a)&&sorted.some(t=>t.from===a));
 const split=[...byFrom.entries()].filter(([,ts])=>new Set(ts.map(t=>t.to)).size>=2);
 const factors=[
 {name:'Rapid onward movement',points:rapid.length?35:0,max:35,evidence:rapid.length?`${rapid.length} onward transfers within 5 minutes of an observed receipt.`:'No onward transfers within 5 minutes were observed.'},
 {name:'Intermediary chain',points:Math.min(30,intermediary.length*15),max:30,evidence:`${intermediary.length} addresses both received and forwarded ETH in this trace.`},
 {name:'Multiple recipients',points:split.length?20:0,max:20,evidence:split.length?`${split.length} addresses sent to multiple recipients; this alone does not prove structuring.`:'No recipient splitting observed.'},
 {name:'Rapid multi-hop sequence',points:rapid.length>=2&&intermediary.length>=2?15:0,max:15,evidence:rapid.length>=2&&intermediary.length>=2?'At least two rapid onward transfers and two intermediaries are present.':'Threshold of two rapid onward transfers and two intermediaries not met.'}
 ];
 const score=factors.reduce((s,f)=>s+f.points,0);onStage?.(3);
 const summary=nearest?`The reported wallet has a chronological outgoing path through ${nearest.hops-1} intermediary address${nearest.hops===2?'':'es'} to ${nearest.entity.entityName}. The selected path begins with ${nearest.path[0].value} ETH and ends with an observed ${nearest.received} ETH transfer at ${nearest.firstReceipt}. This is ${provider.mode==='demo'?'fictional demo':'known-address'} attribution, not proof of ownership or criminal activity. ${rapid.length} rapid onward transfers are observed in the explored graph. Transaction connectivity does not establish that the same funds were forwarded.`:sorted.length?`The bounded trace found ${sorted.length} outgoing ETH transfers involving ${addresses.size} addresses. No known VASP was identified in the configured dataset. Unknown recipients remain unattributed. Transaction connectivity does not establish that the same funds were forwarded.`:`No outgoing ETH transactions were found for this wallet in the ${provider.mode==='demo'?'fictional demo dataset':'provider response'}. No known VASP was identified. This is not a conclusion about the wallet's safety or entire history.`;
 onStage?.(4);
 const result:Investigation={id:crypto.randomUUID(),complaintId:(input.complaintId||'CASE-2026-001').slice(0,80),description:(input.description||'').slice(0,2000),wallet,chain:'ethereum',createdAt:new Date().toISOString(),mode:provider.mode,modeReason:reason,transactions:sorted,addresses:[...addresses],nearest,risk:{score,level:score>=70?'High':score>=35?'Moderate':'Low',factors},summary,summarySource:'Evidence-based local summary',recommendations,limitations:[`Maximum ${maxHops} hops; successful external native ETH transfers only. Internal calls, tokens, bridges, and contract execution are outside this trace.`,`Chronology and connectivity suggest a path; they do not prove continuity of specific funds or wallet ownership.`,`Value differences are not classified as fees; only each transaction's recorded gas cost is reported.`,provider.mode==='demo'?'All addresses, hashes, block numbers, and the VASP label in the demo fixture are fictional.':'Provider history is limited to its returned page (up to 100 latest transactions per wallet). Live attribution dataset currently has no verified labels.',...(truncated?['Trace was truncated by the request budget; additional paths may exist.']:[])],truncated};onStage?.(5);return result;
}
