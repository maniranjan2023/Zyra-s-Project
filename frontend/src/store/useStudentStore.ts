import { create } from "zustand";

type StudentStore = {
  selectedStudentId: string;
  setSelectedStudentId: (studentId: string) => void;
};

export const useStudentStore = create<StudentStore>((set) => ({
  selectedStudentId: "stu_001",
  setSelectedStudentId: (selectedStudentId) => set({ selectedStudentId })
}));
