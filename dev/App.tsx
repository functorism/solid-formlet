import { Component, createEffect, For, JSXElement, Show } from "solid-js";
import { createForm, defaultFormRenderer, enableDebug, FormRenderer } from "../src/";
import "./App.css";
import { initUser, User, userForm } from "./user";

enableDebug();

const join = (...ss: string[]) => ss.join(" ");

export const tailwindFormRenderer: FormRenderer<JSXElement> = {
  ...defaultFormRenderer,

  Group: (name, form) => (
    <fieldset name={name} class="form-group mb-6">
      <legend class="capitalize">{name}</legend>
      {form}
    </fieldset>
  ),

  Field: (name, type, errors, field) => (
    <label for={name} class="form-label inline-block m-2 text-gray-700">
      <span class="capitalize">{name}</span>
      <Show when={errors().length > 0}>{tailwindFormRenderer.Errors(errors)}</Show>
      {field({
        input: {
          class: join(
            type !== "checkbox" ? "my-3" : "",
            type === "checkbox"
              ? "form-check-input appearance-none h-4 w-4 border border-gray-300 rounded-sm bg-white checked:bg-blue-600 checked:border-blue-600 focus:outline-none transition duration-200 mt-1 align-top bg-no-repeat bg-center bg-contain float-left mr-2 cursor-pointer"
              : "form-control block w-full px-3 py-1.5 text-base font-normal text-gray-700 bg-white bg-clip-padding border border-solid border-gray-300 rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none",
          ),
        },
        select: {
          class:
            "form-select appearance-none block w-full px-3 py-1.5 text-base font-normal text-gray-700 bg-white bg-clip-padding bg-no-repeat border border-solid border-gray-300 rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none",
        },
        textarea: {
          class: "block",
        },
      })}
    </label>
  ),

  Errors: (errors, children) => (
    <>
      <div
        class="p-4 mt-2 mb-4 text-sm text-red-700 bg-red-100 rounded-lg dark:bg-red-200 dark:text-red-800"
        role="alert"
      >
        <For each={errors()}>{(err) => <li>{err}</li>}</For>
      </div>
      {children}
    </>
  ),

  List: (listRenderer) =>
    listRenderer(
      (del, form) => (
        <fieldset>
          {form}
          <button
            class="inline-block px-6 py-2 border-2 border-red-600 text-red-600 font-medium text-xs leading-tight uppercase rounded hover:bg-black hover:bg-opacity-5 focus:outline-none focus:ring-0 transition duration-150 ease-in-out"
            type="button"
            onClick={del}
          >
            Delete
          </button>
        </fieldset>
      ),
      (add, forms) => (
        <fieldset class="m-3">
          {forms}
          <button
            class="inline-block px-6 py-2 border-2 border-blue-600 text-blue-600 font-medium text-xs leading-tight uppercase rounded hover:bg-black hover:bg-opacity-5 focus:outline-none focus:ring-0 transition duration-150 ease-in-out"
            type="button"
            onClick={add}
          >
            Add
          </button>
        </fieldset>
      ),
    ),
};

export function Example(props: { user: User }) {
  const [value, element] = createForm(userForm(props.user), tailwindFormRenderer);

  createEffect(() => console.log(value()));

  return (
    <div>
      <form
        class="d-grid gap-3 m-4"
        onInvalid={() => {
          console.log("%cinvalid", "color:red", value());
        }}
        onSubmit={(ev) => {
          ev.preventDefault();
          console.log("%csubmitted", "color:green", value());
        }}
      >
        {element}
        <button
          type="submit"
          class="inline-block px-6 py-2 border-2 border-blue-600 text-blue-600 font-medium text-xs leading-tight uppercase rounded hover:bg-black hover:bg-opacity-5 focus:outline-none focus:ring-0 transition duration-150 ease-in-out"
        >
          Submit
        </button>
      </form>
    </div>
  );
}

const App: Component = () => (
  <div class="p-5">
    <Example user={initUser} />
  </div>
);

export default App;
