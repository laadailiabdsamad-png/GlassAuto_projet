import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { DateRangeField } from '../../components/calendar';
import {
  AppHeader,
  Banner,
  Button,
  Card,
  Chip,
  Field,
  Icon,
  OptionCard,
  Screen,
  TextField,
  Txt,
} from '../../components/ui';
import { LEAVE_TYPE_ORDER, LEAVE_TYPES, NOTICE_DAYS, ROLES } from '../../data/constants';
import { useAuth } from '../../hooks/useAuth';
import { useFeedback } from '../../hooks/useFeedback';
import { useHrData } from '../../hooks/useHrData';
import { colors } from '../../theme';
import { daysFromToday, formatDate, formatRange } from '../../utils/date';
import { plural } from '../../utils/format';
import {
  earliestUnplannedDate,
  evaluateLeave,
  resolveRoute,
  upcomingPlannedPeriods,
} from '../../utils/leaveRules';

function CheckLine({ ok, label, value }) {
  return (
    <View className="flex-row items-center gap-3 py-2">
      <Icon
        name={ok ? 'check-circle' : 'alert-circle'}
        size={20}
        color={ok ? colors.success : colors.ember}
      />
      <Txt size="sm" tone="soft" className="flex-1">
        {label}
      </Txt>
      <Txt size="sm" weight="semi" tone={ok ? 'ink' : 'ember'}>
        {value}
      </Txt>
    </View>
  );
}

function RouteStep({ label, last }) {
  return (
    <View className="flex-row items-center gap-2">
      <View className="rounded-full bg-steel px-3 py-1.5">
        <Txt size="sm" weight="medium">
          {label}
        </Txt>
      </View>
      {last ? null : <Icon name="chevron-right" size={18} color={colors.mute} />}
    </View>
  );
}

const ROUTE_NOTES = {
  standard:
    'Sans substitut dans votre centre, la demande passe par le responsable technique.',
  responsable: 'Les congés des responsables sont transmis directement au Service RH.',
  responsable_indisponible:
    'Votre responsable est indisponible : la demande est acheminée directement au Service RH.',
};

