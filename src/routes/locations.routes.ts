import { Router } from 'express';
import knex from '../database/connection';

const locationsRouter = Router();

locationsRouter.post('/', async (request, response) => {
  const { name, email, whatsapp, latitude, longitude, city, uf, items } =
    request.body;

  const location = {
    image: 'fake-image.jpg',
    name,
    email,
    whatsapp,
    latitude,
    longitude,
    city,
    uf,
    items,
  };

  const newsId = await knex('location').insert(location);
  const locationId = newsId[0];

  const locationItens = items.map((item_id: number) => {
    return {
      item_id,
      location_id: locationId,
    };
  });

  return response.json(locationItens);
});

export default locationsRouter;
