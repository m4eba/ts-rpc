#!/usr/bin/env node
import { Server, ServerHandler } from '@m4eba/ts-rpc-ws';
import { resolveArithmeticService } from './rpc/ArithmeticServiceServer';
import { ArithmeticService, Summands, ArithmeticEvent } from './Operations';
import { ArithmeticEventServer } from './rpc/ArithmeticEventServer';

class ArithmeticImpl implements ArithmeticService {
  public event: ArithmeticEvent | undefined;

  public async add(summands: Summands): Promise<number> {
    const result = summands.n.reduce((a, b) => a + b);
    if (this.event !== undefined) {
      this.event.addition(summands, result);
    }
    return result;
  }
}

const impl = new ArithmeticImpl();
const handler = new ServerHandler();
const resolver = resolveArithmeticService(impl);
handler.registerService('Arithmetic', resolver);
const server = new Server(5432, handler);
const event = new ArithmeticEventServer(server);
impl.event = event;

server.start();
