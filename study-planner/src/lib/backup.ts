import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { toISO } from './dates';
import type { Item } from './store';

/** Выгружает всё в JSON и открывает системный шэр — сохранить в Файлы или отправить себе. */
export async function exportBackup(items: Item[]): Promise<void> {
  const payload = JSON.stringify({ version: 1, exportedAt: new Date().toISOString(), items }, null, 2);
  const name = `planer-backup-${toISO(new Date())}.json`;
  const file = new FileSystem.File(FileSystem.Paths.cache, name);
  if (file.exists) file.delete();
  file.create();
  file.write(payload);

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(file.uri, {
      mimeType: 'application/json',
      dialogTitle: 'Резервная копия планера',
    });
  }
}
