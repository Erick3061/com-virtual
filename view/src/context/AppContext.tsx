import { createContext, useReducer } from 'react';
import { io, Socket } from 'socket.io-client';
import { ResponseReceiver } from '../interfaces/interfaces';

type State = {
    state: boolean;
    socket: Socket;
    receiver?: ResponseReceiver;
}

type Action =
    | { type: 'updateState', payload: boolean }
    | { type: 'updateReceiver', payload?: ResponseReceiver }
    | { type: 'updateSocket', payload: Socket }
    ;

const initialState: State = {
    state: false,
    socket: io('http://localhost:4000/', { autoConnect: true }),
}

interface ContextProps extends State {
    // updateState: () => void;
    updatereceiver: (receiver?: ResponseReceiver) => void;
}

export const AppContext = createContext({} as ContextProps);

const Reducer = (state: State, action: Action): State => {
    switch (action.type) {
        case 'updateState':
            return {
                ...state,
                state: action.payload
            };
        case 'updateReceiver':
            return {
                ...state,
                receiver: action.payload
            };
        case 'updateSocket':
            return {
                ...state,
                socket: action.payload
            }
        default: return state;
    }
}

export const AppProvider = ({ children }: any) => {
    const [state, dispatch] = useReducer(Reducer, initialState);

    state.socket.on('connect', () => {
        dispatch({ type: 'updateState', payload: true });
    });

    state.socket.on('disconnect', () => {
        dispatch({ type: 'updateState', payload: false });
    });

    const updatereceiver = (receiver?: ResponseReceiver) => dispatch({ type: 'updateReceiver', payload: receiver });


    return (
        <AppContext.Provider
            value={{
                ...state,
                updatereceiver
            }}
        >
            {children}
        </AppContext.Provider>
    )
}