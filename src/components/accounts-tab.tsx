'use client';

import { useState, useEffect, useMemo } from 'react';
import { db } from '@/firebase/firestore';
import { collection, getDocs, query, orderBy, where } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon, BarChart3, CheckCircle, Package, TrendingUp, Percent, ArrowUpRight, ArrowDownRight, IndianRupee, ShoppingBag } from 'lucide-react';
import { DateRange } from 'react-day-picker';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Line, Pie } from 'react-chartjs-2';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Tooltip, Legend);

/* Utility date helpers */
function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0, 0);
}
function endOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
}
function startOfDay(d: Date) {
  const dd = new Date(d);
  dd.setHours(0, 0, 0, 0);
  return dd;
}
function endOfDay(d: Date) {
  const dd = new Date(d);
  dd.setHours(23, 59, 59, 999);
  return dd;
}

export default function AccountsTab() {
  const [events, setEvents] = useState<any[]>([]);
  const [totalSales, setTotalSales] = useState(0);
  const [totalProfit, setTotalProfit] = useState(0);
  const [date, setDate] = useState<DateRange | undefined>();
  const [selectedMonth, setSelectedMonth] = useState<Date | null>(null);
  const [availableMonths, setAvailableMonths] = useState<Date[]>([]);

  // AI summary state
  const [aiSummary, setAiSummary] = useState<{ summaryPoints: string[]; overallMessage: string } | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiLanguage, setAiLanguage] = useState<'en' | 'hi' | 'kn'>('en');

  const rankGradients = [
    "from-yellow-400 to-yellow-600",  // Top 1 – Gold
    "from-gray-300 to-gray-500",      // Top 2 – Silver
    "from-amber-600 to-amber-800",    // Top 3 – Bronze
  ];


  // months dropdown
  useEffect(() => {
    const months: Date[] = [];
    const now = new Date();
    for (let i = 0; i < 24; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push(d);
    }
    setAvailableMonths(months);
  }, []);

  // fetch events
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const baseQuery = collection(db, 'inventory_events');

        let start: Date | undefined;
        let end: Date | undefined;

        if (selectedMonth) {
          start = startOfMonth(selectedMonth);
          end = endOfMonth(selectedMonth);
        } else if (date?.from) {
          start = startOfDay(date.from);
          end = date.to ? endOfDay(date.to) : endOfDay(date.from);
        } else {
          const fallbackEnd = new Date();
          const fallbackStart = new Date();
          fallbackStart.setDate(fallbackStart.getDate() - 90);
          start = fallbackStart;
          end = fallbackEnd;
        }

        const eventsQuery = query(baseQuery, orderBy('timestamp', 'desc'), where('timestamp', '>=', start), where('timestamp', '<=', end));
        const querySnapshot = await getDocs(eventsQuery);
        const eventsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        setEvents(eventsData);

        const sales = eventsData
          .filter((e: any) => e.type === 'sell')
          .reduce((acc: number, curr: any) => acc + (Number(curr.sellingPrice ?? 0) * Number(curr.quantity ?? 0)), 0);
        setTotalSales(sales);

        const profit = eventsData
          .filter((e: any) => e.type === 'sell')
          .reduce((acc: number, curr: any) => acc + (Number(curr.profit ?? 0)), 0);
        setTotalProfit(profit);
      } catch (err) {
        console.error('fetchEvents error', err);
      }
    };

    fetchEvents().catch(err => console.error(err));
  }, [selectedMonth, date]);

  // prev month events for growth
  const [prevMonthEvents, setPrevMonthEvents] = useState<any[] | null>(null);
  useEffect(() => {
    if (!selectedMonth) {
      setPrevMonthEvents(null);
      return;
    }

    const fetchPrev = async () => {
      try {
        const prev = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() - 1, 1);
        const start = startOfMonth(prev);
        const end = endOfMonth(prev);

        const baseQuery = collection(db, 'inventory_events');
        const q = query(baseQuery, orderBy('timestamp', 'desc'), where('timestamp', '>=', start), where('timestamp', '<=', end));
        const snap = await getDocs(q);
        setPrevMonthEvents(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (err) {
        console.error('fetchPrev error', err);
        setPrevMonthEvents(null);
      }
    };

    fetchPrev().catch(err => console.error(err));
  }, [selectedMonth]);

  // derived metrics
  const totalOrders = useMemo(() => events.filter(e => e.type === 'sell').length, [events]);
  const unitsSold = useMemo(() => events.filter(e => e.type === 'sell').reduce((s, e) => s + (Number(e.quantity ?? 0)), 0), [events]);
  const avgOrderValue = totalOrders ? totalSales / totalOrders : 0;
  const unitsPerOrder = totalOrders ? unitsSold / totalOrders : 0;
  const revenuePerUnit = unitsSold ? totalSales / unitsSold : 0;
  const totalEvents = events.length;
  const completedOrders = totalOrders;

  const productStats = useMemo(() => {
    const byProduct: Record<string, { name: string; revenue: number; units: number; orders: number; profit: number }> = {};

    for (const e of events.filter(ev => ev.type === 'sell')) {
      const name = e.name ?? 'Unnamed Product';
      if (!byProduct[name]) byProduct[name] = { name, revenue: 0, units: 0, orders: 0, profit: 0 };
      byProduct[name].revenue += Number(e.sellingPrice ?? 0) * Number(e.quantity ?? 0);
      byProduct[name].units += Number(e.quantity ?? 0);
      byProduct[name].orders += 1;
      byProduct[name].profit += Number(e.profit ?? 0);
    }

    const arr = Object.values(byProduct).sort((a, b) => b.revenue - a.revenue);
    return arr;
  }, [events]);

  const topProducts = productStats.slice(0, 3);
  const productGrowth = (productName: string) => {
    if (!prevMonthEvents) return 0;
    const thisRev = events.filter(e => e.type === 'sell' && e.name === productName).reduce((s, e) => s + Number(e.sellingPrice ?? 0) * Number(e.quantity ?? 0), 0);
    const prevRev = prevMonthEvents.filter(e => e.type === 'sell' && e.name === productName).reduce((s, e) => s + Number(e.sellingPrice ?? 0) * Number(e.quantity ?? 0), 0);
    if (prevRev === 0) return thisRev === 0 ? 0 : 100;
    return ((thisRev - prevRev) / prevRev) * 100;
  };

  // charts
  const lineLabels = events
    .filter(e => e.type === 'sell')
    .map(e => {
      const ts = e.timestamp?.seconds ? new Date(e.timestamp.seconds * 1000) : new Date(e.timestamp);
      return ts.toLocaleDateString();
    })
    .reverse();

  const salesData = events
    .filter(e => e.type === 'sell')
    .map(e => Number(e.sellingPrice ?? 0) * Number(e.quantity ?? 0))
    .reverse();

  const profitData = events
    .filter(e => e.type === 'sell')
    .map(e => Number(e.profit ?? 0))
    .reverse();

  const lineChartData = (label: string, data: number[]) => ({
    labels: lineLabels,
    datasets: [
      {
        label,
        data,
        borderColor: label === 'Sales' ? '#3B82F6' : '#10B981',
        backgroundColor: label === 'Sales' ? 'rgba(59, 130, 246, 0.15)' : 'rgba(16, 185, 129, 0.15)',
        borderWidth: 2,
        tension: 0.3,
        fill: true,
        pointRadius: 3,
      },
    ],
  });

  // pie
  const pieLabels = [...new Set(events.filter(e => e.type === 'sell').map(e => e.name || 'Unnamed'))];
  const pieValues = pieLabels.map(label => events.filter(e => e.type === 'sell' && (e.name ?? 'Unnamed') === label).reduce((acc, curr) => acc + Number(curr.profit ?? 0), 0));
  const pieChartData = {
    labels: pieLabels,
    datasets: [
      {
        data: pieValues,
        backgroundColor: ['#3B82F6', '#F97316', '#10B981', '#E11D48', '#8B5CF6', '#F59E0B', '#06B6D4'],
        borderColor: '#ffffff',
        borderWidth: 1,
      },
    ],
  };

  const formatINR = (value: number) => value.toLocaleString('en-IN', { maximumFractionDigits: 2 });

  /* -------- AI SUMMARY INTERACTION -------- */

  // Prepare payload for summary
  const prepareSummaryPayload = () => {
    return {
      totalSales,
      totalProfit,
      totalOrders,
      unitsSold,
      avgOrderValue,
      unitsPerOrder,
      revenuePerUnit,
      selectedMonth: selectedMonth ? selectedMonth.toISOString() : undefined,
      language: aiLanguage,
      languageLabel: aiLanguage === 'en' ? 'English' : aiLanguage === 'hi' ? 'Hindi' : 'Kannada',
      productStats: productStats.map(p => ({
        name: p.name,
        revenue: p.revenue,
        units: p.units,
        orders: p.orders,
        profit: p.profit,
        growth: productGrowth(p.name),
      })),
    };
  };

  const callAiSummary = async () => {
    setAiError(null);
    setAiLoading(true);
    setAiSummary(null);

    try {
      const payload = prepareSummaryPayload();
      const res = await fetch('/api/get-accounts-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!data.ok) {
        throw new Error(data.error || 'AI service error');
      }

      setAiSummary(data.result);
    } catch (err: any) {
      console.error('AI summary error', err);
      setAiError(err?.message || 'Failed to generate summary');
    } finally {
      setAiLoading(false);
    }
  };

  const copySummary = async () => {
    if (!aiSummary) return;
    const text = [...aiSummary.summaryPoints, '', aiSummary.overallMessage].join('\n');
    await navigator.clipboard.writeText(text);
    // small inline feedback could be shown — for brevity omitted.
  };

  /* Auto-generate summary when filters change (optional) */
  useEffect(() => {
    // Do not auto-run if there's no data
    if (totalOrders === 0) return;
    // small debounce not implemented for brevity; trigger once
    // callAiSummary();
  }, [selectedMonth, date]); // currently commented out to avoid quota; user can press button

  /* -------- RENDER -------- */

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Accounts Dashboard</CardTitle>
        </CardHeader>
        <CardContent>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4 mb-6">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium mr-2">Select Month</label>
              <select
                value={selectedMonth ? selectedMonth.toISOString() : ''}
                onChange={(e) => {
                  if (!e.target.value) {
                    setSelectedMonth(null);
                  } else {
                    setSelectedMonth(new Date(e.target.value));
                  }
                }}
                className="border rounded px-3 py-1"
              >
                <option value="">-- All / Range --</option>
                {availableMonths.map((m) => (
                  <option key={m.toISOString()} value={m.toISOString()}>
                    {format(m, 'LLLL yyyy')}
                  </option>
                ))}
              </select>
              <Button variant="outline" onClick={() => setSelectedMonth(null)}>Clear Month</Button>
            </div>

            <div className="flex items-center gap-2 mt-3 sm:mt-0">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="date"
                    variant="outline"
                    className={cn("w-[300px] justify-start text-left font-normal", !date && "text-muted-foreground")}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date?.from ? (
                      date.to ? `${format(date.from, "LLL dd, y")} - ${format(date.to, "LLL dd, y")}`
                        : format(date.from, "LLL dd, y")
                    ) : (
                      <span>Pick a date range</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="range"
                    selected={date}
                    onSelect={(d) => {
                      setDate(d as DateRange | undefined);
                      setSelectedMonth(null);
                    }}
                    numberOfMonths={2}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>

              <Button variant="outline" onClick={() => { setDate(undefined); setSelectedMonth(null); }}>Reset</Button>
            </div>

            {/* AI controls */}
            <div className="ml-auto mt-3 sm:mt-0 flex items-center gap-2">
              <select
                value={aiLanguage}
                onChange={(e) => setAiLanguage(e.target.value as any)}
                className="border rounded px-2 py-1"
                title="Summary language"
              >
                <option value="en">English</option>
                <option value="hi">Hindi</option>
                <option value="kn">Kannada</option>
              </select>

              <Button onClick={callAiSummary} disabled={aiLoading || totalOrders === 0}>
                {aiLoading ? 'Summarizing...' : 'Generate Summary'}
              </Button>

              <Button variant="ghost" onClick={() => { setAiSummary(null); setAiError(null); setAiLoading(false); }}>
                Clear
              </Button>
            </div>
          </div>
          {/* AI Summary — Improved Chat Assistant UI */}
          <div className="mt-12 mb-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 
                    text-white flex items-center justify-center shadow-md">
                🤖
              </div>
              <h3 className="text-xl font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 
                   bg-clip-text text-transparent">
                AI Assistant Summary
              </h3>
            </div>

            <div className="flex gap-4 items-start">

              {/* Right side - Chat messages container */}
              <div className="flex-1 space-y-3">

                {/* Loader bubble */}
                {aiLoading && (
                  <div className="flex justify-start animate-fadeIn">
                    <div className="max-w-[75%] bg-white/80 backdrop-blur-sm border border-gray-200 
                          p-4 rounded-2xl shadow-sm">
                      <div className="flex gap-2">
                        <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" />
                        <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce delay-150" />
                        <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce delay-300" />
                      </div>
                    </div>
                  </div>
                )}

                {/* Error bubble */}
                {aiError && (
                  <div className="flex justify-start animate-fadeIn">
                    <div className="max-w-[75%] bg-red-50 border border-red-200 p-4 
                          rounded-2xl text-sm text-red-700 shadow-sm">
                      ❌ {aiError}
                    </div>
                  </div>
                )}

                {/* AI Summary bubble */}
                {aiSummary && (
                  <div className="flex justify-start animate-fadeIn">
                    <div className="max-w-[75%] bg-white/90 backdrop-blur-sm p-5 rounded-2xl shadow-md 
                          border border-gray-200 transition-all">

                      {/* Bullet points */}
                      <div className="space-y-3">
                        {aiSummary.summaryPoints.map((p, i) => (
                          <div key={i} className="flex items-start gap-3 text-sm leading-relaxed">
                            <span className="mt-1 h-2 w-2 bg-purple-500 rounded-full flex-shrink-0"></span>
                            {p}
                          </div>
                        ))}
                      </div>

                      {/* Final message */}
                      <div className="mt-4 text-sm text-gray-500 border-t pt-3">
                        {aiSummary.overallMessage}
                      </div>

                      {/* Actions */}
                      <div className="mt-5 flex gap-3">
                        <Button size="sm" className="shadow-sm" onClick={copySummary}>
                          Copy
                        </Button>
                        <Button size="sm" variant="outline" className="shadow-sm" disabled={aiLoading}
                          onClick={callAiSummary}>
                          Regenerate
                        </Button>

                      </div>
                    </div>
                  </div>
                )}

                {/* Empty state bubble */}
                {!aiLoading && !aiSummary && !aiError && (
                  <div className="flex justify-start animate-fadeIn">
                    <div className="max-w-[75%] bg-gray-50 border border-gray-200 p-4 rounded-2xl shadow-sm 
                          text-sm text-gray-500">
                      No summary yet. Click <strong>Generate Summary</strong> to get a simple explanation
                      for the artisan.
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>



          {/* Monthly Summary Cards */}
          <h3 className="text-lg font-semibold mb-3">Monthly Summary</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
            <Card className="bg-gradient-to-br from-green-100 to-green-200 border-0 shadow-md">
              <CardContent className="pt-5">
                <p className="text-sm font-medium text-green-800">
                  Total Revenue {selectedMonth ? `(${format(selectedMonth, "LLLL yyyy")})` : ""}
                </p>
                <div className="flex items-center gap-1 text-3xl font-bold text-green-900 mt-1">
                  <IndianRupee className="h-5 w-5" />
                  {formatINR(totalSales)}
                </div>
                <p className="text-xs text-green-700 mt-1">This selection</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-100 to-blue-200 border-0 shadow-md">
              <CardContent className="pt-5">
                <p className="text-sm font-medium text-blue-800">Total Orders</p>
                <p className="text-3xl font-bold text-blue-900 mt-1">{totalOrders}</p>
                <p className="text-xs text-blue-700 mt-1">{unitsSold} units sold</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-100 to-orange-200 border-0 shadow-md">
              <CardContent className="pt-5">
                <p className="text-sm font-medium text-orange-800">Units Sold</p>
                <p className="text-3xl font-bold text-orange-900 mt-1">{unitsSold}</p>
                <p className="text-xs text-orange-700 mt-1">{totalOrders} orders</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-100 to-purple-200 border-0 shadow-md">
              <CardContent className="pt-5">
                <p className="text-sm font-medium text-purple-800">Avg Order Value</p>
                <div className="flex items-center gap-1 text-3xl font-bold text-purple-900 mt-1">
                  <IndianRupee className="h-5 w-5" />
                  {formatINR(avgOrderValue)}
                </div>
                <p className="text-xs text-purple-700 mt-1">Per transaction</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-teal-100 to-teal-200 border-0 shadow-md">
              <CardContent className="pt-5">
                <p className="text-sm font-medium text-teal-800">Units / Order</p>
                <p className="text-3xl font-bold text-teal-900 mt-1">{unitsPerOrder.toFixed(2)}</p>
                <p className="text-xs text-teal-700 mt-1">Average</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-yellow-100 to-yellow-200 border-0 shadow-md">
              <CardContent className="pt-5">
                <p className="text-sm font-medium text-yellow-800">Revenue / Unit</p>
                <p className="text-3xl font-bold text-yellow-900 mt-1 flex items-center gap-1">
                  <IndianRupee className="h-6 w-6 text-yellow-900" />
                  {formatINR(revenuePerUnit)}
                </p>
                <p className="text-xs text-yellow-700 mt-1">Average</p>
              </CardContent>
            </Card>
          </div>

          {/* Performance Overview */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Performance Overview</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
              <Card className="bg-gradient-to-br from-indigo-100 to-indigo-200 border-0 shadow-md">
                <CardContent className="pt-5">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-indigo-800">Total Events</p>
                      <p className="text-3xl font-bold text-indigo-900 mt-1">{totalEvents}</p>
                    </div>
                    <BarChart3 className="h-6 w-6 text-indigo-700" />
                  </div>
                  <p className="text-xs text-indigo-700 mt-2">All activity logs</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-emerald-100 to-emerald-200 border-0 shadow-md">
                <CardContent className="pt-5">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-emerald-800">Completed Orders</p>
                      <p className="text-3xl font-bold text-emerald-900 mt-1">{completedOrders}</p>
                    </div>
                    <CheckCircle className="h-6 w-6 text-emerald-700" />
                  </div>
                  <p className="text-xs text-emerald-700 mt-2">Successful sales</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-amber-100 to-amber-200 border-0 shadow-md">
                <CardContent className="pt-5">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-amber-800">Units Sold</p>
                      <p className="text-3xl font-bold text-amber-900 mt-1">{unitsSold}</p>
                    </div>
                    <Package className="h-6 w-6 text-amber-700" />
                  </div>
                  <p className="text-xs text-amber-700 mt-2">{completedOrders} orders</p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Top Products */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Top Products</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {topProducts.length === 0 && <p className="text-sm text-muted-foreground">No sales in this period.</p>}
              {topProducts.map((p, idx) => {
                const marketShare = totalSales ? (p.revenue / (totalSales || 1)) * 100 : 0;
                const growth = productGrowth(p.name);

                return (
                  <Card
                    key={p.name}
                    className={`
        p-4 rounded-2xl bg-white dark:bg-neutral-900
        shadow-md hover:shadow-xl
        border border-transparent hover:border-indigo-500/40
        transition-all duration-300 hover:-translate-y-1
        animate-fadeSlide
      `}
                  >

                    {/* Header */}
                    <div className="flex justify-between items-start">
                      <div>
                        {/* Rank Badge */}
                        <div
                          className={`
              text-xs px-2 py-0.5 rounded-full w-fit
              bg-gradient-to-r ${rankGradients[idx] ?? "from-indigo-500 to-rose-400"}
              text-white shadow-sm
            `}
                        >
                          Top {idx + 1}
                        </div>

                        <div className="font-semibold text-xl mt-3">{p.name}</div>

                        {/* Icons row */}
                        <div className="text-sm text-muted-foreground flex items-center gap-3 mt-1">
                          <span className="flex items-center gap-1">
                            <Package className="w-4 h-4 text-indigo-500" />
                            {p.units} units
                          </span>
                          <span className="flex items-center gap-1">
                            <ShoppingBag className="w-4 h-4 text-rose-500" />
                            {p.orders} orders
                          </span>
                        </div>
                      </div>

                      {/* Revenue */}
                      <div className="text-right">
                        <div className="flex items-center justify-end gap-1 text-xl font-bold
            bg-gradient-to-r from-indigo-500 to-rose-400 text-transparent bg-clip-text"
                        >
                          <IndianRupee className="h-5 w-5 text-indigo-500 dark:text-indigo-300" />
                          {formatINR(p.revenue)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {marketShare.toFixed(1)}% share
                        </div>
                      </div>
                    </div>

                    
                  </Card>
                );
              })}

            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader><CardTitle>Sales Trend</CardTitle></CardHeader>
              <CardContent>
                <Line data={lineChartData('Sales', salesData)} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Profit Trend</CardTitle></CardHeader>
              <CardContent>
                <Line data={lineChartData('Profit', profitData)} />
              </CardContent>
            </Card>
          </div>

          <Card className="mt-6">
            <CardHeader><CardTitle>Profit by Product</CardTitle></CardHeader>
            <CardContent className="w-[40%] mx-auto">
              <Pie data={pieChartData} />
            </CardContent>
          </Card>

          {/* Complete Rankings */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-4">Complete Product Rankings</h3>
            <div className="space-y-3">
              {productStats.length === 0 && <p className="text-sm text-muted-foreground">No sales to show.</p>}
              {productStats.map((p, index) => {
                const share = totalSales ? (p.revenue / totalSales) * 100 : 0;
                const margin = p.revenue ? (p.profit / p.revenue) * 100 : 0;
                const growth = productGrowth(p.name);

                return (
                  <Card key={p.name} className="border border-gray-200 shadow-sm hover:shadow-md transition-all rounded-xl p-4">
                    <div className="flex justify-between items-center">
                      <div className="flex items-start gap-4">
                        <div className="flex items-center justify-center h-10 w-10 rounded-full bg-gray-100 font-semibold text-gray-700 text-sm">
                          #{index + 1}
                        </div>

                        <div>
                          <p className="font-semibold text-base">{p.name}</p>
                          <p className="text-sm text-muted-foreground">{p.units} units • {p.orders} orders</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-8 text-right">
                        <div>
                          <p className="text-xs text-gray-500 flex items-center gap-1 justify-end"><TrendingUp className="h-3 w-3 text-green-600" /> Revenue</p>
                          <div className="flex items-center gap-1 justify-end font-semibold text-green-700"><IndianRupee className="h-5 w-5" />{formatINR(p.revenue)}</div>
                        </div>

                        <div>
                          <p className="text-xs text-gray-500 flex items-center gap-1 justify-end"><Percent className="h-3 w-3 text-blue-600" /> Margin</p>
                          <p className="font-semibold text-blue-700">{margin.toFixed(1)}%</p>
                        </div>

                        <div>
                          <p className="text-xs text-gray-500 flex items-center gap-1 justify-end">
                            {growth >= 0 ? (<ArrowUpRight className="h-3 w-3 text-emerald-600" />) : (<ArrowDownRight className="h-3 w-3 text-red-500" />)}
                            Growth
                          </p>
                          <p className={`font-semibold ${growth >= 0 ? "text-emerald-700" : "text-red-700"}`}>{growth.toFixed(1)}%</p>
                        </div>

                        <div>
                          <p className="text-xs text-gray-500 flex items-center gap-1 justify-end"><TrendingUp className="h-3 w-3 text-purple-600" /> Share</p>
                          <p className="font-semibold text-purple-700">{share.toFixed(1)}%</p>
                        </div>

                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Recent Sales */}
          <h3 className="text-lg font-semibold mt-8 mb-3">Recent Sales</h3>
          <div className="space-y-3">
            {events.filter(event => event.type === 'sell').map(event => (
              <Card key={event.id} className="border shadow-sm">
                <CardContent className="py-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-base">{event.name || 'Unnamed Product'}</p>
                      <p className="text-sm text-muted-foreground">
                        Sold on: {event.timestamp?.seconds ? new Date(event.timestamp.seconds * 1000).toLocaleDateString() : new Date(event.timestamp).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-sm">Qty: <span className="font-semibold">{event.quantity}</span></p>
                      <p className="text-sm flex items-center justify-end gap-1">Total:
                        <span className="font-semibold flex items-center"><IndianRupee className="h-4 w-4" />{formatINR(Number(event.sellingPrice ?? 0) * Number(event.quantity ?? 0))}</span>
                      </p>
                      <p className="text-sm flex items-center justify-end gap-1">Profit:
                        <span className="font-bold text-green-600 flex items-center"><IndianRupee className="h-4 w-4" />{formatINR(Number(event.profit ?? 0))}</span>
                      </p>
                    </div>

                  </div>
                </CardContent>
              </Card>
            ))}
          </div>


        </CardContent>
      </Card>
    </div>
  );
}
