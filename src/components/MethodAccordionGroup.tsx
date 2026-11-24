import { useId, useState, type ReactNode } from "react";
import { CollapsibleBlock } from "./CollapsibleBlock";

type Item = { id: string; title: string; subtitle?: string; content: ReactNode };

export function MethodAccordionGroup({ items }: { items: Item[] }) {
  const [openId, setOpenId] = useState<string | null>(items[0]?.id ?? null);
  const [expandAll, setExpandAll] = useState(false);
  const groupId = useId();

  if (expandAll) {
    return (
      <div className="methods-arch">
        <div className="panel-actions">
          <button type="button" className="btn ghost sm" aria-pressed="true" onClick={() => setExpandAll(false)}>
            Contraer todo
          </button>
        </div>
        {items.map((item) => (
          <CollapsibleBlock key={item.id} title={item.title} subtitle={item.subtitle} defaultOpen>
            {item.content}
          </CollapsibleBlock>
        ))}
      </div>
    );
  }

  return (
    <div className="methods-arch" role="group" aria-labelledby={groupId}>
      <div className="panel-actions">
        <button type="button" className="btn ghost sm" onClick={() => setExpandAll(true)}>
          Expandir todo
        </button>
      </div>
      {items.map((item) => (
        <CollapsibleBlock
          key={item.id}
          title={item.title}
          subtitle={item.subtitle}
          defaultOpen={openId === item.id}
          onToggle={(next) => {
            if (next) setOpenId(item.id);
            else if (openId === item.id) setOpenId(null);
          }}
        >
          {item.content}
        </CollapsibleBlock>
      ))}
    </div>
  );
}