import { InterfaceDeclaration, SyntaxKind } from 'ts-morph';
import { upperName, packagedMethodName } from './utils';

// TODO refactor to remove duplicate code
export function generateEventMessageInterface(
  target: InterfaceDeclaration,
  method: string
): string {
  const name = upperName(method);
  const m = target.getMethod(method);
  if (m === undefined) {
    throw new Error('method not found');
  }
  const returnT = m.getReturnTypeNode();
  if (returnT === undefined) {
    throw new Error('returnType node undefined');
  }
  if (returnT.getKind() !== SyntaxKind.VoidKeyword) {
    throw new Error('event interface does not allow non void return types');
  }
  // TODO remove annotations/comments and use .print()
  const params = m.getParameters().map(p => p.getFullText());
  return `
    export interface ${name}Message {
      ${params.join(';\n')}
    }
  `;
}

export function generateServiceMessageInterface(
  target: InterfaceDeclaration,
  method: string
): string {
  const name = upperName(method);
  const m = target.getMethod(method);
  if (m === undefined) {
    throw new Error('method not found');
  }
  const returnT = m.getReturnTypeNode();
  if (returnT === undefined) {
    throw new Error('returnType node undefined');
  }
  // TODO test for promise
  /*
  if (returnT.getKind() !== SyntaxKind.VoidKeyword) {
    throw new Error('event interface does not allow non void return types');
  }
  */
  // TODO remove annotations/comments and use .print()
  const params = m.getParameters().map(p => p.getFullText());
  return `
    export interface ${name}Message {
      ${params.join(';\n')}
    }
  `;
}

export function generateEventServer(target: InterfaceDeclaration): string {
  const methods: string[] = [];
  target.getMethods().forEach(m => {
    // TODO remove annotations/comments and use .print()
    const params = m.getParameters().map(p => p.getFullText());
    const name = upperName(m.getName());
    const pname = packagedMethodName(target, m);
    methods.push(`
      public ${m.getName()}(${params.join(
      ', '
    )}): ${m.getReturnType().getText()} {
        const data:${name}Message = {
          ${m
            .getParameters()
            .map(p => p.getName())
            .join(',\n')}
        }
        const packet: EventPacket = {
          method: '${pname}',
          params: data
        }
        this.sender.send(packet);
      }
    `);
  });
  return `
    import {PacketSender,EventPacket} from '@m4eba/ts-rpc-ws';

    export class ${target.getName()}Server implements ${target.getName()} {
      private sender:PacketSender;

      constructor(sender:PacketSender) {
        this.sender = sender;
      }

      ${methods.join('\n')}
    }
  `;
}

export function generateEventClient(target: InterfaceDeclaration): string {
  const methods: string[] = [];
  target.getMethods().forEach(m => {
    // TODO remove annotations/comments and use .print()
    const params = m.getParameters().map(p => `data.${p.getName()}`);
    const name = upperName(m.getName());
    const pname = packagedMethodName(target, m);
    methods.push(`
      if (packet.method === '${pname}') {
        const data:${name}Message = packet.params as ${name}Message;
        this.eventHandler.${m.getName()}(${params.join(', ')});
      }
    `);
  });
  return `
    import {PacketHandler,EventPacket} from '@m4eba/ts-rpc-ws';

    export class ${target.getName()}Client implements PacketHandler {
      private eventHandler:${target.getName()};

      constructor(eventHandler:${target.getName()}) {
        this.eventHandler = eventHandler;
      }

      public onRequest(): void {}
      public onResponse(): void {}
      public onError(): void {}
      public onEvent(packet: EventPacket): void {
        ${methods.join('\n')}
      }
      
    }
  `;
}

export function generateServiceServer(target: InterfaceDeclaration): string {
  const methods: string[] = [];
  target.getMethods().forEach(m => {
    // TODO remove annotations/comments and use .print()
    const params = m.getParameters().map(p => `data.${p.getName()}`);
    const name = upperName(m.getName());
    methods.push(`
      if (method === '${m.getName()}') {
        const data:${name}Message = params as ${name}Message;
        return service.${m.getName()}(${params.join(', ')});
      }
    `);
  });
  return `
    import {ServiceResolver} from '@m4eba/ts-rpc-ws';

    export function resolve${target.getName()}(service:${target.getName()}):ServiceResolver {
      return function (method:string, params:any):Promise<any> {
        ${methods}

        return Promise.reject('method not found');
      }
    }
  `;
}

export function generateServiceClient(target: InterfaceDeclaration): string {
  const methods: string[] = [];
  target.getMethods().forEach(m => {
    // TODO remove annotations/comments and use .print()
    const params = m.getParameters().map(p => p.getFullText());
    const name = upperName(m.getName());
    const pname = packagedMethodName(target, m);
    methods.push(`
      public async ${m.getName()}(${params.join(
      ', '
    )}): ${m.getReturnType().getText()} {
        const data:${name}Message = {
          ${m
            .getParameters()
            .map(p => p.getName())
            .join(',\n')}
        }
        const packet: RequestPacket = {
          id: 0,
          method: '${pname}',
          params: data
        }
        const response:ResponsePacket = await this.handler.request(packet);
        return response.result;
      }
    `);
  });
  return `
    import {ClientRequestHandler,RequestPacket,ResponsePacket} from '@m4eba/ts-rpc-ws';

    export class ${target.getName()}Client implements ${target.getName()} {
      private handler: ClientRequestHandler;

      constructor(handler:ClientRequestHandler) {
        this.handler = handler;
      }
      
      ${methods}
    }
  `;
}
