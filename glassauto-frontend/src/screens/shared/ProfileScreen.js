import { useState } from 'react';
import { View } from 'react-native';
import {
  AppHeader,
  Avatar,
  Button,
  Card,
  ListRow,
  Screen,
  SectionHeader,
  Sheet,
  TextField,
  Txt,
} from '../../components/ui';
import { ROLE_META } from '../../data/constants';
import { useAuth } from '../../hooks/useAuth';
import { useFeedback } from '../../hooks/useFeedback';
import { useHrData } from '../../hooks/useHrData';
import { authService } from '../../services';
import { formatDate } from '../../utils/date';

const PHONE_PATTERN = /^0[5-7](\s?\d{2}){4}$/;

export function ProfileScreen({ navigation }) {
  const { user, loginAs, logout } = useAuth();
  const { employeesById, actions } = useHrData();
  const { attempt, confirm } = useFeedback();
  const [phoneOpen, setPhoneOpen] = useState(false);
  const [switchOpen, setSwitchOpen] = useState(false);
  const [phone, setPhone] = useState(user.telephone);
  const [phoneError, setPhoneError] = useState(null);
  const manager = employeesById[user.id_respo_direct];
  const partner = employeesById[user.id_binome];

  const savePhone = async () => {
    if (!PHONE_PATTERN.test(phone.trim())) {
      setPhoneError('Format attendu : 06 00 00 00 00.');
      return;
    }
    await attempt(
      () => actions.employees.updateContact(user.id_personne, { telephone: phone.trim() }),
      { title: 'Téléphone mis à jour' }
    );
    setPhoneOpen(false);
  };

  const signOut = async () => {
    const accepted = await confirm({
      icon: 'logout',
      title: 'Se déconnecter ?',
      message: 'Vous reviendrez à l’écran de connexion.',
      confirmLabel: 'Se déconnecter',
      danger: true,
    });
    if (accepted) {
      await logout();
    }
  };

  const switchProfile = async (id) => {
    setSwitchOpen(false);
    await loginAs(id);
  };

  return (
    <Screen header={<AppHeader title="Mon profil" />}>
      <View className="items-center gap-2">
        <Avatar name={user.full_name} size={84} />
        <Txt size="xl" weight="display" align="center" className="mt-1">
          {user.full_name}
        </Txt>
        <Txt tone="soft" align="center">
          {user.poste}
        </Txt>
        <View className="mt-1 rounded-full bg-crimson px-3.5 py-1.5">
          <Txt size="sm" weight="semi" tone="white">
            {ROLE_META[user.role].label}
          </Txt>
        </View>
      </View>
      <Card>
        <View className="-my-2">
          <ListRow icon="card-account-details-outline" title="Matricule" value={user.matricule} />
          <ListRow
            icon="map-marker-outline"
            title="Affectation"
            value={user.departement ? `${user.centre_nom}, ${user.departement}` : user.centre_nom}
          />
          {manager ? (
            <ListRow icon="account-tie-outline" title="Responsable" value={manager.full_name} />
          ) : null}
          {partner ? (
            <ListRow icon="account-multiple-outline" title="Binôme" value={partner.full_name} />
          ) : null}
          <ListRow icon="calendar-account-outline" title="Embauche" value={formatDate(user.date_embauche)} />
          <ListRow icon="email-outline" title="E-mail" value={user.email} />
          <ListRow
            icon="phone-outline"
            title="Téléphone"
            subtitle={user.telephone}
            onPress={() => {
              setPhone(user.telephone);
              setPhoneError(null);
              setPhoneOpen(true);
            }}
            last
          />
        </View>
      </Card>
      <View className="gap-3">
        <SectionHeader title="Préférences" />
        <Card>
          <View className="-my-2">
            <ListRow
              icon="cog-outline"
              title="Paramètres"
              subtitle="Notifications et vibrations"
              onPress={() => navigation.navigate('Settings')}
            />
            <ListRow
              icon="shield-lock-outline"
              title="Sécurité"
              subtitle="Mot de passe"
              onPress={() => navigation.navigate('Security')}
            />
            <ListRow
              icon="help-circle-outline"
              title="Aide"
              subtitle="Règles et circuits de validation"
              onPress={() => navigation.navigate('Help')}
              last
            />
          </View>
        </Card>
      </View>
      <View className="gap-3">
        <Button
          label="Changer de profil de démonstration"
          icon="account-switch-outline"
          variant="subtle"
          onPress={() => setSwitchOpen(true)}
        />
        <Button label="Se déconnecter" icon="logout" variant="danger" onPress={signOut} />
      </View>
      <Sheet
        visible={phoneOpen}
        onClose={() => setPhoneOpen(false)}
        title="Modifier le téléphone"
        footer={<Button label="Enregistrer" onPress={savePhone} />}
      >
        <TextField
          label="Numéro de téléphone"
          value={phone}
          onChangeText={(value) => {
            setPhone(value);
            setPhoneError(null);
          }}
          keyboardType="phone-pad"
          icon="phone-outline"
          error={phoneError}
        />
      </Sheet>
      <Sheet
        visible={switchOpen}
        onClose={() => setSwitchOpen(false)}
        title="Profils de démonstration"
        subtitle="Les données saisies sont conservées pendant la session."
      >
        {authService.demoAccounts().map((account, index, accounts) => (
          <ListRow
            key={account.id_personne}
            icon={ROLE_META[account.role].icon}
            tone={account.id_personne === user.id_personne ? 'crimson' : undefined}
            title={ROLE_META[account.role].label}
            subtitle={account.full_name}
            onPress={() => switchProfile(account.id_personne)}
            last={index === accounts.length - 1}
          />
        ))}
      </Sheet>
    </Screen>
  );
}
