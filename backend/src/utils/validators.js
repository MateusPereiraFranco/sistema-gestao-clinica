/**
 * Valida um número de CPF.
 * @param {string} cpf O CPF a ser validado.
 * @returns {boolean} True se o CPF for válido.
 */
exports.isValidCPF = (cpf) => {
    if (typeof cpf !== 'string') return false;
    cpf = cpf.replace(/[^\d]+/g, '');
    if (cpf.length !== 11 || !!cpf.match(/(\d)\1{10}/)) return false;
    cpf = cpf.split('').map(el => +el);
    const rest = (count) => (cpf.slice(0, count - 12).reduce((soma, el, index) => soma + el * (count - index), 0) * 10) % 11 % 10;
    return rest(10) === cpf[9] && rest(11) === cpf[10];
};

/**
 * Valida um número do Cartão Nacional de Saúde (CNS).
 * @param {string} cns O CNS a ser validado.
 * @returns {boolean} True se o CNS for válido.
 */
exports.isValidCNS = (cns) => {
    if (typeof cns !== 'string') return false;
    cns = cns.replace(/[^\d]+/g, '');
    if (cns.length !== 15) return false;

    // CNS Provisório (iniciado com 7, 8 ou 9)
    if (['7', '8', '9'].includes(cns[0])) {
        let soma = 0;
        for (let i = 0; i < 15; i++) {
            soma += parseInt(cns[i], 10) * (15 - i);
        }
        return soma % 11 === 0;
    }

    // CNS Definitivo (iniciado com 1 ou 2)
    if (['1', '2'].includes(cns[0])) {
        let soma = 0;
        for (let i = 0; i < 11; i++) {
            soma += parseInt(cns[i], 10) * (15 - i);
        }
        const resto = soma % 11;
        const dv = resto === 0 ? 0 : 11 - resto;
        const resultado = dv === 10 ? `${cns.substring(0, 11)}001${15 - ((soma + 2) % 11)}` : `${cns.substring(0, 11)}000${dv}`;
        return cns === resultado;
    }

    return false;
};