import React from "react";
import { currency } from "../../utils/currency";
import { Download, Printer } from "lucide-react";

export default function PaymentsPanel({
  modeFilter, setModeFilter, fromDate, setFromDate, toDate, setToDate,
  applyQuickRange, filteredSales, pageSales, page, setPage, pageSize, setPageSize,
  totalPages, printReceipt, exportCSV
}) {
  return (
    <section className="col-span-12">
      <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-bg-soft p-3 md:p-4">
        <div className="flex flex-col md:flex-row md:items-end gap-2 md:gap-3 mb-3">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2 flex-1">
            <div>
              <label className="text-xs text-neutral-600 dark:text-neutral-400">Mode</label>
              <select value={modeFilter} onChange={(e)=>{setModeFilter(e.target.value); setPage(1);}} className="w-full rounded-xl border px-3 py-2 bg-white dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700">
                <option value="ALL">All</option><option value="CASH">Cash</option><option value="UPI">UPI</option><option value="CARD">Card</option><option value="CREDIT">Credit</option>
              </select>
            </div>
            <div><label className="text-xs text-neutral-600 dark:text-neutral-400">From</label><input type="date" value={fromDate} onChange={e=>{setFromDate(e.target.value); setPage(1);}} className="w-full rounded-xl border px-3 py-2 bg-white dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700"/></div>
            <div><label className="text-xs text-neutral-600 dark:text-neutral-400">To</label><input type="date" value={toDate} onChange={e=>{setToDate(e.target.value); setPage(1);}} className="w-full rounded-xl border px-3 py-2 bg-white dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700"/></div>
            <div className="flex items-end gap-2">
              <div className="inline-flex gap-1"><button onClick={()=>applyQuickRange('TODAY')} className="px-2 py-1 rounded-lg border text-xs">Today</button><button onClick={()=>applyQuickRange('7D')} className="px-2 py-1 rounded-lg border text-xs">7D</button><button onClick={()=>applyQuickRange('30D')} className="px-2 py-1 rounded-lg border text-xs">30D</button><button onClick={()=>applyQuickRange('ALL')} className="px-2 py-1 rounded-lg border text-xs">All</button></div>
            </div>
            <div className="flex items-end">
              <div className="w-full rounded-xl border px-3 py-2 bg-neutral-50 dark:bg-neutral-800 text-sm">Total: <span className="font-semibold">{currency(filteredSales.reduce((a,s)=>a+(s.net??s.amount??0),0))}</span></div>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={()=>exportCSV(filteredSales)} className="inline-flex items-center gap-1 text-sm px-3 py-2 rounded-xl border bg-neutral-50 dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-700"><Download className="h-4 w-4"/> Export CSV</button>
          </div>
        </div>

        <div className="overflow-auto rounded-xl border sticky top-20">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 dark:bg-neutral-800 sticky top-0">
              <tr className="text-left">
                <th className="py-2 px-2">Time</th>
                <th className="py-2 px-2">Mode</th>
                <th className="py-2 px-2 text-right">Net</th>
                <th className="py-2 px-2">Items</th>
                <th className="py-2 px-2">Print</th>
              </tr>
            </thead>
            <tbody>
              {pageSales.map((s)=> (
                <tr key={s.id} className="border-t dark:border-neutral-800">
                  <td className="py-2 px-2 whitespace-nowrap">{new Date(s.time).toLocaleString()}</td>
                  <td className="py-2 px-2"><span className="text-xs bg-neutral-100 dark:bg-neutral-700 px-2 py-0.5 rounded-full">{s.mode}</span></td>
                  <td className="py-2 px-2 text-right font-semibold">{currency(s.net ?? s.amount)}</td>
                  <td className="py-2 px-2 text-neutral-600 dark:text-neutral-300 truncate" title={s.items.map(i=>`${i.name} x${i.qty}`).join(', ')}>{s.items.length} items</td>
                  <td className="py-2 px-2"><button onClick={()=>printReceipt(s)} className="text-sm px-2 py-1 rounded-lg border bg-bg-soft hover:bg-bg-muted">Print</button></td>
                </tr>
              ))}
              {filteredSales.length === 0 && (
                <tr><td colSpan={5} className="py-6 text-center text-neutral-500">No matching payments</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-3 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="text-xs text-neutral-500">Showing {(page-1)*pageSize + 1}-{Math.min(page*pageSize, filteredSales.length)} of {filteredSales.length}</div>
          <div className="flex items-center gap-2">
            <select value={pageSize} onChange={(e)=>{setPageSize(Number(e.target.value)); setPage(1);}} className="rounded-xl border px-2 py-1 bg-bg-soft">
              {[10,20,50].map(n => <option key={n} value={n}>{n}/page</option>)}
            </select>
            <div className="inline-flex items-center gap-1">
              <button disabled={page===1} onClick={()=>setPage(p=>Math.max(1,p-1))} className={`px-3 py-1 rounded-lg border ${page===1? 'opacity-50 cursor-not-allowed' : ''}`}>Prev</button>
              <span className="text-sm">{page}/{totalPages}</span>
              <button disabled={page===totalPages} onClick={()=>setPage(p=>Math.min(totalPages,p+1))} className={`px-3 py-1 rounded-lg border ${page===totalPages? 'opacity-50 cursor-not-allowed' : ''}`}>Next</button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
