import { useSyncExternalStore } from 'react';

import type { Settings } from '../models/settings';
import { settingsService } from './settings-service';

export function useSettings(): Settings {
    return useSyncExternalStore(settingsService.subscribe, settingsService.getSettings);
}
