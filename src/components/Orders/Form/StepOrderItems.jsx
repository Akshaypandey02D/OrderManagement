import { Package, Plus, GripVertical, Trash2 } from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { createPortal } from 'react-dom';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';

export default function StepOrderItems({ 
  fields, 
  onDragEnd, 
  remove, 
  isAddingItem, 
  setIsAddingItem, 
  selectedProductId, 
  setSelectedProductId, 
  quantity, 
  setQuantity, 
  handleAddItem, 
  products, 
  errors 
}) {
  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-4">
        <div className="flex items-center space-x-2">
          <Package className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-medium text-textMain">Order Items</h3>
        </div>
        <div className="flex items-center gap-4 w-full sm:w-auto">
          {errors.items && <span className="text-rose-500 text-xs font-medium">{errors.items.message}</span>}
          {fields.length > 0 && !isAddingItem && (
            <Button type="button" variant="secondary" size="sm" onClick={() => setIsAddingItem(true)} className="w-full sm:w-auto">
              <Plus className="w-4 h-4 mr-2" /> Add Item
            </Button>
          )}
        </div>
      </div>

      {fields.length === 0 && !isAddingItem ? (
        <div className="border border-dashed border-border rounded-xl p-8 md:p-12 flex flex-col items-center justify-center text-center bg-black/5 dark:bg-white/5">
           <div className="p-4 bg-primary/10 rounded-full mb-4">
            <Package className="w-8 h-8 text-primary" />
           </div>
           <h4 className="text-textMain font-medium text-lg">No items added yet</h4>
           <p className="text-textMuted text-sm mt-1 mb-6 max-w-xs">Search and select products from your inventory to build this order.</p>
           <Button type="button" variant="primary" onClick={() => setIsAddingItem(true)}>Add Product</Button>
        </div>
      ) : (
        <div className="space-y-4">
          {fields.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between px-2">
                <p className="text-[10px] font-bold text-textMuted uppercase tracking-widest">Order Manifest ({fields.length} modules)</p>
                <p className="text-[10px] font-medium text-primary animate-pulse flex items-center gap-1.5">
                  <GripVertical className="w-3 h-3" /> Drag handle to reorder manifest
                </p>
              </div>
              <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="order-items">
                  {(provided, snapshot) => (
                    <div 
                      {...provided.droppableProps} 
                      ref={provided.innerRef}
                      className={`space-y-3 p-1 rounded-2xl transition-colors duration-200 ${snapshot.isDraggingOver ? 'bg-primary/5 ring-1 ring-primary/20' : ''}`}
                    >
                      {fields.map((item, idx) => (
                        <Draggable key={item.id} draggableId={item.id} index={idx}>
                          {(provided, snapshot) => {
                            const child = (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                className={`p-4 bg-card border rounded-xl flex items-center gap-4 transition-shadow duration-200 select-none ${
                                  snapshot.isDragging 
                                    ? 'shadow-[0_30px_60px_rgba(0,0,0,0.5)] border-primary/60 scale-[1.05] bg-card/95 backdrop-blur-xl z-[9999]' 
                                    : 'border-border hover:border-primary/20'
                                }`}
                                style={{
                                  ...provided.draggableProps.style,
                                  cursor: snapshot.isDragging ? 'grabbing' : 'grab'
                                }}
                              >
                                <div 
                                  {...provided.dragHandleProps} 
                                  className={`p-2 rounded-lg transition-colors ${snapshot.isDragging ? 'text-primary bg-primary/20' : 'text-textMuted hover:text-primary hover:bg-primary/5'}`}
                                >
                                  <GripVertical className="w-5 h-5" />
                                </div>
                                
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black uppercase text-xs shrink-0 transition-all ${
                                  snapshot.isDragging ? 'bg-primary text-white scale-110 shadow-lg shadow-primary/30' : 'bg-primary/10 text-primary'
                                }`}>
                                   {item.name.charAt(0)}
                                </div>
      
                                <div className="flex-1 min-w-0">
                                  <h4 className={`font-bold truncate text-sm transition-colors ${snapshot.isDragging ? 'text-primary' : 'text-textMain'}`}>
                                    {item.name}
                                  </h4>
                                  <p className="text-[10px] text-textMuted font-bold uppercase tracking-widest mt-0.5 opacity-60">
                                    ID: {item.id.split('-')[0]}... | Unit: ₹{item.price.toLocaleString('en-IN')}
                                  </p>
                                </div>
      
                                <div className="flex items-center gap-6">
                                  <div className="text-center px-2">
                                    <p className="text-[8px] font-black text-textMuted uppercase tracking-widest mb-1">QTY</p>
                                    <div className={`text-sm font-black transition-all ${snapshot.isDragging ? 'scale-110 text-primary' : 'text-textMain'}`}>
                                      {item.quantity}
                                    </div>
                                  </div>
                                  <div className="text-right min-w-[80px]">
                                    <p className="text-[8px] font-black text-textMuted uppercase tracking-widest mb-1">Total</p>
                                    <p className={`text-sm font-black italic transition-all ${snapshot.isDragging ? 'scale-110 text-primary' : 'text-textMain'}`}>
                                      ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                                    </p>
                                  </div>
                                  {!snapshot.isDragging && (
                                    <button 
                                      type="button"
                                      onClick={() => remove(idx)} 
                                      className="p-1.5 text-textMuted hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  )}
                                </div>
                              </div>
                            );
      
                            if (snapshot.isDragging) {
                              return createPortal(child, document.body);
                            }
                            return child;
                          }}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            </div>
          )}

          {isAddingItem && (
            <div className="p-6 border border-primary/20 bg-primary/5 rounded-xl space-y-6">
              <h4 className="text-sm font-bold text-textMain flex items-center">
                <Plus className="w-4 h-4 mr-2 text-primary" />
                Select Product
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-3">
                  <label className="text-xs font-medium text-textMuted mb-1 block">Product Search</label>
                  <select 
                    className="w-full h-10 bg-card border border-border rounded-lg px-3 text-sm text-textMain focus:ring-2 focus:ring-primary outline-none"
                    value={selectedProductId}
                    onChange={(e) => setSelectedProductId(e.target.value)}
                  >
                    <option value="" disabled>Search mission-critical module...</option>
                    {products.map(p => {
                      const priceStr = typeof p.price === 'string' ? p.price : `₹${p.price.toLocaleString('en-IN')}`;
                      return <option key={p.id} value={p.id}>{p.name} ({priceStr})</option>
                    })}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-textMuted mb-1 block">Quantity</label>
                  <Input 
                    type="number" 
                    min="1" 
                    value={quantity} 
                    onChange={(e) => setQuantity(Number(e.target.value) || 1)}
                    className="h-10 text-center"
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <Button type="button" onClick={handleAddItem} disabled={!selectedProductId} className="flex-1">
                  Add to List
                </Button>
                <Button type="button" variant="secondary" onClick={() => setIsAddingItem(false)} className="flex-1">
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
