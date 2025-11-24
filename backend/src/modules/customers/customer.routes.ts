import { Router } from 'express';
import { CustomerController } from './customer.controller';
import {
  createCustomerValidator,
  updateCustomerValidator,
  listCustomersValidator,
  customerIdValidator,
} from './customer.validator';

const router = Router();
const customerController = new CustomerController();

// GET /api/customers - Listar clientes con paginación y búsqueda
router.get('/', listCustomersValidator, customerController.listCustomers);

// GET /api/customers/:id - Obtener un cliente por ID
router.get('/:id', customerIdValidator, customerController.getCustomer);

// POST /api/customers - Crear un nuevo cliente
router.post('/', createCustomerValidator, customerController.createCustomer);

// PUT /api/customers/:id - Actualizar un cliente
router.put('/:id', updateCustomerValidator, customerController.updateCustomer);

// DELETE /api/customers/:id - Soft delete (marcar como eliminado)
router.delete('/:id', customerIdValidator, customerController.softDeleteCustomer);

// DELETE /api/customers/:id/hard - Hard delete (eliminar permanentemente)
router.delete('/:id/hard', customerIdValidator, customerController.hardDeleteCustomer);

export default router;
