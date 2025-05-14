"use client";

import { useState } from "react";

interface UseEntityCrudProps<T> {
  initialEntities?: T[];
  onCreateEntity?: (entity: T) => Promise<T>;
  onUpdateEntity?: (id: string, entity: T) => Promise<T>;
  onDeleteEntity?: (id: string) => Promise<void>;
}

export function useEntityCrud<T extends { id?: string }>({
  initialEntities = [],
  onCreateEntity,
  onUpdateEntity,
  onDeleteEntity,
}: UseEntityCrudProps<T>) {
  const [entities, setEntities] = useState<T[]>(initialEntities);
  const [currentEntity, setCurrentEntity] = useState<T | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [entityToDelete, setEntityToDelete] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const openCreateModal = () => {
    setCurrentEntity(null);
    setIsModalOpen(true);
  };

  const openEditModal = (entity: T) => {
    setCurrentEntity(entity);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentEntity(null);
  };

  const openDeleteDialog = (entity: T) => {
    setEntityToDelete(entity);
    setIsDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    setIsDeleteDialogOpen(false);
    setEntityToDelete(null);
  };

  const handleCreate = async (entity: T) => {
    setIsLoading(true);
    try {
      if (onCreateEntity) {
        const newEntity = await onCreateEntity(entity);
        setEntities([...entities, newEntity]);
      } else {
        // Local state only
        const newEntity = {
          ...entity,
          id: (entities.length + 1).toString(),
        };
        setEntities([...entities, newEntity as T]);
      }
      closeModal();
    } catch (error) {
      console.error("Error creating entity:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async (entity: T) => {
    if (!entity.id) return;

    setIsLoading(true);
    try {
      if (onUpdateEntity) {
        const updatedEntity = await onUpdateEntity(entity.id, entity);
        setEntities(
          entities.map((e) => (e.id === entity.id ? updatedEntity : e))
        );
      } else {
        // Local state only
        setEntities(entities.map((e) => (e.id === entity.id ? entity : e)));
      }
      closeModal();
    } catch (error) {
      console.error("Error updating entity:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!entityToDelete?.id) return;

    setIsLoading(true);
    try {
      if (onDeleteEntity) {
        await onDeleteEntity(entityToDelete.id);
      }
      // Update local state regardless
      setEntities(entities.filter((e) => e.id !== entityToDelete.id));
      closeDeleteDialog();
    } catch (error) {
      console.error("Error deleting entity:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = (entity: T) => {
    if (currentEntity) {
      handleUpdate({ ...entity, id: currentEntity.id });
    } else {
      handleCreate(entity);
    }
  };

  return {
    entities,
    setEntities,
    currentEntity,
    isModalOpen,
    isDeleteDialogOpen,
    entityToDelete,
    isLoading,
    openCreateModal,
    openEditModal,
    closeModal,
    openDeleteDialog,
    closeDeleteDialog,
    handleSave,
    handleDelete,
  };
}
