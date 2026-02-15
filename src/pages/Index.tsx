import { HabitProvider } from '@/contexts/HabitContext';
import { Dashboard } from '@/components/Dashboard';

const Index = () => {
  return (
    <HabitProvider>
      <Dashboard />
    </HabitProvider>
  );
};

export default Index;
