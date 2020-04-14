import { Project, ScriptTarget } from 'ts-morph';
import { findInterfaces, allInterfacesExcept } from '../src/utils';

function createProject() {
  const project: Project = new Project({
    compilerOptions: {
      target: ScriptTarget.ES2018,
    },
  });
  return project;
}

test('find all interfaces', async () => {
  const project = createProject();
  const file = project.createSourceFile(
    'test.ts',
    `
  interface Test1 {}
  interface Test2 {}
  interface Test3 {}
  `
  );

  const s = allInterfacesExcept(file, []);

  expect(s.length).toBe(3);
  expect(s[0]).toBe(file.getInterface('Test1'));
  expect(s[1]).toBe(file.getInterface('Test2'));
  expect(s[2]).toBe(file.getInterface('Test3'));
});

test('find event interfaces', async () => {
  const project = createProject();
  const file = project.createSourceFile(
    'test.ts',
    `
  interface Event {}
  interface Service {}
  `
  );

  const i = findInterfaces(file, ['Event']);
  const s = allInterfacesExcept(file, i);

  expect(i.length).toBe(1);
  expect(i[0]).toBe(file.getInterface('Event'));
  expect(s.length).toBe(1);
  expect(s[0]).toBe(file.getInterface('Service'));
});

test('missing interface', async () => {
  const project = createProject();
  const file = project.createSourceFile(
    'test.ts',
    `
  interface MisspelledEventInterface {}
  interface Service {}
  `
  );

  const i = findInterfaces(file, ['Test']);
  expect(i.length).toBe(0);
});

test('interface inside namespace', async () => {
  const project = createProject();
  const file = project.createSourceFile(
    'test.ts',
    `
  namespace ns {  
    interface Test {}
  }
  `
  );

  const i = findInterfaces(file, ['Test']);
  expect(i.length).toBe(1);
});

test('interface inside 2x namespace', async () => {
  const project = createProject();
  const file = project.createSourceFile(
    'test.ts',
    `
  namespace ns {
    namespace ns2 {  
      interface Test {}
    }
  }
  `
  );

  const i = findInterfaces(file, ['Test']);
  expect(i.length).toBe(1);
});
