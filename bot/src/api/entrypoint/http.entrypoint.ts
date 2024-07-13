import { app } from './express';
import { config } from 'dotenv';
config({ path: '.env.local' });
import { Config } from '../../config/config';
Config.init();
// FIXME: the config init is needed before the constructor of the services using it as a dependency

const port = Config.PORT || 3000;

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
