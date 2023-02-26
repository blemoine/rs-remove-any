import { Project, SourceFile } from "ts-morph";
import { removeAny } from "./remove-any";

describe("remove-any", () => {
  it("should keep explicit `any`s for function parameters", () => {
    const sourceFile = createSourceFile(`
function fnToIgnore(my_explicit_variable: any) {
  return { value: my_explicit_variable };
}

fnToIgnore(1234)`);

    removeAny(sourceFile);
    expect(sourceFile.print()).toStrictEqual(
      `function fnToIgnore(my_explicit_variable: any) {
    return { value: my_explicit_variable };
}
fnToIgnore(1234);
`
    );
  });

  it("should add explicit type for a any in function parameters", () => {
    const sourceFile = createSourceFile(`
function fnToIgnore(my_explicit_variable) {
  return { value: my_explicit_variable };
}

fnToIgnore(1234)`);

    removeAny(sourceFile);
    expect(sourceFile.print()).toStrictEqual(
      `function fnToIgnore(my_explicit_variable: 1234) {
    return { value: my_explicit_variable };
}
fnToIgnore(1234);
`
    );
  });

  it("should set the type to union type if called with 4 numbers", () => {
    const sourceFile = createSourceFile(`
function fnToIgnore(my_explicit_variable) {
  return { value: my_explicit_variable };
}

fnToIgnore(1)
fnToIgnore(4)
fnToIgnore(3)
fnToIgnore(2)`);

    removeAny(sourceFile);
    expect(sourceFile.print()).toStrictEqual(
      `function fnToIgnore(my_explicit_variable: 1 | 4 | 3 | 2) {
    return { value: my_explicit_variable };
}
fnToIgnore(1);
fnToIgnore(4);
fnToIgnore(3);
fnToIgnore(2);
`
    );
  });

  it("should set the type to number if called with more than 4 numbers", () => {
    const sourceFile = createSourceFile(`
function fnToIgnore(my_explicit_variable) {
  return { value: my_explicit_variable };
}

fnToIgnore(1)
fnToIgnore(4)
fnToIgnore(3)
fnToIgnore(2)
fnToIgnore(5)`);

    removeAny(sourceFile);
    expect(sourceFile.print()).toStrictEqual(
      `function fnToIgnore(my_explicit_variable: number) {
    return { value: my_explicit_variable };
}
fnToIgnore(1);
fnToIgnore(4);
fnToIgnore(3);
fnToIgnore(2);
fnToIgnore(5);
`
    );
  });

  it("should set the type to boolean if called with boolean", () => {
    const sourceFile = createSourceFile(`
function fnToIgnore(my_explicit_variable) {
  return { value: my_explicit_variable };
}

fnToIgnore(true)
`);

    removeAny(sourceFile);
    expect(sourceFile.print()).toStrictEqual(
      `function fnToIgnore(my_explicit_variable: boolean) {
    return { value: my_explicit_variable };
}
fnToIgnore(true);
`
    );
  });

  it("should set the type to the transitively found type", () => {
    const sourceFile = createSourceFile(`
interface User { }        
function fnToIgnore(my_explicit_variable) {
  return { value: my_explicit_variable };
}

function callsite(n: User) {
   fnToIgnore(n);
}
`);

    removeAny(sourceFile);
    expect(sourceFile.print()).toStrictEqual(
      `interface User {
}
function fnToIgnore(my_explicit_variable: User) {
    return { value: my_explicit_variable };
}
function callsite(n: User) {
    fnToIgnore(n);
}
`
    );
  });

  it("should set the type to string if more than 5 calls", () => {
    const sourceFile = createSourceFile(`
function fnToIgnore(my_explicit_variable) {
  return { value: my_explicit_variable };
}

fnToIgnore('1');
fnToIgnore('4');
fnToIgnore('3');
fnToIgnore('2');
fnToIgnore('5');
`);

    removeAny(sourceFile);
    expect(sourceFile.print()).toStrictEqual(
      `function fnToIgnore(my_explicit_variable: string) {
    return { value: my_explicit_variable };
}
fnToIgnore('1');
fnToIgnore('4');
fnToIgnore('3');
fnToIgnore('2');
fnToIgnore('5');
`
    );
  });

  it("should deduplicate the types added", () => {
    const sourceFile = createSourceFile(`
function fnToIgnore(my_explicit_variable) {
  return { value: my_explicit_variable };
}

fnToIgnore('1');
fnToIgnore('1');
fnToIgnore('1');
`);

    removeAny(sourceFile);
    expect(sourceFile.print()).toStrictEqual(
      `function fnToIgnore(my_explicit_variable: "1") {
    return { value: my_explicit_variable };
}
fnToIgnore('1');
fnToIgnore('1');
fnToIgnore('1');
`
    );
  });

  it("should not set any", () => {
    const sourceFile = createSourceFile(`
function fnToIgnore(my_explicit_variable) {
  return { value: my_explicit_variable };
}

function callsite(n: any) {
   fnToIgnore(n);
}
`);

    removeAny(sourceFile);
    expect(sourceFile.print()).toStrictEqual(
      `function fnToIgnore(my_explicit_variable) {
    return { value: my_explicit_variable };
}
function callsite(n: any) {
    fnToIgnore(n);
}
`
    );
  });
});

function createSourceFile(code: string): SourceFile {
  const project = new Project();
  return project.createSourceFile("/tmp/not_used.ts", code);
}
