import { CaptureResult } from "posthog-js";
import { dropBrowserExtensionExceptions } from "./posthogBeforeSend";

const exceptionEvent = (value: string): CaptureResult =>
  ({
    event: "$exception",
    properties: {
      $exception_list: [{ type: "UnhandledRejection", value }],
    },
  }) as CaptureResult;

describe("dropBrowserExtensionExceptions", () => {
  it("drops the browser add-in non-Error rejection", () => {
    const event = exceptionEvent(
      "Non-Error promise rejection captured with value: Object Not Found Matching Id:2, MethodName:update, ParamCount:4",
    );
    expect(dropBrowserExtensionExceptions(event)).toBeNull();
  });

  it("keeps a real application exception", () => {
    const event = exceptionEvent("TypeError: cannot read property 'x'");
    expect(dropBrowserExtensionExceptions(event)).toBe(event);
  });

  it("passes non-exception events through", () => {
    const event = { event: "$pageview", properties: {} } as CaptureResult;
    expect(dropBrowserExtensionExceptions(event)).toBe(event);
  });

  it("passes a null event through", () => {
    expect(dropBrowserExtensionExceptions(null)).toBeNull();
  });

  it("keeps an exception with no exception list", () => {
    const event = { event: "$exception", properties: {} } as CaptureResult;
    expect(dropBrowserExtensionExceptions(event)).toBe(event);
  });
});
