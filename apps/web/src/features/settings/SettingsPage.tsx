import { ApiKeySettings } from "./ApiKeySettings";

type Props = {
  apiKey: string;
  onSaveApiKey: (value: string) => void;
  onClearApiKey: () => void;
};

export function SettingsPage({ apiKey, onSaveApiKey, onClearApiKey }: Props) {
  return (
    <div className="page-grid">
      <ApiKeySettings currentApiKey={apiKey} onSave={onSaveApiKey} onClear={onClearApiKey} />
    </div>
  );
}
