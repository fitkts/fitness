import { KPICardConfig, KPIData, MiniChartData, ViewType, PaymentStatusFilter } from '../types/statistics';
import { Payment, Member } from '../models/types';
import { formatCurrency, formatPercent, formatNumber } from './formatters';
import {
  generateRevenueChartData,
  generatePaymentCountChartData,
  generateAveragePaymentChartData,
  generateMemberCountChartData,
  generateActiveMemberChartData,
  generateNewMemberChartData,
  generateMemberRetentionChartData,
  generateAttendanceChartData,
  generateLockerUtilizationChartData,
  generateMonthlyVisitsChartData,
  generateRenewalRateChartData,
  generatePTUtilizationChartData
} from './chartDataGenerators';

export interface KPICardRenderData {
  value: string;
  change: number | undefined;
  chartData: MiniChartData[];
  chartType: 'line' | 'bar' | 'pie';
  displayTitle: string;
}

export const getKPICardRenderData = (
  cardConfig: KPICardConfig,
  kpiData: KPIData,
  paymentsData: Payment[],
  membersData: Member[],
  startDate: string,
  endDate: string,
  viewType: ViewType,
  statusFilter: PaymentStatusFilter
): KPICardRenderData | null => {
  let value: string;
  let change: number | undefined;
  let chartData: MiniChartData[];
  let chartType: 'line' | 'bar' | 'pie' = 'line';

  switch (cardConfig.id) {
    case 'totalRevenue':
      value = formatCurrency(kpiData.totalRevenue);
      change = kpiData.revenueGrowth;
      chartData = generateRevenueChartData(paymentsData, startDate, endDate, viewType, statusFilter);
      chartType = 'line';
      break;
    case 'totalMembers':
      value = formatNumber(kpiData.totalMembers);
      change = kpiData.memberGrowth;
      chartData = generateMemberCountChartData(membersData, viewType);
      chartType = 'bar';
      break;
    case 'activeMembers':
      value = formatNumber(kpiData.activeMembers);
      change = 5.8;
      chartData = generateActiveMemberChartData(membersData, viewType);
      chartType = 'line';
      break;
    case 'attendanceToday':
      value = formatNumber(kpiData.attendanceToday);
      change = undefined;
      chartData = generateAttendanceChartData();
      chartType = 'bar';
      break;
    case 'averagePayment':
      value = formatCurrency(kpiData.averagePayment);
      change = kpiData.averagePaymentGrowth;
      chartData = generateAveragePaymentChartData(paymentsData, startDate, endDate, viewType, statusFilter);
      chartType = 'line';
      break;
    case 'newMembers':
      value = formatNumber(kpiData.newMembersThisMonth);
      change = kpiData.memberGrowth;
      chartData = generateNewMemberChartData(membersData, startDate, endDate, viewType);
      chartType = 'bar';
      break;
    case 'lockerUtilization':
      value = formatPercent(kpiData.lockerUtilization);
      change = -1.2;
      chartData = generateLockerUtilizationChartData();
      chartType = 'line';
      break;
    case 'memberRetention':
      value = formatPercent(kpiData.memberRetention);
      change = 3.7;
      chartData = generateMemberRetentionChartData(membersData, viewType);
      chartType = 'line';
      break;
    case 'totalPayments':
      value = formatNumber(kpiData.totalPayments);
      change = kpiData.totalPaymentsGrowth;
      chartData = generatePaymentCountChartData(paymentsData, startDate, endDate, viewType, statusFilter);
      chartType = 'bar';
      break;
    case 'monthlyVisits':
      value = `${kpiData.monthlyVisitsAverage}회`;
      change = 6.1;
      chartData = generateMonthlyVisitsChartData();
      chartType = 'line';
      break;
    case 'renewalRate':
      value = formatPercent(kpiData.renewalRate);
      change = 4.2;
      chartData = generateRenewalRateChartData();
      chartType = 'line';
      break;
    case 'ptUtilization':
      value = formatPercent(kpiData.ptUtilizationRate);
      change = -2.8;
      chartData = generatePTUtilizationChartData();
      chartType = 'bar';
      break;
    case 'staffRevenue':
      if (kpiData.staffRevenue && kpiData.staffRevenue.length > 0) {
        const topStaff = kpiData.staffRevenue[0];
        value = formatCurrency(topStaff.revenue);
        change = undefined;
        chartData = kpiData.staffRevenue.slice(0, 5).map((staff: any, index: number) => ({
          name: staff.staffName,
          value: staff.revenue
        }));
      } else {
        value = formatCurrency(0);
        change = undefined;
        chartData = [];
      }
      chartType = 'bar';
      break;
    case 'staffMemberRegistration':
      if (kpiData.staffMemberRegistration && kpiData.staffMemberRegistration.length > 0) {
        const topStaff = kpiData.staffMemberRegistration[0];
        value = formatNumber(topStaff.newMembers);
        change = undefined;
        chartData = kpiData.staffMemberRegistration.slice(0, 5).map((staff: any) => ({
          name: staff.staffName,
          value: staff.newMembers
        }));
      } else {
        value = formatNumber(0);
        change = undefined;
        chartData = [];
      }
      chartType = 'bar';
      break;
    case 'staffConsultation':
      if (kpiData.staffConsultation && kpiData.staffConsultation.length > 0) {
        const topStaff = kpiData.staffConsultation[0];
        value = formatNumber(topStaff.consultations);
        change = undefined;
        chartData = kpiData.staffConsultation.slice(0, 5).map((staff: any) => ({
          name: staff.staffName,
          value: staff.consultations
        }));
      } else {
        value = formatNumber(0);
        change = undefined;
        chartData = [];
      }
      chartType = 'bar';
      break;
    case 'staffPerformanceScore':
      if (kpiData.staffPerformanceScore && kpiData.staffPerformanceScore.length > 0) {
        const topStaff = kpiData.staffPerformanceScore[0];
        value = `${topStaff.totalScore}점`;
        change = undefined;
        chartData = kpiData.staffPerformanceScore.slice(0, 5).map((staff: any) => ({
          name: staff.staffName,
          value: staff.totalScore
        }));
      } else {
        value = '0점';
        change = undefined;
        chartData = [];
      }
      chartType = 'bar';
      break;
    default:
      return null;
  }

  // 카드별 제목 동적 업데이트
  let displayTitle = cardConfig.title;
  if (cardConfig.id === 'totalRevenue' || cardConfig.id === 'averagePayment' || cardConfig.id === 'totalPayments') {
    displayTitle = `선택 기간 ${cardConfig.title} (${statusFilter})`;
  } else if (cardConfig.id === 'newMembers') {
    displayTitle = `선택 기간 ${cardConfig.title}`;
  }

  return {
    value,
    change,
    chartData,
    chartType,
    displayTitle
  };
}; 