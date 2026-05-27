import { motion } from 'framer-motion';
import PageWrapper from '../components/common/PageWrapper';
import { Upload } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { FormField, SortableFormFieldEditor, FieldTypeSelector, PublishModal, FormAssistant } from '../components/form';
import { createField } from '../components/form';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

// Default fields - must match store's DEFAULT_FIELDS
const DEFAULT_FIELDS: FormField[] = [
  { id: '1', type: 'text', label: 'Name', placeholder: 'Enter your name', required: true },
  { id: '2', type: 'email', label: 'Email', placeholder: 'Enter your email', required: true },
];

export default function NewFormPage() {
  const [formName, setFormName] = useState('Untitled Form');
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [showFormAssistant, setShowFormAssistant] = useState(true);
  const [fields, setFields] = useState<FormField[]>([...DEFAULT_FIELDS]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load fields from store on mount - store is single source of truth
  useEffect(() => {
    window.api.form.getFields().then((storeFields: any) => {
      if (storeFields && storeFields.length > 0) {
        setFields(storeFields);
      }
      setIsInitialized(true);
    });
  }, []);

  // Update store when fields change
  const updateFields = useCallback((newFields: FormField[]) => {
    setFields(newFields);
    window.api.form.setFields(newFields);
  }, []);

  // Listen for tool results from AI and sync fields
  useEffect(() => {
    if (!isInitialized) return;

    const handleToolResult = (_event: any, data: { name: string; result: string }) => {
      try {
        const parsed = JSON.parse(data.result);
        if ((data.name === 'modify_form_fields' || data.name === 'reset_form_fields') && parsed.success && parsed.allFields) {
          setFields(parsed.allFields);
          console.log('[UI] Synced fields from tool result:', parsed.allFields.length);
        }
      } catch (e) {
        console.error('[UI] Failed to handle tool result:', e);
      }
    };

    if (window.electron?.ipcRenderer?.on) {
      window.electron.ipcRenderer.on('ai:toolResult', handleToolResult);
    }

    return () => {
      if (window.electron?.ipcRenderer?.removeListener) {
        window.electron.ipcRenderer.removeListener('ai:toolResult', handleToolResult);
      }
    };
  }, [isInitialized]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = fields.findIndex((item) => item.id === active.id);
      const newIndex = fields.findIndex((item) => item.id === over.id);
      updateFields(arrayMove(fields, oldIndex, newIndex));
    }
  };

  const addField = (type: FormField['type']) => {
    const newField = createField(type, Date.now().toString());
    updateFields([...fields, newField]);
  };

  const removeField = (id: string) => {
    updateFields(fields.filter((f) => f.id !== id));
  };

  const updateField = (id: string, updates: Partial<FormField>) => {
    updateFields(fields.map((f) => (f.id === id ? { ...f, ...updates } : f)));
  };

  return (
    <>
      <PageWrapper 
        title="Create New Form" 
        action={
          <button
            onClick={() => {
              setShowFormAssistant(false);
              setShowPublishModal(true);
            }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent-primary text-white font-semibold hover:bg-accent-primary-hover transition-colors"
          >
            <Upload size={18} />
            Publish to Walrus
          </button>
        }
      >
        <div className="max-w-3xl">
          {/* Form Name */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <input
              type="text"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              className="w-full text-2xl font-bold bg-transparent border-b-2 border-transparent hover:border-[var(--color-border-default)] focus:border-accent-primary transition-colors outline-none pb-2 text-[var(--color-text-primary)]"
              placeholder="Form name..."
            />
          </motion.div>

          {/* Fields - with DnD context */}
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={fields.map(f => f.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-4 mb-8">
                {fields.map((field, index) => (
                  <motion.div
                    key={field.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <SortableFormFieldEditor
                      field={field}
                      onUpdate={(updates) => updateField(field.id, updates)}
                      onRemove={() => removeField(field.id)}
                      key={field.id}
                    />
                  </motion.div>
                ))}
              </div>
            </SortableContext>
          </DndContext>

          {/* Add Field Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <FieldTypeSelector onAddField={addField} />
          </motion.div>
        </div>
      </PageWrapper>

      {/* Publish Modal */}
      <PublishModal
        isOpen={showPublishModal}
        onClose={() => {
          setShowPublishModal(false);
          setShowFormAssistant(false);
        }}
        formName={formName}
        fields={fields}
      />

      {/* Floating Form Assistant */}
      {showFormAssistant && <FormAssistant />}
    </>
  );
}