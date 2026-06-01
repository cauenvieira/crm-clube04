import { useState } from "react";

import { Button } from "../../components/Button";
import { Card } from "../../components/Card";
import { Input } from "../../components/Input";

type Props = {
  currentApiKey: string;
  onSave: (value: string) => void;
  onClear: () => void;
};

export function ApiKeySettings({ currentApiKey, onSave, onClear }: Props) {
  const [value, setValue] = useState(currentApiKey);
  const [message, setMessage] = useState("");

  return (
    <Card title="API key interna" subtitle="Armazenada localmente no navegador (localStorage).">
      <div className="stack-gap">
        <Input
          id="settings-api-key"
          label="x-crm-api-key"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="Cole a API key local"
        />
        <div className="inline-actions">
          <Button
            type="button"
            onClick={() => {
              onSave(value);
              setMessage("API key salva com sucesso.");
            }}
          >
            Salvar
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              setValue("");
              onClear();
              setMessage("API key removida.");
            }}
          >
            Limpar
          </Button>
        </div>
        {message ? <p className="feedback-inline">{message}</p> : null}
      </div>
    </Card>
  );
}
