"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckIcon, LoaderIcon } from "lucide-react";
import { site, isPlaceholder } from "@/config/site";
import { cs } from "@/content/cs";
import {
  ACCOUNTING_PROGRAM_OPTIONS,
  INVOICE_VOLUMES,
  INVOICE_VOLUME_LABELS,
  contactSchema,
  type ContactFormData,
  type ContactFormInput,
} from "@/lib/contactSchema";
import { CONTACT_FIRST_FIELD_ID } from "@/lib/navigate";
import { cn } from "@/lib/utils";
import { sendContact } from "@/app/actions/contact";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Placeholder } from "@/components/motifs/Placeholder";

/**
 * Kontaktní formulář (brief, část 8). Validace na klientu i serveru stejným
 * Zod schématem, chyby přes `aria-describedby`, fokus po chybě na první
 * chybné pole. Ukazatel „Vyplněno 3/7“ počítá jen povinná pole.
 */

type Status = "idle" | "success" | "error";
type ErrorKind = "invalid" | "too-fast" | "server";

const REQUIRED_TOTAL = 7;
const EMAIL_SHAPE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_DIGITS = /^\d{9,15}$/;

const defaults: ContactFormInput = {
  name: "",
  company: "",
  email: "",
  phone: "",
  invoiceVolume: undefined as unknown as ContactFormInput["invoiceVolume"],
  program: undefined as unknown as ContactFormInput["program"],
  programOther: "",
  message: "",
  consent: false,
  startedAt: 0,
};

