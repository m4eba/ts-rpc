import { ArithmeticEvent } from '../Operations';
import { AdditionMessage } from './ArithmeticEventMessages';

import { PacketHandler, EventPacket } from '@m4eba/ts-rpc-ws';

export class ArithmeticEventClient implements PacketHandler {
  private eventHandler: ArithmeticEvent;

  constructor(eventHandler: ArithmeticEvent) {
    this.eventHandler = eventHandler;
  }

  public onRequest(): void { }
  public onResponse(): void { }
  public onError(): void { }
  public onEvent(packet: EventPacket): void {

    if (packet.method === 'Arithmetic.addition') {
      const data: AdditionMessage = packet.params as AdditionMessage;
      this.eventHandler.addition(data.summands, data.result);
    }

  }

}
