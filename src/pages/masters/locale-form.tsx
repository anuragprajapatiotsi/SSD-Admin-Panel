import { PageHeader } from "@/components/common/page-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldContent, FieldDescription, FieldError, FieldGroup, FieldLabel, FieldTitle } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Save } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { DEFAULT_LOCALE_VALUES, localeSchema, type LocaleFormValues } from "./locale-schema";

export function LocaleForm({ defaultValues = DEFAULT_LOCALE_VALUES, mode = "create", onCancel, onSubmit }: {
  defaultValues?: LocaleFormValues;
  mode?: "create" | "edit";
  onCancel: () => void;
  onSubmit: (values: LocaleFormValues) => Promise<void>;
}) {
  const { control, formState: { errors, isSubmitting }, handleSubmit, register } = useForm<LocaleFormValues>({
    defaultValues,
    mode: "onSubmit",
    reValidateMode: "onChange",
    resolver: zodResolver(localeSchema),
  });

  return (
    <form className="mx-auto w-full max-w-xl" noValidate onSubmit={handleSubmit(onSubmit)}>
      <Card>
        <CardHeader className="sr-only">
          <CardTitle>{mode === "create" ? "Create Locale" : "Edit Locale"}</CardTitle>
          <CardDescription>Locale details and availability settings.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <FieldGroup>
        <Field className="gap-1" data-invalid={Boolean(errors.display_name)}>
          <FieldLabel htmlFor="locale-display-name">Display Name</FieldLabel>
          <Input id="locale-display-name" autoFocus placeholder="English (India)" aria-invalid={Boolean(errors.display_name)} aria-describedby={errors.display_name ? "locale-display-name-error" : undefined} disabled={isSubmitting} {...register("display_name")} />
          <FieldError id="locale-display-name-error">{errors.display_name?.message}</FieldError>
        </Field>

        <Field className="gap-1" data-invalid={Boolean(errors.locale_code)}>
          <FieldLabel htmlFor="locale-code">Locale Code</FieldLabel>
          <Input id="locale-code" placeholder="en-IN" readOnly={mode === "edit"} aria-invalid={Boolean(errors.locale_code)} aria-describedby={errors.locale_code ? "locale-code-error" : "locale-code-description"} disabled={isSubmitting} {...register("locale_code")} />
          <FieldDescription id="locale-code-description">{mode === "edit" ? "Locale code is the unique identifier and cannot be changed." : "Use a standard language-region code."}</FieldDescription>
          <FieldError id="locale-code-error">{errors.locale_code?.message}</FieldError>
        </Field>

        <Field className="gap-1" data-invalid={Boolean(errors.native_name)}>
          <FieldLabel htmlFor="locale-native-name">Native Name</FieldLabel>
          <Input id="locale-native-name" dir="auto" placeholder="हिन्दी (भारत)" aria-invalid={Boolean(errors.native_name)} aria-describedby={errors.native_name ? "locale-native-name-error" : undefined} disabled={isSubmitting} {...register("native_name")} />
          <FieldError id="locale-native-name-error">{errors.native_name?.message}</FieldError>
        </Field>

        <Field className="gap-1" data-invalid={Boolean(errors.sort_order)}>
          <FieldLabel htmlFor="locale-sort-order">Sort Order</FieldLabel>
          <Input id="locale-sort-order" type="number" min={0} step={1} aria-invalid={Boolean(errors.sort_order)} aria-describedby={errors.sort_order ? "locale-sort-order-error" : undefined} disabled={isSubmitting} {...register("sort_order", { valueAsNumber: true })} />
          <FieldError id="locale-sort-order-error">{errors.sort_order?.message}</FieldError>
        </Field>
          </FieldGroup>

          <FieldGroup className="grid gap-3 sm:grid-cols-2">
        <Controller control={control} name="is_active" render={({ field }) => (
          <FieldLabel><Field orientation="horizontal"><Checkbox isDisabled={isSubmitting} isSelected={field.value} onBlur={field.onBlur} onChange={field.onChange} /><FieldContent><FieldTitle>Active locale</FieldTitle><FieldDescription>Make this locale available throughout the application.</FieldDescription></FieldContent></Field></FieldLabel>
        )} />
        <Controller control={control} name="is_default" render={({ field }) => (
          <FieldLabel><Field orientation="horizontal"><Checkbox isDisabled={isSubmitting} isSelected={field.value} onBlur={field.onBlur} onChange={field.onChange} /><FieldContent><FieldTitle>Default locale</FieldTitle><FieldDescription>Use this locale when a user has no saved preference.</FieldDescription></FieldContent></Field></FieldLabel>
        )} />
          </FieldGroup>
        </CardContent>

        <CardFooter className="justify-end gap-2 border-t">
          <Button type="button" variant="outline" isDisabled={isSubmitting} onPress={onCancel}>Cancel</Button>
          <Button type="submit" isDisabled={isSubmitting}>
            {isSubmitting ? <Spinner data-icon="inline-start" aria-hidden="true" /> : <Save data-icon="inline-start" aria-hidden="true" />}
            {isSubmitting ? mode === "create" ? "Creating locale..." : "Saving changes..." : mode === "create" ? "Create Locale" : "Save Changes"}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}

export function LocalePageHeading({ title, description, onBack }: { title: string; description: string; onBack: () => void }) {
  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-3">
      <Button className="w-fit" type="button" variant="outline" onPress={onBack}>
        <ArrowLeft data-icon="inline-start" aria-hidden="true" />
        Back
      </Button>
      <PageHeader>
        <div><h2>{title}</h2><p>{description}</p></div>
      </PageHeader>
    </div>
  );
}
