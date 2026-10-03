import 'dotenv/config';
import express from 'express';
import {handleAPI} from './api';
const app=express();app.disable('x-powered-by');app.use(express.text({type:'application/json',limit:'12kb'}));
app.use('/api',async(req,res)=>{const request=new Request('http://localhost'+req.originalUrl,{method:req.method,headers:{'Content-Type':'application/json'},...(req.method!=='GET'&&req.method!=='HEAD'?{body:typeof req.body==='string'?req.body:JSON.stringify(req.body??{})}:{})});const response=await handleAPI(request,process.env,req.ip||'local');res.status(response.status);response.headers.forEach((v,k)=>res.setHeader(k,v));res.send(await response.text());});
app.use(express.static('dist/client'));app.get('/{*path}',(_req,res)=>res.sendFile('index.html',{root:'dist/client'}));app.listen(Number(process.env.PORT||3001),()=>console.log('TRACEGUARD API ready on port '+(process.env.PORT||3001)));
