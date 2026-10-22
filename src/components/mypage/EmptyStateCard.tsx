import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";

interface EmptyStateCardProps {
  message: string;
  actionHref?: string;
  actionLabel?: string;
}

export function EmptyStateCard({ message, actionHref, actionLabel }: EmptyStateCardProps) {
  return (
    <Card>
      <CardContent className="py-10 text-center text-sm text-muted-foreground">
        {message}
        {actionHref && actionLabel && (
          <>
            {" "}
            <Link href={actionHref} className="text-primary underline underline-offset-2">
              {actionLabel}
            </Link>
          </>
        )}
      </CardContent>
    </Card>
  );
}
