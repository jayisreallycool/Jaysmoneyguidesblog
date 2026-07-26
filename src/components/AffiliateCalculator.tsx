import React, { useState } from 'react';
import { Calculator, DollarSign, TrendingUp, Users, ArrowRight } from 'lucide-react';

export const AffiliateCalculator: React.FC = () => {
  const [monthlyVisitors, setMonthlyVisitors] = useState<number>(10000);
  const [clickRate, setClickRate] = useState<number>(3.5); // % of visitors clicking affiliate links
  const [conversionRate, setConversionRate] = useState<number>(2.5); // % of clicks buying product
  const [averageCommission, setAverageCommission] = useState<number>(45); // $ commission per sale

  const monthlyClicks = Math.round((monthlyVisitors * clickRate) / 100);
  const monthlySales = Math.round((monthlyClicks * conversionRate) / 100);
  const estimatedMonthlyRevenue = Math.round(monthlySales * averageCommission);
  const estimatedAnnualRevenue = estimatedMonthlyRevenue * 12;

  return (
    <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 my-8 border border-emerald-500/30 shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30">
          <Calculator className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            Affiliate Revenue Estimator
            <span className="text-xs bg-emerald-500/20 text-emerald-300 font-medium px-2.5 py-0.5 rounded-full border border-emerald-500/30">
              Interactive Tool
            </span>
          </h3>
          <p className="text-xs text-slate-400">Calculate your potential earnings based on traffic & SaaS commission metrics</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Controls */}
        <div className="space-y-5">
          <div>
            <div className="flex justify-between text-sm mb-1.5 font-medium">
              <label htmlFor="calc-monthly-visitors" className="text-slate-300 flex items-center gap-1.5 cursor-pointer">
                <Users className="w-4 h-4 text-emerald-400" /> Monthly Blog Traffic
              </label>
              <span className="text-emerald-400 font-bold">{monthlyVisitors.toLocaleString()} visitors</span>
            </div>
            <input
              id="calc-monthly-visitors"
              name="monthlyVisitors"
              type="range"
              min="1000"
              max="200000"
              step="1000"
              value={monthlyVisitors}
              onChange={(e) => setMonthlyVisitors(Number(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
          </div>

          <div>
            <div className="flex justify-between text-sm mb-1.5 font-medium">
              <label htmlFor="calc-click-rate" className="text-slate-300 cursor-pointer">
                Affiliate Link Click-Through Rate (CTR)
              </label>
              <span className="text-emerald-400 font-bold">{clickRate}%</span>
            </div>
            <input
              id="calc-click-rate"
              name="clickRate"
              type="range"
              min="0.5"
              max="15"
              step="0.5"
              value={clickRate}
              onChange={(e) => setClickRate(Number(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
          </div>

          <div>
            <div className="flex justify-between text-sm mb-1.5 font-medium">
              <label htmlFor="calc-conversion-rate" className="text-slate-300 cursor-pointer">
                Offer Sales Conversion Rate
              </label>
              <span className="text-emerald-400 font-bold">{conversionRate}%</span>
            </div>
            <input
              id="calc-conversion-rate"
              name="conversionRate"
              type="range"
              min="0.5"
              max="10"
              step="0.5"
              value={conversionRate}
              onChange={(e) => setConversionRate(Number(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
          </div>

          <div>
            <div className="flex justify-between text-sm mb-1.5 font-medium">
              <label htmlFor="calc-average-commission" className="text-slate-300 cursor-pointer">
                Average Commission / Buyer
              </label>
              <span className="text-emerald-400 font-bold">${averageCommission}/mo</span>
            </div>
            <input
              id="calc-average-commission"
              name="averageCommission"
              type="range"
              min="5"
              max="200"
              step="5"
              value={averageCommission}
              onChange={(e) => setAverageCommission(Number(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
          </div>
        </div>

        {/* Results Card */}
        <div className="bg-slate-800/80 rounded-xl p-6 border border-slate-700/80 flex flex-col justify-between">
          <div>
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-2 block">
              Estimated Monthly Revenue
            </span>
            <div className="text-4xl sm:text-5xl font-black text-white tracking-tight mb-2 flex items-baseline gap-1">
              <span className="text-emerald-400">$</span>
              {estimatedMonthlyRevenue.toLocaleString()}
              <span className="text-sm font-normal text-slate-400">/ month</span>
            </div>
            <p className="text-xs text-slate-400 mb-6">
              Recurring income baseline assuming 90%+ annual retention rate.
            </p>

            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-700/60">
              <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-700/50">
                <p className="text-xs text-slate-400">Est. Clicks</p>
                <p className="text-lg font-bold text-white">{monthlyClicks.toLocaleString()}</p>
              </div>
              <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-700/50">
                <p className="text-xs text-slate-400">Est. Buyers</p>
                <p className="text-lg font-bold text-emerald-400">{monthlySales.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-700/60 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400">Annual Run-Rate</p>
              <p className="text-xl font-bold text-emerald-300">${estimatedAnnualRevenue.toLocaleString()} / yr</p>
            </div>
            <div className="flex items-center text-xs font-medium text-emerald-400 bg-emerald-950/60 px-3 py-1.5 rounded-lg border border-emerald-800">
              <TrendingUp className="w-3.5 h-3.5 mr-1" /> Recurring
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
