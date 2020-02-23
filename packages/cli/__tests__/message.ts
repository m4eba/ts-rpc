import { Project, ScriptTarget } from 'ts-morph';
import { generateEventMessageInterface } from '../src/generate';

function createProject() {
  const project: Project = new Project({
    compilerOptions: {
      target: ScriptTarget.ES2018,
      declaration: true,
      out: 'tmp',
      root: './tmp',
    },
  });
  return project;
}

test('message 1 param', async () => {
  const project = createProject();
  const file = project.createSourceFile(
    'test.ts',
    `
  interface Event {
    hello(msg:string):void;
  }
  `
  );

  const i = file.getInterfaceOrThrow('Event');
  const source = generateEventMessageInterface(i, 'hello');
  const genFile = project.createSourceFile('gen.ts', source);

  const msg = genFile.getInterfaceOrThrow('HelloMessage');
  expect(msg.getProperties().length).toBe(1);
  expect(msg.getProperties()[0].getName()).toBe('msg');
  expect(
    msg
      .getProperties()[0]
      .getType()
      .getText()
  ).toBe('string');
});

test('message 2 params', async () => {
  const project = createProject();
  const file = project.createSourceFile(
    'test.ts',
    `
  interface Event {
    hello(msg:string,length:number):void;
  }
  `
  );

  const i = file.getInterfaceOrThrow('Event');
  const source = generateEventMessageInterface(i, 'hello');
  const genFile = project.createSourceFile('gen.ts', source);

  const msg = genFile.getInterfaceOrThrow('HelloMessage');
  expect(msg.getProperties().length).toBe(2);
  expect(msg.getProperties()[0].getName()).toBe('msg');
  expect(
    msg
      .getProperties()[0]
      .getType()
      .getText()
  ).toBe('string');
  expect(msg.getProperties()[0].getName()).toBe('length');
  expect(
    msg
      .getProperties()[0]
      .getType()
      .getText()
  ).toBe('number');
});

test('message param with custom type', async () => {
  const project = createProject();
  const file = project.createSourceFile(
    'test.ts',
    `
  interface Message {}
  interface Event {
    hello(msg:Message):void;
  }
  `
  );

  const i = file.getInterfaceOrThrow('Event');
  const source = generateEventMessageInterface(i, 'hello');
  const genFile = project.createSourceFile('gen.ts', source);

  const msg = genFile.getInterfaceOrThrow('HelloMessage');
  expect(msg.getProperties().length).toBe(1);
  expect(msg.getProperties()[0].getName()).toBe('msg');
  expect(
    msg
      .getProperties()[0]
      .getType()
      .getText()
  ).toBe('Message');
});
