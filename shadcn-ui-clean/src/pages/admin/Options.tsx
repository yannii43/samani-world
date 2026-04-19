import { useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { productOptions as initialOptions, productOptionValues as initialValues } from '@/lib/options-data';
import type { ProductOption, ProductOptionValue } from '@/lib/types';
import { toast } from 'sonner';

export default function AdminOptions() {
  const [options, setOptions] = useState<ProductOption[]>(initialOptions);
  const [optionValues, setOptionValues] = useState<ProductOptionValue[]>(initialValues);
  const [isOptionDialogOpen, setIsOptionDialogOpen] = useState(false);
  const [isValueDialogOpen, setIsValueDialogOpen] = useState(false);
  const [editingOption, setEditingOption] = useState<ProductOption | null>(null);
  const [editingValue, setEditingValue] = useState<ProductOptionValue | null>(null);

  const [optionFormData, setOptionFormData] = useState<Partial<ProductOption>>({
    name: '',
    type: 'button',
    order: 1,
  });

  const [valueFormData, setValueFormData] = useState<Partial<ProductOptionValue>>({
    optionId: '',
    value: '',
    displayValue: '',
    colorHex: '',
    order: 1,
  });

  // Option handlers
  const handleSubmitOption = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingOption) {
      setOptions(options.map((opt) =>
        opt.id === editingOption.id ? { ...opt, ...optionFormData } : opt
      ));
      toast.success('Option mise à jour!');
    } else {
      const newOption: ProductOption = {
        id: `opt-${Date.now()}`,
        name: optionFormData.name!,
        type: optionFormData.type!,
        order: optionFormData.order || options.length + 1,
      };
      setOptions([...options, newOption]);
      toast.success('Option ajoutée!');
    }

    handleCloseOptionDialog();
  };

  const handleDeleteOption = (optionId: string) => {
    const hasValues = optionValues.some((val) => val.optionId === optionId);
    if (hasValues) {
      toast.error('Impossible de supprimer une option avec des valeurs');
      return;
    }

    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette option ?')) {
      setOptions(options.filter((opt) => opt.id !== optionId));
      toast.success('Option supprimée!');
    }
  };

  const handleEditOption = (option: ProductOption) => {
    setEditingOption(option);
    setOptionFormData(option);
    setIsOptionDialogOpen(true);
  };

  const handleCloseOptionDialog = () => {
    setIsOptionDialogOpen(false);
    setEditingOption(null);
    setOptionFormData({
      name: '',
      type: 'button',
      order: 1,
    });
  };

  // Value handlers
  const handleSubmitValue = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingValue) {
      setOptionValues(optionValues.map((val) =>
        val.id === editingValue.id ? { ...val, ...valueFormData } : val
      ));
      toast.success('Valeur mise à jour!');
    } else {
      const newValue: ProductOptionValue = {
        id: `val-${Date.now()}`,
        optionId: valueFormData.optionId!,
        value: valueFormData.value!,
        displayValue: valueFormData.displayValue || valueFormData.value!,
        colorHex: valueFormData.colorHex,
        order: valueFormData.order || optionValues.length + 1,
      };
      setOptionValues([...optionValues, newValue]);
      toast.success('Valeur ajoutée!');
    }

    handleCloseValueDialog();
  };

  const handleDeleteValue = (valueId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette valeur ?')) {
      setOptionValues(optionValues.filter((val) => val.id !== valueId));
      toast.success('Valeur supprimée!');
    }
  };

  const handleEditValue = (value: ProductOptionValue) => {
    setEditingValue(value);
    setValueFormData(value);
    setIsValueDialogOpen(true);
  };

  const handleCloseValueDialog = () => {
    setIsValueDialogOpen(false);
    setEditingValue(null);
    setValueFormData({
      optionId: '',
      value: '',
      displayValue: '',
      colorHex: '',
      order: 1,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">
          Gestion des Options Produits
        </h1>

        <Tabs defaultValue="options" className="space-y-6">
          <TabsList>
            <TabsTrigger value="options">Options</TabsTrigger>
            <TabsTrigger value="values">Valeurs d'Options</TabsTrigger>
          </TabsList>

          {/* Options Tab */}
          <TabsContent value="options">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Options ({options.length})</CardTitle>
                <Dialog open={isOptionDialogOpen} onOpenChange={setIsOptionDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-black hover:bg-gray-900">
                      <Plus className="mr-2 h-4 w-4" />
                      Ajouter une Option
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>
                        {editingOption ? 'Modifier l\'Option' : 'Ajouter une Option'}
                      </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmitOption} className="space-y-4">
                      <div>
                        <Label htmlFor="name">Nom de l'option *</Label>
                        <Input
                          id="name"
                          required
                          value={optionFormData.name}
                          onChange={(e) =>
                            setOptionFormData({ ...optionFormData, name: e.target.value })
                          }
                          placeholder="ex: Taille, Couleur, Matière"
                        />
                      </div>

                      <div>
                        <Label htmlFor="type">Type d'affichage</Label>
                        <Select
                          value={optionFormData.type}
                          onValueChange={(value: 'select' | 'color' | 'button') =>
                            setOptionFormData({ ...optionFormData, type: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="button">Boutons</SelectItem>
                            <SelectItem value="select">Liste déroulante</SelectItem>
                            <SelectItem value="color">Sélecteur de couleur</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="order">Ordre d'affichage</Label>
                        <Input
                          id="order"
                          type="number"
                          value={optionFormData.order}
                          onChange={(e) =>
                            setOptionFormData({ ...optionFormData, order: Number(e.target.value) })
                          }
                        />
                      </div>

                      <div className="flex gap-2">
                        <Button
                          type="submit"
                          className="flex-1 bg-black hover:bg-gray-900"
                        >
                          {editingOption ? 'Mettre à jour' : 'Ajouter'}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleCloseOptionDialog}
                        >
                          Annuler
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nom</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Ordre</TableHead>
                      <TableHead>Valeurs</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {options.sort((a, b) => a.order - b.order).map((option) => (
                      <TableRow key={option.id}>
                        <TableCell className="font-medium">{option.name}</TableCell>
                        <TableCell>
                          {option.type === 'button' && 'Boutons'}
                          {option.type === 'select' && 'Liste déroulante'}
                          {option.type === 'color' && 'Sélecteur de couleur'}
                        </TableCell>
                        <TableCell>{option.order}</TableCell>
                        <TableCell>
                          {optionValues.filter((v) => v.optionId === option.id).length} valeur(s)
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEditOption(option)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteOption(option.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Values Tab */}
          <TabsContent value="values">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Valeurs d'Options ({optionValues.length})</CardTitle>
                <Dialog open={isValueDialogOpen} onOpenChange={setIsValueDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-black hover:bg-gray-900">
                      <Plus className="mr-2 h-4 w-4" />
                      Ajouter une Valeur
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>
                        {editingValue ? 'Modifier la Valeur' : 'Ajouter une Valeur'}
                      </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmitValue} className="space-y-4">
                      <div>
                        <Label htmlFor="optionId">Option *</Label>
                        <Select
                          value={valueFormData.optionId}
                          onValueChange={(value) =>
                            setValueFormData({ ...valueFormData, optionId: value })
                          }
                          required
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner une option" />
                          </SelectTrigger>
                          <SelectContent>
                            {options.map((opt) => (
                              <SelectItem key={opt.id} value={opt.id}>
                                {opt.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="value">Valeur *</Label>
                        <Input
                          id="value"
                          required
                          value={valueFormData.value}
                          onChange={(e) =>
                            setValueFormData({ ...valueFormData, value: e.target.value })
                          }
                          placeholder="ex: S, M, L, Noir, Rouge"
                        />
                      </div>

                      <div>
                        <Label htmlFor="displayValue">Nom d'affichage</Label>
                        <Input
                          id="displayValue"
                          value={valueFormData.displayValue}
                          onChange={(e) =>
                            setValueFormData({ ...valueFormData, displayValue: e.target.value })
                          }
                          placeholder="Optionnel, utilise 'Valeur' si vide"
                        />
                      </div>

                      <div>
                        <Label htmlFor="colorHex">Code couleur (pour type 'color')</Label>
                        <div className="flex gap-2">
                          <Input
                            id="colorHex"
                            value={valueFormData.colorHex}
                            onChange={(e) =>
                              setValueFormData({ ...valueFormData, colorHex: e.target.value })
                            }
                            placeholder="#000000"
                          />
                          <input
                            type="color"
                            value={valueFormData.colorHex || '#000000'}
                            onChange={(e) =>
                              setValueFormData({ ...valueFormData, colorHex: e.target.value })
                            }
                            className="w-12 h-10 rounded border"
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="order">Ordre d'affichage</Label>
                        <Input
                          id="order"
                          type="number"
                          value={valueFormData.order}
                          onChange={(e) =>
                            setValueFormData({ ...valueFormData, order: Number(e.target.value) })
                          }
                        />
                      </div>

                      <div className="flex gap-2">
                        <Button
                          type="submit"
                          className="flex-1 bg-black hover:bg-gray-900"
                        >
                          {editingValue ? 'Mettre à jour' : 'Ajouter'}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleCloseValueDialog}
                        >
                          Annuler
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Option</TableHead>
                      <TableHead>Valeur</TableHead>
                      <TableHead>Affichage</TableHead>
                      <TableHead>Couleur</TableHead>
                      <TableHead>Ordre</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {optionValues.sort((a, b) => a.order - b.order).map((value) => {
                      const option = options.find((o) => o.id === value.optionId);
                      return (
                        <TableRow key={value.id}>
                          <TableCell className="font-medium">{option?.name}</TableCell>
                          <TableCell>{value.value}</TableCell>
                          <TableCell>{value.displayValue || value.value}</TableCell>
                          <TableCell>
                            {value.colorHex && (
                              <div className="flex items-center gap-2">
                                <div
                                  className="w-6 h-6 rounded border"
                                  style={{ backgroundColor: value.colorHex }}
                                />
                                <span className="text-sm">{value.colorHex}</span>
                              </div>
                            )}
                          </TableCell>
                          <TableCell>{value.order}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEditValue(value)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteValue(value.id)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}