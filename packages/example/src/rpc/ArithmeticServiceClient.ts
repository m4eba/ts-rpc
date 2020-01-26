import { ArithmeticService, Summands } from '../Operations';
import { AddMessage } from './ArithmeticServiceMessages';

import { ClientRequestHandler, RequestPacket, ResponsePacket } from '@m4eba/ts-rpc-ws';

export class ArithmeticServiceClient implements ArithmeticService {
  private handler: ClientRequestHandler;

  constructor(handler: ClientRequestHandler) {
    this.handler = handler;
  }


  public async add(summands: Summands): Promise<number> {
    const data: AddMessage = {
      summands
    }
    const packet: RequestPacket = {
      id: 0,
      method: 'Arithmetic.add',
      params: data
    }
    const response: ResponsePacket = await this.handler.request(packet);
    return response.result;
  }

}
