import { useState } from 'react';
import { View } from 'react-native';
import { DateRangeField } from '../../components/calendar';
import { AppHeader, Banner, Button, Chip, Field, Screen, TextField } from '../../components/ui';
import { ABSENCE_CATEGORIES, ABSENCE_CATEGORY_ORDER } from '../../data/constants';
import { useAuth } from '../../hooks/useAuth';
import { useFeedback } from '../../hooks/useFeedback';
import { useHrData } from '../../hooks/useHrData';
import { formatRange, today } from '../../utils/date';

export function AbsenceFormScreen({ navigation, route }) {
  const { user } = useAuth();
  const { absences, actions } = useHrData();
  const { attempt } = useFeedback();
  const detectedId = route.params ? route.params.id : null;
  const detected = detectedId
    ? absences.find((absence) => absence.id_justification === detectedId)
    : null;
  const [period, setPeriod] = useState({ start: null, end: null });
  const [category, setCategory] = useState(null);
  const [motif, setMotif] = useState('');
  const [errors, setErrors] = useState({});

  const submit = async () => {
    const next = {};
    if (!detected && !period.start) {
      next.period = 'Indiquez la période d’absence.';
    }
    if (!category) {
      next.category = 'Choisissez une catégorie.';
    }
    if (motif.trim().length < 10) {
      next.motif = 'Expliquez votre absence en 10 caractères minimum.';
    }
    setErrors(next);
    if (Object.keys(next).length > 0) {
      return;
    }
    const outcome = await attempt(
      () =>
        detected
          ? actions.absences.justify(detected.id_justification, { category, motif: motif.trim() })
          : actions.absences.declare({
              employeeId: user.id_personne,
              start: period.start,
              end: period.end,
              category,
              motif: motif.trim(),
            }),
      { title: 'Justification envoyée', message: 'Le Service RH la vérifie avant la paie.' }
    );
    if (outcome.ok) {
      navigation.replace('AbsenceDetail', { id: outcome.result.id_justification });
    }
  };

  return (
    <Screen
      header={
        <AppHeader
          title="Justification d’absence"
          subtitle={detected ? detected.id_justification : 'Absence inopinée passée'}
        />
      }
      footer={<Button label="Envoyer la justification" onPress={submit} />}
    >
      {detected ? (
        <Banner
          tone="amber"
          icon="calendar-alert"
          title="Absence constatée"
          message={formatRange(detected.date_absence_debut, detected.date_absence_fin, { weekday: true })}
        />
      ) : (
        <DateRangeField
          label="Période d’absence"
          start={period.start}
          end={period.end}
          maxDate={today()}
          error={errors.period}
          onChange={(next) => {
            setPeriod(next);
            setErrors((current) => ({ ...current, period: null }));
          }}
        />
      )}
      <Field label="Catégorie" error={errors.category}>
        <View className="flex-row flex-wrap gap-2">
          {ABSENCE_CATEGORY_ORDER.map((key) => (
            <Chip
              key={key}
              icon={ABSENCE_CATEGORIES[key].icon}
              label={ABSENCE_CATEGORIES[key].label}
              selected={category === key}
              onPress={() => {
                setCategory(key);
                setErrors((current) => ({ ...current, category: null }));
              }}
            />
          ))}
        </View>
      </Field>
      <TextField
        label="Explication"
        value={motif}
        onChangeText={(value) => {
          setMotif(value);
          setErrors((current) => ({ ...current, motif: null }));
        }}
        placeholder="Décrivez les circonstances de votre absence"
        multiline
        maxLength={300}
        error={errors.motif}
      />
      <Banner
        tone="sky"
        icon="cash-check"
        message="Une absence justifiée est régularisée lors du calcul de la paie. Aucun fichier n’est à joindre."
      />
    </Screen>
  );
}
