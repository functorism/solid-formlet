import { createEffect, createSignal, For, JSX, JSXElement } from "solid-js";
import * as Field from "./field";
import { defaultFormRenderer, FormComponent, FormRenderer } from "./solid-formlet";
import * as M from "./utils/maybe";
import { pipe } from "./utils/pipe";
import * as V from "./utils/validation";

const runValidation = <A,>(el: HTMLInputElement, v: V.Validation<string, A>) => {
  v.match({
    Success: () => el.setCustomValidity(""),
    Warning: (es) => el.setCustomValidity(es.join(", ")),
    Failure: (es) => el.setCustomValidity(es.join(", ")),
  });
};

// Custom validation takes precedence (built-in validation will not be
// shown until all custom validation passes).
const errorMessages = (
  touched: boolean,
  v: V.Validation<string, unknown>,
  el: HTMLInputElement | void,
) => (touched ? V.failureWithDefault(v, el?.validationMessage ? [el?.validationMessage] : []) : []);

const FieldInput = <I, O>(props: {
  formRenderer: FormRenderer<JSXElement>;
  forward?: Field.InputAttributes;
  init: I;
  name: string;
  onChange: (v: V.Validation<string, O>) => void;
  readInput: (input: HTMLInputElement) => I;
  type: string;
  validate: (i: I) => V.Validation<string, O>;
}) => {
  let ref: HTMLInputElement | undefined;
  const [touched, touch] = createSignal(false);
  const [value, update] = createSignal(props.validate(props.init));

  createEffect(() => touched() && props.onChange(value()));

  const handleChange: JSX.EventHandlerUnion<HTMLInputElement, Event> = (ev) => {
    if (!touched()) touch(true);
    const v = props.validate(props.readInput(ev.currentTarget));
    runValidation(ev.currentTarget, v);
    update(v);
  };

  const onRef = (node: HTMLInputElement | null) => {
    if (node) {
      ref = node;
      runValidation(node, value());
    }
  };

  const errors = () => errorMessages(touched(), value(), ref);

  return props.formRenderer.Field(props.name, props.type, errors, (rendererPropsForward) => (
    <input
      {...props.forward}
      {...rendererPropsForward.input}
      name={props.name}
      onChange={handleChange}
      ref={onRef}
      type={props.type}
    />
  ));
};

const TextArea = <I, O>(props: {
  formRenderer: FormRenderer<JSXElement>;
  forward?: Field.TextAreaAttributes;
  init: I;
  name: string;
  onChange: (v: V.Validation<string, O>) => void;
  readInput: (input: HTMLTextAreaElement) => I;
  validate: (i: I) => V.Validation<string, O>;
}) => {
  const [touched, touch] = createSignal(false);
  const [value, update] = createSignal(props.validate(props.init));

  createEffect(() => touched() && props.onChange(value()));

  const handleChange: JSX.EventHandlerUnion<HTMLTextAreaElement, Event> = (ev) => {
    if (!touched()) touch(true);
    update(props.validate(props.readInput(ev.currentTarget)));
  };

  const errors = () => V.failureWithDefault(value(), []);

  return props.formRenderer.Field(props.name, "textarea", errors, (rendererPropsForward) => (
    <textarea
      {...props.forward}
      {...rendererPropsForward.textarea}
      name={props.name}
      onChange={handleChange}
    />
  ));
};

// Builds a component from a {@link Field} and optional {@link FormRenderer}.
export const fieldToSolid = <A,>(
  field: Field.Field<A>,
  formRenderer = defaultFormRenderer,
): FormComponent<A> =>
  field.match({
    Boolean:
      ({ name, init, validate, attributes }) =>
      ({ onChange }) => (
        <FieldInput
          formRenderer={formRenderer}
          forward={{ ...attributes, checked: init }}
          init={init}
          name={name}
          onChange={onChange}
          readInput={(input) => input.checked}
          type={attributes?.type ?? "checkbox"}
          validate={validate}
        />
      ),

    File:
      ({ name, init, validate, attributes }) =>
      ({ onChange }) => (
        <FieldInput
          formRenderer={formRenderer}
          forward={{ ...attributes }}
          init={init}
          name={name}
          onChange={onChange}
          readInput={(input) => (input.files ? M.Just(input.files) : M.Nothing())}
          type={attributes?.type ?? "file"}
          validate={validate}
        />
      ),

    Number:
      ({ name, init, validate, attributes }) =>
      ({ onChange }) => (
        <FieldInput
          formRenderer={formRenderer}
          forward={{ ...attributes, value: init }}
          init={init}
          name={name}
          onChange={onChange}
          readInput={(input) => input.valueAsNumber}
          type={attributes?.type ?? "number"}
          validate={validate}
        />
      ),

    Text:
      ({ name, init, validate, attributes }) =>
      ({ onChange }) => (
        <FieldInput
          formRenderer={formRenderer}
          forward={{ ...attributes, value: init }}
          init={init}
          name={name}
          onChange={onChange}
          readInput={(input) => input.value}
          type={attributes?.type ?? "text"}
          validate={validate}
        />
      ),

    TextArea:
      ({ name, init, validate, attributes }) =>
      ({ onChange }) => (
        <TextArea
          formRenderer={formRenderer}
          forward={{ ...attributes }}
          init={init}
          name={name}
          onChange={onChange}
          readInput={(input) => input.value}
          validate={validate}
        />
      ),

    Time:
      ({ name, init, validate, attributes }) =>
      ({ onChange }) => (
        <FieldInput
          formRenderer={formRenderer}
          forward={{
            ...attributes,
            value: M.withDefault(
              pipe(
                init,
                M.map((x) => x.toString()),
              ),
              "",
            ),
          }}
          init={init}
          name={name}
          onChange={onChange}
          readInput={(input) => (input.valueAsDate ? M.Just(input.valueAsDate) : M.Nothing())}
          type={attributes?.type ?? "date"}
          validate={validate}
        />
      ),

    Pure:
      () =>
      ({}) => <></>,

    Choice:
      ({ name, choice, choices, attributes }) =>
      ({ onChange }) => {
        const [value, update] = createSignal(choice);

        createEffect(() => {
          onChange(
            Field.readField(
              Field.Choice({
                name,
                choice: value(),
                choices,
              }),
            ),
          );
        });

        const handleChange: JSX.EventHandlerUnion<HTMLSelectElement, Event> = (ev) =>
          update(M.fromUndef(ev.currentTarget.selectedOptions.item(0)?.value));

        return formRenderer.Field(
          name,
          "select",
          () => [],
          (rendererPropsForward) => {
            return (
              <select
                {...rendererPropsForward.select}
                {...attributes}
                name={name}
                onChange={handleChange}
              >
                <For each={choices} fallback={<div>...</div>}>
                  {([k]) => (
                    <option
                      value={k}
                      selected={pipe(
                        value(),
                        M.fold((v) => v === k, false),
                      )}
                    >
                      {k}
                    </option>
                  )}
                </For>
              </select>
            );
          },
        );
      },

    Custom:
      (props) =>
      ({ onChange }) =>
        props.view({ ...props, onChange }),
  });
