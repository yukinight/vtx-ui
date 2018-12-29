import dva from 'dva';
import './index.less';

// 1. Initialize
const app = dva();

// 2. Plugins
// app.use({});

// 3. Model
// app.model(require('./models/example'));
app.model(require('./models/simulationData').default);
app.model(require('./models/dataGridM').default);
app.model(require('./models/mapM').default);
app.model(require('./models/optMapM').default);
app.model(require('./models/searchMapM').default);
app.model(require('./models/datePickerM').default);
app.model(require('./models/treeSelectM').default);
app.model(require('./models/comboGridM').default);
app.model(require('./models/modalM').default);
app.model(require('./models/uploadM').default);
app.model(require('./models/modalListM').default);

// 4. Router
app.router(require('./router').default);

// 5. Start
app.start('#root');
