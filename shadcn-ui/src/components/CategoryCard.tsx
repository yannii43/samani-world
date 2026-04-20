import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import type { Category } from '@/lib/types';

interface CategoryCardProps {
  category: Category;
}

export default function CategoryCard({ category }: CategoryCardProps) {
  return (
    <Link to={`/category/${category.slug}`} className="group">
      <Card className="overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300 hover-lift">
        <div className="relative overflow-hidden" style={{ height: '220px' }}>
          <img
            src={category.image}
            alt={category.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <h3 className="text-white text-2xl font-bold mb-2" style={{ fontFamily: '"Playfair Display", serif' }}>
              {category.name}
            </h3>
            {category.description && (
              <p className="text-white/90 text-sm line-clamp-2">
                {category.description}
              </p>
            )}
          </div>
        </div>
      </Card>
    </Link>
  );
}