import { useState, useEffect } from 'react';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Product, ProductVariant } from '@/lib/types';
import { getProductVariants } from '@/lib/products-data-v2';
import { getOptionById, getOptionValueById } from '@/lib/options-data';

interface VariantSelectorProps {
  product: Product;
  selectedVariant: ProductVariant | null;
  onVariantChange: (variant: ProductVariant | null) => void;
}

export default function VariantSelector({
  product,
  selectedVariant,
  onVariantChange,
}: VariantSelectorProps) {
  const variants = getProductVariants(product.id);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  
  // Auto-select single variant without options
  useEffect(() => {
    if (variants.length === 1 && variants[0].optionValues.length === 0 && !selectedVariant) {
      onVariantChange(variants[0]);
    }
  }, [variants, selectedVariant, onVariantChange]);

  // Trouver la variante correspondant aux options sélectionnées
  useEffect(() => {
    const matchingVariant = variants.find((variant) => {
      return variant.optionValues.every((ov) => {
        return selectedOptions[ov.optionId] === ov.valueId;
      });
    });

    onVariantChange(matchingVariant || null);
  }, [selectedOptions, variants, onVariantChange]);

  // Si pas de variantes, retourner null
  if (variants.length === 0) return null;

  // Extraire les options uniques des variantes
  const optionIds = Array.from(
    new Set(
      variants.flatMap((v) => v.optionValues.map((ov) => ov.optionId))
    )
  );

  // Si une seule variante sans options, ne rien afficher
  if (variants.length === 1 && variants[0].optionValues.length === 0) {
    return null;
  }

  const handleOptionChange = (optionId: string, valueId: string) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [optionId]: valueId,
    }));
  };

  // Obtenir les valeurs disponibles pour une option
  const getAvailableValues = (optionId: string): string[] => {
    return Array.from(
      new Set(
        variants
          .filter((v) => v.stock > 0) // Seulement les variantes en stock
          .flatMap((v) =>
            v.optionValues
              .filter((ov) => ov.optionId === optionId)
              .map((ov) => ov.valueId)
          )
      )
    );
  };

  return (
    <div className="space-y-6">
      {optionIds.map((optionId) => {
        const option = getOptionById(optionId);
        if (!option) return null;

        const availableValues = getAvailableValues(optionId);

        if (option.type === 'button') {
          return (
            <div key={optionId}>
              <Label className="text-base font-semibold mb-3 block">
                {option.name}
              </Label>
              <div className="flex flex-wrap gap-2">
                {availableValues.map((valueId) => {
                  const optionValue = getOptionValueById(valueId);
                  if (!optionValue) return null;

                  const isSelected = selectedOptions[optionId] === valueId;

                  return (
                    <Button
                      key={valueId}
                      variant={isSelected ? 'default' : 'outline'}
                      className={`min-w-[60px] ${
                        isSelected
                          ? 'bg-black text-white hover:bg-gray-900'
                          : 'hover:border-black'
                      }`}
                      onClick={() => handleOptionChange(optionId, valueId)}
                    >
                      {optionValue.displayValue || optionValue.value}
                      {isSelected && <Check className="ml-2 h-4 w-4" />}
                    </Button>
                  );
                })}
              </div>
            </div>
          );
        }

        if (option.type === 'color') {
          return (
            <div key={optionId}>
              <Label className="text-base font-semibold mb-3 block">
                {option.name}
                {selectedOptions[optionId] && (
                  <span className="ml-2 text-sm font-normal text-gray-600">
                    ({getOptionValueById(selectedOptions[optionId])?.displayValue})
                  </span>
                )}
              </Label>
              <div className="flex flex-wrap gap-3">
                {availableValues.map((valueId) => {
                  const optionValue = getOptionValueById(valueId);
                  if (!optionValue) return null;

                  const isSelected = selectedOptions[optionId] === valueId;

                  return (
                    <button
                      key={valueId}
                      type="button"
                      className={`relative w-10 h-10 rounded-full border-2 transition-all ${
                        isSelected
                          ? 'border-black scale-110'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                      style={{ backgroundColor: optionValue.colorHex }}
                      onClick={() => handleOptionChange(optionId, valueId)}
                      title={optionValue.displayValue || optionValue.value}
                    >
                      {isSelected && (
                        <Check className="absolute inset-0 m-auto h-5 w-5 text-white drop-shadow-md" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        }

        if (option.type === 'select') {
          return (
            <div key={optionId}>
              <Label className="text-base font-semibold mb-3 block">
                {option.name}
              </Label>
              <Select
                value={selectedOptions[optionId] || ''}
                onValueChange={(value) => handleOptionChange(optionId, value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={`Choisir ${option.name.toLowerCase()}`} />
                </SelectTrigger>
                <SelectContent>
                  {availableValues.map((valueId) => {
                    const optionValue = getOptionValueById(valueId);
                    if (!optionValue) return null;

                    return (
                      <SelectItem key={valueId} value={valueId}>
                        {optionValue.displayValue || optionValue.value}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          );
        }

        return null;
      })}

      {/* Stock indicator */}
      {selectedVariant && (
        <div className="pt-4 border-t">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Disponibilité:</span>
            <span
              className={`text-sm font-semibold ${
                selectedVariant.stock > 0 ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {selectedVariant.stock > 0
                ? `${selectedVariant.stock} en stock`
                : 'Rupture de stock'}
            </span>
          </div>
        </div>
      )}

      {!selectedVariant && Object.keys(selectedOptions).length > 0 && (
        <div className="pt-4 border-t">
          <p className="text-sm text-amber-600">
            Cette combinaison n'est pas disponible. Veuillez choisir d'autres options.
          </p>
        </div>
      )}
    </div>
  );
}