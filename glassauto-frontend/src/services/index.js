import { apiConfig } from '../api/config';
import { httpServices } from './http';
import { mockServices } from './mock';

export const services = apiConfig.useMock ? mockServices : httpServices;

export const {
  authService,
  employeeService,
  leaveService,
  documentService,
  absenceService,
  planningService,
  notificationService,
} = services;
