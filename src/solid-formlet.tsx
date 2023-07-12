import { For, Accessor, createSignal, JSXElement, Component } from "solid-js";
import { InputAttributes, SelectAttributes, TextAreaAttributes } from "./field";
import * as Form from "./form";
import { formToSolid } from "./form-solid";
import * as V from "./utils/validation";

export interface FormComponent<A>
  extends Component<{ onChange: (a: V.Validation<string, A>) => void }> {}

// {@link defaultFormRenderer}
export interface FormRenderer<A> {
  // Used for combining elements required for {@link Form} input, e.g.
  // returning a fragment with the two as sibling elements
  Combine: (a: A, b: A) => A;

  Field: (
    name: string,
    type: string,
    // Reactive Accessor for validation errors for the field
    errors: Accessor<string[]>,
    // Render function for {@link Field}, takes optional props to forward
    field: (forwardProps: {
      input?: InputAttributes;
      select?: SelectAttributes;
      textarea?: TextAreaAttributes;
    }) => A,
  ) => A;

  Errors: (errors: Accessor<string[]>, children?: JSXElement) => A;

  Group: (name: string, form: A) => A;

  Disable: (
    // Reactive Accessor signaling if the element should be shown or not
    hide: Accessor<boolean>,
    form: A,
  ) => A;

  List: (
    // Used for adding add and delete functionality to components
    // being rendered in a list
    listRenderer: (
      // Wrapper function for adding "delete" functionality around list item
      // @param del Callback which when called will delete list item from list
      withDelete: (del: () => void, form: A) => A,
      // Wrapper function for adding "add" functionality around list
      // @param add Callback which when called will append a new list item
      withAdd: (add: () => void, forms: A) => A,
    ) => A,
  ) => A;
}

export const defaultFormRenderer: FormRenderer<JSXElement> = {
  Combine: (a, b) => (
    <>
      {a}
      {b}
    </>
  ),

  Field: (_, __, errors, field) => defaultFormRenderer.Errors(errors, field({})),

  Errors: (errors, children) => (
    <>
      <For each={errors()}>{(err) => err}</For>
      {children}
    </>
  ),

  Group: (_, form) => form,

  Disable: (hide, form) => (
    <fieldset style={hide() ? { display: "none" } : {}} disabled={hide()}>
      {form}
    </fieldset>
  ),

  List: (listRenderer) =>
    listRenderer(
      (_, form) => form,
      (_, forms) => forms,
    ),
};

// Creates a reactive form value and form element from a {@link Form.Form}.
//
// @example
// const App = () => {
//   const form = Formlet.netext("name", "");
//   const [value, element] = createForm(form);
//
//   createEffect(() => console.log(value()));
//
//   return (
//     <div>
//       <h1>Form</h1>
//       {element}
//     </div>
//   );
// };
export const createForm = <A,>(
  form: Form.Form<A>,
  formRenderer = defaultFormRenderer,
): [Accessor<V.Validation<string, A>>, JSXElement] => {
  const [value, update] = createSignal(Form.readForm(form));
  const Comp = formToSolid(form, formRenderer);
  return [value, <Comp onChange={update} />];
};
