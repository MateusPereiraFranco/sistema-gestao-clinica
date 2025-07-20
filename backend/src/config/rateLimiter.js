const rateLimit = require('express-rate-limit');

exports.loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: { error: 'Demasiadas tentativas de login a partir deste IP. Por favor, tente novamente em 15 minutos.' },
    standardHeaders: true,
    legacyHeaders: false,
});

exports.generalApiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 500,
    message: { error: 'Demasiados pedidos a partir deste IP, por favor tente novamente mais tarde.' },
    standardHeaders: true,
    legacyHeaders: false,
});