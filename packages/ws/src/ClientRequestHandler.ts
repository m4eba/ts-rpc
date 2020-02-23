import {
  PacketHandler,
  RequestPacket,
  ResponsePacket,
  PacketSender,
  ErrorPacket,
} from './Packet';

interface Request {
  id: number;
  resolve: (response: ResponsePacket) => void;
  reject: (error: any) => void;
  timeout: NodeJS.Timeout;
}
export class ClientRequestHandler implements PacketHandler {
  private sender: PacketSender | undefined;
  private idCount: number = 1;
  private timeout = 3 * 60 * 1000;
  private idMap: Map<number, Request>;

  constructor(sender?: PacketSender) {
    this.sender = sender;
    this.idMap = new Map();
  }

  public setSender(sender: PacketSender) {
    this.sender = sender;
  }

  public request(packet: RequestPacket): Promise<ResponsePacket> {
    if (this.sender === undefined) {
      return Promise.reject('no sender specified, cannot send packet');
    }
    packet.id = this.idCount++;
    this.sender.send(packet);
    const result = new Promise<ResponsePacket>((resolve, reject) => {
      this.idMap.set(packet.id, {
        id: packet.id,
        resolve,
        reject,
        timeout: setTimeout(() => {
          this.requestTimeout(packet.id);
        }, this.timeout),
      });
    });
    return result;
  }

  public onError(packet: ErrorPacket): void {
    const req = this.idMap.get(packet.id);
    if (req === undefined) {
      return;
    }
    req.reject(packet.error);
    this.idMap.delete(packet.id);
  }
  public onEvent(): void {}
  public onRequest(): void {}
  public onResponse(packet: ResponsePacket): void {
    const req = this.idMap.get(packet.id);
    if (req === undefined) {
      return;
    }
    req.resolve(packet);
    this.idMap.delete(packet.id);
  }

  public requestTimeout(id: number): void {
    const req = this.idMap.get(id);
    if (req === undefined) {
      return;
    }
    req.reject('timeout');
    this.idMap.delete(id);
  }
}
