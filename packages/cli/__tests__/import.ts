import { Project, ScriptTarget } from 'ts-morph';
import { importFromInterface } from '../src/imports';

function createProject() {
  const project: Project = new Project({
    compilerOptions: {
      target: ScriptTarget.ES2018,
    },
  });
  return project;
}

test('interface import from export', async () => {
  const project = createProject();
  const file = project.createSourceFile(
    'test.ts',
    `
  export interface Test {}
  `
  );

  const i = file.getInterface('Test');
  const e = importFromInterface('test.ts', i);

  expect(e).toEqual({
    module: 'test.ts',
    name: 'Test',
    alias: undefined,
    defaultImport: false,
  });
});

test('interface import from default export', async () => {
  const project = createProject();
  const file = project.createSourceFile(
    'test.ts',
    `
  export default interface Test {}
  `
  );

  const i = file.getInterface('Test');
  const e = importFromInterface('test.ts', i);

  expect(e).toEqual({
    module: 'test.ts',
    name: 'Test',
    alias: undefined,
    defaultImport: true,
  });
});

test('interface import inside namespace', async () => {
  const project = createProject();
  const file = project.createSourceFile(
    'test.ts',
    `
  export namespace ns {
    export interface Test {}
  }
  `
  );

  const i = file.getNamespace('ns').getInterface('Test');
  const e = importFromInterface('test.ts', i);

  expect(e).toEqual({
    module: 'test.ts',
    name: 'Test',
    alias: undefined,
    defaultImport: false,
  });
});
