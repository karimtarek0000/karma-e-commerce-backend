import cookieParser from 'cookie-parser';
import { dbConnection } from '../../DB/connection.js';

// Routes
import {
  usersRoutes,
  categoriesRoutes,
  subCategoriesRoutes,
  brandsRoutes,
  productsRoutes,
  couponsRoutes,
} from './routes.all.js';

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
  app.use('/users', usersRoutes);

  // 404 ( Not Found )
  app.use('*', (_, res) =>
    res.status(404).json({ message: 'This route not found' })
  );

  // Apply Error
  app.use((err, req, res, next) => {
    if (err) return res.status(err.cause || 400).json({ message: err.message });
  });

  // Server connection
  app.listen(+process.env.PORT, () =>
    console.log('Server listening on port 3000')
  );
}
