import { useApp } from '../context/AppContext';
import useOrchestratorStore from '../store/orchestratorStore';

/** Fiat balance: orchestrator override wins over AppContext / server sync */
export function useFiatBalance() {
  const { user } = useApp();
  const orchestratorBalance = useOrchestratorStore((s) => s.balance);
  return orchestratorBalance !== null ? orchestratorBalance : user?.balance ?? 0;
}

export default useFiatBalance;
