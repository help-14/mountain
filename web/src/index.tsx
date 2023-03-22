/* @refresh reload */
import { render } from 'solid-js/web';
import { HopeProvider, HopeThemeConfig } from '@hope-ui/solid'

import './index.css';
import App from './App';

const root = document.getElementById('root');

if (import.meta.env.DEV && !(root instanceof HTMLElement)) {
  throw new Error(
    'Root element not found. Did you forget to add it to your index.html? Or maybe the id attribute got mispelled?',
  );
}

const config: HopeThemeConfig = {
  lightTheme: {
    colors: {
      primary9: "salmon"
    }
  }
}

render(() => {
  return (
    <HopeProvider config={config}>
      <App />
    </HopeProvider>
  )
}, root!);