export function ContactForm() {
  const { form } = cs.contact;
  const [status, setStatus] = useState<Status>("idle");
  const [errorKind, setErrorKind] = useState<ErrorKind | null>(null);
  const successRef = useRef<HTMLHeadingElement>(null);

  const {
    register,
    control,
    handleSubmit,
    setValue,
    setError,
    reset,
    setFocus,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormInput, unknown, ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: defaults,
    mode: "onTouched",
    shouldFocusError: true,
  });

  // Čas zobrazení formuláře pro kontrolu minimální doby vyplnění.
  useEffect(() => {
    setValue("startedAt", Date.now());
  }, [setValue, status]);

  useEffect(() => {
    if (status === "success") successRef.current?.focus();
  }, [status]);

  const values = useWatch({ control });
  const filled = [
    (values.name ?? "").trim().length >= 2,
    (values.company ?? "").trim().length >= 2,
    EMAIL_SHAPE.test((values.email ?? "").trim()),
    PHONE_DIGITS.test((values.phone ?? "").replace(/\D/g, "")),
    Boolean(values.invoiceVolume),
    Boolean(values.program) && (values.program !== "Jiný" || (values.programOther ?? "").trim().length >= 2),
    values.consent === true,
  ].filter(Boolean).length;
  const messageLength = (values.message ?? "").length;

  const onSubmit = async (data: ContactFormData, event?: React.BaseSyntheticEvent) => {
    setErrorKind(null);
    // Honeypot není součástí schématu, čte se přímo z odeslaného formuláře.
    const formElement = event?.target instanceof HTMLFormElement ? event.target : null;
    const website = formElement ? String(new FormData(formElement).get("website") ?? "") : "";
    const result = await sendContact({ ...data, website });
    if (result.ok) {
      reset(defaults);
      setStatus("success");
      return;
    }
    setStatus("error");
    setErrorKind(result.error);
    if (result.error === "invalid") {
      const entries = Object.entries(result.fieldErrors) as [keyof ContactFormInput, string][];
      entries.forEach(([field, message]) => setError(field, { type: "server", message }));
      if (entries[0]) setFocus(entries[0][0]);
    }
  };

  if (status === "success") {
    return (
      <div className="flex min-h-[28rem] flex-col items-start justify-center gap-4">
        <span className="inline-flex size-11 items-center justify-center rounded-sm bg-accent text-sheet">
          <CheckIcon aria-hidden="true" strokeWidth={2.25} className="size-6" />
        </span>
        <h3 ref={successRef} tabIndex={-1} className="type-h3">
          {form.success.title}
        </h3>
        <p className="max-w-[40ch] text-ink-muted">{form.success.text}</p>
        <Button variant="outline" onClick={() => setStatus("idle")}>
          {form.success.again}
        </Button>
      </div>
    );
  }

  const errorText =
    errorKind === "invalid" ? form.errors.invalid : errorKind === "too-fast" ? form.errors.tooFast : form.errors.server;

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate aria-describedby="contact-progress">
      <div className="mb-7 flex items-center justify-between gap-4">
        <h3 className="type-label text-ink">{form.title}</h3>
        <p id="contact-progress" className="flex items-center gap-3 font-mono text-[0.78rem] text-ink-muted">
          <span aria-hidden="true" className="flex gap-1">
            {Array.from({ length: REQUIRED_TOTAL }, (_, index) => (
              <span
                key={index}
                className={cn("h-[3px] w-3 transition-colors duration-200", index < filled ? "bg-accent" : "bg-field-border/50")}
              />
            ))}
          </span>
          {form.progress(filled, REQUIRED_TOTAL)}
        </p>
      </div>

      {status === "error" && errorKind ? (
        <div role="alert" className="mb-6 rounded-sm border border-error bg-sheet px-4 py-3 text-[0.92rem] text-ink">
          <p className="font-semibold text-error">{form.errors.title}</p>
          <p className="mt-1">
            {errorText}
            {errorKind === "server" ? (
              <>
                {" "}
                {isPlaceholder(site.email) ? (
                  <Placeholder>{site.email}</Placeholder>
                ) : (
                  <a className="link" href={`mailto:${site.email}`}>
                    {site.email}
                  </a>
                )}
                .
              </>
            ) : null}
          </p>
        </div>
      ) : null}

      <div className="grid gap-6 sm:grid-cols-2">
        <Field id={CONTACT_FIRST_FIELD_ID} label={form.name} required error={errors.name?.message}>
          <Input
            id={CONTACT_FIRST_FIELD_ID}
            autoComplete="name"
            maxLength={100}
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? `${CONTACT_FIRST_FIELD_ID}-error` : undefined}
            {...register("name")}
          />
        </Field>
        <Field id="contact-company" label={form.company} required error={errors.company?.message}>
          <Input
            id="contact-company"
            autoComplete="organization"
            maxLength={150}
            aria-invalid={Boolean(errors.company)}
            aria-describedby={errors.company ? "contact-company-error" : undefined}
            {...register("company")}
          />
        </Field>
        <Field id="contact-email" label={form.email} required error={errors.email?.message}>
          <Input
            id="contact-email"
            type="email"
            autoComplete="email"
            inputMode="email"
            maxLength={254}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? "contact-email-error" : undefined}
            {...register("email")}
          />
        </Field>
        <Field id="contact-phone" label={form.phone} required error={errors.phone?.message}>
          <Input
            id="contact-phone"
            type="tel"
            autoComplete="tel"
            inputMode="tel"
            maxLength={30}
            aria-invalid={Boolean(errors.phone)}
            aria-describedby={errors.phone ? "contact-phone-error" : undefined}
            {...register("phone")}
          />
        </Field>
      </div>

      <ChipGroup
        name="invoiceVolume"
        legend={form.invoiceVolume}
        error={errors.invoiceVolume?.message}
        options={INVOICE_VOLUMES.map((value) => ({ value, label: INVOICE_VOLUME_LABELS[value] }))}
        register={register}
      />

      <ChipGroup
        name="program"
        legend={form.program}
        error={errors.program?.message}
        options={ACCOUNTING_PROGRAM_OPTIONS.map((value) => ({ value, label: value }))}
        register={register}
      />

      {values.program === "Jiný" ? (
        <div className="mt-4 sm:max-w-[50%]">
          <Field id="contact-program-other" label={form.programOther} required error={errors.programOther?.message}>
            <Input
              id="contact-program-other"
              maxLength={100}
              aria-invalid={Boolean(errors.programOther)}
              aria-describedby={errors.programOther ? "contact-program-other-error" : undefined}
              {...register("programOther")}
            />
          </Field>
        </div>
      ) : null}

      <div className="mt-6">
        <Field
          id="contact-message"
          label={form.message}
          hint={form.messageHint}
          counter={form.messageCounter(messageLength)}
          error={errors.message?.message}
        >
          <Textarea
            id="contact-message"
            rows={4}
            maxLength={2000}
            aria-invalid={Boolean(errors.message)}
            aria-describedby={cn("contact-message-hint", errors.message && "contact-message-error")}
            {...register("message")}
          />
        </Field>
      </div>

      {/* Honeypot: lidé ho nevidí ani do něj netabují, boti ho vyplní. */}
      <div aria-hidden="true" className="visually-hidden">
        <label htmlFor="contact-website">{form.honeypot}</label>
        <input id="contact-website" name="website" type="text" tabIndex={-1} autoComplete="off" defaultValue="" />
      </div>

      <div className="mt-6">
        <div className="flex items-start gap-3">
          <Controller
            control={control}
            name="consent"
            render={({ field }) => (
              <Checkbox
                id="contact-consent"
                ref={field.ref}
                checked={field.value === true}
                onCheckedChange={(checked) => field.onChange(checked === true)}
                onBlur={field.onBlur}
                aria-invalid={Boolean(errors.consent)}
                aria-describedby={errors.consent ? "contact-consent-error" : undefined}
                className="mt-0.5"
              />
            )}
          />
          <label htmlFor="contact-consent" className="text-[0.92rem] leading-snug">
            {form.consent}{" "}
            <Link href="/ochrana-osobnich-udaju" className="link">
              {form.consentLink}
            </Link>
            <span className="ml-1 font-mono text-[0.7rem] text-ink-muted">({form.required})</span>
          </label>
        </div>
        {errors.consent?.message ? (
          <p id="contact-consent-error" className="mt-2 text-[0.85rem] text-error">
            {errors.consent.message}
          </p>
        ) : null}
      </div>

      <div className="mt-8 flex flex-wrap items-center gap-4">
        <Button type="submit" size="lg" disabled={isSubmitting} className="min-w-[13rem]">
          {isSubmitting ? (
            <>
              <LoaderIcon aria-hidden="true" className="animate-spin motion-reduce:animate-none" />
              {form.sending}
            </>
          ) : (
            form.submit
          )}
        </Button>
        <span aria-live="polite" className="visually-hidden">
          {isSubmitting ? form.sending : ""}
        </span>
      </div>
    </form>
  );
}

