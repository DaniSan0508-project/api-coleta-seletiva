import { Router } from 'express';
import knex from '../database/connection';

const Itemsrouter = Router();

Itemsrouter.get('/', async (request, response) => {
  const items = await knex.select('*').from('items');
  return response.json(items);
});

export default Itemsrouter;
