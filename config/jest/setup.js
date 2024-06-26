import gql from "graphql-tag";
import "@testing-library/jest-dom";
import { loadErrorMessageHandler } from "../../dev/loadErrorMessageHandler.js";
import "../../testing/matchers/index.js";
// Turn off warnings for repeated fragment names
gql.disableFragmentWarnings();
process.on("unhandledRejection", function () { });
loadErrorMessageHandler();
function fail(reason) {
    if (reason === void 0) { reason = "fail was called in a test."; }
    expect(reason).toBe(undefined);
}
// @ts-ignore
globalThis.fail = fail;
if (!Symbol.dispose) {
    Object.defineProperty(Symbol, "dispose", {
        value: Symbol("dispose"),
    });
}
if (!Symbol.asyncDispose) {
    Object.defineProperty(Symbol, "asyncDispose", {
        value: Symbol("asyncDispose"),
    });
}
//# sourceMappingURL=setup.js.map