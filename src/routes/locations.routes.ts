import { request, Router } from 'express';
import knex from '../database/connection';
import multerConfig from '../config/multer';
import multer from 'multer';

const locationsRouter = Router();
const upload = multer(multerConfig);

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

locationsRouter.get('/', async (request, response) => {
  const { city, uf, items } = request.query;

  if (city && uf && items) {
    const parsedItems = String(items)
      .split(',')
      .map(item => Number(item.trim()));

    const locations = await knex('location')
      .join('location_items', 'location.id', '=', 'location_items.location_id')
      .whereIn('location_items.item_id', parsedItems)
      .where('city', '=', String(city))
      .where('uf', String(uf))
      .distinct()
      .select('location.*');

    return response.json(locations);
  } else {
    return response.status(400).json({ msg: 'fill all fields' });
  }
});
locationsRouter.put(
  '/:id',
  upload.single('image'),
  async (request, response) => {
    const { id } = request.params;
    const image = request.file?.filename;

    const location = await knex('location').where('id', id).first();

    if (!location) {
      return response.status(400).json({ msg: 'Location not found' });
    }

    const locationUpdated = {
      ...location,
      image,
    };

    await knex('location').update(locationUpdated).where('id', id);

    return response.json(locationUpdated);
  },
);

export default locationsRouter;
