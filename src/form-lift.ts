import * as Field from "./field";
import * as Form from "./form";

// @group Combinators
export const sequence = <A>(fs: Array<Form.Form<A>>): Form.Form<Array<A>> =>
  fs.reduce(
    (a, b) =>
      Form.Apply(
        Form.Map((xs) => (x: A) => xs.concat([x]), a),
        b,
      ),
    Form.Field(Field.Pure([] as A[])),
  );

export function liftA<A, B, C>(
  g: (a: A) => (b: B) => C,
  f1: Form.Form<A>,
  f2: Form.Form<B>,
): Form.Form<C>;

export function liftA<A, B, C, D>(
  g: (a: A) => (b: B) => (c: C) => D,
  f1: Form.Form<A>,
  f2: Form.Form<B>,
  f3: Form.Form<C>,
): Form.Form<D>;

export function liftA<A, B, C, D, E>(
  g: (a: A) => (b: B) => (c: C) => (d: D) => E,
  f1: Form.Form<A>,
  f2: Form.Form<B>,
  f3: Form.Form<C>,
  f4: Form.Form<D>,
): Form.Form<E>;

// @group Combinators
export function liftA<A>(
  g: (a: A) => any,
  f1: Form.Form<A>,
  ...fs: Array<Form.Form<A>>
): Form.Form<A> {
  return fs.reduce((a: any, b) => Form.Apply(a, b), Form.Map(g, f1));
}

export function lift<A, B, C>(
  g: (a: A, b: B) => C,
  f1: Form.Form<A>,
  f2: Form.Form<B>,
): Form.Form<C>;

export function lift<A, B, C, D>(
  g: (a: A, b: B, c: C) => D,
  f1: Form.Form<A>,
  f2: Form.Form<B>,
  f3: Form.Form<C>,
): Form.Form<D>;

export function lift<A, B, C, D, E>(
  g: (a: A, b: B, c: C, d: D) => E,
  f1: Form.Form<A>,
  f2: Form.Form<B>,
  f3: Form.Form<C>,
  f4: Form.Form<D>,
): Form.Form<E>;

export function lift<A, B, C, D, E, F>(
  g: (a: A, b: B, c: C, d: D, e: E) => F,
  f1: Form.Form<A>,
  f2: Form.Form<B>,
  f3: Form.Form<C>,
  f4: Form.Form<D>,
  f5: Form.Form<E>,
): Form.Form<F>;

export function lift<A, B, C, D, E, F, G>(
  g: (a: A, b: B, c: C, d: D, e: E, f: F) => G,
  f1: Form.Form<A>,
  f2: Form.Form<B>,
  f3: Form.Form<C>,
  f4: Form.Form<D>,
  f5: Form.Form<E>,
  f6: Form.Form<F>,
): Form.Form<G>;

export function lift<A, B, C, D, E, F, G, H>(
  g: (a: A, b: B, c: C, d: D, e: E, f: F, g: G) => H,
  f1: Form.Form<A>,
  f2: Form.Form<B>,
  f3: Form.Form<C>,
  f4: Form.Form<D>,
  f5: Form.Form<E>,
  f6: Form.Form<F>,
  f7: Form.Form<G>,
): Form.Form<H>;

export function lift<A, B, C, D, E, F, G, H, I>(
  g: (a: A, b: B, c: C, d: D, e: E, f: F, g: G, h: H) => I,
  f1: Form.Form<A>,
  f2: Form.Form<B>,
  f3: Form.Form<C>,
  f4: Form.Form<D>,
  f5: Form.Form<E>,
  f6: Form.Form<F>,
  f7: Form.Form<G>,
  f8: Form.Form<H>,
): Form.Form<I>;

export function lift<A, B, C, D, E, F, G, H, I, J>(
  g: (a: A, b: B, c: C, d: D, e: E, f: F, g: G, h: H, i: I) => J,
  f1: Form.Form<A>,
  f2: Form.Form<B>,
  f3: Form.Form<C>,
  f4: Form.Form<D>,
  f5: Form.Form<E>,
  f6: Form.Form<F>,
  f7: Form.Form<G>,
  f8: Form.Form<H>,
  f9: Form.Form<I>,
): Form.Form<J>;

export function lift<A, B, C, D, E, F, G, H, I, J, K>(
  g: (a: A, b: B, c: C, d: D, e: E, f: F, g: G, h: H, i: I, j: J) => K,
  f1: Form.Form<A>,
  f2: Form.Form<B>,
  f3: Form.Form<C>,
  f4: Form.Form<D>,
  f5: Form.Form<E>,
  f6: Form.Form<F>,
  f7: Form.Form<G>,
  f8: Form.Form<H>,
  f9: Form.Form<I>,
  f10: Form.Form<J>,
): Form.Form<K>;

export function lift<A, B, C, D, E, F, G, H, I, J, K, L>(
  g: (a: A, b: B, c: C, d: D, e: E, f: F, g: G, h: H, i: I, j: J, k: K) => L,
  f1: Form.Form<A>,
  f2: Form.Form<B>,
  f3: Form.Form<C>,
  f4: Form.Form<D>,
  f5: Form.Form<E>,
  f6: Form.Form<F>,
  f7: Form.Form<G>,
  f8: Form.Form<H>,
  f9: Form.Form<I>,
  f10: Form.Form<J>,
  f11: Form.Form<K>,
): Form.Form<L>;

export function lift<A, B, C, D, E, F, G, H, I, J, K, L, M>(
  g: (a: A, b: B, c: C, d: D, e: E, f: F, g: G, h: H, i: I, j: J, k: K, l: L) => M,
  f1: Form.Form<A>,
  f2: Form.Form<B>,
  f3: Form.Form<C>,
  f4: Form.Form<D>,
  f5: Form.Form<E>,
  f6: Form.Form<F>,
  f7: Form.Form<G>,
  f8: Form.Form<H>,
  f9: Form.Form<I>,
  f10: Form.Form<J>,
  f11: Form.Form<K>,
  f12: Form.Form<L>,
): Form.Form<M>;

// @group Combinators
export function lift<A, B>(g: (...as: A[]) => B, ...fs: Array<Form.Form<A>>): Form.Form<B> {
  return Form.Map((as: A[]) => g(...as), sequence(fs));
}

// @group Combinators
export const liftRecord = <
  R extends { [K in keyof R]: R[K] extends Form.Form<infer A> ? Form.Form<A> : never },
>(
  record: R,
): Form.Form<{ [K in keyof R]: R[K] extends Form.Form<infer A> ? A : never }> =>
  // @ts-ignore
  Form.Map(
    // @ts-ignore
    (x) => Object.fromEntries(x),
    // @ts-ignore
    sequence(Object.entries(record).map(([k, f]) => Form.Map((v) => [k, v], f))),
  );
