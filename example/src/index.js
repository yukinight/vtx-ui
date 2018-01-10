import dva from 'dva';
import './index.less';

// 1. Initialize
const app = dva();

// 2. Plugins
// app.use({});

// 3. Model
// app.model(require('./models/example'));
app.model(require('./models/simulationData'));
app.model(require('./models/dataGridM'));
app.model(require('./models/mapM'));
app.model(require('./models/optMapM'));
app.model(require('./models/searchMapM'));
app.model(require('./models/datePickerM'));
app.model(require('./models/treeSelectM'));
app.model(require('./models/comboGridM'));
app.model(require('./models/modalM'));
app.model(require('./models/uploadM'));

// 4. Router
app.router(require('./router'));

// 5. Start
app.start('#root');
