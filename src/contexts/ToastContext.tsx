import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import Toast, { ToastType } from '../components/common/Toast';

interface ToastState {
  isVisible: boolean;
  type: ToastType;
  message: string;
}

type ToastAction =
  | { type: 'SHOW_TOAST'; payload: { type: ToastType; message: string } }
  | { type: 'HIDE_TOAST' };

interface ToastContextType {
  showToast: (type: ToastType, message: string) => void;
  hideToast: () => void;
}

const initialState: ToastState = {
  isVisible: false,
  type: 'info',
  message: '',
};

const ToastContext = createContext<ToastContextType | undefined>(undefined);

const toastReducer = (state: ToastState, action: ToastAction): ToastState => {
  switch (action.type) {
    case 'SHOW_TOAST':
      return {
        isVisible: true,
        type: action.payload.type,
        message: action.payload.message,
      };
    case 'HIDE_TOAST':
      return {
        ...state,
        isVisible: false,
      };
    default:
      return state;
  }
};

export type { ToastType };

export const ToastProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(toastReducer, initialState);

  const showToast = (type: ToastType, message: string) => {
    dispatch({ type: 'SHOW_TOAST', payload: { type, message } });
  };

  const hideToast = () => {
    dispatch({ type: 'HIDE_TOAST' });
  };

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}
      {state.isVisible && (
        <Toast type={state.type} message={state.message} onClose={hideToast} />
      )}
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
