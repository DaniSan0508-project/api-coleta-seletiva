import { Router } from 'express';
import knex from '../database/connection';

const Itemsrouter = Router();

Itemsrouter.get('/', async (request, response) => {
  const items = await knex.select('*').from('items');

  const serializedItems = items.map(item => {
    return {
      id: item.id,
      title: item.title,
      image_url: `http://localhost:3333/uploads/${item.image}`,
    };
  });
  return response.json(serializedItems);
});

export default Itemsrouter;
