import { useMemo, useState } from "react";

import { Button } from "../../components/Button";
import { Card } from "../../components/Card";
import { Input } from "../../components/Input";
import { Select } from "../../components/Select";
import { formatPhone } from "../../lib/phone";
import type { ManualLeadPayload } from "../../lib/api";

type Props = {
  submitting: boolean;
  onSubmit: (payload: ManualLeadPayload) => Promise<void>;
};

type FormData = ManualLeadPayload;

const requiredFields: Array<keyof Pick<FormData, "tutorName" | "phone" | "entryMethod" | "attendant" | "nextAction" | "nextActionAt">> = [
  "tutorName",
  "phone",
  "entryMethod",
  "attendant",
  "nextAction",
  "nextActionAt"
];

export function LeadForm({ submitting, onSubmit }: Props) {
  const [form, setForm] = useState<FormData>({
    tutorName: "",
    phone: "",
    entryMethod: "whatsapp",
    attendant: "",
    nextAction: "fazer_follow_up",
    nextActionAt: todayYmd(),
    petName: "",
    breed: "",
    estimatedWeight: "",
    serviceInterest: "",
    initialNote: ""
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const phonePreview = useMemo(() => formatPhone(form.phone), [form.phone]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validation = validateForm(form);
    setErrors(validation);
    if (Object.keys(validation).length > 0) return;

    await onSubmit(cleanPayload(form));
    setForm({
      tutorName: "",
      phone: "",
      entryMethod: "whatsapp",
      attendant: "",
      nextAction: "fazer_follow_up",
      nextActionAt: todayYmd(),
      petName: "",
      breed: "",
      estimatedWeight: "",
      serviceInterest: "",
      initialNote: ""
    });
    setErrors({});
  }

  return (
    <Card title="Novo lead manual" subtitle="Cadastro operacional para substituir a planilha no dia a dia.">
      <form className="form-grid" onSubmit={handleSubmit}>
        <Input
          id="lead-tutor-name"
          label="Tutor *"
          value={form.tutorName}
          onChange={(event) => setForm((current) => ({ ...current, tutorName: event.target.value }))}
          error={errors.tutorName}
        />
        <Input
          id="lead-phone"
          label="Telefone *"
          value={form.phone}
          onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
          hint={`Formato: ${phonePreview}`}
          error={errors.phone}
        />
        <Select
          id="lead-entry-method"
          label="Metodo de entrada *"
          value={form.entryMethod}
          onChange={(event) => setForm((current) => ({ ...current, entryMethod: event.target.value }))}
          options={[
            { value: "whatsapp", label: "WhatsApp" },
            { value: "instagram", label: "Instagram" },
            { value: "meta_ads", label: "Meta Ads" },
            { value: "indicacao", label: "Indicacao" },
            { value: "outro", label: "Outro" }
          ]}
          error={errors.entryMethod}
        />
        <Input
          id="lead-attendant"
          label="Atendente *"
          value={form.attendant}
          onChange={(event) => setForm((current) => ({ ...current, attendant: event.target.value }))}
          error={errors.attendant}
        />
        <Select
          id="lead-next-action"
          label="Proxima acao *"
          value={form.nextAction}
          onChange={(event) => setForm((current) => ({ ...current, nextAction: event.target.value }))}
          options={[
            { value: "fazer_follow_up", label: "Fazer follow-up" },
            { value: "retomar_atendimento", label: "Retomar atendimento" },
            { value: "revisar_lideranca", label: "Revisar lideranca" },
            { value: "novo_lead", label: "Responder novo lead" }
          ]}
          error={errors.nextAction}
        />
        <Input
          id="lead-next-action-at"
          label="Data Prox Acao *"
          type="date"
          value={form.nextActionAt}
          onChange={(event) => setForm((current) => ({ ...current, nextActionAt: event.target.value }))}
          error={errors.nextActionAt}
        />

        <Input
          id="lead-pet-name"
          label="Nome do doguinho"
          value={form.petName}
          onChange={(event) => setForm((current) => ({ ...current, petName: event.target.value }))}
        />
        <Input
          id="lead-breed"
          label="Raca"
          value={form.breed}
          onChange={(event) => setForm((current) => ({ ...current, breed: event.target.value }))}
        />
        <Input
          id="lead-estimated-weight"
          label="Peso aproximado"
          value={form.estimatedWeight}
          onChange={(event) => setForm((current) => ({ ...current, estimatedWeight: event.target.value }))}
        />
        <Input
          id="lead-service-interest"
          label="Servico de interesse"
          value={form.serviceInterest}
          onChange={(event) => setForm((current) => ({ ...current, serviceInterest: event.target.value }))}
        />
        <Input
          id="lead-initial-note"
          label="Observacao inicial"
          value={form.initialNote}
          onChange={(event) => setForm((current) => ({ ...current, initialNote: event.target.value }))}
        />

        <div className="form-actions">
          <Button type="submit" disabled={submitting}>
            {submitting ? "Salvando..." : "Salvar lead"}
          </Button>
        </div>
      </form>
    </Card>
  );
}

function validateForm(form: FormData) {
  const errors: Record<string, string> = {};
  for (const field of requiredFields) {
    if (!form[field].trim()) errors[field] = "Campo obrigatorio";
  }
  if (form.nextActionAt && !/^\d{4}-\d{2}-\d{2}$/.test(form.nextActionAt)) {
    errors.nextActionAt = "Use formato YYYY-MM-DD";
  }
  return errors;
}

function cleanPayload(form: FormData): ManualLeadPayload {
  return {
    tutorName: form.tutorName.trim(),
    phone: form.phone.trim(),
    entryMethod: form.entryMethod.trim(),
    attendant: form.attendant.trim(),
    nextAction: form.nextAction.trim(),
    nextActionAt: form.nextActionAt.trim(),
    petName: emptyToUndefined(form.petName),
    breed: emptyToUndefined(form.breed),
    estimatedWeight: emptyToUndefined(form.estimatedWeight),
    serviceInterest: emptyToUndefined(form.serviceInterest),
    initialNote: emptyToUndefined(form.initialNote)
  };
}

function emptyToUndefined(value: string | undefined) {
  const cleaned = value?.trim();
  return cleaned ? cleaned : undefined;
}

function todayYmd() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
