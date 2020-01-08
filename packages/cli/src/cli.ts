import Path from 'path';
import Usage from 'command-line-usage';
import Args from 'command-line-args';
import { Project, ScriptTarget } from 'ts-morph';


import { findInterface } from './utils';
import { generateEventMessageInterface, generateEventEmitter } from './generate';
import { write } from './file';


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

const project = new Project({
  compilerOptions: {
    target: ScriptTarget.ES2018,
    //rootDir:args.root
  }
  //tsConfigFilePath:args.tsconfig
});


project.addExistingSourceFiles(args.input);


(async () => {

  for (let i = 0; i < args.input.length; ++i) {
    const file = project.getSourceFileOrThrow(args.input[i]);


    const event = findInterface(file, 'Event');
    if (event != undefined) {
      let messages = '';
      event.getMethods().forEach(m => {
        messages += '\n';
        messages += generateEventMessageInterface(event, m.getName());
      });

      await write(Path.join(args.out, `${event.getName()}Messages.ts`), messages);

      const emitter = generateEventEmitter(event);
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