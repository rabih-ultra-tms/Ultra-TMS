import * as React from "react";
import type { FieldPath, FieldValues, FormProviderProps } from "react-hook-form";
import {
  Controller,
  FormProvider,
  type ControllerProps,
  type UseFormReturn,
  useFormContext,
} from "react-hook-form";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";

type FormFieldContextValue = {
  name: string;
};

const FormFieldContext = React.createContext<FormFieldContextValue | undefined>(undefined);

const useFormField = () => {
  const fieldContext = React.useContext(FormFieldContext);
  const formContext = useFormContext();

  if (!fieldContext) {
    throw new Error("useFormField must be used within a FormField");
  }

  const fieldState = formContext.getFieldState(fieldContext.name, formContext.formState);

  return {
    name: fieldContext.name,
    ...fieldState,
  };
};

const Form = <
  TFieldValues extends FieldValues = FieldValues,
  TContext = unknown,
  TTransformedValues extends FieldValues = TFieldValues
>(
  props: FormProviderProps<TFieldValues, TContext, TTransformedValues>
) => {
  const { children, ...rest } = props;
  return <FormProvider {...rest}>{children}</FormProvider>;
};

const FormField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  name,
  ...props
}: ControllerProps<TFieldValues, TName>) => {
  return (
    <FormFieldContext.Provider value={{ name: name as string }}>
      <Controller name={name} {...props} />
    </FormFieldContext.Provider>
  );
};

const FormItem = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("space-y-1.5", className)} {...props} />
  )
);
FormItem.displayName = "FormItem";

const FormLabel = React.forwardRef<
  HTMLLabelElement,
  React.LabelHTMLAttributes<HTMLLabelElement>
>(({ className, ...props }, ref) => (
  <label ref={ref} className={cn("text-sm font-medium", className)} {...props} />
));
FormLabel.displayName = "FormLabel";

const FormControl = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { asChild?: boolean }
>(({ className, asChild, ...props }, ref) => {
  const Comp = asChild ? Slot : "div";
  const { error } = useFormField();
  return (
    <Comp
      ref={ref}
      className={cn(className)}
      aria-invalid={Boolean(error)}
      {...props}
    />
  );
});
FormControl.displayName = "FormControl";

const FormDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />
));
FormDescription.displayName = "FormDescription";

const FormMessage = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, children, ...props }, ref) => {
  const { error } = useFormField();
  const body = error ? String(error?.message) : children;
  if (!body) return null;
  return (
    <p 
      ref={ref} 
      className={cn("text-xs font-medium text-destructive flex items-center gap-1", className)} 
      {...props}
    >
      <span className="inline-block">⚠</span>
      {body}
    </p>
  );
});
FormMessage.displayName = "FormMessage";

export type FormProps<
  TFieldValues extends FieldValues = FieldValues,
  TContext = unknown,
  TTransformedValues extends FieldValues = TFieldValues
> = UseFormReturn<TFieldValues, TContext, TTransformedValues>;

export { Form, FormItem, FormLabel, FormControl, FormDescription, FormMessage, FormField, useFormField };
