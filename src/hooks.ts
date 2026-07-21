// Typed Redux hooks so components don't have to re-declare the state shape.
import { TypedUseSelectorHook, useSelector } from 'react-redux';
import { AppState } from './types';

export const useAppSelector: TypedUseSelectorHook<AppState> = useSelector;
