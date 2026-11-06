"use client";

import { useActionState } from "react";
import type { MasterState } from "@/lib/actions/admin";
import { Icon } from "@/components/Icon";

const initialState: MasterState = {};

type Field =
  | { name: string; label: string; type: "text" | "date" | "time" | "number"; placeholder?: string }
  | { name: string; label: string; type: "select"; options: { value: string; label: string }[] };

export function MasterForm({
  action,
  actionLabel,
  fields,
}: {
  action: (prev: MasterState, formData: FormData) => Promise<MasterState>;
  actionLabel: string;
  fields: Field[];
}) {
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form
      action={formAction}
      onSubmit={(e) => {
        if ((e.currentTarget as HTMLFormElement).action && state.success) {
          e.currentTarget.reset();
        }
      }}
      className="card p-5"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-2">
          {fields.map((f) => (
            <div key={f.name}>
              <label htmlFor={`mf-${f.name}`} className="label">{f.label}</label>
              {f.type === "select" ? (
                <select id={`mf-${f.name}`} name={f.name} required className="input">
                  <option value="" disabled>Pilih...</option>
                  {f.options.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              ) : (
                <input
                  id={`mf-${f.name}`}
                  name={f.name}
                  type={f.type}
                  required
                  placeholder={("placeholder" in f && f.placeholder) || undefined}
                  className="input"
                />
              )}
            </div>
          ))}
        </div>
        <button type="submit" disabled={pending} className="btn-primary shrink-0">
          <Icon name="add" className="text-xl" />
          {pending ? "Menyimpan..." : actionLabel}
        </button>
      </div>

      {state.error && (
        <p className="mt-3 flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2 text-sm text-red-700">
          <Icon name="error" className="text-lg" /> {state.error}
        </p>
      )}
      {state.success && (
        <p className="mt-3 flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3.5 py-2 text-sm text-emerald-700">
          <Icon name="check_circle" className="text-lg" filled /> {state.success}
        </p>
      )}
    </form>
  );
}