function Field({
  id,
  label,
  required,
  hint,
  counter,
  error,
  children,
}: {
  id: string;
  label: string;
  required?: boolean;
  hint?: string;
  counter?: string;
  error?: string;
  children: React.ReactNode;
}) {
  const { form } = cs.contact;
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="flex items-baseline justify-between gap-3 text-[0.95rem] font-semibold">
        <span>
          {label}{" "}
          <span className="font-mono text-[0.7rem] font-normal text-ink-muted">
            ({required ? form.required : form.optional})
          </span>
        </span>
        {counter ? <span className="font-mono text-[0.7rem] font-normal text-ink-muted tabular">{counter}</span> : null}
      </label>
      {children}
      {hint ? (
        <p id={`${id}-hint`} className="text-[0.82rem] text-ink-muted">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={`${id}-error`} className="text-[0.85rem] text-error">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function ChipGroup({
  name,
  legend,
  options,
  error,
  register,
}: {
  name: "invoiceVolume" | "program";
  legend: string;
  options: { value: string; label: string }[];
  error?: string;
  register: ReturnType<typeof useForm<ContactFormInput, unknown, ContactFormData>>["register"];
}) {
  const { form } = cs.contact;
  const errorId = `contact-${name}-error`;
  return (
    <fieldset className="mt-7">
      <legend id={`contact-${name}-legend`} className="mb-3 text-[0.95rem] font-semibold">
        {legend} <span className="font-mono text-[0.7rem] font-normal text-ink-muted">({form.required})</span>
      </legend>
      <div
        role="radiogroup"
        aria-labelledby={`contact-${name}-legend`}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        className="flex flex-wrap gap-2"
      >
        {options.map((option) => (
          <label key={option.value} className="relative">
            <input
              type="radio"
              value={option.value}
              className="peer visually-hidden"
              {...register(name)}
            />
            <span
              className={cn(
                "inline-flex h-10 cursor-pointer items-center rounded-sm border border-field-border bg-sheet px-3.5 text-[0.92rem] font-semibold text-ink transition-colors select-none hover:border-ink",
                "peer-checked:border-accent peer-checked:bg-accent peer-checked:text-sheet",
                "peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent",
                error && "border-error",
              )}
            >
              {option.label}
            </span>
          </label>
        ))}
      </div>
      {error ? (
        <p id={errorId} className="mt-2 text-[0.85rem] text-error">
          {error}
        </p>
      ) : null}
    </fieldset>
  );
}
