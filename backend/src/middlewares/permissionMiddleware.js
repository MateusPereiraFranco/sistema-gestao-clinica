const patientModel = require('../api/patients/patientsModel');
const appointmentModel = require('../api/appointments/appointmentsModel');

const resourceModels = {
    patients: patientModel,
    appointments: appointmentModel,
};

exports.checkUnitAccess = (resourceType) => {
    return async (req, res, next) => {
        const user = req.user;
        const resourceId = req.params.id;

        if (user.profile === 'admin') {
            return next();
        }

        if (user.profile === 'master' || user.profile === 'normal') {
            if (!user.unit_id) {
                return res.status(403).json({ error: 'Você não está associado a nenhuma unidade.' });
            }

            const model = resourceModels[resourceType];
            if (!model) {
                return res.status(500).json({ error: 'Configuração de recurso inválida no servidor.' });
            }

            try {
                const resource = await model.findById(resourceId);
                if (!resource) {
                    return res.status(404).json({ error: `${resourceType.slice(0, -1)} não encontrado.` });
                }

                if (resource.unit_id !== user.unit_id) {
                    return res.status(403).json({ error: 'Acesso negado a este recurso.' });
                }

                return next();
            } catch (error) {
                return res.status(500).json({ error: 'Erro ao verificar permissões.' });
            }
        }

        return res.status(403).json({ error: 'Acesso negado.' });
    };
};