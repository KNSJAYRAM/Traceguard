import {handleAPI} from './api';
import type {Env} from './provider';
export default {async fetch(request:Request,env:Env):Promise<Response>{if(new URL(request.url).pathname.startsWith('/api/'))return handleAPI(request,env,request.headers.get('cf-connecting-ip')||'shared');return env.ASSETS?env.ASSETS.fetch(request):new Response('Assets unavailable',{status:503});}};
