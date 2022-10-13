// A Formlet is a function that constructs a {@link Form}.
// ``` ts
// const simpleFormlet = (name: string, init: string) => Form.Field(Field.Text({
//   name, init, attributes: {}, validate: V.Success
// }));
// ```
// This module defines an interface for a generic {@link Formlet} and provides
// constructor and combinator functions for it.
// ``` ts
// const nameFormlet = (name: string) => Formlet.netext("name", name);
// const nameForm = nameFormlet("solid-formlet");
// const nameValue = Form.readForm(nameForm);
//
// nameValue.match({
//   Success: (name) => console.log(`Welcome ${name}!`),
//   Failure: (errors) => console.log(errors.join(", ")),
// });
// ```
//
// The Formlets provided are ready to be used with combinators from {@link Form}.
// ``` ts
// import { Form, Formlet, Maybe } from "solid-formlet";
//
// type User = {
//   fullname: { name: string; surname: string };
//   email: Maybe.Maybe<string>;
// };
//
// const userFullName = (user: User) =>
//   Form.Group(
//     "fullname",
//     Form.lift(
//       (name: string, surname: string) => ({ name, surname }),
//       Formlet.netext("name", user.fullname.name),
//       Formlet.netext("surname", user.fullname.surname),
//     ),
//   );
//
// const userEmail = (user: User) =>
//   Form.Group(
//     "email",
//     Form.When(
//       Formlet.bool("subscribe", Maybe.isJust(user.email)),
//       Formlet.email("email", Maybe.withDefault(user.email, "")),
//     ),
//   );
//
// export const userForm = (user: User) =>
//   Form.liftRecord({
//     fullname: userFullName(user),
//     email: userEmail(user)
//   });
// ```
// @packageDocumentation

import * as Field from "./field";
import * as Form from "./form";
import * as M from "./utils/maybe";
import * as V from "./utils/validation";
import { nestring, uniqueArray } from "./validations";

// @group Formlets - Formlet Type
export interface Formlet<A, B, T> {
  (name: string, init?: A, attr?: T, validate?: (a: A) => V.Validation<string, B>): Form.Form<B>;
}

// @group Formlets - Formlet Type
export interface InputFormlet<A, B> extends Formlet<A, B, Field.InputAttributes> {}
// @group Formlets - Formlet Type
export interface TextAreaFormlet<A, B> extends Formlet<A, B, Field.TextAreaAttributes> {}
// @group Formlets - Formlet Type
export interface SelectAreaFormlet<A, B> extends Formlet<A, B, Field.SelectAttributes> {}

// @group Formlets - Higher Order
export const withAttr =
  <A, B, T>(formlet: Formlet<A, B, T>, attr_: T): Formlet<A, B, T> =>
  (name, init, attr, validate) =>
    formlet(name, init, { ...attr, ...attr_ }, validate);

// @group Formlets - Higher Order
export const withValidation =
  <A, B, T>(
    formlet: Formlet<A, B, T>,
    validate: (a: A) => V.Validation<string, B>,
  ): Formlet<A, B, T> =>
  (name, init, attr) =>
    formlet(name, init, attr, validate);

// @group Formlets - Base
export const bool: InputFormlet<boolean, boolean> = (
  name,
  init = false,
  attributes = {},
  validate = V.Success,
) => Form.Field(Field.Boolean({ name, init, attributes, validate }));

// @group Formlets - Base
export const date: InputFormlet<M.Maybe<Date>, M.Maybe<Date>> = (
  name,
  init = M.Nothing(),
  attributes = {},
  validate = V.Success,
) => Form.Field(Field.Time({ name, init, attributes, validate }));

// @group Formlets - Base
export const file: InputFormlet<M.Maybe<FileList>, M.Maybe<FileList>> = (
  name,
  init = M.Nothing(),
  attributes = {},
  validate = V.Success,
) => Form.Field(Field.File({ name, init, attributes, validate }));

// @group Formlets - Base
export const number: InputFormlet<number, number> = (
  name,
  init = 0,
  attributes = {},
  validate = V.Success,
) => Form.Field(Field.Number({ name, init, attributes, validate }));

// @group Formlets - Numeric
export const range = withAttr(number, { type: "range" });

// @group Formlets - Base
export const text: InputFormlet<string, string> = (
  name,
  init = "",
  attributes = {},
  validate = V.Success,
) => Form.Field(Field.Text({ name, init, attributes, validate }));

// @group Formlets - Base
export const textarea: TextAreaFormlet<string, string> = (
  name,
  init = "",
  attributes = {},
  validate = V.Success,
) => Form.Field(Field.TextArea({ name, init, attributes, validate }));

// @group Formlets - Text
export const netextarea = withValidation(textarea, nestring);

// @group Formlets - Text
export const netext = withValidation(text, nestring);

// @group Formlets - Text
export const color = withAttr(text, { type: "color" });
// @group Formlets - Text
export const email = withAttr(text, { type: "email" });
// @group Formlets - Text
export const password = withAttr(text, { type: "password" });
// @group Formlets - Text
export const search = withAttr(text, { type: "search" });
// @group Formlets - Text
export const tel = withAttr(text, { type: "tel" });
// @group Formlets - Text
export const url = withAttr(text, { type: "url" });

// @group Formlets - Time
export const datetime = withAttr(date, { type: "datetime-local" });
// @group Formlets - Time
export const month = withAttr(date, { type: "month" });
// @group Formlets - Time
export const week = withAttr(date, { type: "week" });
// @group Formlets - Time
export const time = withAttr(date, { type: "time" });

// @group Formlets - Higher Order
export const list = <A>(
  form: Form.Form<A>,
  forms: Array<Form.Form<A>>,
  g: (a: A[]) => A[] = (a) => a,
) => Form.List(form, forms, g);

// @group Formlets - Higher Order
export const uniqueList = <A>(
  form: Form.Form<A>,
  forms: Array<Form.Form<A>>,
  g: (a: A[]) => A[] = (a) => a,
) => Form.Validated(uniqueArray, Form.List(form, forms, g));

// @group Formlets - Base
export const choice = <A>(
  name: string,
  choices: Array<[string, A]>,
  choice?:
    | {
        key: string;
      }
    | {
        value: A;
      }
    | {
        find: (a: A) => boolean;
      },
) => Form.Map(([, v]) => v, choiceWithKey(name, choices, choice));

// @group Formlets - Base
export const choiceWithKey = <A>(
  name: string,
  choices: Array<[string, A]>,
  choice?:
    | {
        key: string;
      }
    | {
        value: A;
      }
    | {
        find: (a: A) => boolean;
      },
) =>
  Form.Field(
    Field.Choice<[string, A]>({
      name,
      choices: choices.map(([k, v]) => [k, [k, v]]),
      choice:
        choice === undefined
          ? M.Nothing()
          : "key" in choice
          ? M.Just(choice.key)
          : "value" in choice
          ? M.fromUndef(choices.find(([, v]) => choice.value === v)?.[0])
          : M.fromUndef(choices.find(([, v]) => choice.find(v))?.[0]),
    }),
  );
