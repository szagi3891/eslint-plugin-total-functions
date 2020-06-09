import { RuleModule } from "@typescript-eslint/experimental-utils/dist/ts-eslint";
import { ESLintUtils } from "@typescript-eslint/experimental-utils";
import { isTupleTypeReference } from "tsutils";

/**
 * An ESLint rule to ban array destructuring, which is not well-typed in TypeScript.
 */
const noArrayDestructuring: RuleModule<"errorStringGeneric", readonly []> = {
  meta: {
    type: "problem",
    docs: {
      category: "Possible Errors" as const,
      description: "Array destructuring is not type-safe in TypeScript.",
      recommended: "error",
      url: "https://github.com/danielnixon/eslint-plugin-total-functions",
    },
    messages: {
      errorStringGeneric: "Array destructuring is not type-safe in TypeScript.",
    },
    schema: [],
  },
  create: (context) => {
    const parserServices = ESLintUtils.getParserServices(context);
    const checker = parserServices.program.getTypeChecker();

    return {
      // eslint-disable-next-line functional/no-return-void
      ArrayPattern: (node): void => {
        const tsNode = parserServices.esTreeNodeToTSNodeMap.get(node);
        const type = checker.getTypeAtLocation(tsNode);

        // eslint-disable-next-line functional/no-conditional-statement
        if (
          isTupleTypeReference(type) &&
          node.elements.length <= type.target.minLength
        ) {
          // Allow tuples (whether partial or not) if the indexes
          // we're destructuring are all know to be safe at compile time.
          return;
        }

        // eslint-disable-next-line functional/no-expression-statement
        context.report({
          node: node,
          messageId: "errorStringGeneric",
        });
      },
    };
  },
};

export default noArrayDestructuring;