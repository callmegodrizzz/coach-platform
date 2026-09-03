import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

const on = Platform.OS === 'ios' || Platform.OS === 'android';

export const tap = () => {
  if (on) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
};

export const press = () => {
  if (on) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
};

export const select = () => {
  if (on) Haptics.selectionAsync();
};

export const success = () => {
  if (on) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
};

export const warn = () => {
  if (on) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
};
