import React, { useEffect, useState } from 'react';
import { 
    AreaChart, Area, 
    BarChart, Bar,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import axios from '../../api/axios';

const SalesChart = ({ window = '30D', setWindow }) => {
  const [data, setData] = useState([]);
  const [chartType, setChartType] = useState('area'); // 'area' or 'bar'

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await axios.get('/admin/analytics/daily-sales', {
            params: { window }
        });
        
        const chartData = Object.entries(res.data).map(([date, sales]) => ({
            date,
            sales
        }));

        if (chartData.length === 0) {
           setData([
               { date: 'Trend Start', sales: 0 },
               { date: 'Trend End', sales: 0 },
           ]);
        } else {
           setData(chartData);
        }
      } catch (err) {
        console.error("Chart failure", err);
      }
    };
    fetchAnalytics();
  }, [window]);

  const sharedAxisProps = {
    axisLine: false,
    tickLine: false,
    tick: { fontSize: 9, fontWeight: 700, fill: '#71717a' },
  };

  return (
    <div className="bg-white border border-[#e2e8f0] p-8 rounded-sm shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
      <div className="flex justify-between items-center mb-10">
          <div>
              <h3 className="text-[11px] font-black uppercase tracking-[0.25em] text-zinc-950/30">Sales Trajectory</h3>
              <p className="text-lg font-bold tracking-tighter text-zinc-950">Daily Volume Analytics</p>
          </div>
          <div className="flex items-center gap-6">
              {/* chart type toggle */}
              <div className="flex items-center gap-1 bg-zinc-100 p-1 rounded-sm">
                  <button
                      onClick={() => setChartType('area')}
                      className={`text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-sm transition-all ${
                          chartType === 'area' 
                              ? 'bg-zinc-950 text-white' 
                              : 'text-zinc-950/40 hover:text-zinc-950'
                      }`}
                  >
                      Line
                  </button>
                  <button
                      onClick={() => setChartType('bar')}
                      className={`text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-sm transition-all ${
                          chartType === 'bar' 
                              ? 'bg-zinc-950 text-white' 
                              : 'text-zinc-950/40 hover:text-zinc-950'
                      }`}
                  >
                      Bar
                  </button>
              </div>

              <div className="flex items-center gap-3">
                  <span className="w-2 h-2 bg-zinc-950 rounded-full"></span>
                  <select 
                    value={window}
                    onChange={(e) => setWindow(e.target.value)}
                    className="text-[10px] font-bold uppercase tracking-widest text-zinc-950/40 bg-transparent border-none outline-none cursor-pointer hover:text-zinc-950 transition-colors"
                  >
                      <option value="2W">2W Window</option>
                      <option value="30D">30D Window</option>
                      <option value="6M">6M Window</option>
                      <option value="1Y">1Y Window</option>
                      <option value="ALL">All Time</option>
                  </select>
              </div>
          </div>
      </div>
      
      <div style={{ width: '100%', height: 350 }}>
        <ResponsiveContainer width="100%" height={350}>
          {chartType === 'bar' ? (
            <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity={1} />
                  <stop offset="100%" stopColor="#06b6d4" stopOpacity={0.8} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="date" dy={10} {...sharedAxisProps} />
              <YAxis {...sharedAxisProps} />
              <Tooltip 
                formatter={(val) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val)}
                contentStyle={{ borderRadius: '0px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                itemStyle={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase' }}
                cursor={{ fill: '#f4f4f5' }}
              />
              <Bar dataKey="sales" fill="url(#barGradient)" radius={[3, 3, 0, 0]} maxBarSize={40} />
            </BarChart>
          ) : (
            <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#09090b" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#09090b" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="date" dy={10} {...sharedAxisProps} />
              <YAxis {...sharedAxisProps} />
              <Tooltip 
                formatter={(val) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val)}
                contentStyle={{ borderRadius: '0px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                itemStyle={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase' }}
              />
              <Area 
                  type="monotone" 
                  dataKey="sales" 
                  stroke="#09090b" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorSales)" 
              />
            </AreaChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SalesChart;
