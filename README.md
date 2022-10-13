<p>
  <img width="100%" src="https://assets.solidjs.com/banner?type=solid-formlet&background=tiles&project=%20" alt="solid-formlet">
</p>

# solid-formlet

Functional combinators for building reactive forms

* [Docs/Reference](https://unpkg.com/solid-formlet/docs/index.html)

## Quick start

Install it:

```bash
npm i solid-formlet
# or
yarn add solid-formlet
# or
pnpm add solid-formlet
```

Use it:

```tsx
import { createForm, Form, Formlet } from 'solid-formlet';

const userFullName = (user: User) =>
  Form.Group(
    "fullname",
    Form.lift(
      (name: string, surname: string) => ({ name, surname }),
      Formlet.netext("name", user.fullname.name),
      Formlet.netext("surname", user.fullname.surname),
    ),
  );

const App = (props: { user: User }) => {
  const [value, element] = createForm(userFullName(props.user));

  createEffect(() => console.log("%cchanged", "color:blue", value()));

  return (
    <form
      onInvalid={() => {
        console.log("%cinvalid", "color:red", value());
      }}
      onSubmit={(ev) => {
        ev.preventDefault();
        console.log("%csubmitted", "color:green", value());
      }}
    >
      {element}
      <button type="submit">Submit</button>
    </form>
  );
};
```
