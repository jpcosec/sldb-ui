import type { ReactNode } from "react";

export function WorkspaceShell({ sidebar, main }: { sidebar: ReactNode; main: ReactNode }) {
  return (
    <div className="h-screen w-screen overflow-hidden bg-background text-foreground">
      <div className="grid h-full lg:grid-cols-[300px_minmax(0,1fr)]">
        {sidebar}
        {main}
      </div>
    </div>
  );
}

export function WorkspaceSidebar({ children }: { children: ReactNode }) {
  return <aside className="border-b border-border bg-surface lg:border-r lg:border-b-0 overflow-y-auto">{children}</aside>;
}

export function WorkspaceSidebarHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="p-5 border-b border-border">
      <p className="text-xs uppercase tracking-[0.18em] text-primary font-semibold mb-2">{eyebrow}</p>
      <h1 className="text-2xl font-heading font-semibold mb-2">{title}</h1>
      <p className="text-sm text-muted leading-6">{description}</p>
    </div>
  );
}

export function WorkspaceMain({ children }: { children: ReactNode }) {
  return <main className="min-w-0 overflow-hidden">{children}</main>;
}

export function WorkspaceTopToolbar({
  eyebrow,
  title,
  description,
  metadata,
  viewSwitcher,
  contextualActions,
  primaryActions,
  notice,
}: {
  eyebrow: string;
  title: string;
  description: string;
  metadata?: ReactNode;
  viewSwitcher: ReactNode;
  contextualActions?: ReactNode;
  primaryActions: ReactNode;
  notice?: ReactNode;
}) {
  return (
    <header className="sticky top-0 z-10 border-b border-border bg-background/92 px-6 py-5 backdrop-blur lg:px-8">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="mb-1 text-sm font-medium text-primary">{eyebrow}</p>
            <h2 className="text-3xl font-heading font-semibold">{title}</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">{description}</p>
            {metadata ? <div className="mt-2 flex flex-wrap items-center gap-2">{metadata}</div> : null}
          </div>

          {viewSwitcher}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {contextualActions}
          {primaryActions}
          {notice}
        </div>
      </div>
    </header>
  );
}
