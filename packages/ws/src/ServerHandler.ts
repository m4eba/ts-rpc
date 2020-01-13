import Debug from 'debug';
import { PacketHandler, PacketSender, EventPacket, RequestPacket, ErrorPacket, ResponsePacket } from "./Packet";

const debug = Debug('ts-rpc-ws:ServerHandler');

export type ServiceResolver = (method:string,params:any)=>Promise<any>;

class ServerHandler implements PacketHandler {
  private services:Map<string,ServiceResolver> = new Map();

  constructor(){

  }

  public registerService(name:string,resolver:ServiceResolver) {
    this.services.set(name,resolver);
  }

  public onRequest(packet:RequestPacket,sender:PacketSender) {
    const idx = packet.method.indexOf('.');
    const name = packet.method.substr(0,idx);
    const method = packet.method.substr(idx);

    const resolver = this.services.get(name);
    if (resolver===undefined) {
      debug('resolver not found for %s',name);
      return;
    }
    resolver(method,packet.params)
    .then(result=>{
      const response:ResponsePacket = {
        id:packet.id,
        result
      };
      sender.send(response);
    })
    .catch( (reason)=>{
      const error:ErrorPacket = {
        id:packet.id,
        error:reason
      };
      sender.send(error);
    });
    
  }

  public onResponse() {
    debug('response packet?!?');
  }

  public onError() {
    debug('error packet?1?');
  }

  public onEvent() {
    debug('event packet?!?');
  }
}

export default ServerHandler;