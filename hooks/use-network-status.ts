/**
 * On web, network `type` is often `NetworkStateType.UNKNOWN` per Expo docs
 * (`navigator.connection.type` is not available in browsers).
 */

import { addNetworkStateListener, getNetworkStateAsync, type NetworkState } from 'expo-network';
import { useEffect, useState } from 'react';

export type { NetworkState } from 'expo-network';

export function useNetworkStatus(): {
  isOnline: boolean;
  isOffline: boolean;
  networkState: NetworkState;
} {
  const [networkState, setNetworkState] = useState<NetworkState>({});

  useEffect(() => {
    let cancelled = false;
    getNetworkStateAsync().then((state) => {
      if (!cancelled) {
        setNetworkState(state);
      }
    });
    const subscription = addNetworkStateListener(setNetworkState);
    return () => {
      cancelled = true;
      subscription.remove();
    };
  }, []);

  const isOnline =
    networkState.isConnected === true && networkState.isInternetReachable !== false;
  const isOffline = !isOnline;

  return { isOnline, isOffline, networkState };
}
