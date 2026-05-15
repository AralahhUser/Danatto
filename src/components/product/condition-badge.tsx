import { conditionLabels } from "@/lib/format";
import type { GarmentCondition } from "@/lib/types";

export function ConditionBadge({ condition }: { condition: GarmentCondition }) {
  return (
    <span className="inline-flex items-center rounded-full border border-olive/20 bg-white px-3 py-1 text-xs font-semibold text-olive">
      {conditionLabels[condition]}
    </span>
  );
}
