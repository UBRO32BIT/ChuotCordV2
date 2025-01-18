import React from 'react';
import logo from './logo.svg';
import './App.css';
import { SnackbarOrigin, SnackbarProvider } from 'notistack';
import Router from './router/router';
import SuccessSnackbar from './components/CustomSnackbar/SuccessSnackbar';
import ErrorSnackbar from './components/CustomSnackbar/ErrorSnackbar';
import { io } from 'socket.io-client';
import { SocketProvider } from './context/SocketProvider';

type AnchorOrigin = SnackbarOrigin;
const customAnchorOrigin: AnchorOrigin = {
  vertical: 'bottom',
  horizontal: 'right',
};
declare module "notistack" {
  interface VariantOverrides {
    successSnackbar: true;
    errorSnackbar: {         
      errorDetailMessage: string  
    }
  }
}

function App() {
  React.useEffect(() => {

  }, [])
  
  return (
    <div className="App">
      <SocketProvider>
        <SnackbarProvider
          maxSnack={3}
          anchorOrigin={customAnchorOrigin}
          Components={{
            successSnackbar: SuccessSnackbar,
            errorSnackbar: ErrorSnackbar
          }}>
          <Router />
        </SnackbarProvider>
      </SocketProvider>
    </div>
  );
}

export default App;