export function LeaveFormScreen({ navigation, route }) {
  const { user } = useAuth();
  const { leaves, annualPlans, employeesById, actions } = useHrData();
  const { attempt, showToast } = useFeedback();
  const params = route.params || {};
  const edited = params.id ? leaves.find((leave) => leave.id_demande === params.id) : null;
  const [type, setType] = useState(edited ? edited.conge_type : 'annuel');
  const [period, setPeriod] = useState({
    start: edited ? edited.date_debut : params.start || null,
    end: edited ? edited.date_fin : params.end || null,
  });
  const [motif, setMotif] = useState(edited ? edited.motif : '');
  const [errors, setErrors] = useState({});

  const evaluation = evaluateLeave({
    employee: user,
    type,
    start: period.start,
    end: period.end,
    leaves,
    plans: annualPlans,
    excludedId: edited ? edited.id_demande : null,
  });
  const complete = Boolean(period.start && period.end);
  const manager = employeesById[user.id_respo_direct];
  const destination = resolveRoute({ employee: user, manager, leaves });
  const planned = upcomingPlannedPeriods(annualPlans, user.id_personne);
  const noticeError = evaluation.errors.find((error) => error.code === 'notice');
  const otherErrors = evaluation.errors.filter((error) => error.code !== 'notice');

  const submit = async () => {
    const next = {};
    if (!complete) {
      next.period = 'Choisissez la période de votre congé.';
    } else if (evaluation.errors.length > 0) {
      next.period = evaluation.errors[0].message;
    }
    if (motif.trim().length < 3) {
      next.motif = 'Indiquez le motif de votre demande.';
    }
    setErrors(next);
    if (complete && noticeError) {
      await actions.leaves.alertNotice({ employeeId: user.id_personne, message: noticeError.message });
      showToast({
        tone: 'error',
        title: 'Préavis non respecté',
        message: noticeError.message,
      });
      return;
    }
    if (Object.keys(next).length > 0) {
      return;
    }
    const payload = { type, start: period.start, end: period.end, motif: motif.trim() };
    const outcome = await attempt(
      () =>
        edited
          ? actions.leaves.update(edited.id_demande, payload)
          : actions.leaves.create({ employeeId: user.id_personne, ...payload }),
      {
        title: edited ? 'Demande modifiée' : 'Demande envoyée',
        message:
          destination.state === 'pending_respo'
            ? 'Votre responsable de centre est notifié.'
            : 'Le Service RH est notifié.',
      }
    );
    if (outcome.ok) {
      if (edited) {
        navigation.goBack();
      } else {
        navigation.replace('LeaveDetail', { id: outcome.result.id_demande });
      }
    }
  };

  const path =
    destination.routing === 'standard'
      ? ['Responsable de centre', 'Service RH']
      : ['Service RH'];

  return (
    <Screen
      header={
        <AppHeader
          title={edited ? 'Modifier la demande' : 'Demande de congé'}
          subtitle={edited ? edited.id_demande : `Solde disponible : ${plural(user.solde_conge, 'jour')}`}
        />
      }
      footer={
        <Button
          label={edited ? 'Enregistrer les modifications' : 'Envoyer la demande'}
          onPress={submit}
        />
      }
    >
      <Field label="Type de congé">
        <View className="gap-2.5">
          {LEAVE_TYPE_ORDER.map((key) => (
            <OptionCard
              key={key}
              icon={LEAVE_TYPES[key].icon}
              title={LEAVE_TYPES[key].label}
              description={LEAVE_TYPES[key].description}
              selected={type === key}
              onPress={() => setType(key)}
            />
          ))}
        </View>
      </Field>
      {planned.length > 0 ? (
        <Field
          label="Périodes prévues à votre planning annuel"
          hint="Une période prévue est dispensée du préavis de 20 jours."
        >
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row gap-2">
              {planned.map((item) => (
                <Chip
                  key={item.id}
                  icon="calendar-check-outline"
                  label={formatRange(item.date_debut, item.date_fin)}
                  selected={period.start === item.date_debut && period.end === item.date_fin}
                  onPress={() => {
                    setPeriod({ start: item.date_debut, end: item.date_fin });
                    setErrors((current) => ({ ...current, period: null }));
                  }}
                />
              ))}
            </View>
          </ScrollView>
        </Field>
      ) : null}
      <DateRangeField
        label="Période du congé"
        start={period.start}
        end={period.end}
        minDate={daysFromToday(1)}
        error={errors.period}
        onChange={(next) => {
          setPeriod(next);
          setErrors((current) => ({ ...current, period: null }));
        }}
      />
      {complete ? (
        <Card>
          <View className="flex-row items-end justify-between border-b border-white/10 pb-3">
            <View>
              <Txt size="sm" tone="soft">
                Durée décomptée
              </Txt>
              <Txt size="xs" tone="mute">
                Hors dimanches et jours fériés
              </Txt>
            </View>
            <Txt size="xl" weight="figure">
              {plural(evaluation.days, 'jour')}
            </Txt>
          </View>
          <View className="pt-2">
            <CheckLine
              ok={Boolean(evaluation.planned) || evaluation.notice >= NOTICE_DAYS}
              label={evaluation.planned ? 'Prévu au planning annuel' : 'Hors planning, préavis'}
              value={
                evaluation.planned
                  ? 'Dispensé'
                  : `${Math.max(0, evaluation.notice)} j sur ${NOTICE_DAYS}`
              }
            />
            <CheckLine
              ok={evaluation.balanceAfter >= 0}
              label={evaluation.deducts ? 'Solde après validation' : 'Sans impact sur le solde'}
              value={plural(evaluation.balanceAfter, 'jour')}
            />
            {otherErrors
              .filter((error) => error.code !== 'balance')
              .map((error) => (
                <CheckLine key={error.code} ok={false} label={error.message} value="" />
              ))}
          </View>
        </Card>
      ) : (
        <Banner
          tone="sky"
          icon="calendar-alert"
          title="Règle des 20 jours"
          message={`Hors planning annuel, le premier jour possible est le ${formatDate(earliestUnplannedDate())}.`}
        />
      )}
      <TextField
        label="Motif"
        value={motif}
        onChangeText={(value) => {
          setMotif(value);
          setErrors((current) => ({ ...current, motif: null }));
        }}
        placeholder="Précisez la raison de votre demande"
        multiline
        maxLength={200}
        error={errors.motif}
      />
      <Field label="Circuit de validation" hint={ROUTE_NOTES[destination.routing]}>
        <View className="flex-row flex-wrap items-center gap-2">
          <RouteStep label={user.role === ROLES.COLLABORATEUR ? 'Vous' : 'Votre demande'} />
          {path.map((label, index) => (
            <RouteStep key={label} label={label} last={index === path.length - 1} />
          ))}
        </View>
      </Field>
    </Screen>
  );
}
