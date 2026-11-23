import { useContext } from 'react';
import { HrDataContext } from '../context/HrDataContext';

export const useHrData = () => useContext(HrDataContext);