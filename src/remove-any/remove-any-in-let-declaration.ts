import { VariableDeclaration } from "ts-morph";
import { computeTypesFromList, filterUnusableTypes, isImplicitAny, setTypeOnNode } from "./type.utils";
import { noopRevertableOperation, RevertableOperation } from "./revert-operation";
import { allTypesOfRefs } from "./type-unifier";

export function removeAnyInLetDeclaration(variableDeclaration: VariableDeclaration): RevertableOperation {
  if (!isImplicitAny(variableDeclaration)) {
    return noopRevertableOperation;
  }

  const typesOfSets = allTypesOfRefs(variableDeclaration);

  const newType = computeTypesFromList(filterUnusableTypes(typesOfSets));

  if (newType) {
    return setTypeOnNode(variableDeclaration, newType);
  }
  return { countChangesDone: 0, countOfAnys: 1, revert() {} };
}
