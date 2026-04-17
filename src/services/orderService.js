import { useOrderStore } from '../stores/useOrderStore';
import { useProductStore } from '../stores/useProductStore';
import { useNotificationStore } from '../stores/useNotificationStore';

export const orderService = {
  createOrder: (formData) => {
    const { addOrder } = useOrderStore.getState();
    const { updateStock, products } = useProductStore.getState();
    const { dispatchNotification } = useNotificationStore.getState();
    
    // Calculate totals
    const subtotal = formData.items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const shipping = 50;
    const tax = subtotal * 0.1;
    const total = subtotal + shipping + tax;
    
    const orderId = `ORD-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
    
    // Check for stock and update
    formData.items.forEach(item => {
      updateStock(item.id, -item.quantity);
    });

    const newOrder = {
      id: orderId,
      ...formData,
      amount: total, 
      status: 'Pending',
      priority: formData.priority || 'Normal',
      history: [
        { date: new Date().toLocaleString(), event: 'Order Created', note: 'Order initialized in system.' }
      ]
    };
    
    addOrder(newOrder);
    dispatchNotification(`Order ${orderId} created successfully`, 'success');
    
    return newOrder;
  },

  updateOrderStatus: (id, newStatus) => {
    const { updateOrder, getOrderById } = useOrderStore.getState();
    const { updateStock } = useProductStore.getState();
    const { dispatchNotification } = useNotificationStore.getState();
    
    const order = getOrderById(id);
    if (!order) return;

    let historyNote = `Status changed to ${newStatus}`;

    // Side effects based on status transition
    if (newStatus === 'Cancelled' && order.status !== 'Cancelled') {
      order.items.forEach(item => {
        updateStock(item.id, item.quantity);
      });
      historyNote = 'Order cancelled. Inventory levels restored.';
      dispatchNotification(`Order ${id} cancelled. Items returned to stock.`, 'warning');
    } else if (order.status === 'Cancelled' && newStatus !== 'Cancelled') {
      order.items.forEach(item => {
        updateStock(item.id, -item.quantity);
      });
      historyNote = `Order re-activated from cancellation. New status: ${newStatus}`;
      dispatchNotification(`Order ${id} re-activated.`, 'info');
    }

    const newHistory = [
      ...order.history,
      { date: new Date().toLocaleString(), event: 'Status Update', note: historyNote }
    ];

    updateOrder(id, { status: newStatus, history: newHistory });
  },

  addOrderNote: (id, noteText) => {
     const { updateOrder, getOrderById } = useOrderStore.getState();
     const order = getOrderById(id);
     if (!order) return;

     const newHistory = [
       ...order.history,
       { date: new Date().toLocaleString(), event: 'Internal Note', note: noteText }
     ];

     updateOrder(id, { notes: noteText, history: newHistory });
  },

  deleteOrder: (id) => {
    const { deleteOrder, getOrderById } = useOrderStore.getState();
    const { updateStock } = useProductStore.getState();
    const { dispatchNotification } = useNotificationStore.getState();
    
    const order = getOrderById(id);
    if (order && order.status !== 'Cancelled') {
      order.items.forEach(item => {
        updateStock(item.id, item.quantity);
      });
    }

    deleteOrder(id);
    dispatchNotification(`Order ${id} removed.`, 'info');
  }
};
