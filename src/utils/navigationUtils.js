import { ActionSheetIOS, Alert, Linking, Platform } from 'react-native';

const FALLBACK_URL = (lat, lng) =>
  `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;

const errorAlert = () =>
  Alert.alert('Грешка', 'Не успяхме да отворим навигацията. Провери дали имаш инсталирано приложение за карти.');

const buildOptions = (lat, lng) => {
  const destinationParam = `${lat},${lng}`;

  const options = [
    {
      label: 'Google Maps',
      scheme: Platform.OS === 'ios' ? `comgooglemaps://?daddr=${destinationParam}` : `geo:${destinationParam}?q=${destinationParam}`,
      fallback: `https://www.google.com/maps/dir/?api=1&destination=${destinationParam}`,
    },
    {
      label: 'Waze',
      scheme: `waze://?ll=${destinationParam}&navigate=yes`,
      fallback: `https://waze.com/ul?ll=${destinationParam}&navigate=yes`,
    },
  ];

  if (Platform.OS === 'ios') {
    options.push({
      label: 'Apple Maps',
      scheme: `http://maps.apple.com/?daddr=${destinationParam}&dirflg=d`,
      fallback: `http://maps.apple.com/?daddr=${destinationParam}&dirflg=d`,
    });
  }

  return options.map((option) => ({
    ...option,
  }));
};

const openPreferredUrl = async (schemeUrl, fallbackUrl) => {
  if (schemeUrl) {
    try {
      const canOpen = await Linking.canOpenURL(schemeUrl);
      if (canOpen) {
        await Linking.openURL(schemeUrl);
        return true;
      }
    } catch {
      // ignore and try fallback
    }
  }
  if (fallbackUrl) {
    try {
      await Linking.openURL(fallbackUrl);
      return true;
    } catch {
      // ignore
    }
  }
  return false;
};

export async function chooseNavigationApp(lat, lng) {
  if (lat == null || lng == null) {
    errorAlert();
    return;
  }

  const options = buildOptions(lat, lng);

  const handleSelection = async (index) => {
    const selected = options[index];
    if (!selected) {
      return;
    }
    const opened = await openPreferredUrl(selected.scheme, selected.fallback);
    if (!opened) {
      const fallbackOpened = await openPreferredUrl(null, FALLBACK_URL(lat, lng));
      if (!fallbackOpened) {
        errorAlert();
      }
    }
  };

  const cancelLabel = 'Отказ';
  if (Platform.OS === 'ios') {
    ActionSheetIOS.showActionSheetWithOptions(
      {
        title: 'Избери навигация',
        options: [...options.map((option) => option.label), cancelLabel],
        cancelButtonIndex: options.length,
      },
      (buttonIndex) => {
        if (buttonIndex === options.length) {
          return;
        }
        handleSelection(buttonIndex);
      },
    );
  } else {
    Alert.alert(
      'Избери навигация',
      'Избери приложение за навигация',
      [
        ...options.map((option, index) => ({
          text: option.label,
          onPress: () => handleSelection(index),
        })),
        { text: cancelLabel, style: 'cancel' },
      ],
    );
  }
}
