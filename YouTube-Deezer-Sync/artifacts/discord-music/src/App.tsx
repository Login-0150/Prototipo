import { Switch, Route, Router as WouterRouter } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { MusicProvider } from "./context/MusicContext";
import Layout from "./components/layout/Layout";
import NotFound from "@/pages/not-found";
import Home from "./pages/Home";
import Spotify from "./pages/Spotify";
import YouTube from "./pages/YouTube";
import RadioPage from "./pages/Radio";
import Playlists from "./pages/Playlists";
import History from "./pages/History";
import Settings from "./pages/Settings";
import Rooms from "./pages/Rooms";

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/spotify" component={Spotify} />
        <Route path="/youtube" component={YouTube} />
        <Route path="/radio" component={RadioPage} />
        <Route path="/playlists" component={Playlists} />
        <Route path="/history" component={History} />
        <Route path="/settings" component={Settings} />
        <Route path="/rooms" component={Rooms} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <TooltipProvider>
      <MusicProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </MusicProvider>
    </TooltipProvider>
  );
}

export default App;
