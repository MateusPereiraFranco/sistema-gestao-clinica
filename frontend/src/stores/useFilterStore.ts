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
}

export const useFilterStore = create<FilterState>()(
  persist(
    (set) => ({
      dashboardProfessional: 'all',
      dashboardPeriod: 'todos',
      
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
    }),
    {
      name: 'app-filter-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);