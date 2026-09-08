import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      // Тесты гоняют чистую логику, нативное хранилище им не нужно.
      '@react-native-async-storage/async-storage': path.resolve(
        __dirname,
        'src/lib/__tests__/asyncStorageStub.ts',
      ),
    },
  },
  test: {
    environment: 'node',
  },
});
