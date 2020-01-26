import { PacketHandler, PacketSender, RequestPacket, ResponsePacket, ErrorPacket, EventPacket } from "./Packet";


export class MultiHandler implements PacketHandler {
  private handler: Array<PacketHandler>;

  constructor(handler: Array<PacketHandler>) {
    this.handler = handler;
  }
  onRequest(packet: RequestPacket, sender: PacketSender): void {
    this.handler.forEach(h => h.onRequest(packet, sender));
  }
  onResponse(packet: ResponsePacket, sender: PacketSender): void {
    this.handler.forEach(h => h.onResponse(packet, sender));
  }
  onError(packet: ErrorPacket, sender: PacketSender): void {
    this.handler.forEach(h => h.onError(packet, sender));
  }
  onEvent(packet: EventPacket, sender: PacketSender): void {
    this.handler.forEach(h => h.onEvent(packet, sender));
  }
}