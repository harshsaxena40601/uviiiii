import React from "react";
import { ResponsiveContainer, CartesianGrid, Tooltip, PieChart, Pie, Cell, BarChart, Bar, Legend, LineChart, Line, XAxis, YAxis } from "recharts";
import { currency } from "../../utils/currency";
import { BarChart3 } from "lucide-react";

export default function AnalyticsPanel({ anaRange, setAnaRange, salesByDay, movingAvg, payModeAgg, topProducts, ww }) {
  return (
    <section className="col-span-12">
      <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-bg-soft p-3 md:p-4 mb-3 flex items-center justify-between gap-2">
        <div className="inline-flex items-center gap-2"><BarChart3 className="h-5 w-5"/><span className="font-semibold">Analytics</span></div>
        <div className="inline-flex items-center gap-2 text-sm"><span>Range</span>
          {[7,14,30,90].map(n => (
            <button key={n} onClick={()=>setAnaRange(n)} className={`px-2 py-1 rounded-lg border ${anaRange===n? 'bg-accent-red text-white border-orange-500' : ''}`}>{n}D</button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-12 gap-3 md:gap-4">
        <div className="col-span-12 lg:col-span-8 rounded-2xl border bg-bg-soft p-3 md:p-4">
          <div className="font-semibold mb-2">Net Sales (Last {anaRange} Days)</div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={salesByDay} margin={{ left: 10, right: 10, top: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(v)=>currency(v)} />
                <Line type="monotone" dataKey="total" dot={false} stroke="#f97316" />
                <Line type="monotone" dataKey="ma" data={movingAvg} dot={false} stroke="#6366f1" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-4 rounded-2xl border bg-bg-soft p-3 md:p-4">
          <div className="font-semibold mb-2">Payment Modes</div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={payModeAgg} dataKey="value" nameKey="name" outerRadius={90} label>
                  {payModeAgg.map((_, i) => <Cell key={i} fill={["#22c55e","#3b82f6","#f97316","#a78bfa"][i%4]} />)}
                </Pie>
                <Legend />
                <Tooltip formatter={(v)=>currency(v)} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="col-span-12 rounded-2xl border bg-bg-soft p-3 md:p-4">
          <div className="font-semibold mb-2">Top Products (by Qty)</div>
          <div className="h-64">
            {topProducts.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topProducts} margin={{ left: 10, right: 10, top: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" hide={ww < 640} />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="qty" fill="#f97316" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-neutral-500">No sales yet — make your first sale to see insights.</div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
