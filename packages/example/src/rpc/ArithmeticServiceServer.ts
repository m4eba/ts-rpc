import { ArithmeticService } from '../Operations';
import { AddMessage } from './ArithmeticServiceMessages';

import { ServiceResolver } from '@m4eba/ts-rpc-ws';

export function resolveArithmeticService(service: ArithmeticService): ServiceResolver {
  return function(method: string, params: any): Promise<any> {

    if (method === 'add') {
      const data: AddMessage = params as AddMessage;
      return service.add(data.summands);
    }


    return Promise.reject('method not found');
  }
}
