import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Search,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  Check,
  Loader2,
  QrCode,
  Printer,
  AlertTriangle,
  TrendingUp,
} from "lucide-react";

import {
  ResponsiveContainer,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
  LineChart,
  Line,
  XAxis,
  YAxis,
} from "recharts";

import { currency } from "./utils/currency";
import { LOGO, DEFAULT_PRODUCTS } from "./utils/constants";
import usePersistedState from "./hooks/usePersistedState";
import useResponsiveGrid from "./hooks/useResponsiveGrid";
import useWindowWidth from "./hooks/useWindowWidth";
import useOfflineStatus from "./hooks/useOfflineStatus";

import ProductCard from "./components/POS/ProductCard.jsx";
import POSPanel from "./components/panels/POSPanel.jsx";
import PaymentsPanel from "./components/panels/PaymentsPanel.jsx";
import AnalyticsPanel from "./components/panels/AnalyticsPanel.jsx";
import ProfilePanel from "./components/panels/ProfilePanel.jsx";
import Nav from "./components/Nav.jsx";
import { BrowserRouter, Routes, Route } from "react-router-dom";

export default function App() {
  // force dark
  useEffect(() => {
    document.documentElement.classList.add("dark");
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", "#0b0f12");
  }, []);

  // Persisted state
  const [products, setProducts] = usePersistedState("pos_products", DEFAULT_PRODUCTS);
  const [cart, setCart] = usePersistedState("pos_cart", []);
  const [sales, setSales] = usePersistedState("pos_sales", []);
  const [discount, setDiscount] = usePersistedState("pos_discount", 0);
  const [taxPercent, setTaxPercent] = usePersistedState("pos_tax", 0);
  const [lowStockThreshold, setLowStockThreshold] = usePersistedState("pos_low_threshold", 3);
  const [profile, setProfile] = usePersistedState("pos_profile", {
    shopName: "99 Market",
    owner: "Harsh",
    phone: "+91-90000-00000",
    gstin: "",
    address: "Main Road, City, State",
    hours: "9:00 AM – 9:00 PM",
    avatar: "https://ui-avatars.com/api/?name=99+M&background=f97316&color=fff&bold=true",
  });

  // UI state
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [payMode, setPayMode] = useState("CASH");
  const [showLowStock, setShowLowStock] = useState(false);
  const [sku, setSku] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const focusedCartIdRef = useRef(null);
  const ww = useWindowWidth();
  const gridLayout = useResponsiveGrid();
  const isOffline = useOfflineStatus();

  // Derived
  const categories = useMemo(() => ["All", ...Array.from(new Set(products.map(p => p.category)))], [products]);
  const cartQtyById = useMemo(() => { const m = new Map(); cart.forEach(i => m.set(i.id, (m.get(i.id)||0)+i.qty)); return m; }, [cart]);
  const remainingStock = (id) => { const p = products.find(x => x.id === id); const inCart = cartQtyById.get(id)||0; return Math.max(0, (p?.stock||0) - inCart); };

  const filteredProducts = useMemo(() => {
    const q = query.trim().toLowerCase();
    let out = products.filter(p => {
      const matchesQ = !q || [p.name, p.sku, p.category].some(v => v.toLowerCase().includes(q));
      const matchesC = category === "All" || p.category === category;
      return matchesQ && matchesC;
    });
    if (showLowStock) out = out.filter(p => remainingStock(p.id) <= Number(lowStockThreshold||0));
    return out;
  }, [products, query, category, showLowStock, cartQtyById, lowStockThreshold]);

  const totals = useMemo(() => {
    const items = cart.reduce((a, c) => a + c.qty, 0);
    const subTotal = cart.reduce((a, c) => a + c.qty * c.priceSnapshot, 0);
    const disc = Math.min(Number(discount||0), subTotal);
    const taxable = Math.max(0, subTotal - disc);
    const tax = (Number(taxPercent||0)/100) * taxable;
    const net = taxable + tax;
    return { items, subTotal, disc, tax, net };
  }, [cart, discount, taxPercent]);

  const todaySales = useMemo(() => {
    const todayStr = new Date().toDateString();
    const list = sales.filter(s => new Date(s.time).toDateString() === todayStr);
    const total = list.reduce((a, s) => a + (s.net ?? s.amount ?? 0), 0);
    return { list, total, count: list.length };
  }, [sales]);

  const lowStockItems = useMemo(() => products.filter(p => { const rem = remainingStock(p.id); return rem <= Number(lowStockThreshold||0) && rem > 0; }), [products, cartQtyById, lowStockThreshold]);
  const outOfStockItems = useMemo(() => products.filter(p => remainingStock(p.id) === 0), [products, cartQtyById]);

  // Cart helpers
  const addToCart = (p) => { const rem = remainingStock(p.id); if (rem<=0) return; setCart(prev => { const i = prev.findIndex(x => x.id === p.id); if (i===-1) return [...prev, { id:p.id, name:p.name, qty:1, priceSnapshot:p.price }]; const cp=[...prev]; cp[i] = { ...cp[i], qty: cp[i].qty+1 }; return cp; }); focusedCartIdRef.current = p.id; if (ww < 1024) setCartOpen(true); };
  const inc = (id) => { const rem = remainingStock(id); if (rem<=0) return; setCart(prev => prev.map(i => i.id===id ? { ...i, qty: i.qty+1 } : i)); focusedCartIdRef.current = id; };
  const dec = (id) => { setCart(prev => prev.flatMap(i => i.id!==id ? [i] : (i.qty-1<=0?[]:[{...i, qty:i.qty-1}]))); focusedCartIdRef.current = id; };
  const removeLine = (id) => { setCart(prev => prev.filter(i => i.id !== id)); focusedCartIdRef.current = null; };
  const clearCart = () => { setCart([]); focusedCartIdRef.current = null; };

  // Keyboard shortcuts for POS page
  useEffect(() => {
    const onKey = (e) => {
      const id = focusedCartIdRef.current;
      if (e.ctrlKey && e.key === "Enter") { e.preventDefault(); checkout(); return; }
      if (!id) return;
      if (e.key === "+" || e.key === "=") { e.preventDefault(); inc(id); }
      if (e.key === "-") { e.preventDefault(); dec(id); }
      if (e.key === "Delete") { e.preventDefault(); removeLine(id); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const onQuickAdd = () => { const code = sku.trim(); if (!code) return; const p = products.find(x => x.sku === code || x.id === code); if (p) addToCart(p); setSku(""); };

  const printReceipt = (sale) => {
    const s = sale || {
      id: Math.random().toString(36).slice(2),
      time: new Date().toISOString(),
      mode: payMode,
      items: cart.map(i => ({ id: i.id, name: i.name, qty: i.qty, price: i.priceSnapshot })),
      subTotal: totals.subTotal,
      discount: totals.disc,
      taxPercent: Number(taxPercent || 0),
      tax: totals.tax,
      net: totals.net,
    };
    const html = `<!doctype html>
<html><head><meta charset="utf-8" /><title>Receipt ${s.id}</title>
<style>body{font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Ubuntu;margin:20px;background:#fff} .title{font-weight:700;font-size:18px} .muted{color:#666} table{width:100%;border-collapse:collapse;margin-top:10px} th,td{text-align:left;padding:6px;border-bottom:1px dashed #ddd} .right{text-align:right} .total{font-weight:700;font-size:16px} @media print{button{display:none}}</style></head>
<body>
  <div class="title">${profile.shopName} — POS</div>
  <div class="muted">${profile.address}${profile.gstin ? ' • GSTIN: ' + profile.gstin : ''}</div>
  <div class="muted">Bill #${s.id} • ${new Date(s.time).toLocaleString()} • Mode: ${s.mode}</div>
  <table>
    <thead><tr><th>Item</th><th>Qty</th><th class="right">Price</th><th class="right">Amount</th></tr></thead>
    <tbody>${s.items.map(i => `<tr><td>${i.name}</td><td>${i.qty}</td><td class="right">${currency(i.price)}</td><td class="right">${currency(i.qty*i.price)}</td></tr>`).join("")}</tbody>
    <tfoot>
      <tr><td colspan="3" class="right">Sub Total</td><td class="right">${currency(s.subTotal || s.items.reduce((a,i)=>a+i.qty*i.price,0))}</td></tr>
      <tr><td colspan="3" class="right">Discount</td><td class="right">-${currency(s.discount || 0)}</td></tr>
      <tr><td colspan="3" class="right">Tax (${s.taxPercent || 0}%)</td><td class="right">${currency(s.tax || 0)}</td></tr>
      <tr><td colspan="3" class="right total">Net Total</td><td class="right total">${currency(s.net)}</td></tr>
    </tfoot>
  </table>
  <p class="muted">Thank you! No returns without receipt.</p>
  <button onclick="window.print()">Print</button>
</body></html>`;
    const win = window.open("", "_blank", "width=420,height=600"); if (!win) return; win.document.open(); win.document.write(html); win.document.close(); setTimeout(() => win.print(), 300);
  };

  const buildCSVString = (rows) => {
    const header = ["id","time","mode","subTotal","discount","taxPercent","tax","net","items"];
    const lines = [header.join(",")];
    rows.forEach(r => {
      const items = (r.items || []).map(i => `${i.name} x${i.qty} @${i.price}`).join(" | ");
      const vals = [r.id, r.time, r.mode, r.subTotal ?? "", r.discount ?? "", r.taxPercent ?? "", r.tax ?? "", r.net ?? r.amount ?? "", items];
      lines.push(vals.map(v => `"${String(v).replace(/"/g,'""')}"`).join(","));
    });
    return lines.join("\n");
  };

  const exportCSV = (rows, filename = "payments.csv") => {
    const csv = buildCSVString(rows);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  };

  const checkout = async () => {
    if (!cart.length || isLoading) return;
    setIsLoading(true);
    try {
      await new Promise(r => setTimeout(r, 500));
      setProducts(prev => prev.map(p => { const line = cart.find(i => i.id === p.id); if (!line) return p; return { ...p, stock: Math.max(0, p.stock - line.qty) }; }));
      const sale = { id: Math.random().toString(36).slice(2), time: new Date().toISOString(), subTotal: totals.subTotal, discount: totals.disc, taxPercent: Number(taxPercent||0), tax: totals.tax, net: totals.net, amount: totals.net, mode: payMode, items: cart.map(i => ({ id:i.id, name:i.name, qty:i.qty, price:i.priceSnapshot })) };
      setSales(prev => [sale, ...prev]); clearCart();
      const toast = document.createElement('div'); toast.className = 'fixed top-4 right-4 px-6 py-3 rounded-xl shadow-lg z-50 transform transition-all duration-300 text-white'; toast.style.background = '#166534'; toast.innerHTML = `✅ Sale completed! Amount: ${currency(totals.net)} <button id="pos-print-btn" style="margin-left:8px;background:#fff;color:#166534;padding:4px 8px;border-radius:8px;">Print</button>`; document.body.appendChild(toast); toast.querySelector('#pos-print-btn')?.addEventListener('click', () => printReceipt(sale)); setTimeout(() => { toast.style.transform = 'translateX(140%)'; setTimeout(() => document.body.removeChild(toast), 300); }, 2200);
    } finally {
      setIsLoading(false);
    }
  };

  // Payments page state
  const [modeFilter, setModeFilter] = useState("ALL");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const applyQuickRange = (label) => {
    const now = new Date();
    const startOfDay = (d) => { const x = new Date(d); x.setHours(0,0,0,0); return x; };
    if (label === 'TODAY') { setFromDate(startOfDay(now).toISOString().slice(0,10)); setToDate(now.toISOString().slice(0,10)); }
    else if (label === '7D') { const s = new Date(now); s.setDate(now.getDate()-6); setFromDate(startOfDay(s).toISOString().slice(0,10)); setToDate(now.toISOString().slice(0,10)); }
    else if (label === '30D') { const s = new Date(now); s.setDate(now.getDate()-29); setFromDate(startOfDay(s).toISOString().slice(0,10)); setToDate(now.toISOString().slice(0,10)); }
    else { setFromDate(""); setToDate(""); }
    setPage(1);
  };

  const filteredSales = useMemo(() => sales.filter(s => {
    if (modeFilter !== "ALL" && s.mode !== modeFilter) return false;
    const t = new Date(s.time).getTime();
    if (fromDate && t < new Date(fromDate).getTime()) return false;
    if (toDate) { const end = new Date(toDate); end.setHours(23,59,59,999); if (t > end.getTime()) return false; }
    return true;
  }), [sales, modeFilter, fromDate, toDate]);

  const totalPages = Math.max(1, Math.ceil(filteredSales.length / pageSize));
  const pageSales = filteredSales.slice((page-1)*pageSize, page*pageSize);

  // Analytics data
  const [anaRange, setAnaRange] = useState(7);
  const lastNDays = (n=7) => { const arr=[]; const now = new Date(); for (let i=n-1;i>=0;i--){ const d = new Date(now); d.setDate(now.getDate()-i); arr.push(new Date(d.getFullYear(), d.getMonth(), d.getDate())); } return arr; };
  const days = lastNDays(anaRange);
  const salesByDay = days.map(d => { const key = d.toDateString(); const total = sales.filter(s => new Date(s.time).toDateString()===key).reduce((a,s)=>a+(s.net??s.amount??0),0); return { date: `${d.getDate()}/${d.getMonth()+1}`, total }; });
  const movingAvg = salesByDay.map((row, idx, arr) => ({ date: row.date, ma: (arr.slice(Math.max(0, idx-2), idx+1).reduce((a,r)=>a+r.total,0))/Math.min(idx+1,3) }));
  const payModeAgg = ['CASH','UPI','CARD','CREDIT'].map(m => ({ name:m, value: sales.filter(s=>s.mode===m).reduce((a,s)=>a+(s.net??s.amount??0),0) }));
  const productAggMap = useMemo(() => { const m = new Map(); sales.forEach(s => s.items.forEach(i => m.set(i.name, (m.get(i.name)||0) + i.qty))); return m; }, [sales]);
  const topProducts = Array.from(productAggMap.entries()).map(([name,qty])=>({name, qty})).sort((a,b)=>b.qty-a.qty).slice(0,7);

  // Layout
  const touchStart = useRef(null);
  const handleTouchStart = (e) => { touchStart.current = e.touches[0].clientX; };
  const handleTouchEnd = (e) => { if (!touchStart.current) return; const diff = touchStart.current - e.changedTouches[0].clientX; if (Math.abs(diff) > 100) { if (diff > 0) setCartOpen(true); else setCartOpen(false); } touchStart.current = null; };

  return (
    <BrowserRouter>
      <div className="min-h-screen" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
        <Nav />

        {/* Search + Categories bar (POS only) */}
        <main className="max-w-7xl mx-auto w-full px-3 md:px-4 py-4 grid grid-cols-12 gap-3 md:gap-4">
          {/* Sidebar */}
          <aside className="hidden lg:block col-span-3 xl:col-span-2">
            <div className="card p-3 sticky top-24">
              <div className="text-sm font-semibold text-white/80">Categories</div>
              <div className="mt-2 space-y-2">
                {categories.map((c) => (
                  <button key={c} onClick={() => setCategory(c)} className={`w-full text-left px-3 py-2 rounded-xl border transition-all ${category===c? 'bg-accent-red text-white border-accent-red shadow-[0_0_0_3px_var(--tw-color-accent-ring)]' : 'bg-bg-soft border-neutral-800 hover:bg-bg-muted'}`}>
                    <div className="text-sm font-medium">{c}</div>
                    <div className="text-xs opacity-75">{c === "All" ? products.length : products.filter(p => p.category === c).length} items</div>
                  </button>
                ))}
              </div>
              <div className="mt-3">
                <label className="text-xs text-white/60">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-5 w-5 text-neutral-500" />
                  <input value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="Search Products..." className="input w-full pl-10" />
                </div>
              </div>
            </div>
          </aside>

          {/* Route Outlet Area */}
          <section className="col-span-12 lg:col-span-9 xl:col-span-10">
            <Routes>
              <Route path="/" element={<POSPanel {...{ showLowStock, lowStockItems, outOfStockItems, gridLayout, filteredProducts, remainingStock, lowStockThreshold, addToCart, totals, clearCart, cart, dec, inc, removeLine, discount, setDiscount, taxPercent, setTaxPercent, lowStockThresholdState: lowStockThreshold, setLowStockThreshold, sku, setSku, onQuickAdd, payMode, setPayMode, printReceipt, checkout, focusedCartIdRef }} />} />
              <Route path="/payments" element={<PaymentsPanel {...{ modeFilter, setModeFilter, fromDate, setFromDate, toDate, setToDate, applyQuickRange, filteredSales, pageSales, page, setPage, pageSize, setPageSize, totalPages, printReceipt, exportCSV }} />} />
              <Route path="/analytics" element={<AnalyticsPanel {...{ anaRange, setAnaRange, salesByDay, movingAvg, payModeAgg, topProducts, ww }} />} />
              <Route path="/profile" element={<ProfilePanel {...{ profile, setProfile, theme: 'dark', setTheme: ()=>{} }} />} />
            </Routes>
          </section>
        </main>

        {isLoading && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-bg-card rounded-2xl p-6 flex flex-col items-center">
              <Loader2 className="h-8 w-8 animate-spin text-white" />
              <div className="mt-2 font-medium text-white">Processing...</div>
            </div>
          </div>
        )}

        {isOffline && (
          <div className="fixed bottom-4 left-4 bg-accent-red text-white px-4 py-2 rounded-xl shadow-lg">
            You are offline. Changes will sync when back online.
          </div>
        )}

        <footer className="py-6 text-center text-xs text-white/40">
          99 Market — POS. Shortcuts: <kbd>Ctrl+Enter</kbd> checkout, <kbd>+</kbd>/<kbd>-</kbd> adjust, <kbd>Del</kbd> remove.
        </footer>
      </div>
    </BrowserRouter>
  );
}
