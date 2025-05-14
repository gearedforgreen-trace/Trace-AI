"use client";

import type React from "react";

import { useEffect } from "react";
import {
  DefaultValues,
  FieldValues,
  useForm,
  UseFormReturn,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";

interface EntityFormModalProps<TFormSchema, TEntity> {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  entity: TEntity | null;
  formSchema: z.ZodType<any>;
  defaultValues: DefaultValues<TFormSchema>;
  onSubmit: (data: TEntity) => void;
  renderForm: (form: ReturnType<typeof useForm>) => React.ReactNode;
  submitButtonText?: string;
  cancelButtonText?: string;
  submitButtonClassName?: string;
}

export function EntityFormModal<
  TFormSchema extends Record<string, any>,
  TEntity
>({
  isOpen,
  onClose,
  title,
  entity,
  formSchema,
  defaultValues,
  onSubmit,
  renderForm,
  submitButtonText = "Save",
  cancelButtonText = "Cancel",
  submitButtonClassName = "bg-green-600 hover:bg-green-700",
}: EntityFormModalProps<TFormSchema, TEntity>) {
  const form = useForm<TFormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  useEffect(() => {
    if (entity) {
      // Cast entity to the form schema type and reset the form
      form.reset(entity as unknown as TFormSchema);
    } else {
      form.reset(defaultValues as TFormSchema);
    }
  }, [entity, form, defaultValues]);

  const handleSubmit = (data: TFormSchema) => {
    onSubmit(data as unknown as TEntity);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            {renderForm(form as unknown as UseFormReturn<FieldValues>)}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                {cancelButtonText}
              </Button>
              <Button type="submit" className={submitButtonClassName}>
                {submitButtonText}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
