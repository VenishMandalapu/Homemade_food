import express from 'express';
import { createOrder, getAllOrders, getMyOrders, updateOrderStatus } from '../controllers/orderController.js';
import { verifyToken, isAdmin } from '../middleware/auth.js';

const router = express.Router();

router.post('/', verifyToken, createOrder);
router.get('/my-orders', verifyToken, getMyOrders);
router.get('/', verifyToken, isAdmin, getAllOrders);
router.put('/:id/status', verifyToken, isAdmin, updateOrderStatus);

export default router;
