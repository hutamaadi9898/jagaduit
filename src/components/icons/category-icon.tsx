import * as Icons from "lucide-react";

type IconName = keyof typeof Icons;

export function CategoryIcon({
  name,
  className
}: {
  name: string;
  className?: string;
}) {
  const Icon = (Icons[name as IconName] ?? Icons.CircleDashed) as React.ComponentType<{
    className?: string;
  }>;

  return <Icon className={className} />;
}
