import React from "react";
import ProductCard from "../POS/ProductCard.jsx";
import { currency } from "../../utils/currency";
import { ShoppingCart, Trash2, Minus, Plus, QrCode, AlertTriangle, Printer, Check } from "lucide-react";

export default function POSPanel({
  showLowStock, lowStockItems, outOfStockItems, gridLayout,
  filteredProducts, remainingStock, lowStockThreshold, addToCart,
  totals, clearCart, cart, dec, inc, removeLine, discount, setDiscount,
  taxPercent, setTaxPercent, lowStockThresholdState, setLowStockThreshold,
  sku, setSku, onQuickAdd, payMode, setPayMode, printReceipt, checkout,
  focusedCartIdRef
}) {
  return (
    <div className="grid grid-cols-12 gap-3 md:gap-4 w-full">
      <main className="col-span-12 md:col-span-7 lg:col-span-8 order-2 md:order-1">
        {showLowStock && (
          <div className="mb-3 md:mb-4 p-3 bg-amber-50 border border-amber-200 dark:bg-amber-900/20 dark:border-amber-800 rounded-xl">
            <div className="font-semibold text-amber-800 dark:text-amber-400 mb-1">⚠️ Inventory Alert</div>
            <div className="text-sm text-amber-700 dark:text-amber-300">Showing {lowStockItems.length} low stock and {outOfStockItems.length} out-of-stock items</div>
          </div>
        )}
        <div className={`grid ${gridLayout} gap-3 md:gap-4 auto-rows-fr`}>
          {filteredProducts.map((p) => {
            const rem = remainingStock(p.id); const low = rem <= Number(lowStockThreshold||0) && rem > 0; const oos = rem===0;
            return (
              <ProductCard key={p.id} product={p} rem={rem} low={low} oos={oos} onAdd={addToCart} />
            );
          })}
        </div>
      </main>

      <aside className="col-span-12 md:col-span-5 lg:col-span-4 order-1 md:order-2">
        <div className="card backdrop-blur p-4 sticky top-24 shadow-sm max-h-[70vh] overflow-auto">
          <div className="flex items-center justify-between mb-3">
            <div className="font-bold text-lg">Cart ({totals.items})</div>
            {cart.length ? (<button onClick={clearCart} className="text-sm text-red-600 hover:text-red-700 hover:underline inline-flex items-center gap-1"><Trash2 className="h-4 w-4"/> Clear</button>) : null}
          </div>

          {cart.length===0 ? (
            <div className="text-center py-8 text-neutral-500">
              <ShoppingCart className="h-12 w-12 mx-auto mb-2 opacity-50"/>
              <div className="text-sm">Cart is empty</div>
              <div className="text-xs">Tap a product or scan SKU</div>
            </div>
          ) : (
            <div className="space-y-2">
              {cart.map((line)=>{
                const rem = remainingStock(line.id); const focused = focusedCartIdRef.current===line.id;
                return (
                  <div key={line.id} className={`flex items-center gap-2 rounded-xl border p-3 bg-bg-soft ${focused? 'ring-2 ring-orange-300' : 'border-neutral-800'}`} onMouseEnter={()=>{focusedCartIdRef.current=line.id;}}>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium line-clamp-2">{line.name}</div>
                      <div className="text-xs text-neutral-500 flex items-center gap-2">
                        <span>{currency(line.priceSnapshot)}</span><span>•</span><span className="font-medium">{currency(line.qty*line.priceSnapshot)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={()=>dec(line.id)} className="h-8 w-8 rounded-full border border-neutral-300 dark:border-neutral-700 flex items-center justify-center hover:bg-bg-muted"><Minus className="h-4 w-4"/></button>
                      <div className="w-9 text-center text-sm font-bold">{line.qty}</div>
                      <button onClick={()=>inc(line.id)} disabled={rem<=0} className={`h-8 w-8 rounded-full border flex items-center justify-center ${rem<=0? 'border-neutral-200 text-neutral-300 cursor-not-allowed' : 'border-neutral-300 dark:border-neutral-700 hover:bg-green-50 dark:hover:bg-green-900/20 hover:border-green-300'}`}><Plus className="h-4 w-4"/></button>
                    </div>
                    <button onClick={()=>removeLine(line.id)} className="ml-1 text-neutral-400 hover:text-red-600"><Trash2 className="h-4 w-4"/></button>
                  </div>
                );
              })}
            </div>
          )}

          <div className="mt-4 border-t dark:border-neutral-800 pt-4 space-y-2">
            <div>
              <label className="text-xs text-neutral-600 dark:text-neutral-400 font-medium">Payment Mode</label>
              <select value={payMode} onChange={(e)=>setPayMode(e.target.value)} className="mt-1 w-full rounded-xl border border-neutral-300 dark:border-neutral-700 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white dark:bg-neutral-800">
                <option value="CASH">💵 Cash</option>
                <option value="UPI">📱 UPI</option>
                <option value="CARD">💳 Card</option>
                <option value="CREDIT">📝 Credit</option>
              </select>
            </div>
            <div className="space-y-2 text-sm bg-neutral-50 dark:bg-neutral-800 rounded-xl p-3">
              <div className="flex items-center justify-between"><span>Items</span><span className="font-medium">{totals.items}</span></div>
              <div className="flex items-center justify-between"><span>Sub Total</span><span className="font-medium">{currency(totals.subTotal)}</span></div>
              <div className="flex items-center justify-between"><span>Discount</span><span className="font-medium">-{currency(totals.disc)}</span></div>
              <div className="flex items-center justify-between"><span>Tax ({Number(taxPercent||0)}%)</span><span className="font-medium">{currency(totals.tax)}</span></div>
              <div className="flex items-center justify-between text-lg font-bold border-t dark:border-neutral-700 pt-2"><span>Net Total</span><span className="text-orange-600">{currency(totals.net)}</span></div>
            </div>
            <div className="flex gap-2">
              <button onClick={()=>printReceipt()} disabled={cart.length===0} className={`flex-1 inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-neutral-700 dark:text-neutral-200 border ${cart.length===0? 'bg-neutral-100 cursor-not-allowed' : 'bg-bg-soft hover:bg-bg-muted'}`}><Printer className="h-5 w-5"/> Preview</button>
              <button onClick={checkout} disabled={cart.length===0} className={`flex-[2] inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-white font-semibold transition-all ${cart.length===0? 'bg-neutral-300 cursor-not-allowed' : 'bg-gradient-to-r from-orange-500 to-orange-400 hover:from-orange-600 hover:to-orange-500 active:scale-95 shadow-lg'}`}><Check className="h-5 w-5"/> Checkout</button>
            </div>
          </div>
        </div>

        {/* Quick Add */}
        <div className="mt-3 p-3 rounded-2xl border bg-white/80 dark:bg-neutral-900/70 border-neutral-800">
          <div className="text-sm font-semibold mb-2 flex items-center gap-2"><QrCode className="h-4 w-4"/> Quick Add</div>
          <div className="relative">
            <input value={sku} onChange={(e)=>setSku(e.target.value)} onKeyDown={(e)=>e.key==='Enter'&&onQuickAdd()} placeholder="Scan/Type SKU & Enter" className="w-full pl-3 pr-16 py-2 rounded-xl border bg-white dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700"/>
            <button onClick={onQuickAdd} className="absolute right-1 top-1.5 px-3 py-1 rounded-lg text-white bg-accent-red hover:bg-accent-redhover text-sm">Add</button>
          </div>
        </div>
      </aside>
    </div>
  );
}
