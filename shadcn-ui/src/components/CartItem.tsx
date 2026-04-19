import { Minus, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useCartStore } from '@/lib/cart-store';
import type { CartItem as CartItemType } from '@/lib/cart';
import { formatPrice } from '@/lib/products-data';

interface CartItemProps {
  item: CartItemType;
}

export default function CartItem({ item }: CartItemProps) {
  const updateQty = useCartStore((s) => s.updateQty);
  const remove = useCartStore((s) => s.remove);

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex gap-4">
          <img
            src={item.cover_image || ''}
            alt={item.name}
            className="h-24 w-24 rounded-lg object-cover"
          />
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900">{item.name}</h3>
            <p className="text-sm text-gray-600 mt-1">{formatPrice(item.price)}</p>
            <div className="flex items-center gap-2 mt-3">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => updateQty(item.id, item.qty - 1, item.variantId)}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-12 text-center font-medium">{item.qty}</span>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => updateQty(item.id, item.qty + 1, item.variantId)}
              >
                <Plus className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 ml-auto text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={() => remove(item.id, item.variantId)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="text-right">
            <p className="font-bold text-lg text-[#00A86B]">
              {formatPrice(item.price * item.qty)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}