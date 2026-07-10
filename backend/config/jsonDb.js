import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '..', 'data');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

export const getCollection = (collectionName) => {
  const filePath = path.join(DATA_DIR, `${collectionName}.json`);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify([], null, 2));
  }

  const read = () => {
    try {
      const data = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(data);
    } catch (e) {
      return [];
    }
  };

  const write = (data) => {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  };

  return {
    find: (query = {}) => {
      let items = read();
      return items.filter(item => {
        for (let key in query) {
          if (query[key] !== undefined) {
            if (item[key] !== query[key]) return false;
          }
        }
        return true;
      });
    },
    findOne: (query = {}) => {
      let items = read();
      return items.find(item => {
        for (let key in query) {
          if (query[key] !== undefined) {
            if (item[key] !== query[key]) return false;
          }
        }
        return true;
      }) || null;
    },
    findById: (id) => {
      let items = read();
      return items.find(item => item._id === id || item.id === id) || null;
    },
    create: (doc) => {
      let items = read();
      const newDoc = {
        _id: doc._id || Math.random().toString(36).substr(2, 9),
        createdAt: new Date().toISOString(),
        ...doc
      };
      items.push(newDoc);
      write(items);
      return newDoc;
    },
    findByIdAndUpdate: (id, update, options = {}) => {
      let items = read();
      const index = items.findIndex(item => item._id === id || item.id === id);
      if (index === -1) return null;
      
      const updatedItem = { ...items[index], ...update, updatedAt: new Date().toISOString() };
      items[index] = updatedItem;
      write(items);
      return updatedItem;
    },
    deleteOne: (query = {}) => {
      let items = read();
      const index = items.findIndex(item => {
        for (let key in query) {
          if (item[key] !== query[key]) return false;
        }
        return true;
      });
      if (index === -1) return { deletedCount: 0 };
      items.splice(index, 1);
      write(items);
      return { deletedCount: 1 };
    }
  };
};
