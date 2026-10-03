export type Mode = 'demo' | 'live';
export interface Transaction { hash:string; from:string; to:string; value:string; token:string; timestamp:string; blockNumber:number; gasFee:string; hop?:number; }
export interface Entity { address:string; entityName:string; entityType:string; chain:string; source:string; confidence:string; demo:boolean; }
export interface BlockchainProvider { mode:Mode; getWalletTransactions(address:string):Promise<Transaction[]>; getTransaction(hash:string):Promise<Transaction|null>; getTokenTransfers(address:string):Promise<Transaction[]>; getBlockTimestamp(block:number):Promise<string>; }
export interface RiskFactor {name:string;points:number;max:number;evidence:string;}
export interface Investigation {id:string;complaintId:string;description:string;wallet:string;chain:'ethereum';createdAt:string;mode:Mode;modeReason:string;transactions:Transaction[];addresses:string[];nearest:{entity:Entity;hops:number;received:string;firstReceipt:string;path:Transaction[]}|null;risk:{score:number;level:string;factors:RiskFactor[]};summary:string;summarySource:string;recommendations:string[];limitations:string[];truncated:boolean;}
export interface TraceInput {wallet:string;complaintId?:string;description?:string;mode?:Mode;maxHops?:number;}
export const isAddress=(s:string)=>/^0x[a-fA-F0-9]{40}$/.test(s);
export const isHash=(s:string)=>/^0x[a-fA-F0-9]{64}$/.test(s);
export const short=(s:string)=>s.length>18?`${s.slice(0,8)}…${s.slice(-6)}`:s;
export const DEMO_WALLET='0x1111111111111111111111111111111111111111';
