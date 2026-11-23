import { addDays, daysFromToday } from '../utils/date';
import { createRandom } from './random';
import { centres } from './centres';
import { employees } from './employees';
import { ROLES } from './constants';

const currentYear = new Date().getFullYear();

const lateCentres = ['Dakhla', 'Khémisset', 'Guelmim'];

const earlyCentres = ['Agadir', 'Fès', 'Tanger'];

let sequence = 1;

const createPeriod = (id_personne, start, end) => {
  sequence += 1;
  return { id: `PER-${sequence}`, id_personne, date_debut: start, date_fin: end };
};

const monthWindows = ['02-09', '03-16', '04-13', '05-18', '06-15', '07-06', '07-20', '08-03', '08-24', '09-14', '10-12', '11-23'];

const buildPlan = (centre, year, random) => {
  const members = employees.filter((employee) => employee.centre_nom === centre.nom);
  const manager = members.find((member) => member.role === ROLES.RESPONSABLE_CENTRE);
  const submitted = year === currentYear ? !lateCentres.includes(centre.nom) : earlyCentres.includes(centre.nom);
  const filled = submitted || year === currentYear;
  const periods = filled
    ? members.flatMap((member, index) => {
        const first = monthWindows[(index * 5 + random.integer(0, 2)) % monthWindows.length];
        const start = `${year}-${first}`;
        return [createPeriod(member.id_personne, start, addDays(start, random.integer(5, 11)))];
      })
    : [];
  if (centre.nom === 'Marrakech' && year === currentYear) {
    periods.push(createPeriod(1, daysFromToday(10), daysFromToday(15)));
    periods.push(createPeriod(13, daysFromToday(9), daysFromToday(14)));
  }
  if (centre.nom === 'Marrakech' && year === currentYear + 1) {
    periods.push(createPeriod(1, `${year}-07-05`, `${year}-07-17`));
    periods.push(createPeriod(11, `${year}-04-12`, `${year}-04-19`));
    periods.push(createPeriod(14, `${year}-08-02`, `${year}-08-13`));
    periods.push(createPeriod(16, `${year}-06-07`, `${year}-06-12`));
  }
  return {
    id: `PLAN-${year}-${centre.nom}`,
    centre_nom: centre.nom,
    annee: year,
    id_respo: manager ? manager.id_personne : null,
    statut: submitted ? 'soumis' : 'brouillon',
    submitted_at: submitted ? new Date(year === currentYear ? year : currentYear, 0, 8 + (sequence % 12), 10, 0).toISOString() : null,
    periods,
  };
};

const random = createRandom(91);

export const annualPlans = [
  ...centres.map((centre) => buildPlan(centre, currentYear, random)),
  ...centres.map((centre) => buildPlan(centre, currentYear + 1, random)),
];
