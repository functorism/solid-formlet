import { Form, Formlet, Maybe as M, pipe, Validation } from "../src";

export type User = {
  birthdate: M.Maybe<Date>;
  choice: M.Maybe<number>;
  email: M.Maybe<string>;
  favoriteColor: string;
  fullname: { name: string; surname: string };
  list: string[];
  message: string;
  num: number;
  phone: string;
};

export const initUser: User = {
  birthdate: M.Nothing(),
  choice: M.Just(3),
  email: M.Just("john@doe.com"),
  favoriteColor: "#d64343",
  fullname: { name: "John", surname: "Doe" },
  message: "",
  list: [],
  num: 0,
  phone: "911",
};

const userFullName = (user: User) =>
  Form.Group(
    "fullname",
    Form.liftRecord({
      name: Formlet.netext("name", user.fullname.name),
      surname: Formlet.netext("surname", user.fullname.surname),
    }),
  );

export const userEmail = (user: User) =>
  Form.Group(
    "email",
    Form.When(
      Formlet.bool("wants newsletter", M.isJust(user.email)),
      Formlet.email("email", M.withDefault(user.email, "")),
    ),
  );

const userTexts = (user: User) =>
  Form.Group(
    "texts",
    Form.Validated(
      (xs) =>
        new Set(xs).size === xs.length
          ? Validation.Success(xs)
          : Validation.Warning(["Contains duplicates"], xs),
      Formlet.list(
        Formlet.netext("list item"),
        user.list.map((s) => Formlet.text("list item", s)),
      ),
    ),
  );

const userChoices: Array<[string, number]> = [
  ["a", 1],
  ["b", 2],
  ["c", 3],
  ["d", 4],
];

const userChoice = (user: User) =>
  Form.Group(
    "choice",
    Formlet.choice(
      "foo",
      userChoices,
      M.withUndef(
        pipe(
          user.choice,
          M.map((value) => ({ value })),
        ),
      ),
    ),
  );

const userFavoriteColor = (user: User) =>
  Form.Group("favorite color", Formlet.color("color", user.favoriteColor));

const userPhone = (user: User) => Form.Group("phone", Formlet.tel("phone", user.phone));

const userBirthdate = (user: User) =>
  Form.Group("birthdate", Formlet.month("birthdate", user.birthdate));

const userNum = (user: User) =>
  Form.Group(
    "num",
    Formlet.withAttr(Formlet.range, { step: 10, min: 100, max: 1000 })("num", user.num),
  );

const userMessage = (user: User) =>
  Form.Group("message", Formlet.netextarea("message", user.message));

export const userForm = (user: User): Form.Form<User> =>
  Form.liftRecord({
    birthdate: userBirthdate(user),
    choice: Form.Map(M.Just, userChoice(user)),
    email: userEmail(user),
    favoriteColor: userFavoriteColor(user),
    fullname: userFullName(user),
    list: userTexts(user),
    message: userMessage(user),
    num: userNum(user),
    phone: userPhone(user),
  });
