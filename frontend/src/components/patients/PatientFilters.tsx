"use client";

import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { maskCNS, maskCPF } from "@/utils/masks";
import { useDebounce } from "@/hooks/useDebounce";
import { Patient } from "@/types";
import api from "@/services/api";

interface PatientFiltersProps {
  onSearch: (filters: Record<string, string>) => void;
  setIsLoading: (isLoading: boolean) => void;
}

export default function PatientFilters({
  onSearch,
  setIsLoading,
}: PatientFiltersProps) {
  const [filters, setFilters] = useState({
    name: "",
    mother_name: "",
    cpf: "",
    cns: "",
  });

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let maskedValue = value;

    if (name === "cpf") maskedValue = maskCPF(value);
    if (name === "cns") maskedValue = maskCNS(value);

    setFilters((prev) => ({ ...prev, [name]: maskedValue }));
  };

  const hanleClearFilters = () => {
    setFilters({
      name: "",
      mother_name: "",
      cpf: "",
      cns: "",
    });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const activeFilters = Object.fromEntries(
      Object.entries(filters).filter(([_, v]) => v !== "")
    );
    onSearch(activeFilters);
  };

  const handleSuggestionClick = (patient: Patient) => {
    setFilters({
      name: patient.name,
      mother_name: patient.mother_name || "",
      cpf: patient.cpf || "",
      cns: patient.cns || "",
    });
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow mb-6">
      <form
        onSubmit={handleSearch}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4 items-end"
      >
        <div className="lg:col-span-2 relative">
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700"
          >
            Nome do Paciente
          </label>
          <input
            type="text"
            name="name"
            id="name"
            value={filters.name}
            onChange={handleFilterChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
        <div>
          <label
            htmlFor="mother_name"
            className="block text-sm font-medium text-gray-700"
          >
            Nome da Mãe
          </label>
          <input
            type="text"
            name="mother_name"
            id="mother_name"
            value={filters.mother_name}
            onChange={handleFilterChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
        <div>
          <label
            htmlFor="cpf"
            className="block text-sm font-medium text-gray-700"
          >
            CPF
          </label>
          <input
            type="text"
            name="cpf"
            id="cpf"
            value={filters.cpf}
            onChange={handleFilterChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
        <div>
          <label
            htmlFor="cns"
            className="block text-sm font-medium text-gray-700"
          >
            CNS
          </label>
          <input
            type="text"
            name="cns"
            id="cns"
            value={filters.cns}
            onChange={handleFilterChange}
            maxLength={18}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
        <button
          type="submit"
          className="flex items-center justify-center w-full bg-indigo-600 text-white py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <Search className="w-5 h-5 mr-2" />
          Buscar
        </button>
        <button
          onClick={hanleClearFilters}
          className="flex items-center justify-center w-full bg-indigo-700 text-white py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium hover:bg-indigo-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-700"
        >
          Limpar Filtro
        </button>
      </form>
    </div>
  );
}
