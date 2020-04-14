#!/usr/bin/env node
import Path from 'path';
import Usage from 'command-line-usage';
import Args from 'command-line-args';
import {
  Project,
  ScriptTarget,
  InterfaceDeclaration,
  SourceFile,
} from 'ts-morph';

import { findInterfaces, allInterfacesExcept, upperName } from './utils';
import {
  generateEventMessageInterface,
  generateServiceMessageInterface,
  generateEventServer,
  generateEventClient,
  generateServiceServer,
  generateServiceClient,
} from './generate';
import { write } from './file';
import {
  importFromInterface,
  writeImports,
  importsFromParams,
  Import,
} from './imports';

const opt: Usage.OptionDefinition[] = [
  {
    name: 'help',
    alias: 'h',
    description: 'show this help',
    type: Boolean,
  },
  {
    name: 'input',
    alias: 'i',
    description: 'input files',
    multiple: true,
    type: String,
  },
  {
    name: 'service-match',
    description: 'regex to match service interfaces',
    multiple: true,
    type: String,
  },
  {
    name: 'event-match',
    description: 'regex to match event interfaces',
    multiple: true,
    type: String,
  },
  {
    name: 'out',
    alias: 'o',
    defaultValue: './',
    description: 'output directory',
    type: String,
  },
  {
    name: 'tsconfig',
    alias: 't',
    description: 'tsconfig file',
    type: String,
  },
  {
    name: 'rootDir',
    alias: 'r',
    description: 'project root dir',
    type: String,
  },
];

const sections: Usage.Section[] = [
  {
    header: 'Options',
    optionList: opt,
  },
];

const args = Args(opt);
if (args.help) {
  console.log(Usage(sections));
  process.exit(0);
}

/*
if (!args.tsconfig) {
  console.log('tsconfig file needed');
  process.exit(1);
}
*/
if (!args.input) {
  console.log('input file(s) needed');
  process.exit(1);
}

if (!args.rootDir) {
  args.rootDir = process.cwd();
}

const project = new Project({
  compilerOptions: {
    target: ScriptTarget.ES2018,
    rootDir: args.rootDir,
  },
  //tsConfigFilePath:args.tsconfig
});

project.addExistingSourceFiles(args.input);

async function handleEvents(
  file: SourceFile,
  modulePath: string,
  events: Array<InterfaceDeclaration>
) {
  for (let i = 0; i < events.length; ++i) {
    const event = events[i];
    const eventPathToOut = Path.relative(args.out, modulePath);
    const eventImport = importFromInterface(eventPathToOut, event);
    if (eventImport === undefined) {
      console.log(
        `interface ${event.getName()} is not exported from file ${
          args.input[i]
        }`
      );
      process.exit(1);
      return;
    }

    const paramImports = importsFromParams(eventPathToOut, file, event);
    let messageImports: Import[] = [];
    let messages = writeImports(paramImports);
    event.getMethods().forEach(m => {
      messages += '\n';
      messages += generateEventMessageInterface(event, m.getName());
      messageImports.push({
        module: `./${event.getName()}Messages`,
        name: `${upperName(m.getName())}Message`,
      });
    });

    await write(Path.join(args.out, `${event.getName()}Messages.ts`), messages);

    let eventServer = writeImports(
      [eventImport].concat(paramImports).concat(messageImports)
    );
    eventServer += generateEventServer(event);
    await write(
      Path.join(args.out, `${event.getName()}Server.ts`),
      eventServer
    );

    let eventClient = writeImports([eventImport].concat(messageImports));
    eventClient += generateEventClient(event);
    await write(
      Path.join(args.out, `${event.getName()}Client.ts`),
      eventClient
    );
  }
}

async function handleServices(
  file: SourceFile,
  modulePath: string,
  services: Array<InterfaceDeclaration>
) {
  for (let i = 0; i < services.length; ++i) {
    const service = services[i];
    const servicePathToOut = Path.relative(args.out, modulePath);
    const serviceImport = importFromInterface(servicePathToOut, service);
    if (serviceImport === undefined) {
      console.log(
        `interface ${service.getName()} is not exported from file ${
          args.input[i]
        }`
      );
      process.exit(1);
      return;
    }

    const paramImports = importsFromParams(servicePathToOut, file, service);
    let messageImports: Import[] = [];
    let messages = writeImports(paramImports);
    service.getMethods().forEach(m => {
      messages += '\n';
      messages += generateServiceMessageInterface(service, m.getName());
      messageImports.push({
        module: `./${service.getName()}Messages`,
        name: `${upperName(m.getName())}Message`,
      });
    });

    await write(
      Path.join(args.out, `${service.getName()}Messages.ts`),
      messages
    );

    let serviceServer = writeImports([serviceImport].concat(messageImports));
    serviceServer += generateServiceServer(service);
    await write(
      Path.join(args.out, `${service.getName()}Server.ts`),
      serviceServer
    );

    let serviceClient = writeImports(
      [serviceImport].concat(paramImports).concat(messageImports)
    );
    serviceClient += generateServiceClient(service);
    await write(
      Path.join(args.out, `${service.getName()}Client.ts`),
      serviceClient
    );
  }
}

(async () => {
  for (let i = 0; i < args.input.length; ++i) {
    const file = project.getSourceFileOrThrow(args.input[i]);
    const inputModulePath = Path.join(
      Path.dirname(args.input[i]),
      file.getBaseNameWithoutExtension()
    );

    let events: Array<InterfaceDeclaration> = [];
    if (args['event-match']) {
      events = findInterfaces(file, args['event-match']);
      handleEvents(file, inputModulePath, events);
    }

    let services: Array<InterfaceDeclaration> = [];
    if (args['service-match']) {
      services = findInterfaces(file, args['service-match']);
    } else {
      services = allInterfacesExcept(file, events);
    }
    handleServices(file, inputModulePath, services);
  }
})();
