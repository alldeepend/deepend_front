import { create } from 'zustand';

type ChangelogTourState = {
    open: boolean;
    step: number;
    openTour: () => void;
    close: () => void;
    setStep: (n: number) => void;
};

export const useChangelogTour = create<ChangelogTourState>((set) => ({
    open: false,
    step: 0,
    openTour: () => set({ open: true, step: 0 }),
    close: () => set({ open: false }),
    setStep: (n) => set({ step: n }),
}));
