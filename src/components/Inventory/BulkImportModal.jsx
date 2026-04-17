import { useState, useRef } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { 
  FileJson, 
  FileSpreadsheet, 
  Upload, 
  Download, 
  AlertCircle, 
  CheckCircle2,
  Trash2,
  Code
} from 'lucide-react';

export function BulkImportModal({ isOpen, onClose, onImport }) {
  const [data, setData] = useState('');
  const [format, setFormat] = useState('csv'); // 'csv' or 'json'
  const [preview, setPreview] = useState([]);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const sampleCSV = `Name,SKU,Price,Stock,MinStock,Status
Apple iPhone 15,IPH-15-BLU,79999,45,10,In Stock
Samsung Galaxy S24,SAM-S24-BLK,74999,30,5,In Stock
Sony Headphones,SNY-WH1000,29999,15,10,Low Stock`;

  const sampleJSON = `[
  {
    "name": "MacBook Air M3",
    "sku": "MAC-M3-SIL",
    "price": 114900,
    "stock": 10,
    "minQuantity": 5,
    "status": "In Stock"
  }
]`;

  const handleParse = () => {
    try {
      setError(null);
      let parsed = [];
      if (format === 'json') {
        parsed = JSON.parse(data);
        if (!Array.isArray(parsed)) throw new Error('JSON must be an array of products');
      } else {
        const lines = data.split('\n').filter(line => line.trim());
        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
        
        parsed = lines.slice(1).map(line => {
          const values = line.split(',').map(v => v.trim());
          const obj = {};
          headers.forEach((h, i) => {
            // Map headers to internal keys
            let key = h;
            if (h === 'minstock') key = 'minQuantity';
            obj[key] = values[i];
          });
          return obj;
        });
      }

      // Validation & Normalization
      const normalized = parsed.map(p => ({
        id: p.id || `PRD-${Math.floor(Math.random() * 10000)}`,
        name: p.name || 'Unnamed Product',
        sku: p.sku || `SKU-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        price: `₹${Number(p.price || 0).toLocaleString('en-IN')}`,
        stock: Number(p.stock || 0),
        minQuantity: Number(p.minQuantity || 10),
        status: p.status || (Number(p.stock) > 10 ? 'In Stock' : 'Low Stock')
      }));

      setPreview(normalized);
    } catch (err) {
      setError(err.message);
      setPreview([]);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setData(event.target.result);
      if (file.name.endsWith('.json')) setFormat('json');
      else setFormat('csv');
    };
    reader.readAsText(file);
  };

  const handleImport = () => {
    onImport(preview);
    setPreview([]);
    setData('');
    onClose();
  };

  const clearData = () => {
    setData('');
    setPreview([]);
    setError(null);
  };

  const useSample = () => {
    setData(format === 'csv' ? sampleCSV : sampleJSON);
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Bulk Product Import" 
      maxWidth="max-w-3xl"
    >
      <div className="space-y-6">
        {preview.length === 0 ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex bg-black/5 dark:bg-white/5 p-1 rounded-xl border border-border">
                <button
                  onClick={() => setFormat('csv')}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${format === 'csv' ? 'bg-card text-primary shadow-sm' : 'text-textMuted'}`}
                >
                  CSV Format
                </button>
                <button
                  onClick={() => setFormat('json')}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${format === 'json' ? 'bg-card text-primary shadow-sm' : 'text-textMuted'}`}
                >
                  JSON Format
                </button>
              </div>
              <div className="flex gap-2">
                <Button variant="secondary" size="sm" onClick={useSample} className="h-8 text-[10px] uppercase font-black tracking-tighter">
                  Use Sample
                </Button>
                <Button variant="secondary" size="sm" onClick={() => fileInputRef.current?.click()} className="h-8 text-[10px] uppercase font-black tracking-tighter">
                  <Upload className="w-3 h-3 mr-1" /> Upload File
                </Button>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileUpload} 
                  className="hidden" 
                  accept=".csv,.json"
                />
              </div>
            </div>

            <div className="relative group">
              <textarea
                value={data}
                onChange={(e) => setData(e.target.value)}
                placeholder={format === 'csv' ? "Paste CSV data here...\nName,SKU,Price,Stock" : "Paste JSON array here..."}
                className="w-full h-64 bg-black/5 dark:bg-white/5 border border-border rounded-2xl p-4 text-sm font-mono focus:ring-2 focus:ring-primary focus:border-primary outline-none resize-none transition-all group-hover:bg-black/10 dark:group-hover:bg-white/10"
              />
              {data && (
                <button 
                  onClick={clearData}
                  className="absolute top-4 right-4 p-2 bg-rose-500/10 text-rose-500 rounded-lg hover:bg-rose-500 hover:text-white transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>

            {error && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center gap-3 text-rose-500 text-sm">
                <AlertCircle className="w-4 h-4" />
                <span className="font-medium">{error}</span>
              </div>
            )}

            <Button 
              onClick={handleParse} 
              disabled={!data} 
              className="w-full h-12 rounded-2xl shadow-lg shadow-primary/20"
            >
              Parse & Preview Data
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-500">
                <CheckCircle2 className="w-5 h-5" />
                <span className="font-bold text-sm">Review {preview.length} products found</span>
              </div>
              <Button variant="secondary" size="sm" onClick={() => setPreview([])}>
                Back to Edit
              </Button>
            </div>

            <div className="border border-border rounded-2xl overflow-hidden max-h-96 overflow-y-auto bg-black/5 dark:bg-white/5">
              <table className="w-full text-left text-xs">
                <thead className="bg-black/10 dark:bg-white/10 text-textMuted uppercase tracking-wider sticky top-0">
                  <tr>
                    <th className="px-4 py-3 font-bold">Product</th>
                    <th className="px-4 py-3 font-bold">SKU</th>
                    <th className="px-4 py-3 font-bold">Price</th>
                    <th className="px-4 py-3 font-bold text-center">Stock</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {preview.map((p, i) => (
                    <tr key={i} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                      <td className="px-4 py-3 text-textMain font-bold">{p.name}</td>
                      <td className="px-4 py-3 text-textMuted">{p.sku}</td>
                      <td className="px-4 py-3 text-textMain">{p.price}</td>
                      <td className="px-4 py-3 text-center text-textMain">{p.stock}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
               <Button variant="secondary" onClick={() => setPreview([])} className="h-12 rounded-2xl">
                 Cancel
               </Button>
               <Button onClick={handleImport} className="h-12 rounded-2xl bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20">
                 Import All Products
               </Button>
            </div>
          </div>
        )}

        <div className="flex items-start gap-3 p-4 bg-primary/5 rounded-2xl border border-primary/10">
          <AlertCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          <div className="text-xs text-textMuted space-y-1">
            <p className="font-bold text-primary italic">Pro Tip:</p>
            <p>You can upload a CSV with columns: <code className="bg-black/10 px-1 rounded">Name, SKU, Price, Stock, MinStock, Status</code></p>
            <p>Duplicates are matched by SKU. Existing products will be updated.</p>
          </div>
        </div>
      </div>
    </Modal>
  );
}
