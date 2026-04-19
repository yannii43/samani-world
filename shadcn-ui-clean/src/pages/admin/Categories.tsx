import { useState } from 'react';
import { Plus, Pencil, Trash2, MoveUp, MoveDown } from 'lucide-react';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { categories as initialCategories, getCategoryTree, type CategoryTree } from '@/lib/categories-data';
import type { Category } from '@/lib/types';
import { toast } from 'sonner';

export default function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const [formData, setFormData] = useState<Partial<Category>>({
    name: '',
    slug: '',
    description: '',
    image: '',
    parentId: undefined,
    order: 1,
    isActive: true,
  });

  const categoryTree = getCategoryTree();
  const mainCategories = categories.filter((cat) => !cat.parentId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingCategory) {
      const updatedCategories = categories.map((cat) =>
        cat.id === editingCategory.id ? { ...cat, ...formData, updatedAt: new Date().toISOString() } : cat
      );
      setCategories(updatedCategories);
      toast.success('Catégorie mise à jour!');
    } else {
      const newCategory: Category = {
        id: `cat-${Date.now()}`,
        name: formData.name!,
        slug: formData.slug || formData.name!.toLowerCase().replace(/\s+/g, '-'),
        description: formData.description || '',
        image: formData.image || '/images/Placeholder.jpg',
        parentId: formData.parentId,
        order: formData.order || categories.length + 1,
        isActive: formData.isActive !== undefined ? formData.isActive : true,
        createdAt: new Date().toISOString(),
      };
      setCategories([...categories, newCategory]);
      toast.success('Catégorie ajoutée!');
    }

    handleCloseDialog();
  };

  const handleDelete = (categoryId: string) => {
    // Check if category has subcategories
    const hasSubcategories = categories.some((cat) => cat.parentId === categoryId);
    if (hasSubcategories) {
      toast.error('Impossible de supprimer une catégorie avec des sous-catégories');
      return;
    }

    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette catégorie ?')) {
      setCategories(categories.filter((cat) => cat.id !== categoryId));
      toast.success('Catégorie supprimée!');
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData(category);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingCategory(null);
    setFormData({
      name: '',
      slug: '',
      description: '',
      image: '',
      parentId: undefined,
      order: 1,
      isActive: true,
    });
  };

  const handleMoveOrder = (categoryId: string, direction: 'up' | 'down') => {
    const index = categories.findIndex((cat) => cat.id === categoryId);
    if (index === -1) return;

    const newCategories = [...categories];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= newCategories.length) return;

    // Swap orders
    const temp = newCategories[index].order;
    newCategories[index] = { ...newCategories[index], order: newCategories[targetIndex].order };
    newCategories[targetIndex] = { ...newCategories[targetIndex], order: temp };

    setCategories(newCategories.sort((a, b) => a.order - b.order));
    toast.success('Ordre modifié!');
  };

  const renderCategoryRow = (category: Category, level: number = 0) => {
    const subcategories = categories.filter((cat) => cat.parentId === category.id);

    return (
      <>
        <TableRow key={category.id}>
          <TableCell>
            <div className="flex items-center gap-2" style={{ paddingLeft: `${level * 24}px` }}>
              {level > 0 && <span className="text-gray-400">└─</span>}
              <img
                src={category.image}
                alt={category.name}
                className="h-12 w-12 rounded object-cover"
              />
            </div>
          </TableCell>
          <TableCell className="font-medium">{category.name}</TableCell>
          <TableCell className="text-sm text-gray-600">{category.slug}</TableCell>
          <TableCell>
            {category.parentId ? (
              <span className="text-sm text-gray-600">
                Sous-catégorie de {categories.find((c) => c.id === category.parentId)?.name}
              </span>
            ) : (
              <span className="text-sm font-medium">Catégorie principale</span>
            )}
          </TableCell>
          <TableCell>
            <span
              className={`px-2 py-1 rounded text-xs ${
                category.isActive
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}
            >
              {category.isActive ? 'Active' : 'Inactive'}
            </span>
          </TableCell>
          <TableCell>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleMoveOrder(category.id, 'up')}
                disabled={category.order === 1}
              >
                <MoveUp className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleMoveOrder(category.id, 'down')}
              >
                <MoveDown className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleEdit(category)}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDelete(category.id)}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </TableCell>
        </TableRow>
        {subcategories.map((sub) => renderCategoryRow(sub, level + 1))}
      </>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Gestion des Catégories</h1>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-black hover:bg-gray-900">
                <Plus className="mr-2 h-4 w-4" />
                Ajouter une Catégorie
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingCategory ? 'Modifier la Catégorie' : 'Ajouter une Catégorie'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Nom de la catégorie *</Label>
                  <Input
                    id="name"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="slug">Slug (URL)</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) =>
                      setFormData({ ...formData, slug: e.target.value })
                    }
                    placeholder="Auto-généré si vide"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="parentId">Catégorie parente (optionnel)</Label>
                  <Select
                    value={formData.parentId || 'none'}
                    onValueChange={(value) =>
                      setFormData({ ...formData, parentId: value === 'none' ? undefined : value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Aucune (catégorie principale)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Aucune (catégorie principale)</SelectItem>
                      {mainCategories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="image">URL de l'image</Label>
                  <Input
                    id="image"
                    value={formData.image}
                    onChange={(e) =>
                      setFormData({ ...formData, image: e.target.value })
                    }
                    placeholder="/images/Category.jpg"
                  />
                </div>

                <div>
                  <Label htmlFor="order">Ordre d'affichage</Label>
                  <Input
                    id="order"
                    type="number"
                    value={formData.order}
                    onChange={(e) =>
                      setFormData({ ...formData, order: Number(e.target.value) })
                    }
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, isActive: checked })
                    }
                  />
                  <Label htmlFor="isActive">Catégorie active</Label>
                </div>

                <div className="flex gap-2">
                  <Button
                    type="submit"
                    className="flex-1 bg-black hover:bg-gray-900"
                  >
                    {editingCategory ? 'Mettre à jour' : 'Ajouter'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCloseDialog}
                  >
                    Annuler
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Liste des Catégories ({categories.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Image</TableHead>
                  <TableHead>Nom</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mainCategories
                  .sort((a, b) => a.order - b.order)
                  .map((category) => renderCategoryRow(category))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}