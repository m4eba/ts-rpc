import Path from 'path';
import Usage from 'command-line-usage';
import Args from 'command-line-args';
import { Project, ScriptTarget } from 'ts-morph';


import { findInterface, upperName } from './utils';
import { generateEventMessageInterface, generateEventEmitter } from './generate';
import { write } from './file';
import { importFromInterface, writeImports, importsFromParams, Import } from './imports';


const opt: Usage.OptionDefinition[] = [
  {
    name: 'help',
    alias: 'h',
    description: 'show this help',
    type: Boolean
  },
  {
    name: 'input',
    alias: 'i',
    description: 'input files',
    multiple: true,
    type: String
  },
  {
    name: 'out',
    alias: 'o',
    defaultValue: './',
    description: 'output directory',
    type: String
  },
  {
    name: 'tsconfig',
    alias: 't',
    description: 'tsconfig file',
    type: String
  },
  {
    name: 'rootDir',
    alias: 'r',
    description: 'project root dir',
    type: String
  }
];

const sections: Usage.Section[] = [
  {
    header: 'Options',
    optionList: opt
  }
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
    rootDir: args.rootDir
  }
  //tsConfigFilePath:args.tsconfig
});


project.addExistingSourceFiles(args.input);


(async () => {

  for (let i = 0; i < args.input.length; ++i) {
    const file = project.getSourceFileOrThrow(args.input[i]);
    const inputModulePath = Path.join(Path.dirname(args.input[i]), file.getBaseNameWithoutExtension());

    const event = findInterface(file, 'Event');
    if (event != undefined) {
      const eventPathToOut = Path.relative(args.out, inputModulePath);
      const eventImport = importFromInterface(eventPathToOut, event);
      if (eventImport === undefined) {
        console.log(`interface ${event.getName()} is not exported from file ${args.input[i]}`);
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
          name: `${upperName(m.getName())}Message`
        });
      });

      await write(Path.join(args.out, `${event.getName()}Messages.ts`), messages);

      let emitter = writeImports([eventImport].concat(paramImports).concat(messageImports));
      emitter += generateEventEmitter(event);
      await write(Path.join(args.out, `${event.getName()}Emitter.ts`), emitter);
    }


    const service = findInterface(file, 'Service');
    if (service != undefined) {
      /*
      const builder = new SourceBuilder();
      service.getMethods().forEach(m => {
        builder.addLine('');
        generateEventMessageInterface(builder, service, m.getName());
      });

      await writeFile(Path.join(args.out, `${service.getName()}Messages.ts`), builder.getSource(), { encoding: 'utf8' });
      */
    }

  }
})()