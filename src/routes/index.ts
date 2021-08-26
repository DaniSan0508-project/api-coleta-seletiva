import { Router } from 'express';
import ItemsRouter from './items.routes';
import locationsRouter from './locations.routes';

const routes = Router();

routes.use('/items', ItemsRouter);
routes.use('/locations', locationsRouter);

export default routes;
