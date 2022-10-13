import { JSX, JSXElement } from "solid-js";
import * as M from "./utils/maybe";
import * as V from "./utils/validation";

// @group Interfaces - Data Type Input
export type InputAttributes = Partial<JSX.IntrinsicElements["input"]>;
// @group Interfaces - Data Type Input
export type SelectAttributes = Partial<JSX.IntrinsicElements["select"]>;
// @group Interfaces - Data Type Input
export type TextAreaAttributes = Partial<JSX.IntrinsicElements["textarea"]>;

// @group Interfaces - Data Type Input
export interface InputMeta<A, B> {
  name: string;
  init: A;
  validate: (a: A) => V.Validation<string, B>;
  attributes?: InputAttributes;
}

// @group Interfaces - Data Type Input
export interface TextAreaMeta<A, B> {
  name: string;
  init: A;
  validate: (a: A) => V.Validation<string, B>;
  attributes?: TextAreaAttributes;
}

// @group Interfaces - Data Type Input
export interface ChoiceMeta<A> {
  name: string;
  choice: M.Maybe<string>;
  choices: [string, A][];
  attributes?: SelectAttributes;
}

// @group Interfaces - Data Type Input
export type CustomMeta<A> = {
  init: A;
  validate: (a: A) => V.Validation<string, A>;
  view: (props: {
    init: A;
    validate: (a: A) => V.Validation<string, A>;
    onChange: (v: V.Validation<string, A>) => void;
  }) => JSXElement;
};

// @group Interfaces - Data Type
export interface FieldCata<A, R> {
  Boolean: (meta: InputMeta<boolean, A>) => R;
  File: (meta: InputMeta<M.Maybe<FileList>, A>) => R;
  Number: (meta: InputMeta<number, A>) => R;
  Text: (meta: InputMeta<string, A>) => R;
  TextArea: (meta: TextAreaMeta<string, A>) => R;
  Time: (meta: InputMeta<M.Maybe<Date>, A>) => R;

  Choice: (meta: ChoiceMeta<A>) => R;

  Pure: (a: A) => R;

  Custom: (meta: CustomMeta<A>) => R;
}

// @group Interfaces - Data Type
export interface Field<A> {
  datatype: "Field";
  match: <R>(cata: FieldCata<A, R>) => R;
}

// @group Constructors
export const Boolean = <A>(meta: InputMeta<boolean, A>): Field<A> => ({
  datatype: "Field",
  match: (cata) => cata.Boolean(meta),
});

// @group Constructors
export const File = <A>(meta: InputMeta<M.Maybe<FileList>, A>): Field<A> => ({
  datatype: "Field",
  match: (cata) => cata.File(meta),
});

// @group Constructors
export const Number = <A>(meta: InputMeta<number, A>): Field<A> => ({
  datatype: "Field",
  match: (cata) => cata.Number(meta),
});

// @group Constructors
export const Text = <A>(meta: InputMeta<string, A>): Field<A> => ({
  datatype: "Field",
  match: (cata) => cata.Text(meta),
});

// @group Constructors
export const TextArea = <A>(meta: TextAreaMeta<string, A>): Field<A> => ({
  datatype: "Field",
  match: (cata) => cata.TextArea(meta),
});

// @group Constructors
export const Time = <A>(meta: InputMeta<M.Maybe<Date>, A>): Field<A> => ({
  datatype: "Field",
  match: (cata) => cata.Time(meta),
});

// @group Constructors
export const Choice = <A>(meta: ChoiceMeta<A>): Field<A> => ({
  datatype: "Field",
  match: (cata) => cata.Choice(meta),
});

// @group Constructors
export const Pure = <A>(a: A): Field<A> => ({
  datatype: "Field",
  match: (cata) => cata.Pure(a),
});

export const Custom = <A>(meta: CustomMeta<A>): Field<A> => ({
  datatype: "Field",
  match: (cata) => cata.Custom(meta),
});

export const is = (f: any): f is Field<unknown> => f?.datatype === "Field";

export const readField = <A>(field: Field<A>): V.Validation<string, A> =>
  field.match({
    Boolean: ({ init, validate }) => validate(init),
    File: ({ init, validate }) => validate(init),
    Number: ({ init, validate }) => validate(init),
    Text: ({ init, validate }) => validate(init),
    TextArea: ({ init, validate }) => validate(init),
    Time: ({ init, validate }) => validate(init),
    Custom: ({ init, validate }) => validate(init),

    Pure: (a) => V.Success(a),

    Choice: ({ choices, choice }) =>
      choice.match({
        Just: (ck) => {
          const x = choices.find(([k]) => k === ck);
          return x === undefined ? V.Failure(["Invalid choice"]) : V.Success(x[1]);
        },
        Nothing: () => {
          const x = choices[0];
          return x === undefined ? V.Failure(["No choices available"]) : V.Success(x[1]);
        },
      }),
  });
