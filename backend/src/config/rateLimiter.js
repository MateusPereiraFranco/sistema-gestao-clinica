const rateLimit = require('express-rate-limit');

// Limite estrito para a rota de login para prevenir ataques de força bruta.
exports.loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // Janela de 15 minutos
    max: 20, // Limita cada IP a 20 tentativas de login por janela
    message: { error: 'Demasiadas tentativas de login a partir deste IP. Por favor, tente novamente em 15 minutos.' },
    standardHeaders: true, // Retorna a informação do limite nos cabeçalhos `RateLimit-*`
    legacyHeaders: false, // Desativa os cabeçalhos `X-RateLimit-*`
});

// Limite mais generoso para todas as outras requisições da API.
exports.generalApiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // Janela de 15 minutos
    max: 500, // Limita cada IP a 500 requisições por janela
    message: { error: 'Demasiados pedidos a partir deste IP, por favor tente novamente mais tarde.' },
    standardHeaders: true,
    legacyHeaders: false,
});