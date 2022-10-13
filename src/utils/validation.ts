import { Validation } from "src";
import { Either } from "./either";
import { pipe } from "./pipe";

// @group Interfaces - Data Type
export interface ValidationCata<E, A, R> {
  Failure: (es: Array<E>) => R;
  Success: (a: A) => R;
  Warning: (es: Array<E>, a: A) => R;
}

// @group Interfaces - Data Type
export interface Validation<E, A> {
  datatype: "Validation";
  match: <R>(cata: ValidationCata<E, A, R>) => R;
}

// @group Constructors
export const Failure = <E, A>(es: Array<E>): Validation<E, A> => ({
  datatype: "Validation",
  match: (cata) => cata.Failure(es),
});

// @group Constructors
export const Success = <E, A>(a: A): Validation<E, A> => ({
  datatype: "Validation",
  match: (cata) => cata.Success(a),
});

// @group Constructors
export const Warning = <E, A>(es: Array<E>, a: A): Validation<E, A> => ({
  datatype: "Validation",
  match: (cata) => cata.Warning(es, a),
});

export const is = (f: any): f is Validation<unknown, unknown> => f?.datatype === "Validation";

export const isFailure = <E, A>(f: Validation<E, A>): boolean =>
  f.match({ Failure: () => true, Success: () => false, Warning: () => false });

export const isSuccess = <E, A>(f: Validation<E, A>): boolean =>
  f.match({ Failure: () => false, Success: () => true, Warning: () => false });

export const isWarning = <E, A>(f: Validation<E, A>): boolean =>
  f.match({ Failure: () => false, Success: () => false, Warning: () => true });

export const withFailures = <E, A>(es1: Array<E>, f: Validation<E, A>): Validation<E, A> =>
  f.match({
    Success: (a) => Warning(es1, a),
    Warning: (es2, a) => Warning([...es1, ...es2], a),
    Failure: (es2) => Failure([...es1, ...es2]),
  });

export const map =
  <E, A, B>(g: (a: A) => B) =>
  (f: Validation<E, A>): Validation<E, B> =>
    f.match<Validation<E, B>>({
      Success: (a) => Success(g(a)),
      Warning: (es, a) => Warning(es, g(a)),
      Failure,
    });

export const chain =
  <E, A, B>(g: (a: A) => Validation<E, B>) =>
  (f: Validation<E, A>): Validation<E, B> =>
    f.match<Validation<E, B>>({
      Success: g,
      Warning: (_, a) => g(a),
      Failure,
    });

export const ap = <E, A, B>(
  fg: Validation<E, (a: A) => B>,
  fa: Validation<E, A>,
): Validation<E, B> =>
  fg.match({
    Success: (g) => pipe(fa, map(g)),
    Warning: (es1, g) => pipe(withFailures(es1, fa), map(g)),
    Failure: (es1) =>
      fa.match({
        Success: () => Failure(es1),
        Warning: (es2) => Failure([...es1, ...es2]),
        Failure: (es2) => Failure([...es1, ...es2]),
      }),
  });

export const sequence = <E, A>(fs: Array<Validation<E, A>>): Validation<E, A[]> =>
  fs.reduce(
    (fxs, fx) =>
      ap(
        pipe(
          fxs,
          map((xs: A[]) => (x: A) => xs.concat([x])),
        ),
        fx,
      ),
    Success<E, A[]>([]),
  );

export const select = <E, A, B>(
  fs: Validation<E, Either<A, B>>,
  fg: Validation<E, (a: A) => B>,
): Validation<E, B> =>
  fs.match<Validation<E, B>>({
    Failure,
    Warning: (es, e) =>
      e.match<Validation<E, B>>({
        Left: (a) => ap(fg, Warning(es, a)),
        Right: (b) => Warning(es, b),
      }),
    Success: (e) =>
      e.match<Validation<E, B>>({
        Left: (a) => ap(fg, Success(a)),
        Right: Success,
      }),
  });

export const failureWithDefault = <E, A>(f: Validation<E, A>, d: E[]): E[] =>
  f.match({
    Success: () => d,
    Warning: (es) => es,
    Failure: (es) => es,
  });

export const withDefault = <E, A>(f: Validation<E, A>, d: A): A =>
  f.match({
    Success: (a) => a,
    Warning: (_, a) => a,
    Failure: () => d,
  });
