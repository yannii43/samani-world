import { useState } from 'react';
import { Eye } from 'lucide-react';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getOrders, updateOrderStatus, type Order } from '@/lib/orders-data';
import { formatPrice } from '@/lib/products-data';
import { toast } from 'sonner';

export default function AdminOrders() {
  const [orders, setOrders] = useState(getOrders());
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setIsDialogOpen(true);
  };

  const handleUpdateStatus = (
    orderId: string,
    orderStatus: Order['orderStatus'],
    paymentStatus?: Order['paymentStatus']
  ) => {
    updateOrderStatus(orderId, orderStatus, paymentStatus);
    setOrders(getOrders());
    if (selectedOrder?.id === orderId) {
      setSelectedOrder(getOrders().find((o) => o.id === orderId) || null);
    }
    toast.success('Statut mis à jour!');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-500';
      case 'confirmed':
        return 'bg-blue-500';
      case 'pending':
        return 'bg-yellow-500';
      case 'cancelled':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'Livrée';
      case 'confirmed':
        return 'Confirmée';
      case 'pending':
        return 'En attente';
      case 'cancelled':
        return 'Annulée';
      default:
        return status;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">
          Gestion des Commandes
        </h1>

        <Card>
          <CardHeader>
            <CardTitle>Liste des Commandes ({orders.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Montant</TableHead>
                  <TableHead>Paiement</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">#{order.id}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{order.customerName}</p>
                        <p className="text-sm text-gray-600">
                          {order.customerPhone}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {new Date(order.createdAt).toLocaleDateString('fr-FR')}
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatPrice(order.totalAmount)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          order.paymentStatus === 'paid' ? 'default' : 'secondary'
                        }
                        className={
                          order.paymentStatus === 'paid'
                            ? 'bg-green-500'
                            : 'bg-gray-500'
                        }
                      >
                        {order.paymentStatus === 'paid' ? 'Payé' : 'En attente'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(order.orderStatus)}>
                        {getStatusText(order.orderStatus)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleViewOrder(order)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Détails de la Commande #{selectedOrder?.id}</DialogTitle>
            </DialogHeader>
            {selectedOrder && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold mb-2">Informations Client</h3>
                    <p className="text-sm text-gray-600">
                      <strong>Nom:</strong> {selectedOrder.customerName}
                    </p>
                    <p className="text-sm text-gray-600">
                      <strong>Téléphone:</strong> {selectedOrder.customerPhone}
                    </p>
                    <p className="text-sm text-gray-600">
                      <strong>Adresse:</strong> {selectedOrder.customerAddress}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Informations Commande</h3>
                    <p className="text-sm text-gray-600">
                      <strong>Date:</strong>{' '}
                      {new Date(selectedOrder.createdAt).toLocaleDateString(
                        'fr-FR',
                        {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        }
                      )}
                    </p>
                    <p className="text-sm text-gray-600">
                      <strong>Paiement:</strong>{' '}
                      {selectedOrder.paymentMethod === 'cash'
                        ? 'À la livraison'
                        : 'Mobile Money'}
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Produits</h3>
                  <div className="space-y-2">
                    {selectedOrder.items.map((item, index) => (
                      <div
                        key={index}
                        className="flex justify-between text-sm p-2 bg-gray-50 rounded"
                      >
                        <span>
                          {item.productName} x{item.quantity}
                        </span>
                        <span className="font-medium">
                          {formatPrice(item.price * item.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between items-center mt-4 pt-4 border-t">
                    <span className="font-semibold">Total</span>
                    <span className="text-xl font-bold text-[#00A86B]">
                      {formatPrice(selectedOrder.totalAmount)}
                    </span>
                  </div>
                </div>

                {selectedOrder.notes && (
                  <div>
                    <h3 className="font-semibold mb-2">Notes</h3>
                    <p className="text-sm text-gray-600">{selectedOrder.notes}</p>
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Statut de la Commande
                    </label>
                    <Select
                      value={selectedOrder.orderStatus}
                      onValueChange={(value) =>
                        handleUpdateStatus(
                          selectedOrder.id,
                          value as Order['orderStatus']
                        )
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">En attente</SelectItem>
                        <SelectItem value="confirmed">Confirmée</SelectItem>
                        <SelectItem value="delivered">Livrée</SelectItem>
                        <SelectItem value="cancelled">Annulée</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Statut du Paiement
                    </label>
                    <Select
                      value={selectedOrder.paymentStatus}
                      onValueChange={(value) =>
                        handleUpdateStatus(
                          selectedOrder.id,
                          selectedOrder.orderStatus,
                          value as Order['paymentStatus']
                        )
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">En attente</SelectItem>
                        <SelectItem value="paid">Payé</SelectItem>
                        <SelectItem value="cancelled">Annulé</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}