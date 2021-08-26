import { Router } from 'express';
import ItemsRouter from './items.routes';

const routes = Router();

routes.use('/items', ItemsRouter);

export default routes;
