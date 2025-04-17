
// Type declarations for modules without explicit type definitions
declare namespace React {
  export import ElementType = React.ElementType;
  export import ComponentType = React.ComponentType;
  export import ReactNode = React.ReactNode;
  export import ReactElement = React.ReactElement;
  export import Context = React.Context;
  export import RefObject = React.RefObject;
  export import Ref = React.Ref;
  export import ForwardRefExoticComponent = React.ForwardRefExoticComponent;
  export import HTMLAttributes = React.HTMLAttributes;
  export import ButtonHTMLAttributes = React.ButtonHTMLAttributes;
  export import ComponentPropsWithoutRef = React.ComponentPropsWithoutRef;
  export import ComponentPropsWithRef = React.ComponentPropsWithRef;
  export import ElementRef = React.ElementRef;
  export import PropsWithChildren = React.PropsWithChildren;
  export import PropsWithRef = React.PropsWithRef;
  export import SyntheticEvent = React.SyntheticEvent;
  export import FormEvent = React.FormEvent;
  export import ChangeEvent = React.ChangeEvent;
  export import KeyboardEvent = React.KeyboardEvent;
  export import MouseEvent = React.MouseEvent;
  export import FocusEvent = React.FocusEvent;
  export import FormEventHandler = React.FormEventHandler;
  export import ChangeEventHandler = React.ChangeEventHandler;
  export import KeyboardEventHandler = React.KeyboardEventHandler;
  export import MouseEventHandler = React.MouseEventHandler;
  export import FocusEventHandler = React.FocusEventHandler;
  
  export function createElement(
    type: React.ElementType,
    props?: any,
    ...children: React.ReactNode[]
  ): React.ReactElement;
  
  export function createContext<T>(defaultValue: T): React.Context<T>;
  export function forwardRef<T, P = {}>(
    render: (props: P, ref: React.Ref<T>) => React.ReactElement | null
  ): React.ForwardRefExoticComponent<React.PropsWithoutRef<P> & React.RefAttributes<T>>;
  
  export function useState<T>(initialState: T | (() => T)): [T, (newState: T | ((prevState: T) => T)) => void];
  export function useEffect(effect: () => void | (() => void), deps?: readonly any[]): void;
  export function useContext<T>(context: React.Context<T>): T;
  export function useReducer<R extends React.Reducer<any, any>, I>(
    reducer: R,
    initialArg: I,
    init?: (arg: I) => React.ReducerState<R>
  ): [React.ReducerState<R>, React.Dispatch<React.ReducerAction<R>>];
  export function useCallback<T extends (...args: any[]) => any>(
    callback: T,
    deps: React.DependencyList
  ): T;
  export function useMemo<T>(factory: () => T, deps: React.DependencyList | undefined): T;
  export function useRef<T = undefined>(initialValue: T): React.MutableRefObject<T>;
  export function useLayoutEffect(effect: React.EffectCallback, deps?: React.DependencyList): void;
  export function useId(): string;
}

declare module 'react' {
  export = React;
}

declare module 'react/jsx-runtime' {
  export const jsx: any;
  export const jsxs: any;
  export const Fragment: React.ReactNode;
}

declare module 'react-dom' {
  export function render(
    element: React.ReactElement,
    container: Element | DocumentFragment,
    callback?: () => void
  ): void;
  export function unmountComponentAtNode(container: Element): boolean;
  export function createPortal(
    children: React.ReactNode,
    container: Element
  ): React.ReactPortal;
}

declare module 'react-router-dom';
declare module '@hookform/resolvers/zod';
declare module 'zod';
declare module 'lucide-react';
