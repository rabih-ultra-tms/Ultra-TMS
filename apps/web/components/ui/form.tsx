import * as React from "react";
import type { FieldValues, FormProviderProps } from "react-hook-form";
import {
  Controller,
  FormProvider,
  type ControllerProps,
  type UseFormReturn,
} from "react-hook-form";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";

const Form = <TFieldValues extends FieldValues = FieldValues, TContext = unknown>(
  props: FormProviderProps<TFieldValues, TContext>
) => {
  const { children, ...rest } = props;
  return <FormProvider {...rest}>{children}</FormProvider>;
};

const FormField = <TFieldValues extends FieldValues = FieldValues>(
  props: ControllerProps<TFieldValues>
) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return <Controller {...(props as any)} />;
};

const FormItem = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("space-y-1", className)} {...props} />
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
  return <Comp ref={ref} className={cn(className)} {...props} />;
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
  const body = children ? children : null;
  if (!body) return null;
  return (
    <p ref={ref} className={cn("text-sm font-medium text-destructive", className)} {...props}>
      {body}
    </p>
  );
});
FormMessage.displayName = "FormMessage";

export type FormProps<TFieldValues extends FieldValues = FieldValues, TContext = unknown> =
  UseFormReturn<TFieldValues, TContext>;

export { Form, FormItem, FormLabel, FormControl, FormDescription, FormMessage, FormField };
