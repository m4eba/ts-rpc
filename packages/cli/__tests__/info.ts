import { findServiceInterface, findEventInterface } from '../src/utils';
import { parse } from '@typescript-eslint/typescript-estree';


test('find interfaces', async() => {
  const code = `
  interface Event{}
  interface Service{}
  `;
  const ast = parse(code,{loc:true});
    
  const i = findEventInterface(ast);
  const s = findServiceInterface(ast);
  

  expect(i.loc.start.line).toBe(2);
  expect(s.loc.start.line).toBe(3);  
});


test('missing interface', async() => {
  const code = `
  `;
  const ast = parse(code,{loc:true});
 
  expect.assertions(1);
  try {
    const i = findEventInterface(ast);
  } catch(e){
    expect(e.toString()).toBe('Error: no event interface found');
    
  }
});

