import { useState, type FormEvent } from "react";
import { profile } from "../../data/profile.ts";
import { haptic } from "../../utils/haptics.ts";

type Field = "name" | "email" | "message";
type Errors = Partial<Record<Field, string>>;
type Status = "idle" | "sent" | "error";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const MESSAGE_MIN = 20;

function validate(values: Record<Field, string>): Errors {
  const errors: Errors = {};
  if (values.name.trim().length < 2) {
    errors.name = "Please add your name.";
  }
  if (!EMAIL_PATTERN.test(values.email.trim())) {
    errors.email = "That email doesn't look right.";
  }
  if (values.message.trim().length < MESSAGE_MIN) {
    errors.message = `A little more detail, please (${MESSAGE_MIN}+ characters).`;
  }
  return errors;
}

/**
 * The site has no server, so a valid form opens the visitor's own mail app
 * with the address, subject, and message pre-filled. Renders only when a
 * public email is set in src/data/profile.ts.
 */
export function ContactForm() {
  const to = profile.links.email;
  const [values, setValues] = useState<Record<Field, string>>({ name: "", email: "", message: "" });
  const [errors, setErrors] = useState<Errors>({});
  const [touched, setTouched] = useState<Partial<Record<Field, boolean>>>({});
  const [status, setStatus] = useState<Status>("idle");

  if (!to) {
    return null;
  }

  const update = (field: Field, value: string) => {
    const next = { ...values, [field]: value };
    setValues(next);
    if (touched[field]) {
      setErrors(validate(next));
    }
    if (status !== "idle") {
      setStatus("idle");
    }
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const found = validate(values);
    setErrors(found);
    setTouched({ name: true, email: true, message: true });
    const firstInvalid = (Object.keys(found) as Field[])[0];
    if (firstInvalid) {
      haptic("press");
      setStatus("error");
      event.currentTarget.querySelector<HTMLElement>(`[name="${firstInvalid}"]`)?.focus();
      return;
    }
    const subject = `Portfolio enquiry from ${values.name.trim()}`;
    const body = `${values.message.trim()}\n\n— ${values.name.trim()}\n${values.email.trim()}`;
    window.location.href = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    haptic("success");
    setStatus("sent");
  };

  const fieldProps = (field: Field) => ({
    id: `contact-${field}`,
    name: field,
    value: values[field],
    "aria-invalid": Boolean(errors[field] && touched[field]),
    "aria-describedby": errors[field] && touched[field] ? `contact-${field}-error` : undefined,
    onBlur: () => {
      setTouched((current) => ({ ...current, [field]: true }));
      setErrors(validate(values));
    },
  });

  return (
    <form className="cform" noValidate onSubmit={onSubmit} data-reveal>
      <p className="kicker">SEND A MESSAGE</p>
      <div className="cform__row">
        <div className="cform__field">
          <label htmlFor="contact-name">Name</label>
          <input
            {...fieldProps("name")}
            type="text"
            autoComplete="name"
            onChange={(event) => {
              update("name", event.target.value);
            }}
          />
          {errors.name && touched.name ? (
            <p className="cform__error" id="contact-name-error">
              {errors.name}
            </p>
          ) : null}
        </div>
        <div className="cform__field">
          <label htmlFor="contact-email">Your email</label>
          <input
            {...fieldProps("email")}
            type="email"
            autoComplete="email"
            inputMode="email"
            onChange={(event) => {
              update("email", event.target.value);
            }}
          />
          {errors.email && touched.email ? (
            <p className="cform__error" id="contact-email-error">
              {errors.email}
            </p>
          ) : null}
        </div>
      </div>
      <div className="cform__field">
        <label htmlFor="contact-message">What are you building?</label>
        <textarea
          {...fieldProps("message")}
          rows={5}
          onChange={(event) => {
            update("message", event.target.value);
          }}
        />
        {errors.message && touched.message ? (
          <p className="cform__error" id="contact-message-error">
            {errors.message}
          </p>
        ) : null}
      </div>
      <div className="cform__foot">
        <button type="submit" className="btn btn--solid" data-cursor="open" data-cursor-label="SEND">
          SEND MESSAGE →
        </button>
        <p className={`cform__status is-${status}`} role="status" aria-live="polite">
          {status === "sent"
            ? `Your mail app should open with the message ready. If it didn't, write to ${to}.`
            : status === "error"
              ? "A few fields need attention."
              : "Opens your mail app with everything filled in."}
        </p>
      </div>
    </form>
  );
}
