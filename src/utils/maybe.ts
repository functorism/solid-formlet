// @group Interfaces - Data Type
export interface MaybeCata<A, R> {
  Just: (a: A) => R;
  Nothing: () => R;
}

// @group Interfaces - Data Type
export interface Maybe<A> {
  datatype: "Maybe";
  match: <R>(cata: MaybeCata<A, R>) => R;
}

// @group Constructors
export const Just = <A>(a: A): Maybe<A> => ({
  datatype: "Maybe",
  match: (cata) => cata.Just(a),
});

// @group Constructors
export const Nothing = <A>(): Maybe<A> => ({
  datatype: "Maybe",
  match: (cata) => cata.Nothing(),
});

export const is = (f: any): f is Maybe<unknown> => f?.datatype === "Maybe";

export const isJust = <A>(f: Maybe<A>): boolean =>
  f.match({ Just: () => true, Nothing: () => false });

export const isNothing = <A>(f: Maybe<A>): boolean =>
  f.match({ Just: () => false, Nothing: () => true });

export const map =
  <A, B>(g: (a: A) => B) =>
  (f: Maybe<A>): Maybe<B> =>
    f.match({ Just: (a) => Just(g(a)), Nothing: () => Nothing() });

export const chain =
  <A, B>(g: (a: A) => Maybe<B>) =>
  (f: Maybe<A>): Maybe<B> =>
    f.match({ Just: (a) => g(a), Nothing: () => Nothing() });

export const fold =
  <A, B>(g: (a: A, b: B) => B, b: B) =>
  (f: Maybe<A>): B =>
    f.match({
      Just: (a) => g(a, b),
      Nothing: () => b,
    });

export const withDefault = <A>(f: Maybe<A>, d: A): A =>
  f.match({ Just: (a) => a, Nothing: () => d });

export const catMaybes = <A>(ms: Array<Maybe<A>>): A[] =>
  ms.flatMap((m) => withDefault(map<A, A[]>((x) => [x])(m), []));

export const fromNull = <A>(x: null | A): Maybe<A> => (x === null ? Nothing() : Just(x));

export const fromUndef = <A>(x: undefined | A): Maybe<A> => (x === undefined ? Nothing() : Just(x));

export const fromNullable = <A>(x: null | undefined | A): Maybe<A> =>
  x == null ? Nothing() : Just(x);

export const withNull = <A>(f: Maybe<A>): A | null =>
  f.match({ Just: (x) => x, Nothing: () => null });

export const withUndef = <A>(f: Maybe<A>): A | undefined =>
  f.match({ Just: (x) => x, Nothing: () => undefined });

// pipe(value(), M.ap(Just((k2: string) => )))
