import { ArithmeticEvent, Summands } from '../Operations';
import { AdditionMessage } from './ArithmeticEventMessages';

import { PacketSender, EventPacket } from '@m4eba/ts-rpc-ws';

export class ArithmeticEventServer implements ArithmeticEvent {
  private sender: PacketSender;

  constructor(sender: PacketSender) {
    this.sender = sender;
  }


  public addition(summands: Summands, result: number): void {
    const data: AdditionMessage = {
      summands,
      result
    }
    const packet: EventPacket = {
      method: 'Arithmetic.addition',
      params: data
    }
    this.sender.send(packet);
  }

}
