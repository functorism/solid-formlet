type SomeData = {
  datatype: string;
  match: Function;
};

const isSomeData = (x: unknown): x is SomeData =>
  typeof x === "object" && x !== null && "datatype" in x && "match" in x;

export const dataDevtoolsFormatter = () => ({
  header: (x: unknown) =>
    isSomeData(x)
      ? ["div", {}, `${x.datatype}.${x.match(new Proxy({}, { get: (_, key) => () => key }))}`]
      : null,
  hasBody: () => true,
  body: (f: SomeData) => [
    "div",
    {},
    f.match(
      new Proxy(
        {},
        {
          get:
            () =>
            (...args: unknown[]) =>
              ["div", {}, ...args.map((x) => (x ? ["li", {}, ["object", { object: x }]] : null))],
        },
      ),
    ),
  ],
});

// Enables Pretty Printing of Data Types in Chromium based DevTools
export const enableDebug = () => {
  if (typeof window !== "undefined") {
    console.info(" ℹ️  Make sure to enable custom formatters in Devtools > Preferences > Console");
    // @ts-ignore
    window.devtoolsFormatters = [
      // @ts-ignore
      ...(window.devtoolsFormatters ?? []),
      dataDevtoolsFormatter(),
    ];
  }
};
