export interface RequestPacket {
  id: number;
  method: string;
  params?: any;
}

export interface ResponsePacket {
  id: number;
  result: any;
}

export interface ErrorPacket {
  id: number;
  error: any;
}

export interface EventPacket {
  method: string;
  params?: any;
}

export type Packet = RequestPacket | ResponsePacket | ErrorPacket | EventPacket;

export interface PacketSender {
  send(packet: Packet): void;
}
export interface PacketHandler {
  onRequest(packet: RequestPacket, sender: PacketSender): void;
  onResponse(packet: ResponsePacket, sender: PacketSender): void;
  onError(packet: ErrorPacket, sender: PacketSender): void;
  onEvent(packet: EventPacket, sender: PacketSender): void;
}

export function isRequest(packet: Packet): packet is RequestPacket {
  const p = packet as any;
  return p.result === undefined && p.id != undefined && p.method != undefined;
}

export function isResponse(packet: Packet): packet is ResponsePacket {
  const p = packet as any;
  return p.id != undefined && p.result != undefined;
}

export function isError(packet: Packet): packet is ErrorPacket {
  const p = packet as any;
  return p.id != undefined && p.error != undefined;
}

export function isEvent(packet: Packet): packet is EventPacket {
  const p = packet as any;
  return p.method != undefined && p.result === undefined && p.id === undefined;
}

export function handlePacket(
  data: string,
  handler: PacketHandler,
  sender: PacketSender
): void {
  const packet = JSON.parse(data);
  if (isRequest(packet)) {
    handler.onRequest(packet, sender);
    return;
  }
  if (isResponse(packet)) {
    handler.onResponse(packet, sender);
    return;
  }
  if (isError(packet)) {
    handler.onError(packet, sender);
    return;
  }
  if (isEvent(packet)) {
    handler.onEvent(packet, sender);
    return;
  }
  throw new Error(`maleformed packet: ${data}`);
}
