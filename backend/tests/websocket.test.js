describe('WebSocket Connection', () => {
  let ws;
  
  beforeEach((done) => {
    ws = new WebSocket(`ws://localhost:${process.env.PORT || 3000}`);
    ws.on('open', () => done());
  });

  afterEach(() => {
    ws.close();
  });

  test('Should receive progress updates', (done) => {
    ws.on('message', (data) => {
      const message = JSON.parse(data);
      expect(message).toHaveProperty('type', 'scheduler_progress');
      expect(message.data).toHaveProperty('status');
      done();
    });
  });
}); 