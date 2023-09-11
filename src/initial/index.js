import cookieParser from 'cookie-parser';
import { dbConnection } from '../../DB/connection.js';

// Routes
import {
  authRoutes,
  categoriesRoutes,
  subCategoriesRoutes,
  brandsRoutes,
  productsRoutes,
  couponsRoutes,
  cartRoutes,
  orderRoutes,
} from './routes.all.js';
import { changeStatusCoupon } from '../utils/crons.js';

export default function initialProject(app) {
  // Middleware for cookies parsing
  app.use(cookieParser());

  // Database connection
  dbConnection();

  // Routes endpoints
  app.use('/categories', categoriesRoutes);
  app.use('/sub-categories', subCategoriesRoutes);
  app.use('/brands', brandsRoutes);
  app.use('/products', productsRoutes);
  app.use('/coupons', couponsRoutes);
  app.use('/cart', cartRoutes);
  app.use('/order', orderRoutes);
  app.use('/auth', authRoutes);

  // Cron jobs
  changeStatusCoupon();

  // 404 ( Not Found )
  app.use('*', (_, res) => res.status(404).json({ message: 'This route not found' }));

  // Apply Error
  app.use((err, req, res, next) => {
    if (err) {
      return res.status(err.cause || 400).json({ message: req.validationErrors || err.message });
    }
  });

  // Server connection
  app.listen(+process.env.PORT || 4000, () => console.log('Server listening on port 3000'));
}
