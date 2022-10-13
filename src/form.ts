import * as F from "./field";
import * as E from "./utils/either";
import * as M from "./utils/maybe";
import { pipe } from "./utils/pipe";
import * as V from "./utils/validation";

export * from "./form-lift";

// @group Interfaces - Data Type
export interface FormCata<A, R> {
  Select: <B>(form1: Form<E.Either<B, A>>, form2: Form<(b: B) => A>) => R;
  Apply: <B>(form1: Form<(b: B) => A>, form2: Form<B>) => R;
  Map: <B>(fn: (b: B) => A, form: Form<B>) => R;
  Field: (field: F.Field<A>) => R;
  List: <B>(form: Form<B>, forms: Array<Form<B>>, fn: (bs: Array<B>) => A) => R;
  Group: (name: string, form: Form<A>) => R;
  Validated: (validate: (a: A) => V.Validation<string, A>, form: Form<A>) => R;
}

// @group Interfaces - Data Type
export interface Form<A> {
  datatype: "Form";
  match: <R>(cata: FormCata<A, R>) => R;
}

// @group Constructors
export const Apply = <A, B>(form1: Form<(b: B) => A>, form2: Form<B>): Form<A> => ({
  datatype: "Form",
  match: (cata) => cata.Apply(form1, form2),
});

// @group Constructors
export const Select = <A, B>(form1: Form<E.Either<B, A>>, form2: Form<(b: B) => A>): Form<A> => ({
  datatype: "Form",
  match: (cata) => cata.Select(form1, form2),
});

// @group Constructors
export const Map = <A, B>(fn: (b: B) => A, form: Form<B>): Form<A> => ({
  datatype: "Form",
  match: (cata) => cata.Map(fn, form),
});

// @group Constructors
export const Field = <A>(field: F.Field<A>): Form<A> => ({
  datatype: "Form",
  match: (cata) => cata.Field(field),
});

// @group Constructors
export const List = <A, B>(
  form: Form<B>,
  forms: Array<Form<B>>,
  fn: (bs: Array<B>) => A,
): Form<A> => ({
  datatype: "Form",
  match: (cata) => cata.List(form, forms, fn),
});

// @group Constructors
export const Group = <A>(name: string, form: Form<A>): Form<A> => ({
  datatype: "Form",
  match: (cata) => cata.Group(name, form),
});

// @group Constructors
export const Validated = <A>(
  validate: (a: A) => V.Validation<string, A>,
  form: Form<A>,
): Form<A> => ({
  datatype: "Form",
  match: (cata) => cata.Validated(validate, form),
});

// @group Combinators
export const Branch = <A, B, C>(
  c: Form<E.Either<A, B>>,
  l: Form<(a: A) => C>,
  r: Form<(b: B) => C>,
): Form<C> =>
  Select(
    Select(
      Map(E.map<A, B, E.Either<B, C>>(E.Left), c),
      Map((g) => (a: A) => E.Right(g(a)), l),
    ),
    r,
  );

// @group Combinators
export const If = <A>(c: Form<boolean>, l: Form<A>, r: Form<A>): Form<A> =>
  Branch<null, null, A>(
    Map((b) => (b ? E.Left(null) : E.Right(null)), c),
    Map((x) => (_) => x, l),
    Map((x) => (_) => x, r),
  );

// @group Combinators
export const When = <A>(selects: Form<boolean>, form: Form<A>): Form<M.Maybe<A>> =>
  Select<M.Maybe<A>, boolean>(
    Map((b) => (b ? E.Left(b) : E.Right(M.Nothing())), selects),
    Map((s) => (_) => M.Just(s), form),
  );

export const is = (f: any): f is Form<unknown> => f?.datatype === "Form";

export const readForm = <A>(form: Form<A>): V.Validation<string, A> =>
  form.match({
    Apply: (fg, fb) => V.ap(readForm(fg), readForm(fb)),
    Select: (fs, fg) => V.select(readForm(fs), readForm(fg)),
    List: (_, fs, g) => pipe(V.sequence(fs.map(readForm)), V.map(g)),
    Map: (g, f) => pipe(readForm(f), V.map(g)),
    Field: F.readField,
    Group: (_, f) => readForm(f),
    Validated: (validate, f) =>
      V.ap(
        pipe(
          readForm(f),
          V.map((x) => () => x),
        ),
        pipe(readForm(f), V.chain(validate)),
      ),
  });
