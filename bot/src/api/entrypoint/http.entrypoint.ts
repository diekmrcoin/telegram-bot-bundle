import { app } from './express';
import { config } from 'dotenv';
config({ path: '.env.local' });
import { Config } from '../../config/config';
Config.init();

const port = Config.PORT || 3000;

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
