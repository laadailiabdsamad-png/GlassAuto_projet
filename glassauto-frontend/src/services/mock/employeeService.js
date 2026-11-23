import { list as readAll, patch, wait } from './database';
import { notifyHr, person } from './notifier';

export const list = async () => readAll('employees');

export const setAvailability = async (id, available) => {
  await wait(350);
  const updated = patch('employees', 'id_personne', id, { disponible: available });
  const employee = person(id);
  notifyHr({
    type: 'planning',
    title: available ? 'Responsable de nouveau disponible' : 'Responsable indisponible',
    message: available
      ? `${employee.full_name} reprend la validation des demandes du centre de ${employee.centre_nom}.`
      : `Les demandes du centre de ${employee.centre_nom} sont acheminées directement au Service RH.`,
    target: { screen: 'EmployeeDetail', params: { id } },
  });
  return updated;
};

export const updateContact = async (id, { telephone }) => {
  await wait(400);
  return patch('employees', 'id_personne', id, { telephone });
};
