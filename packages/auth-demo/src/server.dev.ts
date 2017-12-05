import setServer from '@moped/start-server/dev-server';

setServer(require('./server').default);

(module as any).hot &&
  (module as any).hot.accept('./server', () => {
    setServer(require('./server').default);
  });
