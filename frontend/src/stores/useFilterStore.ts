import { AppointmentStatus } from '@/types';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

type Period = 'todos' | 'manha' | 'tarde';

interface FilterState {
  dashboardProfessional: string;
  dashboardPeriod: Period;
  dashboardDate: string;
  setDashboardProfessional: (id: string) => void;
  setDashboardPeriod: (period: Period) => void;
  setDashboardDate: (date: string) => void;

  agendaProfessional: string;
  agendaDate: string;
  setAgendaProfessional: (id: string) => void;
  setAgendaDate: (date: string) => void;
  waitingListProfessional: string;
  setWaitingListProfessional: (id: string) => void;
  waitingListStartDate: string;
  waitingListEndDate: string;
  setWaitingListStartDate: (date: string) => void;
  setWaitingListEndDate: (date: string) => void;
  resetDatesToToday: () => void;

  reportProfessional: string;
  reportStatus: AppointmentStatus;
  reportStartDate: string;
  reportEndDate: string;
  setReportProfessional: (id: string) => void;
  setReportStatus: (status: AppointmentStatus) => void;
  setReportStartDate: (date: string) => void;
  setReportEndDate: (date: string) => void;

  includeInactive: boolean;
  setIncludeInactive: (value: boolean) => void;
}

export const useFilterStore = create<FilterState>()(
  persist(
    (set) => ({
      dashboardProfessional: 'all',
      dashboardPeriod: 'todos',
      waitingListStartDate: new Date().toISOString().split('T')[0],
      waitingListEndDate: new Date().toISOString().split('T')[0],

      setWaitingListStartDate: (date) => set({ waitingListStartDate: date }),
      setWaitingListEndDate: (date) => set({ waitingListEndDate: date }),
      
      setDashboardProfessional: (id) => set({ dashboardProfessional: id }),
      setDashboardPeriod: (period) => set({ dashboardPeriod: period }),
      waitingListProfessional: 'all',
      setWaitingListProfessional: (id) => set({ waitingListProfessional: id }),
      dashboardDate: new Date().toISOString().split('T')[0],
      setDashboardDate: (date) => set({ dashboardDate: date }),
      
      agendaProfessional: '', 
      agendaDate: new Date().toISOString().split('T')[0],
      setAgendaProfessional: (id) => set({ agendaProfessional: id }),
      setAgendaDate: (date) => set({ agendaDate: date }),
      resetDatesToToday: () => set({
        dashboardDate: new Date().toISOString().split('T')[0],
        agendaDate: new Date().toISOString().split('T')[0],
      }),
      reportProfessional: 'all',
      reportStatus: 'completed',
      reportStartDate: new Date().toISOString().split('T')[0],
      reportEndDate: new Date().toISOString().split('T')[0],
      setReportProfessional: (id) => set({ reportProfessional: id }),
      setReportStatus: (status) => set({ reportStatus: status }),
      setReportStartDate: (date) => set({ reportStartDate: date }),
      setReportEndDate: (date) => set({ reportEndDate: date }),

      includeInactive: false,
      setIncludeInactive: (value) => set({ includeInactive: value }),
    }),
    {
      name: 'app-filter-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
