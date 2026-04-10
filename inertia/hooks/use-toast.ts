import * as React from "react";

export type Toast = {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

const TOAST_LIMIT = 1;
const TOAST_REMOVE_DELAY = 1000000;

type ToastState = {
  toasts: Toast[];
};

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>();
const listeners: Array<(state: ToastState) => void> = [];

let memoryState: ToastState = { toasts: [] };

function notify() {
  for (const listener of listeners) {
    listener(memoryState);
  }
}

function dispatch(action: { type: "ADD_TOAST"; toast: Toast } | { type: "UPDATE_TOAST"; toast: Partial<Toast> & { id: string } } | { type: "DISMISS_TOAST"; toastId?: string } | { type: "REMOVE_TOAST"; toastId?: string }) {
  switch (action.type) {
    case "ADD_TOAST": {
      memoryState = {
        toasts: [action.toast, ...memoryState.toasts].slice(0, TOAST_LIMIT),
      };
      break;
    }
    case "UPDATE_TOAST": {
      memoryState = {
        toasts: memoryState.toasts.map((toast) => (toast.id === action.toast.id ? { ...toast, ...action.toast } : toast)),
      };
      break;
    }
    case "DISMISS_TOAST": {
      const { toastId } = action;
      if (toastId) {
        scheduleToastRemoval(toastId);
      } else {
        for (const toast of memoryState.toasts) {
          scheduleToastRemoval(toast.id);
        }
      }

      memoryState = {
        toasts: memoryState.toasts.map((toast) =>
          toastId === undefined || toast.id === toastId ? { ...toast, open: false } : toast,
        ),
      };
      break;
    }
    case "REMOVE_TOAST": {
      if (action.toastId === undefined) {
        memoryState = { toasts: [] };
        break;
      }

      memoryState = {
        toasts: memoryState.toasts.filter((toast) => toast.id !== action.toastId),
      };
      break;
    }
  }

  notify();
}

function scheduleToastRemoval(toastId: string) {
  if (toastTimeouts.has(toastId)) {
    return;
  }

  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId);
    dispatch({ type: "REMOVE_TOAST", toastId });
  }, TOAST_REMOVE_DELAY);

  toastTimeouts.set(toastId, timeout);
}

export function toast(options: Omit<Toast, "id">) {
  const id = crypto.randomUUID();

  dispatch({
    type: "ADD_TOAST",
    toast: {
      ...options,
      id,
      open: true,
      onOpenChange: (open) => {
        if (!open) {
          dispatch({ type: "DISMISS_TOAST", toastId: id });
        }
      },
    },
  });

  return {
    id,
    dismiss: () => dispatch({ type: "DISMISS_TOAST", toastId: id }),
    update: (nextToast: Partial<Toast>) => dispatch({ type: "UPDATE_TOAST", toast: { ...nextToast, id } }),
  };
}

export function useToast() {
  const [state, setState] = React.useState(memoryState);

  React.useEffect(() => {
    listeners.push(setState);
    setState(memoryState);

    return () => {
      const index = listeners.indexOf(setState);
      if (index >= 0) {
        listeners.splice(index, 1);
      }
    };
  }, []);

  return {
    ...state,
    toast,
    dismiss: (toastId?: string) => dispatch({ type: "DISMISS_TOAST", toastId }),
  };
}