import React, { useState } from 'react';
import {
  BarChart, Bar, ScatterChart, Scatter, ZAxis, ReferenceLine, ReferenceArea,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import {
  Activity, Clock, AlertTriangle, CheckCircle,
  Calendar, Download, Settings, Search, Filter, X
} from 'lucide-react';

// --- Mock Data ---

// 1. 顶部 KPI 数据
const kpiData = [
  { title: '总故障次数', value: '42 次', sub: '环比 +5%', icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50' },
  { title: '平均修复时长 (MTTR)', value: '2.5 h', sub: '目标 < 3.0 h', icon: Clock, color: 'text-orange-600', bg: 'bg-orange-50' },
  { title: '最长故障时长', value: '8.0 h', sub: '发生于 10-15', icon: Activity, color: 'text-blue-600', bg: 'bg-blue-50' },
  { title: '设备完好率 (OEE)', value: '98.5%', sub: '达标', icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
];

// 2. 中间左侧：故障原因散点图数据
const scatterData = [
  { name: '电机过热', x: 18, y: 1.5, z: 200, type: '硬件' },
  { name: '主轴异响', x: 5, y: 4.5, z: 500, type: '核心' },
  { name: '传感器失灵', x: 25, y: 0.5, z: 100, type: '电子' },
  { name: '系统卡死', x: 8, y: 0.8, z: 50, type: '软件' },
  { name: '皮带断裂', x: 12, y: 2.0, z: 150, type: '易耗' },
  { name: '润滑不足', x: 15, y: 1.0, z: 80, type: '保养' },
  { name: '电压波动', x: 3, y: 3.5, z: 300, type: '外部' },
];

// 3. 中间右侧：设备故障统计
const deviceFailureData = [
  { name: 'CNC-A1', count: 12 },
  { name: '注塑机-B2', count: 9 },
  { name: '包装机-C3', count: 8 },
  { name: 'AGV-04', count: 6 },
  { name: '空压机-D5', count: 5 },
  { name: '机械臂-E6', count: 4 },
];

// 4. 底部：每日故障趋势
const dailyFailureData = [
  { date: '10-01', count: 2 }, { date: '10-02', count: 1 }, { date: '10-03', count: 3 }, { date: '10-04', count: 0 },
  { date: '10-05', count: 4 }, { date: '10-06', count: 2 }, { date: '10-07', count: 1 }, { date: '10-08', count: 5 },
  { date: '10-09', count: 2 }, { date: '10-10', count: 3 }, { date: '10-11', count: 1 }, { date: '10-12', count: 0 },
  { date: '10-13', count: 2 }, { date: '10-14', count: 4 }, { date: '10-15', count: 6 }, { date: '10-16', count: 3 },
  { date: '10-17', count: 2 }, { date: '10-18', count: 1 }, { date: '10-19', count: 0 }, { date: '10-20', count: 2 },
];

const COLORS = ['#3b82f6', '#f43f5e', '#f59e0b', '#10b981', '#8b5cf6', '#ec4899', '#6366f1'];

// --- Helper Functions for Drill Down ---

// 模拟根据不同类型生成钻取数据
const generateDrillDownData = (type, key) => {
  const count = Math.floor(Math.random() * 5) + 3; // 生成3-8条模拟数据
  const details = [];

  for (let i = 0; i < count; i++) {
    details.push({
      id: `GD-${Math.floor(Math.random() * 10000)}`,
      device: type === 'device' ? key : `设备-${['A','B','C'][Math.floor(Math.random()*3)]}${Math.floor(Math.random()*10)}`,
      issue: type === 'reason' ? key : ['电机过热', '传感器故障', '皮带断裂', '系统异常'][Math.floor(Math.random() * 4)],
      date: type === 'date' ? key : `10-${Math.floor(Math.random() * 30) + 1}`.padStart(5, '0'),
      duration: `${(Math.random() * 4).toFixed(1)} h`,
      status: ['待处理', '维修中', '已完成'][Math.floor(Math.random() * 3)],
      person: ['张三', '李四', '王五'][Math.floor(Math.random() * 3)]
    });
  }
  return details;
};

// --- Components ---

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
        <div className="bg-white/95 backdrop-blur-sm p-3 border border-slate-200 shadow-xl rounded-lg text-xs z-50 ring-1 ring-slate-100">
          <p className="font-bold text-slate-800 mb-2 border-b border-slate-100 pb-1">{data.name || data.date}</p>
          <div className="space-y-1.5 text-slate-600">
            {data.x !== undefined && (
                <>
                  <div className="flex justify-between gap-4"><span className="text-slate-400">频次:</span> <span className="font-mono font-medium text-blue-600">{data.x} 次</span></div>
                  <div className="flex justify-between gap-4"><span className="text-slate-400">耗时:</span> <span className="font-mono font-medium text-amber-600">{data.y} h</span></div>
                  <div className="flex justify-between gap-4"><span className="text-slate-400">类型:</span> <span>{data.type}</span></div>
                </>
            )}
            {data.count !== undefined && (
                <div className="flex justify-between gap-4"><span className="text-slate-400">数量:</span> <span className="font-mono font-bold text-slate-800">{data.count} 次</span></div>
            )}
            <div className="mt-2 pt-1 border-t border-slate-100 text-[10px] text-slate-400 text-center">
              点击查看详情
            </div>
          </div>
        </div>
    );
  }
  return null;
};

