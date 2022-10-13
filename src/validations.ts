// Functions taking some input and returning a {@link Validation}
// ``` ts
// // Validates that a string is not empty
// export const nestring = (s: string): V.Validation<string, string> =>
//   s.length > 0 ? V.Success(s) : V.Warning(["Must be non-empty"], s);
// ```
// When validating, {@link Validation} allows you to return:
// * {@link Validation.Success} - the value is valid
// * {@link Validation.Warning} - the value fails validation, but the value is
//   available (e.g. we parsed a date from a string but it's out of
//   the valid range)
// * {@link Validation.Failure} - the value fails validation because the value is
//   unavailable (e.g. we tried to parse a date from a string and
//   failed)
// @packageDocumentation

import * as V from "./utils/validation";

// Validates that a string is not empty
// @group Validations - Text
export const nestring = (s: string): V.Validation<string, string> =>
  s.length > 0 ? V.Success(s) : V.Warning(["Must be non-empty"], s);

// Validates that an array has no duplicates
// @group Validations - Array
export const uniqueArray = <A>(xs: A[]): V.Validation<string, A[]> =>
  new Set(xs).size === xs.length ? V.Success(xs) : V.Warning(["No duplicates allowed"], xs);
