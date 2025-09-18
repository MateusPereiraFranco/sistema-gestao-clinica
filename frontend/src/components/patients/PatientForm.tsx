"use client";

import api from "@/services/api";
import { maskCPF, maskPhone, maskCEP, maskCNS } from "@/utils/masks";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useState, useEffect, useCallback, useRef } from "react";
import { useAuthStore } from "@/stores/useAuthStore";
import toast from "react-hot-toast";
import { Patient, Unit } from "@/types";

interface PatientFormProps {
  patient?: Patient;
}

export default function PatientForm({ patient }: { patient?: Patient }) {
  const initialCep = useRef(patient?.cep || "");
  const router = useRouter();
  const { user } = useAuthStore();
  const [units, setUnits] = useState<Unit[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCepLoading, setIsCepLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: patient?.name || "",
    mother_name: patient?.mother_name || "",
    cpf: patient?.cpf || "",
    birth_date: patient?.birth_date || "",
    cell_phone_1: patient?.cell_phone_1 || "",
    cell_phone_2: patient?.cell_phone_2 || "",
    cep: patient?.cep || "",
    street: patient?.street || "",
    number: patient?.number || "",
    neighborhood: patient?.neighborhood || "",
    city: patient?.city || "",
    state: patient?.state || "",
    observations: patient?.observations || "",
    father_name: patient?.father_name || "",
    cns: patient?.cns || "",
    unit_id: patient?.unit_id || user?.unit_id || "",
  });

  const [isWithoutNumber, setIsWithoutNumber] = useState(
    patient?.number === "S/N"
  );
  const isEditing = !!patient;

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    let maskedValue = value;
    if (name === "cpf") maskedValue = maskCPF(value);
    if (name === "cns") maskedValue = maskCNS(value);
    if (name === "cell_phone_1" || name === "cell_phone_2")
      maskedValue = maskPhone(value);
    if (name === "cep") maskedValue = maskCEP(value);
    setFormData((prev) => ({ ...prev, [name]: maskedValue }));
  };

  const handleCepLookup = useCallback(async (cepValue: string) => {
    const cep = cepValue.replace(/\D/g, "");
    if (cep.length !== 8) return;
    setIsCepLoading(true);
    try {
      const { data } = await axios.get(`https://viacep.com.br/ws/${cep}/json/`);
      if (data.erro) {
        toast.error("CEP não encontrado.");
        return;
      }
      setFormData((prev) => ({
        ...prev,
        street: data.logradouro,
        neighborhood: data.bairro,
        city: data.localidade,
        state: data.uf,
      }));
    } catch (error) {
      toast.error("Erro ao buscar CEP.");
    } finally {
      setIsCepLoading(false);
    }
  }, []);

  const canChangeUnit = user?.profile === "admin" || user?.profile === "master";

  useEffect(() => {
    if (canChangeUnit) {
      api.get("/units").then((res) => setUnits(res.data));
    }
  }, [canChangeUnit]);

  useEffect(() => {
    const isCepComplete = formData.cep?.length === 9;
    const hasCepChanged = formData.cep !== initialCep.current;

    if (isCepComplete && hasCepChanged) {
      handleCepLookup(formData.cep);
    }
  }, [formData.cep, handleCepLookup]);

  useEffect(() => {
    if (isWithoutNumber) setFormData((prev) => ({ ...prev, number: "S/N" }));
    else if (formData.number === "S/N")
      setFormData((prev) => ({ ...prev, number: "" }));
  }, [isWithoutNumber, formData.number]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const toastId = toast.loading(isEditing ? "A atualizar..." : "A criar...");
    try {
      if (isEditing) {
        await api.put(`/patients/${patient.patient_id}`, formData);
        toast.success("Paciente atualizado!", { id: toastId });
      } else {
        await api.post("/patients", formData);
        toast.success("Paciente criado!", { id: toastId });
      }
      router.push("/dashboard/pacientes");
      router.refresh();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Ocorreu um erro.", {
        id: toastId,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-12">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Identificação</h2>
        {isEditing && canChangeUnit && (
          <div className="sm:col-span-full">
            <label
              htmlFor="unit_id"
              className="block text-sm font-medium leading-6 text-gray-900"
            >
              Unidade do Paciente
            </label>
            <select
              id="unit_id"
              name="unit_id"
              value={formData.unit_id || ""}
              onChange={handleChange}
              className="mt-2 block w-full rounded-md border-0 py-2.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600"
            >
              {units.map((unit) => (
                <option key={unit.unit_id} value={unit.unit_id}>
                  {unit.name}
                </option>
              ))}
            </select>
          </div>
        )}
        <div className="mt-6 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
          <div className="sm:col-span-3">
            <label
              htmlFor="name"
              className="block text-sm font-medium leading-6 text-gray-900"
            >
              Nome Completo
            </label>
            <input
              type="text"
              name="name"
              id="name"
              required
              value={formData.name}
              onChange={handleChange}
              className="mt-2 block w-full rounded-md border-0 py-2 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600"
            />
          </div>
          <div className="sm:col-span-3">
            <label
              htmlFor="mother_name"
              className="block text-sm font-medium leading-6 text-gray-900"
            >
              Nome da Mãe
            </label>
            <input
              type="text"
              name="mother_name"
              id="mother_name"
              required
              value={formData.mother_name}
              onChange={handleChange}
              className="mt-2 block w-full rounded-md border-0 py-2 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600"
            />
          </div>
          <div className="sm:col-span-3">
            <label
              htmlFor="father_name"
              className="block text-sm font-medium leading-6 text-gray-900"
            >
              Nome do Pai
            </label>
            <input
              type="text"
              name="father_name"
              id="father_name"
              value={formData.father_name}
              onChange={handleChange}
              className="mt-2 block w-full rounded-md border-0 py-2 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600"
            />
          </div>
          <div className="sm:col-span-3">
            <label
              htmlFor="birth_date"
              className="block text-sm font-medium leading-6 text-gray-900"
            >
              Data de Nascimento
            </label>
            <input
              type="date"
              name="birth_date"
              id="birth_date"
              required
              value={formData.birth_date}
              onChange={handleChange}
              className="mt-2 block w-full rounded-md border-0 py-2 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600"
            />
          </div>
          <div className="sm:col-span-2">
            <label
              htmlFor="cpf"
              className="block text-sm font-medium leading-6 text-gray-900"
            >
              CPF
            </label>
            <input
              type="text"
              name="cpf"
              id="cpf"
              value={formData.cpf}
              onChange={handleChange}
              placeholder="000.000.000-00"
              maxLength={14}
              className="mt-2 block w-full rounded-md border-0 py-2 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600"
            />
          </div>
          <div className="sm:col-span-2">
            <label
              htmlFor="cns"
              className="block text-sm font-medium leading-6 text-gray-900"
            >
              CNS (Cartão SUS)
            </label>
            <input
              type="text"
              name="cns"
              id="cns"
              value={formData.cns}
              onChange={handleChange}
              placeholder="000 0000 0000 0000"
              maxLength={18}
              className="mt-2 block w-full rounded-md border-0 py-2 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600"
            />
          </div>
        </div>
      </div>

      {/* Secção de Endereço */}
      <div className="border-t border-gray-900/10 pt-12">
        <h2 className="text-xl font-semibold leading-7 text-gray-900">
          Endereço
        </h2>
        <div className="mt-6 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
          <div className="sm:col-span-2">
            <label
              htmlFor="cep"
              className="block text-sm font-medium leading-6 text-gray-900"
            >
              CEP
            </label>
            <input
              type="text"
              name="cep"
              id="cep"
              required
              value={formData.cep}
              onChange={handleChange}
              maxLength={9}
              placeholder="00000-000"
              className="mt-2 block w-full rounded-md border-0 py-2 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600"
            />
            {isCepLoading && (
              <p className="text-xs text-indigo-600 mt-1">A procurar CEP...</p>
            )}
          </div>
          <div className="sm:col-span-4">
            <label
              htmlFor="street"
              className="block text-sm font-medium leading-6 text-gray-900"
            >
              Rua / Logradouro
            </label>
            <input
              type="text"
              name="street"
              id="street"
              required
              value={formData.street}
              onChange={handleChange}
              className="mt-2 block w-full rounded-md border-0 py-2 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </div>
          <div className="sm:col-span-2">
            <label
              htmlFor="number"
              className="block text-sm font-medium leading-6 text-gray-900"
            >
              Número
            </label>
            <input
              type="text"
              name="number"
              id="number"
              required
              value={formData.number}
              onChange={handleChange}
              disabled={isWithoutNumber}
              className="mt-2 block w-full rounded-md border-0 py-2 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 disabled:bg-gray-200"
            />
          </div>
          <div className="sm:col-span-2 flex items-end pb-1">
            <div className="relative flex gap-x-3">
              <div className="flex h-6 items-center">
                <input
                  id="isWithoutNumber"
                  name="isWithoutNumber"
                  type="checkbox"
                  checked={isWithoutNumber}
                  onChange={(e) => setIsWithoutNumber(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                />
              </div>
              <div className="text-sm leading-6">
                <label
                  htmlFor="isWithoutNumber"
                  className="font-medium text-gray-900"
                >
                  Sem número
                </label>
              </div>
            </div>
          </div>
          <div className="sm:col-span-2">
            <label
              htmlFor="neighborhood"
              className="block text-sm font-medium leading-6 text-gray-900"
            >
              Bairro
            </label>
            <input
              type="text"
              name="neighborhood"
              id="neighborhood"
              required
              value={formData.neighborhood}
              onChange={handleChange}
              className="mt-2 block w-full rounded-md border-0 py-2 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </div>
          <div className="sm:col-span-3">
            <label
              htmlFor="city"
              className="block text-sm font-medium leading-6 text-gray-900"
            >
              Cidade
            </label>
            <input
              type="text"
              name="city"
              id="city"
              required
              value={formData.city}
              onChange={handleChange}
              className="mt-2 block w-full rounded-md border-0 py-2 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </div>
          <div className="sm:col-span-3">
            <label
              htmlFor="state"
              className="block text-sm font-medium leading-6 text-gray-900"
            >
              Estado
            </label>
            <input
              type="text"
              name="state"
              id="state"
              required
              value={formData.state}
              onChange={handleChange}
              maxLength={2}
              className="mt-2 block w-full rounded-md border-0 py-2 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </div>
        </div>
      </div>

      {/* Secção de Contato */}
      <div className="border-t border-gray-900/10 pt-12">
        <h2 className="text-xl font-semibold leading-7 text-gray-900">
          Contato
        </h2>
        <div className="mt-6 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
          <div className="sm:col-span-3">
            <label
              htmlFor="cell_phone_1"
              className="block text-sm font-medium leading-6 text-gray-900"
            >
              Celular Principal
            </label>
            <input
              type="tel"
              name="cell_phone_1"
              id="cell_phone_1"
              required
              value={formData.cell_phone_1}
              onChange={handleChange}
              placeholder="(XX) 9XXXX-XXXX"
              maxLength={15}
              className="mt-2 block w-full rounded-md border-0 py-2 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600"
            />
          </div>
          <div className="sm:col-span-3">
            <label
              htmlFor="cell_phone_2"
              className="block text-sm font-medium leading-6 text-gray-900"
            >
              Celular de Contato (Opcional)
            </label>
            <input
              type="tel"
              name="cell_phone_2"
              id="cell_phone_2"
              value={formData.cell_phone_2}
              onChange={handleChange}
              placeholder="(XX) 9XXXX-XXXX"
              maxLength={15}
              className="mt-2 block w-full rounded-md border-0 py-2 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600"
            />
          </div>
        </div>
      </div>

      {/* Secção de Observações */}
      <div className="border-t border-gray-900/10 pt-12">
        <h2 className="text-xl font-semibold leading-7 text-gray-900">
          Observações Gerais
        </h2>
        <p className="mt-1 text-sm leading-6 text-gray-600">
          Adicione aqui qualquer informação relevante sobre o paciente que não
          se enquadre nos outros campos.
        </p>
        <div className="mt-6">
          <textarea
            id="observations"
            name="observations"
            rows={4}
            value={formData.observations}
            onChange={handleChange}
            className="block w-full rounded-md border-0 py-2 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600"
          />
        </div>
      </div>

      {/* Botões de Ação */}
      <div className="mt-8 flex items-center justify-end gap-x-6">
        <button
          type="button"
          onClick={() => router.back()}
          className="text-sm font-semibold leading-6 text-gray-900"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:bg-indigo-400"
        >
          {isLoading
            ? "A guardar..."
            : isEditing
            ? "Guardar Alterações"
            : "Guardar Paciente"}
        </button>
      </div>
    </form>
  );
}
