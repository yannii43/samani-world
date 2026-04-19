import type { ProductVariant } from '@/lib/types';
import { getOptionById, getOptionValueById } from '@/lib/options-data';
import { Badge } from '@/components/ui/badge';

export default function VariantSelector({
  productId,
  variants,
  selectedVariantId,
  onSelectVariant,
}: {
  productId: string;
  variants: ProductVariant[];
  selectedVariantId: string;
  onSelectVariant: (variantId: string) => void;
}) {
  if (!variants?.length) return null;

  const labelFor = (v: ProductVariant) => {
    if (!v.optionValues?.length) return 'Standard';
    return v.optionValues
      .map((ov) => {
        const opt = getOptionById(ov.optionId);
        const val = getOptionValueById(ov.valueId);
        const optName = opt?.name ?? ov.optionId;
        const valName = val?.displayValue ?? val?.value ?? ov.valueId;
        return `${optName}: ${valName}`;
      })
      .join(' • ');
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold">Choisir une variante</p>
        <Badge variant="secondary" className="text-xs">
          {productId}
        </Badge>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {variants
          .filter((v) => v.isActive)
          .map((v) => {
            const isSelected = v.id === selectedVariantId;
            const out = (v.stock ?? 0) <= 0;

            return (
              <button
                key={v.id}
                type="button"
                onClick={() => !out && onSelectVariant(v.id)}
                disabled={out}
                className={[
                  'text-left rounded-lg border px-3 py-2 transition',
                  isSelected ? 'border-black bg-black text-white' : 'border-gray-200 bg-white',
                  out ? 'opacity-50 cursor-not-allowed' : 'hover:border-black',
                ].join(' ')}
              >
                <div className="text-sm font-medium">{labelFor(v)}</div>
                <div className={['text-xs mt-1', isSelected ? 'text-white/80' : 'text-gray-600'].join(' ')}>
                  Stock: {v.stock ?? 0}
                </div>
              </button>
            );
          })}
      </div>
    </div>
  );
}
