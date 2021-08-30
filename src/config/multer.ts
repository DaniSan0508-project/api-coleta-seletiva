import multer from 'multer';
import path from 'path';
import crypto from 'crypto';

export default {
  storage: multer.diskStorage({
    destination: path.resolve(__dirname, '..', '..', 'uploads'),
    filename(request, file, callback) {
      const ext = path.extname(file.originalname);
      const name = path.basename(file.originalname, ext);

      const hash = crypto.randomBytes(8).toString('hex');
      const fileName = `${name}-${hash}${ext}`;

      callback(null, fileName);
    },
  }),
};
