import { Package } from "lucide-react";
import { currency } from "../../utils/currency";

export default function ProductCard({ product, rem, low, oos, onAdd }) {
  return (
    <button
      onClick={() => onAdd(product)}
      disabled={oos}
      className={`group relative rounded-2xl overflow-hidden border transition-all ${oos? 'bg-neutral-100 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 opacity-70 cursor-not-allowed' : 'bg-bg-card hover:shadow-md transition-transform duration-150 hover:-translate-y-0.5 border-neutral-200 dark:border-neutral-700 hover:border-brand-200'}`}
    >
      <div className="relative">
        <img src={product.img} alt={product.name} className="h-28 sm:h-32 w-full object-cover"/>
        {oos && (<div className="absolute inset-0 bg-black/50 flex items-center justify-center"><span className="text-white text-sm font-semibold">Out of Stock</span></div>)}
      </div>
      <div className="p-3 text-left">
        <div className="text-sm font-medium line-clamp-2 min-h-[2.5rem]">{product.name}</div>
        <div className="mt-1 font-bold text-lg text-brand-600">{currency(product.price)}</div>
        <div className="mt-2 flex items-center justify-between">
          <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full font-medium ${oos? 'bg-accent-red/20 text-accent-red' : low? 'bg-yellow-500/20 text-yellow-400' : 'bg-emerald-500/20 text-emerald-400'}`}><Package className="h-3 w-3"/>{oos? 'Out of stock' : `${rem} left`}</span>
          <span className="text-xs text-neutral-400">#{product.sku}</span>
        </div>
      </div>
    </button>
  );
}
