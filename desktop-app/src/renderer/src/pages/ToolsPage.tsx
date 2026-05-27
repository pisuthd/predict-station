import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronRight, Code2, MessageSquare } from 'lucide-react';
import PageWrapper from '../components/common/PageWrapper';

// Tool definitions
const FORM_TOOLS = [
  {
    name: 'get_form_fields',
    description: 'View current form fields. Returns all field definitions including id, type, label, required, placeholder, and options.',
    parameters: {},
    example: '// Returns all current fields\ngetty_form_fields()',
  },
  {
    name: 'modify_form_fields',
    description: 'Add, update, or remove form fields.',
    parameters: {
      action: { type: 'string', enum: ['add', 'update', 'remove'], required: true },
      fieldId: { type: 'string', description: 'Target field ID (required for update/remove)' },
      fields: { type: 'array', description: 'Array of field objects to add' },
      field: { type: 'object', description: 'Single field definition' },
    },
    example: `// Add field
modify_form_fields({
  action: "add",
  fields: [{ type: "text", label: "Name", required: true }]
})

// Update field
modify_form_fields({
  action: "update",
  fieldId: "123",
  field: { label: "Updated Name" }
})

// Remove field
modify_form_fields({
  action: "remove",
  fieldId: "123"
})`,
  },
  {
    name: 'reset_form_fields',
    description: 'Clear all form fields. Use when user wants to create a new form from scratch.',
    parameters: {},
    example: '// Clear all fields\nreset_form_fields()',
  },
];

// System prompts
const SYSTEM_PROMPTS = {
  chat: `You are an AI assistant. No tools are currently available.
For form building assistance, use the Form Assistant on the New Form page.`,
  formAssistant: `You are a FORM BUILDER assistant. Your ONLY job is to help users design form fields.

CRITICAL LIMITATIONS:
- You cannot create websites, write code, or do anything outside form design
- You MUST use the provided tools to make changes - do not suggest manual actions
- Only respond with form field related questions

Tools:
- get_form_fields: View current form fields
- modify_form_fields: Add/update/remove form fields
- reset_form_fields: Clear all fields

Available types: text, email, tel, url, number, textarea, select, checkbox, rating, date.
Select fields need options array.

If user wants a new/different form, use reset_form_fields first to clear all fields.`,
};

interface AccordionItemProps {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

function AccordionItem({ title, defaultOpen = false, children }: AccordionItemProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border border-[var(--color-border-default)] rounded-lg overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 bg-[var(--color-bg-elevated)] hover:bg-[var(--color-bg-surface)] transition-colors text-left"
      >
        <span className="font-medium text-[var(--color-text-primary)]">{title}</span>
        {isOpen ? (
          <ChevronDown size={18} className="text-[var(--color-text-muted)]" />
        ) : (
          <ChevronRight size={18} className="text-[var(--color-text-muted)]" />
        )}
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-4 bg-[var(--color-bg-card)]">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ToolItem({ tool }: { tool: typeof FORM_TOOLS[0] }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-[var(--color-border-default)] rounded-lg overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 bg-[var(--color-bg-elevated)] hover:bg-[var(--color-bg-surface)] transition-colors text-left"
      >
        <span className="font-mono text-sm font-medium text-accent-primary">{tool.name}</span>
        {isOpen ? (
          <ChevronDown size={18} className="text-[var(--color-text-muted)]" />
        ) : (
          <ChevronRight size={18} className="text-[var(--color-text-muted)]" />
        )}
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-4 bg-[var(--color-bg-card)] space-y-4">
              {/* Description */}
              <div>
                <h4 className="text-xs font-semibold text-[var(--color-text-muted)] uppercase mb-1">Description</h4>
                <p className="text-sm text-[var(--color-text-secondary)]">{tool.description}</p>
              </div>

              {/* Parameters */}
              <div>
                <h4 className="text-xs font-semibold text-[var(--color-text-muted)] uppercase mb-1">Parameters</h4>
                {Object.keys(tool.parameters).length === 0 ? (
                  <p className="text-sm text-[var(--color-text-muted)] italic">No parameters</p>
                ) : (
                  <div className="space-y-2">
                    {Object.entries(tool.parameters).map(([key, param]: [string, any]) => (
                      <div key={key} className="flex items-start gap-2 text-sm">
                        <code className="px-1.5 py-0.5 bg-[var(--color-bg-elevated)] rounded text-accent-primary text-xs">
                          {key}
                        </code>
                        <span className="text-[var(--color-text-secondary)]">
                          <span className="text-[var(--color-text-muted)]">{param.type}</span>
                          {param.enum && (
                            <span className="ml-1 text-xs">enum: [{param.enum.join(', ')}]</span>
                          )}
                          {param.description && (
                            <span className="ml-2 text-[var(--color-text-muted)]">- {param.description}</span>
                          )}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ToolsPage() {
  return (
    <PageWrapper title="Tools">
      <div className="max-w-2xl space-y-8">
        {/* Form Assistant Tools */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Code2 size={20} className="text-accent-primary" />
            <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">Form Assistant Tools</h2>
          </div>
          <div className="space-y-3">
            {FORM_TOOLS.map((tool) => (
              <ToolItem key={tool.name} tool={tool} />
            ))}
          </div>
        </section>

        {/* System Prompts */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <MessageSquare size={20} className="text-accent-primary" />
            <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">System Prompts</h2>
          </div>
          <div className="space-y-4">
            <AccordionItem title="Chat Page" defaultOpen={false}>
              <div className="space-y-2">
                <p className="text-xs text-[var(--color-text-muted)] uppercase font-semibold">Prompt</p>
                <pre className="text-sm bg-[var(--color-bg-elevated)] p-3 rounded-lg whitespace-pre-wrap text-[var(--color-text-secondary)]">
                  {SYSTEM_PROMPTS.chat}
                </pre>
              </div>
            </AccordionItem>
            <AccordionItem title="Form Assistant" defaultOpen={false}>
              <div className="space-y-2">
                <p className="text-xs text-[var(--color-text-muted)] uppercase font-semibold">Prompt</p>
                <pre className="text-sm bg-[var(--color-bg-elevated)] p-3 rounded-lg whitespace-pre-wrap text-[var(--color-text-secondary)]">
                  {SYSTEM_PROMPTS.formAssistant}
                </pre>
              </div>
            </AccordionItem>
          </div>
        </section>
      </div>
    </PageWrapper>
  );
}