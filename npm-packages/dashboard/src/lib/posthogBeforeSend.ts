import { CaptureResult } from "posthog-js";

// "Safe Links" style browser add-ins (for example Microsoft Outlook) inject a
// script into the page. That script rejects a promise with a plain object, so
// posthog-js records a non-Error unhandled rejection whose value always looks
// like: "Object Not Found Matching Id:2, MethodName:update, ParamCount:4".
// The exception does not come from our code, so we drop it before it reaches
// error tracking.
const BROWSER_EXTENSION_NOISE =
  /Object Not Found Matching Id:\d+, MethodName:\w+, ParamCount:\d+/;

export function dropBrowserExtensionExceptions(
  event: CaptureResult | null,
): CaptureResult | null {
  if (!event || event.event !== "$exception") {
    return event;
  }

  const exceptions = event.properties?.$exception_list;
  const isNoise =
    Array.isArray(exceptions) &&
    exceptions.some((exception) =>
      BROWSER_EXTENSION_NOISE.test(exception?.value ?? ""),
    );

  return isNoise ? null : event;
}
