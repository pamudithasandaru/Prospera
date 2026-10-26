const fs = require('fs');
const path = require('path');
const multer = require('multer');

const storyDir = path.resolve(__dirname, '../../uploads/stories');
fs.mkdirSync(storyDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, storyDir),
  filename: (_req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();
    cb(null, `${Date.now()}-${Math.random().toString(36).slice(2, 10)}${extension}`);
  },
});

const fileFilter = (_req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/webm', 'video/quicktime'];
  cb(allowed.includes(file.mimetype) ? null : new Error('Unsupported story file type.'), allowed.includes(file.mimetype));
};

module.exports = {
  storyDir,
  uploadStory: multer({
    storage,
    limits: { fileSize: 50 * 1024 * 1024 },
    fileFilter,
  }),
};
