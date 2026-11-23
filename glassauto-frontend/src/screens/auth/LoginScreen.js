import { useState } from 'react';
import { Image, Pressable, View } from 'react-native';
import Svg, { Defs, LinearGradient, Path, Stop } from 'react-native-svg';
import { Button, Icon, IconTile, Screen, Sheet, TextField, Txt } from '../../components/ui';
import { ROLE_META } from '../../data/constants';
import { useAuth } from '../../hooks/useAuth';
import { useFeedback } from '../../hooks/useFeedback';
import { authService } from '../../services';
import { colors } from '../../theme';

const logo = require('../../../assets/glassauto-logo.png');

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function Windshield() {
  return (
    <View className="items-center justify-center">
      <View style={{ width: '100%', aspectRatio: 340 / 172 }}>
        <Svg width="100%" height="100%" viewBox="0 0 340 172">
          <Defs>
            <LinearGradient id="glass" x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0" stopColor="#ffffff" />
              <Stop offset="0.55" stopColor="#f3f2f1" />
              <Stop offset="1" stopColor="#cdcbca" />
            </LinearGradient>
          </Defs>
          <Path
            d="M44 16 Q170 -2 296 16 Q310 18 314 31 L336 128 Q340 147 321 151 Q170 178 19 151 Q0 147 4 128 L26 31 Q30 18 44 16 Z"
            fill="url(#glass)"
          />
          <Path d="M232 8 L262 11 L176 165 L126 164 Z" fill="#ffffff" fillOpacity="0.55" />
          <Path d="M276 13 L288 15 L206 163 L190 164 Z" fill="#ffffff" fillOpacity="0.45" />
          <Path
            d="M40 158 Q170 178 300 158"
            stroke="#d41514"
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
          />
        </Svg>
        <View
          style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 8 }}
          className="items-center justify-center"
        >
          <Image
            source={logo}
            accessibilityLabel="GlassAuto Express, membre Automotive Glass Europe"
            resizeMode="contain"
            style={{ width: '74%', height: '48%' }}
          />
        </View>
      </View>
    </View>
  );
}

function DemoProfile({ employee, busy, disabled, onPress }) {
  const meta = ROLE_META[employee.role];
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Ouvrir la démonstration ${meta.label}`}
      disabled={disabled}
      onPress={onPress}
      className={`flex-row items-center gap-3 rounded-2xl border border-white/10 bg-carbon p-3 active:bg-graphite ${disabled && !busy ? 'opacity-50' : ''}`}
    >
      <IconTile icon={meta.icon} tone={busy ? 'crimson' : undefined} size={44} />
      <View className="flex-1">
        <Txt weight="semi">{meta.label}</Txt>
        <Txt size="sm" tone="mute" numberOfLines={1}>
          {meta.description}
        </Txt>
      </View>
      <Icon name={busy ? 'progress-clock' : 'arrow-right'} size={20} color={colors.soft} />
    </Pressable>
  );
}

export function LoginScreen() {
  const { login, loginAs } = useAuth();
  const { showToast } = useFeedback();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [openingId, setOpeningId] = useState(null);
  const [resetOpen, setResetOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetError, setResetError] = useState(null);
  const accounts = authService.demoAccounts();

  const submit = async () => {
    const next = {};
    if (!EMAIL_PATTERN.test(email.trim())) {
      next.email = 'Saisissez une adresse e-mail valide.';
    }
    if (password.length === 0) {
      next.password = 'Saisissez votre mot de passe.';
    }
    setErrors(next);
    if (Object.keys(next).length > 0) {
      return;
    }
    try {
      await login({ email, password });
    } catch (error) {
      setErrors({ password: error.message });
    }
  };

  const openDemo = async (employee) => {
    setOpeningId(employee.id_personne);
    try {
      await loginAs(employee.id_personne);
    } catch (error) {
      setOpeningId(null);
      showToast({ tone: 'error', title: 'Connexion impossible', message: error.message });
    }
  };

  const sendReset = async () => {
    if (!EMAIL_PATTERN.test(resetEmail.trim())) {
      setResetError('Saisissez une adresse e-mail valide.');
      return;
    }
    await authService.requestPasswordReset({ email: resetEmail });
    setResetOpen(false);
    showToast({
      tone: 'info',
      title: 'Demande simulée',
      message: 'En démonstration, aucun e-mail n’est envoyé.',
    });
  };

  return (
    <Screen gap={26}>
      <Windshield />
      <View className="gap-1.5">
        <Txt size="xl" weight="display" accessibilityRole="header">
          Votre espace RH
        </Txt>
        <Txt tone="soft">Congés, documents et absences, suivis de la demande à la décision.</Txt>
      </View>
      <View className="gap-4">
        <TextField
          label="Adresse e-mail"
          value={email}
          onChangeText={(value) => {
            setEmail(value);
            setErrors((current) => ({ ...current, email: null }));
          }}
          placeholder="prenom.nom@glassauto.demo"
          icon="email-outline"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          error={errors.email}
        />
        <TextField
          label="Mot de passe"
          value={password}
          onChangeText={(value) => {
            setPassword(value);
            setErrors((current) => ({ ...current, password: null }));
          }}
          placeholder="Votre mot de passe"
          icon="lock-outline"
          secure
          autoCapitalize="none"
          onSubmitEditing={submit}
          error={errors.password}
        />
        <Pressable
          accessibilityRole="button"
          onPress={() => {
            setResetEmail(email);
            setResetError(null);
            setResetOpen(true);
          }}
          hitSlop={10}
          className="self-end active:opacity-60"
        >
          <Txt size="sm" weight="semi" tone="soft">
            Mot de passe oublié
          </Txt>
        </Pressable>
        <Button label="Se connecter" onPress={submit} disabled={openingId !== null} />
      </View>
      {accounts.length > 0 ? (
        <View className="gap-3">
          <View className="gap-1">
            <Txt size="md" weight="display">
              Profils de démonstration
            </Txt>
            <Txt size="sm" tone="mute">
              Données fictives, connexion simulée sans serveur. Mot de passe commun : demo2026.
            </Txt>
          </View>
          {accounts.map((employee) => (
            <DemoProfile
              key={employee.id_personne}
              employee={employee}
              busy={openingId === employee.id_personne}
              disabled={openingId !== null}
              onPress={() => openDemo(employee)}
            />
          ))}
        </View>
      ) : null}
      <Sheet
        visible={resetOpen}
        onClose={() => setResetOpen(false)}
        title="Mot de passe oublié"
        subtitle="Indiquez l’adresse e-mail de votre compte."
        footer={<Button label="Envoyer la demande" onPress={sendReset} />}
      >
        <TextField
          label="Adresse e-mail"
          value={resetEmail}
          onChangeText={(value) => {
            setResetEmail(value);
            setResetError(null);
          }}
          placeholder="prenom.nom@glassauto.demo"
          icon="email-outline"
          keyboardType="email-address"
          autoCapitalize="none"
          error={resetError}
        />
      </Sheet>
    </Screen>
  );
}
