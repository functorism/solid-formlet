import { Switch, Match, createEffect, createSignal, For } from "solid-js";
import { createStore } from "solid-js/store";
import { Dynamic } from "solid-js/web";
import { fieldToSolid } from "./field-solid";
import * as Form from "./form";
import { defaultFormRenderer, FormComponent } from "./solid-formlet";
import * as E from "./utils/either";
import { pipe } from "./utils/pipe";
import * as V from "./utils/validation";

// Builds a component from a {@link Form} and optional {@link FormRenderer}.
export const formToSolid = <A,>(
  form: Form.Form<A>,
  formRenderer = defaultFormRenderer,
): FormComponent<A> =>
  form.match({
    Select:
      (form1, form2) =>
      ({ onChange }) => {
        const Form1 = formToSolid(form1, formRenderer);
        const Form2 = formToSolid(form2, formRenderer);

        const [formValue1, onChange1] = createSignal(Form.readForm(form1));
        const [formValue2, onChange2] = createSignal(Form.readForm(form2));

        createEffect(() => onChange(V.select(formValue1(), formValue2())));

        const hideForm2 = () =>
          formValue1().match({
            Failure: () => true,
            Warning: (_, e) => E.isRight(e),
            Success: E.isRight,
          });

        return formRenderer.Combine(
          <Form1 onChange={onChange1} />,
          formRenderer.Disable(hideForm2, <Form2 onChange={onChange2} />),
        );
      },

    Apply:
      (form1, form2) =>
      ({ onChange }) => {
        const Form1 = formToSolid(form1, formRenderer);
        const Form2 = formToSolid(form2, formRenderer);

        const [formValue1, onChange1] = createSignal(Form.readForm(form1));
        const [formValue2, onChange2] = createSignal(Form.readForm(form2));

        createEffect(() => onChange(V.ap(formValue1(), formValue2())));

        return formRenderer.Combine(<Form1 onChange={onChange1} />, <Form2 onChange={onChange2} />);
      },

    Map:
      (g, form1) =>
      ({ onChange }) => {
        const Form1 = formToSolid(form1, formRenderer);
        const [formValue1, onChange1] = createSignal(Form.readForm(form1));
        createEffect(() => onChange(pipe(formValue1(), V.map(g))));
        return <Form1 onChange={onChange1} />;
      },

    Field:
      (field) =>
      ({ onChange }) => {
        const Field = fieldToSolid(field, formRenderer);
        return <Field onChange={onChange} />;
      },

    List:
      (form1, form1s, g) =>
      ({ onChange }) => {
        const [state, setState] = createStore(
          form1s.map((form) => ({
            form,
            component: formToSolid(form, formRenderer),
            value: Form.readForm(form),
          })),
        );

        const onDelete = (i: () => number) => () => {
          const ix = i();
          setState((xs) => xs.filter((_, j) => j !== ix));
        };

        const onAdd = () => {
          setState((items) => [
            ...items,
            {
              form: form1,
              component: formToSolid(form1, formRenderer),
              value: Form.readForm(form1),
            },
          ]);
        };

        createEffect(() => onChange(pipe(V.sequence(state.map((item) => item.value)), V.map(g))));

        return formRenderer.List((withDelete, withAdd) =>
          withAdd(
            onAdd,
            <For each={state}>
              {(item, i) =>
                withDelete(
                  onDelete(i),
                  <Dynamic
                    component={item.component}
                    onChange={(value) => {
                      setState(i(), "value", value);
                    }}
                  />,
                )
              }
            </For>,
          ),
        );
      },

    Group:
      (name, form) =>
      ({ onChange }) => {
        const Form = formToSolid(form, formRenderer);
        return formRenderer.Group(name, <Form onChange={onChange} />);
      },

    Validated:
      (validate, form) =>
      ({ onChange }) => {
        const Form = formToSolid(form, formRenderer);
        const [errors, setErrors] = createSignal<string[]>([]);
        const element = (
          <Form
            onChange={(v1) => {
              v1.match({
                Success: (a) =>
                  validate(a).match({
                    Success: (a) => (onChange(V.Success(a)), setErrors([])),
                    Warning: (es, a) => (onChange(V.Warning(es, a)), setErrors(es)),
                    Failure: (es) => (onChange(V.Failure(es)), setErrors(es)),
                  }),
                Warning: (es1, a) =>
                  validate(a).match({
                    Success: (a) => (onChange(V.Success(a)), setErrors([])),
                    Warning: (es2, a) => (onChange(V.Warning([...es1, ...es2], a)), setErrors(es2)),
                    Failure: (es2) => (onChange(V.Failure([...es1, ...es2])), setErrors(es2)),
                  }),
                Failure: (es) => {
                  onChange(V.Failure([...es, ...errors()]));
                },
              });
            }}
          />
        );
        return (
          <Switch>
            <Match when={errors().length === 0}>{element}</Match>
            <Match when={errors().length > 0}>{formRenderer.Errors(errors, element)}</Match>
          </Switch>
        );
      },
  });
