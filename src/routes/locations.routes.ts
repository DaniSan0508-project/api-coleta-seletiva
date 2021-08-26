import { Router } from 'express';
import knex from '../database/connection';

const locationsRouter = Router();

interface locationIR {
  name: string;
  email: string;
  whatsapp: string;
  latitude: number;
  longitude: number;
  city: string;
  uf: string;
  items: number[];
}

locationsRouter.post('/', async (request, response) => {
  const {
    name,
    email,
    whatsapp,
    latitude,
    longitude,
    city,
    uf,
    items,
  }: locationIR = request.body;

  const location = {
    image: 'fake-image.jpg',
    name,
    email,
    whatsapp,
    latitude,
    longitude,
    city,
    uf,
  };

  const transaction = await knex.transaction();

  const newsId = await transaction('location').insert(location);
  const location_id = newsId[0];

  const locationItems = await Promise.all(
    items.map(async item_id => {
      const selectedItem = await transaction('items')
        .where('id', item_id)
        .first();

      if (!selectedItem) {
        await transaction.rollback();
        return response.status(400).json({ msg: 'item not found' });
      }
      return {
        item_id,
        location_id,
      };
    }),
  );

  await transaction('location_items').insert(locationItems);

  await transaction.commit();

  return response.json({
    id: location_id,
    ...location,
  });
});

locationsRouter.get('/:id', async (request, response) => {
  const { id } = request.params;
  const location = await knex('location').where('id', id).first();

  if (!location) {
    return response.status(400).json({ msg: 'Location not found' });
  }

  const items = await knex('items')
    .join('location_items', 'items.id', '=', 'location_items.item_id')
    .where('location_items.location_id', id)
    .select('items.title');

  return response.json({ location, items });
});

export default locationsRouter;
