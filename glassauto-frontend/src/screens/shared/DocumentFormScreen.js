import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import {
  AppHeader,
  Banner,
  Button,
  Chip,
  Field,
  Icon,
  OptionCard,
  Screen,
  TextField,
  Txt,
} from '../../components/ui';
import {
  DOCUMENT_TYPE_ORDER,
  DOCUMENT_TYPES,
  PICKUP_HOURS,
  PICKUP_LOCATION,
} from '../../data/constants';
import { useAuth } from '../../hooks/useAuth';
import { useFeedback } from '../../hooks/useFeedback';
import { useHrData } from '../../hooks/useHrData';
import { colors } from '../../theme';

const suggestions = ['Dossier bancaire', 'Demande de visa', 'Dossier de location', 'Mutuelle'];

const PRECISIONS = {
  fiche_paie: { label: 'Mois concernés', placeholder: 'Exemple : août, septembre et octobre' },
  autre: { label: 'Document souhaité', placeholder: 'Décrivez le document' },
};

function Stepper({ value, onChange }) {
  const change = (amount) => onChange(Math.min(5, Math.max(1, value + amount)));
  return (
    <View className="h-[54px] flex-row items-center justify-between rounded-field border border-edge bg-carbon px-2">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Retirer un exemplaire"
        onPress={() => change(-1)}
        className="h-10 w-10 items-center justify-center rounded-xl bg-steel active:opacity-70"
      >
        <Icon name="minus" size={20} color={colors.ink} />
      </Pressable>
      <Txt size="lg" weight="figure">
        {value}
      </Txt>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Ajouter un exemplaire"
        onPress={() => change(1)}
        className="h-10 w-10 items-center justify-center rounded-xl bg-steel active:opacity-70"
      >
        <Icon name="plus" size={20} color={colors.ink} />
      </Pressable>
    </View>
  );
}

export function DocumentFormScreen({ navigation }) {
  const { user } = useAuth();
  const { actions } = useHrData();
  const { attempt } = useFeedback();
  const [type, setType] = useState('attestation_travail');
  const [precision, setPrecision] = useState('');
  const [motif, setMotif] = useState('');
  const [copies, setCopies] = useState(1);
  const [errors, setErrors] = useState({});
  const detail = PRECISIONS[type];

  const submit = async () => {
    const next = {};
    if (detail && precision.trim().length < 3) {
      next.precision = type === 'autre' ? 'Décrivez le document souhaité.' : 'Indiquez les mois concernés.';
    }
    if (motif.trim().length < 3) {
      next.motif = 'Indiquez le motif de votre demande.';
    }
    setErrors(next);
    if (Object.keys(next).length > 0) {
      return;
    }
    const outcome = await attempt(
      () =>
        actions.documents.create({
          employeeId: user.id_personne,
          type,
          precision: detail ? precision.trim() : null,
          motif: motif.trim(),
          copies,
        }),
      { title: 'Demande envoyée', message: 'Vous serez notifié dès que le document est prêt.' }
    );
    if (outcome.ok) {
      navigation.replace('DocumentDetail', { id: outcome.result.id_demande });
    }
  };

  return (
    <Screen
      header={<AppHeader title="Document administratif" subtitle="Demande au Service RH" />}
      footer={<Button label="Envoyer la demande" onPress={submit} />}
    >
      <Field label="Type de document">
        <View className="gap-2.5">
          {DOCUMENT_TYPE_ORDER.map((key) => (
            <OptionCard
              key={key}
              icon={DOCUMENT_TYPES[key].icon}
              title={DOCUMENT_TYPES[key].label}
              selected={type === key}
              onPress={() => {
                setType(key);
                setErrors({});
              }}
            />
          ))}
        </View>
      </Field>
      {detail ? (
        <TextField
          label={detail.label}
          value={precision}
          onChangeText={(value) => {
            setPrecision(value);
            setErrors((current) => ({ ...current, precision: null }));
          }}
          placeholder={detail.placeholder}
          error={errors.precision}
        />
      ) : null}
      <View className="gap-3">
        <TextField
          label="Motif"
          value={motif}
          onChangeText={(value) => {
            setMotif(value);
            setErrors((current) => ({ ...current, motif: null }));
          }}
          placeholder="À quoi servira ce document ?"
          error={errors.motif}
        />
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View className="flex-row gap-2">
            {suggestions.map((label) => (
              <Chip
                key={label}
                label={label}
                selected={motif === label}
                onPress={() => {
                  setMotif(label);
                  setErrors((current) => ({ ...current, motif: null }));
                }}
              />
            ))}
          </View>
        </ScrollView>
      </View>
      <Field label="Nombre d’exemplaires">
        <Stepper value={copies} onChange={setCopies} />
      </Field>
      <Banner
        tone="chrome"
        icon="office-building-marker-outline"
        title="Remis signé et cacheté"
        message={`Retrait en main propre : ${PICKUP_LOCATION}. ${PICKUP_HOURS}.`}
      />
    </Screen>
  );
}
