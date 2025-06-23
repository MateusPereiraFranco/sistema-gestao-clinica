/**
 * Aplica uma máscara de CPF (xxx.xxx.xxx-xx) a uma string.
 * Esta versão lida corretamente com a digitação e a exclusão.
 * @param value A string a ser formatada.
 * @returns A string com a máscara de CPF.
 */
export const maskCPF = (value: string): string => {
  if (!value) return "";
  
  // Remove tudo o que não for dígito e limita a 11 caracteres.
  const numericValue = value.replace(/\D/g, '').slice(0, 11);
  const len = numericValue.length;

  if (len === 0) return "";
  if (len <= 3) return numericValue;
  if (len <= 6) return `${numericValue.slice(0, 3)}.${numericValue.slice(3)}`;
  if (len <= 9) return `${numericValue.slice(0, 3)}.${numericValue.slice(3, 6)}.${numericValue.slice(6)}`;
  
  return `${numericValue.slice(0, 3)}.${numericValue.slice(3, 6)}.${numericValue.slice(6, 9)}-${numericValue.slice(9)}`;
};

/**
 * Aplica uma máscara de celular ((xx) xxxxx-xxxx) a uma string.
 * Esta versão lida corretamente com a digitação e a exclusão.
 * @param value A string a ser formatada.
 * @returns A string com a máscara de celular.
 */
export const maskPhone = (value: string): string => {
  if (!value) return "";

  // Remove tudo o que não for dígito e limita a 11 caracteres.
  const numericValue = value.replace(/\D/g, '').slice(0, 11);
  const len = numericValue.length;

  if (len === 0) return "";
  if (len <= 2) return `(${numericValue}`;
  if (len <= 7) return `(${numericValue.slice(0, 2)}) ${numericValue.slice(2)}`;
  
  return `(${numericValue.slice(0, 2)}) ${numericValue.slice(2, 7)}-${numericValue.slice(7)}`;
};

/**
 * Aplica uma máscara de CEP (xxxxx-xxx) a uma string.
 */
export const maskCEP = (value: string): string => {
    if (!value) return "";
    const numericValue = value.replace(/\D/g, '').slice(0, 8);
    const len = numericValue.length;

    if (len <= 5) return numericValue;
    return `${numericValue.slice(0, 5)}-${numericValue.slice(5)}`;
};