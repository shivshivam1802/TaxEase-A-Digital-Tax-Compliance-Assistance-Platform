import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function AmountField({
  id,
  label,
  hint,
  value,
  error,
  onChange,
}: {
  id: string;
  label: string;
  hint?: string;
  value: string;
  error?: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
      <Input
        id={id}
        inputMode="numeric"
        value={value}
        onValueChange={onChange}
        placeholder="0"
        aria-invalid={Boolean(error)}
        className="h-11 px-3"
      />
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}
