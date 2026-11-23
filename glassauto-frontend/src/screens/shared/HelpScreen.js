import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { AppHeader, Banner, Card, Icon, Screen, Txt } from '../../components/ui';
import { PICKUP_HOURS, PICKUP_LOCATION } from '../../data/constants';
import { colors } from '../../theme';

const topics = [
  {
    title: 'Comment ma demande de congé est-elle validée ?',
    body: 'Votre responsable de centre vérifie d’abord qu’un substitut est disponible dans le centre. Sans solution locale, le responsable technique cherche un remplaçant dans les 31 centres. Le Service RH prononce ensuite la validation finale.',
  },
  {
    title: 'Qu’est-ce que la règle des 20 jours ?',
    body: 'Toute demande qui ne figure pas au planning annuel doit être envoyée au moins 20 jours avant le premier jour de congé. Une période prévue au planning en est dispensée.',
  },
  {
    title: 'Quand mon solde est-il déduit ?',
    body: 'Le solde est déduit uniquement après la validation finale du Service RH. Les dimanches et les jours fériés nationaux à date fixe ne sont pas décomptés.',
  },
  {
    title: 'Que se passe-t-il si mon responsable est absent ?',
    body: 'La demande est acheminée directement au Service RH. Les congés des responsables suivent le même circuit.',
  },
  {
    title: 'Comment récupérer mon document ?',
    body: `Les documents sont signés, cachetés et remis en main propre. Vous recevez une notification dès qu’ils sont prêts. ${PICKUP_LOCATION}. ${PICKUP_HOURS}.`,
  },
  {
    title: 'Pourquoi justifier une absence passée ?',
    body: 'Le Service RH consulte les justifications lors du calcul de la paie. Une absence acceptée est régularisée, sinon elle est retenue.',
  },
];

export function HelpScreen() {
  const [open, setOpen] = useState(0);
  return (
    <Screen header={<AppHeader title="Aide" subtitle="Règles et circuits de validation" />} gap={12}>
      {topics.map((topic, index) => {
        const expanded = open === index;
        return (
          <Card key={topic.title} padded={false}>
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ expanded }}
              onPress={() => setOpen(expanded ? -1 : index)}
              className="min-h-[60px] flex-row items-center gap-3 p-4 active:opacity-70"
            >
              <Txt weight="semi" className="flex-1">
                {topic.title}
              </Txt>
              <Icon name={expanded ? 'chevron-up' : 'chevron-down'} size={22} color={colors.mute} />
            </Pressable>
            {expanded ? (
              <View className="px-4 pb-4">
                <Txt tone="soft">{topic.body}</Txt>
              </View>
            ) : null}
          </Card>
        );
      })}
      <Banner
        tone="chrome"
        icon="information-outline"
        message="GlassAuto Express HR, version de démonstration 1.0.0."
      />
    </Screen>
  );
}
