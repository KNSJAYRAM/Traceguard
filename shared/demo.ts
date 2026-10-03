import type {BlockchainProvider, Transaction} from './types';
const addr=(n:number)=>'0x'+String(n).repeat(40);
export const demoTransactions:Transaction[]=[
 {hash:'0x'+'a1'.repeat(32),from:addr(1),to:addr(2),value:'2.4',token:'ETH',timestamp:'2026-10-03T10:42:11.000Z',blockNumber:23401001,gasFee:'0.00021'},
 {hash:'0x'+'b2'.repeat(32),from:addr(2),to:addr(3),value:'2.39',token:'ETH',timestamp:'2026-10-03T10:43:07.000Z',blockNumber:23401006,gasFee:'0.000189'},
 {hash:'0x'+'c3'.repeat(32),from:addr(3),to:addr(4),value:'2.35',token:'ETH',timestamp:'2026-10-03T10:44:21.000Z',blockNumber:23401012,gasFee:'0.000231'}
];
export class MockBlockchainProvider implements BlockchainProvider {
 mode='demo' as const;
 async getWalletTransactions(address:string){return demoTransactions.filter(t=>t.from===address.toLowerCase()||t.to===address.toLowerCase()).map(t=>({...t}));}
 async getTransaction(hash:string){return demoTransactions.find(t=>t.hash===hash.toLowerCase())??null;}
 async getTokenTransfers(_address:string){return [];}
 async getBlockTimestamp(block:number){const t=demoTransactions.find(t=>t.blockNumber===block);if(!t)throw new Error('Block is not in the fictional dataset');return t.timestamp;}
}
