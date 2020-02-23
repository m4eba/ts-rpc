#!/usr/bin/env node
import { Client, MultiHandler, ClientRequestHandler } from '@m4eba/ts-rpc-ws';
import { ArithmeticEventClient } from './rpc/ArithmeticEventClient';
import { ArithmeticEvent } from './Operations';
import { ArithmeticServiceClient } from './rpc/ArithmeticServiceClient';

(async () => {
  const event: ArithmeticEvent = {
    addition() {
      console.log('event', arguments);
    },
  };
  const requestHandler = new ClientRequestHandler();
  const handler = new MultiHandler([
    new ArithmeticEventClient(event),
    requestHandler,
  ]);
  const client = new Client('ws://localhost:5432', handler);
  requestHandler.setSender(client);
  await client.connect();
  console.log('client connected');
  const service = new ArithmeticServiceClient(requestHandler);
  const result = await service.add({ n: [1, 2, 3] });
  console.log('result', result);
})();
