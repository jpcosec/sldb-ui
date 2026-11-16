import type { ReactNode } from "react";

export function WorkspaceShell({ sidebar, main }: { sidebar: ReactNode; main: ReactNode }) {
  return (
    <div className="h-screen w-screen overflow-hidden bg-[radial-gradient(circle_at_top,rgba(107,91,255,0.12),transparent_28%),linear-gradient(180deg,rgba(255,255,255,0.02),rgba(255,255,255,0))] text-foreground">
      <div className="grid h-full lg:grid-cols-[340px_minmax(0,1fr)]">
        {sidebar}
        {main}
      </div>
    </div>
  );
}

export function WorkspaceSidebar({ children }: { children: ReactNode }) {
  return <aside className="overflow-y-auto border-b border-white/8 bg-black/18 backdrop-blur lg:border-r lg:border-b-0">{children}</aside>;
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
    <div className="border-b border-white/8 p-6">
      <p className="text-xs uppercase tracking-[0.18em] text-primary font-semibold mb-2">{eyebrow}</p>
      <h1 className="mb-2 text-[1.75rem] font-heading font-semibold leading-tight">{title}</h1>
      <p className="text-sm text-muted leading-6">{description}</p>
    </div>
  );
}

export function WorkspaceMain({ children }: { children: ReactNode }) {
  return <main className="min-w-0 overflow-hidden bg-black/6">{children}</main>;
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
    <header className="sticky top-0 z-10 border-b border-white/8 bg-background/84 px-5 py-5 backdrop-blur-xl lg:px-8">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="mb-1 text-sm font-medium text-primary">{eyebrow}</p>
            <h2 className="text-3xl font-heading font-semibold leading-tight lg:text-[2.25rem]">{title}</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">{description}</p>
            {metadata ? <div className="mt-2 flex flex-wrap items-center gap-2">{metadata}</div> : null}
          </div>

          {viewSwitcher}
        </div>

        <div className="flex flex-wrap items-center gap-2 rounded-[1.5rem] border border-white/8 bg-surface/50 p-2">
          {contextualActions}
          {primaryActions}
          {notice}
        </div>
      </div>
    </header>
  );
}
