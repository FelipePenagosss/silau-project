import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import customerRoutes from './modules/customers/customer.routes';
import userRoutes from './modules/user/user.routes';
import productRoutes from './modules/product/product.routes'; // ← AGREGAR
import { errorHandler } from './middlewares/errorHandler';
import orderRoutes from './modules/order/order.routes';


dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(helmet());
app.use(cors());

app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});

// Routes
app.use('/api/customers', customerRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes); // ← AGREGAR
// Agregar la ruta en la sección de API routes (después de las rutas existentes)
app.use('/api/orders', orderRoutes);

// Error handler (debe estar al final)
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;
