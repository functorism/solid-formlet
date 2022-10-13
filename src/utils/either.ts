// @group Interfaces - Data Type
export interface EitherCata<E, A, R> {
  Left: (e: E) => R;
  Right: (a: A) => R;
}

// @group Interfaces - Data Type
export interface Either<E, A> {
  datatype: "Either";
  match: <R>(cata: EitherCata<E, A, R>) => R;
}

// @group Constructors
export const Left = <E, A>(e: E): Either<E, A> => ({
  datatype: "Either",
  match: (cata) => cata.Left(e),
});

// @group Constructors
export const Right = <E, A>(a: A): Either<E, A> => ({
  datatype: "Either",
  match: (cata) => cata.Right(a),
});

export const is = (f: any): f is Either<unknown, unknown> => f?.datatype === "Either";

export const isLeft = <E, A>(f: Either<E, A>): boolean =>
  f.match({ Left: () => true, Right: () => false });

export const isRight = <E, A>(f: Either<E, A>): boolean =>
  f.match({ Left: () => false, Right: () => true });

export const map =
  <E, A, B>(g: (a: A) => B) =>
  (f: Either<E, A>): Either<E, B> =>
    f.match({ Left: (e) => Left(e), Right: (a) => Right(g(a)) });
