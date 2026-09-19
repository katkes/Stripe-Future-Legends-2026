import { RecipePage } from '../../recipe-feature/components/RecipePage';
import { AppShell } from '../../components/AppShell';

export default function RecipesRoute() {
  return (
    <AppShell>
      <RecipePage />
    </AppShell>
  );
}
