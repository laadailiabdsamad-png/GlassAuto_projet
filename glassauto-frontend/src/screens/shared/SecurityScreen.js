import { useState } from 'react';
import { AppHeader, Banner, Button, Screen, TextField } from '../../components/ui';
import { useFeedback } from '../../hooks/useFeedback';
import { authService } from '../../services';

const emptyForm = { current: '', next: '', repeat: '' };

export function SecurityScreen({ navigation }) {
  const { showToast } = useFeedback();
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});

  const update = (key) => (value) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: null }));
  };

  const submit = async () => {
    const next = {};
    if (!form.current) {
      next.current = 'Saisissez votre mot de passe actuel.';
    }
    if (form.next.length < 8) {
      next.next = 'Le nouveau mot de passe doit contenir au moins 8 caractères.';
    } else if (!/\d/.test(form.next)) {
      next.next = 'Ajoutez au moins un chiffre.';
    }
    if (form.repeat !== form.next) {
      next.repeat = 'Les deux mots de passe ne correspondent pas.';
    }
    setErrors(next);
    if (Object.keys(next).length > 0) {
      return;
    }
    try {
      await authService.changePassword({ current: form.current, next: form.next });
      setForm(emptyForm);
      showToast({
        tone: 'info',
        title: 'Formulaire validé',
        message: 'En démonstration, le mot de passe demo2026 reste actif.',
      });
      navigation.goBack();
    } catch (error) {
      setErrors({ current: error.message });
    }
  };

  return (
    <Screen
      header={<AppHeader title="Sécurité" />}
      footer={<Button label="Changer le mot de passe" onPress={submit} />}
    >
      <Banner
        tone="sky"
        icon="shield-lock-outline"
        message="L’authentification sera assurée par le serveur lors de l’intégration. Cet écran est simulé."
      />
      <TextField
        label="Mot de passe actuel"
        value={form.current}
        onChangeText={update('current')}
        secure
        autoCapitalize="none"
        error={errors.current}
      />
      <TextField
        label="Nouveau mot de passe"
        value={form.next}
        onChangeText={update('next')}
        secure
        autoCapitalize="none"
        hint="8 caractères minimum, dont un chiffre"
        error={errors.next}
      />
      <TextField
        label="Confirmer le nouveau mot de passe"
        value={form.repeat}
        onChangeText={update('repeat')}
        secure
        autoCapitalize="none"
        error={errors.repeat}
      />
    </Screen>
  );
}
