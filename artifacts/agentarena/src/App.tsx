import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Route, Switch, Router as WouterRouter } from 'wouter';
import { GameProvider } from './lib/store';
import { Layout } from './components/layout';

import Landing from './pages/landing';
import Lobby from './pages/lobby';
import BoardView from './pages/board';
import Simulator from './pages/simulator';
import Leaderboard from './pages/leaderboard';
import HowItWorks from './pages/how-it-works';

const queryClient = new QueryClient();

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Landing} />
        <Route path="/arena" component={Lobby} />
        <Route path="/arena/:boardId" component={BoardView} />
        <Route path="/simulator" component={Simulator} />
        <Route path="/leaderboard" component={Leaderboard} />
        <Route path="/how-it-works" component={HowItWorks} />
        <Route>
          <div className="flex items-center justify-center h-[50vh] font-mono text-2xl uppercase font-bold">
            404 - Area Not Found
          </div>
        </Route>
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <GameProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
      </GameProvider>
    </QueryClientProvider>
  );
}

export default App;
