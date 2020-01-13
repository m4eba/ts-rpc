import WebSocket from 'ws';
import Debug from 'debug';
import { PacketHandler, Packet, PacketSender, handlePacket } from './Packet';

const debug = Debug('ts-rpc-ws:Server');


class ClientContext implements PacketSender {
  ws: WebSocket;

  constructor(ws: WebSocket) {
    this.ws = ws;
  }

  public send(packet: Packet) {
    this.ws.send(JSON.stringify(packet));
  }
}

class Server {
  private port: number;
  private handler: PacketHandler;
  private server: WebSocket.Server | null = null;
  private clients: ClientContext[] = [];

  constructor(port: number, handler: PacketHandler) {
    this.port = port;
    this.handler = handler;
  }

  private handleData(data: string, context: ClientContext) {
    try {
      handlePacket(data, this.handler, context);
    } catch (e) {
      debug('unable to handle packet %o, %s', e, data);
      return;
    }
  }

  public start() {
    debug('starting ws server');
    this.server = new WebSocket.Server({ port: this.port });

    this.server.on('connection', (ws: WebSocket) => {
      const context: ClientContext = new ClientContext(ws);
      this.clients.push(context);
      debug('client connected');

      ws.on('message', (data: WebSocket.Data) => {
        debug('message received %o', data);
        this.handleData(data as string, context);
      });
      ws.on('close', (code: number, reason: string) => {
        this.clients.splice(this.clients.indexOf(context), 1);
      });
    });
  }

  public stop() {
    debug('stop');
    if (this.server) {
      this.server.close();
      this.server = null;
    }
  }

  public send(packet: Packet) {
    this.clients.forEach(c => c.send(packet));
  }
}

export default Server;