import { LoaderCircle } from "lucide-react";
import { useState } from "react";

import { Button, type ButtonProps } from "@/components/ui/button";

type MutationButtonProps = ButtonProps & {
  endpoint: string;
  method: "PATCH" | "DELETE";
  body?: Record<string, unknown>;
  confirmMessage?: string;
  onSuccessRedirect?: string;
};

export function MutationButton({
  endpoint,
  method,
  body,
  confirmMessage,
  children,
  onSuccessRedirect,
  ...props
}: MutationButtonProps) {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    if (confirmMessage && !window.confirm(confirmMessage)) {
      return;
    }

    setLoading(true);
    const response = await fetch(endpoint, {
      method,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
      },
      body: body ? JSON.stringify(body) : undefined
    });

    if (!response.ok) {
      const data = (await response.json().catch(() => null)) as { message?: string } | null;
      window.alert(data?.message ?? "Aksi gagal dijalankan.");
      setLoading(false);
      return;
    }

    if (onSuccessRedirect) {
      window.location.href = onSuccessRedirect;
      return;
    }

    window.location.reload();
  }

  return (
    <Button onClick={handleClick} disabled={loading || props.disabled} {...props}>
      {loading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
      {children}
    </Button>
  );
}