// 钻取弹窗组件
const DrillDownModal = ({ isOpen, onClose, title, data }) => {
  if (!isOpen) return null;

  return (
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-[2px] z-50 flex items-center justify-center p-4 transition-opacity duration-300">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[80vh] flex flex-col animate-in fade-in zoom-in duration-200">
          {/* Header */}
          <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100">
            <div>
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <span className="w-1.5 h-5 bg-blue-600 rounded-full"></span>
                {title} - 详情列表
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">共找到 {data.length} 条相关记录</p>
            </div>
            <button
                onClick={onClose}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-auto p-6">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 sticky top-0">
              <tr className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <th className="px-4 py-3 rounded-tl-lg">工单编号</th>
                <th className="px-4 py-3">设备名称</th>
                <th className="px-4 py-3">故障原因</th>
                <th className="px-4 py-3">发生日期</th>
                <th className="px-4 py-3">修复耗时</th>
                <th className="px-4 py-3">负责人</th>
                <th className="px-4 py-3 rounded-tr-lg">状态</th>
              </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
              {data.map((row, idx) => (
                  <tr key={idx} className="hover:bg-blue-50/50 transition-colors text-sm text-slate-600">
                    <td className="px-4 py-3 font-mono text-blue-600 font-medium">{row.id}</td>
                    <td className="px-4 py-3 font-medium text-slate-700">{row.device}</td>
                    <td className="px-4 py-3">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600">
                      {row.issue}
                    </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs">{row.date}</td>
                    <td className="px-4 py-3 font-mono text-xs text-orange-600">{row.duration}</td>
                    <td className="px-4 py-3 text-xs">{row.person}</td>
                    <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        row.status === '待处理' ? 'bg-red-50 text-red-600 border-red-100' :
                            row.status === '维修中' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                'bg-emerald-50 text-emerald-600 border-emerald-100'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                          row.status === '待处理' ? 'bg-red-500' :
                              row.status === '维修中' ? 'bg-amber-500' :
                                  'bg-emerald-500'
                      }`}></span>
                      {row.status}
                    </span>
                    </td>
                  </tr>
              ))}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 rounded-b-xl flex justify-end">
            <button
                onClick={onClose}
                className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
            >
              关闭窗口
            </button>
          </div>
        </div>
      </div>
  );
};

export default function DeviceAnalysisReport() {
  const [startDate, setStartDate] = useState('2023-10-01');
  const [endDate, setEndDate] = useState('2023-10-30');

  // 钻取状态管理
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalData, setModalData] = useState([]);

  // 处理图表点击
  const handleChartClick = (data, type) => {
    if (!data) return;

    let key = '';
    let title = '';

    // 根据点击的数据类型设置标题和Key
    if (type === 'reason') {
      key = data.name; // 故障名称
      title = `故障分析：${key}`;
    } else if (type === 'device') {
      key = data.name; // 设备名称
      title = `设备档案：${key}`;
    } else if (type === 'date') {
      key = data.date; // 日期
      title = `每日详情：${key}`;
    }

    const details = generateDrillDownData(type, key);
    setModalTitle(title);
    setModalData(details);
    setModalOpen(true);
  };

  return (
      <div className="h-screen flex flex-col bg-slate-50 font-sans text-slate-800 overflow-hidden relative">

        {/* 钻取弹窗 */}
        <DrillDownModal
            isOpen={modalOpen}
            onClose={() => setModalOpen(false)}
            title={modalTitle}
            data={modalData}
        />

        {/* 定义 SVG 渐变 */}
        <svg style={{ height: 0, width: 0, position: 'absolute' }}>
          <defs>
            <linearGradient id="colorBar" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.9}/>
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.6}/>
            </linearGradient>
            <linearGradient id="colorBarOrange" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f97316" stopOpacity={0.9}/>
              <stop offset="95%" stopColor="#f97316" stopOpacity={0.6}/>
            </linearGradient>
            <linearGradient id="colorBarRed" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.9}/>
              <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.6}/>
            </linearGradient>
          </defs>
        </svg>

        {/* 1. Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 shadow-sm z-20">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg text-white shadow-blue-200 shadow-md">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-800 tracking-tight leading-none">设备故障分析看板</h1>
              <p className="text-[10px] text-slate-400 mt-1 uppercase font-medium tracking-wider">Device Failure Analysis</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center bg-slate-100 rounded-lg px-3 py-1.5 border border-slate-200 gap-2 shadow-inner">
              <Calendar className="w-4 h-4 text-slate-400" />
              <div className="flex items-center text-sm font-medium">
                <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="bg-transparent outline-none text-slate-600 cursor-pointer w-[110px] text-xs font-mono"
                />
                <span className="text-slate-300 mx-1">/</span>
                <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="bg-transparent outline-none text-slate-600 cursor-pointer w-[110px] text-xs font-mono"
                />
              </div>
            </div>

            <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-xs font-semibold shadow-md shadow-blue-100 transition-all active:scale-95">
              <Search className="w-3.5 h-3.5 mr-1.5" />
              查询
            </button>

            <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors border border-transparent hover:border-slate-200">
              <Download className="w-4 h-4" />
            </button>
            <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors border border-transparent hover:border-slate-200">
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* 2. Main Content */}
        <main className="flex-1 flex flex-col p-5 gap-5 overflow-hidden">

          {/* KPI Row */}
          <div className="grid grid-cols-4 gap-5 shrink-0 h-28">
            {kpiData.map((item, idx) => (
                <div key={idx} className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-gray-500">{item.title}</p>
                      <h3 className="text-2xl font-bold text-gray-900 mt-1">{item.value}</h3>
                    </div>
                    <div className={`p-2 rounded-lg ${item.bg}`}>
                      <item.icon className={`w-5 h-5 ${item.color}`} />
                    </div>
                  </div>
                  <div className="flex items-center mt-2">
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${item.bg} ${item.color}`}>
                  {item.sub}
                </span>
                  </div>
                </div>
            ))}
          </div>

          {/* Middle Row */}
          <div className="flex flex-1 gap-5 min-h-0">

            {/* 左侧：散点图 */}
            <div className="w-5/12 bg-white rounded-xl shadow-sm border border-slate-100 flex flex-col relative overflow-hidden">
              {/* Card Header */}
              <div className="px-5 py-4 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
                <h3 className="text-sm font-bold text-slate-700 flex items-center">
                  <span className="w-1.5 h-4 bg-blue-500 rounded-full mr-2"></span>
                  故障分布矩阵 (频次 vs 时长)
                </h3>
                <div className="flex gap-3 text-[10px] font-medium text-slate-400 bg-white px-2 py-1 rounded-full border border-slate-100 shadow-sm">
                  <span className="flex items-center"><span className="w-1.5 h-1.5 rounded-full bg-rose-500 mr-1.5"></span>重灾区</span>
                  <span className="flex items-center"><span className="w-1.5 h-1.5 rounded-full bg-amber-400 mr-1.5"></span>高频区</span>
                </div>
              </div>

              <div className="flex-1 w-full min-h-0 p-2">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />

                    {/* 背景警示区域 - 右上角 */}
                    <ReferenceArea x1={15} y1={2.5} fill="#fee2e2" fillOpacity={0.3} stroke="none" />

                    <XAxis
                        type="number"
                        dataKey="x"
                        name="频次"
                        tick={{fontSize: 10, fill: '#94a3b8'}}
                        axisLine={{ stroke: '#e2e8f0' }}
                        tickLine={false}
                        label={{ value: '发生频次 (次)', position: 'insideBottom', offset: -10, fontSize: 10, fill: '#cbd5e1' }}
                    />
                    <YAxis
                        type="number"
                        dataKey="y"
                        name="时长"
                        tick={{fontSize: 10, fill: '#94a3b8'}}
                        axisLine={{ stroke: '#e2e8f0' }}
                        tickLine={false}
                        label={{ value: '修复时长 (h)', angle: -90, position: 'insideLeft', fontSize: 10, fill: '#cbd5e1' }}
                    />
                    <ZAxis type="number" dataKey="z" range={[100, 800]} />
                    <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3', stroke: '#cbd5e1' }} />

                    {/* 象限参考线 */}
                    <ReferenceLine x={15} stroke="#94a3b8" strokeDasharray="3 3" strokeOpacity={0.5} />
                    <ReferenceLine y={2.5} stroke="#94a3b8" strokeDasharray="3 3" strokeOpacity={0.5} />

                    <Scatter
                        name="故障点"
                        data={scatterData}
                        onClick={(data) => handleChartClick(data, 'reason')}
                        cursor="pointer"
                    >
                      {scatterData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} fillOpacity={0.7} stroke="#fff" strokeWidth={2} />
                      ))}
                    </Scatter>
                  </ScatterChart>
                </ResponsiveContainer>

                {/* 象限文字标签 */}
                <div className="absolute top-16 right-6 text-[10px] font-bold text-rose-400 opacity-60 pointer-events-none">
                  严重 (High Impact)
                </div>
              </div>
            </div>

            {/* 右侧：设备故障统计 (Top) */}
            <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-100 flex flex-col">
              <div className="px-5 py-4 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
                <h3 className="text-sm font-bold text-slate-700 flex items-center">
                  <span className="w-1.5 h-4 bg-orange-500 rounded-full mr-2"></span>
                  故障设备 TOP 6
                </h3>
                <button className="text-slate-400 hover:text-slate-600"><Filter className="w-3.5 h-3.5" /></button>
              </div>
              <div className="flex-1 w-full min-h-0 p-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={deviceFailureData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis
                        dataKey="name"
                        tick={{fontSize: 11, fill: '#64748b', fontWeight: 500}}
                        axisLine={false}
                        tickLine={false}
                        dy={5}
                    />
                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{fontSize: 10, fill: '#94a3b8'}}
                    />
                    <Tooltip cursor={{fill: '#f8fafc'}} content={<CustomTooltip />} />
                    <Bar
                        dataKey="count"
                        fill="url(#colorBarOrange)"
                        radius={[6, 6, 0, 0]}
                        barSize={40}
                        onClick={(data) => handleChartClick(data, 'device')}
                        cursor="pointer"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Bottom Row */}
          <div className="h-[32%] bg-white rounded-xl shadow-sm border border-slate-100 flex flex-col shrink-0">
            <div className="px-5 py-3 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
              <h3 className="text-sm font-bold text-slate-700 flex items-center">
                <span className="w-1.5 h-4 bg-emerald-500 rounded-full mr-2"></span>
                每日故障趋势监控
              </h3>
              <div className="flex items-center gap-2 text-[10px] text-slate-500">
                <span className="w-2 h-2 rounded bg-blue-500 opacity-60"></span> 正常
                <span className="w-2 h-2 rounded bg-rose-500 ml-2"></span> 告警阈值({'>'}4)
              </div>
            </div>
            <div className="flex-1 w-full min-h-0 p-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyFailureData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                      dataKey="date"
                      axisLine={false}
                      tickLine={false}
                      tick={{fontSize: 10, fill: '#94a3b8'}}
                      dy={5}
                  />
                  <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{fontSize: 10, fill: '#94a3b8'}}
                      allowDecimals={false}
                  />
                  <Tooltip cursor={{fill: '#f8fafc'}} content={<CustomTooltip />} />
                  <Bar
                      dataKey="count"
                      radius={[4, 4, 0, 0]}
                      barSize={24}
                      onClick={(data) => handleChartClick(data, 'date')}
                      cursor="pointer"
                  >
                    {dailyFailureData.map((entry, index) => (
                        <Cell
                            key={`cell-${index}`}
                            fill={entry.count >= 5 ? 'url(#colorBarRed)' : 'url(#colorBar)'}
                        />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </main>
      </div>
  );
}