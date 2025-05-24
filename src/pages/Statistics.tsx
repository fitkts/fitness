import React, { useState, useEffect, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Calendar as CalendarIcon, TrendingUp, ListFilter, AlertCircle, Database, RefreshCw } from 'lucide-react';
import { getAllPayments } from '../database/ipcService';
import { Payment } from '../models/types';
import { useToast } from '../contexts/ToastContext';

// --- 타입 정의 ---
type ViewType = 'daily' | 'weekly' | 'monthly';

interface ProcessedData {
  name: string; // 날짜 또는 주차 또는 월
  매출: number;
  건수: number;
}

// Helper function to format currency
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(value);
};

// --- Statistics 컴포넌트 ---
const Statistics: React.FC = () => {
  const { showToast } = useToast();
  const [paymentsData, setPaymentsData] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const today = new Date();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  const [startDate, setStartDate] = useState<string>(firstDayOfMonth.toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState<string>(today.toISOString().split('T')[0]);
  const [viewType, setViewType] = useState<ViewType>('daily');
  const [statusFilter, setStatusFilter] = useState<'전체' | '완료' | '취소' | '환불'>('완료');

  // 데이터 로딩 함수
  const loadPaymentData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getAllPayments();
      if (response.success && response.data) {
        setPaymentsData(response.data);
        console.log('통계용 결제 데이터 로드 성공:', response.data.length, '건');
        console.log('완료:', response.data.filter(p => p.status === '완료').length, '건');
        console.log('취소:', response.data.filter(p => p.status === '취소').length, '건');
        console.log('환불:', response.data.filter(p => p.status === '환불').length, '건');
      } else {
        const errorMessage = response.error || '결제 데이터를 불러오는데 실패했습니다.';
        setError(errorMessage);
        console.error('결제 데이터 로드 실패:', errorMessage);
        showToast('error', errorMessage);
      }
    } catch (err: any) {
      const errorMessage = err.message || '결제 데이터를 불러오는 중 오류가 발생했습니다.';
      setError(errorMessage);
      console.error('결제 데이터 로딩 중 오류:', err);
      showToast('error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPaymentData();
  }, []);
  
  const refreshData = () => {
    console.log('통계 데이터 새로고침 시작');
    loadPaymentData().then(() => {
      showToast('success', '통계 데이터를 새로고침했습니다.');
    });
  };

  // 선택된 기간 및 통계 단위에 따라 데이터 가공
  const processedData = useMemo((): ProcessedData[] => {
    if (!paymentsData || paymentsData.length === 0) return [];

    const filtered = paymentsData.filter(p => {
      // Payment 타입의 paymentDate 사용 (YYYY-MM-DD 형식)
      const paymentDateStr = p.paymentDate.split('T')[0]; // ISO 문자열에서 날짜 부분만 추출
      const startDateStr = startDate;
      const endDateStr = endDate;
      
      const dateMatches = paymentDateStr >= startDateStr && paymentDateStr <= endDateStr;
      const statusMatches = statusFilter === '전체' || p.status === statusFilter;
      
      return dateMatches && statusMatches;
    });

    if (viewType === 'daily') {
      const dailyData: { [date: string]: { 매출: number; 건수: number } } = {};
      filtered.forEach(p => {
        const dateKey = p.paymentDate.split('T')[0]; // YYYY-MM-DD 형식으로 정규화
        if (!dailyData[dateKey]) dailyData[dateKey] = { 매출: 0, 건수: 0 };
        dailyData[dateKey].매출 += p.amount;
        dailyData[dateKey].건수 += 1;
      });
      return Object.entries(dailyData)
        .map(([date, data]) => ({ name: date, ...data }))
        .sort((a,b) => new Date(a.name).getTime() - new Date(b.name).getTime());
    } else if (viewType === 'weekly') {
      const weeklyData: { [week: string]: { 매출: number; 건수: number } } = {};
      filtered.forEach(p => {
        const d = new Date(p.paymentDate);
        const year = d.getFullYear();
        const week = Math.ceil((((d.getTime() - new Date(year, 0, 1).getTime()) / 86400000) + new Date(year, 0, 1).getDay() + 1) / 7);
        const weekLabel = `${year}-W${week.toString().padStart(2, '0')}`;
        if (!weeklyData[weekLabel]) weeklyData[weekLabel] = { 매출: 0, 건수: 0 };
        weeklyData[weekLabel].매출 += p.amount;
        weeklyData[weekLabel].건수 += 1;
      });
      return Object.entries(weeklyData)
        .map(([week, data]) => ({ name: week, ...data }))
        .sort((a,b) => a.name.localeCompare(b.name));
    } else { // monthly
      const monthlyData: { [month: string]: { 매출: number; 건수: number } } = {};
      filtered.forEach(p => {
        const monthLabel = p.paymentDate.substring(0, 7); // YYYY-MM
        if (!monthlyData[monthLabel]) monthlyData[monthLabel] = { 매출: 0, 건수: 0 };
        monthlyData[monthLabel].매출 += p.amount;
        monthlyData[monthLabel].건수 += 1;
      });
      return Object.entries(monthlyData)
        .map(([month, data]) => ({ name: month, ...data }))
        .sort((a,b) => a.name.localeCompare(b.name));
    }
  }, [paymentsData, startDate, endDate, viewType, statusFilter]);

  const summary = useMemo(() => {
    const totalSales = processedData.reduce((sum, item) => sum + item.매출, 0);
    const totalCount = processedData.reduce((sum, item) => sum + item.건수, 0);
    return {
      totalSales,
      totalCount,
      averageSalesPerTransaction: totalCount > 0 ? totalSales / totalCount : 0,
    };
  }, [processedData]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen p-6 bg-gray-50">
        <RefreshCw className="w-12 h-12 text-blue-500 animate-spin mb-4" />
        <p className="text-lg text-gray-600">통계 데이터를 불러오는 중입니다...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen p-6 bg-red-50">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <p className="text-lg text-red-700 mb-2">오류가 발생했습니다.</p>
        <p className="text-gray-600 mb-4">{error}</p>
         <button
            onClick={refreshData}
            className="mt-4 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 flex items-center transition-colors"
          >
            <RefreshCw size={18} className="mr-2" />
            다시 시도
        </button>
      </div>
    );
  }
  
  const quickDateRanges = [
    { label: '오늘', getRange: () => {
        const today = new Date().toISOString().split('T')[0];
        return { start: today, end: today };
    }},
    { label: '이번 주', getRange: () => {
        const today = new Date();
        const dayOfWeek = today.getDay(); // 0 (Sun) - 6 (Sat)
        const startDate = new Date(today);
        startDate.setDate(today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1)); // Monday as start of week
        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 6);
        return { start: startDate.toISOString().split('T')[0], end: endDate.toISOString().split('T')[0] };
    }},
    { label: '이번 달', getRange: () => {
        const today = new Date();
        const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
        const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];
        return { start: firstDay, end: lastDay };
    }},
    { label: '지난 달', getRange: () => {
        const today = new Date();
        const firstDay = new Date(today.getFullYear(), today.getMonth() - 1, 1).toISOString().split('T')[0];
        const lastDay = new Date(today.getFullYear(), today.getMonth(), 0).toISOString().split('T')[0];
        return { start: firstDay, end: lastDay };
    }}
  ];

  const handleQuickDateRange = (rangeGetter: () => {start: string, end: string}) => {
    const {start, end} = rangeGetter();
    setStartDate(start);
    setEndDate(end);
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">매출 통계</h1>
        <p className="text-gray-600 mt-1">기간별, 단위별 매출 현황을 확인하세요.</p>
      </header>

      {/* --- 컨트롤 패널 --- */}
      <div className="bg-white p-6 rounded-xl shadow-lg mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 items-end">
          {/* 기간 선택 */}
          <div className="lg:col-span-2">
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">기간 선택</label>
            <div className="flex flex-col sm:flex-row gap-2 items-center">
              <input
                type="date"
                id="startDate"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full sm:w-auto flex-grow border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2 text-sm"
              />
              <span className="text-gray-500 hidden sm:inline">~</span>
              <input
                type="date"
                id="endDate"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full sm:w-auto flex-grow border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2 text-sm"
              />
            </div>
             <div className="mt-2 flex flex-wrap gap-2">
                {quickDateRanges.map(qdr => (
                    <button 
                        key={qdr.label}
                        onClick={() => handleQuickDateRange(qdr.getRange)}
                        className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                    >
                        {qdr.label}
                    </button>
                ))}
            </div>
          </div>

          {/* 통계 단위 선택 */}
          <div>
            <label htmlFor="viewType" className="block text-sm font-medium text-gray-700 mb-1">통계 단위</label>
            <select
              id="viewType"
              value={viewType}
              onChange={(e) => setViewType(e.target.value as ViewType)}
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2 text-sm"
            >
              <option value="daily">일간</option>
              <option value="weekly">주간</option>
              <option value="monthly">월간</option>
            </select>
          </div>

          {/* 상태 필터 선택 */}
          <div>
            <label htmlFor="statusFilter" className="block text-sm font-medium text-gray-700 mb-1">결제 상태</label>
            <select
              id="statusFilter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as '전체' | '완료' | '취소' | '환불')}
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2 text-sm"
            >
              <option value="전체">전체</option>
              <option value="완료">완료</option>
              <option value="취소">취소</option>
              <option value="환불">환불</option>
            </select>
          </div>
          
          {/* 새로고침 버튼 */}
          <div>
            <button
                onClick={refreshData}
                className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center justify-center transition-colors text-sm"
                disabled={isLoading}
              >
                <RefreshCw size={16} className={`mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                데이터 조회
            </button>
          </div>
        </div>
      </div>

      {/* --- 요약 카드 --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-sm font-medium text-gray-500">총 매출액 ({statusFilter})</h3>
          <p className="text-3xl font-bold text-blue-600 mt-1">{formatCurrency(summary.totalSales)}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-sm font-medium text-gray-500">총 결제 건수 ({statusFilter})</h3>
          <p className="text-3xl font-bold text-green-600 mt-1">{summary.totalCount.toLocaleString()} 건</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-sm font-medium text-gray-500">건당 평균 매출액</h3>
          <p className="text-3xl font-bold text-indigo-600 mt-1">{formatCurrency(summary.averageSalesPerTransaction)}</p>
        </div>
      </div>

      {/* --- 매출 차트 --- */}
      <div className="bg-white p-6 rounded-xl shadow-lg mb-8">
        <h2 className="text-xl font-semibold text-gray-700 mb-1 flex items-center">
          <TrendingUp size={24} className="mr-2 text-blue-500" />
          매출 추이 ({viewType === 'daily' ? '일별' : viewType === 'weekly' ? '주별' : '월별'})
        </h2>
        {processedData.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <Database size={48} className="mb-2 text-gray-400"/>
            <p>선택된 기간에 표시할 매출 데이터가 없습니다.</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={400}>
            {viewType === 'daily' || viewType === 'weekly' ? ( // 일간, 주간은 라인차트 또는 막대차트
                 <LineChart data={processedData} margin={{ top: 5, right: 20, left: 30, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0"/>
                    <XAxis dataKey="name" tick={{fontSize: 12}} />
                    <YAxis yAxisId="left" tickFormatter={(value) => `${(value / 1000).toLocaleString()}k`} tick={{fontSize: 12}}/>
                    <YAxis yAxisId="right" orientation="right" tick={{fontSize: 12}}/>
                    <Tooltip formatter={(value: number, name) => [name === '매출' ? formatCurrency(value) : `${value.toLocaleString()}건`, name]}/>
                    <Legend wrapperStyle={{fontSize: "14px"}}/>
                    <Line yAxisId="left" type="monotone" dataKey="매출" stroke="#3b82f6" strokeWidth={2} dot={{r:4}} activeDot={{r:6}} />
                    <Line yAxisId="right" type="monotone" dataKey="건수" stroke="#10b981" strokeWidth={2} dot={{r:4}} activeDot={{r:6}} />
                 </LineChart>
            ) : ( // 월간은 막대차트
                <BarChart data={processedData} margin={{ top: 5, right: 20, left: 30, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0"/>
                    <XAxis dataKey="name" tick={{fontSize: 12}} />
                    <YAxis yAxisId="left" tickFormatter={(value) => `${(value / 1000).toLocaleString()}k`} tick={{fontSize: 12}} />
                    <YAxis yAxisId="right" orientation="right" tick={{fontSize: 12}} />
                    <Tooltip formatter={(value: number, name) => [name === '매출' ? formatCurrency(value) : `${value.toLocaleString()}건`, name]}/>
                    <Legend wrapperStyle={{fontSize: "14px"}}/>
                    <Bar yAxisId="left" dataKey="매출" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={30}/>
                    <Bar yAxisId="right" dataKey="건수" fill="#10b981" radius={[4, 4, 0, 0]} barSize={30}/>
              </BarChart>
            )}
          </ResponsiveContainer>
        )}
      </div>
      
      {/* --- 상세 데이터 테이블 --- */}
      <div className="bg-white p-6 rounded-xl shadow-lg">
         <h2 className="text-xl font-semibold text-gray-700 mb-4 flex items-center">
          <ListFilter size={24} className="mr-2 text-gray-600" />
          상세 데이터
        </h2>
        {processedData.length === 0 ? (
           <div className="flex flex-col items-center justify-center h-40 text-gray-500">
            <Database size={40} className="mb-2 text-gray-400"/>
            <p>표시할 상세 데이터가 없습니다.</p>
          </div>
        ) : (
          <div className="overflow-x-auto max-h-96">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{viewType === 'daily' ? '날짜' : viewType === 'weekly' ? '주차' : '월'}</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">매출액</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">결제 건수</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {processedData.map((item) => (
                  <tr key={item.name} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-right">{formatCurrency(item.매출)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-right">{item.건수.toLocaleString()} 건</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Statistics; 