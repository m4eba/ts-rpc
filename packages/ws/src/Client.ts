import WebSocket from 'ws';
import EventEmitter from 'events';
import Debug from 'debug';
import { Packet, EventPacket, isEvent, PacketHandler, isRequest, isResponse, handlePacket, PacketSender } from './Packet';

const debug = Debug('ts-rpc-ws:Client');

class Client extends EventEmitter implements PacketSender {
  private ws: WebSocket | null = null;
  private handler: PacketHandler;
  private ready: boolean = false;
  private address: string = '';
  private queue: Packet[] = [];

  constructor(address: string, handler: PacketHandler) {
    super();
    this.address = address;
    this.handler = handler;
  }

  public async connect(): Promise<Client> {
    // TODO reject if connection fails, timeout???
    let result = new Promise<Client>(((resolve: any) => {

      this.ws = new WebSocket(this.address);
      this.emit('connecting');
      debug('connecting');

      this.ws.on('open', () => {
        debug('connection open');
        this.ready = true;
        this.emit('open');
        this.sendQueue();
        resolve(this);
      });
      this.ws.on('message', (data: string) => {
        debug('message received: msg %s', data);
        this.handleData(data);
      });
      this.ws.on('close', () => {
        debug('connection closed');
        this.emit('close');
        this.ready = false;
        this.ws = null;
      });
    }).bind(this));
    return result;
  }

  private sendQueue() {
    while (this.ws && this.ready && this.queue.length > 0) {
      // using wsSend could result in pushing the msg at the end of the queue
      // making it out of order
      this.wsSend(this.queue.shift() as Packet);
    }
  }

  private wsSend(packet: Packet) {
    // TODO max queue functionanlity
    if (this.ws != null && this.ready) {
      debug('sending %o', packet);
      this.ws.send(JSON.stringify(packet));
    } else {
      debug('pushing to queue %o', packet);
      this.queue.push(packet);
    }
  }

  private handleData(data: string) {
    try {
      if ( this.ws != null )
        handlePacket(data,this.handler,this);      
    } catch (e) {
      debug('unable to handle packet %o, %s', e, data);
      return;
    }
  }

  public send(packet: Packet) {
    this.wsSend(packet);
  }

  public close() {
    if (this.ws != null && this.ready) {
      debug('close');
      this.ws.terminate();
      this.ws = null;
      this.ready = false;
    }
  }
}