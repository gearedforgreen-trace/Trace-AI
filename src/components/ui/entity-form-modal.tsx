"use client"

import type React from "react"

import { useEffect, useRef } from "react"
import { useForm, type UseFormReturn, type FieldValues, type DefaultValues } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import type { z } from "zod"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Form } from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

function FormSkeleton() {
  return (
    <div className="space-y-6">
      {/* Text input skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-10 w-full" />
      </div>

      {/* Another text input skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-10 w-full" />
      </div>

      {/* Textarea skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-24 w-full" />
      </div>

      {/* Select/dropdown skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-10 w-full" />
      </div>

      {/* Checkbox/switch skeleton */}
      <div className="flex items-center space-x-2">
        <Skeleton className="h-4 w-4" />
        <Skeleton className="h-4 w-32" />
      </div>

      {/* Another text input skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-10 w-full" />
      </div>
    </div>
  )
}

interface IEntityFormModalProps<TFormSchema extends FieldValues, TEntity> {
  isOpen: boolean
  onClose: () => void
  title: string
  entity: TEntity | null
  formSchema: z.ZodType<any>
  defaultValues: DefaultValues<TFormSchema>
  onSubmit: (data: TEntity) => void
  renderForm: (form: UseFormReturn<TFormSchema>) => React.ReactNode
  submitButtonText?: string | React.ReactNode
  cancelButtonText?: string
  submitButtonClassName?: string
  loading?: boolean
}

export function EntityFormModal<TFormSchema extends FieldValues, TEntity>({
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
  loading = false,
}: IEntityFormModalProps<TFormSchema, TEntity>) {
  const form = useForm<TFormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues,
  })

  // Use refs to track previous values and submission state
  const prevEntityRef = useRef<TEntity | null>(null)
  const prevOpenRef = useRef<boolean>(false)
  const isSubmittingRef = useRef<boolean>(false)

  // Only reset the form when entity changes or modal opens/closes
  // but not during form submission
  useEffect(() => {
    const entityChanged = entity !== prevEntityRef.current
    const openStateChanged = isOpen !== prevOpenRef.current

    // Only reset if the entity changed or the modal was just opened
    // and we're not in the middle of a submission
    if ((entityChanged || (openStateChanged && isOpen)) && !isSubmittingRef.current) {
      if (entity) {
        // Cast entity to the form schema type and reset the form
        form.reset(entity as unknown as TFormSchema)
      } else {
        form.reset(defaultValues)
      }

      // Update refs
      prevEntityRef.current = entity
    }

    // Always update the open state ref
    prevOpenRef.current = isOpen
  }, [entity, form, defaultValues, isOpen])

  useEffect(() => {
    if (isOpen) {
      form.reset(defaultValues)
    }
  }, [isOpen, form, defaultValues])

  const handleSubmit = async (data: TFormSchema) => {
    // Set submitting flag to prevent form reset during submission
    isSubmittingRef.current = true

    try {
      await onSubmit(data as unknown as TEntity)
      // Only reset the form on successful submission
      // The parent component will close the modal on success
    } catch (error) {
      // Don't reset the form on error
      console.error("Form submission error:", error)
    } finally {
      // Reset submitting flag
      isSubmittingRef.current = false
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[100vh] flex flex-col p-0">
        <DialogHeader className="px-6 py-4 border-b shrink-0">
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {loading ? (
            <FormSkeleton />
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6" id="entity-form">
                {renderForm(form)}
              </form>
            </Form>
          )}
        </div>

        <DialogFooter className="px-6 py-4 border-t shrink-0">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            {cancelButtonText}
          </Button>
          <Button type="submit" form="entity-form" className={submitButtonClassName} disabled={loading}>
            {submitButtonText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
