type Props = {
  message?: string;
};

export function LoadingState({ message = "Carregando..." }: Props) {
  return <div className="loading-state">{message}</div>;
}
